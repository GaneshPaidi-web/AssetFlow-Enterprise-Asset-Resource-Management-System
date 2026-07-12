import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext';
import { AppLayout } from './app/components/layout/AppLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// ERP Pages
import { Dashboard } from './pages/Dashboard';
import { Organization } from './pages/Organization';
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
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Authenticated ERP Routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/organization" element={<Organization />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/allocation" element={<AllocationPage />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
