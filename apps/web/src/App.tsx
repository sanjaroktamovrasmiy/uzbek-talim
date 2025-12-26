import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { AuthLayout } from './components/layouts/AuthLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { DashboardCoursesPage } from './pages/DashboardCoursesPage';
import { DashboardCourseDetailPage } from './pages/DashboardCourseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePage } from './pages/SchedulePage';
import { TestsPage } from './pages/TestsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminStatsPage } from './pages/admin/AdminStatsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { AuthProvider } from './components/auth/AuthProvider';
import { GuestRoute } from './components/auth/GuestRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        {/* Public routes - Guest sahifalar */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:slug" element={<CourseDetailPage />} />
        </Route>

        {/* Auth routes - faqat mehmon uchun */}
        <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes - Dashboard alohida layout bilan - MUTLOQ ALOHIDA */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          {/* Dashboard ichida alohida courses sahifalari */}
          <Route path="app/courses" element={<DashboardCoursesPage />} />
          <Route path="app/courses/:slug" element={<DashboardCourseDetailPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="stats" element={<AdminStatsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

