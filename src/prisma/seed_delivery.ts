import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding rich realistic delivery routes, vans, and customer drops...");

  // Clear existing to avoid duplicate routeNumber unique constraint issues
  await prisma.deliveryDrop.deleteMany();
  await prisma.deliveryRoute.deleteMany();

  const ROUTES_DATA = [
    {
      routeNumber: "Route 3",
      driverName: "Ramesh Kumar",
      vanNumber: "Van KA-01-MJ-4410",
      status: "on_route",
      drops: [
        {
          sequence: 1,
          customerName: "Sri Sai Medicals",
          customerCode: "C-2041",
          address: "Shop 14, Main Market, MG Road, Bangalore",
          contactPerson: "Mr. Satish (Pharmacist)",
          phone: "+91 98451 22019",
          invoiceNo: "INV-25-50388",
          boxesCount: 3,
          invoiceAmount: 62480,
          oldDues: 184200,
          paymentMode: "Credit",
          returnPickUp: JSON.stringify({
            itemsCount: "1 sealed polybag",
            reason: "Expiry return claim (CN-1182)"
          }),
          otpVerified: true,
          photoTaken: true,
          signature: false,
          status: "in_transit"
        },
        {
          sequence: 2,
          customerName: "City Care Pharmacy",
          customerCode: "C-1980",
          address: "24/B, 4th Cross, Gandhi Square, Malleshwaram",
          contactPerson: "Dr. Kulkarni",
          phone: "+91 98452 88190",
          invoiceNo: "INV-25-50387",
          boxesCount: 2,
          invoiceAmount: 34850,
          oldDues: 112000,
          paymentMode: "Cheque / UPI",
          otpVerified: false,
          photoTaken: false,
          signature: false,
          status: "pending"
        },
        {
          sequence: 3,
          customerName: "Janata Medical Store",
          customerCode: "C-1102",
          address: "Opp. City Hospital Gate, Station Road",
          contactPerson: "Mr. Anand Deshmukh",
          phone: "+91 97410 99411",
          invoiceNo: "INV-25-50380",
          boxesCount: 1,
          invoiceAmount: 18400,
          oldDues: 94000,
          paymentMode: "Cash on Delivery",
          otpVerified: true,
          photoTaken: true,
          signature: true,
          status: "delivered",
          collectedAmount: 18400,
          collectionMethod: "UPI QR",
          deliveredAt: "10:15 AM"
        },
        {
          sequence: 4,
          customerName: "Apollo Pharmacy Franchise",
          customerCode: "C-3011",
          address: "Koramangala 5th Block, 80 Ft Road",
          contactPerson: "R. Venkat (Store Mgr)",
          phone: "+91 98801 77620",
          invoiceNo: "INV-25-50360",
          boxesCount: 4,
          invoiceAmount: 92400,
          oldDues: 710000,
          paymentMode: "Cheque / UPI",
          otpVerified: true,
          photoTaken: true,
          signature: true,
          status: "delivered",
          collectedAmount: 25000,
          collectionMethod: "Cheque",
          deliveredAt: "11:20 AM"
        },
        {
          sequence: 5,
          customerName: "MedPlus Malleshwaram",
          customerCode: "C-2901",
          address: "18th Cross, Sampige Road, Malleshwaram",
          contactPerson: "Prashant (Lead Dispenser)",
          phone: "+91 98459 23100",
          invoiceNo: "INV-25-50375",
          boxesCount: 2,
          invoiceAmount: 48500,
          oldDues: 0,
          paymentMode: "Credit",
          otpVerified: false,
          photoTaken: false,
          signature: false,
          status: "pending"
        }
      ]
    },
    {
      routeNumber: "Route 1",
      driverName: "Suresh Gowda",
      vanNumber: "Van KA-01-MJ-8812",
      status: "on_route",
      drops: [
        {
          sequence: 1,
          customerName: "Sanjeevani Medicals",
          customerCode: "C-1520",
          address: "Shop 4, Jayanagar 4th Block",
          contactPerson: "Mr. Vijay Verma",
          phone: "+91 99160 55412",
          invoiceNo: "INV-25-50335",
          boxesCount: 3,
          invoiceAmount: 65400,
          oldDues: 125000,
          paymentMode: "Credit",
          otpVerified: true,
          photoTaken: true,
          signature: true,
          status: "delivered",
          collectedAmount: 20000,
          collectionMethod: "Cash",
          deliveredAt: "09:40 AM"
        },
        {
          sequence: 2,
          customerName: "New Life Chemists",
          customerCode: "C-2405",
          address: "Ground Floor, Complex 8, Rajajinagar",
          contactPerson: "R. Sharma",
          phone: "+91 97411 33201",
          invoiceNo: "INV-25-50340",
          boxesCount: 2,
          invoiceAmount: 28900,
          oldDues: 178000,
          paymentMode: "Cash on Delivery",
          otpVerified: false,
          photoTaken: false,
          signature: false,
          status: "pending"
        },
        {
          sequence: 3,
          customerName: "LifeLine Care Chemist",
          customerCode: "C-3301",
          address: "Near Metro Pillar 140, Rajajinagar",
          contactPerson: "D. Srinivas",
          phone: "+91 98455 66710",
          invoiceNo: "INV-25-50320",
          boxesCount: 1,
          invoiceAmount: 14200,
          oldDues: 0,
          paymentMode: "Cheque / UPI",
          otpVerified: true,
          photoTaken: true,
          signature: true,
          status: "delivered",
          collectedAmount: 14200,
          collectionMethod: "UPI QR",
          deliveredAt: "10:30 AM"
        }
      ]
    },
    {
      routeNumber: "Route 2",
      driverName: "Mahesh Hegde",
      vanNumber: "Van KA-04-E-9041",
      status: "loading",
      drops: [
        {
          sequence: 1,
          customerName: "Prime Health Chemist",
          customerCode: "C-4102",
          address: "Commercial Complex, Indiranagar",
          contactPerson: "Mr. Harish",
          phone: "+91 98450 33410",
          invoiceNo: "INV-25-50310",
          boxesCount: 2,
          invoiceAmount: 38000,
          oldDues: 45000,
          paymentMode: "Credit",
          otpVerified: false,
          photoTaken: false,
          signature: false,
          status: "pending"
        },
        {
          sequence: 2,
          customerName: "Green Cross Pharmacy",
          customerCode: "C-4205",
          address: "12th Main, HAL 2nd Stage",
          contactPerson: "Dr. K. George",
          phone: "+91 99000 88712",
          invoiceNo: "INV-25-50305",
          boxesCount: 3,
          invoiceAmount: 54000,
          oldDues: 0,
          paymentMode: "Cheque / UPI",
          otpVerified: false,
          photoTaken: false,
          signature: false,
          status: "pending"
        }
      ]
    },
    {
      routeNumber: "Hospital Express Beat",
      driverName: "Anand Babu",
      vanNumber: "Van KA-02-C-1120 (Reefer)",
      status: "settled",
      drops: [
        {
          sequence: 1,
          customerName: "Arogya Nursing Home Pharmacy",
          customerCode: "C-0840",
          address: "100 Ft Road, Indiranagar, Bangalore",
          contactPerson: "Chief Pharmacist Thomas",
          phone: "+91 98452 90123",
          invoiceNo: "INV-25-50290",
          boxesCount: 5,
          invoiceAmount: 145000,
          oldDues: 420000,
          paymentMode: "Credit",
          returnPickUp: JSON.stringify({
            itemsCount: "Cold Gel Pack Container",
            reason: "Insulin transport cold tote return"
          }),
          otpVerified: true,
          photoTaken: true,
          signature: true,
          status: "delivered",
          collectedAmount: 50000,
          collectionMethod: "Cheque",
          deliveredAt: "08:45 AM"
        }
      ]
    }
  ];

  for (const r of ROUTES_DATA) {
    const totalDrops = r.drops.length;
    const deliveredDrops = r.drops.filter((d) => d.status === "delivered").length;
    const totalOrderValue = r.drops.reduce((acc, d) => acc + d.invoiceAmount, 0);

    let cashCollected = 0;
    let upiCollected = 0;
    let chequeCollected = 0;

    for (const d of r.drops) {
      if (d.collectedAmount) {
        if (d.collectionMethod === "Cash") cashCollected += d.collectedAmount;
        else if (d.collectionMethod === "Cheque") chequeCollected += d.collectedAmount;
        else if (d.collectionMethod === "UPI QR") upiCollected += d.collectedAmount;
      }
    }

    const totalCollected = cashCollected + upiCollected + chequeCollected;

    await prisma.deliveryRoute.create({
      data: {
        routeNumber: r.routeNumber,
        driverName: r.driverName,
        vanNumber: r.vanNumber,
        totalDrops,
        deliveredDrops,
        totalOrderValue,
        totalCollected,
        cashCollected,
        upiCollected,
        chequeCollected,
        status: r.status,
        drops: {
          create: r.drops.map((d) => ({
            sequence: d.sequence,
            customerName: d.customerName,
            customerCode: d.customerCode,
            address: d.address,
            contactPerson: d.contactPerson,
            phone: d.phone,
            invoiceNo: d.invoiceNo,
            boxesCount: d.boxesCount,
            invoiceAmount: d.invoiceAmount,
            oldDues: d.oldDues,
            paymentMode: d.paymentMode,
            returnPickUp: d.returnPickUp || null,
            otpVerified: d.otpVerified,
            photoTaken: d.photoTaken,
            signature: d.signature,
            status: d.status,
            collectedAmount: d.collectedAmount || null,
            collectionMethod: d.collectionMethod || null,
            deliveredAt: d.deliveredAt || null
          }))
        }
      }
    });
  }

  console.log("Successfully seeded 4 delivery routes with 11 drops!");
}

main()
  .catch((e) => {
    console.error("Error seeding delivery:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
