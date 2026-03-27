import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    let items;
    if (args.status) {
      items = await ctx.db
        .query("actionItems")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      items = await ctx.db.query("actionItems").order("desc").collect();
    }

    return items;
  },
});

export const listByMeeting = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    return await ctx.db
      .query("actionItems")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .collect();
  },
});

export const listByAssignee = query({
  args: {
    assigneeId: v.id("users"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    let items = await ctx.db
      .query("actionItems")
      .withIndex("by_assigneeId", (q) => q.eq("assigneeId", args.assigneeId))
      .collect();

    if (args.status) {
      items = items.filter((i) => i.status === args.status);
    }

    return items;
  },
});

export const listOverdue = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHORIZED");

    const now = Date.now();
    const items = await ctx.db
      .query("actionItems")
      .withIndex("by_status", (q) => q.eq("status", "Overdue"))
      .collect();

    // Also find items that are Open/InProgress but past due
    const openItems = await ctx.db
      .query("actionItems")
      .withIndex("by_status", (q) => q.eq("status", "Open"))
      .collect();
    const inProgressItems = await ctx.db
      .query("actionItems")
      .withIndex("by_status", (q) => q.eq("status", "InProgress"))
      .collect();

    const pastDue = [...openItems, ...inProgressItems].filter(
      (i) => i.dueDate < now
    );

    return [...items, ...pastDue];
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.id("users"),
    meetingId: v.optional(v.id("meetings")),
    dueDate: v.number(),
    agendaItemId: v.optional(v.id("agendaItems")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const now = Date.now();
    const itemId = await ctx.db.insert("actionItems", {
      meetingId: args.meetingId!,
      title: args.title,
      description: args.description,
      assigneeId: args.assigneeId,
      dueDate: args.dueDate,
      status: "Open",
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Create", "actionItems", itemId, `Created action item: ${args.title}`);

    return itemId;
  },
});

export const update = mutation({
  args: {
    actionItemId: v.id("actionItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    const existing = await ctx.db.get(args.actionItemId);
    if (!existing) throw new Error("NOT_FOUND");

    // BoardMember can only update their own action items
    if (
      currentUser.role === "BoardMember" &&
      existing.assigneeId !== currentUser._id
    ) {
      throw new Error("OWN_ACTION_ITEMS_ONLY");
    }

    const { actionItemId, ...fields } = args;
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.assigneeId !== undefined) updates.assigneeId = fields.assigneeId;
    if (fields.dueDate !== undefined) updates.dueDate = fields.dueDate;
    if (fields.status !== undefined) {
      updates.status = fields.status;
      if (fields.status === "Completed") {
        updates.completedAt = Date.now();
      }
    }

    await ctx.db.patch(actionItemId, updates);
    await createAuditLog(ctx, currentUser._id, "Update", "actionItems", actionItemId, "Updated action item");
  },
});

export const remove = mutation({
  args: { actionItemId: v.id("actionItems") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const existing = await ctx.db.get(args.actionItemId);
    if (!existing) throw new Error("NOT_FOUND");

    await ctx.db.delete(args.actionItemId);
    await createAuditLog(ctx, currentUser._id, "Delete", "actionItems", args.actionItemId, `Deleted action item: ${existing.title}`);
  },
});

export const flagOverdue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const openItems = await ctx.db
      .query("actionItems")
      .withIndex("by_status", (q) => q.eq("status", "Open"))
      .collect();
    const inProgressItems = await ctx.db
      .query("actionItems")
      .withIndex("by_status", (q) => q.eq("status", "InProgress"))
      .collect();

    const allItems = [...openItems, ...inProgressItems];
    let flaggedCount = 0;

    for (const item of allItems) {
      if (item.dueDate < now) {
        await ctx.db.patch(item._id, {
          status: "Overdue",
          updatedAt: now,
        });
        flaggedCount++;
      }
    }

    return flaggedCount;
  },
});
