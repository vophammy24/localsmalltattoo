import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { BackToTopButton } from "../common/BackToTopButton";
import { FloatingContactButtons } from "../common/FloatingContactButtons";
import { WebsiteIntro } from "../common/WebsiteIntro";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LegalDocuments } from "../legal/LegalDocuments";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <WebsiteIntro />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingContactButtons />
      <BackToTopButton />
      <LegalDocuments />
    </>
  );
}
