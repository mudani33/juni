import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/layout/Header";
import Landing from "./components/landing/Landing";
import VibeCheck from "./components/onboarding/VibeCheck";
import FellowOnboarding from "./components/onboarding/FellowOnboarding";
import FamilyPortal from "./components/family/FamilyPortal";
import FellowPortal from "./components/fellow/FellowPortal";
import PartnerPortal from "./components/partner/PartnerPortal";

export default function JuniPlatform() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream font-sans">
        <Header />
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/onboarding" element={<VibeCheck />} />
              <Route path="/family" element={<FamilyPortal />} />
              <Route path="/fellow/onboarding" element={<FellowOnboarding />} />
              <Route path="/fellow" element={<FellowPortal />} />
              <Route path="/partner" element={<PartnerPortal />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}
