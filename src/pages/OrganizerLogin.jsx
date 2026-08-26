import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginOrganizer } from "../utils/api";
import { toast, getApiErrorMessage } from "../utils/toast";
import { useAuth } from "../context/AuthContext";

export default function OrganizerLogin() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      const msg = "Enter a valid 10-digit mobile number";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (password.length < 6) {
      const msg = "Password must be at least 6 characters";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const data = await loginOrganizer({ phoneNumber, password });
      await refresh();
      toast.success(`Welcome, ${data.user?.name || "Organizer"}!`);
      navigate("/");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Login failed");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#d35400] to-[#ff9933] p-5">
      <div className="bg-white rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] w-full max-w-[420px] p-[30px] md:p-[40px]">
        <div className="text-center mb-7">
          <div className="text-3xl mb-2">🪔</div>
          <h1 className="text-[24px] md:text-[28px] text-[#333] mb-2 font-bold font-serif">
            Organizer Login
          </h1>
          <p className="text-[14px] text-[#666] m-0">
            Create festivals and assign festival admins
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div className="bg-[#ffebee] text-[#d32f2f] p-3 rounded-md text-sm border-l-4 border-[#d32f2f]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#333]">Mobile Number</label>
            <div className="flex items-center border border-[#ddd] rounded-md px-3 focus-within:border-[#d35400]">
              <span className="text-[#666] font-semibold mr-2">+91</span>
              <input
                className="flex-1 border-none outline-none py-3 text-sm"
                type="tel"
                placeholder="10-digit number"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#333]">Password</label>
            <div className="flex items-center border border-[#ddd] rounded-md px-3 focus-within:border-[#d35400]">
              <input
                className="flex-1 border-none outline-none py-3 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="text-xs text-[#d35400] font-medium"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#d35400] hover:bg-[#b84400] text-white py-3 rounded-md font-semibold disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in as Organizer"}
          </button>
        </form>

        <p className="text-center text-sm text-[#666] mt-6">
          New organizer?{" "}
          <Link className="text-[#d35400] font-medium hover:underline" to="/organizer/register">
            Create organizer account
          </Link>
        </p>
        <p className="text-center text-xs text-[#999] mt-3">
          Festival admin?{" "}
          <Link className="text-[#d35400] hover:underline" to="/login">
            Staff login
          </Link>
        </p>
      </div>
    </div>
  );
}
