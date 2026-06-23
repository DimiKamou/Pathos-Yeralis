import Stripe from "stripe";

// Server-side Stripe client (test mode for the alpha). Lazily constructed so
// the app builds without keys; call sites use `getStripe()` and handle the
// not-configured case (e.g. fall back to bank transfer only).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const isStripeConfigured = (): boolean => !!process.env.STRIPE_SECRET_KEY;
