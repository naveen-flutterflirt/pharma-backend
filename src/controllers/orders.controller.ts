import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { OrderStatus, PaymentStatus, DispatchStatus } from "@prisma/client";

// 1. Get Order Desk KPI Stats
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        orderTotal: true,
        status: true,
        creditBlocked: true,
        channel: true,
        freeGoodsValue: true
      }
    });

    let pendingOrdersCount = 0;
    let pendingOrdersValue = 0;
    let creditBlockedCount = 0;
    let creditBlockedValue = 0;
    let todayOrdersCount = orders.length;
    let todayOrdersValue = 0;
    let freeGoodsValueTotal = 0;
    let billedOrdersCount = 0;
    let holdOrdersCount = 0;

    const channelCounts = {
      salesman: 0,
      app: 0,
      whatsapp: 0,
      counter: 0
    };

    for (const o of orders) {
      const tot = Number(o.orderTotal || 0);
      todayOrdersValue += tot;
      freeGoodsValueTotal += Number(o.freeGoodsValue || 0);

      if (o.status === OrderStatus.PENDING) {
        pendingOrdersCount += 1;
        pendingOrdersValue += tot;
      } else if (o.status === OrderStatus.BILLED) {
        billedOrdersCount += 1;
      } else if (o.status === OrderStatus.HOLD) {
        holdOrdersCount += 1;
      }

      if (o.creditBlocked) {
        creditBlockedCount += 1;
        creditBlockedValue += tot;
      }

      const ch = (o.channel || "salesman").toLowerCase();
      if (ch.includes("salesman")) channelCounts.salesman += 1;
      else if (ch.includes("app")) channelCounts.app += 1;
      else if (ch.includes("whatsapp")) channelCounts.whatsapp += 1;
      else channelCounts.counter += 1;
    }

    return res.json({
      stats: {
        pendingOrdersCount,
        pendingOrdersValue: Math.round(pendingOrdersValue * 100) / 100,
        creditBlockedCount,
        creditBlockedValue: Math.round(creditBlockedValue * 100) / 100,
        todayOrdersCount,
        todayOrdersValue: Math.round(todayOrdersValue * 100) / 100,
        freeGoodsValueTotal: Math.round(freeGoodsValueTotal * 100) / 100,
        billedOrdersCount,
        holdOrdersCount,
        channelCounts
      }
    });
  } catch (err: any) {
    console.error("Error in getOrderStats:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 2. List Orders with Channel, Status & Text Filters
export const listOrders = async (req: Request, res: Response) => {
  try {
    const { channel, status, creditBlocked, route, search } = req.query;

    const where: any = {};

    if (channel && channel !== "all") {
      where.channel = { contains: String(channel), mode: "insensitive" };
    }

    if (status && status !== "all") {
      const st = String(status).toUpperCase();
      if (st in OrderStatus) {
        where.status = st as OrderStatus;
      }
    }

    if (creditBlocked !== undefined && creditBlocked !== "all") {
      where.creditBlocked = creditBlocked === "true";
    }

    if (route && route !== "all") {
      where.route = { contains: String(route), mode: "insensitive" };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { orderNumber: { contains: q, mode: "insensitive" } },
        { channelLabel: { contains: q, mode: "insensitive" } },
        { route: { contains: q, mode: "insensitive" } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        customer: true,
        invoice: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ orders });
  } catch (err: any) {
    console.error("Error in listOrders:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 3. Get Single Order by ID or Order Number
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }]
      },
      include: {
        items: true,
        customer: true,
        invoice: true
      }
    });

    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json({ order });
  } catch (err: any) {
    console.error("Error in getOrderById:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 4. Create New Sales Order (Direct Order Booking)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, channel, route, schemeSummary, freeGoodsValue, items } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required for order creation" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Calculate items and total amount
    let calculatedTotal = 0;
    const formattedItems = items.map((it: any) => {
      const qty = Number(it.qty) || 1;
      const ptr = Number(it.ptr) || 100;
      const gstRate = Number(it.gst) || 12;
      const free = it.free !== undefined ? String(it.free) : "—";
      const lineTaxable = qty * ptr;
      const lineGst = lineTaxable * (gstRate / 100);
      const lineTotal = lineTaxable + lineGst;
      calculatedTotal += lineTotal;

      return {
        productId: it.productId || null,
        name: it.name || "Formulation strip",
        batch: it.batch || `BT${Math.floor(1000 + Math.random() * 9000)}`,
        exp: it.exp || "08/28",
        qty,
        free,
        ptr: Math.round(ptr * 100) / 100,
        gst: gstRate,
        amount: Math.round(lineTotal * 100) / 100,
        isShort: Boolean(it.isShort),
        shortNote: it.shortNote || null
      };
    });

    const orderTotal = Math.round(calculatedTotal * 100) / 100;
    const count = await prisma.order.count();
    const orderNumber = `SO-2026-${8820 + count}`;

    // Credit lock rule: check if customer credit limit exceeded or customer status BLOCKED
    let creditBlocked = false;
    let creditStatus = "Credit OK";
    let blockReason: string | null = null;

    if (customer.status === "BLOCKED") {
      creditBlocked = true;
      creditStatus = "Blocked · Overdue";
      blockReason = customer.blockReason || "Customer account locked due to overdue receivables.";
    } else if (customer.creditUsed + orderTotal > customer.creditLimit) {
      creditBlocked = true;
      creditStatus = "Credit Limit Exceeded";
      const excess = Math.round(customer.creditUsed + orderTotal - customer.creditLimit);
      blockReason = `Order total ₹${orderTotal.toLocaleString("en-IN")} exceeds available credit headroom by ₹${excess.toLocaleString("en-IN")}.`;
    }

    const selectedChannel = channel || "salesman";
    let channelLabel = "Salesman Beat";
    if (selectedChannel === "app") channelLabel = "Chemist Portal";
    else if (selectedChannel === "whatsapp") channelLabel = "WhatsApp OCR";
    else if (selectedChannel === "counter") channelLabel = "Counter Direct";

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        customerName: customer.name,
        channel: selectedChannel,
        channelLabel,
        route: route || customer.route || "Route 3",
        creditStatus,
        creditBlocked,
        blockReason,
        orderTotal,
        status: OrderStatus.PENDING,
        schemeSummary: schemeSummary || "Standard Schemes Auto-Applied",
        freeGoodsValue: Number(freeGoodsValue) || 0,
        items: {
          create: formattedItems
        }
      },
      include: {
        items: true,
        customer: true
      }
    });

    await prisma.auditLog.create({
      data: {
        timestamp: new Date().toLocaleTimeString(),
        user: "Order Desk Intake",
        action: `Booked new order ${orderNumber} for ${customer.name} (Total: ₹${orderTotal.toLocaleString("en-IN")}, Channel: ${channelLabel})`,
        module: "Order Desk",
        severity: creditBlocked ? "warning" : "info"
      }
    });

    return res.status(201).json({
      success: true,
      order: newOrder,
      message: `Order ${orderNumber} booked successfully.`
    });
  } catch (err: any) {
    console.error("Error in createOrder:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 5. Toggle Hold / Resume Order
export const toggleHoldOrder = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }]
      }
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    const newStatus = order.status === OrderStatus.HOLD ? OrderStatus.PENDING : OrderStatus.HOLD;
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
      include: { items: true, customer: true }
    });

    await prisma.auditLog.create({
      data: {
        timestamp: new Date().toLocaleTimeString(),
        user: "Order Desk Supervisor",
        action: `${newStatus === OrderStatus.HOLD ? "Placed on HOLD" : "Resumed"} order ${order.orderNumber} (${order.customerName})`,
        module: "Order Desk",
        severity: newStatus === OrderStatus.HOLD ? "warning" : "info"
      }
    });

    return res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Error in toggleHoldOrder:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 6. Manager Override for Credit Lock
