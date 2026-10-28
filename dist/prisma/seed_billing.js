"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding realistic GST Billing Invoices & Items...");
    // Fetch reference customers
    const customers = await prisma.customer.findMany();
    if (customers.length === 0) {
        console.error("No customers found! Please seed customers first.");
        return;
    }
    const sriSai = customers.find((c) => c.name.includes("Sri Sai")) || customers[0];
    const cityCare = customers.find((c) => c.name.includes("City Care")) || customers[1 % customers.length];
    const arogya = customers.find((c) => c.name.includes("Arogya")) || customers[2 % customers.length];
    const apollo = customers.find((c) => c.name.includes("Apollo")) || customers[3 % customers.length];
    const janata = customers.find((c) => c.name.includes("Janata")) || customers[4 % customers.length];
    const sanjeevani = customers.find((c) => c.name.includes("Sanjeevani")) || customers[5 % customers.length];
    const newLife = customers.find((c) => c.name.includes("New Life")) || customers[6 % customers.length];
    const seedInvoices = [
        {
            invoiceNo: "INV-25-50388",
            customer: sriSai,
            route: "Route 3 (Ravi)",
            date: "08 Oct 2026",
            time: "10:15 AM",
            dueDate: "07 Nov 2026",
            taxable: 55786,
            gstAmount: 6694,
            total: 62480,
            irn: "9e82c5a08fb6d81249b109b8201a48c20188ef4a919028b19d4e782a19283f01",
            ewayBill: "241098451290",
            paymentStatus: client_1.PaymentStatus.UNPAID,
            dispatchStatus: client_1.DispatchStatus.TRAY_ASSIGNED,
            trayId: "Tray 14 · Bin C-04-2",
            items: [
                { name: "Amoxicillin + Clav 625 (10)", hsn: "30041010", batch: "AC2408", exp: "03/27", qty: 60, free: "6", ptr: 162.40, gst: 12, total: 9744.00 },
                { name: "Pantoprazole 40 (15)", hsn: "30049099", batch: "PN2502", exp: "06/27", qty: 100, free: "10", ptr: 98.10, gst: 12, total: 9810.00 },
                { name: "Metformin 500 SR (10)", hsn: "30049089", batch: "MF2511", exp: "11/27", qty: 200, free: "—", ptr: 21.30, gst: 12, total: 4174.80 },
                { name: "Insulin glargine pen", hsn: "30043110", batch: "IG2507", exp: "07/27", qty: 10, free: "—", ptr: 612.00, gst: 5, total: 6120.00 },
                { name: "Azithromycin 500 (3)", hsn: "30042099", batch: "AZ2412", exp: "12/26", qty: 80, free: "8", ptr: 74.60, gst: 12, total: 5968.00 },
                { name: "Cefixime 200 (10)", hsn: "30042010", batch: "CF2501", exp: "04/27", qty: 40, free: "—", ptr: 88.20, gst: 12, total: 3528.00 }
            ]
        },
        {
            invoiceNo: "INV-25-50387",
            customer: cityCare,
            route: "Route 1 (Suresh)",
            date: "08 Oct 2026",
            time: "09:45 AM",
            dueDate: "29 Oct 2026",
            taxable: 31116,
            gstAmount: 3734,
            total: 34850,
            irn: "8f21d4918e9b11048b29e018d940a4b71890ea391028374a819b18274019283e",
            ewayBill: null, // Under ₹50k exemption
            paymentStatus: client_1.PaymentStatus.UNPAID,
            dispatchStatus: client_1.DispatchStatus.PACKED_AND_SEALED,
            trayId: "Tray 09 · Box 2",
            items: [
                { name: "Paracetamol 650 tab (15)", hsn: "30049099", batch: "PC2409", exp: "09/27", qty: 120, free: "12", ptr: 28.50, gst: 12, total: 3420.00 },
                { name: "Montelukast + Levocet 10", hsn: "30049089", batch: "ML2503", exp: "05/27", qty: 90, free: "6", ptr: 118.00, gst: 12, total: 10301.40 },
                { name: "Atorvastatin 10 (15)", hsn: "30049079", batch: "AT2501", exp: "01/28", qty: 80, free: "8", ptr: 143.70, gst: 12, total: 11496.00 }
            ]
        },
        {
            invoiceNo: "INV-25-50386",
            customer: arogya,
            route: "Hospital Direct (Emergency)",
            date: "08 Oct 2026",
            time: "09:10 AM",
            dueDate: "22 Nov 2026",
            taxable: 43660,
            gstAmount: 5240,
            total: 48900,
            irn: "1b99a418d098e14710189b21840e9d1048172635481928301928471928471920",
            ewayBill: null, // Under ₹50k exemption
            paymentStatus: client_1.PaymentStatus.UNPAID,
            dispatchStatus: client_1.DispatchStatus.OUT_FOR_DELIVERY,
            trayId: "Van KA-01-MJ-8812",
            items: [
                { name: "Ceftriaxone 1g Inj (Vial)", hsn: "30042099", batch: "CF2410", exp: "08/26", qty: 200, free: "—", ptr: 55.00, gst: 12, total: 11000.00 },
                { name: "Normal Saline 500ml IV", hsn: "30049099", batch: "NS2504", exp: "04/28", qty: 400, free: "—", ptr: 38.00, gst: 12, total: 15200.00 },
                { name: "Meropenem 1g Inj", hsn: "30042099", batch: "MR2412", exp: "12/26", qty: 30, free: "—", ptr: 756.60, gst: 12, total: 22700.00 }
            ]
        },
        {
            invoiceNo: "INV-25-50385",
            customer: apollo,
            route: "Route 2 (Mahesh)",
            date: "08 Oct 2026",
            time: "08:30 AM",
            dueDate: "15 Oct 2026",
            taxable: 82500,
            gstAmount: 9900,
            total: 92400,
            irn: "7a19283740192834b71029384719283a01928374b6192837401928374a019283",
            ewayBill: "241098450912",
            paymentStatus: client_1.PaymentStatus.PAID,
            dispatchStatus: client_1.DispatchStatus.DELIVERED,
            trayId: "Delivered (POD OTP ✓)",
            items: [
                { name: "Telmisartan 40 (10)", hsn: "30049089", batch: "TL2411", exp: "10/26", qty: 300, free: "30", ptr: 64.20, gst: 12, total: 19260.00 },
                { name: "Rosuvastatin 20 (15)", hsn: "30049079", batch: "RS2502", exp: "08/27", qty: 150, free: "15", ptr: 182.00, gst: 12, total: 27300.00 }
            ]
        },
        {
            invoiceNo: "INV-25-50384",
            customer: janata,
            route: "Route 4 (Kiran)",
            date: "08 Oct 2026",
            time: "11:20 AM",
            dueDate: "05 Nov 2026",
            taxable: 66518,
            gstAmount: 7982,
            total: 74500,
            irn: "4c88e9102938471b601928374b6192837401928374a019283a19283740192834",
            ewayBill: "241098450877",
            paymentStatus: client_1.PaymentStatus.PARTIAL,
            dispatchStatus: client_1.DispatchStatus.DELIVERED,
            trayId: "Delivered (Chq #449102)",
            items: [
                { name: "Paracetamol 650 tab (15)", hsn: "30049099", batch: "PC2411", exp: "11/27", qty: 250, free: "25", ptr: 28.50, gst: 12, total: 7125.00 },
                { name: "Omeprazole 20 (15)", hsn: "30049099", batch: "OM2501", exp: "01/28", qty: 180, free: "18", ptr: 42.00, gst: 12, total: 7560.00 },
                { name: "Amoxicillin + Clav 625 (10)", hsn: "30041010", batch: "AC2409", exp: "04/27", qty: 120, free: "12", ptr: 162.40, gst: 12, total: 19488.00 },
                { name: "Atorvastatin 10 (15)", hsn: "30049079", batch: "AT2502", exp: "02/28", qty: 140, free: "14", ptr: 143.70, gst: 12, total: 20118.00 }
            ]
        },
        {
            invoiceNo: "INV-25-50383",
            customer: sanjeevani,
            route: "Route 5 (Deepak)",
            date: "08 Oct 2026",
            time: "11:45 AM",
            dueDate: "12 Nov 2026",
            taxable: 101964,
            gstAmount: 12236,
            total: 114200,
            irn: "3a99283740192834b71029384719283a01928374b6192837401928374a019299",
            ewayBill: "241098450711",
            paymentStatus: client_1.PaymentStatus.UNPAID,
            dispatchStatus: client_1.DispatchStatus.OUT_FOR_DELIVERY,
            trayId: "Van KA-01-MJ-4410",
            items: [
                { name: "Insulin glargine pen", hsn: "30043110", batch: "IG2509", exp: "09/27", qty: 30, free: "—", ptr: 612.00, gst: 5, total: 18360.00 },
                { name: "Meropenem 1g Inj", hsn: "30042099", batch: "MR2501", exp: "01/27", qty: 50, free: "—", ptr: 756.60, gst: 12, total: 37830.00 },
                { name: "Azithromycin 500 (3)", hsn: "30042099", batch: "AZ2503", exp: "03/27", qty: 200, free: "20", ptr: 74.60, gst: 12, total: 14920.00 }
            ]
        },
        {
            invoiceNo: "INV-25-50382",
            customer: newLife,
            route: "Route 2 (Mahesh)",
            date: "08 Oct 2026",
            time: "12:10 PM",
            dueDate: "28 Oct 2026",
            taxable: 25357,
            gstAmount: 3043,
            total: 28400,
            irn: "2f19283740192834b71029384719283a01928374b6192837401928374a019277",
            ewayBill: null, // Under ₹50k exemption
            paymentStatus: client_1.PaymentStatus.PAID,
            dispatchStatus: client_1.DispatchStatus.DELIVERED,
            trayId: "Delivered (UPI Rec #8891)",
            items: [
                { name: "Pantoprazole 40 (15)", hsn: "30049099", batch: "PN2503", exp: "07/27", qty: 150, free: "15", ptr: 98.10, gst: 12, total: 14715.00 },
                { name: "Metformin 500 SR (10)", hsn: "30049089", batch: "MF2512", exp: "12/27", qty: 300, free: "—", ptr: 21.30, gst: 12, total: 6390.00 }
            ]
        },
        {
            invoiceNo: "INV-25-50381",
            customer: sriSai,
            route: "Route 3 (Ravi)",
            date: "08 Oct 2026",
            time: "12:40 PM",
            dueDate: "14 Nov 2026",
            taxable: 49018,
            gstAmount: 5882,
            total: 54900,
            irn: "1e19283740192834b71029384719283a01928374b6192837401928374a019266",
            ewayBill: "241098450550",
            paymentStatus: client_1.PaymentStatus.UNPAID,
            dispatchStatus: client_1.DispatchStatus.TRAY_ASSIGNED,
            trayId: "Tray 04 · Bin A-02-1",
            items: [
                { name: "Cefixime 200 (10)", hsn: "30042010", batch: "CF2504", exp: "06/27", qty: 120, free: "—", ptr: 88.20, gst: 12, total: 10584.00 },
                { name: "Amoxicillin + Clav 625 (10)", hsn: "30041010", batch: "AC2502", exp: "05/27", qty: 100, free: "10", ptr: 162.40, gst: 12, total: 16240.00 },
                { name: "Rosuvastatin 20 (15)", hsn: "30049079", batch: "RS2504", exp: "10/27", qty: 70, free: "7", ptr: 182.00, gst: 12, total: 12740.00 }
            ]
        }
    ];
    for (const inv of seedInvoices) {
        const existing = await prisma.invoice.findUnique({
            where: { invoiceNo: inv.invoiceNo }
        });
        if (existing) {
            // Update existing
            await prisma.invoiceItem.deleteMany({ where: { invoiceId: existing.id } });
            await prisma.invoice.update({
                where: { id: existing.id },
                data: {
                    customerName: inv.customer.name,
                    customerCode: inv.customer.code,
                    route: inv.route,
                    gstin: inv.customer.gstin,
                    date: inv.date,
                    time: inv.time,
                    dueDate: inv.dueDate,
                    linesCount: inv.items.length,
                    taxable: inv.taxable,
                    gstAmount: inv.gstAmount,
                    total: inv.total,
                    irn: inv.irn,
                    ewayBill: inv.ewayBill,
                    paymentStatus: inv.paymentStatus,
                    dispatchStatus: inv.dispatchStatus,
                    trayId: inv.trayId,
                    items: {
                        create: inv.items.map((it) => ({
                            name: it.name,
                            hsn: it.hsn,
                            batch: it.batch,
                            exp: it.exp,
                            qty: it.qty,
                            free: String(it.free),
                            ptr: it.ptr,
                            gst: it.gst,
                            total: it.total
                        }))
                    }
                }
            });
            console.log(`Updated invoice ${inv.invoiceNo}`);
        }
        else {
            // Create new
            await prisma.invoice.create({
                data: {
                    invoiceNo: inv.invoiceNo,
                    customerId: inv.customer.id,
                    customerName: inv.customer.name,
                    customerCode: inv.customer.code,
                    route: inv.route,
                    gstin: inv.customer.gstin,
                    date: inv.date,
                    time: inv.time,
                    dueDate: inv.dueDate,
                    linesCount: inv.items.length,
                    taxable: inv.taxable,
                    gstAmount: inv.gstAmount,
                    total: inv.total,
                    irn: inv.irn,
                    ewayBill: inv.ewayBill,
                    paymentStatus: inv.paymentStatus,
                    dispatchStatus: inv.dispatchStatus,
                    trayId: inv.trayId,
                    items: {
                        create: inv.items.map((it) => ({
                            name: it.name,
                            hsn: it.hsn,
                            batch: it.batch,
                            exp: it.exp,
                            qty: it.qty,
                            free: String(it.free),
                            ptr: it.ptr,
                            gst: it.gst,
                            total: it.total
                        }))
                    }
                }
            });
            console.log(`Created invoice ${inv.invoiceNo}`);
        }
    }
    const count = await prisma.invoice.count();
    console.log(`✅ Seeding complete. Total invoices in database: ${count}`);
}
main()
    .catch((e) => {
    console.error("Error seeding billing:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
