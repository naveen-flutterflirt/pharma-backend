"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting PostgreSQL database seed for Pharma DMS...");
    // Clear existing tables in order
    await prisma.pickWaveItem.deleteMany();
    await prisma.warehouseWave.deleteMany();
    await prisma.deliveryDrop.deleteMany();
    await prisma.deliveryRoute.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productBatch.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.claim.deleteMany();
    await prisma.beatVisit.deleteMany();
    await prisma.salesman.deleteMany();
    await prisma.auditLog.deleteMany();
    // 1. Seed Users with Bcrypt Hashes
    const defaultPasswordHash = await bcryptjs_1.default.hash("admin123", 10);
    const user = await prisma.user.create({
        data: {
            email: "admin@pharma.com",
            name: "Mr. Rajesh Shah",
            password: defaultPasswordHash,
            role: client_1.UserRole.OWNER,
            branch: "Central Logistics Warehouse",
            makerChecker: true,
            phone: "+91 98200 12345"
        }
    });
    await prisma.user.createMany({
        data: [
            {
                email: "pooja.v@shahpharma.com",
                name: "Pooja Varma",
                password: defaultPasswordHash,
                role: client_1.UserRole.BILLING_OPERATOR,
                branch: "Central Logistics Warehouse",
                phone: "+91 98200 54321"
            },
            {
                email: "amit.d@shahpharma.com",
                name: "Amit Deshmukh",
                password: defaultPasswordHash,
                role: client_1.UserRole.ACCOUNTS_CHECKER,
                branch: "Central Logistics Warehouse",
                makerChecker: true
            },
            {
                email: "vikram.p@shahpharma.com",
                name: "Vikram Patel",
                password: defaultPasswordHash,
                role: client_1.UserRole.WAREHOUSE_SUPERVISOR,
                branch: "Cold Chain & Depot 1"
            }
        ]
    });
    // 2. Seed Customers
    const customer1 = await prisma.customer.create({
        data: {
            code: "C-2041",
            name: "Sri Sai Medicals",
            type: "Retail Chemist",
            grade: "Grade A",
            route: "Route 3",
            salesman: "Ravi Kumar",
            phone: "+91 98450 11223",
            address: "Shop 4, Market Road, Bengaluru",
            gstin: "29AABCU9603R1ZM",
            gstinVerified: true,
            dlNumber: "DL 20B/21B-441829",
            dlValidTo: "2028-12-31",
            creditLimit: 300000,
            creditUsed: 184200,
            termsDays: 30,
            status: client_1.CustomerStatus.ACTIVE,
            monthlyAvg: 145000
        }
    });
    const customer2 = await prisma.customer.create({
        data: {
            code: "C-1980",
            name: "City Care Pharmacy",
            type: "Retail Chemist",
            grade: "Grade B",
            route: "Route 1",
            salesman: "Suresh Gowda",
            phone: "+91 98450 44556",
            address: "Cross 2, Ring Road, Bengaluru",
            gstin: "29AABCU4412K1Z9",
            gstinVerified: true,
            dlNumber: "DL 20B/21B-332910",
            dlValidTo: "2027-08-31",
            creditLimit: 200000,
            creditUsed: 215000,
            termsDays: 30,
            status: client_1.CustomerStatus.BLOCKED,
            blockReason: "Receivables overdue > 45 days (₹38,000 pending)",
            monthlyAvg: 95000
        }
    });
    // 3. Seed Products with Batches
    const p1 = await prisma.product.create({
        data: {
            name: "Amoxicillin + Clav 625 (10)",
            principal: "Principal B (Sun Pharma)",
            pack: "10 tablets",
            hsn: "30041010",
            gstPercent: 12,
            mrp: 204.50,
            ptr: 162.40,
            pts: 146.16,
            binLocation: "A-04-2",
            coldChain: false,
            scheduleH: true,
            batches: {
                create: [
                    { batchNumber: "AC2408", qty: 340, expDate: "03/27", status: "active" },
                    { batchNumber: "AC2411", qty: 120, expDate: "06/27", status: "active" }
                ]
            }
        }
    });
    const p2 = await prisma.product.create({
        data: {
            name: "Insulin glargine pen",
            principal: "Principal A (Sanofi / Cipla)",
            pack: "1 pen",
            hsn: "30043110",
            gstPercent: 5,
            mrp: 765.00,
            ptr: 612.00,
            pts: 550.80,
            binLocation: "Cold-Room-C1",
            coldChain: true,
            scheduleH: true,
            batches: {
                create: [
                    { batchNumber: "IG2507", qty: 48, expDate: "07/27", status: "active" }
                ]
            }
        }
    });
    const p3 = await prisma.product.create({
        data: {
            name: "Pantoprazole 40 (15)",
            principal: "Principal C (Abbott)",
            pack: "15 tablets",
            hsn: "30049099",
            gstPercent: 12,
            mrp: 123.00,
            ptr: 98.10,
            pts: 88.29,
            binLocation: "B-02-4",
            coldChain: false,
            scheduleH: false,
            batches: {
                create: [
                    { batchNumber: "PN2502", qty: 510, expDate: "06/27", status: "active" }
                ]
            }
        }
    });
    // 4. Seed Orders
    const order1 = await prisma.order.create({
        data: {
            orderNumber: "SO-2026-8812",
            customerId: customer1.id,
            customerName: customer1.name,
            channel: "salesman",
            channelLabel: "Salesman: Ravi",
            route: "Route 3",
            creditStatus: "Credit OK",
            creditBlocked: false,
            orderTotal: 62480,
            status: client_1.OrderStatus.PENDING,
            schemeSummary: "Amox-Clav 10+1 · Pantoprazole 10+1",
            freeGoodsValue: 3842,
            items: {
                create: [
                    {
                        name: "Amoxicillin + Clav 625 (10)",
                        batch: "AC2408",
                        exp: "03/27",
                        qty: 60,
                        free: "6",
                        ptr: 162.40,
                        gst: 12,
                        amount: 9744.00,
                        productId: p1.id
                    },
                    {
                        name: "Pantoprazole 40 (15)",
                        batch: "PN2502",
                        exp: "06/27",
                        qty: 100,
                        free: "10",
                        ptr: 98.10,
                        gst: 12,
                        amount: 9810.00,
                        productId: p3.id
                    }
                ]
            }
        }
    });
    // 5. Seed Invoices
    await prisma.invoice.create({
        data: {
            invoiceNo: "INV-25-50388",
            orderId: order1.id,
            customerId: customer1.id,
            customerName: customer1.name,
            customerCode: customer1.code,
            route: "Route 3 (Ravi)",
            gstin: customer1.gstin,
            date: "08 Oct 2026",
            time: "10:15 AM",
            dueDate: "07 Nov 2026",
            linesCount: 2,
            taxable: 55786,
            gstAmount: 6694,
            total: 62480,
            irn: "9e82c5a08fb6d81249b109b8201a48c20188ef4a919028b19d4e782a19283f01",
            ewayBill: "241098451290",
            paymentStatus: client_1.PaymentStatus.UNPAID,
            dispatchStatus: client_1.DispatchStatus.TRAY_ASSIGNED,
            trayId: "Tray 14 · Bin C-04-2",
            items: {
                create: [
                    {
                        name: "Amoxicillin + Clav 625 (10)",
                        hsn: "30041010",
                        batch: "AC2408",
                        exp: "03/27",
                        qty: 60,
                        free: "6",
                        ptr: 162.40,
                        gst: 12,
                        total: 9744.00
                    }
                ]
            }
        }
    });
    // 6. Seed Warehouse Waves
    await prisma.warehouseWave.create({
        data: {
            trayId: "Tray 14 · Bin C-04-2",
            invoiceNo: "INV-25-50388",
            customerName: "Sri Sai Medicals",
            linesCount: 42,
            totalUnits: 490,
            route: "Route 3",
            vanAssigned: "Van KA-01-MJ-4410",
            weightKg: 14.2,
            boxesCount: 2,
            status: "checking",
            isColdChainRequired: true,
            items: {
                create: [
                    {
                        binLocation: "A-04-2",
                        productName: "Amoxicillin + Clav 625 (10)",
                        pack: "10 tablets",
                        billedBatch: "AC2408",
                        expiryDate: "03/27",
                        qty: 60,
                        freeQty: "6",
                        isColdChain: false,
                        status: "picked"
                    },
                    {
                        binLocation: "Cold-Room-C1",
                        productName: "Insulin glargine pen",
                        pack: "1 pen",
                        billedBatch: "IG2507",
                        expiryDate: "07/27",
                        qty: 10,
                        freeQty: "—",
                        isColdChain: true,
                        status: "pending"
                    }
                ]
            }
        }
    });
    // 7. Seed Delivery Routes
    await prisma.deliveryRoute.create({
        data: {
            routeNumber: "Route 3",
            driverName: "Ramesh Kumar",
            vanNumber: "Van KA-01-MJ-4410",
            totalDrops: 18,
            deliveredDrops: 12,
            totalOrderValue: 412000,
            totalCollected: 72400,
            cashCollected: 14200,
            upiCollected: 48200,
            chequeCollected: 10000,
            status: "on_route",
            drops: {
                create: [
                    {
                        sequence: 1,
                        customerName: "Sri Sai Medicals",
                        customerCode: "C-2041",
                        address: "4th Cross, Malleshwaram Market, Bengaluru",
                        contactPerson: "Prabhu (Pharmacist)",
                        phone: "+91 98450 11223",
                        invoiceNo: "INV-25-50388",
                        boxesCount: 2,
                        invoiceAmount: 62480,
                        oldDues: 184200,
                        paymentMode: "UPI QR",
                        status: "in_transit"
                    }
                ]
            }
        }
    });
    // 8. Seed Collections
    await prisma.collection.create({
        data: {
            receiptNo: "REC-25-8812",
            customerId: customer1.id,
            customerName: customer1.name,
            customerCode: customer1.code,
            route: "Route 3",
            collectorName: "Ramesh Kumar (Van Driver)",
            amount: 24000,
            mode: "UPI QR",
            referenceNo: "UPI/261009184421/HDFC",
            date: "08 Oct 2026",
            time: "10:30 AM",
            allocatedInvoices: "INV-25-50388",
            reconciliationStatus: "Matched (Auto)",
            bankAccount: "HDFC Main Current A/c (9102)"
        }
    });
    // 9. Seed Purchases
    await prisma.purchaseOrder.create({
        data: {
            poNumber: "PO-2026-9041",
            principalName: "Principal B (Sun Pharma)",
            depotLocation: "Regional C&F Depot, Sector 4",
            orderDate: "06 Oct 2026",
            expectedDate: "09 Oct 2026",
            linesCount: 8,
            totalPts: 485250,
            freeGoodsValue: 48500,
            schemeSlab: "10+1 Universal Stockist Slab",
            status: "inwarding",
            supplierInvoiceNo: "SUN-CF-90128",
            grnNumber: "GRN-25-1044",
            items: {
                create: [
                    {
                        name: "Amoxicillin + Clav 625 (10)",
                        pack: "10 tablets",
                        orderedQty: 500,
                        freeQty: 50,
                        receivedQty: 500,
                        ptsPrice: 146.16,
                        mrp: 204.50,
                        batchNo: "AC2408",
                        expDate: "03/27"
                    }
                ]
            }
        }
    });
    // 10. Seed Claims
    await prisma.claim.create({
        data: {
            claimNo: "CLM-25-0182",
            type: "Expiry returns",
            principalName: "Principal B (Glaxo Regional)",
            cnfDepot: "Regional C&F Depot, Sector 4",
            amount: 580000,
            dateRaised: "14 Aug 2026",
            ageDays: 59,
            status: "Verified",
            creditNoteNo: "PCN-GLX-9941",
            creditNoteAmount: 580000,
            evidenceFilesCount: 4,
            batchDetails: "Augmentin 625: 42 strips · Zinetac 150: 120 strips",
            linesCount: 14
        }
    });
    // 11. Seed Salesmen
    await prisma.salesman.create({
        data: {
            name: "Ravi Kumar",
            phone: "+91 98450 99881",
            email: "ravi.k@shahpharma.com",
            beatName: "Route 3 (Malleshwaram)",
            todayTarget: 120000,
            achievedAmount: 94500,
            todayOrdersBooked: 62480,
            todayCollections: 32000,
            totalVisits: 14,
            completedVisits: 9,
            status: "on_beat",
            visits: {
                create: [
                    {
                        sequence: 1,
                        customerName: "Sri Sai Medicals",
                        customerCode: "C-2041",
                        type: "Retail Chemist",
                        distance: "0.4 km",
                        status: "completed",
                        orderBooked: 62480,
                        dueAmount: 184200,
                        usualOrderAmount: 55000,
                        gpsCheckedInAt: "10:12 AM (GPS Verified ✓)",
                        licenceStatus: "valid"
                    }
                ]
            }
        }
    });
    // 12. Seed Audit Logs
    await prisma.auditLog.createMany({
        data: [
            {
                timestamp: "Today 10:15 AM",
                user: "Mr. Rajesh Shah (Director)",
                action: "Credit Limit Override approved for Sri Sai Medicals (SO-2026-8812)",
                module: "Billing / GST",
                ipAddress: "192.168.1.18",
                severity: "info"
            },
            {
                timestamp: "Today 09:30 AM",
                user: "Sanjay Singhal (Owner)",
                action: "Purchase Order PO-2026-1048 transmitted via EDI to Cipla Ltd",
                module: "Purchase-to-Stock",
                ipAddress: "192.168.1.10",
                severity: "info"
            }
        ]
    });
    // 13. Seed Company & Master Policy Settings
    await prisma.companySetting.upsert({
        where: { id: "default" },
        update: {},
        create: {
            id: "default",
            firmName: "Shah Pharma Distributors LLP",
            tradeName: "Shah Pharma (Central Logistics Hub)",
            dl20B: "DL-20B-184920",
            dl21B: "DL-21B-184921",
            dlExpiry: "2028-11-30",
            fssaiNo: "10020011000492",
            gstin: "27AAAAA0000A1Z5",
            pharmacistName: "Rameshwar Nath Sharma, B.Pharm",
            pharmacistReg: "DPC-REG-449102",
            warehouseAddress: "Plot No. 44, Logistics Park, Bhiwandi, Maharashtra 421302",
            contactPhone: "+91 98200 12345",
            billingEmail: "billing@shahpharma.com",
            defaultCreditLimit: 50000,
            defaultCreditDays: 21,
            overdueBlockDays: 45,
            requireMakerCheckerPin: true,
            nearExpiryAlertDays: 90,
            strictFefoEnforced: true,
            minOrderValueFreeDelivery: 2500,
            gspProvider: "ClearTax / IRIS GST Enterprise",
            nicUsername: "PHARMA_EINV_27",
            nicClientId: "CLI-89304-NIC-PROD",
            autoEwbThreshold: 50000,
            autoGenerateIrn: true
        }
    });
    console.log("✅ PostgreSQL database seeded successfully with realistic Pharma DMS data!");
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
