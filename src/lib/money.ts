// Currency helpers. The euro formatter matches the prototype's `eur()` exactly:
//   const eur = (n) => '€' + Number(n).toFixed(2);

export const eur = (n: number): string => "€" + Number(n).toFixed(2);

export const toCents = (euros: number): number => Math.round(euros * 100);
export const toEuros = (cents: number): number => cents / 100;
export const centsToEur = (cents: number): string => eur(toEuros(cents));
