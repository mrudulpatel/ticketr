"use server";
import { stripe } from "@/lib/stripe";

export async function createStripeConnectLoginLink(stripeAccountId: string) {
    if(!stripeAccountId) {
        throw new Error("stripeAccountId is required");
    }

    try {
        const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
        return loginLink.url;
    } catch (error) {
        console.error("Error creating Stripe Connect login link", error);
        throw new Error("Error creating Stripe Connect login link");
    }
}