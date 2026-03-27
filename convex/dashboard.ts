import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);

    const meetings = await ctx.db.query("meetings").collect();
    const now = Date.now();
    const upcomingMeetings = meetings.filter(
      (m) => m.date > now && m.status === "Scheduled"
    );

    const pendingMotions = await ctx.db
      .query("motions")
      .withIndex("by_status", (q) => q.eq("status", "Proposed"))
      .collect();
    const secondedMotions = await ctx.db
      .query("motions")
      .withIndex("by_status", (q) => q.eq("status", "Seconded"))
      .collect();
    const votingMotions = await ctx.db
      .query("motions")
      .withIndex("by_status", (q) => q.eq("status", "Voting"))
      .collect();

    const overdueItems = await ctx.db
      .query("actionItems")
      .withIndex("by_status", (q) => q.eq("status", "Overdue"))
      .collect();

    const activeMembers = await ctx.db
      .query("users")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    const documents = await ctx.db.query("documents").collect();

    return {
      totalMeetings: meetings.length,
      upcomingMeetings: upcomingMeetings.length,
      pendingMotions: pendingMotions.length + secondedMotions.length + votingMotions.length,
      overdueActionItems: overdueItems.length,
      activeMembers: activeMembers.length,
      documentsCount: documents.length,
    };
  },
});

export const getMemberStats = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    const now = Date.now();

    const myActionItems = await ctx.db
      .query("actionItems")
      .withIndex("by_assigneeId", (q) => q.eq("assigneeId", currentUser._id))
      .collect();
    const activeItems = myActionItems.filter(
      (i) => i.status !== "Completed"
    );

    const allMeetings = await ctx.db
      .query("meetings")
      .withIndex("by_status", (q) => q.eq("status", "Scheduled"))
      .collect();
    const myUpcoming = allMeetings.filter((m) => m.date > now);

    // Find motions in Voting status where user hasn't voted
    const votingMotions = await ctx.db
      .query("motions")
      .withIndex("by_status", (q) => q.eq("status", "Voting"))
      .collect();

    let pendingVotes = 0;
    for (const motion of votingMotions) {
      const myVote = await ctx.db
        .query("votes")
        .withIndex("by_motionId_memberId", (q) =>
          q.eq("motionId", motion._id).eq("memberId", currentUser._id)
        )
        .unique();
      if (!myVote) pendingVotes++;
    }

    const myCommittees = await ctx.db
      .query("committeeMembers")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .collect();

    return {
      myActionItems: activeItems.length,
      myUpcomingMeetings: myUpcoming.length,
      myPendingVotes: pendingVotes,
      myCommittees: myCommittees.length,
    };
  },
});

export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const limit = args.limit ?? 20;
    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(limit);

    // Enrich with user names
    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          userName: user?.name ?? "System",
        };
      })
    );

    return enriched;
  },
});
