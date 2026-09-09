export interface Beneficiary {
  id: string;
  businessId: string;
  name: string;
  accountNumber?: string;
  sortCode?: string;
  reference?: string;
}

export default Beneficiary;
