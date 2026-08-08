import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './app/components/layout/AppLayout';
import { ProtectedRoute } from './app/components/layout/ProtectedRoute';
import { Landing } from './pages/Landing';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// ERP Pages
import { Dashboard } from './pages/Dashboard';
import { Organization } from './pages/Organization';
import { UserManagement } from './pages/UserManagement';
import { Assets } from './pages/Assets';
import { AllocationPage } from './pages/Allocation';
import { Booking } from './pages/Booking';
import { Maintenance } from './pages/Maintenance';
import { Audit } from './pages/Audit';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Admin only */}
                <Route path="/organization" element={
                  <ProtectedRoute allowedRoles={['Admin']}><Organization /></ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['Admin']}><UserManagement /></ProtectedRoute>
                } />

                {/* Admin + Asset Manager */}
                <Route path="/assets" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Asset Manager']}><Assets /></ProtectedRoute>
                } />
                <Route path="/allocation" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Asset Manager']}><AllocationPage /></ProtectedRoute>
                } />

                {/* Admin + Asset Manager + Department Head + Employee */}
                <Route path="/booking" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']}><Booking /></ProtectedRoute>
                } />
                <Route path="/maintenance" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']}><Maintenance /></ProtectedRoute>
                } />

                {/* Admin + Asset Manager + Department Head */}
                <Route path="/audit" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head']}><Audit /></ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head']}><Reports /></ProtectedRoute>
                } />

                {/* All authenticated users */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
