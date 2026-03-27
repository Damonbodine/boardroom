import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    return user;
  },
});

export const getOrCreateByClerk = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastLoginAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatar,
      role: "BoardMember",
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, userId, "Create", "users", userId, "User created via Clerk login");

    return userId;
  },
});

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
  },
});

export const list = query({
  args: {
    role: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    let users;
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role as any))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    if (args.status !== undefined) {
      const isActive = args.status === "active";
      users = users.filter((u) => u.isActive === isActive);
    }

    return users;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: "",
      name: args.name,
      email: args.email,
      avatarUrl: args.avatar,
      role: args.role as any,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Create", "users", userId, `Created user ${args.name}`);

    return userId;
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    avatar: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const { userId, ...fields } = args;

    // Non-admin can only update own profile
    if (currentUser.role !== "Admin" && currentUser._id !== userId) {
      throw new Error("OWN_PROFILE_ONLY");
    }
    // Non-admin cannot change role
    if (currentUser.role !== "Admin" && fields.role !== undefined) {
      throw new Error("FORBIDDEN");
    }

    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("USER_NOT_FOUND");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.email !== undefined) updates.email = fields.email;
    if (fields.role !== undefined) updates.role = fields.role;
    if (fields.avatar !== undefined) updates.avatarUrl = fields.avatar;
    if (fields.status !== undefined) updates.isActive = fields.status === "active";

    await ctx.db.patch(userId, updates);
    await createAuditLog(ctx, currentUser._id, "Update", "users", userId, "Updated user profile");
  },
});

export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const existing = await ctx.db.get(args.userId);
    if (!existing) throw new Error("USER_NOT_FOUND");

    await ctx.db.delete(args.userId);
    await createAuditLog(ctx, currentUser._id, "Delete", "users", args.userId, `Deleted user ${existing.name}`);
  },
});
