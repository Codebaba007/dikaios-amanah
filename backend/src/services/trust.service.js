const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

class TrustLayerService {

  /**
   * Generates a deterministic hash for an audit record.
   * Canonical Order: eventType, entityId, userId, timestamp (ISO), previousHash
   */
  static generateHash(payload) {
    const { eventType, entityId, userId, timestamp, previousHash } = payload;
    const canonicalString = `${eventType}|${entityId || 'null'}|${userId || 'null'}|${timestamp.toISOString()}|${previousHash}`;
    return crypto.createHash('sha256').update(canonicalString).digest('hex');
  }

  /**
   * Records a new event in the Trust Layer.
   * Can be passed a Prisma transaction object (`tx`) to ensure atomicity
   * with the primary business operation.
   */
  static async recordEvent(txOrPrisma, payload) {
    const db = txOrPrisma || prisma;

    // To prevent concurrency issues, we ideally lock the table.
    // For this academic MVP, we run inside a transaction and fetch the latest record.
    const lastRecord = await db.auditRecord.findFirst({
      orderBy: { timestamp: 'desc' }
    });

    const previousHash = lastRecord ? lastRecord.integrityHash : GENESIS_HASH;

    // We instantiate the timestamp here so we have the exact Date object for hashing
    const timestamp = new Date();

    const integrityHash = this.generateHash({
      eventType: payload.eventType,
      entityId: payload.entityId,
      userId: payload.userId,
      timestamp,
      previousHash
    });

    const newRecord = await db.auditRecord.create({
      data: {
        eventType: payload.eventType,
        entityId: payload.entityId,
        userId: payload.userId,
        timestamp,
        integrityHash,
        previousHash
      }
    });

    return newRecord;
  }

  /**
   * Verifies the entire cryptographic hash chain.
   * Returns { isValid, checkedCount, firstInvalidRecord }
   */
  static async verifyLedger() {
    const records = await prisma.auditRecord.findMany({
      orderBy: { timestamp: 'asc' } // Genesis first
    });

    let currentPreviousHash = GENESIS_HASH;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // 1. Check link (does this record's previousHash match our running tracker?)
      if (record.previousHash !== currentPreviousHash) {
        return { isValid: false, checkedCount: i, firstInvalidRecord: record };
      }

      // 2. Recalculate intrinsic hash
      const recalculatedHash = this.generateHash({
        eventType: record.eventType,
        entityId: record.entityId,
        userId: record.userId,
        timestamp: record.timestamp,
        previousHash: record.previousHash
      });

      // 3. Check integrity (does the computed hash match the stored hash?)
      if (recalculatedHash !== record.integrityHash) {
        return { isValid: false, checkedCount: i, firstInvalidRecord: record };
      }

      // Advance tracker
      currentPreviousHash = record.integrityHash;
    }

    return { isValid: true, checkedCount: records.length, firstInvalidRecord: null };
  }
}

module.exports = TrustLayerService;
