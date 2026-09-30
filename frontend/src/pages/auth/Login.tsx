import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Compass,
  ArrowRight,
  Clock,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login, getCurrentUser } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import apiClient from "@/services/apiClient";

export default function Login() {

  const {showToast} = useToast()
  // Minimal UI form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await login({
        email,
        password,
      });
      console.log("login succes ayyii", response);
 const userResponse = await getCurrentUser();
const user = userResponse.data;

console.log("LOGIN USER:", user);
console.log("LOGIN ROLE:", user.role);

setUser(user);

showToast("Login successful", "success");

if (user.role === "superadmin") {
    console.log("GOING TO SUPER ADMIN");
    navigate("/superadmin/admins", { replace: true });
} else if (user.role === "admin") {
    console.log("GOING TO ADMIN");
    navigate("/admin/users", { replace: true });
} else {
    console.log("GOING TO USER");
    navigate("/user", { replace: true });
}
    } catch (error: any) {
      console.log("login failed");
      console.log(error.response?.status);
      console.log("error", error.response?.data);

       showToast(
    "Login failed. Please check your credentials.",
    "error"
  );
    } finally {
      setIsSubmitting(false);
    }
  };
const handleGoogleLogin = async (response: CredentialResponse) => {
  try {
    const idToken = response.credential;

    if (!idToken) {
      console.log("Google ID token not received");
      return;
    }

    const result = await apiClient.post("/auth/google", {
      idToken,
    });

    console.log("Google login successful:", result.data);

    const userResponse = await getCurrentUser();
    const user = userResponse.data;

    console.log("GOOGLE USER:", user);
    console.log("GOOGLE ROLE:", user.role);

    setUser(user);

    if (user.role === "superadmin") {
      navigate("/superadmin/admins", { replace: true });
    } else if (user.role === "admin") {
      navigate("/admin/users", { replace: true });
    } else {
      navigate("/user", { replace: true });
    }

  } catch (error: any) {
    console.log("Google login failed");
    console.log(error.response?.status);
    console.log(error.response?.data);
  }
};

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#060709] text-white selection:bg-[#ff3b30] selection:text-white font-sans overflow-x-hidden">
      {/* ================= FULL-PAGE AUTOMOTIVE BACKGROUND & OVERLAYS ================= */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{ backgroundImage: `url('/asset/loginpage.jpg')` }}
      />
      {/* Layered cinematic overlays: dark scrim + vignette + radial spotlight */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#060709]/95 via-[#060709]/85 to-[#060709]/95 lg:from-[#060709]/90 lg:via-[#060709]/70 lg:to-[#060709]/95 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(255,59,48,0.12),transparent_50%)] pointer-events-none z-0" />

      {/* ================= TOP NAVIGATION / BRAND HEADER ================= */}
      <header className="relative z-10 w-full px-6 sm:px-10 lg:px-16 pt-8 pb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#ff3b30] to-[#b31b12] flex items-center justify-center shadow-lg shadow-[#ff3b30]/20 border border-[#ff3b30]/30">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                ROADASSIST
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#ff3b30]">
                Enterprise
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d0e12]/80 border border-[#1a1c24] backdrop-blur-md text-[11px] font-medium text-[#a1a1aa]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            24/7 Global Dispatch Operational
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* ================= LEFT SECTION (BRANDING / MARKETING) ================= */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-8 text-left max-w-xl mx-auto lg:mx-0">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#1a1c24]/80 border border-[#ff3b30]/30 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-300">
                Next-Gen Automotive Mobility
              </span>
            </div>

            {/* Main Statement */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Your road. <br />
                <span className="bg-gradient-to-r from-white via-zinc-200 to-[#a1a1aa] bg-clip-text text-transparent">
                  Our assistance.
                </span>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-[#a1a1aa] max-w-lg">
                Get reliable roadside assistance and connect with trusted mechanics whenever you need help. Engineered for speed, transparency, and complete peace of mind.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0d0e12]/70 border border-[#1a1c24] backdrop-blur-sm">
                <Clock className="h-4 w-4 text-[#ff3b30] mb-2" />
                <p className="text-xs font-semibold text-white">Under 15 Min</p>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">Average dispatch response</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0e12]/70 border border-[#1a1c24] backdrop-blur-sm">
                <Wrench className="h-4 w-4 text-[#ff3b30] mb-2" />
                <p className="text-xs font-semibold text-white">Certified Techs</p>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">Vetted master mechanics</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0e12]/70 border border-[#1a1c24] backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-[#ff3b30] mb-2" />
                <p className="text-xs font-semibold text-white">Guaranteed</p>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">Enterprise fleet grade</p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SECTION (LOGIN CARD) ================= */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-[#0d0e12]/90 backdrop-blur-xl border border-[#1a1c24] rounded-2xl p-7 sm:p-9 shadow-2xl shadow-black/80 relative overflow-hidden">
              {/* Subtle card top glow accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff3b30]/70 to-transparent" />

              {/* Form Heading */}
              <div className="mb-7">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome Back
                </h2>
                <p className="text-xs text-[#a1a1aa] mt-1.5">
                  Sign in to access your roadside assistance services.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-zinc-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa] pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="pl-10 h-11 bg-[#060709]/80 border-[#1a1c24] text-xs text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30] rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-zinc-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa] pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-[#060709]/80 border-[#1a1c24] text-xs text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30] rounded-xl transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1 pb-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                      className="border-[#1a1c24] data-[state=checked]:bg-[#ff3b30] data-[state=checked]:border-[#ff3b30]"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-xs text-[#a1a1aa] hover:text-zinc-300 cursor-pointer select-none font-normal transition-colors"
                    >
                      Remember Me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#a1a1aa] hover:text-[#ff3b30] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Primary Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#ff3b30] hover:bg-[#e03429] text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#ff3b30]/25 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? "Signing in.." : "login"}</span>
                  {!isSubmitting && (
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-5 flex items-center justify-center">
                  <div className="w-full border-t border-[#1a1c24]" />
                  <span className="absolute bg-[#0d0e12] px-3 text-[11px] uppercase tracking-wider text-zinc-500">
                    Or continue with
                  </span>
                </div>

                {/* Google Login Component */}
                <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:mx-auto">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      console.log("Google Login Failed");
                    }}
                    theme="filled_black"
                    shape="rectangular"
                    size="large"
                    width="100%"
                  />
                </div>

                {/* Registration Link */}
                <p className="text-center text-xs text-[#a1a1aa] pt-4">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-[#ff3b30] font-semibold hover:underline transition-all"
                  >
                    Register
                  </button>
                </p>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 w-full px-6 py-5 border-t border-[#1a1c24]/80 text-[11px] text-[#a1a1aa] bg-[#060709]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="font-semibold text-white">RoadAssist Enterprise</span>
            <button type="button" className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <button type="button" className="hover:text-white transition-colors">
              Safety Center
            </button>
            <button type="button" className="hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
          <div className="text-zinc-500">
            © 2026 RoadAssist Enterprise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}