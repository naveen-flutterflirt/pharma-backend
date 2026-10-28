import { PrismaClient, CustomerStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCollections() {
  console.log("🌱 Seeding realistic Collections & Customer data into PostgreSQL...");

  // 1. Ensure realistic customers exist
  const customersData = [
    {
      code: "C-2041",
      name: "Sri Sai Medicals",
      type: "Retail Chemist",
      grade: "Grade A",
      route: "Route 3",
      salesman: "Ravi Kumar",
      address: "Shop 12, Market Yard, Sector 4",
      phone: "+91 98200 44102",
      gstin: "27AABCS1429B1Z2",
      dlNumber: "MH-TZ2-192840",
      dlValidTo: "2028-12-31",
      creditLimit: 300000,
      creditUsed: 184200,
      termsDays: 30,
      status: CustomerStatus.ACTIVE
    },
    {
      code: "C-1102",
      name: "Janata Medical Store",
      type: "Retail Chemist",
      grade: "Grade B",
      route: "Route 4",
      salesman: "Amit Deshmukh",
      address: "Station Road, Opp Bus Depot",
      phone: "+91 98200 55891",
      gstin: "27AABCJ9912C1Z4",
      dlNumber: "MH-TZ2-192841",
      dlValidTo: "2027-10-31",
      creditLimit: 250000,
      creditUsed: 94000,
      termsDays: 21,
      status: CustomerStatus.ACTIVE
    },
    {
      code: "C-0840",
      name: "Arogya Nursing Home",
      type: "Hospital",
      grade: "Grade A+",
      route: "Hospital Direct",
      salesman: "Accounts Direct",
      address: "Main Bypass Rd, Civil Hospital Lane",
      phone: "+91 98200 12890",
      gstin: "27AABCA4419D1Z8",
      dlNumber: "MH-TZ2-192842",
      dlValidTo: "2029-06-30",
      creditLimit: 1000000,
      creditUsed: 420000,
      termsDays: 45,
      status: CustomerStatus.ACTIVE
    },
    {
      code: "C-1980",
      name: "City Care Pharmacy",
      type: "Retail Chemist",
      grade: "Grade C",
      route: "Route 1",
      salesman: "Suresh Patil",
      address: "Gol Market, Shop 4",
      phone: "+91 98200 88912",
      gstin: "27AABCC3310A1Z1",
      dlNumber: "MH-TZ2-192843",
      dlValidTo: "2027-08-31",
      creditLimit: 200000,
      creditUsed: 215000,
      termsDays: 15,
      status: CustomerStatus.BLOCKED,
      blockReason: "Credit limit breached (> ₹2,00,000) & overdue > 30 days"
    },
    {
      code: "C-2405",
      name: "New Life Chemists",
      type: "Retail Chemist",
      grade: "Grade B",
      route: "Route 2",
      salesman: "Ramesh Sharma",
      address: "44 Ring Road Junction",
      phone: "+91 98200 99401",
      gstin: "27AABCN8812F1Z5",
      dlNumber: "MH-TZ2-192844",
      dlValidTo: "2028-04-30",
      creditLimit: 150000,
      creditUsed: 178000,
      termsDays: 21,
      status: CustomerStatus.BLOCKED,
      blockReason: "Cheque Bounced (CHQ #102944) · Overdue 48 days"
    },
    {
      code: "C-1520",
      name: "Sanjeevani Medicals",
      type: "Retail Chemist",
      grade: "Grade A",
      route: "Route 5",
      salesman: "Vijay Verma",
      address: "Shivaji Chowk, Corner Building",
      phone: "+91 98200 33190",
      gstin: "27AABCS5591G1Z9",
      dlNumber: "MH-TZ2-192845",
      dlValidTo: "2028-09-30",
      creditLimit: 400000,
      creditUsed: 125000,
      termsDays: 30,
      status: CustomerStatus.ACTIVE
    },
    {
      code: "C-3011",
      name: "Apollo Pharmacy Franchise",
      type: "Chain Pharmacy",
      grade: "Grade A+",
      route: "Route 2",
      salesman: "Ramesh Sharma",
      address: "Mall Road, Ground Floor",
      phone: "+91 98200 77123",
      gstin: "27AABCA1102K1Z3",
      dlNumber: "MH-TZ2-192846",
      dlValidTo: "2029-12-31",
      creditLimit: 800000,
      creditUsed: 310000,
      termsDays: 30,
      status: CustomerStatus.ACTIVE
    }
  ];

  for (const c of customersData) {
    await prisma.customer.upsert({
      where: { code: c.code },
      update: c,
      create: c
    });
  }

  // 2. Fetch fresh customer map
  const customers = await prisma.customer.findMany();
  const getCust = (code: string) => customers.find((c) => c.code === code) || customers[0];

  // 3. Clear old collections and seed realistic baseline
  await prisma.collection.deleteMany();

  const collectionsData = [
    {
      receiptNo: "REC-25-8812",
      customerCode: "C-2041",
      collectorName: "Ramesh Kumar (Van Driver)",
      collectorRole: "Delivery Driver",
      amount: 24000,
      mode: "UPI QR",
      referenceNo: "UPI/261009184421/HDFC",
      date: "26 Oct 2026",
      time: "11:20 AM",
      allocatedInvoices: "INV-25-48812",
      reconciliationStatus: "Matched (Auto)",
      bankAccount: "HDFC Primary Current A/c (..8821)"
    },
    {
      receiptNo: "REC-25-8811",
      customerCode: "C-1102",
      collectorName: "Ravi Kumar (Field Rep)",
      collectorRole: "Salesman",
      amount: 18400,
      mode: "Cheque",
      referenceNo: "CHQ #441920 (SBI)",
      date: "26 Oct 2026",
      time: "10:45 AM",
      allocatedInvoices: "INV-25-48719",
      reconciliationStatus: "Pending Bank Clearance",
      bankAccount: "ICICI Clearing A/c (..3109)"
    },
    {
      receiptNo: "REC-25-8810",
      customerCode: "C-0840",
      collectorName: "Accounts Portal (NEFT)",
      collectorRole: "Counter / Direct",
      amount: 52000,
      mode: "Bank NEFT",
      referenceNo: "UTR-CMS-901842019",
      date: "26 Oct 2026",
      time: "09:30 AM",
      allocatedInvoices: "INV-25-48501, INV-25-48612",
      reconciliationStatus: "Matched (Auto)",
      bankAccount: "HDFC Primary Current A/c (..8821)"
    },
    {
      receiptNo: "REC-25-8809",
      customerCode: "C-1980",
      collectorName: "Suresh Patil (Field Rep)",
      collectorRole: "Salesman",
      amount: 12500,
      mode: "Cash",
      referenceNo: "CASH-DESK-019",
      date: "26 Oct 2026",
      time: "09:15 AM",
      allocatedInvoices: "INV-25-49102",
      reconciliationStatus: "Matched (Auto)",
      bankAccount: "Cash Drawer 01"
    },
    {
      receiptNo: "REC-25-8808",
      customerCode: "C-2405",
      collectorName: "Ramesh Kumar (Van Driver)",
      collectorRole: "Delivery Driver",
      amount: 45000,
      mode: "Cheque",
      referenceNo: "CHQ #102944 (HDFC)",
      date: "25 Oct 2026",
      time: "04:10 PM",
      allocatedInvoices: "INV-25-49210",
      reconciliationStatus: "Pending Bank Clearance",
      bankAccount: "ICICI Clearing A/c (..3109)"
    },
    {
      receiptNo: "REC-25-8807",
      customerCode: "C-1520",
      collectorName: "Vijay Verma (Field Rep)",
      collectorRole: "Salesman",
      amount: 31200,
      mode: "UPI QR",
      referenceNo: "UPI/261011029144/ICICI",
      date: "25 Oct 2026",
      time: "02:30 PM",
      allocatedInvoices: "INV-25-49301",
      reconciliationStatus: "Matched (Auto)",
      bankAccount: "HDFC Primary Current A/c (..8821)"
    },
    {
      receiptNo: "REC-25-8806",
      customerCode: "C-3011",
      collectorName: "Accounts Portal (NEFT)",
      collectorRole: "Counter / Direct",
      amount: 78500,
      mode: "Bank NEFT",
      referenceNo: "UTR-AXIS-881920194",
      date: "25 Oct 2026",
      time: "12:15 PM",
      allocatedInvoices: "INV-25-49400, INV-25-49401",
      reconciliationStatus: "Matched (Auto)",
      bankAccount: "HDFC Primary Current A/c (..8821)"
    },
    {
      receiptNo: "REC-25-8805",
      customerCode: "C-2041",
      collectorName: "Ramesh Kumar (Van Driver)",
      collectorRole: "Delivery Driver",
      amount: 15000,
      mode: "Cheque",
      referenceNo: "CHQ #551209 (PNB)",
      date: "24 Oct 2026",
      time: "03:45 PM",
      allocatedInvoices: "INV-25-50390",
      reconciliationStatus: "Disputed",
      bankAccount: "ICICI Clearing A/c (..3109)"
    }
  ];

  for (const c of collectionsData) {
    const cust = getCust(c.customerCode);
    await prisma.collection.create({
      data: {
        receiptNo: c.receiptNo,
        customerId: cust.id,
        customerName: cust.name,
        customerCode: cust.code,
        route: cust.route,
        collectorName: c.collectorName,
        collectorRole: c.collectorRole,
        amount: c.amount,
        mode: c.mode,
        referenceNo: c.referenceNo,
        date: c.date,
        time: c.time,
        allocatedInvoices: c.allocatedInvoices,
        reconciliationStatus: c.reconciliationStatus,
        bankAccount: c.bankAccount
      }
    });
  }

  console.log("✅ Seeded 8 collections and 7 customers successfully.");
  await prisma.$disconnect();
}

seedCollections().catch((err) => {
  console.error(err);
  process.exit(1);
});
