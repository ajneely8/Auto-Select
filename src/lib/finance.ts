/** Payment math for the estimate calculator and card "est. payment" links. Illustration only — not an offer of credit. */

export function monthlyPayment(principal: number, aprPercent: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function estimate({ price, down = 0, trade = 0, apr, months }: { price: number; down?: number; trade?: number; apr: number; months: number }) {
  const financed = Math.max(0, price - down - trade);
  const payment = monthlyPayment(financed, apr, months);
  const totalPaid = payment * months;
  return { financed, payment, totalInterest: Math.max(0, totalPaid - financed), totalPaid };
}

export const TERM_OPTIONS = [36, 48, 60, 72] as const;
