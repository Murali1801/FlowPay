import { COPY } from "./copy";
import { FlowPayMarkLarge, FlowPayMarkSmall } from "./FlowPayMark";
import s from "./FlowPaySplash.module.css";

export default function FlowPaySplash() {
  return (
    <div className={s.root}>
      <p className={s.line}>{COPY.securing}</p>
      <FlowPayMarkLarge className={s.hero} />
      <div className={s.footer}>
        <span className={s.powered}>{COPY.poweredBy}</span>
        <FlowPayMarkSmall />
        <span className={`${s.name} flowpay-wordmark`}>{COPY.partnerName}</span>
      </div>
    </div>
  );
}
