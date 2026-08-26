import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/api';
import { toast, getApiErrorMessage } from '../utils/toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { refresh } = useAuth();
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateMobileNumber = (number) => /^[0-9]{10}$/.test(number);
    const validatePassword = (pwd) => pwd.length >= 6;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateMobileNumber(mobileNumber)) {
            const msg = 'Please enter a valid 10-digit mobile number';
            setError(msg);
            toast.error(msg);
            return;
        }

        if (!validatePassword(password)) {
            const msg = 'Password must be at least 6 characters';
            setError(msg);
            toast.error(msg);
            return;
        }

        setLoading(true);
        try {
            const data = await login({ phoneNumber: mobileNumber, password });
            
            if (data.access_token) {
                refresh();
                const role = data.user?.role;
                if (role === 'organizer') {
                  setSuccess('Organizer login successful!');
                  toast.success('Welcome, Organizer!');
                } else if (role === 'admin') {
                  setSuccess('Festival admin login successful!');
                  toast.success('Welcome — you can manage your assigned festival(s).');
                } else {
                  setSuccess('Login successful! Viewing only.');
                  toast.success('Logged in. Staff role required to edit.');
                }
                setMobileNumber('');
                setPassword('');
                setTimeout(() => {
                    navigate(role === 'organizer' ? '/' : '/');
                }, 1000);
            } else {
                const msg = 'Login failed. No token received.';
                setError(msg);
                toast.error(msg);
            }
        } catch (err) {
            console.error('Login error:', err);
            const msg = getApiErrorMessage(err, 'Invalid credentials or connection error.');
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#d35400] to-[#ff9933] p-5">
            <div className="bg-white rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] w-full max-w-[400px] p-[30px] md:p-[40px] animate-[slideUp_0.3s_ease-out]">
                <div className="text-center mb-[30px]">
                    <h1 className="text-[24px] md:text-[28px] text-[#333] mb-[10px] font-bold">Welcome Back</h1>
                    <p className="text-[14px] text-[#666] m-0">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-[20px]">
                    {error && <div className="bg-[#ffebee] text-[#d32f2f] p-[12px_15px] rounded-[6px] text-[14px] border-l-4 border-[#d32f2f] animate-[slideDown_0.3s_ease-out]">{error}</div>}
                    {success && <div className="bg-[#e8f5e9] text-[#2e7d32] p-[12px_15px] rounded-[6px] text-[14px] border-l-4 border-[#2e7d32] animate-[slideDown_0.3s_ease-out]">{success}</div>}

                    <div className="flex flex-col gap-[8px]">
                        <label className="text-[14px] font-semibold text-[#333]" htmlFor="mobile">Mobile Number</label>
                        <div className="flex items-center border border-[#ddd] rounded-[6px] px-[12px] transition-colors focus-within:border-[#d35400] focus-within:ring-4 focus-within:ring-[#d35400]/10 bg-white">
                            <span className="text-[#666] font-semibold mr-[8px] whitespace-nowrap">+91</span>
                            <input
                                className="flex-1 border-none outline-none py-[12px] text-[14px] bg-transparent disabled:text-[#999] disabled:cursor-not-allowed placeholder:text-[#999]"
                                type="tel"
                                id="mobile"
                                placeholder="10-digit number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                maxLength="10"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className="text-[14px] font-semibold text-[#333]" htmlFor="password">Password</label>
                        <div className="flex items-center border border-[#ddd] rounded-[6px] px-[12px] transition-colors focus-within:border-[#d35400] focus-within:ring-4 focus-within:ring-[#d35400]/10 bg-white">
                            <input
                                className="flex-1 border-none outline-none py-[12px] text-[14px] bg-transparent disabled:text-[#999] disabled:cursor-not-allowed placeholder:text-[#999]"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="bg-transparent border-none cursor-pointer text-[18px] px-[8px] flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`bg-gradient-to-br from-[#d35400] to-[#ff9933] text-white border-none py-[12px] px-[16px] md:px-[20px] rounded-[6px] text-[15px] md:text-[16px] font-semibold cursor-pointer transition-all mt-[10px] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(211,84,0,0.3)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center relative ${loading ? 'text-transparent' : ''}`}
                        disabled={loading}
                    >
                        {loading && (
                            <span className="absolute w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        )}
                        {!loading && 'Sign In'}
                    </button>
                </form>

                <div className="text-center mt-[30px] text-[14px]">
                    <Link className="text-[#d35400] no-underline hover:underline" to="/organizer/login">Organizer Login</Link>
                </div>
                <p className="text-center text-xs text-[#999] mt-3">Festival admin / staff login</p>
            </div>
            <style jsx>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;