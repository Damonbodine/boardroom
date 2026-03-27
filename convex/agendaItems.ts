import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const listByMeeting = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("agendaItems")
      .withIndex("by_meetingId_sortOrder", (q) => q.eq("meetingId", args.meetingId))
      .collect();
  },
});

export const create = mutation({
  args: {
    meetingId: v.id("meetings"),
    title: v.string(),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    presenter: v.optional(v.id("users")),
    sortOrder: v.optional(v.number()),
    type: v.optional(v.union(v.literal("Information"), v.literal("Discussion"), v.literal("Action"), v.literal("Vote"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    const now = Date.now();
    const itemId = await ctx.db.insert("agendaItems", {
      meetingId: args.meetingId,
      title: args.title,
      description: args.description,
      presenter: args.presenter,
      sortOrder: args.sortOrder ?? 1,
      duration: args.duration ?? 0,
      type: args.type ?? "Discussion",
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Create", "agendaItems", itemId, `Added agenda item: ${args.title}`);

    return itemId;
  },
});

export const update = mutation({
  args: {
    agendaItemId: v.id("agendaItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    presenter: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const existing = await ctx.db.get(args.agendaItemId);
    if (!existing) throw new Error("NOT_FOUND");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.duration !== undefined) updates.duration = args.duration;
    if (args.presenter !== undefined) updates.presenter = args.presenter;

    await ctx.db.patch(args.agendaItemId, updates);
    await createAuditLog(ctx, currentUser._id, "Update", "agendaItems", args.agendaItemId, "Updated agenda item");
  },
});

export const remove = mutation({
  args: { agendaItemId: v.id("agendaItems") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const existing = await ctx.db.get(args.agendaItemId);
    if (!existing) throw new Error("NOT_FOUND");

    await ctx.db.delete(args.agendaItemId);
    await createAuditLog(ctx, currentUser._id, "Delete", "agendaItems", args.agendaItemId, `Deleted agenda item: ${existing.title}`);
  },
});

export const reorder = mutation({
  args: {
    meetingId: v.id("meetings"),
    itemIds: v.array(v.id("agendaItems")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    for (let i = 0; i < args.itemIds.length; i++) {
      await ctx.db.patch(args.itemIds[i], {
        sortOrder: i + 1,
        updatedAt: Date.now(),
      });
    }

    await createAuditLog(ctx, currentUser._id, "Update", "agendaItems", args.meetingId, "Reordered agenda items");
  },
});
