import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const listByCommittee = query({
  args: { committeeId: v.id("committees") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const members = await ctx.db
      .query("committeeMembers")
      .withIndex("by_committeeId", (q) => q.eq("committeeId", args.committeeId))
      .collect();

    return await Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return { ...m, userName: user?.name ?? "Unknown", userEmail: user?.email ?? "" };
      })
    );
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const memberships = await ctx.db
      .query("committeeMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      memberships.map(async (m) => {
        const committee = await ctx.db.get(m.committeeId);
        return { ...m, committeeName: committee?.name ?? "Unknown" };
      })
    );
  },
});

export const add = mutation({
  args: {
    committeeId: v.id("committees"),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    // Check for duplicate
    const existing = await ctx.db
      .query("committeeMembers")
      .withIndex("by_committeeId_userId", (q) =>
        q.eq("committeeId", args.committeeId).eq("userId", args.userId)
      )
      .unique();

    if (existing) {
      throw new Error("DUPLICATE_COMMITTEE_MEMBER");
    }

    const now = Date.now();
    const memberId = await ctx.db.insert("committeeMembers", {
      committeeId: args.committeeId,
      userId: args.userId,
      role: args.role as any,
      joinedAt: now,
      createdAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Create", "committeeMembers", memberId, "Added member to committee");

    return memberId;
  },
});

export const remove = mutation({
  args: { committeeMemberId: v.id("committeeMembers") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const existing = await ctx.db.get(args.committeeMemberId);
    if (!existing) throw new Error("NOT_FOUND");

    await ctx.db.delete(args.committeeMemberId);
    await createAuditLog(ctx, currentUser._id, "Delete", "committeeMembers", args.committeeMemberId, "Removed member from committee");
  },
});
