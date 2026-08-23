export interface CODRecord {
  id: string;
  orderId: string;
  codAmount: number;
  codStatus: string; // e.g. PENDING, SETTLED
}
