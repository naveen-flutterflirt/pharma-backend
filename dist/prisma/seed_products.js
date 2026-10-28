"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProducts = seedProducts;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedProducts() {
    console.log("Seeding rich realistic pharmaceutical stock catalog & FEFO batches...");
    const productsData = [
        {
            name: "Insulin glargine pen",
            principal: "Principal A (Novartis / Sandoz)",
            pack: "1 pen",
            hsn: "30043110",
            gstPercent: 12,
            mrp: 750.00,
            ptr: 612.00,
            pts: 550.80,
            avgDailySale: 22,
            binLocation: "Cold Room 02 · Rack CR-1",
            coldChain: true,
            scheduleH: false,
            batches: [] // Stockout to demonstrate 0 days cover & suggested PO of 300!
        },
        {
            name: "Amoxicillin + Clav 625",
            principal: "Principal B (Glaxo Regional)",
            pack: "10 tab",
            hsn: "30041010",
            gstPercent: 12,
            mrp: 204.00,
            ptr: 162.40,
            pts: 146.16,
            avgDailySale: 95,
            binLocation: "Aisle C · Rack 04 · Bin 2",
            coldChain: false,
            scheduleH: true,
            batches: [
                { batchNumber: "AC2501", qty: 120, expDate: "08/28", status: "active" }
            ]
        },
        {
            name: "Pantoprazole 40",
            principal: "Principal C (Cipla Stockist)",
            pack: "15 tab",
            hsn: "30049099",
            gstPercent: 12,
            mrp: 125.00,
            ptr: 98.10,
            pts: 88.29,
            avgDailySale: 140,
            binLocation: "Aisle B · Rack 01 · Bin 4",
            coldChain: false,
            scheduleH: false,
            batches: [
                { batchNumber: "PN2502", qty: 300, expDate: "06/28", status: "active" }
            ]
        },
        {
            name: "Azithromycin 500",
            principal: "Principal A (Novartis / Sandoz)",
            pack: "3 tab",
            hsn: "30042010",
            gstPercent: 12,
            mrp: 95.00,
            ptr: 74.60,
            pts: 67.14,
            avgDailySale: 60,
            binLocation: "Aisle A · Rack 03 · Bin 1",
            coldChain: false,
            scheduleH: true,
            batches: [
                { batchNumber: "AZ2412", qty: 220, expDate: "12/26", status: "push" },
                { batchNumber: "AZ2508", qty: 1200, expDate: "08/28", status: "active" }
            ]
        },
        {
            name: "Vitamin D3 60K",
            principal: "Principal A (Novartis / Sandoz)",
            pack: "4 cap",
            hsn: "30045020",
            gstPercent: 12,
            mrp: 140.00,
            ptr: 110.00,
            pts: 99.00,
            avgDailySale: 18,
            binLocation: "Aisle D · Rack 02 · Bin 3",
            coldChain: false,
            scheduleH: false,
            batches: [
                { batchNumber: "VD2502", qty: 2900, expDate: "02/28", status: "overstock" }
            ]
        },
        {
            name: "Cough syrup 100 ml",
            principal: "Principal D (Abbott Care)",
            pack: "1 btl",
            hsn: "30049032",
            gstPercent: 12,
            mrp: 115.00,
            ptr: 89.50,
            pts: 80.55,
            avgDailySale: 35,
            binLocation: "Aisle E · Rack 01 · Bin 2",
            coldChain: false,
            scheduleH: true,
            batches: [
                { batchNumber: "CS2501", qty: 640, expDate: "01/28", status: "active" }
            ]
        },
        {
            name: "Paracetamol 650 tab",
            principal: "Sun Pharma Distributors",
            pack: "15 tab",
            hsn: "30049060",
            gstPercent: 12,
            mrp: 34.50,
            ptr: 28.50,
            pts: 25.65,
            avgDailySale: 180,
            binLocation: "Aisle B · Rack 02 · Bin 1",
            coldChain: false,
            scheduleH: false,
            batches: [
                { batchNumber: "PC2504", qty: 1800, expDate: "10/28", status: "active" }
            ]
        },
        {
            name: "Cefixime 200",
            principal: "Principal B (Glaxo Regional)",
            pack: "10 tab",
            hsn: "30041020",
            gstPercent: 12,
            mrp: 110.00,
            ptr: 88.50,
            pts: 79.38,
            avgDailySale: 75,
            binLocation: "Aisle C · Rack 03 · Bin 4",
            coldChain: false,
            scheduleH: true,
            batches: [
                { batchNumber: "CF2502", qty: 450, expDate: "05/28", status: "active" }
            ]
        },
        {
            name: "Rosuvastatin 10mg",
            principal: "Sun Pharma Distributors",
            pack: "10 tab",
            hsn: "30049081",
            gstPercent: 12,
            mrp: 175.00,
            ptr: 140.00,
            pts: 125.00,
            avgDailySale: 50,
            binLocation: "Aisle A · Rack 05 · Bin 3",
            coldChain: false,
            scheduleH: false,
            batches: [
                { batchNumber: "RS2510", qty: 2400, expDate: "09/28", status: "active" }
            ]
        },
        {
            name: "Telmisartan 40mg",
            principal: "Sun Pharma Distributors",
            pack: "10 tab",
            hsn: "30049085",
            gstPercent: 12,
            mrp: 120.00,
            ptr: 98.00,
            pts: 87.33,
            avgDailySale: 85,
            binLocation: "Aisle A · Rack 04 · Bin 2",
            coldChain: false,
            scheduleH: false,
            batches: [
                { batchNumber: "TL2511", qty: 3200, expDate: "10/28", status: "active" }
            ]
        },
        {
            name: "Human Albumin 20% 100ml",
            principal: "Principal D (Abbott Care)",
            pack: "1 vial",
            hsn: "30021290",
            gstPercent: 5,
            mrp: 4200.00,
            ptr: 3500.00,
            pts: 3150.00,
            avgDailySale: 5,
            binLocation: "Cold Room 01 · Rack CR-2",
            coldChain: true,
            scheduleH: false,
            batches: [
                { batchNumber: "HA2501", qty: 45, expDate: "11/27", status: "active" }
            ]
        },
        {
            name: "Alprazolam 0.5mg",
            principal: "Torrent Pharmaceuticals",
            pack: "10 tab",
            hsn: "30049091",
            gstPercent: 12,
            mrp: 48.00,
            ptr: 38.00,
            pts: 34.00,
            avgDailySale: 40,
            binLocation: "Secure Vault · Bin SV-01",
            coldChain: false,
            scheduleH: true,
            batches: [
                { batchNumber: "AP2503", qty: 800, expDate: "04/28", status: "active" }
            ]
        },
        {
            name: "Vildagliptin 50",
            principal: "Principal A (Novartis / Sandoz)",
            pack: "15 tab",
            hsn: "30049089",
            gstPercent: 12,
            mrp: 235.00,
            ptr: 195.00,
            pts: 172.00,
            avgDailySale: 30,
            binLocation: "Aisle D · Rack 01 · Bin 2",
            coldChain: false,
            scheduleH: false,
            batches: [
                { batchNumber: "VG2502", qty: 250, expDate: "06/28", status: "active" }
            ]
        },
        {
            name: "Erythropoietin 4000 IU",
            principal: "Dr. Reddy's Laboratories",
            pack: "1 PFS",
            hsn: "30021500",
            gstPercent: 5,
            mrp: 1450.00,
            ptr: 1200.00,
            pts: 1080.00,
            avgDailySale: 8,
            binLocation: "Cold Room 02 · Rack CR-3",
            coldChain: true,
            scheduleH: false,
            batches: [
                { batchNumber: "EP2509", qty: 90, expDate: "07/27", status: "active" }
            ]
        },
        {
            name: "Montelukast + Levocetirizine",
            principal: "Mankind Pharma Ltd",
            pack: "10 tab",
            hsn: "30049099",
            gstPercent: 12,
            mrp: 165.00,
            ptr: 132.00,
            pts: 118.80,
            avgDailySale: 65,
            binLocation: "Aisle C · Rack 01 · Bin 5",
            coldChain: false,
            scheduleH: false,
            batches: [
                { batchNumber: "ML2504", qty: 1500, expDate: "09/28", status: "active" }
            ]
        }
    ];
    for (const item of productsData) {
        const { batches, ...prodData } = item;
        // Upsert product by name
        const existing = await prisma.product.findFirst({
            where: { name: prodData.name }
        });
        let product;
        if (existing) {
            product = await prisma.product.update({
                where: { id: existing.id },
                data: prodData
            });
        }
        else {
            product = await prisma.product.create({
                data: prodData
            });
        }
        // Upsert batches
        for (const b of batches) {
            await prisma.productBatch.upsert({
                where: {
                    productId_batchNumber: {
                        productId: product.id,
                        batchNumber: b.batchNumber
                    }
                },
                update: {
                    qty: b.qty,
                    expDate: b.expDate,
                    status: b.status
                },
                create: {
                    productId: product.id,
                    batchNumber: b.batchNumber,
                    qty: b.qty,
                    expDate: b.expDate,
                    status: b.status
                }
            });
        }
    }
    console.log(`Successfully seeded ${productsData.length} products with FEFO batch records!`);
}
if (require.main === module) {
    seedProducts()
        .catch((e) => {
        console.error(e);
        process.exit(1);
    })
        .finally(() => prisma.$disconnect());
}
