import { FLOWPAY_LOGO_URL } from "../../logo";

type Props = { className?: string };

/** Splash / hero — larger mark. */
export function FlowPayMarkLarge({ className }: Props) {
  return (
    <img
      src={FLOWPAY_LOGO_URL}
      alt="FlowPay"
      width={96}
      height={96}
      className={className}
      decoding="async"
      loading="eager"
      style={{ objectFit: "contain" }}
    />
  );
}

/** Footer / “Powered by” row — compact mark. */
export function FlowPayMarkSmall({ className }: Props) {
  return (
    <img
      src={FLOWPAY_LOGO_URL}
      alt="FlowPay"
      width={26}
      height={26}
      className={className}
      decoding="async"
      loading="lazy"
      style={{ objectFit: "contain" }}
    />
  );
}
