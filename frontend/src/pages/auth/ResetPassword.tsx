import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/services/authService";
import { getApiErrorMessage } from "@/api/apiError";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function ResetPassword() {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const resetToken: string = location.state?.resetToken || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if no reset token was provided
  useEffect(() => {
    if (!resetToken) {
      navigate("/forget-password", { replace: true });
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ resetToken, newPassword });

      showToast("Password reset successfully! Please log in.", "success");
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="RoadAssist home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck size={23} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">RoadAssist</h1>
              <p className="text-xs text-muted-foreground">Enterprise</p>
            </div>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to login</span>
            <span className="sm:hidden">Login</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
              <Lock size={30} strokeWidth={1.8} />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Almost there
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Set a new password
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
              Create a strong password with at least 8 characters to secure your
              account.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !newPassword || !confirmPassword}
                className="h-12 w-full rounded-xl font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Resetting password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Reset Password
                    <ArrowRight size={17} />
                  </span>
                )}
              </Button>
            </form>

            <div className="my-6 border-t border-border" />

            <p className="text-center text-sm text-muted-foreground">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary transition-colors hover:opacity-80"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Security note */}
          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            <ShieldCheck
              size={14}
              className="mr-1 inline-block align-text-bottom"
            />
            Choose a strong, unique password you haven't used elsewhere.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} RoadAssist Enterprise. All rights
        reserved.
      </footer>
    </main>
  );
}
