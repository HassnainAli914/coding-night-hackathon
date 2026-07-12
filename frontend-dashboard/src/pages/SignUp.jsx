import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/landing/ui/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import CustomDropdown from "../components/CustomDropdown";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Step
  const [otp, setOtp] = useState("");
  
  // Role Step
  const [role, setRole] = useState("client");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signup, verifyOtp, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signup(email, password, name, phone, role);
      if (res.success) {
        if (res.requiresOtp) {
          setStep(2); // Proceed to OTP verification step
        } else {
          navigate("/dashboard"); // Skip OTP since session is already established
        }
      } else {
        setError(res.message);
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
      const res = await verifyOtp(otp, "signup", phone, email);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Invalid OTP code");
      }
    } catch (err) {
      setError("An unexpected error occurred verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          {step === 1 && "Create your account"}
          {step === 2 && "Verify your email"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Step 1: Registration Form */}
      {step === 1 && (
        <form onSubmit={handleSignupSubmit}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="form-input w-full py-2 bg-white"
                type="text"
                placeholder="Corey Barker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="phone">
                Phone
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="role">
                I am a...
              </label>
              <CustomDropdown
                options={[
                  { value: 'client', label: 'Client' },
                  { value: 'student', label: 'Student' },
                  { value: 'worker', label: 'Worker / Staff' }
                ]}
                value={role}
                placeholder="— Select role —"
                onChange={setRole}
              />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: OTP Verification Form */}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <p className="text-gray-600 mb-6">
            We sent a 6-digit code to <strong>{email}</strong>. Please enter it below to verify your account.
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="otp">
                Verification Code
              </label>
              <input
                id="otp"
                className="form-input w-full py-2 bg-white text-center tracking-widest text-lg"
                type="text"
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        </form>
      )}

      {/* Bottom link (Only show on Step 1) */}
      {step === 1 && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            By signing up, you agree to the{" "}
            <a
              className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
              href="#0"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
              href="#0"
            >
              Privacy Policy
            </a>
            .
          </p>
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link className="font-medium text-blue-600 underline hover:no-underline" to="/signin">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
