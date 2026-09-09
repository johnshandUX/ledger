import { makePayment } from "../domain/Payment";

export const payments = [
  makePayment({
    id: "p-1",
    businessId: "b-northstar",
    createdByProfileId: "bp-priya-northstar",
    fromAccountId: "acc-ns-pay",
    toBeneficiaryId: "ben-1",
    amount: 12000,
    createdAt: new Date().toISOString(),
    status: "pending",
    reference: "Payroll Sep",
  }),
  makePayment({
    id: "p-2",
    businessId: "b-northstar",
    createdByProfileId: "bp-alex-northstar",
    fromAccountId: "acc-ns-op",
    toBeneficiaryId: "ben-1",
    amount: 5000,
    createdAt: new Date().toISOString(),
    status: "pending-approval",
    reference: "Supplier payment",
  }),
];

export default payments;
