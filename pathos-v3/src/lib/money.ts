// Matches the original app's eur() exactly so prices read identically.
export const eur = (n: number): string => "€" + Number(n).toFixed(2);
