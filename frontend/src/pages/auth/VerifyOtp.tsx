import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Truck,
  MapPin,
  Wrench,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/OtpInput";
import { verifyOtp, resendOtp } from "@/services/authService";
import { useLocation , useNavigate } from "react-router-dom";


interface VerifyOtpProps {
 
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function VerifyOtp({
 
  onBack,
  onSuccess,
}: VerifyOtpProps) {

  const location = useLocation()
  const navigate = useNavigate()

  const email = location.state?.email || ""

  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Timer countdown
useEffect(() => {
  if (timeLeft <= 0) {
    return;
  }

  const interval = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timeLeft]);


  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

 const handleResendOtp = async () =>{
  if(timeLeft > 0 || !email || isSubmitting){
    return
  }
  try{
    setIsSubmitting(true)

    const response = await resendOtp({
      email , 
      purpose:"EMAIL_VERIFICATION"
    })
    console.log("resend otp succes", response)
    setTimeLeft(60);
    setOtp("")
  }catch(error : any){
    console.log("resend otp failed")
    console.log(error.response?.status)
    console.log(error.response?.data)
  }finally {
    setIsSubmitting(false)
  }
 }

  const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();

  if (otp.length !== 6 || isSubmitting) {
    return;
  }

  if (!email) {
    console.log("Email is missing");
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await verifyOtp({
      email,
      otp,
      purpose: "EMAIL_VERIFICATION",
    });

    console.log("OTP VERIFICATION SUCCESS:", response);

    navigate('/user')
    if (onSuccess) {
      onSuccess();
    }

  } catch (error: any) {

    console.log("OTP VERIFICATION FAILED");
    console.log("STATUS:", error.response?.status);
    console.log("ERROR:", error.response?.data);

  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* ================= HEADER ================= */}
      <header className="w-full px-6 py-4 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Registration</span>
          </button>

          <div className="text-base font-bold tracking-tight text-primary">
            RoadAssist
          </div>

          <div className="w-32 hidden sm:block" aria-hidden="true" />
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* LEFT SIDE: Visual Placeholder & Secure Messaging */}
          <div className="hidden lg:flex flex-col items-center text-center p-6 space-y-6">
            <div className="w-full max-w-sm aspect-square bg-card border border-border/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
              {/* Map/Grid Ambient Pattern */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Status Header Indicator */}
              <div className="relative z-10 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Dispatcher Radar
                  </span>
                </div>
                <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              {/* Illustration Center Visual */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-border shadow-inner">
                    <Truck className="h-9 w-9 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-card border border-border p-1.5 rounded-full text-foreground shadow-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 bg-card border border-border p-1.5 rounded-full text-foreground shadow-sm">
                    <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
                <span className="mt-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Ready for Dispatch
                </span>
              </div>

              {/* Secure Token Indicator */}
              <div className="relative z-10 w-full py-2 bg-muted/60 border border-border/60 rounded-lg flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Encrypted Dispatch Link
                </span>
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Secure Verification
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                We prioritize your security. Verify your email address to ensure we can reliably reach you when you need assistance.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: OTP Verification Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
              
              {/* Security Shield Icon */}
              <div className="flex justify-center mb-5">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Card Headings */}
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-xl font-bold tracking-tight text-card-foreground">
                  Verify Your Email Address
                </h1>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Enter the 6-digit verification code sent to{" "}
                  <span className="text-foreground font-medium">
                    {email || "your registered email address"}
                  </span>
                  .
                </p>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                  disabled={isSubmitting}
                />

                {/* Expiry & Resend OTP Actions */}
                <div className="flex flex-col items-center space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Code expires in:</span>
                    <span className="font-semibold text-foreground">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>

                  <div className="text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={otp.length < 6 || isSubmitting}
                  className="w-full h-11 bg-primary text-primary-foreground font-medium text-xs rounded-xl shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Verifying..." : "Verify OTP"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Subtle Divider */}
              <div className="my-6 border-t border-border" />

              {/* Support Contact */}
              <div className="text-center text-xs text-muted-foreground">
                Having trouble?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full px-6 py-6 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="font-semibold text-foreground">RoadAssist</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Safety Center
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact Us
            </a>
          </div>
          <div className="text-center md:text-right">
            © 2026 RoadAssist Enterprise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}