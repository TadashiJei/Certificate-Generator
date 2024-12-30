import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ResetPassword } from './components/auth/ResetPassword';
import { UpdatePassword } from './components/auth/UpdatePassword';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Overview } from './components/dashboard/Overview';
import { ProfilePage } from './components/profile/ProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { TemplateList } from './components/templates/TemplateList';
import { NewTemplatePage } from './components/templates/NewTemplatePage';
import { TemplateView } from './components/templates/TemplateView';
import { TemplateEditor } from './components/templates/TemplateEditor';
import { CertificateList } from './components/certificates/CertificateList';
import { NewCertificatePage } from './components/certificates/NewCertificatePage';
import { CertificateView } from './components/certificates/CertificateView';
import { CertificatesPage } from './components/certificates/CertificatesPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!auth.session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="templates">
                <Route index element={<TemplateList />} />
                <Route path="new" element={<NewTemplatePage />} />
                <Route path=":id" element={<TemplateView />} />
                <Route path=":id/edit" element={<TemplateEditor />} />
              </Route>
              <Route path="certificates">
                <Route index element={<CertificatesPage />} />
                <Route path="new" element={<NewCertificatePage />} />
                <Route path=":id" element={<CertificateView />} />
                <Route path="list" element={<CertificateList />} />
              </Route>
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;