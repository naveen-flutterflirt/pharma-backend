export * from "@prisma/client";

// Core Domain Model Interfaces
export interface ClaimDTO {
  id?: string;
  claimNo?: string;
  type: string;
  principalName: string;
  cnfDepot?: string;
  amount: number;
  dateRaised?: string;
  ageDays?: number;
  status?: string;
  creditNoteNo?: string;
  creditNoteAmount?: number;
  evidenceFilesCount?: number;
  batchDetails?: string;
  linesCount?: number;
}

export interface SalesmanDTO {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  beatName: string;
  todayTarget?: number;
  achievedAmount?: number;
  todayOrdersBooked?: number;
  todayCollections?: number;
  totalVisits?: number;
  completedVisits?: number;
  status?: string;
}

export interface BeatVisitDTO {
  id?: string;
  salesmanId: string;
  sequence: number;
  customerName: string;
  customerCode: string;
  type?: string;
  distance?: string;
  status?: string;
  orderBooked?: number;
  dueAmount?: number;
  usualOrderAmount?: number;
  gpsCheckedInAt?: string;
  licenceStatus?: string;
}

export interface CompanySettingDTO {
  firmName?: string;
  tradeName?: string;
  dl20B?: string;
  dl21B?: string;
  dlExpiry?: string;
  fssaiNo?: string;
  gstin?: string;
  pharmacistName?: string;
  pharmacistReg?: string;
  warehouseAddress?: string;
  contactPhone?: string;
  billingEmail?: string;
  defaultCreditLimit?: number;
  defaultCreditDays?: number;
  overdueBlockDays?: number;
  requireMakerCheckerPin?: boolean;
  nearExpiryAlertDays?: number;
  strictFefoEnforced?: boolean;
  minOrderValueFreeDelivery?: number;
  gspProvider?: string;
  nicUsername?: string;
  nicClientId?: string;
  autoEwbThreshold?: number;
  autoGenerateIrn?: boolean;
}

export interface CollectionDTO {
  id?: string;
  receiptNo?: string;
  customerId: string;
  customerName?: string;
  customerCode?: string;
  route?: string;
  collectorName?: string;
  collectorRole?: string;
  amount: number;
  mode: string;
  referenceNo: string;
  date?: string;
  time?: string;
  allocatedInvoices?: string | string[];
  reconciliationStatus?: string;
  bankAccount?: string;
}

export interface CollectionStatsDTO {
  totalCollectedToday: number;
  totalOutstandingReceivables: number;
  overdueAbove45Days: number;
  dsoDays: number;
  autoBlockedAccountsCount: number;
  modeBreakdown: {
    upiPercent: number;
    chequePercent: number;
    neftPercent: number;
    cashPercent: number;
    upiAmount: number;
    chequeAmount: number;
    neftAmount: number;
    cashAmount: number;
  };
  reconciliationSummary: {
    autoMatchedCount: number;
    pendingClearanceCount: number;
    disputedCount: number;
  };
}

export interface CustomerDTO {
  id?: string;
  code?: string;
  name: string;
  type?: string;
  grade?: string;
  route?: string;
  salesman?: string;
  address?: string;
  phone?: string;
  gstin: string;
  gstinVerified?: boolean;
  dlNumber: string;
  dlValidTo: string;
  pharmacistOnRecord?: boolean;
  creditLimit: number;
  creditUsed?: number;
  termsDays: number;
  status?: "ACTIVE" | "BLOCKED" | "WARNING";
  blockReason?: string;
  monthlyAvg?: number;
}

export interface CustomerStatsDTO {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  warningCustomers: number;
  totalCreditLimit: number;
  totalCreditUsed: number;
  avgCreditDays: number;
  chequeBouncesCount: number;
}

export interface CustomerLedgerEntryDTO {
  id: string;
  date: string;
  voucherType: "INVOICE" | "COLLECTION" | "CREDIT_NOTE";
  referenceNo: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  mode?: string;
}

export interface CustomerLedgerDTO {
  customer: {
    id: string;
    code: string;
    name: string;
    gstin: string;
    creditLimit: number;
    creditUsed: number;
    termsDays: number;
    route: string;
    salesman: string;
    phone?: string;
  };
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  entries: CustomerLedgerEntryDTO[];
}

