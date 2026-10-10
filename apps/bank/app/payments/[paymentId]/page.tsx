import { ProductShell } from "../../ProductShell";
import { EffectivePaymentDetail } from "./EffectivePaymentDetail";
import "../../accounts.css";
import "../payments.css";

export default async function PaymentDetailPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  return <ProductShell activeRoute="payments"><EffectivePaymentDetail paymentId={paymentId} /></ProductShell>;
}
