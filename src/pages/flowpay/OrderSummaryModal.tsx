import { COPY } from "./copy";
import s from "./FlowPayCheckoutPage.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  mrp: string;
  discount: string;
  subtotal: string;
};

export default function OrderSummaryModal({ open, onClose, mrp, discount, subtotal }: Props) {
  if (!open) return null;
  return (
    <div className={s.modalRoot} role="dialog" aria-modal="true" aria-labelledby="fp-modal-title">
      <button type="button" className={s.modalBackdrop} onClick={onClose} aria-label="Close" />
      <div className={s.modalSheet}>
        <button type="button" className={s.modalClose} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={s.modalHead}>
          <span className={s.cartIco} aria-hidden>
            🛒
          </span>
          <h2 id="fp-modal-title" className={s.modalTitle}>
            {COPY.modalOrderSummary}
          </h2>
        </div>
        <div className={s.modalProduct}>
          <div className={s.thumb} />
          <div className={s.modalProdMeta}>
            <div className={s.modalProdName}>{COPY.productName}</div>
            <div className={s.modalQty}>{COPY.qty}</div>
          </div>
          <div className={s.modalProdPrices}>
            <span className={s.strike}>₹{mrp}</span>
            <span className={s.boldPrice}>₹{subtotal}</span>
          </div>
        </div>
        <table className={s.breakdown}>
          <tbody>
            <tr>
              <td>{COPY.mrpTotal}</td>
              <td className={s.breakdownNum}>₹{mrp}</td>
            </tr>
            <tr>
              <td>{COPY.discountOnMrp}</td>
              <td className={s.breakdownNum}>₹{discount}</td>
            </tr>
            <tr className={s.breakdownStrong}>
              <td>{COPY.subtotal}</td>
              <td className={s.breakdownNum}>₹{subtotal}</td>
            </tr>
            <tr>
              <td>{COPY.standardShipping}</td>
              <td className={s.breakdownGreen}>Free</td>
            </tr>
          </tbody>
        </table>
        <div className={s.modalToPay}>
          <span>{COPY.toPay}</span>
          <span>₹{subtotal}</span>
        </div>
      </div>
    </div>
  );
}
