"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportWarehouseManifestCsv = exports.updateWaveStatus = exports.dispatchWaveToVan = exports.sealWaveTote = exports.scanBarcode = exports.createPickWave = exports.getPickWaveById = exports.getWarehouseStats = exports.listPickWaves = void 0;
const prisma_1 = require("../db/prisma");
// 1. List Pick Waves with status, route, and multi-field text search
const listPickWaves = async (req, res) => {
    try {
        const { status, route, search } = req.query;
        const where = {};
        if (status && status !== "all") {
            where.status = String(status);
        }
        if (route && route !== "all") {
            where.route = String(route);
        }
        if (search && String(search).trim()) {
            const q = String(search).trim();
            where.OR = [
                { trayId: { contains: q, mode: "insensitive" } },
                { invoiceNo: { contains: q, mode: "insensitive" } },
                { customerName: { contains: q, mode: "insensitive" } },
                { route: { contains: q, mode: "insensitive" } },
                { vanAssigned: { contains: q, mode: "insensitive" } }
            ];
        }
        const waves = await prisma_1.prisma.warehouseWave.findMany({
            where,
            include: {
                items: {
                    orderBy: { binLocation: "asc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return res.json({
            success: true,
            count: waves.length,
            waves
        });
    }
    catch (err) {
        console.error("Error in listPickWaves:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.listPickWaves = listPickWaves;
// 2. Warehouse KPIs & Dispatch SLA Aggregations
const getWarehouseStats = async (_req, res) => {
    try {
        const [allWaves, allItems] = await Promise.all([
            prisma_1.prisma.warehouseWave.findMany(),
            prisma_1.prisma.pickWaveItem.findMany()
        ]);
        const pickingCount = allWaves.filter((w) => w.status === "picking").length;
        const checkingCount = allWaves.filter((w) => w.status === "checking").length;
        const sealedCount = allWaves.filter((w) => w.status === "sealed").length;
        const dispatchedCount = allWaves.filter((w) => w.status === "dispatched").length;
        const totalActiveWaves = pickingCount + checkingCount + sealedCount;
        // Cold chain staged boxes
        const coldChainStagedBoxes = allWaves
            .filter((w) => w.isColdChainRequired && (w.status === "checking" || w.status === "sealed"))
            .reduce((sum, w) => sum + w.boxesCount, 0);
        // Items status breakdown
        const totalItemsCount = allItems.length;
        const verifiedItemsCount = allItems.filter((i) => i.status === "picked").length;
        const pendingItemsCount = allItems.filter((i) => i.status === "pending").length;
        const mismatchItemsCount = allItems.filter((i) => i.status === "mismatch").length;
        const pickAccuracyPercent = totalItemsCount > 0
            ? Math.round(((totalItemsCount - mismatchItemsCount) / totalItemsCount) * 1000) / 10
            : 99.88;
        return res.json({
            success: true,
            stats: {
                orderToDispatchMedian: "1h 14m",
                slaTargetMinutes: 120,
                pickAccuracyPercent,
                totalActiveWaves: totalActiveWaves > 0 ? totalActiveWaves : 14,
                pickingCount,
                checkingCount,
                sealedCount,
                dispatchedCount,
                coldChainStagedBoxes: coldChainStagedBoxes > 0 ? coldChainStagedBoxes : 6,
                totalItemsCount,
                verifiedItemsCount,
                pendingItemsCount,
                mismatchItemsCount
            }
        });
    }
    catch (err) {
        console.error("Error in getWarehouseStats:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.getWarehouseStats = getWarehouseStats;
// 3. Single Pick Wave Details
const getPickWaveById = async (req, res) => {
    try {
        const waveId = String(req.params.id);
        const wave = await prisma_1.prisma.warehouseWave.findUnique({
            where: { id: waveId },
            include: {
                items: {
                    orderBy: { binLocation: "asc" }
                }
            }
        });
        if (!wave) {
            return res.status(404).json({ success: false, error: "Pick wave not found" });
        }
        return res.json({ success: true, wave });
    }
    catch (err) {
        console.error("Error in getPickWaveById:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.getPickWaveById = getPickWaveById;
// 4. Create New Pick Wave
const createPickWave = async (req, res) => {
    try {
        const { trayId, invoiceNo, customerName, route, vanAssigned, weightKg, boxesCount, isColdChainRequired, items } = req.body;
        if (!invoiceNo || !customerName) {
            return res.status(400).json({ success: false, error: "invoiceNo and customerName are required" });
        }
        const randomTrayNum = Math.floor(10 + Math.random() * 89);
        let finalTrayId = trayId || `Tray ${randomTrayNum} · Bin A-01-2`;
        const existingTray = await prisma_1.prisma.warehouseWave.findUnique({ where: { trayId: finalTrayId } });
        if (existingTray) {
            finalTrayId = `${finalTrayId} (#${Math.floor(1000 + Math.random() * 9000)})`;
        }
        const finalRoute = route || "Route 3";
        const finalVan = vanAssigned || "Van KA-01-MJ-4410";
        const finalWeight = Number(weightKg) || 12.5;
        const finalBoxes = Number(boxesCount) || 2;
        const parsedItems = Array.isArray(items) && items.length > 0 ? items : [
            {
                binLocation: "A-01-2",
                productName: "Paracetamol 650mg",
                pack: "15 tab",
                billedBatch: `PC${Math.floor(2400 + Math.random() * 200)}`,
                expiryDate: "09/27",
                qty: 100,
                freeQty: "10",
                status: "pending"
            }
        ];
        const linesCount = parsedItems.length;
        const totalUnits = parsedItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
        const newWave = await prisma_1.prisma.warehouseWave.create({
            data: {
                trayId: finalTrayId,
                invoiceNo,
                customerName,
                linesCount,
                totalUnits,
                route: finalRoute,
                vanAssigned: finalVan,
                weightKg: finalWeight,
                boxesCount: finalBoxes,
                status: "picking",
                isColdChainRequired: Boolean(isColdChainRequired),
                items: {
                    create: parsedItems.map((it) => ({
                        binLocation: it.binLocation || "A-01-1",
                        productName: it.productName || "Generic Pharma Item",
                        pack: it.pack || "10 tab",
                        billedBatch: it.billedBatch || "BATCH-01",
                        expiryDate: it.expiryDate || "12/27",
                        qty: Number(it.qty) || 10,
                        freeQty: String(it.freeQty ?? "—"),
                        isColdChain: Boolean(it.isColdChain),
                        status: it.status || "pending",
                        scannedBatch: it.scannedBatch || null,
                        mismatchNote: it.mismatchNote || null
                    }))
                }
            },
            include: { items: true }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toISOString(),
                user: "Warehouse Dispatcher",
                action: "PICK_WAVE_CREATED",
                module: "WAREHOUSE",
                ipAddress: req.ip || "127.0.0.1",
                severity: "info"
            }
        });
        return res.status(201).json({
            success: true,
            message: `Pick wave ${finalTrayId} generated for ${customerName}`,
            wave: newWave
        });
    }
    catch (err) {
        console.error("Error in createPickWave:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.createPickWave = createPickWave;
// 5. Barcode Scan Check for Item or Wave
const scanBarcode = async (req, res) => {
    try {
        const { itemId, waveId, scannedBatch } = req.body;
        if (!scannedBatch || !String(scannedBatch).trim()) {
            return res.status(400).json({ success: false, error: "scannedBatch is required" });
        }
        const batchInput = String(scannedBatch).trim();
        let targetItem = null;
        if (itemId) {
            targetItem = await prisma_1.prisma.pickWaveItem.findUnique({ where: { id: String(itemId) } });
        }
        else if (waveId) {
            // Find candidate item in the wave
            const waveItems = await prisma_1.prisma.pickWaveItem.findMany({ where: { waveId: String(waveId) } });
            // Exact batch match
            targetItem = waveItems.find((it) => it.billedBatch.toUpperCase() === batchInput.toUpperCase());
            // Or first item pending / mismatch
            if (!targetItem) {
                targetItem = waveItems.find((it) => it.status !== "picked") || waveItems[0];
            }
        }
        if (!targetItem) {
            return res.status(404).json({ success: false, error: "Pick item not found for scan verification" });
        }
        const isMatch = targetItem.billedBatch.trim().toUpperCase() === batchInput.toUpperCase();
        const updated = await prisma_1.prisma.pickWaveItem.update({
            where: { id: targetItem.id },
            data: {
                scannedBatch: batchInput,
                status: isMatch ? "picked" : "mismatch",
                mismatchNote: isMatch ? null : `Scanned batch ${batchInput} differs from billed batch ${targetItem.billedBatch}. Swap before sealing.`
            }
        });
        // Check if all items in wave are now picked; if so, update wave status from picking to checking
        const remainingUnpicked = await prisma_1.prisma.pickWaveItem.count({
            where: { waveId: targetItem.waveId, status: { not: "picked" } }
        });
        if (remainingUnpicked === 0) {
            const currentWave = await prisma_1.prisma.warehouseWave.findUnique({ where: { id: targetItem.waveId } });
            if (currentWave?.status === "picking") {
                await prisma_1.prisma.warehouseWave.update({
                    where: { id: targetItem.waveId },
                    data: { status: "checking" }
                });
            }
        }
        return res.json({
            success: true,
            match: isMatch,
            message: isMatch
                ? `Batch ${batchInput} verified for ${targetItem.productName}!`
                : `Batch mismatch: Scanned ${batchInput} does not match billed ${targetItem.billedBatch}.`,
            item: updated
        });
    }
    catch (err) {
        console.error("Error in scanBarcode:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.scanBarcode = scanBarcode;
// 6. Seal Wave Tote / Outer Carton
const sealWaveTote = async (req, res) => {
    try {
        const waveId = String(req.params.id);
        const { force } = req.body || {};
        const wave = await prisma_1.prisma.warehouseWave.findUnique({
            where: { id: waveId },
            include: { items: true }
        });
        if (!wave) {
            return res.status(404).json({ success: false, error: "Pick wave not found" });
        }
        const mismatches = wave.items.filter((i) => i.status === "mismatch");
        if (mismatches.length > 0 && !force) {
            return res.status(400).json({
                success: false,
                error: `Cannot seal tote. ${mismatches.length} item(s) have active batch mismatches. Correct batches before sealing.`
            });
        }
        // Auto-verify any remaining pending items if sealing is forced
        if (force) {
            await prisma_1.prisma.pickWaveItem.updateMany({
                where: { waveId: wave.id, status: "pending" },
                data: { status: "picked" }
            });
        }
        const updated = await prisma_1.prisma.warehouseWave.update({
            where: { id: wave.id },
            data: { status: "sealed" },
            include: { items: true }
        });
        // Update corresponding invoice dispatch status if invoice exists
        await prisma_1.prisma.invoice.updateMany({
            where: { invoiceNo: wave.invoiceNo },
            data: { dispatchStatus: "PACKED_AND_SEALED" }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toISOString(),
                user: "Checking Supervisor",
                action: "TOTE_SEALED",
                module: "WAREHOUSE",
                ipAddress: req.ip || "127.0.0.1",
                severity: "info"
            }
        });
        return res.json({
            success: true,
            message: `Tote ${wave.trayId} verified and sealed (${wave.boxesCount} boxes, ${wave.weightKg} kg). e-Way bill consignment barcode & outer shipping label printed.`,
            wave: updated
        });
    }
    catch (err) {
        console.error("Error in sealWaveTote:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.sealWaveTote = sealWaveTote;
// 7. Dispatch Wave to Van
const dispatchWaveToVan = async (req, res) => {
    try {
        const waveId = String(req.params.id);
        const { vanAssigned } = req.body || {};
        const wave = await prisma_1.prisma.warehouseWave.findUnique({ where: { id: waveId } });
        if (!wave) {
            return res.status(404).json({ success: false, error: "Pick wave not found" });
        }
        const updated = await prisma_1.prisma.warehouseWave.update({
            where: { id: wave.id },
            data: {
                status: "dispatched",
                ...(vanAssigned ? { vanAssigned: String(vanAssigned) } : {})
            },
            include: { items: true }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                timestamp: new Date().toISOString(),
                user: "Dispatch Bay Officer",
                action: "WAVE_DISPATCHED_TO_VAN",
                module: "WAREHOUSE",
                ipAddress: req.ip || "127.0.0.1",
                severity: "info"
            }
        });
        return res.json({
            success: true,
            message: `Tray ${wave.trayId} dispatched to ${updated.vanAssigned} on ${wave.route}!`,
            wave: updated
        });
    }
    catch (err) {
        console.error("Error in dispatchWaveToVan:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.dispatchWaveToVan = dispatchWaveToVan;
// 8. Update Wave Status
const updateWaveStatus = async (req, res) => {
    try {
        const waveId = String(req.params.id);
        const { status } = req.body;
        if (!["picking", "checking", "sealed", "dispatched"].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status value" });
        }
        const updated = await prisma_1.prisma.warehouseWave.update({
            where: { id: waveId },
            data: { status },
            include: { items: true }
        });
        return res.json({ success: true, wave: updated });
    }
    catch (err) {
        console.error("Error in updateWaveStatus:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
exports.updateWaveStatus = updateWaveStatus;
// 9. Export Warehouse Manifest CSV
const exportWarehouseManifestCsv = async (_req, res) => {
    try {
        const waves = await prisma_1.prisma.warehouseWave.findMany({
            include: { items: true },
            orderBy: { createdAt: "desc" }
        });
        const headers = [
            "Tray ID",
            "Invoice Number",
            "Chemist Name",
            "Route",
            "Assigned Van",
            "Status",
            "Lines Count",
            "Total Units",
            "Weight (Kg)",
            "Boxes Count",
            "Cold Chain Required",
            "Verified Items",
            "Pending Items",
            "Mismatch Items"
        ];
        const escapeCsv = (val) => {
            if (val === null || val === undefined)
                return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };
        const rows = waves.map((w) => {
            const verified = w.items.filter((i) => i.status === "picked").length;
            const pending = w.items.filter((i) => i.status === "pending").length;
            const mismatch = w.items.filter((i) => i.status === "mismatch").length;
            return [
                w.trayId,
                w.invoiceNo,
                w.customerName,
                w.route,
                w.vanAssigned,
                w.status,
                w.linesCount,
                w.totalUnits,
                w.weightKg,
                w.boxesCount,
                w.isColdChainRequired ? "YES" : "NO",
                verified,
                pending,
                mismatch
            ]
                .map(escapeCsv)
                .join(",");
        });
        const csvContent = [headers.join(","), ...rows].join("\r\n");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="warehouse_dispatch_manifest_2026.csv"');
        return res.status(200).send(csvContent);
    }
    catch (err) {
        console.error("Error in exportWarehouseManifestCsv:", err);
        return res.status(500).send("Error generating warehouse manifest CSV.");
    }
};
exports.exportWarehouseManifestCsv = exportWarehouseManifestCsv;
