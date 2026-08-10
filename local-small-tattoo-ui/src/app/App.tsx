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
import { AboutPage } from "../pages/AboutPage";
import { GalleryPage } from "../pages/GalleryPage";
import { AdminGalleryPage } from "../pages/admin/AdminGalleryPage";
import { AdminGalleryUploadPage } from "../pages/admin/AdminGalleryUploadPage";
import { AdminGalleryEditPage } from "../pages/admin/AdminGalleryEditPage";
import { AdminAboutPage } from "../pages/admin/AdminAboutPage";
import { BusinessSettingsProvider } from "../features/businessSettings/BusinessSettingsContext";
import { ContactPage } from "../pages/ContactPage";
import { AdminBusinessSettingsPage } from "../pages/admin/AdminBusinessSettingsPage";
import { AdminHomeContentPage } from "../pages/admin/AdminHomeContentPage";
import { AdminNotificationProvider } from "../features/admin/notifications/AdminNotificationProvider";
import { AdminReviewsPage } from "../pages/admin/AdminReviewsPage";

export function App() {
  return (
    <BusinessSettingsProvider>
      <AdminNotificationProvider>
        <AdminAuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="booking" element={<BookingPage />} />
              <Route path="styles" element={<StylesPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="contact" element={<ContactPage />} />
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
                <Route path="gallery" element={<AdminGalleryPage />} />
                <Route path="gallery/upload" element={<AdminGalleryUploadPage />} />
                <Route path="gallery/:galleryItemId/edit" element={<AdminGalleryEditPage />} />
                <Route path="content/about" element={<AdminAboutPage />} />
                <Route path="content/home" element={<AdminHomeContentPage />} />
                <Route path="settings/business" element={<AdminBusinessSettingsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
              </Route>
            </Route>
          </Routes>
        </AdminAuthProvider>
      </AdminNotificationProvider>
    </BusinessSettingsProvider>
  );
}
