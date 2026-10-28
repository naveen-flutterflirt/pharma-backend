import { Request, Response } from "express";
import { prisma } from "../db/prisma";

// 1. Get Purchase Dashboard & KPI Stats
export const getPurchaseStats = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: { items: true }
    });

    let openOrdersValue = 0;
    let openOrdersCount = 0;
    let inwardingShipmentsCount = 0;
    let rateDiscrepancyAmount = 0;
    let pendingDebitNotesCount = 0;
    let backOrdersWaitingCount = 0;
    let transmittedCount = 0;
    let inwardingCount = 0;
    let receivedCount = 0;
    let discrepancyCount = 0;

    for (const po of orders) {
      if (po.status !== "received") {
        openOrdersValue += Number(po.totalPts || 0);
        openOrdersCount += 1;
        backOrdersWaitingCount += Number(po.backOrdersWaiting || 0);
      }

      if (po.status === "inwarding") {
        inwardingShipmentsCount += 1;
        inwardingCount += 1;
      } else if (po.status === "transmitted") {
        transmittedCount += 1;
      } else if (po.status === "discrepancy") {
        discrepancyCount += 1;
        rateDiscrepancyAmount += Number(po.debitNoteAmount || 0);
        pendingDebitNotesCount += 1;
      } else if (po.status === "received") {
        receivedCount += 1;
      }
    }

    return res.json({
      stats: {
        openOrdersValue: Math.round(openOrdersValue * 100) / 100,
        openOrdersCount,
        inwardingShipmentsCount,
        rateDiscrepancyAmount: Math.round(rateDiscrepancyAmount * 100) / 100,
        pendingDebitNotesCount,
        backOrdersWaitingCount,
        totalPosCount: orders.length,
        transmittedCount,
        inwardingCount,
        receivedCount,
        discrepancyCount
      }
    });
  } catch (err: any) {
    console.error("Error in getPurchaseStats:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 2. List Purchase Orders with Filtering & Search
export const listPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { status, principal, search } = req.query;
    const where: any = {};

    if (status && status !== "all") {
      where.status = String(status).toLowerCase();
    }

    if (principal && principal !== "all") {
      where.principalName = { contains: String(principal), mode: "insensitive" };
    }

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { poNumber: { contains: q, mode: "insensitive" } },
        { principalName: { contains: q, mode: "insensitive" } },
        { depotLocation: { contains: q, mode: "insensitive" } },
        { supplierInvoiceNo: { contains: q, mode: "insensitive" } },
        { grnNumber: { contains: q, mode: "insensitive" } },
        { debitNoteNo: { contains: q, mode: "insensitive" } }
      ];
    }

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ orders });
  } catch (err: any) {
    console.error("Error in listPurchaseOrders:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 3. Get Single Purchase Order by ID
export const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.purchaseOrder.findFirst({
      where: {
        OR: [{ id: String(id) }, { poNumber: String(id) }]
      },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: "Purchase Order not found" });
    }

    return res.json({ order });
  } catch (err: any) {
    console.error("Error in getPurchaseOrderById:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 4. Create New Purchase Order (EDI Transmit)
export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { principalName, depotLocation, items, expectedDate, schemeSlab, backOrdersWaiting } = req.body;

    if (!principalName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "principalName and valid items array are required" });
    }

    // Generate unique PO number
    let poNumber = `PO-2026-${Math.floor(9000 + Math.random() * 1000)}`;
    const existing = await prisma.purchaseOrder.findUnique({ where: { poNumber } });
    if (existing) {
      poNumber = `PO-2026-${Date.now().toString().slice(-4)}`;
    }

    let calculatedPts = 0;
    let calculatedFreeGoodsValue = 0;

    const formattedItems = items.map((it: any) => {
      const orderedQty = Math.max(1, Number(it.orderedQty) || 1);
      const ptsPrice = Number(it.ptsPrice) || 0;
      const mrp = Number(it.mrp) || (ptsPrice * 1.35);
      
      // Auto-calculate 10+1 free goods if not explicitly passed
      let freeQty = Number(it.freeQty);
      if (isNaN(freeQty) || freeQty < 0) {
        freeQty = Math.floor(orderedQty / 10);
      }

      calculatedPts += (orderedQty * ptsPrice);
      calculatedFreeGoodsValue += (freeQty * ptsPrice);

      return {
        name: it.name || "Formulation",
        pack: it.pack || "10 Strips",
        orderedQty,
        freeQty,
        ptsPrice,
        invoicedPts: it.invoicedPts ? Number(it.invoicedPts) : null,
        mrp,
        batchNo: it.batchNo || null,
        expDate: it.expDate || null,
        isDiscrepancy: false,
        discrepancyNote: null
      };
    });

    const now = new Date();
    const orderDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const deliveryExp = expectedDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const order = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        principalName,
        depotLocation: depotLocation || "Regional C&F Depot, Sector 4",
        orderDate,
        expectedDate: deliveryExp,
        linesCount: formattedItems.length,
        totalPts: Math.round(calculatedPts * 100) / 100,
        freeGoodsValue: Math.round(calculatedFreeGoodsValue * 100) / 100,
        schemeSlab: schemeSlab || "10+1 Free Goods Slab (100+10)",
        status: "transmitted",
        backOrdersWaiting: Number(backOrdersWaiting) || 0,
        items: {
          create: formattedItems
        }
      },
      include: { items: true }
    });

    return res.status(201).json({
      success: true,
      message: `Purchase order ${poNumber} transmitted to ${principalName} via EDI portal.`,
      order
    });
  } catch (err: any) {
    console.error("Error in createPurchaseOrder:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 5. Verify & Process Goods Receipt Note (GRN) Inwarding
export const processGrn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { supplierInvoiceNo, receivedItems } = req.body;

    const po = await prisma.purchaseOrder.findFirst({
      where: {
        OR: [{ id: String(id) }, { poNumber: String(id) }]
      },
      include: { items: true }
    });

    if (!po) {
      return res.status(404).json({ error: "Purchase Order not found" });
    }

    let hasRateDiscrepancy = false;
    let totalDebitNote = 0;
    const itemUpdates: Array<any> = [];

    if (receivedItems && Array.isArray(receivedItems)) {
      for (const recItem of receivedItems) {
        const existingItem = po.items.find((i) => i.id === recItem.id || i.name.toLowerCase() === (recItem.name || "").toLowerCase());
        if (!existingItem) continue;

        const receivedQty = recItem.receivedQty !== undefined ? Number(recItem.receivedQty) : existingItem.orderedQty;
        const invoicedPts = recItem.invoicedPts !== undefined ? Number(recItem.invoicedPts) : existingItem.ptsPrice;
        const batchNo = recItem.batchNo || existingItem.batchNo || `BTH-${Math.floor(1000 + Math.random() * 9000)}`;
        const expDate = recItem.expDate || existingItem.expDate || "12/28";

        let isDiscrepancy = false;
        let discrepancyNote = null;

        // Check if invoiced PTS exceeds contracted PTS price
        if (invoicedPts > existingItem.ptsPrice) {
          isDiscrepancy = true;
          const diffPerUnit = invoicedPts - existingItem.ptsPrice;
          const claimAmt = diffPerUnit * receivedQty;
          totalDebitNote += claimAmt;
          hasRateDiscrepancy = true;
          discrepancyNote = `Rate mismatch: Invoiced at ₹${invoicedPts.toFixed(2)} instead of contracted PTS ₹${existingItem.ptsPrice.toFixed(2)}. Debit note generated.`;
        }

        itemUpdates.push({
          id: existingItem.id,
          receivedQty,
          invoicedPts,
          batchNo,
          expDate,
          isDiscrepancy,
          discrepancyNote
        });
      }
    } else {
      // Default inward all ordered quantities
      for (const existingItem of po.items) {
        itemUpdates.push({
          id: existingItem.id,
          receivedQty: existingItem.orderedQty,
          invoicedPts: existingItem.ptsPrice,
          batchNo: existingItem.batchNo || `BTH-${Math.floor(1000 + Math.random() * 9000)}`,
          expDate: existingItem.expDate || "12/28",
          isDiscrepancy: false,
          discrepancyNote: null
        });
      }
    }

    // Execute Prisma updates
    for (const update of itemUpdates) {
      await prisma.purchaseOrderItem.update({
        where: { id: update.id },
        data: {
          receivedQty: update.receivedQty,
          invoicedPts: update.invoicedPts,
          batchNo: update.batchNo,
          expDate: update.expDate,
          isDiscrepancy: update.isDiscrepancy,
          discrepancyNote: update.discrepancyNote
        }
      });
    }

    const grnNumber = po.grnNumber || `GRN-25-${Math.floor(1050 + Math.random() * 50)}`;
    const finalSupplierInv = supplierInvoiceNo || po.supplierInvoiceNo || `INV-SUP-${Math.floor(10000 + Math.random() * 90000)}`;
    
    let newStatus: string = "received";
    let debitNoteNo: string | null = po.debitNoteNo;
    let debitNoteAmount: number | null = po.debitNoteAmount;

    if (hasRateDiscrepancy) {
      newStatus = "discrepancy";
      debitNoteNo = po.debitNoteNo || `DN-25-${Math.floor(1000 + Math.random() * 9000)}`;
      debitNoteAmount = Math.round(totalDebitNote * 100) / 100;
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: newStatus,
        grnNumber,
        supplierInvoiceNo: finalSupplierInv,
        debitNoteNo,
        debitNoteAmount
      },
      include: { items: true }
    });

    const backOrderMessage = po.backOrdersWaiting > 0
      ? ` ${po.backOrdersWaiting} back-order strips auto-released for customer billing!`
      : " Stock allocated to FEFO warehouse bins.";

    return res.json({
      success: true,
      message: `GRN ${grnNumber} processed successfully!${backOrderMessage}${hasRateDiscrepancy ? ` Rate discrepancy flagged with Debit Note ${debitNoteNo} (₹${debitNoteAmount}).` : ""}`,
      order: updated
    });
  } catch (err: any) {
    console.error("Error in processGrn:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 6. Get Debit Note details
export const getDebitNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const po = await prisma.purchaseOrder.findFirst({
      where: {
        OR: [{ id: String(id) }, { poNumber: String(id) }]
      },
      include: { items: true }
    });

    if (!po) {
      return res.status(404).json({ error: "Purchase Order not found" });
    }

    if (!po.debitNoteNo && po.status !== "discrepancy") {
      return res.status(400).json({ error: "No debit note associated with this purchase order" });
    }

    const discrepancyItems = po.items.filter((i) => i.isDiscrepancy || (i.invoicedPts && i.invoicedPts > i.ptsPrice));

    return res.json({
      debitNote: {
        debitNoteNo: po.debitNoteNo || "DN-25-0104",
        debitNoteAmount: po.debitNoteAmount || 0,
        poNumber: po.poNumber,
        principalName: po.principalName,
        supplierInvoiceNo: po.supplierInvoiceNo,
        dateGenerated: po.orderDate,
        discrepancyItems
      }
    });
  } catch (err: any) {
    console.error("Error in getDebitNote:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 7. Statutory Purchase Manifest CSV Export
export const exportPurchaseManifestCsv = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });

    const headers = [
      "PO Number",
      "Principal Name",
      "Depot Location",
      "Order Date",
      "Expected Date",
      "Lines Count",
      "Total PTS (INR)",
      "Free Goods Value (INR)",
      "Scheme Slab",
      "Status",
      "GRN Number",
      "Supplier Invoice No",
      "Debit Note No",
      "Debit Note Amount (INR)",
      "Back-Orders Waiting"
    ];

    const rows = orders.map((o) => [
      `"${o.poNumber}"`,
      `"${o.principalName.replace(/"/g, '""')}"`,
      `"${o.depotLocation.replace(/"/g, '""')}"`,
      `"${o.orderDate}"`,
      `"${o.expectedDate}"`,
      o.linesCount,
      o.totalPts.toFixed(2),
      o.freeGoodsValue.toFixed(2),
      `"${(o.schemeSlab || "").replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${o.grnNumber || ""}"`,
      `"${o.supplierInvoiceNo || ""}"`,
      `"${o.debitNoteNo || ""}"`,
      (o.debitNoteAmount || 0).toFixed(2),
      o.backOrdersWaiting
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="purchase_manifest_${Date.now()}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (err: any) {
    console.error("Error exporting purchase manifest CSV:", err);
    return res.status(500).json({ error: "Failed to export purchase manifest" });
  }
};
