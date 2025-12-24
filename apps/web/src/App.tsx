import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { AuthLayout } from './components/layouts/AuthLayout';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePage } from './pages/SchedulePage';
import { PaymentsPage } from './pages/PaymentsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:slug" element={<CourseDetailPage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

