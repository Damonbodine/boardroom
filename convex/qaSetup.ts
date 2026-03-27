import { internalMutation } from "./_generated/server";

export const assignClerkIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const margaret = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "margaret@boardroom.org"))
      .unique();
    if (margaret) {
      await ctx.db.patch(margaret._id, { clerkId: "user_3BVWDdT9lDOiybeERx2eddBQZTB" });
    }

    const james = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "james@boardroom.org"))
      .unique();
    if (james) {
      await ctx.db.patch(james._id, { clerkId: "user_3BVVpVbyDYrM7GRHlK2dTpWvzBk" });
    }

    const emily = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "emily@boardroom.org"))
      .unique();
    if (emily) {
      await ctx.db.patch(emily._id, { clerkId: "user_3BVVpgO2Fcklk1yj8p6kx2FU8Vf" });
    }

    return { margaret: !!margaret, james: !!james, emily: !!emily };
  },
});
