import { APP_CONFIG } from "@/constants/constants";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [staffCode, setStaffCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, setUser } = useAuthStore();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Get tokens
      const loginResponse = await axios.post(
        "/api/auth/login/",
        {
          staff_code: staffCode,
          password: password,
        }
      );

      const { access, refresh } = loginResponse.data;
      setTokens(access, refresh);

      // 2. Get User Details
      // apiClient will now automatically use the token we just set in the store
      const userResponse = await apiClient.get("/users/me/");
      setUser(userResponse.data);

      toast.success("Logged in successfully");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login failed", err);
      let message = "Failed to login. Please check your credentials.";
      if (err.response?.data?.detail) {
        message = err.response.data.detail;
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 relative overflow-hidden">
      {/* Subtle hex / gradient style background */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-linear-to-br from-blue-50 to-slate-50 blur-3xl" />
        <div className="absolute top-20 right-[-10%] h-[480px] w-[480px] rounded-full bg-linear-to-bl from-slate-50 via-white to-blue-50 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-blue-100">
            {/* <span className="text-xs font-semibold text-blue-700">NRB</span> */}
            <img src="/logo.png" alt="Logo" />
          </div>
          <h1 className="mt-4 text-center text-xl font-semibold text-slate-900 sm:text-2xl">
            {APP_CONFIG.fullname}
          </h1>
        </div>

        {/* Card */}
        <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-slate-200/80 ring-1 ring-slate-100 backdrop-blur sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Login to your account
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Username/Staff Code */}
            <div className="space-y-1.5">
              <label
                htmlFor="staffCode"
                className="block text-sm font-medium text-slate-700"
              >
                Staff Code
              </label>
              <input
                id="staffCode"
                name="staffCode"
                type="text"
                placeholder="Enter your staff code"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                required
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-xs outline-none transition focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
