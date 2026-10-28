"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../db/prisma");
async function main() {
    console.log("🌱 Seeding realistic Field Salesmen and Beat Stops...");
    // Clear existing beat visits and salesmen
    await prisma_1.prisma.beatVisit.deleteMany();
    await prisma_1.prisma.salesman.deleteMany();
    // 1. Ravi Kumar
    await prisma_1.prisma.salesman.create({
        data: {
            name: "Ravi Kumar",
            phone: "+91 98451 90211",
            email: "ravi.k@shahpharma.com",
            beatName: "Route 3 (Central Commercial)",
            todayTarget: 2800000,
            achievedAmount: 1708000,
            todayOrdersBooked: 160000,
            todayCollections: 48000,
            totalVisits: 22,
            completedVisits: 9,
            status: "on_beat",
            visits: {
                create: [
                    {
                        sequence: 9,
                        customerName: "Sri Sai Medicals",
                        customerCode: "C-2041",
                        type: "Retail Chemist",
                        distance: "0 m",
                        status: "completed",
                        orderBooked: 62480,
                        collected: 24000,
                        dueAmount: 184200,
                        usualOrderAmount: 48000,
                        gpsCheckedInAt: "10:12 AM (Lat 12.9716, Lng 77.5946)",
                        licenceStatus: "valid"
                    },
                    {
                        sequence: 10,
                        customerName: "City Care Pharmacy",
                        customerCode: "C-1980",
                        type: "Retail Chemist",
                        distance: "350 m away",
                        status: "in_progress",
                        dueAmount: 42300,
                        usualOrderAmount: 28000,
                        licenceStatus: "valid"
                    },
                    {
                        sequence: 11,
                        customerName: "Janata Medical Store",
                        customerCode: "C-1102",
                        type: "Retail Chemist",
                        distance: "750 m away",
                        status: "pending",
                        dueAmount: 18400,
                        usualOrderAmount: 15000,
                        licenceStatus: "renewal_due",
                        licenceNote: "Licence renewal due in 12 days — collect renewal challan copy"
                    },
                    {
                        sequence: 12,
                        customerName: "Arogya Clinic & Chemist",
                        customerCode: "C-0914",
                        type: "Clinic / Pharmacy",
                        distance: "1.2 km away",
                        status: "skipped",
                        skipReason: "Blocked for overdue >45 days (₹86K) — payment recovery required",
                        dueAmount: 86000,
                        usualOrderAmount: 35000,
                        licenceStatus: "blocked"
                    }
                ]
            }
        }
    });
    // 2. Suresh Gowda
    await prisma_1.prisma.salesman.create({
        data: {
            name: "Suresh Gowda",
            phone: "+91 98452 77102",
            email: "suresh.g@shahpharma.com",
            beatName: "Route 1 (North Extension)",
            todayTarget: 2400000,
            achievedAmount: 1680000,
            todayOrdersBooked: 125000,
            todayCollections: 38000,
            totalVisits: 20,
            completedVisits: 14,
            status: "on_beat",
            visits: {
                create: [
                    {
                        sequence: 1,
                        customerName: "Apollo Pharmacy - Civil Lines",
                        customerCode: "C-1849",
                        type: "Chain Pharmacy",
                        distance: "0 m",
                        status: "completed",
                        orderBooked: 54320,
                        collected: 20000,
                        dueAmount: 64200,
                        usualOrderAmount: 50000,
                        gpsCheckedInAt: "09:45 AM (GPS Verified ✓)",
                        licenceStatus: "valid"
                    },
                    {
                        sequence: 2,
                        customerName: "MedPlus Chemist - Sector 18",
                        customerCode: "C-1902",
                        type: "Retail Chemist",
                        distance: "400 m away",
                        status: "in_progress",
                        dueAmount: 20440,
                        usualOrderAmount: 22000,
                        licenceStatus: "valid"
                    },
                    {
                        sequence: 3,
                        customerName: "Sanjivani Medicos",
                        customerCode: "C-2291",
                        type: "Retail Chemist",
                        distance: "900 m away",
                        status: "pending",
                        dueAmount: 25088,
                        usualOrderAmount: 30000,
                        licenceStatus: "valid"
                    }
                ]
            }
        }
    });
    // 3. Mahesh Sharma
    await prisma_1.prisma.salesman.create({
        data: {
            name: "Mahesh Sharma",
            phone: "+91 98453 11849",
            email: "mahesh.s@shahpharma.com",
            beatName: "Route 2 (Old City Bazaar)",
            todayTarget: 2200000,
            achievedAmount: 1100000,
            todayOrdersBooked: 95000,
            todayCollections: 22000,
            totalVisits: 18,
            completedVisits: 8,
            status: "on_beat",
            visits: {
                create: [
                    {
                        sequence: 1,
                        customerName: "Balaji Medicals",
                        customerCode: "C-1402",
                        type: "Retail Chemist",
                        distance: "0 m",
                        status: "completed",
                        orderBooked: 45000,
                        collected: 15000,
                        dueAmount: 32000,
                        usualOrderAmount: 35000,
                        gpsCheckedInAt: "10:05 AM (GPS Verified ✓)",
                        licenceStatus: "valid"
                    },
                    {
                        sequence: 2,
                        customerName: "Shivam Pharma Hub",
                        customerCode: "C-1522",
                        type: "Retail Chemist",
                        distance: "550 m away",
                        status: "in_progress",
                        dueAmount: 19800,
                        usualOrderAmount: 25000,
                        licenceStatus: "valid"
                    },
                    {
                        sequence: 3,
                        customerName: "New Life Chemists",
                        customerCode: "C-1601",
                        type: "Retail Chemist",
                        distance: "1.1 km away",
                        status: "skipped",
                        skipReason: "Hard credit lock active — customer overdue 54 days",
                        dueAmount: 86400,
                        usualOrderAmount: 40000,
                        licenceStatus: "blocked"
                    }
                ]
            }
        }
    });
    // 4. Pooja Nair
    await prisma_1.prisma.salesman.create({
        data: {
            name: "Pooja Nair",
            phone: "+91 98454 44920",
            email: "pooja.n@shahpharma.com",
            beatName: "Route 4 (Hospital Belt & Institutional)",
            todayTarget: 3000000,
            achievedAmount: 2250000,
            todayOrdersBooked: 210000,
            todayCollections: 85000,
            totalVisits: 16,
            completedVisits: 11,
            status: "on_beat",
            visits: {
                create: [
                    {
                        sequence: 1,
                        customerName: "Care Hospital Dispensary",
                        customerCode: "H-8812",
                        type: "Institutional Hospital",
                        distance: "0 m",
                        status: "completed",
                        orderBooked: 125000,
                        collected: 60000,
                        dueAmount: 210000,
                        usualOrderAmount: 120000,
                        gpsCheckedInAt: "09:15 AM (GPS Verified ✓)",
                        licenceStatus: "valid"
                    },
                    {
                        sequence: 2,
                        customerName: "Fortis Retail Pharmacy",
                        customerCode: "H-8819",
                        type: "Hospital Attached Pharmacy",
                        distance: "800 m away",
                        status: "in_progress",
                        dueAmount: 78500,
                        usualOrderAmount: 80000,
                        licenceStatus: "valid"
                    }
                ]
            }
        }
    });
    console.log("✅ 4 Salesmen & 12 Beat Stops seeded successfully into PostgreSQL!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
