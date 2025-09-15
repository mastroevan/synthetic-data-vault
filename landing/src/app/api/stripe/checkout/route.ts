import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Use the latest supported API version from your Stripe Dashboard
  apiVersion: process.env.STRIPE_API_VERSION as "2025-08-27.basil", // <<<-- REPLACE THIS WITH YOUR ACTUAL VERSION
});

export async function POST(req: Request) {
  // Await the auth() function to correctly get the user ID
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return new NextResponse(JSON.stringify({ error: "Price ID is required" }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Determine the success and cancel URLs based on your domain
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: user.email, // Use the user object from Prisma
      client_reference_id: user.id, // Pass our user ID to the Stripe session
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Failed to create checkout session" }), { status: 500 });
  }
}