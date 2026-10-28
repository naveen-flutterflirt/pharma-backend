"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPurchase = seedPurchase;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedPurchase() {
    console.log("Seeding realistic Purchase Orders & GRN Inwarding...");
    // Delete existing purchase order items and purchase orders
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    const orders = [
        {
            poNumber: "PO-2026-9041",
            principalName: "Principal B (Glaxo Regional)",
            depotLocation: "Regional C&F Depot, Sector 4",
            orderDate: "07 Oct 2026",
            expectedDate: "09 Oct 2026",
            linesCount: 3,
            totalPts: 485250,
            freeGoodsValue: 48500,
            schemeSlab: "10+1 Free Goods Slab (100+10)",
            status: "inwarding",
            supplierInvoiceNo: "INV-C&F-88912",
            grnNumber: "GRN-25-1048",
            backOrdersWaiting: 80,
            items: [
                {
                    name: "Amoxicillin + Clav 625 (10)",
                    pack: "10 tab",
                    orderedQty: 1650,
                    freeQty: 165,
                    receivedQty: 1650,
                    ptsPrice: 146.16,
                    invoicedPts: 146.16,
                    mrp: 204.0,
                    batchNo: "AC2501",
                    expDate: "08/28"
                },
                {
                    name: "Cefixime 200 (10)",
                    pack: "10 tab",
                    orderedQty: 400,
                    freeQty: 40,
                    receivedQty: 400,
                    ptsPrice: 79.38,
                    invoicedPts: 79.38,
                    mrp: 110.0,
                    batchNo: "CF2502",
                    expDate: "05/28"
                },
                {
                    name: "Paracetamol 650 tab",
                    pack: "15 tab",
                    orderedQty: 1200,
                    freeQty: 120,
                    receivedQty: 1200,
                    ptsPrice: 25.65,
                    invoicedPts: 25.65,
                    mrp: 34.5,
                    batchNo: "PC2504",
                    expDate: "10/28"
                }
            ]
        },
        {
            poNumber: "PO-2026-9038",
            principalName: "Principal A (Novartis / Sandoz)",
            depotLocation: "Central Logistics Hub",
            orderDate: "05 Oct 2026",
            expectedDate: "08 Oct 2026",
            linesCount: 2,
            totalPts: 320400,
            freeGoodsValue: 0,
            schemeSlab: "Net Rate Contract (Cold Chain Priority)",
            status: "discrepancy",
            supplierInvoiceNo: "INV-NOV-44102",
            grnNumber: "GRN-25-1046",
            debitNoteNo: "DN-25-0104",
            debitNoteAmount: 14400,
            backOrdersWaiting: 0,
            items: [
                {
                    name: "Insulin glargine pen",
                    pack: "1 pen",
                    orderedQty: 300,
                    freeQty: 0,
                    receivedQty: 300,
                    ptsPrice: 550.8,
                    invoicedPts: 598.8,
                    mrp: 750.0,
                    batchNo: "IG2509",
                    expDate: "11/27",
                    isDiscrepancy: true,
                    discrepancyNote: "Rate mismatch: Invoiced at ₹598.80 instead of contracted PTS ₹550.80. Debit note generated."
                },
                {
                    name: "Vildagliptin 50 (15)",
                    pack: "15 tab",
                    orderedQty: 250,
                    freeQty: 0,
                    receivedQty: 250,
                    ptsPrice: 172.0,
                    invoicedPts: 172.0,
                    mrp: 235.0,
                    batchNo: "VG2502",
                    expDate: "06/28"
                }
            ]
        },
        {
            poNumber: "PO-2026-9040",
            principalName: "Principal C (Cipla Stockist)",
            depotLocation: "State Mother Warehouse",
            orderDate: "06 Oct 2026",
            expectedDate: "09 Oct 2026",
            linesCount: 2,
            totalPts: 245800,
            freeGoodsValue: 24500,
            schemeSlab: "10+1 free formulation scheme",
            status: "transmitted",
            backOrdersWaiting: 15,
            items: [
                {
                    name: "Pantoprazole 40 (15)",
                    pack: "15 tab",
                    orderedQty: 2200,
                    freeQty: 220,
                    ptsPrice: 88.29,
                    mrp: 125.0
                },
                {
                    name: "Azithromycin 500 (3)",
                    pack: "3 tab",
                    orderedQty: 600,
                    freeQty: 60,
                    ptsPrice: 67.14,
                    mrp: 95.0
                }
            ]
        },
        {
            poNumber: "PO-2026-9022",
            principalName: "Principal D (Abbott Care)",
            depotLocation: "Regional Depot 01",
            orderDate: "02 Oct 2026",
            expectedDate: "05 Oct 2026",
            linesCount: 1,
            totalPts: 185000,
            freeGoodsValue: 26400,
            schemeSlab: "12+2 Festival Offer",
            status: "received",
            supplierInvoiceNo: "INV-ABB-99120",
            grnNumber: "GRN-25-1039",
            backOrdersWaiting: 0,
            items: [
                {
                    name: "Cough syrup 100 ml",
                    pack: "1 btl",
                    orderedQty: 1440,
                    freeQty: 240,
                    receivedQty: 1440,
                    ptsPrice: 80.55,
                    invoicedPts: 80.55,
                    mrp: 115.0,
                    batchNo: "CS2503",
                    expDate: "04/28"
                }
            ]
        },
        {
            poNumber: "PO-2026-9045",
            principalName: "Sun Pharma Distributors",
            depotLocation: "Bhiwandi C&F Warehouse",
            orderDate: "20 Oct 2026",
            expectedDate: "23 Oct 2026",
            linesCount: 2,
            totalPts: 512000,
            freeGoodsValue: 51200,
            schemeSlab: "10+1 Quarterly Stockist Scheme",
            status: "inwarding",
            supplierInvoiceNo: "INV-SUN-99210",
            grnNumber: "GRN-25-1052",
            backOrdersWaiting: 40,
            items: [
                {
                    name: "Rosuvastatin 10mg",
                    pack: "10 tab",
                    orderedQty: 2000,
                    freeQty: 200,
                    receivedQty: 2000,
                    ptsPrice: 125.0,
                    invoicedPts: 125.0,
                    mrp: 175.0,
                    batchNo: "RS2510",
                    expDate: "09/28"
                },
                {
                    name: "Telmisartan 40mg",
                    pack: "10 tab",
                    orderedQty: 3000,
                    freeQty: 300,
                    receivedQty: 3000,
                    ptsPrice: 87.33,
                    invoicedPts: 87.33,
                    mrp: 120.0,
                    batchNo: "TL2511",
                    expDate: "10/28"
                }
            ]
        }
    ];
    for (const o of orders) {
        const { items, ...orderData } = o;
        const createdPo = await prisma.purchaseOrder.create({
            data: orderData
        });
        for (const item of items) {
            await prisma.purchaseOrderItem.create({
                data: {
                    purchaseOrderId: createdPo.id,
                    ...item
                }
            });
        }
    }
    console.log(`Successfully seeded ${orders.length} purchase orders with item details!`);
}
if (require.main === module) {
    seedPurchase()
        .catch((e) => {
        console.error(e);
        process.exit(1);
    })
        .finally(() => prisma.$disconnect());
}
