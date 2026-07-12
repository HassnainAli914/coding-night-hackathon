import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/landing/ui/AuthLayout";
import { useAuth } from "../contexts/AuthContext";

export default function SignIn() {
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP States
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpChannel, setOtpChannel] = useState("email"); // "email" or "sms"
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithPhone, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (loginMethod === "email") {
        const res = await login(email, password);
        if (res.success) {
          if (res.requiresOtp) {
            setRequiresOtp(true);
            setOtpChannel("email");
          } else {
            navigate("/dashboard");
          }
        } else {
          setError(res.message);
        }
      } else {
        const res = await loginWithPhone(phone, password);
        if (res.success) {
          setRequiresOtp(true);
          setOtpChannel("sms");
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const targetPhone = loginMethod === "phone" ? phone : undefined;
      const targetEmail = loginMethod === "email" ? email : undefined;
      
      const res = await verifyOtp(otpCode, otpChannel, targetPhone, targetEmail);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      const targetPhone = loginMethod === "phone" ? phone : undefined;
      const targetEmail = loginMethod === "email" ? email : undefined;
      const res = await resendOtp(otpChannel, targetPhone, targetEmail);
      if (res.success) {
        alert("Verification code resent successfully!");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to resend verification code.");
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          {requiresOtp ? "Verify OTP" : "Sign in to your account"}
        </h1>
      </div>
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {requiresOtp ? (
        /* OTP Verification Form */
        <form onSubmit={handleOtpSubmit}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A 6-digit verification code has been sent to{" "}
              <strong>{loginMethod === "email" ? email : phone}</strong>.
            </p>
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="otp"
              >
                Verification Code
              </label>
              <input
                id="otp"
                className="form-input w-full py-2 bg-white tracking-widest text-center text-lg font-bold"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="btn-sm w-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Resend Code
            </button>
            <button
              type="button"
              onClick={() => setRequiresOtp(false)}
              className="w-full text-center text-sm text-blue-600 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        /* Standard Login Form */
        <form onSubmit={handleLoginSubmit}>
          {/* Method selector tab */}
          <div className="mb-4 flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => { setLoginMethod("email"); setError(""); }}
              className={`flex-1 pb-2 text-center text-sm font-semibold border-b-2 transition-all ${
                loginMethod === "email"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod("phone"); setError(""); }}
              className={`flex-1 pb-2 text-center text-sm font-semibold border-b-2 transition-all ${
                loginMethod === "phone"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Phone Login
            </button>
          </div>

          <div className="space-y-4">
            {loginMethod === "email" ? (
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  className="form-input w-full py-2 bg-white"
                  type="email"
                  placeholder="corybarker@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-gray-700"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  className="form-input w-full py-2 bg-white"
                  type="text"
                  placeholder="03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                className="form-input w-full py-2 bg-white"
                type="password"
                autoComplete="on"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      )}

      {/* Bottom links */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <Link
          className="text-sm text-gray-700 underline hover:no-underline"
          to="/reset-password"
        >
          Forgot password?
        </Link>
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Link className="font-medium text-blue-600 underline hover:no-underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
