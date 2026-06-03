import { createHashRouter, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUpload from '../pages/admin/AdminUpload';
import AdminManage from '../pages/admin/AdminManage';
import AdminActivity from '../pages/admin/AdminActivity';
import AdminAnnouncements from '../pages/admin/AdminAnnouncements';
import ProfilePage from '../pages/ProfilePage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';

export const router = createHashRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/student',
    children: [
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/admin',
    children: [
      {
        path: 'dashboard',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: 'upload',
        element: (
          <AdminRoute>
            <AdminUpload />
          </AdminRoute>
        ),
      },
      {
        path: 'manage',
        element: (
          <AdminRoute>
            <AdminManage />
          </AdminRoute>
        ),
      },
      {
        path: 'activity',
        element: (
          <AdminRoute>
            <AdminActivity />
          </AdminRoute>
        ),
      },
      {
        path: 'announcements',
        element: (
          <AdminRoute>
            <AdminAnnouncements />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
