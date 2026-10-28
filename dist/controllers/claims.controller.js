"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClaim = exports.settleClaim = exports.updateClaimStatus = exports.createClaim = exports.getClaimById = exports.getClaims = exports.exportClaimsCsv = exports.getClaimsStats = void 0;
const prisma_1 = require("../db/prisma");
// Summary metrics for categories and SLAs
const getClaimsStats = async (_req, res) => {
    try {
        const claims = await prisma_1.prisma.claim.findMany();
        let expiryReturns = 0;
        let rateDifference = 0;
        let schemeReimbursement = 0;
        let breakageDamage = 0;
        let priceDropProtection = 0;
        let overdueCount = 0;
        let overdueAmount = 0;
        let totalSettled = 0;
        let totalPending = 0;
        for (const c of claims) {
            const typeLower = c.type.toLowerCase();
            if (typeLower.includes("expiry")) {
                expiryReturns += c.amount;
            }
            else if (typeLower.includes("rate diff")) {
                rateDifference += c.amount;
            }
            else if (typeLower.includes("scheme")) {
                schemeReimbursement += c.amount;
            }
            else if (typeLower.includes("breakage") || typeLower.includes("damage")) {
                breakageDamage += c.amount;
            }
            else if (typeLower.includes("price-drop") || typeLower.includes("price drop")) {
                priceDropProtection += c.amount;
            }
            if (c.ageDays > 60) {
                overdueCount += 1;
                overdueAmount += c.amount;
            }
            if (c.status === "Credit Note Received") {
                totalSettled += c.creditNoteAmount || c.amount;
            }
            else {
                totalPending += c.amount;
            }
        }
        return res.json({
            success: true,
            stats: {
                totalClaims: claims.length,
                totalAmount: claims.reduce((sum, c) => sum + c.amount, 0),
                totalPending,
                totalSettled,
                expiryReturns,
                rateDifference,
                schemeReimbursement,
                breakageDamage,
                priceDropProtection,
                overdueCount,
                overdueAmount
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getClaimsStats = getClaimsStats;
// Export CSV dossier for Principal EDI Reconciliation
const exportClaimsCsv = async (_req, res) => {
    try {
        const claims = await prisma_1.prisma.claim.findMany({
            orderBy: { createdAt: "desc" }
        });
        const headers = [
            "Claim Number",
            "Claim Category",
            "Principal Name",
            "C&F Depot",
            "Claim Amount (INR)",
            "Date Raised",
            "Age (Days)",
            "Settlement Status",
            "Credit Note No",
            "Credit Note Amount (INR)",
            "Batch Details & References",
            "Evidence Files Count",
            "Line Items Count"
        ];
        const escapeCsv = (val) => {
            if (val === null || val === undefined)
                return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };
        const rows = claims.map((c) => [
            escapeCsv(c.claimNo),
            escapeCsv(c.type),
            escapeCsv(c.principalName),
            escapeCsv(c.cnfDepot),
            c.amount.toFixed(2),
            escapeCsv(c.dateRaised),
            c.ageDays,
            escapeCsv(c.status),
            escapeCsv(c.creditNoteNo || "N/A"),
            c.creditNoteAmount ? c.creditNoteAmount.toFixed(2) : "0.00",
            escapeCsv(c.batchDetails),
            c.evidenceFilesCount,
            c.linesCount
        ]);
        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename=claims-dossier-${new Date().toISOString().split("T")[0]}.csv`);
        return res.status(200).send(csvContent);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.exportClaimsCsv = exportClaimsCsv;
// List claims with filters and search
const getClaims = async (req, res) => {
    try {
        const { status, type, principal, search, overdue } = req.query;
        const where = {};
        if (status && status !== "all") {
            where.status = String(status);
        }
        if (type && type !== "all") {
            if (type === "expiry") {
                where.type = { contains: "Expiry", mode: "insensitive" };
            }
            else if (type === "rate_diff") {
                where.type = { contains: "Rate diff", mode: "insensitive" };
            }
            else if (type === "scheme") {
                where.type = { contains: "Scheme", mode: "insensitive" };
            }
            else if (type === "breakage") {
                where.type = { contains: "Breakage", mode: "insensitive" };
            }
            else if (type === "price_drop") {
                where.type = { contains: "Price-drop", mode: "insensitive" };
            }
            else {
                where.type = { equals: String(type), mode: "insensitive" };
            }
        }
        if (principal && principal !== "all") {
            where.principalName = { contains: String(principal), mode: "insensitive" };
        }
        if (overdue === "true") {
            where.ageDays = { gt: 60 };
        }
        if (search && String(search).trim()) {
            const q = String(search).trim();
            where.OR = [
                { claimNo: { contains: q, mode: "insensitive" } },
                { principalName: { contains: q, mode: "insensitive" } },
                { cnfDepot: { contains: q, mode: "insensitive" } },
                { batchDetails: { contains: q, mode: "insensitive" } },
                { type: { contains: q, mode: "insensitive" } },
                { creditNoteNo: { contains: q, mode: "insensitive" } }
            ];
        }
        const claims = await prisma_1.prisma.claim.findMany({
            where,
            orderBy: { createdAt: "desc" }
        });
        return res.json({ claims });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getClaims = getClaims;
// Single claim
const getClaimById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const claim = await prisma_1.prisma.claim.findFirst({
            where: {
                OR: [{ id }, { claimNo: id }]
            }
        });
        if (!claim) {
            return res.status(404).json({ error: "Claim not found" });
        }
        return res.json({ claim });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getClaimById = getClaimById;
// Create new claim
const createClaim = async (req, res) => {
    try {
        const { type, principalName, cnfDepot, amount, batchDetails, linesCount, evidenceFilesCount, dateRaised, status } = req.body;
        if (!type || !principalName || amount === undefined || amount === null) {
            return res.status(400).json({ error: "type, principalName, and amount are required" });
        }
        const claimNo = req.body.claimNo || `CLM-25-${Math.floor(190 + Math.random() * 800)}`;
        const formattedDate = dateRaised || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        const claim = await prisma_1.prisma.claim.create({
            data: {
                claimNo,
                type,
                principalName,
                cnfDepot: cnfDepot || "Regional C&F Depot",
                amount: Number(amount),
                dateRaised: formattedDate,
                batchDetails: batchDetails || "Quarantined stock and debit note reference attached",
                linesCount: Number(linesCount) || 1,
                evidenceFilesCount: Number(evidenceFilesCount) || 2,
                status: status || "Draft",
                ageDays: 0
            }
        });
        // Record audit log
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                    user: "Admin (Logistics)",
                    action: `Raised Principal Claim ${claim.claimNo} for ₹${claim.amount} against ${claim.principalName}`,
                    module: "Claims",
                    severity: "info"
                }
            });
        }
        catch (_) { }
        return res.status(201).json({ success: true, claim });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.createClaim = createClaim;
// Update claim status
const updateClaimStatus = async (req, res) => {
    try {
        const claimId = String(req.params.id);
        const { status, creditNoteNo, creditNoteAmount } = req.body;
        if (!status) {
            return res.status(400).json({ error: "status is required" });
        }
        const claim = await prisma_1.prisma.claim.findFirst({
            where: { OR: [{ id: claimId }, { claimNo: claimId }] }
        });
        if (!claim)
            return res.status(404).json({ error: "Claim not found" });
        const updateData = { status };
        if (status === "Credit Note Received") {
            updateData.creditNoteNo = creditNoteNo || `PCN-${Math.floor(1000 + Math.random() * 9000)}`;
            updateData.creditNoteAmount = creditNoteAmount ? Number(creditNoteAmount) : claim.amount;
        }
        const updated = await prisma_1.prisma.claim.update({
            where: { id: claim.id },
            data: updateData
        });
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                    user: "Admin (Logistics)",
                    action: `Updated Claim ${claim.claimNo} status to ${status}`,
                    module: "Claims",
                    severity: "info"
                }
            });
        }
        catch (_) { }
        return res.json({ success: true, claim: updated });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.updateClaimStatus = updateClaimStatus;
// Settle Claim with Credit Note
const settleClaim = async (req, res) => {
    try {
        const claimId = String(req.params.id);
        const { creditNoteNo, creditNoteAmount } = req.body;
        const claim = await prisma_1.prisma.claim.findFirst({
            where: { OR: [{ id: claimId }, { claimNo: claimId }] }
        });
        if (!claim)
            return res.status(404).json({ error: "Claim not found" });
        const updated = await prisma_1.prisma.claim.update({
            where: { id: claim.id },
            data: {
                status: "Credit Note Received",
                creditNoteNo: creditNoteNo || `PCN-${Math.floor(1000 + Math.random() * 9000)}`,
                creditNoteAmount: creditNoteAmount ? Number(creditNoteAmount) : claim.amount
            }
        });
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                    user: "Admin (Logistics)",
                    action: `Settled Claim ${claim.claimNo} against Credit Note ${updated.creditNoteNo} (₹${updated.creditNoteAmount})`,
                    module: "Claims",
                    severity: "info"
                }
            });
        }
        catch (_) { }
        return res.json({
            success: true,
            message: `Claim ${claim.claimNo} settled against Credit Note ${updated.creditNoteNo}`,
            claim: updated
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.settleClaim = settleClaim;
// Delete claim
const deleteClaim = async (req, res) => {
    try {
        const claimId = String(req.params.id);
        const claim = await prisma_1.prisma.claim.findFirst({
            where: { OR: [{ id: claimId }, { claimNo: claimId }] }
        });
        if (!claim)
            return res.status(404).json({ error: "Claim not found" });
        await prisma_1.prisma.claim.delete({ where: { id: claim.id } });
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                    user: "Admin (Logistics)",
                    action: `Deleted Claim ${claim.claimNo} (₹${claim.amount})`,
                    module: "Claims",
                    severity: "warning"
                }
            });
        }
        catch (_) { }
        return res.json({ success: true, message: `Claim ${claim.claimNo} deleted` });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteClaim = deleteClaim;
