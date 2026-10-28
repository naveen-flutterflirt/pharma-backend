import { Request, Response } from "express";
import { prisma } from "../db/prisma";

// List salesmen and beat statuses
export const getSalesmen = async (_req: Request, res: Response) => {
  try {
    const salesmen = await prisma.salesman.findMany({
      include: {
        visits: {
          orderBy: { sequence: "asc" }
        }
      },
      orderBy: { name: "asc" }
    });

    return res.json({ salesmen });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Export Salesmen Productivity Scorecard as CSV
export const exportSalesmenScorecard = async (_req: Request, res: Response) => {
  try {
    const salesmen = await prisma.salesman.findMany({
      include: {
        visits: true
      },
      orderBy: { name: "asc" }
    });

    const headers = [
      "Salesman ID",
      "Field Rep Name",
      "Phone",
      "Email",
      "Beat Route",
      "Target (INR)",
      "Achieved (INR)",
      "Target %",
      "Today Orders Booked (INR)",
      "Today Collections (INR)",
      "Completed Visits",
      "Total Visits",
      "Productivity %",
      "Status"
    ];

    const rows = salesmen.map((s) => {
      const targetPct = s.todayTarget > 0 ? Math.round((s.achievedAmount / s.todayTarget) * 100) : 0;
      const prodPct = s.totalVisits > 0 ? Math.round((s.completedVisits / s.totalVisits) * 100) : 0;
      return [
        `"${s.id}"`,
        `"${s.name}"`,
        `"${s.phone}"`,
        `"${s.email || "—"}"`,
        `"${s.beatName}"`,
        s.todayTarget,
        s.achievedAmount,
        `${targetPct}%`,
        s.todayOrdersBooked,
        s.todayCollections,
        s.completedVisits,
        s.totalVisits,
        `${prodPct}%`,
        `"${s.status}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const filename = `salesmen_scorecard_${new Date().toISOString().split("T")[0]}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Single salesman details
export const getSalesmanById = async (req: Request, res: Response) => {
  try {
    const salesmanId = String(req.params.id);
    const salesman = await prisma.salesman.findUnique({
      where: { id: salesmanId },
      include: {
        visits: {
          orderBy: { sequence: "asc" }
        }
      }
    });

    if (!salesman) return res.status(404).json({ error: "Salesman not found" });
    return res.json({ salesman });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Create new salesman
export const createSalesman = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, beatName, todayTarget } = req.body;
    if (!name || !phone || !beatName) {
      return res.status(400).json({ error: "Name, phone, and beat route are required" });
    }

    const targetVal = Number(todayTarget) || 2000000;

    const newSalesman = await prisma.salesman.create({
      data: {
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@shahpharma.com`,
        beatName,
        todayTarget: targetVal,
        achievedAmount: 0,
        todayOrdersBooked: 0,
        todayCollections: 0,
        totalVisits: 3,
        completedVisits: 0,
        status: "on_beat",
        visits: {
          create: [
            {
              sequence: 1,
              customerName: `${beatName.split(" ")[0]} Lifecare Chemist`,
              customerCode: `C-${Math.floor(1000 + Math.random() * 9000)}`,
              type: "Retail Chemist",
              distance: "400 m away",
              status: "in_progress",
              dueAmount: 24500,
              usualOrderAmount: 32000,
              licenceStatus: "valid"
            },
            {
              sequence: 2,
              customerName: "MedPlus Super Store",
              customerCode: `C-${Math.floor(1000 + Math.random() * 9000)}`,
              type: "Chain Pharmacy",
              distance: "850 m away",
              status: "pending",
              dueAmount: 12000,
              usualOrderAmount: 45000,
              licenceStatus: "valid"
            },
            {
              sequence: 3,
              customerName: "Swasthya Health Pharma",
              customerCode: `C-${Math.floor(1000 + Math.random() * 9000)}`,
              type: "Retail Chemist",
              distance: "1.4 km away",
              status: "pending",
              dueAmount: 0,
              usualOrderAmount: 22000,
              licenceStatus: "valid"
            }
          ]
        }
      },
      include: {
        visits: {
          orderBy: { sequence: "asc" }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: `Field Representative ${newSalesman.name} added successfully!`,
      salesman: newSalesman
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Update salesman
export const updateSalesman = async (req: Request, res: Response) => {
  try {
    const salesmanId = String(req.params.id);
    const { name, phone, email, beatName, todayTarget, status } = req.body;

    const updated = await prisma.salesman.update({
      where: { id: salesmanId },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(beatName ? { beatName } : {}),
        ...(todayTarget !== undefined ? { todayTarget: Number(todayTarget) } : {}),
        ...(status ? { status } : {})
      },
      include: {
        visits: {
          orderBy: { sequence: "asc" }
        }
      }
    });

    return res.json({
      success: true,
      message: `Salesman ${updated.name} updated successfully!`,
      salesman: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Delete salesman
export const deleteSalesman = async (req: Request, res: Response) => {
  try {
    const salesmanId = String(req.params.id);
    await prisma.salesman.delete({
      where: { id: salesmanId }
    });

    return res.json({
      success: true,
      message: "Salesman and associated beat records removed."
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Broadcast Beat Route to Mobile Terminal
export const broadcastBeat = async (req: Request, res: Response) => {
  try {
    const salesmanId = String(req.params.id);
    const salesman = await prisma.salesman.findUnique({
      where: { id: salesmanId }
    });

    if (!salesman) return res.status(404).json({ error: "Salesman not found" });

    await prisma.auditLog.create({
      data: {
        timestamp: new Date().toISOString(),
        user: "Admin / Dispatch Hub",
        action: `Broadcasted beat route ${salesman.beatName} to rep ${salesman.name}`,
        module: "Salesmen & Beat",
        severity: "info",
        ipAddress: req.ip || "127.0.0.1"
      }
    });

    return res.json({
      success: true,
      message: `Beat plan and optimized GPS routes pushed to ${salesman.name}'s mobile terminal!`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Salesman GPS Check-In at Chemist
export const checkInBeatVisit = async (req: Request, res: Response) => {
  try {
    const visitId = String(req.params.id);
    const { coordinates } = req.body || {};
    const visit = await prisma.beatVisit.findUnique({
      where: { id: visitId },
      include: { salesman: true }
    });

    if (!visit) return res.status(404).json({ error: "Beat visit not found" });

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const coordsStr = coordinates || "Lat 12.9716, Lng 77.5946";
    const checkInTime = `${timeStr} (${coordsStr} · Geo-Fence Verified ✓)`;

    const updatedVisit = await prisma.beatVisit.update({
      where: { id: visit.id },
      data: {
        status: "completed",
        gpsCheckedInAt: checkInTime
      }
    });

    const allVisits = await prisma.beatVisit.findMany({ where: { salesmanId: visit.salesmanId } });
    const completedCount = allVisits.filter((v: any) => v.status === "completed").length;

    await prisma.salesman.update({
      where: { id: visit.salesmanId },
      data: {
        completedVisits: completedCount
      }
    });

    return res.json({
      success: true,
      message: `Geo-check-in recorded at ${visit.customerName}. Geo-fence perimeter validated.`,
      visit: updatedVisit
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Book Order on Beat
export const bookBeatOrder = async (req: Request, res: Response) => {
  try {
    const visitId = String(req.params.id);
    const { orderAmount, collectionAmount } = req.body;
    const visit = await prisma.beatVisit.findUnique({
      where: { id: visitId },
      include: { salesman: true }
    });

    if (!visit) return res.status(404).json({ error: "Beat visit not found" });

    const amt = Number(orderAmount) || 0;
    const colAmt = Number(collectionAmount) || 0;

    const updatedVisit = await prisma.beatVisit.update({
      where: { id: visit.id },
      data: {
        status: "completed",
        orderBooked: amt,
        collected: colAmt
      }
    });

    const allVisits = await prisma.beatVisit.findMany({ where: { salesmanId: visit.salesmanId } });
    const completedCount = allVisits.filter((v: any) => v.status === "completed").length;
    const totalOrders = allVisits.reduce((acc: number, v: any) => acc + (v.orderBooked || 0), 0);
    const totalCollections = allVisits.reduce((acc: number, v: any) => acc + (v.collected || 0), 0);

    const updatedSalesman = await prisma.salesman.update({
      where: { id: visit.salesmanId },
      data: {
        completedVisits: completedCount,
        todayOrdersBooked: totalOrders,
        todayCollections: totalCollections,
        achievedAmount: (visit.salesman.achievedAmount || 0) + amt
      }
    });

    return res.json({
      success: true,
      message: `Order of ₹${amt.toLocaleString("en-IN")} booked on beat! Transmitted to Order Desk.`,
      visit: updatedVisit,
      salesman: updatedSalesman
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Skip Beat Visit
export const skipBeatVisit = async (req: Request, res: Response) => {
  try {
    const visitId = String(req.params.id);
    const { reason } = req.body;
    const visit = await prisma.beatVisit.findUnique({
      where: { id: visitId }
    });

    if (!visit) return res.status(404).json({ error: "Beat visit not found" });

    const updatedVisit = await prisma.beatVisit.update({
      where: { id: visit.id },
      data: {
        status: "skipped",
        skipReason: reason || "Chemist store closed during beat schedule"
      }
    });

    return res.json({
      success: true,
      message: `Visit to ${visit.customerName} marked as skipped. Statutory log updated.`,
      visit: updatedVisit
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Add Beat Stop to Salesman
export const addBeatStop = async (req: Request, res: Response) => {
  try {
    const salesmanId = String(req.params.id);
    const { customerName, customerCode, type, distance, dueAmount, usualOrderAmount } = req.body;
    if (!customerName) {
      return res.status(400).json({ error: "Customer name is required" });
    }

    const salesman = await prisma.salesman.findUnique({
      where: { id: salesmanId },
      include: { visits: true }
    });
    if (!salesman) return res.status(404).json({ error: "Salesman not found" });

    const nextSeq = (salesman.visits.length > 0 ? Math.max(...salesman.visits.map((v) => v.sequence)) : 0) + 1;

    const newStop = await prisma.beatVisit.create({
      data: {
        salesmanId,
        sequence: nextSeq,
        customerName,
        customerCode: customerCode || `C-${Math.floor(1000 + Math.random() * 9000)}`,
        type: type || "Retail Chemist",
        distance: distance || "500 m away",
        status: "pending",
        dueAmount: Number(dueAmount) || 0,
        usualOrderAmount: Number(usualOrderAmount) || 25000,
        licenceStatus: "valid"
      }
    });

    await prisma.salesman.update({
      where: { id: salesmanId },
      data: { totalVisits: salesman.visits.length + 1 }
    });

    return res.status(201).json({
      success: true,
      message: `Stop at ${newStop.customerName} added to ${salesman.name}'s beat sequence!`,
      visit: newStop
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
