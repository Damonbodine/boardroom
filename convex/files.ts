import { mutation } from "./_generated/server";
import { getCurrentUser, requireRole } from "./helpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    requireRole(currentUser.role, ["Admin", "Staff"]);
    return await ctx.storage.generateUploadUrl();
  },
});
