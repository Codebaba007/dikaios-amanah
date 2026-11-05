#!/usr/bin/env node
/**
 * Dikaios Amanah — end-to-end API smoke test.
 *
 * Exercises every role workflow against a running backend and asserts the
 * business rules that matter (verification gates, review gates, ledger
 * integrity). Creates synthetic records only — never real personal data.
 *
 * Usage:
 *   API_URL=https://api.example.com \
 *   ADMIN_EMAIL=admin@example.com \
 *   ADMIN_PASSWORD='...' \
 *   node scripts/smoke-test.mjs
 *
 * Exit code 0 = every check passed, 1 = at least one check failed.
 */

const API_URL = (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const RUN_ID = process.env.RUN_ID || String(Date.now());

const owner = { email: `owner.${RUN_ID}@smoke.test`, password: 'SmokeTest123!', name: 'Smoke Owner' };
const investor = { email: `investor.${RUN_ID}@smoke.test`, password: 'SmokeTest123!', name: 'Smoke Investor' };

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

function check(name, condition, detail = '') {
  record(name, Boolean(condition), detail);
  return Boolean(condition);
}

async function api(path, { method = 'GET', token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined)
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { status: response.status, ok: response.ok, data };
}

/** Smallest valid PDF payload, used as a synthetic supporting document. */
function syntheticPdf(label) {
  const body = `%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n2 0 obj<</Type/Page/Contents 3 0 R>>endobj\n3 0 obj<</Length 44>>stream\nBT /F1 12 Tf 20 40 Td (${label}) Tj ET\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF`;
  return new Blob([body], { type: 'application/pdf' });
}

function documentForm(label) {
  const form = new FormData();
  form.append('document', syntheticPdf(label), `${label}.pdf`);
  return form;
}

async function main() {
  console.log(`\nDikaios Amanah smoke test → ${API_URL}\n`);

  // ---------------------------------------------------------------- health
  console.log('Health');
  const health = await api('/api/health');
  check('GET /api/health returns 200', health.status === 200, `status ${health.status}`);
  check('health reports database connected', health.data?.database === 'connected', `database=${health.data?.database}`);

  // ------------------------------------------------------------ registration
  console.log('\nRegistration');
  const ownerReg = await api('/api/auth/register', {
    method: 'POST',
    body: { name: owner.name, email: owner.email, password: owner.password, role: 'BUSINESS_OWNER' }
  });
  check('business owner registers', ownerReg.status === 201 || ownerReg.status === 200, `status ${ownerReg.status}`);
  const ownerToken = ownerReg.data?.token;

  const investorReg = await api('/api/auth/register', {
    method: 'POST',
    body: { name: investor.name, email: investor.email, password: investor.password, role: 'INVESTOR' }
  });
  check('investor registers', investorReg.status === 201 || investorReg.status === 200, `status ${investorReg.status}`);
  const investorToken = investorReg.data?.token;

  const duplicateReg = await api('/api/auth/register', {
    method: 'POST',
    body: { name: owner.name, email: owner.email, password: owner.password, role: 'BUSINESS_OWNER' }
  });
  check('duplicate registration is rejected', duplicateReg.status === 400 || duplicateReg.status === 409, `status ${duplicateReg.status}`);

  // -------------------------------------------------------------- owner flow
  console.log('\nBusiness owner');
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: owner.email, password: owner.password }
  });
  check('owner can log in', login.status === 200 && Boolean(login.data?.token), `status ${login.status}`);

  const badLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: owner.email, password: 'definitely-wrong' }
  });
  check('wrong password is rejected', badLogin.status === 401, `status ${badLogin.status}`);

  const noToken = await api('/api/business');
  check('protected route rejects requests without a token', noToken.status === 401, `status ${noToken.status}`);

  const badToken = await api('/api/business', { token: 'not-a-real-jwt' });
  check('protected route rejects an invalid token', badToken.status === 401, `status ${badToken.status}`);

  const business = await api('/api/business', {
    method: 'POST',
    token: ownerToken,
    body: {
      businessName: `Smoke Textiles ${RUN_ID}`,
      description: 'Synthetic business created by the automated smoke test. No real data.',
      industry: 'Textiles & Garments'
    }
  });
  check('owner creates business profile', business.status === 201 || business.status === 200, `status ${business.status}`);

  const verification = await api('/api/verification/submit', {
    method: 'POST',
    token: ownerToken,
    form: documentForm('business-licence')
  });
  check('owner submits verification document', verification.status === 201 || verification.status === 200, `status ${verification.status}`);

  const campaignBeforeApproval = await api('/api/campaigns', {
    method: 'POST',
    token: ownerToken,
    body: { title: 'Premature campaign', description: 'Should be rejected until approved.', fundingGoal: 1000 }
  });
  check('campaign creation is blocked before business approval', campaignBeforeApproval.status === 403, `status ${campaignBeforeApproval.status}`);

  const ownerOnAdminRoute = await api('/api/admin/audits', { token: ownerToken });
  check('business owner is denied admin endpoints', ownerOnAdminRoute.status === 403, `status ${ownerOnAdminRoute.status}`);

  // ------------------------------------------------------------- admin login
  console.log('\nAdministrator');
  let adminToken = null;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const adminLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    adminToken = adminLogin.data?.token || null;
    check('administrator can log in', adminLogin.status === 200 && Boolean(adminToken), `status ${adminLogin.status}`);
  } else {
    record('administrator can log in', false, 'ADMIN_EMAIL/ADMIN_PASSWORD not provided');
  }

  const investorForbidden = await api('/api/admin/audits', { token: investorToken });
  check('investor is denied admin endpoints', investorForbidden.status === 403, `status ${investorForbidden.status}`);

  if (adminToken) {
    const pendingVerifications = await api('/api/admin/verifications/pending', { token: adminToken });
    const pendingList = pendingVerifications.data?.verifications || pendingVerifications.data || [];
    const mine = pendingList.find((v) => v.business?.businessName?.includes(`Smoke Textiles ${RUN_ID}`));
    check('admin sees the submitted business verification', Boolean(mine), `${pendingList.length} pending`);

    if (mine) {
      const review = await api(`/api/admin/verifications/${mine.id}/review`, {
        method: 'POST',
        token: adminToken,
        body: { action: 'APPROVED', remarks: 'Automated smoke test approval.' }
      });
      check('admin approves business verification', review.status === 200, `status ${review.status}`);
    }

    // ------------------------------------------------------- campaign review
    const campaign = await api('/api/campaigns', {
      method: 'POST',
      token: ownerToken,
      body: {
        title: `Smoke campaign ${RUN_ID}`,
        description: 'Synthetic campaign created by the automated smoke test.',
        fundingGoal: 5000
      }
    });
    check('owner creates campaign after approval', campaign.status === 201 || campaign.status === 200, `status ${campaign.status}`);
    const campaignId = campaign.data?.campaign?.id || campaign.data?.id;

    const pendingCampaigns = await api('/api/admin/campaigns/pending', { token: adminToken });
    const campaignList = pendingCampaigns.data?.campaigns || pendingCampaigns.data || [];
    const myCampaign = campaignList.find((c) => c.id === campaignId) || campaignList.find((c) => c.title === `Smoke campaign ${RUN_ID}`);
    check('admin sees the submitted campaign', Boolean(myCampaign), `${campaignList.length} pending`);

    if (myCampaign) {
      const approved = await api(`/api/admin/campaigns/${myCampaign.id}/review`, {
        method: 'POST',
        token: adminToken,
        body: { action: 'APPROVED', remarks: 'Automated smoke test approval.' }
      });
      check('admin approves campaign', approved.status === 200, `status ${approved.status}`);
    }

    // -------------------------------------------------------- investor flow
    console.log('\nInvestor');
    const discovery = await api('/api/investor/campaigns', { token: investorToken });
    const campaigns = discovery.data?.campaigns || discovery.data || [];
    const liveCampaign = campaigns.find((c) => c.title === `Smoke campaign ${RUN_ID}`);
    check('approved campaign appears in investor discovery', Boolean(liveCampaign), `${campaigns.length} listed`);

    if (liveCampaign) {
      const details = await api(`/api/investor/campaigns/${liveCampaign.id}`, { token: investorToken });
      check('investor opens campaign details', details.status === 200, `status ${details.status}`);

      const blocked = await api('/api/investor/invest', {
        method: 'POST',
        token: investorToken,
        body: { campaignId: liveCampaign.id, amount: 500 }
      });
      check('investment blocked before identity verification', blocked.status === 403, `status ${blocked.status}`);

      const investorVerification = await api('/api/investor/verification/submit', {
        method: 'POST',
        token: investorToken,
        form: documentForm('national-id')
      });
      check('investor submits identity verification', investorVerification.status === 201 || investorVerification.status === 200, `status ${investorVerification.status}`);

      const pendingInvestors = await api('/api/admin/investor-verifications/pending', { token: adminToken });
      const investorList = pendingInvestors.data?.verifications || pendingInvestors.data || [];
      check('admin sees the investor verification', investorList.length > 0, `${investorList.length} pending`);

      if (investorList.length > 0) {
        const earliest = investorList[investorList.length - 1];
        const reviewInvestor = await api(`/api/admin/investor-verifications/${earliest.id}/review`, {
          method: 'POST',
          token: adminToken,
          body: { action: 'APPROVED', remarks: 'Automated smoke test approval.' }
        });
        check('admin approves investor verification', reviewInvestor.status === 200, `status ${reviewInvestor.status}`);
      }

      const invested = await api('/api/investor/invest', {
        method: 'POST',
        token: investorToken,
        body: { campaignId: liveCampaign.id, amount: 500 }
      });
      check('verified investor records an investment', invested.status === 201 || invested.status === 200, `status ${invested.status}`);

      const after = await api(`/api/investor/campaigns/${liveCampaign.id}`, { token: investorToken });
      const raised = Number(after.data?.campaign?.currentFunding ?? after.data?.currentFunding ?? 0);
      check('campaign funding reflects the investment', raised >= 500, `currentFunding=${raised}`);

      const portfolio = await api('/api/investor/portfolio', { token: investorToken });
      // This endpoint returns a bare array of investments.
      const holdings = Array.isArray(portfolio.data)
        ? portfolio.data
        : portfolio.data?.investments || portfolio.data?.portfolio || [];
      check('investment appears in the portfolio', holdings.length > 0, `${holdings.length} holding(s)`);

      const overCapacity = await api('/api/investor/invest', {
        method: 'POST',
        token: investorToken,
        body: { campaignId: liveCampaign.id, amount: 999999 }
      });
      check('investment above remaining capacity is rejected', overCapacity.status === 400 || overCapacity.status === 422, `status ${overCapacity.status}`);
    }

    // ------------------------------------------------------------- audit/trust
    console.log('\nAudit & trust layer');
    const audits = await api('/api/admin/audits', { token: adminToken });
    const records = audits.data?.audits || audits.data?.records || audits.data || [];
    check('audit ledger contains records', Array.isArray(records) && records.length > 0, `${records.length} record(s)`);

    const ledger = await api('/api/admin/audits/verify', { token: adminToken });
    const valid = ledger.data?.valid ?? ledger.data?.integrityValid ?? ledger.data?.isValid;
    check('audit ledger integrity verifies', valid === true, `valid=${valid}`);
  }

  // ------------------------------------------------------------------ report
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  console.log(`\n${passed}/${results.length} checks passed${failed ? `, ${failed} FAILED` : ''}\n`);

  if (failed > 0) {
    console.log('Failures:');
    for (const r of results.filter((x) => !x.passed)) {
      console.log(`  - ${r.name}${r.detail ? ` (${r.detail})` : ''}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nSmoke test aborted:', error.message);
  process.exitCode = 1;
});
