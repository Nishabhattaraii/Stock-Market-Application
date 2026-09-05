import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useAuth, AppProviders } from './providers';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CompaniesPage } from '../pages/CompaniesPage';
import { CompanyDetailPage } from '../pages/CompanyDetailPage';
import { ComparisonPage } from '../pages/ComparisonPage';
import { NewsPage } from '../pages/NewsPage';
import { CrawlMonitoringPage } from '../pages/CrawlMonitoringPage';
import { CorrectionsPage } from '../pages/CorrectionsPage';
import { UsersPage } from '../pages/UsersPage';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SkeletonLoader rows={8} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'companies/:id', element: <CompanyDetailPage /> },
      { path: 'comparison', element: <ComparisonPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'crawls', element: <ProtectedRoute allowedRoles={['Admin', 'Analyst']}><CrawlMonitoringPage /></ProtectedRoute> },
      { path: 'corrections', element: <ProtectedRoute allowedRoles={['Admin', 'Analyst']}><CorrectionsPage /></ProtectedRoute> },
      { path: 'users', element: <ProtectedRoute allowedRoles={['Admin']}><UsersPage /></ProtectedRoute> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};
