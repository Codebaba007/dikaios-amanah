import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/shell/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessDashboard from './pages/business/BusinessDashboard';
import CreateBusiness from './pages/business/CreateBusiness';
import SubmitVerification from './pages/business/SubmitVerification';
import CreateCampaign from './pages/business/CreateCampaign';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReviewVerifications from './pages/admin/ReviewVerifications';
import ReviewCampaigns from './pages/admin/ReviewCampaigns';
import AuditLogs from './pages/admin/AuditLogs';
import InvestorDashboard from './pages/investor/InvestorDashboard';
import BrowseCampaigns from './pages/investor/BrowseCampaigns';
import CampaignDetails from './pages/investor/CampaignDetails';
import Portfolio from './pages/investor/Portfolio';
import BusinessProfile from './pages/investor/BusinessProfile';
import InvestorVerification from './pages/investor/InvestorVerification';

/* Route groups that render inside the dedicated dashboard shell. */
const WORKSPACE_PREFIXES = ['/business', '/admin', '/investor'];

const isWorkspacePath = (pathname) =>
  WORKSPACE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

/**
 * Public pages keep the marketing navbar and footer.
 * Workspace pages own their chrome via DashboardLayout, so the public
 * navbar, main padding, and footer are not rendered around them.
 */
const AppFrame = ({ children }) => {
  const { pathname } = useLocation();
  const workspace = isWorkspacePath(pathname);

  return (
    <>
      {!workspace && <Navbar />}
      <main className="app-main">{children}</main>
      {!workspace && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/business" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><DashboardLayout><BusinessDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/business/create" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><DashboardLayout><CreateBusiness /></DashboardLayout></ProtectedRoute>} />
          <Route path="/business/verify" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><DashboardLayout><SubmitVerification /></DashboardLayout></ProtectedRoute>} />
          <Route path="/business/campaign/create" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><DashboardLayout><CreateCampaign /></DashboardLayout></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/verifications" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><DashboardLayout><ReviewVerifications /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/campaigns" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><DashboardLayout><ReviewCampaigns /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/audits" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><DashboardLayout><AuditLogs /></DashboardLayout></ProtectedRoute>} />

          <Route path="/investor" element={<ProtectedRoute allowedRoles={['INVESTOR']}><DashboardLayout><InvestorDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/investor/verify" element={<ProtectedRoute allowedRoles={['INVESTOR']}><DashboardLayout><InvestorVerification /></DashboardLayout></ProtectedRoute>} />
          <Route path="/investor/campaigns" element={<ProtectedRoute allowedRoles={['INVESTOR']}><DashboardLayout><BrowseCampaigns /></DashboardLayout></ProtectedRoute>} />
          <Route path="/investor/campaigns/:id" element={<ProtectedRoute allowedRoles={['INVESTOR']}><DashboardLayout><CampaignDetails /></DashboardLayout></ProtectedRoute>} />
          <Route path="/investor/businesses/:id" element={<ProtectedRoute allowedRoles={['INVESTOR']}><DashboardLayout><BusinessProfile /></DashboardLayout></ProtectedRoute>} />
          <Route path="/investor/portfolio" element={<ProtectedRoute allowedRoles={['INVESTOR']}><DashboardLayout><Portfolio /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
};

export default App;
