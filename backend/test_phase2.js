const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING PHASE 2 VERIFICATION ---');
  let passed = 0;
  let failed = 0;
  const results = [];

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
      results.push({ test: testName, status: 'PASS', details });
    } else {
      console.error(`[FAIL] ${testName}`, details);
      failed++;
      results.push({ test: testName, status: 'FAIL', details });
    }
  };

  try {
    // Clean DB
    await prisma.notification.deleteMany();
    await prisma.auditRecord.deleteMany();
    await prisma.investment.deleteMany();
    await prisma.document.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.profitDeclaration.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();

    // 1. Register BUSINESS_OWNER
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Biz Owner', email: 'biz@example.com', password: 'password123', role: 'BUSINESS_OWNER' })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, '1. Register BUSINESS_OWNER account');

    // 2. Log in
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'biz@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(loginRes.status === 200 && token, '2. Log in');

    // 4. Create Business Profile
    const createBizRes = await fetch(`${API_URL}/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ businessName: 'Test Biz', description: 'Desc', industry: 'Tech' })
    });
    const createBizData = await createBizRes.json();
    assert(createBizRes.status === 201 && createBizData.businessName === 'Test Biz', '4. Create Business profile');

    // 5. Confirm Business in DB
    const dbBiz = await prisma.business.findFirst({ where: { businessName: 'Test Biz' } });
    assert(dbBiz !== null && dbBiz.verificationStatus === 'PENDING', '5. Confirm Business record stored in DB');

    // 6. Submit Document
    fs.writeFileSync('test_doc.pdf', 'dummy content');
    const formData = new FormData();
    formData.append('document', fs.createReadStream('test_doc.pdf'));
    formData.append('verificationType', 'BUSINESS');

    const verifRes = await fetch(`${API_URL}/verification/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const verifData = await verifRes.json();
    assert(verifRes.status === 201, '6. Submit actual PDF document', verifData.error);

    // 7 & 8. Confirm Document in DB and local storage
    const dbDoc = await prisma.document.findFirst();
    const fileExists = dbDoc && fs.existsSync(dbDoc.storageReference);
    assert(dbDoc && dbDoc.fileName === 'test_doc.pdf' && dbDoc.integrityHash && dbDoc.fileType === 'application/pdf', '8. Confirm Document database record contains metadata');
    assert(fileExists, '7. Confirm file is stored locally');

    // 9 & 10. Confirm Verification record and status
    const dbVerif = await prisma.verification.findFirst();
    const updatedBiz = await prisma.business.findUnique({ where: { id: dbBiz.id } });
    assert(dbVerif && dbVerif.status === 'PENDING', '9. Confirm Verification record is created');
    assert(updatedBiz.verificationStatus === 'PENDING', '10. Confirm Business verification status becomes PENDING');

    // 11 & 12. Confirm Audit Record
    const audit = await prisma.auditRecord.findFirst({ where: { entityId: verifRes.id } });
    assert(audit && typeof audit.integrityHash === 'string' && audit.integrityHash.length > 0, '11 & 12. Confirm AuditRecord with hash info');

    // 14 & 15. Attempt to create campaign while PENDING
    const campRes = await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'Camp', description: 'Desc', fundingGoal: 1000 })
    });
    assert(campRes.status === 403, '14 & 15. Backend rejects campaign creation if PENDING (403)');

    // 19. Unauthenticated access
    const unauthRes = await fetch(`${API_URL}/business`, { method: 'GET' });
    assert(unauthRes.status === 401, '19. Protected routes reject unauthenticated access');

    // 20. INVESTOR access to BUSINESS endpoints
    const invReg = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Inv', email: 'inv@example.com', password: 'pass', role: 'INVESTOR' })
    });
    const invToken = (await invReg.json()).token;
    const invBizRes = await fetch(`${API_URL}/business`, {
      method: 'GET', headers: { 'Authorization': `Bearer ${invToken}` }
    });
    assert(invBizRes.status === 403, '20. INVESTOR cannot access Business Owner endpoints (403)');

    // Clean up
    if (fs.existsSync('test_doc.pdf')) fs.unlinkSync('test_doc.pdf');

  } catch (err) {
    console.error('Test Execution Error:', err);
  } finally {
    await prisma.$disconnect();
    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
    fs.writeFileSync('phase2_results.json', JSON.stringify(results, null, 2));
  }
}

runTests();
