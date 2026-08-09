const { PrismaClient } = require('@prisma/client');
const TrustLayerService = require('./src/services/trust.service');
const prisma = new PrismaClient();

async function restoreLedger() {
  try {
    const record = await prisma.auditRecord.findFirst({
      orderBy: { timestamp: 'asc' }
    });

    if (!record) {
      console.log('No records found.');
      return;
    }

    console.log(`Found First Record ID: ${record.id}`);
    console.log(`Current Entity ID: ${record.entityId}`);
    console.log(`Event Type: ${record.eventType}`);
    console.log(`Current Integrity Hash: ${record.integrityHash}`);

    // To restore, we need the original entityId.
    // If it's VERIFICATION_SUBMITTED, it's a Verification ID.
    if (record.eventType === 'VERIFICATION_SUBMITTED') {
      const verifications = await prisma.verification.findMany();
      for (const v of verifications) {
        const testHash = TrustLayerService.generateHash({
          eventType: record.eventType,
          entityId: v.id,
          userId: record.userId,
          timestamp: record.timestamp,
          previousHash: record.previousHash
        });
        if (testHash === record.integrityHash) {
          console.log(`Match found! Original Entity ID is: ${v.id}`);

          await prisma.auditRecord.update({
            where: { id: record.id },
            data: { entityId: v.id }
          });

          console.log('Restored the record.');

          const verifyResult = await TrustLayerService.verifyLedger();
          console.log('Ledger Verification Result:', verifyResult);
          return;
        }
      }
    } else if (record.eventType.startsWith('CAMPAIGN')) {
      const campaigns = await prisma.campaign.findMany();
      for (const c of campaigns) {
        const testHash = TrustLayerService.generateHash({
          eventType: record.eventType,
          entityId: c.id,
          userId: record.userId,
          timestamp: record.timestamp,
          previousHash: record.previousHash
        });
        if (testHash === record.integrityHash) {
          console.log(`Match found! Original Entity ID is: ${c.id}`);

          await prisma.auditRecord.update({
            where: { id: record.id },
            data: { entityId: c.id }
          });

          console.log('Restored the record.');

          const verifyResult = await TrustLayerService.verifyLedger();
          console.log('Ledger Verification Result:', verifyResult);
          return;
        }
      }
    }

    console.log('Could not automatically determine original entity ID.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

restoreLedger();
