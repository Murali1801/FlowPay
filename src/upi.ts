/**
 * Standard UPI deep link (replace pa/pn via .env).
 * Optional `tn` = note, `tr` = reference (helps match payments to this order).
 */
export function buildUpiLink(
  amount: string,
  pa: string,
  pn: string,
  options?: { note?: string; ref?: string }
): string {
  const params = new URLSearchParams({
    pa,
    pn,
    am: amount.replace(/,/g, ""),
    cu: "INR",
  });
  if (options?.note) params.set("tn", options.note);
  if (options?.ref) params.set("tr", options.ref);
  return `upi://pay?${params.toString()}`;
}

/** Same payee/amount as a plain UPI ID for manual “Pay to contact” flows. */
function decodePayeeName(pn: string): string {
  try {
    return decodeURIComponent(pn.replace(/\+/g, " "));
  } catch {
    return pn;
  }
}

export function buildPaymentSummaryText(params: {
  amount: string;
  upiId: string;
  payeeName: string;
  orderId: string;
}): string {
  return [
    `FlowPay — pay ₹${params.amount}`,
    `UPI ID: ${params.upiId}`,
    `Payee: ${decodePayeeName(params.payeeName)}`,
    `Order: ${params.orderId}`,
    "",
    "Pay in any UPI app (Google Pay, PhonePe, Paytm, BHIM, bank apps).",
  ].join("\n");
}
