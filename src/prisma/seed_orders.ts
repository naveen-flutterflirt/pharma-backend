import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding realistic Order Desk Sales Orders...");

  const customers = await prisma.customer.findMany();
  if (customers.length === 0) {
    console.error("No customers found! Please seed customers first.");
    return;
  }

  const sriSai = customers.find((c) => c.name.includes("Sri Sai")) || customers[0];
  const cityCare = customers.find((c) => c.name.includes("City Care")) || customers[1 % customers.length];
  const arogya = customers.find((c) => c.name.includes("Arogya")) || customers[2 % customers.length];
  const newLife = customers.find((c) => c.name.includes("New Life")) || customers[3 % customers.length];
  const janata = customers.find((c) => c.name.includes("Janata")) || customers[4 % customers.length];
  const apollo = customers.find((c) => c.name.includes("Apollo")) || customers[5 % customers.length];
  const sanjeevani = customers.find((c) => c.name.includes("Sanjeevani")) || customers[6 % customers.length];

  const seedOrders = [
    {
      orderNumber: "SO-2026-8812",
      customer: sriSai,
      channel: "salesman",
      channelLabel: "Salesman: Ravi",
      route: "Route 3",
      creditStatus: "Credit OK",
      creditBlocked: false,
      blockReason: null,
      orderTotal: 62480,
      status: OrderStatus.PENDING,
      schemeSummary: "Amox-Clav 10+1 · Pantoprazole 10+1 · Azithro 10+1",
      freeGoodsValue: 3842,
      items: [
        { name: "Amoxicillin + Clav 625 (10)", batch: "AC2408", exp: "03/27", qty: 60, free: "6", ptr: 162.40, gst: 12, amount: 9744.00, isShort: false, shortNote: null },
        { name: "Pantoprazole 40 (15)", batch: "PN2502", exp: "06/27", qty: 100, free: "10", ptr: 98.10, gst: 12, amount: 9810.00, isShort: false, shortNote: null },
        { name: "Metformin 500 SR (10)", batch: "MF2511", exp: "11/27", qty: 200, free: "—", ptr: 21.30, gst: 12, amount: 4174.80, isShort: false, shortNote: null },
        { name: "Insulin glargine pen", batch: "IG2507", exp: "07/27", qty: 10, free: "—", ptr: 612.00, gst: 5, amount: 6120.00, isShort: false, shortNote: null },
        { name: "Azithromycin 500 (3)", batch: "AZ2412", exp: "12/26", qty: 80, free: "8", ptr: 74.60, gst: 12, amount: 5968.00, isShort: false, shortNote: null },
        { name: "Cefixime 200 (10) — short", batch: "only 40 of 120", exp: "04/27", qty: 40, free: "—", ptr: 88.20, gst: 12, amount: 3528.00, isShort: true, shortNote: "80 strips back-ordered · Auto-billed when next GRN arrives" }
      ]
    },
    {
      orderNumber: "SO-2026-8813",
      customer: cityCare,
      channel: "app",
      channelLabel: "Chemist app",
      route: "Route 1",
      creditStatus: "Credit OK",
      creditBlocked: false,
      blockReason: null,
      orderTotal: 34850,
      status: OrderStatus.PENDING,
      schemeSummary: "Paracetamol 20+2 · Cetirizine 15+1",
      freeGoodsValue: 1250,
      items: [
        { name: "Paracetamol 650 tab (15)", batch: "PC2409", exp: "09/27", qty: 120, free: "12", ptr: 28.50, gst: 12, amount: 3420.00, isShort: false, shortNote: null },
        { name: "Montelukast + Levocet 10", batch: "ML2503", exp: "05/27", qty: 90, free: "6", ptr: 118.00, gst: 12, amount: 10301.40, isShort: false, shortNote: null },
        { name: "Telmisartan 40 (10)", batch: "TL2411", exp: "10/26", qty: 150, free: "—", ptr: 64.20, gst: 12, amount: 9630.00, isShort: false, shortNote: null },
        { name: "Atorvastatin 10 (15)", batch: "AT2501", exp: "01/28", qty: 80, free: "8", ptr: 143.70, gst: 12, amount: 11496.00, isShort: false, shortNote: null }
      ]
    },
    {
      orderNumber: "SO-2026-8814",
      customer: arogya,
      channel: "salesman",
      channelLabel: "Email PO",
      route: "Hospital Route",
      creditStatus: "Special rate",
      creditBlocked: false,
      blockReason: null,
      orderTotal: 48900,
      status: OrderStatus.PENDING,
      schemeSummary: "Institutional Tender Discount (Rate diff claimable from principal)",
      freeGoodsValue: 0,
      items: [
        { name: "Ceftriaxone 1g Inj (Vial)", batch: "CF2410", exp: "08/26", qty: 200, free: "—", ptr: 55.00, gst: 12, amount: 11000.00, isShort: false, shortNote: null },
        { name: "Normal Saline 500ml IV", batch: "NS2504", exp: "04/28", qty: 400, free: "—", ptr: 38.00, gst: 12, amount: 15200.00, isShort: false, shortNote: null },
        { name: "Meropenem 1g Inj", batch: "MR2412", exp: "12/26", qty: 30, free: "—", ptr: 756.60, gst: 12, amount: 22700.00, isShort: false, shortNote: null }
      ]
    },
    {
      orderNumber: "SO-2026-8815",
      customer: newLife,
      channel: "whatsapp",
      channelLabel: "WhatsApp",
      route: "Route 2",
      creditStatus: "Blocked · overdue ₹86K",
      creditBlocked: true,
      blockReason: "Invoice INV-25-47219 is 54 days overdue (>45 days limit).",
      orderTotal: 42100,
      status: OrderStatus.PENDING,
      schemeSummary: "Standard retail scheme",
      freeGoodsValue: 840,
      items: [
        { name: "Rabeprazole 20 + DSR", batch: "RB2501", exp: "02/27", qty: 100, free: "10", ptr: 110.00, gst: 12, amount: 11000.00, isShort: false, shortNote: null },
        { name: "Dolo 650 tab (15)", batch: "DL2502", exp: "07/27", qty: 300, free: "30", ptr: 29.10, gst: 12, amount: 8730.00, isShort: false, shortNote: null },
        { name: "Levocetirizine 5 (10)", batch: "LC2409", exp: "11/26", qty: 250, free: "25", ptr: 34.00, gst: 12, amount: 8500.00, isShort: false, shortNote: null }
      ]
    },
    {
      orderNumber: "SO-2026-8816",
      customer: janata,
      channel: "salesman",
      channelLabel: "Phone",
      route: "Route 4",
      creditStatus: "Licence expires in 12 d",
      creditBlocked: false,
      blockReason: "Drug license 20B/21B renewal pending with State FDA.",
      orderTotal: 28400,
      status: OrderStatus.PENDING,
      schemeSummary: "Amox-Clav 10+1",
      freeGoodsValue: 1400,
      items: [
        { name: "Ciprofloxacin 500 (10)", batch: "CP2411", exp: "10/26", qty: 80, free: "8", ptr: 62.00, gst: 12, amount: 4960.00, isShort: false, shortNote: null },
        { name: "Amoxicillin 500 (10)", batch: "AM2505", exp: "05/27", qty: 120, free: "12", ptr: 71.50, gst: 12, amount: 8580.00, isShort: false, shortNote: null }
      ]
    },
    {
      orderNumber: "SO-2026-8817",
      customer: apollo,
      channel: "app",
      channelLabel: "Retail Portal",
      route: "Route 2",
      creditStatus: "Credit OK",
      creditBlocked: false,
      blockReason: null,
      orderTotal: 92400,
      status: OrderStatus.PENDING,
      schemeSummary: "Rosuvastatin 10+1 · Telmisartan 10+1",
      freeGoodsValue: 4650,
      items: [
        { name: "Rosuvastatin 20 (15)", batch: "RS2502", exp: "08/27", qty: 150, free: "15", ptr: 182.00, gst: 12, amount: 27300.00, isShort: false, shortNote: null },
        { name: "Telmisartan 40 (10)", batch: "TL2411", exp: "10/26", qty: 300, free: "30", ptr: 64.20, gst: 12, amount: 19260.00, isShort: false, shortNote: null },
        { name: "Pantoprazole 40 (15)", batch: "PN2504", exp: "08/27", qty: 200, free: "20", ptr: 98.10, gst: 12, amount: 19620.00, isShort: false, shortNote: null }
      ]
    },
    {
      orderNumber: "SO-2026-8818",
      customer: sanjeevani,
      channel: "whatsapp",
      channelLabel: "WhatsApp OCR",
      route: "Route 5",
      creditStatus: "Credit Limit Exceeded",
      creditBlocked: true,
      blockReason: "Customer credit balance ₹1,25,000 exceeds limit ₹1,00,000.",
      orderTotal: 54900,
      status: OrderStatus.HOLD,
      schemeSummary: "Cefixime 10+1",
      freeGoodsValue: 1058,
      items: [
        { name: "Cefixime 200 (10)", batch: "CF2504", exp: "06/27", qty: 120, free: "12", ptr: 88.20, gst: 12, amount: 10584.00, isShort: false, shortNote: null },
        { name: "Azithromycin 500 (3)", batch: "AZ2503", exp: "03/27", qty: 150, free: "15", ptr: 74.60, gst: 12, amount: 11190.00, isShort: false, shortNote: null }
      ]
    },
    {
      orderNumber: "SO-2026-8819",
      customer: sriSai,
      channel: "salesman",
      channelLabel: "Salesman: Ravi",
      route: "Route 3",
      creditStatus: "Credit OK",
      creditBlocked: false,
      blockReason: null,
      orderTotal: 74500,
      status: OrderStatus.PENDING,
      schemeSummary: "Paracetamol 10+1 · Omeprazole 10+1",
      freeGoodsValue: 1468,
      items: [
        { name: "Paracetamol 650 tab (15)", batch: "PC2411", exp: "11/27", qty: 250, free: "25", ptr: 28.50, gst: 12, amount: 7125.00, isShort: false, shortNote: null },
        { name: "Omeprazole 20 (15)", batch: "OM2501", exp: "01/28", qty: 180, free: "18", ptr: 42.00, gst: 12, amount: 7560.00, isShort: false, shortNote: null }
      ]
    }
  ];

  for (const ord of seedOrders) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber: ord.orderNumber }
    });

    if (existing) {
      await prisma.orderItem.deleteMany({ where: { orderId: existing.id } });
      await prisma.order.update({
        where: { id: existing.id },
        data: {
          customerName: ord.customer.name,
          channel: ord.channel,
          channelLabel: ord.channelLabel,
          route: ord.route,
          creditStatus: ord.creditStatus,
          creditBlocked: ord.creditBlocked,
          blockReason: ord.blockReason,
          orderTotal: ord.orderTotal,
          status: ord.status,
          schemeSummary: ord.schemeSummary,
          freeGoodsValue: ord.freeGoodsValue,
          items: {
            create: ord.items.map((it) => ({
              name: it.name,
              batch: it.batch,
              exp: it.exp,
              qty: it.qty,
              free: it.free,
              ptr: it.ptr,
              gst: it.gst,
              amount: it.amount,
              isShort: it.isShort,
              shortNote: it.shortNote
            }))
          }
        }
      });
      console.log(`Updated order ${ord.orderNumber}`);
    } else {
      await prisma.order.create({
        data: {
          orderNumber: ord.orderNumber,
          customerId: ord.customer.id,
          customerName: ord.customer.name,
          channel: ord.channel,
          channelLabel: ord.channelLabel,
          route: ord.route,
          creditStatus: ord.creditStatus,
          creditBlocked: ord.creditBlocked,
          blockReason: ord.blockReason,
          orderTotal: ord.orderTotal,
          status: ord.status,
          schemeSummary: ord.schemeSummary,
          freeGoodsValue: ord.freeGoodsValue,
          items: {
            create: ord.items.map((it) => ({
              name: it.name,
              batch: it.batch,
              exp: it.exp,
              qty: it.qty,
              free: it.free,
              ptr: it.ptr,
              gst: it.gst,
              amount: it.amount,
              isShort: it.isShort,
              shortNote: it.shortNote
            }))
          }
        }
      });
      console.log(`Created order ${ord.orderNumber}`);
    }
  }

  const count = await prisma.order.count();
  console.log(`✅ Order seeding complete. Total orders in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("Error seeding orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
