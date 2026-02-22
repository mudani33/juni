import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react";
import api, { ApiError } from "../../lib/api";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Input } from "../ui/Input";

const ROLE_REDIRECT = {
  ADMIN: "/admin",
  FAMILY: "/family",
  COMPANION: "/companion",
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await api.auth.login(email.trim(), password);
      const redirect = ROLE_REDIRECT[user.role] ?? "/";
      navigate(redirect, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Invalid email or password."
            : err.status === 429
            ? "Too many attempts. Please wait a moment and try again."
            : err.message,
        );
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16 bg-cream">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sage to-sage-soft flex items-center justify-center text-white text-2xl font-bold font-serif shadow-md mb-4">
            J
          </div>
          <h1 className="font-serif text-3xl font-semibold text-dark m-0">Welcome back</h1>
          <p className="text-sm text-muted mt-2 m-0">Sign in to your Juni account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div>
              <label className="block text-[13px] font-medium text-mid mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full py-3.5 px-4.5 pr-12 rounded-xl border border-border font-sans text-sm text-dark bg-warm-white outline-none transition-all duration-200 focus:border-sage focus:ring-2 focus:ring-sage/10 placeholder:text-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors border-none bg-transparent cursor-pointer p-0"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-danger-bg border border-danger/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger font-medium m-0">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !email || !password}
              className="w-full mt-1"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-bg text-center">
            <Link
              to="/auth/forgot-password"
              className="text-xs text-muted hover:text-sage transition-colors no-underline"
            >
              Forgot your password?
            </Link>
          </div>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          New to Juni?{" "}
          <Link to="/onboarding" className="text-sage font-semibold no-underline hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
