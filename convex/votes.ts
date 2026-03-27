import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const listByMotion = query({
  args: { motionId: v.id("motions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_motionId", (q) => q.eq("motionId", args.motionId))
      .collect();

    // Enrich with voter details
    const enriched = await Promise.all(
      votes.map(async (vote) => {
        const member = await ctx.db.get(vote.memberId);
        return {
          ...vote,
          memberName: member?.name ?? "Unknown",
          memberEmail: member?.email ?? "",
        };
      })
    );

    return enriched;
  },
});

export const cast = mutation({
  args: {
    motionId: v.id("motions"),
    userId: v.id("users"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["BoardMember", "Admin"]);

    const motion = await ctx.db.get(args.motionId);
    if (!motion) throw new Error("MOTION_NOT_FOUND");

    if (motion.status !== "Voting") {
      throw new Error("MOTION_NOT_IN_VOTING");
    }

    // Check for duplicate vote
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_motionId_memberId", (q) =>
        q.eq("motionId", args.motionId).eq("memberId", args.userId)
      )
      .unique();

    if (existingVote) {
      throw new Error("ALREADY_VOTED");
    }

    const now = Date.now();
    const voteId = await ctx.db.insert("votes", {
      motionId: args.motionId,
      memberId: args.userId,
      vote: args.value as any,
      castAt: now,
      createdAt: now,
    });

    // C11: Recalculate tallies from ALL vote records
    const allVotes = await ctx.db
      .query("votes")
      .withIndex("by_motionId", (q) => q.eq("motionId", args.motionId))
      .collect();

    const votesFor = allVotes.filter((v) => v.vote === "For").length;
    const votesAgainst = allVotes.filter((v) => v.vote === "Against").length;
    const votesAbstain = allVotes.filter((v) => v.vote === "Abstain").length;

    await ctx.db.patch(args.motionId, {
      votesFor,
      votesAgainst,
      votesAbstain,
      updatedAt: Date.now(),
    });

    await createAuditLog(ctx, currentUser._id, "Vote", "motions", args.motionId, `Cast vote: ${args.value}`);

    return voteId;
  },
});

export const getMyVote = query({
  args: { motionId: v.id("motions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const vote = await ctx.db
      .query("votes")
      .withIndex("by_motionId_memberId", (q) =>
        q.eq("motionId", args.motionId).eq("memberId", user._id)
      )
      .unique();

    return vote ?? null;
  },
});
