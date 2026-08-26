import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerOrganizer } from "../utils/api";
import { toast, getApiErrorMessage } from "../utils/toast";

export default function OrganizerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    organizationName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setForm((prev) => ({
        ...prev,
        phoneNumber: value.replace(/\D/g, "").slice(0, 10),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Valid email is required");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phoneNumber)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await registerOrganizer({
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber,
        password: form.password,
        organizationName: form.organizationName.trim() || undefined,
      });
      toast.success("Organizer account created! Please log in.");
      navigate("/organizer/login");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Registration failed");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#d35400] to-[#ff9933] p-5">
      <div className="bg-white rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] w-full max-w-[480px] p-[30px] md:p-[40px]">
        <div className="text-center mb-7">
          <div className="text-3xl mb-2">🪔</div>
          <h1 className="text-[24px] md:text-[28px] text-[#333] mb-2 font-bold font-serif">
            Create Organizer
          </h1>
          <p className="text-[14px] text-[#666] m-0">
            Register to create festivals and manage festival admins
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-[#ffebee] text-[#d32f2f] p-3 rounded-md text-sm border-l-4 border-[#d32f2f]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Full name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-[#ddd] rounded-md px-3 py-2.5 text-sm focus:border-[#d35400] outline-none"
              placeholder="Your name"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border border-[#ddd] rounded-md px-3 py-2.5 text-sm focus:border-[#d35400] outline-none"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Mobile *</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="border border-[#ddd] rounded-md px-3 py-2.5 text-sm focus:border-[#d35400] outline-none"
              placeholder="10-digit number"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Organization</label>
            <input
              name="organizationName"
              value={form.organizationName}
              onChange={handleChange}
              className="border border-[#ddd] rounded-md px-3 py-2.5 text-sm focus:border-[#d35400] outline-none"
              placeholder="Temple committee / village name"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Password *</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="border border-[#ddd] rounded-md px-3 py-2.5 text-sm focus:border-[#d35400] outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#d35400] hover:bg-[#b84400] text-white py-3 rounded-md font-semibold mt-2 disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Organizer Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#666] mt-6">
          Already an organizer?{" "}
          <Link className="text-[#d35400] font-medium hover:underline" to="/organizer/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
