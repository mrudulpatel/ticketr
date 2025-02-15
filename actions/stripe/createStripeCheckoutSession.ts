"use server";

import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";
import { auth } from "@clerk/nextjs/server";
import { DURATIONS } from "@/convex/constants";

export type StripeCheckoutMetaData = {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
};

export const createStripeCheckoutSession = async ({
  eventId,
}: {
  eventId: Id<"events">;
}) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const convex = getConvexClient();

  const event = await convex.query(api.events.getById, { eventId });

  if (!event) {
    throw new Error("Event not found");
  }

  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    {
      userId: event.userId,
    }
  );

  if (!stripeConnectId) {
    throw new Error("User has not connected a Stripe account");
  }

  if (!queuePosition.offerExpiresAt) {
    throw new Error("Ticket has no expiration date");
  }

  const metadata: StripeCheckoutMetaData = {
    eventId,
    userId,
    waitingListId: queuePosition._id,
  };

  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.name,
              description: event.description,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(event.price * 100 * 0.01),
      },
      expires_at: Math.floor(Date.now() / 1000) + DURATIONS.TICKET_OFFER / 1000,
      mode: "payment",
      success_url: `${baseUrl}/tickets/purchase-session?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/events/${eventId}`,
      metadata,
    },
    {
      stripeAccount: stripeConnectId,
    }
  );

  return { session: session.id, sessionUrl: session.url };
};
