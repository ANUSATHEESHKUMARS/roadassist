import { Wrench, ShieldCheck, Eye, EyeOff, User, ShieldAlert, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import type { RegisterFormType } from "@/types/formType";
import { register } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import apiClient from "@/services/apiClient";
import { getApiErrorMessage } from "@/api/apiError";
import { useToast } from "@/components/ui/toast/ToastProvider";
export default function Register() {
  const navigate = useNavigate();
  const {showToast} = useToast()
  const [showPassword, setShowpasword] = useState(false);
  const [apiError, setApiError] = useState("");

  const [role, setRole] = useState<"user" | "admin">("user");

  const [error, setError] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: "",
  });

  const [formData, setFormData] = useState<RegisterFormType>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError("");
    const newError = {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: "",
    };

    if (!formData.fullName.trim()) {
      newError.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newError.email = "Email is required";
    }
    if (!formData.phoneNumber.trim()) {
      newError.phoneNumber = "Phone number is required";
    }
    if (!formData.password) {
      newError.password = "password is required";
    }
    if (!formData.confirmPassword) {
      newError.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newError.confirmPassword = "Password do not match";
    }

    if (!formData.acceptedTerms) {
      newError.acceptedTerms = "You must accept the Terms & Conditions";
    }
    setError(newError);

    const hasError = Object.values(newError).some((error) => error !== "");

    if (hasError) {
      return;
    }

    const requestData = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      role : role,
    };
    console.log("REQUEST DATA:", requestData);

    try {
      await register(requestData);
      showToast("otp is sent to ur mail", "success")
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error: any) {
      console.log("REGISTER FAILED");
      console.log("STATUS:", error.response?.status);
      console.log("BACKEND ERROR:", error.response?.data);
      const meesage = getApiErrorMessage(error);
      setApiError(meesage);
    }
  };

  console.log(formData);

  const handleGoogleRegister = async (response: CredentialResponse) => {
    try {
      const idToken = response.credential;

      if (!idToken) {
        console.log("Google ID token not received");
        return;
      }

      const result = await apiClient.post("/auth/google", {
        idToken,
      });

      navigate("/user");
      console.log("Google registration successful:", result.data);
    } catch (error: any) {
      console.log("Google registration failed");
      console.log(error.response?.status);
      console.log(error.response?.data);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#060709] font-sans text-neutral-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-x-hidden">
      {/* Cinematic Full-Page Automotive Background with Depth Gradients */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
        style={{
          backgroundImage: `url('/asset/repair.jpg')`,
        }}
      />
      {/* High-Contrast Dual Darkness Overlay */}
      <div className="fixed inset-0 bg-[#060709]/85 backdrop-blur-[2px] z-0" />
      <div className="fixed inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/60 to-transparent z-0" />
      <div className="fixed inset-0 bg-radial-at-c from-transparent via-[#060709]/70 to-[#060709] z-0" />

      {/* Main Centered Composition Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* ================= LEFT SECTION: BRANDING & PLATFORM HIGHLIGHTS ================= */}
        <div className="w-full lg:w-5/12 flex flex-col justify-between py-4 lg:py-8 space-y-8">
          <div>
            {/* Logo & Platform Name */}
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#0d0e12]/80 border border-[#1a1c24] backdrop-blur-md mb-6 shadow-inner">
              <div className="h-6 w-6 rounded-md bg-[#ff3b30] flex items-center justify-center text-white shadow-sm shadow-[#ff3b30]/30">
                <Wrench className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                ROADASSIST <span className="text-[#ff3b30] font-normal">ENTERPRISE</span>
              </span>
            </div>

            {/* Impact Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Roadside assistance, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-[#a1a1aa]">
                whenever you need it.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#a1a1aa] max-w-lg">
              Connect with certified mechanics, track rapid emergency dispatch in real time, and get back on the road faster.
            </p>
          </div>

          {/* Enterprise Metric Cards */}
          <div className="grid grid-cols-2 gap-3.5 pt-2 max-w-md">
            <div className="rounded-xl bg-[#0d0e12]/75 border border-[#1a1c24] backdrop-blur-md p-4 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa]">Response</span>
                <Activity className="h-4 w-4 text-[#ff3b30]" />
              </div>
              <div className="text-xl font-bold text-white tracking-tight">&lt; 15 mins</div>
              <span className="text-[11px] text-neutral-400 mt-0.5">Average dispatch time</span>
            </div>

            <div className="rounded-xl bg-[#0d0e12]/75 border border-[#1a1c24] backdrop-blur-md p-4 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa]">Coverage</span>
                <ShieldCheck className="h-4 w-4 text-[#ff3b30]" />
              </div>
              <div className="text-xl font-bold text-white tracking-tight">100% Certified</div>
              <span className="text-[11px] text-neutral-400 mt-0.5">Verified rescue fleet</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-3 pt-2 text-xs text-[#a1a1aa]">
            <Sparkles className="h-4 w-4 text-[#ff3b30]" />
            <span>24/7 nationwide telematics & rapid fleet dispatch</span>
          </div>
        </div>

        {/* ================= RIGHT SECTION: REGISTRATION GLASS CARD ================= */}
        <div className="w-full lg:w-7/12 max-w-xl">
          <div className="relative rounded-2xl bg-[#0d0e12]/90 border border-[#1a1c24] backdrop-blur-xl shadow-2xl p-6 sm:p-9">
            
            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Create Your Account
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
                Enter your credentials to register on RoadAssist Enterprise.
              </p>
            </div>

            {/* Role Selection Container */}
            <div className="mb-6">
              <Label className="text-xs font-medium text-neutral-300 block mb-2">
                Register as
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* User Role Card */}
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 ${
                    role === "user"
                      ? "border-[#ff3b30] bg-[#ff3b30]/10 shadow-[0_0_15px_rgba(255,59,48,0.15)] ring-1 ring-[#ff3b30]"
                      : "border-[#1a1c24] bg-[#060709]/60 hover:bg-[#1a1c24]/50 text-[#a1a1aa]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`h-4 w-4 ${role === "user" ? "text-[#ff3b30]" : "text-[#a1a1aa]"}`} />
                    <span className={`text-xs font-semibold ${role === "user" ? "text-white" : "text-neutral-300"}`}>
                      User
                    </span>
                  </div>
                  <span className="text-[11px] text-[#a1a1aa] leading-snug">
                    Personal roadside assistance
                  </span>
                </button>

                {/* Admin Role Card */}
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 ${
                    role === "admin"
                      ? "border-[#ff3b30] bg-[#ff3b30]/10 shadow-[0_0_15px_rgba(255,59,48,0.15)] ring-1 ring-[#ff3b30]"
                      : "border-[#1a1c24] bg-[#060709]/60 hover:bg-[#1a1c24]/50 text-[#a1a1aa]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className={`h-4 w-4 ${role === "admin" ? "text-[#ff3b30]" : "text-[#a1a1aa]"}`} />
                    <span className={`text-xs font-semibold ${role === "admin" ? "text-white" : "text-neutral-300"}`}>
                      Admin
                    </span>
                  </div>
                  <span className="text-[11px] text-[#a1a1aa] leading-snug">
                    Manage and operate the platform
                  </span>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* API Feedback Alert */}
              {apiError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-xs text-red-400 font-medium">
                    {apiError}
                  </p>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-neutral-300">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                  className="h-10 bg-[#060709]/80 border-[#1a1c24] text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
                />
                {error.fullName && (
                  <p className="text-xs text-red-500">{error.fullName}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-neutral-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    console.log("EMAIL INPUT:", e.target.value);
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    });
                  }}
                  className="h-10 bg-[#060709]/80 border-[#1a1c24] text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
                />
                {error.email && (
                  <p className="text-xs text-red-500">{error.email}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <Label htmlFor="mobile" className="text-xs font-medium text-neutral-300">
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="h-10 bg-[#060709]/80 border-[#1a1c24] text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
                />
                {error.phoneNumber && (
                  <p className="text-xs text-red-500">{error.phoneNumber}</p>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-neutral-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      className="h-10 bg-[#060709]/80 border-[#1a1c24] text-xs text-neutral-200 pr-9 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowpasword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {error.password && (
                    <p className="text-xs text-red-500">{error.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-neutral-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="h-10 bg-[#060709]/80 border-[#1a1c24] text-xs text-neutral-200 pr-9 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 cursor-default focus:outline-none"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  {error.confirmPassword && (
                    <p className="text-xs text-red-500">{error.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start space-x-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      acceptedTerms: checked === true,
                    })
                  }
                  className="mt-0.5 border-[#1a1c24] bg-[#060709] data-[state=checked]:bg-[#ff3b30] data-[state=checked]:border-[#ff3b30] h-4 w-4 rounded"
                />
                <div className="flex flex-col">
                  <label
                    htmlFor="terms"
                    className="text-xs leading-snug text-[#a1a1aa] cursor-pointer select-none"
                  >
                    I accept the{" "}
                    <span className="text-[#ff3b30] font-medium hover:underline">
                      Terms & Conditions
                    </span>{" "}
                    and Privacy Policy.
                  </label>
                  {error.acceptedTerms && (
                    <p className="text-xs text-red-500 mt-1">{error.acceptedTerms}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 bg-[#ff3b30] hover:bg-[#e62c25] active:scale-[0.99] text-white font-semibold text-xs tracking-wide rounded-lg shadow-lg shadow-[#ff3b30]/20 transition-all mt-3"
              >
                Register
              </Button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-[#1a1c24]" />
                <span className="absolute bg-[#0d0e12] px-3 text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                  OR
                </span>
              </div>

              {/* Google Login Component Container */}
              <div className="w-full flex justify-center py-0.5">
                <GoogleLogin
                  theme="filled_black"
                  shape="rectangular"
                  width="100%"
                  onSuccess={handleGoogleRegister}
                  onError={() => {
                    console.log("Google Login Failed");
                  }}
                />
              </div>

              {/* Login Navigation Link */}
              <p className="text-center text-xs text-[#a1a1aa] pt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#ff3b30] font-semibold hover:underline cursor-pointer ml-1 focus:outline-none"
                >
                  Login
                </button>
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}