export interface DeliveryDropDTO {
  id?: string;
  routeId?: string;
  sequence: number;
  customerName: string;
  customerCode: string;
  address: string;
  contactPerson: string;
  phone: string;
  invoiceNo: string;
  boxesCount: number;
  invoiceAmount: number;
  oldDues: number;
  paymentMode: string;
  returnPickUp?: string | null;
  otpVerified?: boolean;
  photoTaken?: boolean;
  signature?: boolean;
  status: "pending" | "in_transit" | "delivered" | "failed";
  collectedAmount?: number | null;
  collectionMethod?: string | null;
  deliveredAt?: string | null;
}

export interface DeliveryRouteDTO {
  id?: string;
  routeNumber: string;
  driverName: string;
  vanNumber: string;
  totalDrops: number;
  deliveredDrops: number;
  totalOrderValue: number;
  totalCollected: number;
  cashCollected: number;
  upiCollected: number;
  chequeCollected: number;
  status: "on_route" | "settled" | "loading";
  drops?: DeliveryDropDTO[];
}

export interface DeliveryStatsDTO {
  totalRoutes: number;
  activeVansOnRoute: number;
  totalDrops: number;
  deliveredDrops: number;
  pendingDrops: number;
  completionPercent: number;
  totalOrderValue: number;
  totalCollected: number;
  cashCollected: number;
  upiCollected: number;
  chequeCollected: number;
  coldChainCompliancePercent: number;
}

export interface PickWaveItemDTO {
  id?: string;
  waveId?: string;
  binLocation: string;
  productName: string;
  pack: string;
  billedBatch: string;
  expiryDate: string;
  qty: number;
  freeQty?: string | number;
  isColdChain?: boolean;
  status: "picked" | "pending" | "mismatch";
  scannedBatch?: string | null;
  mismatchNote?: string | null;
}