export const overrideCreditLock = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    const { note } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }]
      }
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        creditBlocked: false,
        creditStatus: "Credit Override (Approved)",
        blockReason: note ? `Overridden: ${note}` : "Manager Override Authorized"
      },
      include: { items: true, customer: true }
    });

    await prisma.auditLog.create({
      data: {
        timestamp: new Date().toLocaleTimeString(),
        user: "Admin (Director Credit Clearance)",
        action: `Manager Credit Override for ${order.customerName} (${order.orderNumber}): ${note || "Approved with post-dated cheque guarantee"}`,
        module: "Order Desk / Credit Control",
        severity: "warning"
      }
    });

    return res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Error in overrideCreditLock:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 7. Bill & Send to Pick (Generates Invoice, IRN, e-Way Bill & Warehouse Wave)
export const billOrder = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    const { overrideReason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }]
      },
      include: { items: true, customer: true, invoice: true }
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status === OrderStatus.BILLED) {
      return res.status(400).json({ error: "Order has already been billed." });
    }

    if (order.creditBlocked && !overrideReason) {
      return res.status(400).json({
        error: "Cannot bill credit-blocked order without manager authorization override.",
        blockReason: order.blockReason
      });
    }

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

    // Conditional e-Way Bill (> ₹50k)
    let ewayBill: string | null = null;
    if (order.orderTotal >= 50000) {
      ewayBill = `2410${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    const invCount = await prisma.invoice.count();
    const invoiceNo = `INV-26-${50400 + invCount}`;
    const billedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    // Update Order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.BILLED,
        irn,
        ewayBill,
        billedAt,
        creditBlocked: false
      },
      include: { items: true, customer: true }
    });

    const taxable = Math.round((order.orderTotal / 1.12) * 100) / 100;
    const gstAmount = Math.round((order.orderTotal - taxable) * 100) / 100;
    const trayId = `Tray ${Math.floor(10 + Math.random() * 80)} · Bin C-04-2`;

    // Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        customerCode: order.customer.code,
        route: order.route,
        gstin: order.customer.gstin,
        date: dateStr,
        time: billedAt,
        dueDate: "30 Days",
        linesCount: order.items.length,
        taxable,
        gstAmount,
        total: order.orderTotal,
        irn,
        ewayBill,
        paymentStatus: PaymentStatus.UNPAID,
        dispatchStatus: DispatchStatus.TRAY_ASSIGNED,
        trayId,
        items: {
          create: order.items.map((it: any) => ({
            name: it.name,
            batch: it.batch,
            exp: it.exp,
            qty: it.qty,
            free: String(it.free),
            ptr: it.ptr,
            gst: it.gst,
            total: it.amount
          }))
        }
      },
      include: { items: true, customer: true }
    });

    // Create WarehouseWave for pickers if needed
    const existingWave = await prisma.warehouseWave.findFirst({
      where: { invoiceNo }
    });
    if (!existingWave) {
      const totalUnits = order.items.reduce((acc, it) => acc + it.qty, 0);
      await prisma.warehouseWave.create({
        data: {
          trayId,
          invoiceNo,
          customerName: order.customerName,
          linesCount: order.items.length,
          totalUnits,
          route: order.route,
          vanAssigned: `Van KA-01-MJ-${Math.floor(1000 + Math.random() * 9000)}`,
          weightKg: Math.round(totalUnits * 0.04 * 10) / 10,
          boxesCount: Math.ceil(totalUnits / 100),
          status: "picking",
          isColdChainRequired: order.items.some((it) => it.name.toLowerCase().includes("insulin"))
        }
      });
    }

    // Increase customer creditUsed
    await prisma.customer.update({
      where: { id: order.customerId },
      data: {
        creditUsed: { increment: order.orderTotal }
      }
    });

    await prisma.auditLog.create({
      data: {
        timestamp: new Date().toLocaleTimeString(),
        user: "Order Desk Officer",
        action: `Billed & sent to pick: ${order.orderNumber} ➔ ${invoiceNo} (IRN: ${irn.substring(0, 16)}..., Tray: ${trayId})`,
        module: "Order Desk / Billing",
        severity: "info"
      }
    });

    return res.json({
      success: true,
      message: "Order billed successfully! Invoice, NIC IRN, and warehouse pick tote generated.",
      order: updatedOrder,
      invoice,
      irn,
      ewayBill,
      tray: trayId
    });
  } catch (err: any) {
    console.error("Error in billOrder:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 8. Export Orders Register CSV Stream
export const exportOrdersCsv = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, customer: true },
      orderBy: { createdAt: "desc" }
    });

    const headers = [
      "Order Number",
      "Date",
      "Customer Code",
      "Customer Name",
      "Customer GSTIN",
      "Route",
      "Channel",
      "Channel Label",
      "Order Status",
      "Credit Status",
      "Credit Blocked",
      "Lines Count",
      "Order Total (INR)",
      "Free Goods Value (INR)",
      "NIC e-Invoice IRN",
      "e-Way Bill"
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt.toLocaleDateString("en-GB")}"`,
      `"${o.customer?.code || ""}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customer?.gstin || ""}"`,
      `"${o.route}"`,
      `"${o.channel}"`,
      `"${o.channelLabel}"`,
      `"${o.status}"`,
      `"${o.creditStatus}"`,
      o.creditBlocked ? '"Yes"' : '"No"',
      o.items.length,
      o.orderTotal.toFixed(2),
      o.freeGoodsValue.toFixed(2),
      o.irn ? `"${o.irn}"` : '"Not Billed"',
      o.ewayBill ? `"${o.ewayBill}"` : '"—"'
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="Sales_Orders_Register_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (err: any) {
    console.error("Error in exportOrdersCsv:", err);
    return res.status(500).json({ error: err.message });
  }
};
