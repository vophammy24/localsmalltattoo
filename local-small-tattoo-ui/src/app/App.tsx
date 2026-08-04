import { Route, Routes } from "react-router";
import { PublicLayout } from "../components/layout/PublicLayout";
import { ComingSoonPage } from "../pages/ComingSoonPage";
import { HomePage } from "../pages/HomePage";
import { BookingPage } from "../pages/BookingPage";
import { AdminAuthProvider } from "../features/admin/auth/AdminAuthContext";
import { ProtectedAdminRoute } from "../components/admin/ProtectedAdminRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminBookingsPage } from "../pages/admin/AdminBookingsPage";
import { AdminBookingDetailPage } from "../pages/admin/AdminBookingDetailPage";
import { StylesPage } from "../pages/StylesPage";
import { AdminStylesPage } from "../pages/admin/AdminStylesPage";
import { AdminStyleFormPage } from "../pages/admin/AdminStyleFormPage";

export function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="styles" element={<StylesPage />} />
          <Route path="about" element={<ComingSoonPage />} />
          <Route path="artists" element={<ComingSoonPage />} />
          <Route path="artists/:slug" element={<ComingSoonPage />} />
          <Route path="gallery" element={<ComingSoonPage />} />
          <Route path="contact" element={<ComingSoonPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="bookings/:bookingId" element={<AdminBookingDetailPage />} />
            <Route path="styles" element={<AdminStylesPage />} />
            <Route path="styles/new" element={<AdminStyleFormPage />} />
            <Route path="styles/:styleId/edit" element={<AdminStyleFormPage />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
