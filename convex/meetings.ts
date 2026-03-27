import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

const VALID_TRANSITIONS: Record<string, string[]> = {
  Scheduled: ["InProgress", "Cancelled"],
  InProgress: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export const list = query({
  args: {
    status: v.optional(v.string()),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
    committeeId: v.optional(v.id("committees")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let meetings;
    if (args.status) {
      meetings = await ctx.db
        .query("meetings")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      meetings = await ctx.db.query("meetings").order("desc").collect();
    }

    if (args.fromDate !== undefined) {
      meetings = meetings.filter((m) => m.date >= args.fromDate!);
    }
    if (args.toDate !== undefined) {
      meetings = meetings.filter((m) => m.date <= args.toDate!);
    }

    return meetings;
  },
});

export const get = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    const agendaItems = await ctx.db
      .query("agendaItems")
      .withIndex("by_meetingId_sortOrder", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    return { ...meeting, agendaItems };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    committeeId: v.optional(v.id("committees")),
    type: v.union(v.literal("Regular"), v.literal("Special"), v.literal("Emergency"), v.literal("AnnualGeneral")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const now = Date.now();
    const meetingId = await ctx.db.insert("meetings", {
      title: args.title,
      description: args.description,
      date: args.scheduledAt,
      startTime: args.startTime ?? new Date(args.scheduledAt).toISOString().slice(11, 16),
      endTime: args.endTime ?? "",
      location: args.location ?? "TBD",
      meetingType: args.type,
      status: "Scheduled",
      minutesApproved: false,
      createdById: currentUser._id,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Create", "meetings", meetingId, `Created meeting: ${args.title}`);

    return meetingId;
  },
});

export const update = mutation({
  args: {
    meetingId: v.id("meetings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(v.union(v.literal("Regular"), v.literal("Special"), v.literal("Emergency"), v.literal("AnnualGeneral"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const existing = await ctx.db.get(args.meetingId);
    if (!existing) throw new Error("MEETING_NOT_FOUND");

    const updates: Partial<{
      title: string;
      description: string;
      date: number;
      startTime: string;
      endTime: string;
      location: string;
      meetingType: "Regular" | "Special" | "Emergency" | "AnnualGeneral";
      updatedAt: number;
    }> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.scheduledAt !== undefined) {
      updates.date = args.scheduledAt;
    }
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.endTime !== undefined) updates.endTime = args.endTime;
    if (args.location !== undefined) updates.location = args.location;
    if (args.type !== undefined) updates.meetingType = args.type;

    await ctx.db.patch(args.meetingId, updates);
    await createAuditLog(ctx, currentUser._id, "Update", "meetings", args.meetingId, "Updated meeting");
  },
});

export const remove = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const existing = await ctx.db.get(args.meetingId);
    if (!existing) throw new Error("MEETING_NOT_FOUND");

    // Delete associated agenda items
    const agendaItems = await ctx.db
      .query("agendaItems")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .collect();
    for (const item of agendaItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.meetingId);
    await createAuditLog(ctx, currentUser._id, "Delete", "meetings", args.meetingId, `Deleted meeting: ${existing.title}`);
  },
});

export const updateStatus = mutation({
  args: {
    meetingId: v.id("meetings"),
    status: v.union(v.literal("Scheduled"), v.literal("InProgress"), v.literal("Completed"), v.literal("Cancelled")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    const allowed = VALID_TRANSITIONS[meeting.status];
    if (!allowed || !allowed.includes(args.status)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    await ctx.db.patch(args.meetingId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    await createAuditLog(ctx, currentUser._id, "StatusChange", "meetings", args.meetingId, `Status: ${meeting.status} -> ${args.status}`);
  },
});

export const approveMinutes = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    if (meeting.minutesApproved) {
      throw new Error("MINUTES_ALREADY_APPROVED");
    }

    await ctx.db.patch(args.meetingId, {
      minutesApproved: true,
      minutesApprovedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await createAuditLog(ctx, currentUser._id, "Update", "meetings", args.meetingId, "Approved meeting minutes");
  },
});

export const updateMinutes = mutation({
  args: {
    meetingId: v.id("meetings"),
    minutes: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    if (meeting.minutesApproved) {
      throw new Error("MINUTES_ALREADY_APPROVED");
    }

    await ctx.db.patch(args.meetingId, {
      minutesContent: args.minutes,
      updatedAt: Date.now(),
    });

    await createAuditLog(ctx, currentUser._id, "Update", "meetings", args.meetingId, "Updated meeting minutes");
  },
});
