import { query } from "./_generated/server";

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const meetings = await ctx.db.query("meetings").collect();
    const agendaItems = await ctx.db.query("agendaItems").collect();
    const motions = await ctx.db.query("motions").collect();
    const votes = await ctx.db.query("votes").collect();
    const documents = await ctx.db.query("documents").collect();
    const committees = await ctx.db.query("committees").collect();
    const committeeMembers = await ctx.db.query("committeeMembers").collect();
    const actionItems = await ctx.db.query("actionItems").collect();
    const notifications = await ctx.db.query("notifications").collect();
    const auditLogs = await ctx.db.query("auditLogs").collect();
    return {
      users: users.length,
      meetings: meetings.length,
      agendaItems: agendaItems.length,
      motions: motions.length,
      votes: votes.length,
      documents: documents.length,
      committees: committees.length,
      committeeMembers: committeeMembers.length,
      actionItems: actionItems.length,
      notifications: notifications.length,
      auditLogs: auditLogs.length,
      userList: users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, clerkId: u.clerkId })),
    };
  },
});
