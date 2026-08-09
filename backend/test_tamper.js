const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function tamperLedger() {
  console.log('--- EXECUTING ACADEMIC TAMPER DEMONSTRATION ---');
  try {
    // 1. Fetch the first Audit Record
    const record = await prisma.auditRecord.findFirst({
      orderBy: { timestamp: 'asc' }
    });

    if (!record) {
      console.log('No records found in the ledger to tamper with.');
      return;
    }

    console.log(`Original Record ID: ${record.id}`);
    console.log(`Original Entity ID: ${record.entityId}`);

    // 2. Secretly modify historical data (Simulating a malicious database admin)
    const compromisedEntityId = `TAMPERED-${Date.now()}`;

    await prisma.auditRecord.update({
      where: { id: record.id },
      data: { entityId: compromisedEntityId } // We do NOT update the integrityHash
    });

    console.log(`Tampered Entity ID: ${compromisedEntityId}`);
    console.log('--- TAMPER SUCCESSFUL ---');
    console.log('Run the Admin UI Ledger Verification to see the compromised chain detected!');

  } catch (error) {
    console.error('Tamper Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

tamperLedger();
