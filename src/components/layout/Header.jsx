import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Heart, Handshake, Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import Avatar from "../ui/Avatar";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/family", label: "Family", icon: Heart, color: "text-sage" },
  { path: "/companion", label: "Companion", icon: Users, color: "text-blue" },
  { path: "/partner", label: "Partner", icon: Handshake, color: "text-amber" },
  { path: "/employer", label: "Employer", icon: Building2, color: "text-purple" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const portalMeta = {
    "/family/signup": { label: "Family Sign Up", color: "text-sage" },
    "/family": { label: "Family Portal", color: "text-sage" },
    "/companion/signup": { label: "Companion Application", color: "text-blue" },
    "/companion/onboarding": { label: "Companion Screening", color: "text-blue" },
    "/companion": { label: "Companion Portal", color: "text-blue" },
    "/partner": { label: "Trust Partner Portal", color: "text-amber" },
    "/employer": { label: "Employer Portal", color: "text-purple" },
    "/onboarding": { label: "Vibe Check", color: "text-sage" },
  };

  const currentMeta = Object.entries(portalMeta).find(([k]) => location.pathname.startsWith(k));
  const avatarInitials = location.pathname.startsWith("/companion") ? "SC"
    : location.pathname.startsWith("/partner") ? "MW"
    : location.pathname.startsWith("/employer") ? "RT" : "LR";

  return (
    <header className="bg-warm-white border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-warm-white/95">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage to-sage-soft flex items-center justify-center text-white text-sm font-bold font-serif shadow-sm group-hover:shadow-md transition-shadow">
            J
          </div>
          <span className="font-serif text-xl font-semibold text-dark tracking-tight hidden sm:inline">Juni</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-bg/60 rounded-xl p-1">
          {navItems.map(({ path, label, icon: Icon, color }) => {
            const isActive = path === "/"
              ? location.pathname === "/" || location.pathname === "/onboarding"
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans transition-all duration-200 no-underline",
                  isActive
                    ? `bg-warm-white shadow-sm font-semibold ${color || "text-sage"}`
                    : "text-muted hover:text-dark",
                )}
              >
                <Icon size={14} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {currentMeta && (
            <span className={cn("text-xs font-medium hidden lg:inline", currentMeta[1].color)}>
              {currentMeta[1].label}
            </span>
          )}
          <Avatar initials={avatarInitials} size="sm" color="bg" />

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-bg transition-colors border-none bg-transparent cursor-pointer text-mid"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-warm-white animate-slide-down">
          <nav className="flex flex-col p-3 gap-1">
            {navItems.map(({ path, label, icon: Icon, color }) => {
              const isActive = path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans transition-all duration-200 no-underline",
                    isActive
                      ? `bg-sage-bg font-semibold ${color || "text-sage"}`
                      : "text-mid hover:bg-bg",
                  )}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
