import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/booking.css";
import "./styles/admin.css";
import "./styles/styles-page.css";
import "./styles/artists.css";
import "./styles/gallery.css";
import "./styles/about.css";
import "./styles/contact.css";
import "./styles/page-hero.css";
import "./styles/floating-actions.css";
import "./styles/mobile-audit.css";
import "./styles/spacing-system.css";
import "./styles/button-system.css";
import "./styles/website-intro.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
