import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/OtpInput";
import {
  verifyPasswordResetOtp,
  requestPasswordReset,
} from "@/services/authService";
import { getApiErrorMessage } from "@/api/apiError";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function VerifyResetOtp() {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const email: string = location.state?.email || "";

  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes to match backend OTP expiry
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/forget-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || !email || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await requestPasswordReset({ email });
      showToast("A new OTP has been sent to your email", "success");
      setTimeLeft(300);
      setOtp("");
      setApiError("");
    } catch (error: unknown) {
      showToast("Failed to resend OTP", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6 || isSubmitting) return;
    if (!email) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const response = await verifyPasswordResetOtp({ email, otp });

      showToast("OTP verified successfully", "success");

      navigate("/reset-password", {
        state: { resetToken: response.resetToken },
        replace: true,
      });
    } catch (error: unknown) {
      const message = getApiErrorMessage(error);
      setApiError(message);
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
            to="/forget-password"
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
            to="/forget-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
              <Mail size={30} strokeWidth={1.8} />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Verification
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Enter your OTP
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
              We've sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Enter it below to proceed.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <OtpInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={isSubmitting}
              />

              {apiError && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {apiError}
                </div>
              )}

              {/* Expiry & Resend */}
              <div className="flex flex-col items-center space-y-2 text-xs">
                {timeLeft > 0 ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Code expires in:</span>
                    <span className="font-semibold text-foreground">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-destructive">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-semibold">OTP expired</span>
                  </div>
                )}

                <div className="text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timeLeft > 0 || isSubmitting}
                    className="font-medium text-primary hover:underline transition-opacity disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed ml-1"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={otp.length < 6 || isSubmitting}
                className="h-12 w-full rounded-xl font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify OTP
                    <ArrowRight size={17} />
                  </span>
                )}
              </Button>
            </form>

            <div className="my-6 border-t border-border" />

            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{" "}
              <Link
                to="/forget-password"
                className="font-semibold text-primary transition-colors hover:opacity-80"
              >
                Go back
              </Link>
            </p>
          </div>

          {/* Security note */}
          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            <ShieldCheck
              size={14}
              className="mr-1 inline-block align-text-bottom"
            />
            Your account security matters. Never share your OTP with anyone.
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
