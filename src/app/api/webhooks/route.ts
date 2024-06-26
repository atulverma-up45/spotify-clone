import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { stripe } from "@/libs/stripe";
import {
  upsertPriceRecord,
  upsertProductRecord,
  manageSubscriptionStatusChange,
} from "@/libs/supabaseAdmin";

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get("Stripe-Signature");
  const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webHookSecret) {
      throw new Error("Missing Stripe signature or webhook secret.");
    }
    event = stripe.webhooks.constructEvent(body, sig, webHookSecret);
  } catch (error: any) {
    console.log("Error Message", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, {
      status: 400,
    });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          console.log("Handling subscription event for subscription ID:", subscription.id);
          console.log("Customer ID:", subscription.customer);

          // Check if the customer ID is undefined and log an appropriate message
          if (!subscription.customer) {
            console.error("Customer ID is undefined for subscription:", subscription.id);
            return new NextResponse("Webhook Error: Customer ID is undefined", {
              status: 400,
            });
          }

          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created"
          );
          break;
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          console.log("Handling checkout session completed event for session ID:", checkoutSession.id);
          console.log("Customer ID:", checkoutSession.customer);

          // Check if the subscription ID is undefined and log an appropriate message
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            if (!subscriptionId) {
              console.error("Subscription ID is undefined for checkout session:", checkoutSession.id);
              return new NextResponse("Webhook Error: Subscription ID is undefined", {
                status: 400,
              });
            }

            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error: any) {
      console.log("Error handling event:", error);
      return new NextResponse(`Webhook Error: ${error.message}`, {
        status: 400,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}