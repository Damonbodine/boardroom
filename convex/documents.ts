import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireRole, createAuditLog } from "./helpers";

export const list = query({
  args: {
    meetingId: v.optional(v.id("meetings")),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    let docs;
    if (args.meetingId) {
      docs = await ctx.db
        .query("documents")
        .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
        .collect();
    } else if (args.category) {
      docs = await ctx.db
        .query("documents")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    } else {
      docs = await ctx.db.query("documents").order("desc").collect();
    }

    // Filter confidential documents for non-admin/staff
    if (user && user.role === "BoardMember") {
      docs = docs.filter((d) => !d.isConfidential);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      docs = docs.filter((d) =>
        d.title.toLowerCase().includes(searchLower) ||
        (d.description ?? "").toLowerCase().includes(searchLower)
      );
    }

    const enriched = await Promise.all(
      docs.map(async (doc) => {
        const uploadedBy = await ctx.db.get(doc.uploadedById);
        return { ...doc, uploadedBy: uploadedBy ? { name: uploadedBy.name } : null };
      })
    );

    return enriched;
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("NOT_FOUND");

    if (doc.isConfidential) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      if (!user || (user.role !== "Admin" && user.role !== "Staff")) {
        throw new Error("CONFIDENTIAL_ACCESS_DENIED");
      }
    }

    return doc;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    storageId: v.string(),
    meetingId: v.optional(v.id("meetings")),
    category: v.union(v.literal("Policy"), v.literal("Minutes"), v.literal("Financial"), v.literal("Legal"), v.literal("Strategic"), v.literal("General")),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const now = Date.now();
    const docId = await ctx.db.insert("documents", {
      title: args.title,
      fileUrl: args.storageId,
      meetingId: args.meetingId,
      category: args.category,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedById: currentUser._id,
      version: 1,
      isConfidential: false,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(ctx, currentUser._id, "Upload", "documents", docId, `Uploaded document: ${args.title}`);

    return docId;
  },
});

export const update = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    meetingId: v.optional(v.id("meetings")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);

    const existing = await ctx.db.get(args.documentId);
    if (!existing) throw new Error("NOT_FOUND");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.category !== undefined) updates.category = args.category;
    if (args.meetingId !== undefined) updates.meetingId = args.meetingId;

    await ctx.db.patch(args.documentId, updates);
    await createAuditLog(ctx, currentUser._id, "Update", "documents", args.documentId, "Updated document metadata");
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin"]);

    const existing = await ctx.db.get(args.documentId);
    if (!existing) throw new Error("NOT_FOUND");

    await ctx.db.delete(args.documentId);
    await createAuditLog(ctx, currentUser._id, "Delete", "documents", args.documentId, `Deleted document: ${existing.title}`);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);
    return await ctx.storage.generateUploadUrl();
  },
});
