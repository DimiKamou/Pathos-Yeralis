"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Singleton browser Stripe instance. Null when no publishable key is set
// (the storefront then offers bank transfer only).
let promise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!promise) promise = loadStripe(key);
  return promise;
}

// Stripe Elements appearance tuned to the PATHOS palette.
export const elementsAppearance = {
  theme: "flat" as const,
  variables: {
    colorPrimary: "#b1894e",
    colorText: "#2a241e",
    colorBackground: "#fffdf8",
    colorDanger: "#b3261e",
    fontFamily: "Jost, system-ui, sans-serif",
    borderRadius: "8px",
    spacingUnit: "3px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(42,36,30,0.15)", padding: "10px 12px" },
    ".Input:focus": { border: "1px solid #b1894e", boxShadow: "none" },
    ".Label": { fontSize: "12px", color: "#9c8e7c" },
  },
};
