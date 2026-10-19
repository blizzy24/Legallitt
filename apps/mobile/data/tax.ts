// Client confirmed 18% GST, exclusive of displayed service base fees.
// Payment amounts use whole rupees: nearest rupee, with 50 paise rounded up.
// Bases are whole rupees, so rounding GST also keeps each visible invoice balanced.
export const gst18 = (base: number) => Math.round(base * 18 / 100);
export const moneyTotal = (...amounts: number[]) => Math.round(amounts.reduce((a, b) => a + b, 0));
export const withGst18 = (base: number) => moneyTotal(base, gst18(base));
