// Client confirmed 18% GST, exclusive of displayed service base fees.
// Keep paise: truncating ₹179.82 to ₹179 is not an 18% charge.
export const gst18 = (base: number) => Math.round(base * 18) / 100;
export const moneyTotal = (...amounts: number[]) => Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100;
export const withGst18 = (base: number) => moneyTotal(base, gst18(base));
