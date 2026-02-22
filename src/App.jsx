import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/layout/Header";
import Landing from "./components/landing/Landing";
import VibeCheck from "./components/onboarding/VibeCheck";
import FellowSignup from "./components/onboarding/FellowSignup";
import FellowOnboarding from "./components/onboarding/FellowOnboarding";
import FamilySignup from "./components/onboarding/FamilySignup";
import FamilyPortal from "./components/family/FamilyPortal";
import FellowPortal from "./components/fellow/FellowPortal";
import PartnerPortal from "./components/partner/PartnerPortal";
import EmployerLanding from "./components/employer/EmployerLanding";
import EmployerPortal from "./components/employer/EmployerPortal";
import StrictGate from "./components/onboarding/StrictGate";
import AdminPortal from "./components/admin/AdminPortal";
import Login from "./components/auth/Login";

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
              <Route path="/family/signup" element={<FamilySignup />} />
              <Route path="/family" element={<FamilyPortal />} />
              <Route path="/companion/signup" element={<FellowSignup />} />
              <Route path="/companion/onboarding" element={<FellowOnboarding />} />
              <Route path="/companion" element={<FellowPortal />} />
              <Route path="/partner" element={<PartnerPortal />} />
              <Route path="/employers" element={<EmployerLanding />} />
              <Route path="/employer" element={<EmployerPortal />} />
              <Route path="/admin" element={<AdminPortal />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}
