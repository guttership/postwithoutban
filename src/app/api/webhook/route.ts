import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendAccessEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-05-28.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Générer un token d'accès sécurisé
function generateAccessToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Gérer les différents types d'événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Récupérer les informations du client
        const customerEmail = session.customer_details?.email;
        const customerId = session.customer as string | null;
        const sessionId = session.id;

        console.log("✅ Paiement réussi!");
        console.log("   Email:", customerEmail);
        console.log("   Session ID:", sessionId);

        if (customerEmail) {
          // Vérifier si ce paiement a déjà été traité (idempotence)
          const existingPurchase = await prisma.purchase.findFirst({
            where: { stripeSessionId: sessionId },
          });

          if (existingPurchase) {
            console.log("   ⚠️ Paiement déjà traité, skip");
            break;
          }

          // Générer un token d'accès unique
          const accessToken = generateAccessToken();

          // Créer ou mettre à jour l'achat en BDD
          await prisma.purchase.upsert({
            where: { email: customerEmail },
            update: {
              accessToken: accessToken,
              stripeSessionId: sessionId,
              stripeCustomerId: customerId,
              isActive: true,
            },
            create: {
              email: customerEmail,
              accessToken: accessToken,
              stripeSessionId: sessionId,
              stripeCustomerId: customerId,
            },
          });

          console.log("   Access Token généré:", accessToken);
          
          // Envoyer email avec le lien d'accès
          if (process.env.RESEND_API_KEY) {
            await sendAccessEmail({
              to: customerEmail,
              accessToken: accessToken,
            });
          }
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("💰 PaymentIntent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("❌ Payment failed:", paymentIntent.id);
        console.log("   Reason:", paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
