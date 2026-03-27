import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    if (args.status !== undefined) {
      const isActive = args.status === "active";
      return await ctx.db
        .query("committees")
        .withIndex("by_isActive", (q) => q.eq("isActive", isActive))
        .collect();
    }

    return await ctx.db.query("committees").collect();
  },
});

export const get = query({
  args: { committeeId: v.id("committees") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const committee = await ctx.db.get(args.committeeId);
    if (!committee) throw new Error("NOT_FOUND");

    const members = await ctx.db
      .query("committeeMembers")
      .withIndex("by_committeeId", (q) => q.eq("committeeId", args.committeeId))
      .collect();

    const enrichedMembers = await Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return { ...m, userName: user?.name ?? "Unknown", userEmail: user?.email ?? "" };
      })
    );

    return { ...committee, members: enrichedMembers };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    chairId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const now = Date.now();
    const committeeId = await ctx.db.insert("committees", {
      name: args.name,
      description: args.description,
      chairId: args.chairId ?? currentUser._id,
      purpose: args.description ?? "",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Create", "committees", committeeId, `Created committee: ${args.name}`);

    return committeeId;
  },
});

export const update = mutation({
  args: {
    committeeId: v.id("committees"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    chairId: v.optional(v.id("users")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const existing = await ctx.db.get(args.committeeId);
    if (!existing) throw new Error("NOT_FOUND");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) {
      updates.description = args.description;
      updates.purpose = args.description;
    }
    if (args.chairId !== undefined) updates.chairId = args.chairId;
    if (args.status !== undefined) updates.isActive = args.status === "active";

    await ctx.db.patch(args.committeeId, updates);
    await createAuditLog(ctx, currentUser._id, "Update", "committees", args.committeeId, "Updated committee");
  },
});

export const remove = mutation({
  args: { committeeId: v.id("committees") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const existing = await ctx.db.get(args.committeeId);
    if (!existing) throw new Error("NOT_FOUND");

    // Remove all members
    const members = await ctx.db
      .query("committeeMembers")
      .withIndex("by_committeeId", (q) => q.eq("committeeId", args.committeeId))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.committeeId);
    await createAuditLog(ctx, currentUser._id, "Delete", "committees", args.committeeId, `Deleted committee: ${existing.name}`);
  },
});
