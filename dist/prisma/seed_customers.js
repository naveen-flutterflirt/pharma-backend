"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding rich customer dossiers and realistic relations...");
    const products = await prisma.product.findMany();
    const amox = products.find((p) => p.name.includes("Amox")) || products[0];
    const panto = products.find((p) => p.name.includes("Pantoprazole")) || products[products.length - 1];
    const insulin = products.find((p) => p.name.includes("Insulin")) || products[1];
    const CUSTOMERS_DATA = [
        {
            code: "C-2041",
            name: "Sri Sai Medicals",
            type: "Retail Chemist",
            grade: "Grade A",
            route: "Route 3",
            salesman: "Ravi Kumar",
            address: "Shop 12, Market Yard, Sector 4, Bangalore",
            phone: "+91 98200 44102",
            gstin: "29AABCU9603R1ZM",
            dlNumber: "KA-B1-20B-18294",
            dlValidTo: "2028-03-31",
            creditLimit: 300000,
            creditUsed: 184200,
            termsDays: 30,
            status: client_1.CustomerStatus.ACTIVE,
            blockReason: null,
            monthlyAvg: 480000,
            invoices: [
                {
                    invoiceNo: "INV-25-48812",
                    date: "16 Sep 2026",
                    dueDate: "16 Oct 2026",
                    taxable: 52000,
                    gstAmount: 6240,
                    total: 58240,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                },
                {
                    invoiceNo: "INV-25-49530",
                    date: "24 Sep 2026",
                    dueDate: "24 Oct 2026",
                    taxable: 64196,
                    gstAmount: 7704,
                    total: 71900,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                },
                {
                    invoiceNo: "INV-25-50115",
                    date: "02 Oct 2026",
                    dueDate: "01 Nov 2026",
                    taxable: 48268,
                    gstAmount: 5792,
                    total: 54060,
                    paymentStatus: client_1.PaymentStatus.PARTIAL
                }
            ]
        },
        {
            code: "C-1980",
            name: "City Care Pharmacy",
            type: "Retail Chemist",
            grade: "Grade A",
            route: "Route 1",
            salesman: "Suresh Patil",
            address: "No. 45, 10th Cross, Malleshwaram, Bangalore",
            phone: "+91 98450 11920",
            gstin: "29AABCU4412K1Z9",
            dlNumber: "KA-B1-20B-19022",
            dlValidTo: "2027-06-30",
            creditLimit: 250000,
            creditUsed: 112000,
            termsDays: 21,
            status: client_1.CustomerStatus.ACTIVE,
            blockReason: null,
            monthlyAvg: 320000,
            invoices: [
                {
                    invoiceNo: "INV-25-49912",
                    date: "28 Sep 2026",
                    dueDate: "19 Oct 2026",
                    taxable: 37589,
                    gstAmount: 4511,
                    total: 42100,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                },
                {
                    invoiceNo: "INV-25-50280",
                    date: "05 Oct 2026",
                    dueDate: "26 Oct 2026",
                    taxable: 62410,
                    gstAmount: 7490,
                    total: 69900,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                }
            ]
        },
        {
            code: "C-1102",
            name: "Janata Medical Store",
            type: "Retail Chemist",
            grade: "Grade B",
            route: "Route 4",
            salesman: "Amit Deshmukh",
            address: "Station Road, Gandhi Bazaar, Bangalore",
            phone: "+91 99002 88410",
            gstin: "29AABCZ5512B1ZX",
            dlNumber: "KA-B2-20B-11029",
            dlValidTo: "2026-12-31",
            creditLimit: 200000,
            creditUsed: 94000,
            termsDays: 21,
            status: client_1.CustomerStatus.ACTIVE,
            blockReason: null,
            monthlyAvg: 210000,
            invoices: [
                {
                    invoiceNo: "INV-25-50341",
                    date: "07 Oct 2026",
                    dueDate: "28 Oct 2026",
                    taxable: 83928,
                    gstAmount: 10072,
                    total: 94000,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                }
            ]
        },
        {
            code: "C-2405",
            name: "New Life Chemists",
            type: "Retail Chemist",
            grade: "Grade C",
            route: "Route 2",
            salesman: "Ramesh Sharma",
            address: "Ground Floor, Complex 8, Rajajinagar, Bangalore",
            phone: "+91 97411 33201",
            gstin: "29AABCX8812D1Z4",
            dlNumber: "KA-B2-20B-14401",
            dlValidTo: "2026-11-30",
            creditLimit: 150000,
            creditUsed: 178000,
            termsDays: 15,
            status: client_1.CustomerStatus.BLOCKED,
            blockReason: "Cheque Bounced (CHQ #102944) · Overdue 48 days (>45 days rule)",
            monthlyAvg: 180000,
            invoices: [
                {
                    invoiceNo: "INV-25-47219",
                    date: "15 Aug 2026",
                    dueDate: "30 Aug 2026",
                    taxable: 77142,
                    gstAmount: 9258,
                    total: 86400,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                },
                {
                    invoiceNo: "INV-25-48190",
                    date: "04 Sep 2026",
                    dueDate: "19 Sep 2026",
                    taxable: 81785,
                    gstAmount: 9815,
                    total: 91600,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                }
            ]
        },
        {
            code: "C-0840",
            name: "Arogya Nursing Home Pharmacy",
            type: "Hospital Pharmacy",
            grade: "Grade A+",
            route: "Hospital Direct",
            salesman: "Accounts Direct",
            address: "100 Ft Road, Indiranagar, Bangalore",
            phone: "+91 98452 90123",
            gstin: "29AABCA7712M1Z8",
            dlNumber: "KA-B1-20B-90211",
            dlValidTo: "2029-01-31",
            creditLimit: 1000000,
            creditUsed: 420000,
            termsDays: 45,
            status: client_1.CustomerStatus.ACTIVE,
            blockReason: null,
            monthlyAvg: 750000,
            invoices: [
                {
                    invoiceNo: "INV-25-49801",
                    date: "25 Sep 2026",
                    dueDate: "09 Nov 2026",
                    taxable: 375000,
                    gstAmount: 45000,
                    total: 420000,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                }
            ]
        },
        {
            code: "C-1520",
            name: "Sanjeevani Medicals",
            type: "Retail Chemist",
            grade: "Grade A",
            route: "Route 5",
            salesman: "Vijay Verma",
            address: "Shop 4, Jayanagar 4th Block, Bangalore",
            phone: "+91 99160 55412",
            gstin: "29AABCS8891P1ZX",
            dlNumber: "KA-B1-20B-15200",
            dlValidTo: "2027-09-30",
            creditLimit: 400000,
            creditUsed: 125000,
            termsDays: 30,
            status: client_1.CustomerStatus.ACTIVE,
            blockReason: null,
            monthlyAvg: 290000,
            invoices: [
                {
                    invoiceNo: "INV-25-50020",
                    date: "01 Oct 2026",
                    dueDate: "31 Oct 2026",
                    taxable: 111607,
                    gstAmount: 13393,
                    total: 125000,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                }
            ]
        },
        {
            code: "C-3011",
            name: "Apollo Pharmacy Franchise",
            type: "Chain Pharmacy",
            grade: "Grade A+",
            route: "Route 2",
            salesman: "Ramesh Sharma",
            address: "Koramangala 5th Block, Bangalore",
            phone: "+91 98801 77620",
            gstin: "29AABCA1290K1ZY",
            dlNumber: "KA-B2-20B-30110",
            dlValidTo: "2028-11-30",
            creditLimit: 800000,
            creditUsed: 710000,
            termsDays: 30,
            status: client_1.CustomerStatus.WARNING,
            blockReason: "Credit limit utilization at 88.75% (warning threshold 85%)",
            monthlyAvg: 950000,
            invoices: [
                {
                    invoiceNo: "INV-25-49210",
                    date: "18 Sep 2026",
                    dueDate: "18 Oct 2026",
                    taxable: 312500,
                    gstAmount: 37500,
                    total: 350000,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                },
                {
                    invoiceNo: "INV-25-50199",
                    date: "03 Oct 2026",
                    dueDate: "02 Nov 2026",
                    taxable: 321428,
                    gstAmount: 38572,
                    total: 360000,
                    paymentStatus: client_1.PaymentStatus.UNPAID
                }
            ]
        }
    ];
    for (const cData of CUSTOMERS_DATA) {
        const { invoices, ...customerFields } = cData;
        const customer = await prisma.customer.upsert({
            where: { code: customerFields.code },
            update: {
                name: customerFields.name,
                type: customerFields.type,
                grade: customerFields.grade,
                route: customerFields.route,
                salesman: customerFields.salesman,
                address: customerFields.address,
                phone: customerFields.phone,
                gstin: customerFields.gstin,
                dlNumber: customerFields.dlNumber,
                dlValidTo: customerFields.dlValidTo,
                creditLimit: customerFields.creditLimit,
                creditUsed: customerFields.creditUsed,
                termsDays: customerFields.termsDays,
                status: customerFields.status,
                blockReason: customerFields.blockReason,
                monthlyAvg: customerFields.monthlyAvg
            },
            create: {
                code: customerFields.code,
                name: customerFields.name,
                type: customerFields.type,
                grade: customerFields.grade,
                route: customerFields.route,
                salesman: customerFields.salesman,
                address: customerFields.address,
                phone: customerFields.phone,
                gstin: customerFields.gstin,
                gstinVerified: true,
                dlNumber: customerFields.dlNumber,
                dlValidTo: customerFields.dlValidTo,
                pharmacistOnRecord: true,
                creditLimit: customerFields.creditLimit,
                creditUsed: customerFields.creditUsed,
                termsDays: customerFields.termsDays,
                status: customerFields.status,
                blockReason: customerFields.blockReason,
                monthlyAvg: customerFields.monthlyAvg
            }
        });
        // Create or update invoices
        for (const inv of invoices) {
            await prisma.invoice.upsert({
                where: { invoiceNo: inv.invoiceNo },
                update: {
                    paymentStatus: inv.paymentStatus,
                    total: inv.total,
                    taxable: inv.taxable,
                    gstAmount: inv.gstAmount,
                    dueDate: inv.dueDate,
                    customerId: customer.id
                },
                create: {
                    invoiceNo: inv.invoiceNo,
                    customerId: customer.id,
                    customerName: customer.name,
                    customerCode: customer.code,
                    route: customer.route,
                    gstin: customer.gstin,
                    date: inv.date,
                    time: "10:30 AM",
                    dueDate: inv.dueDate,
                    linesCount: 2,
                    taxable: inv.taxable,
                    gstAmount: inv.gstAmount,
                    total: inv.total,
                    irn: "9e82c5a08fb6d81249b109b8201a48c20188ef4a919028b19d4e782a1928" + inv.invoiceNo.slice(-4),
                    ewayBill: "2410" + Math.floor(10000000 + Math.random() * 90000000),
                    paymentStatus: inv.paymentStatus,
                    dispatchStatus: client_1.DispatchStatus.DELIVERED,
                    items: {
                        create: [
                            {
                                name: amox?.name || "Amoxicillin + Clav 625 (10)",
                                productId: amox?.id,
                                batch: "BX-9021",
                                exp: "08/28",
                                qty: 150,
                                ptr: amox?.ptr || 162.4,
                                gst: 12,
                                total: Math.round(inv.taxable * 0.6)
                            },
                            {
                                name: panto?.name || "Pantoprazole 40 (15)",
                                productId: panto?.id,
                                batch: "PT-4412",
                                exp: "11/27",
                                qty: 200,
                                ptr: panto?.ptr || 98.1,
                                gst: 12,
                                total: Math.round(inv.taxable * 0.4)
                            }
                        ]
                    }
                }
            });
        }
        // Ensure at least one order
        const existingOrder = await prisma.order.findFirst({
            where: { customerId: customer.id }
        });
        if (!existingOrder) {
            await prisma.order.create({
                data: {
                    orderNumber: `SO-2026-${Math.floor(8000 + Math.random() * 1999)}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    channel: "salesman",
                    channelLabel: `Salesman: ${customer.salesman}`,
                    route: customer.route,
                    creditStatus: customer.status === client_1.CustomerStatus.BLOCKED ? "Blocked" : "Credit OK",
                    creditBlocked: customer.status === client_1.CustomerStatus.BLOCKED,
                    blockReason: customer.blockReason,
                    orderTotal: Math.round(customer.monthlyAvg * 0.4),
                    status: client_1.OrderStatus.BILLED,
                    schemeSummary: "Pantoprazole 10+1 Scheme Applied",
                    freeGoodsValue: 2400,
                    items: {
                        create: [
                            {
                                name: panto?.name || "Pantoprazole 40 (15)",
                                productId: panto?.id,
                                batch: "PT-4412",
                                exp: "11/27",
                                qty: 100,
                                free: "10 free",
                                ptr: 98.1,
                                gst: 12,
                                amount: 9810
                            }
                        ]
                    }
                }
            });
        }
        // Ensure at least one collection
        const existingCol = await prisma.collection.findFirst({
            where: { customerId: customer.id }
        });
        if (!existingCol) {
            await prisma.collection.create({
                data: {
                    receiptNo: `REC-26-${Math.floor(8000 + Math.random() * 1999)}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    customerCode: customer.code,
                    route: customer.route,
                    collectorName: `${customer.salesman} (Field Rep)`,
                    collectorRole: "Salesman",
                    amount: Math.round(customer.creditUsed * 0.3) || 25000,
                    mode: "UPI QR",
                    referenceNo: `UPI/2610${Math.floor(10000000 + Math.random() * 90000000)}/HDFC`,
                    date: "25 Oct 2026",
                    time: "02:30 PM",
                    allocatedInvoices: invoices[0]?.invoiceNo || "INV-25-48812",
                    reconciliationStatus: "Matched (Auto)",
                    bankAccount: "HDFC Primary Current A/c (..8821)"
                }
            });
        }
    }
    console.log("Seeding customer accounts complete!");
}
main()
    .catch((e) => {
    console.error("Error seeding customers:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
