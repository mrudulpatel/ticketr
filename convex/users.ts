import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUsersStripeConnectId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.neq(q.field("stripeConnectId"), undefined))
      .first();

    return user?.stripeConnectId;
  },
});

export const updateOrCreateUserStripeConnectId = mutation({
  args: {
    userId: v.string(),
    stripeConnectId: v.string(),
  },
  async handler(ctx, args_0) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args_0.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { stripeConnectId: args_0.stripeConnectId });
  },
});

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return user;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, name, email }) => {
    // Check if the user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name,
        email,
      });
      return existingUser._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      name,
      email,
      userId,
      stripeConnectId: undefined,
    });
  },
});
