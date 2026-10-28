import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedWarehouse() {
  console.log("Seeding realistic Warehouse Pick Waves & Bins...");

  // Clear existing warehouse waves & items
  await prisma.pickWaveItem.deleteMany();
  await prisma.warehouseWave.deleteMany();

  const waves = [
    {
      trayId: "Tray 14 · Bin C-04-2",
      invoiceNo: "INV-25-50388",
      customerName: "Sri Sai Medicals",
      linesCount: 4,
      totalUnits: 390,
      route: "Route 3",
      vanAssigned: "Van KA-01-MJ-4410",
      weightKg: 14.2,
      boxesCount: 3,
      status: "checking",
      isColdChainRequired: true,
      items: [
        {
          binLocation: "C-04-2",
          productName: "Pantoprazole 40mg",
          pack: "15 tab",
          billedBatch: "PN2502",
          expiryDate: "06/27",
          qty: 100,
          freeQty: "10",
          status: "picked",
          scannedBatch: "PN2502"
        },
        {
          binLocation: "C-05-1",
          productName: "Metformin 500mg SR",
          pack: "10 tab",
          billedBatch: "MF2511",
          expiryDate: "11/27",
          qty: 200,
          freeQty: "—",
          status: "picked",
          scannedBatch: "MF2511"
        },
        {
          binLocation: "A-02-1",
          productName: "Azithromycin 500mg",
          pack: "3 tab",
          billedBatch: "AZ2412",
          expiryDate: "12/26",
          qty: 80,
          freeQty: "8",
          status: "mismatch",
          scannedBatch: "AZ2508",
          mismatchNote: "Scanned batch AZ2508 differs from billed batch AZ2412 (earlier expiry). Swap before sealing."
        },
        {
          binLocation: "Cold-Room-C1",
          productName: "Insulin Glargine Pen 100IU",
          pack: "1 pen",
          billedBatch: "IG2507",
          expiryDate: "07/27",
          qty: 10,
          freeQty: "—",
          isColdChain: true,
          status: "pending"
        }
      ]
    },
    {
      trayId: "Tray 09 · Bin B-01-4",
      invoiceNo: "INV-25-50387",
      customerName: "City Care Pharmacy",
      linesCount: 3,
      totalUnits: 260,
      route: "Route 1",
      vanAssigned: "Van KA-01-MJ-4410",
      weightKg: 9.8,
      boxesCount: 2,
      status: "picking",
      isColdChainRequired: false,
      items: [
        {
          binLocation: "B-01-4",
          productName: "Paracetamol 650mg",
          pack: "15 tab",
          billedBatch: "PC2409",
          expiryDate: "09/27",
          qty: 120,
          freeQty: "12",
          status: "picked",
          scannedBatch: "PC2409"
        },
        {
          binLocation: "B-03-2",
          productName: "Montelukast + Levocet 10mg",
          pack: "10 tab",
          billedBatch: "ML2503",
          expiryDate: "05/27",
          qty: 90,
          freeQty: "6",
          status: "pending"
        },
        {
          binLocation: "A-04-2",
          productName: "Amoxicillin + Clav 625mg",
          pack: "10 tab",
          billedBatch: "AC2504",
          expiryDate: "04/27",
          qty: 50,
          freeQty: "5",
          status: "pending"
        }
      ]
    },
    {
      trayId: "Tray 04 · Bin D-02-3",
      invoiceNo: "INV-25-50385",
      customerName: "Apollo Medics Hub",
      linesCount: 2,
      totalUnits: 450,
      route: "Route 2",
      vanAssigned: "Van KA-02-AB-3391",
      weightKg: 18.5,
      boxesCount: 4,
      status: "sealed",
      isColdChainRequired: false,
      items: [
        {
          binLocation: "D-02-3",
          productName: "Telmisartan 40mg",
          pack: "10 tab",
          billedBatch: "TL2411",
          expiryDate: "10/26",
          qty: 300,
          freeQty: "30",
          status: "picked",
          scannedBatch: "TL2411"
        },
        {
          binLocation: "D-03-1",
          productName: "Atorvastatin 20mg",
          pack: "10 tab",
          billedBatch: "AT2501",
          expiryDate: "01/27",
          qty: 150,
          freeQty: "15",
          status: "picked",
          scannedBatch: "AT2501"
        }
      ]
    },
    {
      trayId: "Tray 21 · Cold-Box-02",
      invoiceNo: "INV-25-50392",
      customerName: "Arogya Nursing Home",
      linesCount: 2,
      totalUnits: 40,
      route: "Hospital Express Beat",
      vanAssigned: "Reefer Van KA-04-MH-2009",
      weightKg: 6.4,
      boxesCount: 1,
      status: "checking",
      isColdChainRequired: true,
      items: [
        {
          binLocation: "Cold-Room-C2",
          productName: "Human Albumin 20% 100ml",
          pack: "1 vial",
          billedBatch: "HA2509",
          expiryDate: "09/27",
          qty: 15,
          freeQty: "—",
          isColdChain: true,
          status: "picked",
          scannedBatch: "HA2509"
        },
        {
          binLocation: "Cold-Room-C1",
          productName: "Erythropoietin 4000IU",
          pack: "1 prefilled syringe",
          billedBatch: "EP2505",
          expiryDate: "05/27",
          qty: 25,
          freeQty: "2",
          isColdChain: true,
          status: "pending"
        }
      ]
    },
    {
      trayId: "Tray 18 · Bin A-01-1",
      invoiceNo: "INV-25-50379",
      customerName: "Lifecare Chemists",
      linesCount: 2,
      totalUnits: 250,
      route: "Route 3",
      vanAssigned: "Van KA-01-MJ-4410",
      weightKg: 12.0,
      boxesCount: 2,
      status: "dispatched",
      isColdChainRequired: false,
      items: [
        {
          binLocation: "A-01-1",
          productName: "Cefixime 200mg",
          pack: "10 tab",
          billedBatch: "CF2502",
          expiryDate: "02/27",
          qty: 100,
          freeQty: "10",
          status: "picked",
          scannedBatch: "CF2502"
        },
        {
          binLocation: "A-03-2",
          productName: "Omeprazole 20mg",
          pack: "15 cap",
          billedBatch: "OM2410",
          expiryDate: "10/26",
          qty: 150,
          freeQty: "15",
          status: "picked",
          scannedBatch: "OM2410"
        }
      ]
    }
  ];

  for (const w of waves) {
    const { items, ...waveData } = w;
    const createdWave = await prisma.warehouseWave.create({
      data: waveData
    });

    for (const item of items) {
      await prisma.pickWaveItem.create({
        data: {
          waveId: createdWave.id,
          ...item
        }
      });
    }
  }

  console.log(`Successfully seeded ${waves.length} warehouse pick waves with items!`);
}

if (require.main === module) {
  seedWarehouse()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
