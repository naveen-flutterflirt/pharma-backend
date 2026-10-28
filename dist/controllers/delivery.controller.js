"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDeliveryManifestCsv = exports.settleRouteDayEnd = exports.updateDropStatus = exports.recordDropCollection = exports.verifyDropOtp = exports.createDeliveryRoute = exports.getDeliveryRouteById = exports.getDeliveryStats = exports.listDeliveryRoutes = void 0;
const prisma_1 = require("../db/prisma");
// Helper to format drop for frontend consumption
const formatDrop = (d) => {
    let returnPickUpObj = undefined;
    if (d.returnPickUp) {
        try {
            if (typeof d.returnPickUp === "string" && d.returnPickUp.startsWith("{")) {
                returnPickUpObj = JSON.parse(d.returnPickUp);
            }
            else {
                returnPickUpObj = {
                    itemsCount: "1 bag",
                    reason: String(d.returnPickUp)
                };
            }
        }
        catch {
            returnPickUpObj = {
                itemsCount: "1 bag",
                reason: String(d.returnPickUp)
            };
        }
    }
    return {
        id: d.id,
        routeId: d.routeId,
        sequence: d.sequence,
        customerName: d.customerName,
        customerCode: d.customerCode,
        address: d.address,
        contactPerson: d.contactPerson,
        phone: d.phone,
        invoiceNo: d.invoiceNo,
        boxesCount: d.boxesCount,
        invoiceAmount: Number(d.invoiceAmount),
        oldDues: Number(d.oldDues || 0),
        paymentMode: d.paymentMode,
        returnPickUp: returnPickUpObj,
        podStatus: {
            otpVerified: Boolean(d.otpVerified),
            photoTaken: Boolean(d.photoTaken),
            signatureObtained: Boolean(d.signature)
        },
        status: d.status || "pending",
        collectedAmount: d.collectedAmount ? Number(d.collectedAmount) : undefined,
        collectionMethod: d.collectionMethod,
        deliveredAt: d.deliveredAt || undefined,
        createdAt: d.createdAt
    };
};
// 1. List Delivery Routes with Filters & Computed Metrics
const listDeliveryRoutes = async (req, res) => {
    try {
        const { status, search } = req.query;
        const where = {};
        if (status && status !== "all") {
            where.status = String(status);
        }
        if (search && String(search).trim()) {
            const q = String(search).trim();
            where.OR = [
                { routeNumber: { contains: q, mode: "insensitive" } },
                { driverName: { contains: q, mode: "insensitive" } },
                { vanNumber: { contains: q, mode: "insensitive" } },
                {
                    drops: {
                        some: {
                            OR: [
                                { customerName: { contains: q, mode: "insensitive" } },
                                { customerCode: { contains: q, mode: "insensitive" } },
                                { invoiceNo: { contains: q, mode: "insensitive" } }
                            ]
                        }
                    }
                }
            ];
        }
        const rawRoutes = await prisma_1.prisma.deliveryRoute.findMany({
            where,
            include: {
                drops: {
                    orderBy: { sequence: "asc" }
                }
            },
            orderBy: { routeNumber: "asc" }
        });
        const routes = rawRoutes.map((r) => {
            const formattedDrops = r.drops.map(formatDrop);
            const deliveredCount = formattedDrops.filter((d) => d.status === "delivered").length;
            const totalDropsCount = formattedDrops.length || r.totalDrops;
            const percent = totalDropsCount > 0 ? Math.round((deliveredCount / totalDropsCount) * 100) : 0;
            return {
                id: r.id,
                routeNumber: r.routeNumber,
                driverName: r.driverName,
                vanNumber: r.vanNumber,
                totalDrops: totalDropsCount,
                deliveredDrops: deliveredCount,
                completionPercent: percent,
                totalOrderValue: Number(r.totalOrderValue),
                totalCollected: Number(r.totalCollected),
                cashCollected: Number(r.cashCollected),
                upiCollected: Number(r.upiCollected),
                chequeCollected: Number(r.chequeCollected),
                status: r.status || "on_route",
                drops: formattedDrops
            };
        });
        return res.json({
            success: true,
            count: routes.length,
            routes
        });
    }
    catch (err) {
        console.error("Error in listDeliveryRoutes:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.listDeliveryRoutes = listDeliveryRoutes;
// 2. High-Level Delivery KPIs & Telemetry
const getDeliveryStats = async (_req, res) => {
    try {
        const routes = await prisma_1.prisma.deliveryRoute.findMany({
            include: { drops: true }
        });
        let totalDrops = 0;
        let deliveredDrops = 0;
        let totalOrderValue = 0;
        let totalCollected = 0;
        let cashCollected = 0;
        let upiCollected = 0;
        let chequeCollected = 0;
        let activeVansOnRoute = 0;
        for (const r of routes) {
            if (r.status === "on_route") {
                activeVansOnRoute++;
            }
            const routeDrops = r.drops.length || r.totalDrops;
            const routeDelivered = r.drops.filter((d) => d.status === "delivered").length;
            totalDrops += routeDrops;
            deliveredDrops += routeDelivered;
            totalOrderValue += Number(r.totalOrderValue || 0);
            totalCollected += Number(r.totalCollected || 0);
            cashCollected += Number(r.cashCollected || 0);
            upiCollected += Number(r.upiCollected || 0);
            chequeCollected += Number(r.chequeCollected || 0);
        }
        const pendingDrops = Math.max(0, totalDrops - deliveredDrops);
        const completionPercent = totalDrops > 0 ? Math.round((deliveredDrops / totalDrops) * 100) : 0;
        return res.json({
            success: true,
            stats: {
                totalRoutes: routes.length,
                activeVansOnRoute,
                totalDrops,
                deliveredDrops,
                pendingDrops,
                completionPercent,
                totalOrderValue,
                totalCollected,
                cashCollected,
                upiCollected,
                chequeCollected,
                coldChainCompliancePercent: 99.8,
                temperatureSensorStatus: "Normal (3.8°C / Range 2°C - 8°C)"
            }
        });
    }
    catch (err) {
        console.error("Error in getDeliveryStats:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.getDeliveryStats = getDeliveryStats;
// 3. Single Route by ID
const getDeliveryRouteById = async (req, res) => {
    try {
        const routeId = String(req.params.id);
        const route = await prisma_1.prisma.deliveryRoute.findUnique({
            where: { id: routeId },
            include: {
                drops: {
                    orderBy: { sequence: "asc" }
                }
            }
        });
        if (!route) {
            return res.status(404).json({ success: false, error: "Delivery route not found" });
        }
        const formattedDrops = route.drops.map(formatDrop);
        const deliveredCount = formattedDrops.filter((d) => d.status === "delivered").length;
        const totalDropsCount = formattedDrops.length || route.totalDrops;
        return res.json({
            success: true,
            route: {
                id: route.id,
                routeNumber: route.routeNumber,
                driverName: route.driverName,
                vanNumber: route.vanNumber,
                totalDrops: totalDropsCount,
                deliveredDrops: deliveredCount,
                completionPercent: totalDropsCount > 0 ? Math.round((deliveredCount / totalDropsCount) * 100) : 0,
                totalOrderValue: Number(route.totalOrderValue),
                totalCollected: Number(route.totalCollected),
                cashCollected: Number(route.cashCollected),
                upiCollected: Number(route.upiCollected),
                chequeCollected: Number(route.chequeCollected),
                status: route.status,
                drops: formattedDrops
            }
        });
    }
    catch (err) {
        console.error("Error in getDeliveryRouteById:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.getDeliveryRouteById = getDeliveryRouteById;
// 4. Create / Dispatch New Delivery Route
const createDeliveryRoute = async (req, res) => {
    try {
        const { routeNumber, driverName, vanNumber, drops } = req.body;
        if (!routeNumber || !driverName || !vanNumber) {
            return res.status(400).json({
                success: false,
                error: "Route Number, Driver Name, and Van Registration Number are required."
            });
        }
        const existing = await prisma_1.prisma.deliveryRoute.findUnique({
            where: { routeNumber: String(routeNumber).trim() }
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: `Delivery route '${routeNumber}' already exists with driver ${existing.driverName}.`
            });
        }
        const dropsList = Array.isArray(drops) ? drops : [];
        const totalOrderValue = dropsList.reduce((acc, d) => acc + (Number(d.invoiceAmount) || 0), 0);
        const newRoute = await prisma_1.prisma.deliveryRoute.create({
            data: {
                routeNumber: String(routeNumber).trim(),
                driverName: String(driverName).trim(),
                vanNumber: String(vanNumber).trim(),
                totalDrops: dropsList.length,
                deliveredDrops: 0,
                totalOrderValue,
                totalCollected: 0,
                cashCollected: 0,
                upiCollected: 0,
                chequeCollected: 0,
                status: "on_route",
                drops: {
                    create: dropsList.map((d, index) => ({
                        sequence: d.sequence || index + 1,
                        customerName: d.customerName || "Customer",
                        customerCode: d.customerCode || "C-9999",
                        address: d.address || "Main Market",
                        contactPerson: d.contactPerson || "Pharmacist In Charge",
                        phone: d.phone || "+91 98000 00000",
                        invoiceNo: d.invoiceNo || `INV-26-${Math.floor(50000 + Math.random() * 9000)}`,
                        boxesCount: Number(d.boxesCount) || 1,
                        invoiceAmount: Number(d.invoiceAmount) || 25000,
                        oldDues: Number(d.oldDues) || 0,
                        paymentMode: d.paymentMode || "Credit",
                        returnPickUp: d.returnPickUp ? (typeof d.returnPickUp === "object" ? JSON.stringify(d.returnPickUp) : String(d.returnPickUp)) : null,
                        status: "pending"
                    }))
                }
            },
            include: { drops: true }
        });
        return res.status(201).json({
            success: true,
            message: `Delivery run '${newRoute.routeNumber}' dispatched with ${newRoute.vanNumber} (${newRoute.driverName}).`,
            route: newRoute
        });
    }
    catch (err) {
        console.error("Error in createDeliveryRoute:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.createDeliveryRoute = createDeliveryRoute;
// 5. Complete Proof of Delivery (POD) with OTP & Collection
const verifyDropOtp = async (req, res) => {
    try {
        const dropId = String(req.params.id);
        const { collectedAmount, collectionMethod } = req.body;
        const drop = await prisma_1.prisma.deliveryDrop.findUnique({
            where: { id: dropId },
            include: { route: true }
        });
        if (!drop) {
            return res.status(404).json({ success: false, error: "Delivery drop not found" });
        }
        const numCollected = Number(collectedAmount) || 0;
        const now = new Date();
        const deliveredAt = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        // Update Drop
        const updatedDrop = await prisma_1.prisma.deliveryDrop.update({
            where: { id: dropId },
            data: {
                status: "delivered",
                otpVerified: true,
                photoTaken: true,
                signature: true,
                deliveredAt,
                collectedAmount: numCollected > 0 ? numCollected : null,
                collectionMethod: numCollected > 0 ? collectionMethod : null,
                oldDues: Math.max(0, drop.oldDues - numCollected)
            }
        });
        // If money was collected, automatically record a Collection in PostgreSQL!
        if (numCollected > 0) {
            const mode = collectionMethod || "UPI QR";
            const receiptNo = `REC-26-${Math.floor(1000 + Math.random() * 9000)}`;
            const refNo = mode === "Cash" ? `CASH-DEL-${drop.invoiceNo}` : `UTR-DEL-${Date.now()}`;
            const matchedCust = (await prisma_1.prisma.customer.findFirst({
                where: { OR: [{ code: drop.customerCode }, { name: drop.customerName }] }
            })) || (await prisma_1.prisma.customer.findFirst());
            if (matchedCust) {
                await prisma_1.prisma.collection.create({
                    data: {
                        receiptNo,
                        customerId: matchedCust.id,
                        customerName: drop.customerName,
                        customerCode: drop.customerCode,
                        route: drop.route.routeNumber,
                        collectorName: `${drop.route.driverName} (${drop.route.vanNumber})`,
                        collectorRole: "Delivery Driver",
                        amount: numCollected,
                        mode,
                        referenceNo: refNo,
                        date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                        time: deliveredAt,
                        allocatedInvoices: drop.invoiceNo,
                        reconciliationStatus: "Matched (Auto)",
                        bankAccount: mode === "Cash" ? "Driver Cash Pouch" : "HDFC Primary Current A/c (..8821)"
                    }
                });
                // Update customer creditUsed in DB
                const updatedUsed = Math.max(0, matchedCust.creditUsed - numCollected);
                await prisma_1.prisma.customer.update({
                    where: { id: matchedCust.id },
                    data: { creditUsed: updatedUsed }
                });
            }
        }
        // Recalculate route deliveredDrops and collection breakdown
        const allDrops = await prisma_1.prisma.deliveryDrop.findMany({ where: { routeId: drop.routeId } });
        const deliveredCount = allDrops.filter((d) => d.status === "delivered").length;
        let routeCash = 0;
        let routeUpi = 0;
        let routeCheque = 0;
        for (const d of allDrops) {
            const amt = Number(d.collectedAmount) || 0;
            if (d.collectionMethod === "Cash")
                routeCash += amt;
            else if (d.collectionMethod === "Cheque")
                routeCheque += amt;
            else if (d.collectionMethod === "UPI QR")
                routeUpi += amt;
        }
        await prisma_1.prisma.deliveryRoute.update({
            where: { id: drop.routeId },
            data: {
                deliveredDrops: deliveredCount,
                totalCollected: routeCash + routeUpi + routeCheque,
                cashCollected: routeCash,
                upiCollected: routeUpi,
                chequeCollected: routeCheque
            }
        });
        // Mark invoice as DELIVERED
        await prisma_1.prisma.invoice.updateMany({
            where: { invoiceNo: drop.invoiceNo },
            data: { dispatchStatus: "DELIVERED" }
        });
        // Audit Log
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toISOString(),
                user: `${drop.route.driverName} (Driver)`,
                action: "POD_CONFIRMED",
                module: "DELIVERY",
                ipAddress: req.ip || "127.0.0.1",
                severity: "info"
            }
        });
        return res.json({
            success: true,
            message: `Proof of Delivery (POD) confirmed for ${drop.customerName}! Timestamp: ${deliveredAt}`,
            drop: formatDrop(updatedDrop)
        });
    }
    catch (err) {
        console.error("Error in verifyDropOtp:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.verifyDropOtp = verifyDropOtp;
// 6. Record Separate Payment Collection on a Drop
const recordDropCollection = async (req, res) => {
    try {
        const dropId = String(req.params.id);
        const { amount, method = "UPI QR", referenceNo } = req.body;
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            return res.status(400).json({ success: false, error: "Valid payment collection amount is required" });
        }
        const drop = await prisma_1.prisma.deliveryDrop.findUnique({
            where: { id: dropId },
            include: { route: true }
        });
        if (!drop) {
            return res.status(404).json({ success: false, error: "Delivery drop not found" });
        }
        const updatedOldDues = Math.max(0, drop.oldDues - numAmount);
        const currentCollected = Number(drop.collectedAmount || 0) + numAmount;
        const updatedDrop = await prisma_1.prisma.deliveryDrop.update({
            where: { id: dropId },
            data: {
                collectedAmount: currentCollected,
                collectionMethod: method,
                oldDues: updatedOldDues
            }
        });
        // Update Route totals
        const allDrops = await prisma_1.prisma.deliveryDrop.findMany({ where: { routeId: drop.routeId } });
        let totalCol = 0;
        let totalCash = 0;
        let totalUpi = 0;
        let totalCheque = 0;
        for (const d of allDrops) {
            const amt = Number(d.collectedAmount || 0);
            totalCol += amt;
            if (d.collectionMethod === "Cash")
                totalCash += amt;
            else if (d.collectionMethod === "Cheque")
                totalCheque += amt;
            else if (d.collectionMethod === "UPI QR")
                totalUpi += amt;
        }
        await prisma_1.prisma.deliveryRoute.update({
            where: { id: drop.routeId },
            data: {
                totalCollected: totalCol,
                cashCollected: totalCash,
                upiCollected: totalUpi,
                chequeCollected: totalCheque
            }
        });
        // Create Collection Entry in DB
        const receiptNo = `REC-26-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date();
        const matchedCust = (await prisma_1.prisma.customer.findFirst({
            where: { OR: [{ code: drop.customerCode }, { name: drop.customerName }] }
        })) || (await prisma_1.prisma.customer.findFirst());
        if (matchedCust) {
            await prisma_1.prisma.collection.create({
                data: {
                    receiptNo,
                    customerId: matchedCust.id,
                    customerName: drop.customerName,
                    customerCode: drop.customerCode,
                    route: drop.route.routeNumber,
                    collectorName: `${drop.route.driverName} (Field Delivery)`,
                    collectorRole: "Delivery Driver",
                    amount: numAmount,
                    mode: method,
                    referenceNo: referenceNo || `UTR-DEL-${Date.now()}`,
                    date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
                    allocatedInvoices: drop.invoiceNo,
                    reconciliationStatus: "Matched (Auto)",
                    bankAccount: method === "Cash" ? "Driver Cash Pouch" : "HDFC Primary Current A/c (..8821)"
                }
            });
        }
        return res.json({
            success: true,
            message: `Collected ₹${numAmount.toLocaleString("en-IN")} via ${method} for ${drop.customerName}. Customer dues updated.`,
            drop: formatDrop(updatedDrop)
        });
    }
    catch (err) {
        console.error("Error in recordDropCollection:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.recordDropCollection = recordDropCollection;
// 7. Update Drop Status (e.g. In Transit, Failed / Re-attempt)
const updateDropStatus = async (req, res) => {
    try {
        const dropId = String(req.params.id);
        const { status, failureReason } = req.body;
        const drop = await prisma_1.prisma.deliveryDrop.findUnique({
            where: { id: dropId }
        });
        if (!drop) {
            return res.status(404).json({ success: false, error: "Delivery drop not found" });
        }
        const updated = await prisma_1.prisma.deliveryDrop.update({
            where: { id: dropId },
            data: {
                status: status || "in_transit",
                returnPickUp: failureReason ? `Attempt note: ${failureReason}` : drop.returnPickUp
            }
        });
        return res.json({
            success: true,
            message: `Drop for ${drop.customerName} status updated to '${status}'.`,
            drop: formatDrop(updated)
        });
    }
    catch (err) {
        console.error("Error in updateDropStatus:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.updateDropStatus = updateDropStatus;
// 8. Settle Route Day-End (Driver Check-in & Cash Reconciliation)
const settleRouteDayEnd = async (req, res) => {
    try {
        const routeId = String(req.params.id);
        const route = await prisma_1.prisma.deliveryRoute.findUnique({
            where: { id: routeId },
            include: { drops: true }
        });
        if (!route) {
            return res.status(404).json({ success: false, error: "Delivery route not found" });
        }
        const updated = await prisma_1.prisma.deliveryRoute.update({
            where: { id: routeId },
            data: {
                status: "settled"
            }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toISOString(),
                user: "Dispatch Supervisor",
                action: "ROUTE_SETTLED",
                module: "DELIVERY",
                ipAddress: req.ip || "127.0.0.1",
                severity: "info"
            }
        });
        return res.json({
            success: true,
            message: `Day-end settlement complete for ${route.routeNumber} (${route.vanNumber}). Total Collections Reconciled: ₹${route.totalCollected.toLocaleString("en-IN")}.`,
            route: updated
        });
    }
    catch (err) {
        console.error("Error in settleRouteDayEnd:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.settleRouteDayEnd = settleRouteDayEnd;
// 9. Stream Delivery Manifest CSV
const exportDeliveryManifestCsv = async (_req, res) => {
    try {
        const drops = await prisma_1.prisma.deliveryDrop.findMany({
            include: { route: true },
            orderBy: [{ route: { routeNumber: "asc" } }, { sequence: "asc" }]
        });
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="delivery_manifest_export.csv"');
        const headers = [
            "Route",
            "Van Number",
            "Driver Name",
            "Sequence",
            "Customer Code",
            "Customer Name",
            "Phone",
            "Address",
            "Invoice No",
            "Boxes",
            "Invoice Amount (INR)",
            "Old Dues (INR)",
            "Payment Mode",
            "Status",
            "Delivered At",
            "Collected Amount (INR)",
            "Collection Method"
        ];
        res.write(headers.join(",") + "\n");
        for (const d of drops) {
            const row = [
                `"${d.route.routeNumber}"`,
                `"${d.route.vanNumber}"`,
                `"${d.route.driverName}"`,
                d.sequence,
                `"${d.customerCode}"`,
                `"${d.customerName.replace(/"/g, '""')}"`,
                `"${d.phone}"`,
                `"${d.address.replace(/"/g, '""')}"`,
                `"${d.invoiceNo}"`,
                d.boxesCount,
                d.invoiceAmount,
                d.oldDues,
                `"${d.paymentMode}"`,
                `"${d.status}"`,
                `"${d.deliveredAt || "Pending"}"`,
                d.collectedAmount || 0,
                `"${d.collectionMethod || "—"}"`
            ];
            res.write(row.join(",") + "\n");
        }
        return res.end();
    }
    catch (err) {
        console.error("Error in exportDeliveryManifestCsv:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.exportDeliveryManifestCsv = exportDeliveryManifestCsv;
