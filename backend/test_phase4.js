const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING PHASE 4 VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, details);
      failed++;
    }
  };

  try {
    // Setup
    await prisma.notification.deleteMany();
    await prisma.auditRecord.deleteMany();
    await prisma.investment.deleteMany();
    await prisma.document.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin
    const adminRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin', email: 'admin@ex.com', password: 'pw', role: 'ADMINISTRATOR' })
    });
    const adminToken = (await adminRes.json()).token;

    // Create Business
    const bizRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Biz', email: 'biz@ex.com', password: 'pw', role: 'BUSINESS_OWNER' })
    });
    const bizToken = (await bizRes.json()).token;

    // Create Investor
    const invRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Inv', email: 'inv@ex.com', password: 'pw', role: 'INVESTOR' })
    });
    const invToken = (await invRes.json()).token;

    // Create Investor 2
    const inv2Res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Inv2', email: 'inv2@ex.com', password: 'pw', role: 'INVESTOR' })
    });
    const inv2Token = (await inv2Res.json()).token;

    // Approve Business manually
    const dbUser = await prisma.user.findFirst({ where: { email: 'biz@ex.com' } });
    const biz = await prisma.business.create({
      data: { businessName: 'Test', description: 'Desc', industry: 'Tech', ownerId: dbUser.id, verificationStatus: 'APPROVED' }
    });

    // Create Pending Campaign
    const campPending = await prisma.campaign.create({
      data: { title: 'Pending Camp', description: 'Desc', fundingGoal: 1000, businessId: biz.id, status: 'PENDING' }
    });

    // Create Rejected Campaign
    const campRejected = await prisma.campaign.create({
      data: { title: 'Rejected Camp', description: 'Desc', fundingGoal: 1000, businessId: biz.id, status: 'REJECTED' }
    });

    // Create Active Campaign
    const campActive = await prisma.campaign.create({
      data: { title: 'Active Camp', description: 'Desc', fundingGoal: 500, businessId: biz.id, status: 'ACTIVE' }
    });

    // TESTS
    // 1 & 2. Investor cannot see PENDING or REJECTED
    const listRes = await fetch(`${API_URL}/investor/campaigns`, { headers: { 'Authorization': `Bearer ${invToken}` } });
    const list = await listRes.json();
    assert(list.length === 1 && list[0].id === campActive.id, '1 & 2. Investor sees ONLY ACTIVE campaigns');

    // 3. Investor cannot invest in unapproved campaign
    const invUnappRes = await fetch(`${API_URL}/investor/invest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${invToken}` },
      body: JSON.stringify({ campaignId: campPending.id, amount: 100 })
    });
    assert(invUnappRes.status === 400, '3. Investor cannot invest in an unapproved campaign');

    // 4. Business Owner cannot access Investor endpoints
    const bizAccRes = await fetch(`${API_URL}/investor/campaigns`, { headers: { 'Authorization': `Bearer ${bizToken}` } });
    assert(bizAccRes.status === 403, '4. Business Owner cannot access Investor endpoints (403)');

    // 5. Investor cannot access Admin endpoints
    const adminAccRes = await fetch(`${API_URL}/admin/campaigns/pending`, { headers: { 'Authorization': `Bearer ${invToken}` } });
    assert(adminAccRes.status === 403, '5. Investor cannot access Admin endpoints (403)');

    // 7. Unauthenticated user cannot access Investor endpoints
    const unauthRes = await fetch(`${API_URL}/investor/campaigns`);
    assert(unauthRes.status === 401, '7. Unauthenticated user cannot access Investor endpoints (401)');

    // 8. Invalid investment amounts
    const invNegRes = await fetch(`${API_URL}/investor/invest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${invToken}` },
      body: JSON.stringify({ campaignId: campActive.id, amount: -50 })
    });
    assert(invNegRes.status === 400, '8. Invalid investment amount is rejected');

    // 9. Exceeding capacity
    const invExcRes = await fetch(`${API_URL}/investor/invest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${invToken}` },
      body: JSON.stringify({ campaignId: campActive.id, amount: 1000 }) // Goal is 500
    });
    assert(invExcRes.status === 400, '9. Investment exceeding capacity is rejected');

    // Successful Investment (Atomic)
    const invSuccRes = await fetch(`${API_URL}/investor/invest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${invToken}` },
      body: JSON.stringify({ campaignId: campActive.id, amount: 100 })
    });

    if (invSuccRes.status !== 201) {
      console.error('FAILED INVESTMENT DATA:', await invSuccRes.text());
    }

    assert(invSuccRes.status === 201, '10. Successful investment updates DB');

    // Check funding updated
    const updatedCamp = await prisma.campaign.findUnique({ where: { id: campActive.id } });
    assert(parseFloat(updatedCamp.currentFunding) === 100, '10b. Campaign currentFunding accurately updated');

    // Audit and Notification
    const audit = await prisma.auditRecord.findFirst({ where: { eventType: 'INVESTMENT_SIMULATED' } });
    assert(audit, '11. Audit record created for investment');

    const notif = await prisma.notification.findFirst({ where: { userId: dbUser.id } });
    assert(notif && notif.message.includes('100'), '12. Notification created for Business Owner');

    // 6. Investor portfolio isolation
    const portRes1 = await fetch(`${API_URL}/investor/portfolio`, { headers: { 'Authorization': `Bearer ${invToken}` } });
    const port1 = await portRes1.json();
    assert(port1.length === 1 && parseFloat(port1[0].amount) === 100, 'Portfolio 1 has investment');

    const portRes2 = await fetch(`${API_URL}/investor/portfolio`, { headers: { 'Authorization': `Bearer ${inv2Token}` } });
    const port2 = await portRes2.json();
    assert(port2.length === 0, '6. Investor cannot access another Investor\'s portfolio');

  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    await prisma.$disconnect();
    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
  }
}

runTests();
