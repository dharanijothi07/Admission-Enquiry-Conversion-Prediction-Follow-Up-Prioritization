import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { CounsellorDashboard } from './pages/CounsellorDashboard';
import { EnquiryList } from './pages/EnquiryList';
import { AddEditEnquiry } from './pages/AddEditEnquiry';
import { EnquiryDetails } from './pages/EnquiryDetails';
import { FollowUpTasks } from './pages/FollowUpTasks';
import { PredictionDetails } from './pages/PredictionDetails';
import { Analytics } from './pages/Analytics';
import { UserManagement } from './pages/UserManagement';
import { MLEvaluation } from './pages/MLEvaluation';

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const { role } = useAuth();
  return <Navigate to={role === 'admin' ? '/admin' : '/counsellor'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Authenticated Dashboard Layout */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<RootRedirect />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="counsellor" element={<CounsellorDashboard />} />
            <Route path="enquiries" element={<EnquiryList />} />
            <Route path="enquiries/new" element={<AddEditEnquiry />} />
            <Route path="enquiries/edit/:id" element={<AddEditEnquiry />} />
            <Route path="enquiries/:id" element={<EnquiryDetails />} />
            <Route path="follow-ups" element={<FollowUpTasks />} />
            <Route path="prediction-insights" element={<PredictionDetails />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="ml-evaluation" element={<MLEvaluation />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
