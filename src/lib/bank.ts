// Bank-transfer (deposit) details shown at checkout for the manual offline
// method. Placeholder values live in pathos-store.js; here they come from env
// so the real Piraeus Bank account can be dropped in before launch.

export interface BankDetails {
  beneficiary: string;
  bank: string;
  iban: string;
  bic: string;
  note: string;
}

export const BANK: BankDetails = {
  beneficiary: process.env.BANK_BENEFICIARY || "PATHOS by Yeralis — Y. Yeralis",
  bank: process.env.BANK_NAME || "Piraeus Bank",
  iban: process.env.BANK_IBAN || "GR16 0110 1250 0000 0001 2345 678",
  bic: process.env.BANK_BIC || "PIRBGRAA",
  note:
    process.env.BANK_NOTE ||
    "Use your order number as the payment reference. We ship as soon as the deposit clears (usually 1–2 business days).",
};
