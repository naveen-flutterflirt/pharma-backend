import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding realistic Pharma Claims...");

  const claimsData = [
    {
      claimNo: "CLM-25-0182",
      type: "Expiry returns",
      principalName: "Principal B (Glaxo Regional)",
      cnfDepot: "Regional C&F Depot, Sector 4",
      amount: 580000,
      dateRaised: "14 Aug 2026",
      ageDays: 59,
      status: "Verified",
      creditNoteNo: "PCN-GLX-9941",
      creditNoteAmount: 580000,
      evidenceFilesCount: 4,
      batchDetails: "Amoxicillin 500 (AM2301, 140 strips) · Cefixime (CF2309)",
      linesCount: 8
    },
    {
      claimNo: "CLM-25-0188",
      type: "Rate difference (hospitals)",
      principalName: "Principal A (Novartis Institutional)",
      cnfDepot: "Central Logistics Hub",
      amount: 310000,
      dateRaised: "18 Sep 2026",
      ageDays: 24,
      status: "Sent to C&F",
      evidenceFilesCount: 6,
      batchDetails: "Arogya Nursing Home tender rate gap (PTR ₹612 vs Contract ₹550)",
      linesCount: 12
    },
    {
      claimNo: "CLM-25-0174",
      type: "Scheme reimbursement",
      principalName: "Principal C (Cipla Stockist)",
      cnfDepot: "State Mother Warehouse",
      amount: 120000,
      dateRaised: "05 Jul 2026",
      ageDays: 98,
      status: "Sent to C&F",
      evidenceFilesCount: 3,
      batchDetails: "Quarterly Target scheme pass-on (10+1 free goods given at cost)",
      linesCount: 5
    },
    {
      claimNo: "CLM-25-0192",
      type: "Breakage / damage",
      principalName: "Principal D (Abbott Care)",
      cnfDepot: "Regional Depot 01",
      amount: 60000,
      dateRaised: "29 Sep 2026",
      ageDays: 13,
      status: "Draft",
      evidenceFilesCount: 5,
      batchDetails: "Cough syrup transit bottle breakage in sealed master carton",
      linesCount: 3
    },
    {
      claimNo: "CLM-25-0190",
      type: "Price-drop protection",
      principalName: "Principal B (Glaxo Regional)",
      cnfDepot: "Regional C&F Depot, Sector 4",
      amount: 50000,
      dateRaised: "22 Sep 2026",
      ageDays: 20,
      status: "Credit Note Received",
      creditNoteNo: "PCN-GLX-9988",
      creditNoteAmount: 50000,
      evidenceFilesCount: 2,
      batchDetails: "NPPA / DPCO gazette ceiling price revision stock adjustment",
      linesCount: 4
    },
    {
      claimNo: "CLM-25-0165",
      type: "Rate difference (hospitals)",
      principalName: "Sun Pharma Laboratories",
      cnfDepot: "Bhiwandi Central Depot",
      amount: 185000,
      dateRaised: "02 Aug 2026",
      ageDays: 72,
      status: "Sent to C&F",
      evidenceFilesCount: 4,
      batchDetails: "Lilavati & Breach Candy Hospital institutional rate contract difference",
      linesCount: 9
    },
    {
      claimNo: "CLM-25-0195",
      type: "Expiry returns",
      principalName: "Alkem Laboratories",
      cnfDepot: "Kurla C&F Hub",
      amount: 145000,
      dateRaised: "04 Oct 2026",
      ageDays: 8,
      status: "Draft",
      evidenceFilesCount: 2,
      batchDetails: "Clavam 625 quarantined strips batch CV2401 return debit note",
      linesCount: 6
    }
  ];

  for (const c of claimsData) {
    await prisma.claim.upsert({
      where: { claimNo: c.claimNo },
      update: c,
      create: c
    });
  }

  const count = await prisma.claim.count();
  console.log(`✅ Claims seeded successfully. Total in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("Error seeding claims:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
