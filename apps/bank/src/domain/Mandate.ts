export interface Mandate {
  id: string;
  businessId: string;
  beneficiaryId?: string;
  reference?: string;
  createdByProfileId?: string;
  status?: "active" | "cancelled" | "pending";
}

export default Mandate;