export interface WarehouseWaveDTO {
  id?: string;
  trayId: string;
  invoiceNo: string;
  customerName: string;
  linesCount: number;
  totalUnits: number;
  route: string;
  vanAssigned: string;
  weightKg: number;
  boxesCount: number;
  status: "picking" | "checking" | "sealed" | "dispatched";
  isColdChainRequired?: boolean;
  items?: PickWaveItemDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseStatsDTO {
  orderToDispatchMedian: string;
  slaTargetMinutes: number;
  pickAccuracyPercent: number;
  totalActiveWaves: number;
  pickingCount: number;
  checkingCount: number;
  sealedCount: number;
  dispatchedCount: number;
  coldChainStagedBoxes: number;
  totalItemsCount: number;
  verifiedItemsCount: number;
  pendingItemsCount: number;
  mismatchItemsCount: number;
}

export interface PurchaseOrderItemDTO {
  id?: string;
  purchaseOrderId?: string;
  name: string;
  pack: string;
  orderedQty: number;
  freeQty: number;
  receivedQty?: number | null;
  ptsPrice: number;
  invoicedPts?: number | null;
  mrp: number;
  batchNo?: string | null;
  expDate?: string | null;
  isDiscrepancy?: boolean;
  discrepancyNote?: string | null;
}

export interface PurchaseOrderDTO {
  id?: string;
  poNumber: string;
  principalName: string;
  depotLocation: string;
  orderDate: string;
  expectedDate: string;
  linesCount: number;
  totalPts: number;
  freeGoodsValue?: number;
  schemeSlab?: string | null;
  status: "transmitted" | "inwarding" | "received" | "discrepancy";
  grnNumber?: string | null;
  supplierInvoiceNo?: string | null;
  debitNoteNo?: string | null;
  debitNoteAmount?: number | null;
  backOrdersWaiting?: number;
  createdAt?: string;
  updatedAt?: string;
  items?: PurchaseOrderItemDTO[];
}

export interface PurchaseStatsDTO {
  openOrdersValue: number;
  openOrdersCount: number;
  inwardingShipmentsCount: number;
  rateDiscrepancyAmount: number;
  pendingDebitNotesCount: number;
  backOrdersWaitingCount: number;
  totalPosCount: number;
  transmittedCount: number;
  inwardingCount: number;
  receivedCount: number;
  discrepancyCount: number;
}

export interface ProductBatchDTO {
  id?: string;
  productId?: string;
  batchNumber: string;
  qty: number;
  expDate: string;
  status: string; // "active" | "push" | "overstock" | "quarantine" | "expired"
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDTO {
  id?: string;
  name: string;
  principal: string;
  pack: string;
  hsn: string;
  gstPercent: number;
  mrp: number;
  ptr: number;
  pts: number;
  avgDailySale: number;
  binLocation: string;
  coldChain: boolean;
  scheduleH: boolean;
  stock?: number;
  daysCover?: number;
  suggestedPo?: number | string;
  batches?: ProductBatchDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductStatsDTO {
  totalProducts: number;
  totalStockUnits: number;
  totalStockValuePts: number;
  totalPrincipalsCount: number;
  lowStockCount: number;
  nearExpiryCount: number;
  overstockCount: number;
  coldChainCount: number;
  outOfStockCount: number;
}

export interface InvoiceItemDTO {
  id?: string;
  invoiceId?: string;
  productId?: string | null;
  name: string;
  hsn: string;
  batch: string;
  exp: string;
  qty: number;
  free?: string | number;
  ptr: number;
  gst: number;
  total: number;
}

export interface InvoiceDTO {
  id: string;
  invoiceNo: string;
  orderId?: string | null;
  customerId: string;
  customerName: string;
  customerCode: string;
  route: string;
  gstin: string;
  date: string;
  time: string;
  dueDate: string;
  linesCount: number;
  taxable: number;
  gstAmount: number;
  total: number;
  irn: string;
  ewayBill?: string | null;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  dispatchStatus: "TRAY_ASSIGNED" | "PACKED_AND_SEALED" | "OUT_FOR_DELIVERY" | "DELIVERED";
  trayId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  items?: InvoiceItemDTO[];
  customer?: any;
}

export interface BillingStatsDTO {
  todayBilledVolume: number;
  totalInvoicesCount: number;
  irnComplianceRate: number;
  ewayBillsCount: number;
  averageTicket: number;
  unpaidAmount: number;
  unpaidCount: number;
  trayAssignedCount: number;
  packedCount: number;
  outForDeliveryCount: number;
  deliveredCount: number;
}

export interface CreateInvoiceDTO {
  customerId: string;
  dueDate?: string;
  items: Array<{
    productId?: string;
    name: string;
    hsn?: string;
    batch?: string;
    exp?: string;
    qty: number;
    free?: string | number;
    ptr: number;
    gst?: number;
  }>;
  trayId?: string;
  vehicleNo?: string;
}

export interface OrderItemDTO {
  id?: string;
  orderId?: string;
  productId?: string | null;
  name: string;
  batch: string;
  exp: string;
  qty: number;
  free?: string | number;
  ptr: number;
  gst: number;
  amount: number;
  isShort?: boolean;
  shortNote?: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  channel: string;
  channelLabel: string;
  route: string;
  creditStatus: string;
  creditBlocked: boolean;
  blockReason?: string | null;
  orderTotal: number;
  status: "PENDING" | "HOLD" | "BILLED" | "CANCELLED";
  irn?: string | null;
  ewayBill?: string | null;
  billedAt?: string | null;
  schemeSummary?: string | null;
  freeGoodsValue: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  items?: OrderItemDTO[];
  customer?: any;
  invoice?: any;
}

export interface OrderStatsDTO {
  pendingOrdersCount: number;
  pendingOrdersValue: number;
  creditBlockedCount: number;
  creditBlockedValue: number;
  todayOrdersCount: number;
  todayOrdersValue: number;
  freeGoodsValueTotal: number;
  billedOrdersCount: number;
  holdOrdersCount: number;
  channelCounts: {
    salesman: number;
    app: number;
    whatsapp: number;
    counter: number;
  };
}

export interface CreateOrderDTO {
  customerId: string;
  channel?: string;
  route?: string;
  schemeSummary?: string;
  freeGoodsValue?: number;
  items: Array<{
    productId?: string;
    name: string;
    batch?: string;
    exp?: string;
    qty: number;
    free?: string | number;
    ptr: number;
    gst?: number;
    isShort?: boolean;
    shortNote?: string;
  }>;
}


