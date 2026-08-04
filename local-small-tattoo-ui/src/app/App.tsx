import { Route, Routes } from "react-router";
import { PublicLayout } from "../components/layout/PublicLayout";
import { ComingSoonPage } from "../pages/ComingSoonPage";
import { HomePage } from "../pages/HomePage";

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="booking" element={<ComingSoonPage />} />
        <Route path="styles" element={<ComingSoonPage />} />
        <Route path="about" element={<ComingSoonPage />} />
        <Route path="artists" element={<ComingSoonPage />} />
        <Route path="artists/:slug" element={<ComingSoonPage />} />
        <Route path="gallery" element={<ComingSoonPage />} />
        <Route path="contact" element={<ComingSoonPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  );
}
