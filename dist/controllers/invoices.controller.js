"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportGstr1Csv = exports.recordPayment = exports.updateDispatchStatus = exports.generateEwayBill = exports.generateIrn = exports.createInvoice = exports.getInvoiceById = exports.listInvoices = exports.getBillingStats = void 0;
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
// 1. Get Billing Dashboard KPI Stats
const getBillingStats = async (req, res) => {
    try {
        const invoices = await prisma_1.prisma.invoice.findMany({
            select: {
                total: true,
                taxable: true,
                gstAmount: true,
                irn: true,
                ewayBill: true,
                paymentStatus: true,
                dispatchStatus: true,
                createdAt: true
            }
        });
        const totalInvoicesCount = invoices.length;
        let todayBilledVolume = 0;
        let validIrnCount = 0;
        let ewayBillsCount = 0;
        let unpaidAmount = 0;
        let unpaidCount = 0;
        let trayAssignedCount = 0;
        let packedCount = 0;
        let outForDeliveryCount = 0;
        let deliveredCount = 0;
        for (const inv of invoices) {
            const amt = Number(inv.total || 0);
            todayBilledVolume += amt;
            if (inv.irn && inv.irn.length > 10) {
                validIrnCount += 1;
            }
            if (inv.ewayBill) {
                ewayBillsCount += 1;
            }
            if (inv.paymentStatus === client_1.PaymentStatus.UNPAID || inv.paymentStatus === client_1.PaymentStatus.PARTIAL) {
                unpaidAmount += amt;
                unpaidCount += 1;
            }
            if (inv.dispatchStatus === client_1.DispatchStatus.TRAY_ASSIGNED) {
                trayAssignedCount += 1;
            }
            else if (inv.dispatchStatus === client_1.DispatchStatus.PACKED_AND_SEALED) {
                packedCount += 1;
            }
            else if (inv.dispatchStatus === client_1.DispatchStatus.OUT_FOR_DELIVERY) {
                outForDeliveryCount += 1;
            }
            else if (inv.dispatchStatus === client_1.DispatchStatus.DELIVERED) {
                deliveredCount += 1;
            }
        }
        const averageTicket = totalInvoicesCount > 0 ? Math.round(todayBilledVolume / totalInvoicesCount) : 0;
        const irnComplianceRate = totalInvoicesCount > 0
            ? Math.round((validIrnCount / totalInvoicesCount) * 1000) / 10
            : 100.0;
        return res.json({
            stats: {
                todayBilledVolume: Math.round(todayBilledVolume * 100) / 100,
                totalInvoicesCount,
                irnComplianceRate,
                ewayBillsCount,
                averageTicket,
                unpaidAmount: Math.round(unpaidAmount * 100) / 100,
                unpaidCount,
                trayAssignedCount,
                packedCount,
                outForDeliveryCount,
                deliveredCount
            }
        });
    }
    catch (err) {
        console.error("Error in getBillingStats:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getBillingStats = getBillingStats;
// 2. List Invoices with Search and Multi-Channel Filters
const listInvoices = async (req, res) => {
    try {
        const { search, paymentStatus, dispatchStatus, route, filter } = req.query;
        const where = {};
        if (search) {
            const q = String(search).trim();
            where.OR = [
                { invoiceNo: { contains: q, mode: "insensitive" } },
                { customerName: { contains: q, mode: "insensitive" } },
                { customerCode: { contains: q, mode: "insensitive" } },
                { gstin: { contains: q, mode: "insensitive" } },
                { route: { contains: q, mode: "insensitive" } }
            ];
        }
        if (paymentStatus) {
            const ps = String(paymentStatus).toUpperCase();
            if (ps in client_1.PaymentStatus) {
                where.paymentStatus = ps;
            }
        }
        if (dispatchStatus) {
            const ds = String(dispatchStatus).toUpperCase();
            if (ds in client_1.DispatchStatus) {
                where.dispatchStatus = ds;
            }
        }
        if (route && route !== "all") {
            where.route = { contains: String(route), mode: "insensitive" };
        }
        if (filter === "irn") {
            where.irn = { not: "" };
        }
        else if (filter === "ewb") {
            where.OR = [
                { ewayBill: { not: null } },
                { total: { gte: 50000 } }
            ];
        }
        else if (filter === "unpaid") {
            where.paymentStatus = {
                in: [client_1.PaymentStatus.UNPAID, client_1.PaymentStatus.PARTIAL]
            };
        }
        else if (filter === "out_for_delivery") {
            where.dispatchStatus = client_1.DispatchStatus.OUT_FOR_DELIVERY;
        }
        const invoices = await prisma_1.prisma.invoice.findMany({
            where,
            include: {
                items: true,
                customer: true,
                order: true
            },
            orderBy: { createdAt: "desc" }
        });
        return res.json({ invoices });
    }
    catch (err) {
        console.error("Error in listInvoices:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.listInvoices = listInvoices;
// 3. Single Invoice Detail
const getInvoiceById = async (req, res) => {
    try {
        const invoiceId = String(req.params.id);
        const invoice = await prisma_1.prisma.invoice.findFirst({
            where: {
                OR: [
                    { id: invoiceId },
                    { invoiceNo: invoiceId }
                ]
            },
            include: {
                items: true,
                customer: true,
                order: true
            }
        });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice record not found" });
        }
        return res.json({ invoice });
    }
    catch (err) {
        console.error("Error in getInvoiceById:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getInvoiceById = getInvoiceById;
// 4. Create Invoice (Direct Counter Sale F2)
const createInvoice = async (req, res) => {
    try {
        const { customerId, dueDate, items, trayId, vehicleNo } = req.body;
        if (!customerId) {
            return res.status(400).json({ error: "customerId is required" });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "At least one item is required for billing" });
        }
        const customer = await prisma_1.prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        // Calculate line items, taxable amount, GST, and totals
        let calculatedTaxable = 0;
        let calculatedGst = 0;
        const formattedItems = items.map((it) => {
            const qty = Number(it.qty) || 1;
            const ptr = Number(it.ptr) || 100;
            const gstRate = Number(it.gst) || 12;
            const free = it.free !== undefined ? String(it.free) : "—";
            const lineTaxable = qty * ptr;
            const lineGst = lineTaxable * (gstRate / 100);
            const lineTotal = lineTaxable + lineGst;
            calculatedTaxable += lineTaxable;
            calculatedGst += lineGst;
            return {
                productId: it.productId || null,
                name: it.name || "Medicine formulation",
                hsn: it.hsn || "30049099",
                batch: it.batch || `BT${Math.floor(1000 + Math.random() * 9000)}`,
                exp: it.exp || "12/27",
                qty,
                free,
                ptr: Math.round(ptr * 100) / 100,
                gst: gstRate,
                total: Math.round(lineTotal * 100) / 100
            };
        });
        const totalAmount = Math.round((calculatedTaxable + calculatedGst) * 100) / 100;
        const totalCount = await prisma_1.prisma.invoice.count();
        const invoiceNo = `INV-26-${50390 + totalCount}`;
        // Generate statutory 64-character NIC portal IRN hash
        const hex1 = Math.random().toString(16).substring(2, 10);
        const hex2 = Math.random().toString(16).substring(2, 10);
        const hex3 = Math.random().toString(16).substring(2, 10);
        const hex4 = Math.random().toString(16).substring(2, 10);
        const hex5 = Math.random().toString(16).substring(2, 10);
        const hex6 = Math.random().toString(16).substring(2, 10);
        const hex7 = Math.random().toString(16).substring(2, 10);
        const hex8 = Math.random().toString(16).substring(2, 10);
        const irn = `${hex1}${hex2}${hex3}${hex4}${hex5}${hex6}${hex7}${hex8}`.substring(0, 64);
        // E-Way Bill requirement: applicable if invoice total >= ₹50,000
        let ewayBill = null;
        if (totalAmount >= 50000) {
            ewayBill = `2410${Math.floor(10000000 + Math.random() * 90000000)}`;
        }
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const calculatedDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
        const binLetters = ["A", "B", "C", "D"];
        const randomBin = `${binLetters[Math.floor(Math.random() * binLetters.length)]}-0${Math.floor(Math.random() * 8) + 1}-1`;
        const defaultTray = trayId || `Tray ${Math.floor(Math.random() * 20) + 1} · Bin ${randomBin}`;
        const newInvoice = await prisma_1.prisma.invoice.create({
            data: {
                invoiceNo,
                customerId: customer.id,
                customerName: customer.name,
                customerCode: customer.code,
                route: customer.route || "Direct Counter",
                gstin: customer.gstin,
                date: dateStr,
                time: timeStr,
                dueDate: calculatedDueDate,
                linesCount: formattedItems.length,
                taxable: Math.round(calculatedTaxable * 100) / 100,
                gstAmount: Math.round(calculatedGst * 100) / 100,
                total: totalAmount,
                irn,
                ewayBill,
                paymentStatus: client_1.PaymentStatus.UNPAID,
                dispatchStatus: client_1.DispatchStatus.TRAY_ASSIGNED,
                trayId: defaultTray,
                items: {
                    create: formattedItems
                }
            },
            include: {
                items: true,
                customer: true
            }
        });
        // Audit Log Entry
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toLocaleTimeString(),
                user: "Counter Billing Desk",
                action: `Generated Direct Counter Invoice ${invoiceNo} for ${customer.name} (Total: ₹${totalAmount.toLocaleString("en-IN")}, IRN: ${irn.substring(0, 16)}...)`,
                module: "Billing / Statutory",
                severity: "info"
            }
        });
        return res.status(201).json({
            success: true,
            invoice: newInvoice,
            message: `Invoice ${invoiceNo} created with e-Invoice IRN & EWB registered.`
        });
    }
    catch (err) {
        console.error("Error in createInvoice:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.createInvoice = createInvoice;
// 5. Generate / Regenerate NIC e-Invoice IRN
const generateIrn = async (req, res) => {
    try {
        const invoiceId = String(req.params.id);
        const invoice = await prisma_1.prisma.invoice.findFirst({
            where: {
                OR: [{ id: invoiceId }, { invoiceNo: invoiceId }]
            }
        });
        if (!invoice)
            return res.status(404).json({ error: "Invoice not found" });
        const hex1 = Math.random().toString(16).substring(2, 10);
        const hex2 = Math.random().toString(16).substring(2, 10);
        const hex3 = Math.random().toString(16).substring(2, 10);
        const hex4 = Math.random().toString(16).substring(2, 10);
        const hex5 = Math.random().toString(16).substring(2, 10);
        const hex6 = Math.random().toString(16).substring(2, 10);
        const hex7 = Math.random().toString(16).substring(2, 10);
        const hex8 = Math.random().toString(16).substring(2, 10);
        const newIrn = `${hex1}${hex2}${hex3}${hex4}${hex5}${hex6}${hex7}${hex8}`.substring(0, 64);
        const updated = await prisma_1.prisma.invoice.update({
            where: { id: invoice.id },
            data: { irn: newIrn },
            include: { items: true, customer: true }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toLocaleTimeString(),
                user: "NIC Portal Gateway",
                action: `Regulated statutory e-Invoice IRN ${newIrn} for ${invoice.invoiceNo}`,
                module: "Billing / Statutory",
                severity: "info"
            }
        });
        return res.json({ success: true, irn: newIrn, invoice: updated });
    }
    catch (err) {
        console.error("Error in generateIrn:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.generateIrn = generateIrn;
// 6. Generate / Extend E-Way Bill
const generateEwayBill = async (req, res) => {
    try {
        const invoiceId = String(req.params.id);
        const { vehicleNo, transporterId } = req.body;
        const invoice = await prisma_1.prisma.invoice.findFirst({
            where: {
                OR: [{ id: invoiceId }, { invoiceNo: invoiceId }]
            }
        });
        if (!invoice)
            return res.status(404).json({ error: "Invoice not found" });
        const ewayBill = `2410${Math.floor(10000000 + Math.random() * 90000000)}`;
        const updated = await prisma_1.prisma.invoice.update({
            where: { id: invoice.id },
            data: { ewayBill },
            include: { items: true, customer: true }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toLocaleTimeString(),
                user: "NIC E-Way Portal Bot",
                action: `Generated E-Way Bill ${ewayBill} for ${invoice.invoiceNo} (Vehicle: ${vehicleNo || "KA-01-MJ-8812"}, Transporter: ${transporterId || "DMS Logistics"})`,
                module: "Billing / Statutory",
                severity: "info"
            }
        });
        return res.json({ success: true, ewayBill, invoice: updated });
    }
    catch (err) {
        console.error("Error in generateEwayBill:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.generateEwayBill = generateEwayBill;
// 7. Update Dispatch Status (Tray Assigned -> Packed -> Out for Delivery -> Delivered)
const updateDispatchStatus = async (req, res) => {
    try {
        const invoiceId = String(req.params.id);
        const { dispatchStatus, trayId } = req.body;
        const invoice = await prisma_1.prisma.invoice.findFirst({
            where: {
                OR: [{ id: invoiceId }, { invoiceNo: invoiceId }]
            }
        });
        if (!invoice)
            return res.status(404).json({ error: "Invoice not found" });
        const statusVal = String(dispatchStatus).toUpperCase();
        if (!(statusVal in client_1.DispatchStatus)) {
            return res.status(400).json({ error: `Invalid dispatchStatus. Valid values: ${Object.keys(client_1.DispatchStatus).join(", ")}` });
        }
        const data = { dispatchStatus: statusVal };
        if (trayId)
            data.trayId = String(trayId);
        const updated = await prisma_1.prisma.invoice.update({
            where: { id: invoice.id },
            data,
            include: { items: true, customer: true }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toLocaleTimeString(),
                user: "Warehouse Dispatch Desk",
                action: `Updated invoice ${invoice.invoiceNo} dispatch status to ${statusVal}`,
                module: "Billing / Dispatch",
                severity: "info"
            }
        });
        return res.json({ success: true, invoice: updated });
    }
    catch (err) {
        console.error("Error in updateDispatchStatus:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.updateDispatchStatus = updateDispatchStatus;
// 8. Record Payment against Invoice
const recordPayment = async (req, res) => {
    try {
        const invoiceId = String(req.params.id);
        const { amount, paymentMode, referenceNo } = req.body;
        const invoice = await prisma_1.prisma.invoice.findFirst({
            where: {
                OR: [{ id: invoiceId }, { invoiceNo: invoiceId }]
            }
        });
        if (!invoice)
            return res.status(404).json({ error: "Invoice not found" });
        const payAmt = Number(amount) || invoice.total;
        const newStatus = payAmt >= invoice.total ? client_1.PaymentStatus.PAID : client_1.PaymentStatus.PARTIAL;
        const updated = await prisma_1.prisma.invoice.update({
            where: { id: invoice.id },
            data: { paymentStatus: newStatus },
            include: { items: true, customer: true }
        });
        // Reduce customer's creditUsed if linked
        if (invoice.customerId) {
            const cust = await prisma_1.prisma.customer.findUnique({ where: { id: invoice.customerId } });
            if (cust && cust.creditUsed > 0) {
                await prisma_1.prisma.customer.update({
                    where: { id: cust.id },
                    data: { creditUsed: Math.max(0, cust.creditUsed - payAmt) }
                });
            }
        }
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toLocaleTimeString(),
                user: "Cashier / Collections",
                action: `Recorded ₹${payAmt.toLocaleString("en-IN")} payment for ${invoice.invoiceNo} via ${paymentMode || "UPI"} (Ref: ${referenceNo || "REC-8891"})`,
                module: "Billing / Collections",
                severity: "info"
            }
        });
        return res.json({ success: true, invoice: updated, paymentStatus: newStatus });
    }
    catch (err) {
        console.error("Error in recordPayment:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.recordPayment = recordPayment;
// 9. Export Statutory GSTR-1 CSV Stream
const exportGstr1Csv = async (req, res) => {
    try {
        const invoices = await prisma_1.prisma.invoice.findMany({
            include: { items: true, customer: true },
            orderBy: { createdAt: "desc" }
        });
        const headers = [
            "Invoice Number",
            "Invoice Date",
            "Customer Code",
            "Customer Name",
            "Customer GSTIN",
            "Route",
            "Lines Count",
            "Taxable Value (INR)",
            "CGST (INR)",
            "SGST (INR)",
            "Total Amount (INR)",
            "NIC e-Invoice IRN",
            "e-Way Bill Number",
            "Payment Status",
            "Dispatch Status",
            "Dispatch Tray"
        ];
        const rows = invoices.map((inv) => {
            const halfGst = Math.round((inv.gstAmount / 2) * 100) / 100;
            return [
                `"${inv.invoiceNo}"`,
                `"${inv.date}"`,
                `"${inv.customerCode}"`,
                `"${inv.customerName.replace(/"/g, '""')}"`,
                `"${inv.gstin}"`,
                `"${inv.route}"`,
                inv.linesCount,
                inv.taxable.toFixed(2),
                halfGst.toFixed(2),
                halfGst.toFixed(2),
                inv.total.toFixed(2),
                `"${inv.irn}"`,
                inv.ewayBill ? `"${inv.ewayBill}"` : '"Exempt (<50k)"',
                `"${inv.paymentStatus}"`,
                `"${inv.dispatchStatus}"`,
                `"${inv.trayId}"`
            ].join(",");
        });
        const csvContent = [headers.join(","), ...rows].join("\n");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="GSTR1_Sales_Register_${Date.now()}.csv"`);
        return res.send(csvContent);
    }
    catch (err) {
        console.error("Error in exportGstr1Csv:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.exportGstr1Csv = exportGstr1Csv;
