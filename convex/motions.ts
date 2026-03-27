import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const listByMeeting = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    return await ctx.db
      .query("motions")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .collect();
  },
});

export const get = query({
  args: { motionId: v.id("motions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("MOTION_NOT_FOUND");

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_motionId", (q) => q.eq("motionId", args.motionId))
      .collect();

    return {
      ...motion,
      totalVotes: votes.length,
      votes,
    };
  },
});

export const create = mutation({
  args: {
    meetingId: v.id("meetings"),
    agendaItemId: v.optional(v.id("agendaItems")),
    title: v.string(),
    description: v.string(),
    movedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["BoardMember", "Admin"]);

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    const now = Date.now();
    const motionId = await ctx.db.insert("motions", {
      meetingId: args.meetingId,
      agendaItemId: args.agendaItemId,
      title: args.title,
      description: args.description,
      movedById: args.movedById,
      status: "Proposed",
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Create", "motions", motionId, `Proposed motion: ${args.title}`);

    return motionId;
  },
});

export const second = mutation({
  args: {
    motionId: v.id("motions"),
    secondedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["BoardMember", "Admin"]);

    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("MOTION_NOT_FOUND");

    if (motion.status !== "Proposed") {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    if (motion.movedById === args.secondedById) {
      throw new Error("CANNOT_SECOND_OWN_MOTION");
    }

    await ctx.db.patch(args.motionId, {
      secondedById: args.secondedById,
      status: "Seconded",
      updatedAt: Date.now(),
    });

    await createAuditLog(ctx, currentUser._id, "StatusChange", "motions", args.motionId, "Motion seconded");
  },
});

export const openVoting = mutation({
  args: { motionId: v.id("motions") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("MOTION_NOT_FOUND");

    if (motion.status !== "Seconded") {
      throw new Error("MOTION_NOT_SECONDED");
    }

    await ctx.db.patch(args.motionId, {
      status: "Voting",
      updatedAt: Date.now(),
    });

    await createAuditLog(ctx, currentUser._id, "StatusChange", "motions", args.motionId, "Voting opened");
  },
});

export const updateStatus = mutation({
  args: {
    motionId: v.id("motions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("MOTION_NOT_FOUND");

    const allowed = ["Tabled", "Withdrawn", "Passed", "Failed"];
    if (!allowed.includes(args.status)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    await ctx.db.patch(args.motionId, {
      status: args.status as any,
      result: args.status,
      updatedAt: Date.now(),
    });

    await createAuditLog(ctx, currentUser._id, "StatusChange", "motions", args.motionId, `Motion status: ${motion.status} -> ${args.status}`);
  },
});

export const listPending = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    if (args.status) {
      return await ctx.db
        .query("motions")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    }

    const proposed = await ctx.db
      .query("motions")
      .withIndex("by_status", (q) => q.eq("status", "Proposed"))
      .collect();
    const seconded = await ctx.db
      .query("motions")
      .withIndex("by_status", (q) => q.eq("status", "Seconded"))
      .collect();
    const voting = await ctx.db
      .query("motions")
      .withIndex("by_status", (q) => q.eq("status", "Voting"))
      .collect();

    return [...proposed, ...seconded, ...voting];
  },
});
