import { Request, Response } from "express";
import { prisma } from "../db/prisma";

// Helper: Format product with computed stock, daysCover, suggestedPo, and scheme
const formatProduct = (p: any) => {
  const batches = (p.batches || []).map((b: any) => ({
    id: b.id,
    batchNo: b.batchNumber,
    qty: Number(b.qty) || 0,
    exp: b.expDate,
    tag: (b.status as "active" | "push" | "overstock" | "quarantine" | "expired") || "active"
  }));

  const stock = batches.reduce((acc: number, b: any) => acc + b.qty, 0);
  const avgDay = Number(p.avgDailySale) || 20;
  const daysCover = avgDay > 0 ? Math.round((stock / avgDay) * 10) / 10 : 0;

  let suggestedPo: number | string = "—";
  if (daysCover <= 3) {
    const rawPo = Math.max(100, Math.ceil((avgDay * 20 - stock) / 50) * 50);
    suggestedPo = rawPo;
  }

  // Scheme slab qualifier based on stockist standard
  let scheme = "—";
  if (p.name.includes("Amoxicillin") || p.name.includes("Pantoprazole") || p.name.includes("Azithromycin") || p.name.includes("Rosuvastatin")) {
    scheme = "10+1";
  } else if (p.name.includes("Cough") || p.name.includes("Paracetamol")) {
    scheme = "12+2";
  }

  return {
    id: p.id,
    name: p.name,
    principal: p.principal,
    pack: p.pack,
    hsn: p.hsn,
    gstPercent: Number(p.gstPercent) || 12,
    stock,
    avgDay,
    daysCover,
    batches,
    scheme,
    suggestedPo,
    coldChain: Boolean(p.coldChain),
    scheduleH: Boolean(p.scheduleH),
    mrp: Number(p.mrp),
    ptr: Number(p.ptr),
    pts: Number(p.pts),
    binLocation: p.binLocation || "Aisle A · R-01 · B-1",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
};

// 1. Get Product Stock KPI Statistics
export const getProductStats = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { batches: true }
    });

    let totalStockUnits = 0;
    let totalStockValuePts = 0;
    let lowStockCount = 0;
    let nearExpiryCount = 0;
    let overstockCount = 0;
    let coldChainCount = 0;
    let outOfStockCount = 0;

    const principalsSet = new Set<string>();

    for (const p of products) {
      principalsSet.add(p.principal);
      if (p.coldChain) coldChainCount++;

      const formatted = formatProduct(p);
      totalStockUnits += formatted.stock;
      totalStockValuePts += (formatted.stock * formatted.pts);

      if (formatted.stock === 0) {
        outOfStockCount++;
      }
      if (formatted.daysCover <= 3) {
        lowStockCount++;
      }
      if (formatted.daysCover > 45 || formatted.batches.some((b: any) => b.tag === "overstock")) {
        overstockCount++;
      }
      if (formatted.batches.some((b: any) => b.tag === "push" || b.tag === "quarantine")) {
        nearExpiryCount++;
      }
    }

    return res.json({
      stats: {
        totalProducts: products.length,
        totalStockUnits,
        totalStockValuePts: Math.round(totalStockValuePts * 100) / 100,
        totalPrincipalsCount: principalsSet.size,
        lowStockCount,
        nearExpiryCount,
        overstockCount,
        coldChainCount,
        outOfStockCount
      }
    });
  } catch (err: any) {
    console.error("Error in getProductStats:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 2. Get Distinct Principals
export const getDistinctPrincipals = async (req: Request, res: Response) => {
  try {
    const distinct = await prisma.product.findMany({
      select: { principal: true },
      distinct: ["principal"],
      orderBy: { principal: "asc" }
    });

    const principals = ["All", ...distinct.map((d) => d.principal)];
    return res.json({ principals });
  } catch (err: any) {
    console.error("Error in getDistinctPrincipals:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 3. List Products with Batches, Search & Filters
export const listProducts = async (req: Request, res: Response) => {
  try {
    const { search, principal, tab, coldChain, scheduleH } = req.query;
    const where: any = {};

    if (principal && principal !== "All" && principal !== "all") {
      where.principal = { equals: String(principal), mode: "insensitive" };
    }

    if (coldChain !== undefined) {
      where.coldChain = coldChain === "true";
    }

    if (scheduleH !== undefined) {
      where.scheduleH = scheduleH === "true";
    }

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { principal: { contains: q, mode: "insensitive" } },
        { pack: { contains: q, mode: "insensitive" } },
        { hsn: { contains: q, mode: "insensitive" } },
        { binLocation: { contains: q, mode: "insensitive" } },
        {
          batches: {
            some: {
              batchNumber: { contains: q, mode: "insensitive" }
            }
          }
        }
      ];
    }

    const rawProducts = await prisma.product.findMany({
      where,
      include: {
        batches: {
          orderBy: { expDate: "asc" } // FEFO principle
        }
      },
      orderBy: { name: "asc" }
    });

    let products = rawProducts.map(formatProduct);

    // Apply tab filters in application logic
    if (tab && tab !== "all") {
      const t = String(tab).toLowerCase();
      if (t === "low-stock") {
        products = products.filter((p) => p.daysCover <= 3);
      } else if (t === "near-expiry") {
        products = products.filter((p) => p.batches.some((b: any) => b.tag === "push" || b.tag === "quarantine"));
      } else if (t === "overstock") {
        products = products.filter((p) => p.daysCover > 45 || p.batches.some((b: any) => b.tag === "overstock"));
      } else if (t === "cold-chain") {
        products = products.filter((p) => p.coldChain);
      } else if (t === "schedule-h") {
        products = products.filter((p) => p.scheduleH);
      }
    }

    return res.json({ products });
  } catch (err: any) {
    console.error("Error in listProducts:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 4. Get Single Product Details with Batches
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await prisma.product.findUnique({
      where: { id: String(id) },
      include: {
        batches: {
          orderBy: { expDate: "asc" }
        }
      }
    });

    if (!raw) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({ product: formatProduct(raw) });
  } catch (err: any) {
    console.error("Error in getProductById:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 5. Create Product (with optional initial batch)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      principal,
      pack,
      hsn,
      gstPercent,
      mrp,
      ptr,
      pts,
      avgDailySale,
      binLocation,
      coldChain,
      scheduleH,
      initialBatchNumber,
      initialBatchQty,
      initialExpDate
    } = req.body;

    if (!name || !principal || mrp === undefined || ptr === undefined || pts === undefined) {
      return res.status(400).json({ error: "Name, principal, MRP, PTR, and PTS are required" });
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        principal: String(principal).trim(),
        pack: pack || "10 Strips",
        hsn: hsn || "30041010",
        gstPercent: Number(gstPercent) || 12,
        mrp: Number(mrp),
        ptr: Number(ptr),
        pts: Number(pts),
        avgDailySale: Number(avgDailySale) || 20,
        binLocation: binLocation || "Aisle A · R-01 · B-1",
        coldChain: Boolean(coldChain),
        scheduleH: Boolean(scheduleH)
      }
    });

    // Add initial batch if provided
    if (initialBatchNumber && initialBatchQty !== undefined) {
      await prisma.productBatch.create({
        data: {
          productId: product.id,
          batchNumber: String(initialBatchNumber).trim(),
          qty: Number(initialBatchQty) || 0,
          expDate: initialExpDate || "12/28",
          status: "active"
        }
      });
    }

    const created = await prisma.product.findUnique({
      where: { id: product.id },
      include: { batches: true }
    });

    return res.status(201).json({
      success: true,
      message: `Product ${product.name} created successfully!`,
      product: formatProduct(created)
    });
  } catch (err: any) {
    console.error("Error in createProduct:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 6. Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      principal,
      pack,
      hsn,
      gstPercent,
      mrp,
      ptr,
      pts,
      avgDailySale,
      binLocation,
      coldChain,
      scheduleH
    } = req.body;

    const updated = await prisma.product.update({
      where: { id: String(id) },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(principal && { principal: String(principal).trim() }),
        ...(pack && { pack }),
        ...(hsn && { hsn }),
        ...(gstPercent !== undefined && { gstPercent: Number(gstPercent) }),
        ...(mrp !== undefined && { mrp: Number(mrp) }),
        ...(ptr !== undefined && { ptr: Number(ptr) }),
        ...(pts !== undefined && { pts: Number(pts) }),
        ...(avgDailySale !== undefined && { avgDailySale: Number(avgDailySale) }),
        ...(binLocation && { binLocation }),
        ...(coldChain !== undefined && { coldChain: Boolean(coldChain) }),
        ...(scheduleH !== undefined && { scheduleH: Boolean(scheduleH) })
      },
      include: { batches: true }
    });

    return res.json({
      success: true,
      message: `Product ${updated.name} updated successfully!`,
      product: formatProduct(updated)
    });
  } catch (err: any) {
    console.error("Error in updateProduct:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 7. Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id: String(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({ where: { id: String(id) } });

    return res.json({
      success: true,
      message: `Product ${existing.name} deleted successfully.`
    });
  } catch (err: any) {
    console.error("Error in deleteProduct:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 8. Add or Upsert Batch
export const addProductBatch = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.id);
    const { batchNumber, qty, expDate, status } = req.body;

    if (!batchNumber || qty === undefined || !expDate) {
      return res.status(400).json({ error: "batchNumber, qty, and expDate are required" });
    }

    const batch = await prisma.productBatch.upsert({
      where: {
        productId_batchNumber: {
          productId,
          batchNumber: String(batchNumber).trim()
        }
      },
      update: {
        qty: { increment: Number(qty) },
        expDate,
        status: status || "active"
      },
      create: {
        productId,
        batchNumber: String(batchNumber).trim(),
        qty: Number(qty),
        expDate,
        status: status || "active"
      }
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { batches: true }
    });

    return res.json({
      success: true,
      message: `Batch ${batch.batchNumber} updated. Stock adjusted.`,
      batch,
      product: formatProduct(updatedProduct)
    });
  } catch (err: any) {
    console.error("Error in addProductBatch:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 9. Quick Stock Adjustment (Breakage, Physical Audit, Quarantine, Claim)
export const adjustStock = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.id);
    const { batchNumber, adjustmentType, qty, reason, status, expDate } = req.body;

    if (!batchNumber || qty === undefined) {
      return res.status(400).json({ error: "batchNumber and qty are required" });
    }

    const existingBatch = await prisma.productBatch.findUnique({
      where: {
        productId_batchNumber: {
          productId,
          batchNumber: String(batchNumber).trim()
        }
      }
    });

    let newQty = Number(qty);
    if (existingBatch) {
      if (adjustmentType === "add") {
        newQty = existingBatch.qty + Number(qty);
      } else if (adjustmentType === "deduct") {
        newQty = Math.max(0, existingBatch.qty - Number(qty));
      }
    }

    const batch = await prisma.productBatch.upsert({
      where: {
        productId_batchNumber: {
          productId,
          batchNumber: String(batchNumber).trim()
        }
      },
      update: {
        qty: newQty,
        ...(status && { status }),
        ...(expDate && { expDate })
      },
      create: {
        productId,
        batchNumber: String(batchNumber).trim(),
        qty: newQty,
        expDate: expDate || "12/28",
        status: status || "active"
      }
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { batches: true }
    });

    return res.json({
      success: true,
      message: `Stock adjusted for batch ${batch.batchNumber} (${reason || "Physical Audit"}). New quantity: ${newQty}`,
      batch,
      product: formatProduct(updatedProduct)
    });
  } catch (err: any) {
    console.error("Error in adjustStock:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 10. Statutory Stock Statement CSV Export
export const exportProductsCsv = async (req: Request, res: Response) => {
  try {
    const rawProducts = await prisma.product.findMany({
      include: { batches: true },
      orderBy: { name: "asc" }
    });

    const products = rawProducts.map(formatProduct);

    const headers = [
      "Product Name",
      "Principal",
      "Pack",
      "HSN",
      "Stock (Units)",
      "Avg Daily Sale",
      "Days Cover",
      "PTS (INR)",
      "PTR (INR)",
      "MRP (INR)",
      "GST %",
      "Stock Value PTS (INR)",
      "Cold Chain",
      "Schedule H",
      "Bin Location",
      "Batches"
    ];

    const rows = products.map((p) => {
      const batchSummary = p.batches.map((b: any) => `${b.batchNo}:${b.qty}@${b.exp}`).join(" | ");
      const stockVal = p.stock * p.pts;
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.principal.replace(/"/g, '""')}"`,
        `"${p.pack}"`,
        `"${p.hsn}"`,
        p.stock,
        p.avgDay,
        p.daysCover,
        p.pts.toFixed(2),
        p.ptr.toFixed(2),
        p.mrp.toFixed(2),
        p.gstPercent,
        stockVal.toFixed(2),
        p.coldChain ? "Yes" : "No",
        p.scheduleH ? "Yes" : "No",
        `"${p.binLocation.replace(/"/g, '""')}"`,
        `"${batchSummary.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="stock_catalog_manifest_${Date.now()}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (err: any) {
    console.error("Error exporting products CSV:", err);
    return res.status(500).json({ error: "Failed to export products CSV" });
  }
};
