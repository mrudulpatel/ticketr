import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const generateImageUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const deleteImage = mutation({
  args: { storageId: v.id("_storage") },
  async handler(ctx, args_0) {
    await ctx.storage.delete(args_0.storageId);
  },
});

export const uploadEventImage = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.union(v.id("_storage"), v.null()),
  },
  async handler(ctx, args_0) {
    await ctx.db.patch(args_0.eventId, {
      imageStorageId: args_0.storageId ?? undefined,
    });
  },
});
