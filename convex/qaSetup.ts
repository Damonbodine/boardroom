import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createDemoUser = internalMutation({
  args: {},
  handler: async (ctx) => {
    const clerkId = "user_3BV4YzajQ96nGS3hlBDld9VcLa8";
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existing) return { status: "already_exists", userId: existing._id };

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId,
      name: "Demo User",
      email: "demo@factory512.dev",
      role: "Admin",
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return { status: "created", userId };
  },
});

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
