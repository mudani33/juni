import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Users } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import PageWrapper from "../layout/PageWrapper";

/**
 * StrictGate — Route guard that enforces Fellow onboarding completion.
 * In production, this would check against a backend-stored clearance status.
 * For the prototype, it uses localStorage to simulate gating.
 */
export default function StrictGate({ children }) {
  const navigate = useNavigate();
  const cleared = localStorage.getItem("juni_fellow_cleared") === "true";
  const hasApplication = !!localStorage.getItem("juni_fellow_application");

  if (cleared) return children;

  return (
    <PageWrapper className="max-w-lg mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <Card className="!bg-gradient-to-br !from-gold-bg !to-amber-bg/50 !border-gold/20">
          <div className="flex flex-col items-center gap-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center">
              <ShieldAlert size={32} className="text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-dark mb-2">
                {hasApplication ? "Background Screening Required" : "Application Required"}
              </h2>
              <p className="text-sm text-mid font-light leading-relaxed max-w-sm mx-auto mb-6">
                {hasApplication
                  ? "All Fellows must complete Juni's comprehensive background screening before accessing the Fellow Portal. This includes identity verification, criminal checks, drug screening, and safety training."
                  : "To access the Fellow Portal, you need to submit your application first. It only takes 5 minutes."}
              </p>
            </div>
            {hasApplication ? (
              <Button variant="blue" size="lg" onClick={() => navigate("/fellow/onboarding")}>
                Continue Screening <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="blue" size="lg" onClick={() => navigate("/fellow/signup")}>
                <Users size={16} /> Apply to Be a Fellow
              </Button>
            )}
            <p className="text-xs text-muted">
              Already completed? Contact support@juni.com
            </p>
          </div>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}
