import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("UNAUTHORIZED");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}

export function requireRole(
  userRole: string,
  allowedRoles: string[]
) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("FORBIDDEN");
  }
}

export async function createAuditLog(
  ctx: MutationCtx,
  userId: Id<"users">,
  action: "Create" | "Update" | "Delete" | "StatusChange" | "Vote" | "Upload" | "Login",
  entityType: string,
  entityId: string,
  details?: string
) {
  await ctx.db.insert("auditLogs", {
    userId,
    action,
    entityType,
    entityId,
    details,
    createdAt: Date.now(),
  });
}
