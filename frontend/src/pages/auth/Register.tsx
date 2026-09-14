import { Wrench, MapPin, ShieldCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import type { RegisterFormType } from "@/types/formType";
import { register } from "@/services/authService";
import { useNavigate } from "react-router-dom";

export default function Register() {

const navigate = useNavigate();


  const [showPassword, setShowpasword] = useState(false)

  const [error, setError] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: ""
  })
  const [formData, setFormData] = useState<RegisterFormType>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false
  })




  const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newError = {
      fullName: '',
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: '',
      acceptedTerms: ""
    }

    if (!formData.fullName.trim()) {
      newError.fullName = "Full name is required"
    }
    if (!formData.email.trim()) {
      newError.email = "Email is required"
    }
    if (!formData.phoneNumber.trim()) {
      newError.phoneNumber = "Phone number is required"
    }
    if (!formData.password) {
      newError.password = "password is required"
    }
    if (!formData.confirmPassword) {
      newError.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newError.confirmPassword = "Password do not match"
    }

    if (!formData.acceptedTerms) {
    newError.acceptedTerms = "You must accept the Terms & Conditions";
}
    setError(newError)

    const hasError = Object.values(newError).some((error) => error !== "")

    if (hasError) {
      return
    }

    const requestData = {
      fullName : formData.fullName,
      email : formData.email,
      phoneNumber:formData.phoneNumber,
      password:formData.password
    }
console.log("REQUEST DATA:", requestData);

try {
  console.log("REQUEST DATA:", requestData);

  const response = await register(requestData);

   navigate('/verify-otp' , {state : {email : formData.email}})

  console.log("REGISTER SUCCESS:", response);

} catch (error: any) {

  console.log("REGISTER FAILED");
  console.log("STATUS:", error.response?.status);
  console.log("BACKEND ERROR:", error.response?.data);

}
  }
 console.log(formData)
  return (

    <div className="min-h-screen w-full bg-[#080808] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-neutral-100">
      {/* Centered Registration Card */}
      <div className="w-full max-w-[1020px] bg-[#111113] border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* ================= LEFT SECTION ================= */}
        <div className="w-full md:w-5/12 bg-[#0d0d0f] border-b md:border-b-0 md:border-r border-neutral-800/60 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Logo & Branding */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="h-7 w-7 rounded-md bg-[#ff3b30] flex items-center justify-center text-white shadow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight text-white">
                RoadAssist
              </span>
            </div>

            {/* Vehicle Image Card with Floating Badge */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-900 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80"
                alt="Roadside Assistance Vehicle"
                className="w-full h-52 object-cover object-center brightness-90"
              />

              {/* Service Coverage Overlay Card */}
              <div className="absolute bottom-3 left-3 right-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-700/50 rounded-lg p-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-900/90 border border-neutral-700/60 flex items-center justify-center text-[#ff3b30] shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-neutral-400 leading-tight">
                      Service coverage
                    </span>
                    <span className="text-xs font-semibold text-white tracking-wide">
                      Every mile. Every day.
                    </span>
                  </div>
                </div>
                <div className="text-[#ff3b30] pr-1">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Heading & Supporting Text */}
          <div className="mt-12 md:mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
              Reliable support <br />
              on every mile.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">
              From engine failures to flat tires, we bridge the gap between distress
              and resolution with real-time tracking.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SECTION ================= */}
        <div className="w-full md:w-7/12 p-8 lg:p-12 flex flex-col justify-center bg-[#111113]">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl lg:text-[26px] font-bold tracking-tight text-white">
              Create Your Account
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Register to access emergency roadside assistance.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-neutral-300">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="enter ur name"
                value={formData.fullName}
                onChange={(e) => setFormData({
                  ...formData,
                  fullName: e.target.value
                })}
                className="h-10 bg-[#0c0c0e] border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
              />

              {error.fullName && (
                <p className="text-xs text-red-500">
                  {error.fullName}
                  </p>
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
                placeholder="email@example.com"
                value={formData.email}
               onChange={(e) => {
  console.log("EMAIL INPUT:", e.target.value);

  setFormData({
    ...formData,
    email: e.target.value
  });
}}
                className="h-10 bg-[#0c0c0e] border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
              />


              {error.email && (
                <p className="text-xs text-red-500">
                  {error.email}
                </p>
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
                onChange={(e) => setFormData({
                  ...formData,
                  phoneNumber: e.target.value
                })}
                className="h-10 bg-[#0c0c0e] border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
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
                    onChange={(e) => setFormData({
                      ...formData,
                      password: e.target.value
                    })}
                    className="h-10 bg-[#0c0c0e] border-neutral-800 text-xs text-neutral-200 pr-9 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
                  />
                  {error.password && (
                    <p className="text-xs text-red-500">
                      {error.password}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowpasword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-400 focus:outline-none"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
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
                    onChange={(e) => setFormData({
                      ...formData,
                      confirmPassword: e.target.value
                    })}
                    className="h-10 bg-[#0c0c0e] border-neutral-800 text-xs text-neutral-200 pr-9 focus-visible:ring-1 focus-visible:ring-[#ff3b30] focus-visible:border-[#ff3b30]"
                  />
                  {error.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {error.confirmPassword}
                    </p>
                  )}
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-400 focus:outline-none"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-center space-x-2 pt-1 pb-1">
              <Checkbox
                id="terms"
                checked={formData.acceptedTerms}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  acceptedTerms: checked === true
                })}
                className="border-neutral-700 bg-[#0c0c0e] data-[state=checked]:bg-[#ff3b30] data-[state=checked]:border-[#ff3b30] h-4 w-4 rounded"
              />
              {error.acceptedTerms && (
                <p className="text-xs text-red-500">{error.acceptedTerms}</p>
              )}
              <label

                htmlFor="terms"
                className="text-[11px] leading-none text-neutral-400 font-normal cursor-pointer select-none"
              >
                I accept the{" "}
                <span className="text-[#ff3b30] font-medium cursor-pointer hover:underline">
                  Terms & Conditions
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-[#ff332c] hover:bg-[#e62c25] text-white font-medium text-xs rounded-md shadow-sm transition-colors mt-2"
            >
              Register
            </Button>

            {/* OR Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-neutral-800/80" />
              <span className="absolute bg-[#111113] px-2 text-[10px] uppercase tracking-wider text-neutral-500">
                OR
              </span>
            </div>

            {/* Google Authentication Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 bg-transparent border-neutral-800 hover:bg-neutral-800/40 text-neutral-200 text-xs font-normal rounded-md flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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
            </Button>

            {/* Login Link */}
            <p className="text-center text-[11px] text-neutral-400 pt-2">
              Already have an account?{" "}
              <span className="text-[#ff3b30] font-medium cursor-pointer hover:underline"
              onClick={() => navigate('/login')}>
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}