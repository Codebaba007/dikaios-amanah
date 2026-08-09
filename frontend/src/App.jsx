import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
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

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/business" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><BusinessDashboard /></ProtectedRoute>} />
          <Route path="/business/create" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><CreateBusiness /></ProtectedRoute>} />
          <Route path="/business/verify" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><SubmitVerification /></ProtectedRoute>} />
          <Route path="/business/campaign/create" element={<ProtectedRoute allowedRoles={['BUSINESS_OWNER']}><CreateCampaign /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/verifications" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><ReviewVerifications /></ProtectedRoute>} />
          <Route path="/admin/campaigns" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><ReviewCampaigns /></ProtectedRoute>} />
          <Route path="/admin/audits" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><AuditLogs /></ProtectedRoute>} />

          <Route path="/investor" element={<ProtectedRoute allowedRoles={['INVESTOR']}><InvestorDashboard /></ProtectedRoute>} />
          <Route path="/investor/campaigns" element={<ProtectedRoute allowedRoles={['INVESTOR']}><BrowseCampaigns /></ProtectedRoute>} />
          <Route path="/investor/campaigns/:id" element={<ProtectedRoute allowedRoles={['INVESTOR']}><CampaignDetails /></ProtectedRoute>} />
          <Route path="/investor/portfolio" element={<ProtectedRoute allowedRoles={['INVESTOR']}><Portfolio /></ProtectedRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
