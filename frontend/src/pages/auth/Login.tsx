import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Truck,
  MapPin,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/services/authService";
import { data } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import apiClient from "@/services/apiClient";


export default function Login() {
  // Minimal UI form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isSubmitting , setIsSubmitting] = useState<boolean>(false)


  const navigate = useNavigate()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(isSubmitting){
        return
    }
    setIsSubmitting(true)

    try{
        const response = await login({
            email, password
        })
        console.log("login succes ayyii" , response)
        navigate('/user')

    }catch(error : any){
     console.log("login failed")
     console.log(error.response?.status)
     console.log("error", error.response?.data)
    }finally{
        setIsSubmitting(false)
    }
  };

 const handleGoogleLogin = async (response: CredentialResponse) => {
    try {
        const idToken = response.credential;

        if (!idToken) {
            console.log("Google ID token not received");
            return;
        }

        console.log("Google ID token:", idToken);

        const result = await apiClient.post("/auth/google", {
            idToken
        });
        navigate('/user')

        console.log("Google login successful:", result.data);

    } catch (error: any) {
        console.log("Google login failed");
        console.log(error.response?.status);
        console.log(error.response?.data);
    }
};
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* ================= LEFT SECTION (BRANDING / VISUAL) ================= */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-6">
            {/* Roadside Assistance Illustration Card */}
            <div className="w-full max-w-sm sm:max-w-md aspect-[4/3] bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
              {/* Radar/Grid ambient background pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Card Header Tag */}
              <div className="relative z-10 flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                    Active Dispatch Network
                  </span>
                </div>
                <Compass className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Visual Asset Container (Replace or swap with your custom SVG / image asset) */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center">
                <div className="relative">
                  {/* Vehicle base badge */}
                  <div className="w-24 h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center shadow-inner">
                    <Truck className="h-12 w-12 text-primary" />
                  </div>
                  {/* Location tracking indicator */}
                  <div className="absolute -top-2 -right-2 bg-card border border-border p-2 rounded-full shadow-md text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  {/* Security badge */}
                  <div className="absolute -bottom-2 -left-2 bg-card border border-border p-2 rounded-full shadow-md text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  <span>GPS Tracking</span>
                  <span>•</span>
                  <span>24/7 Response</span>
                </div>
              </div>

              {/* Decorative Continue Button (Visual reference from mockup) */}
              <div className="relative z-10 w-full py-2.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg border border-border text-center shadow-sm">
                Real-Time Assistance En Route
              </div>
            </div>

            {/* Supporting Brand Copy */}
            <div className="max-w-sm sm:max-w-md space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                RoadAssist
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Premium roadside assistance, redefined for the modern driver. Calm, clarity, and speed in every emergency.
              </p>
            </div>
          </div>

          {/* ================= RIGHT SECTION (LOGIN FORM) ================= */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-2xl">
              {/* Form Heading */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-card-foreground">
                  Welcome Back
                </h1>
                <p className="text-xs text-muted-foreground mt-2">
                  Sign in to access roadside assistance services.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="pl-10 h-11 bg-input border-border text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring rounded-lg"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-input border-border text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring rounded-lg"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1 pb-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-xs text-muted-foreground cursor-pointer select-none font-normal"
                    >
                      Remember Me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Primary Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold text-xs rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? "Signing in.." : "login"}
                </Button>

                {/* Divider */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="w-full border-t border-border" />
                  <span className="absolute bg-card px-3 text-[11px] text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                {/* Continue with Google Button */}
                {/* <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 bg-secondary border-border text-foreground hover:bg-muted text-xs font-normal rounded-lg flex items-center justify-center gap-2.5 transition-colors"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </Button> */}

                <GoogleLogin
    onSuccess={handleGoogleLogin}
    onError={() => {
        console.log("Google Login Failed");
    }}
/>

                {/* Registration Link */}
                <p className="text-center text-xs text-muted-foreground pt-4">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-primary font-medium hover:underline transition-all"
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
      <footer className="w-full px-6 py-5 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="font-semibold text-foreground">RoadAssist</span>
            <button type="button" className="hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button type="button" className="hover:text-foreground transition-colors">
              Safety Center
            </button>
            <button type="button" className="hover:text-foreground transition-colors">
              Contact Us
            </button>
          </div>
          <div>
            © 2026 RoadAssist Enterprise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}