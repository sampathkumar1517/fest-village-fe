import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../utils/api';
import { toast, getApiErrorMessage } from '../utils/toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        houseNumber: '',
        password: '',
        isActive: true
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phoneNumber') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 10) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) return 'First name is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email address';
        if (!/^[0-9]{10}$/.test(formData.phoneNumber)) return 'Please enter a valid 10-digit mobile number';
        if (!formData.address.trim()) return 'Address is required';
        if (!formData.houseNumber.trim()) return 'House number is required';
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setLoading(true);
        try {
            await register({
                firstName: formData.firstName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                houseNumber: formData.houseNumber,
                password: formData.password,
            });
            setSuccess('Registration successful!');
            toast.success('Registration successful!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Registration failed. Please try again.');
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#d35400] to-[#ff9933] p-5">
            <div className="bg-white rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] w-full max-w-[500px] p-[30px] md:p-[40px] animate-[slideUp_0.3s_ease-out]">
                <div className="text-center mb-[30px]">
                    <h1 className="text-[24px] md:text-[28px] text-[#333] mb-[10px] font-bold">Create Account</h1>
                    <p className="text-[14px] text-[#666] m-0">Join the Village Festival Manager</p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-[20px]">
                    {error && <div className="bg-[#ffebee] text-[#d32f2f] p-[12px_15px] rounded-[6px] text-[14px] border-l-4 border-[#d32f2f] animate-[slideDown_0.3s_ease-out]">{error}</div>}
                    {success && <div className="bg-[#e8f5e9] text-[#2e7d32] p-[12px_15px] rounded-[6px] text-[14px] border-l-4 border-[#2e7d32] animate-[slideDown_0.3s_ease-out]">{success}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                        <div className="flex flex-col gap-[8px]">
                            <label className="text-[14px] font-semibold text-[#333]" htmlFor="firstName">First Name</label>
                            <input
                                className="border border-[#ddd] rounded-[6px] px-[12px] py-[10px] text-[14px] outline-none transition-colors focus:border-[#d35400] focus:ring-4 focus:ring-[#d35400]/10 bg-white placeholder:text-[#999] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                type="text"
                                id="firstName"
                                name="firstName"
                                placeholder="Alice"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-[8px]">
                            <label className="text-[14px] font-semibold text-[#333]" htmlFor="lastName">Last Name (Optional)</label>
                            <input
                                className="border border-[#ddd] rounded-[6px] px-[12px] py-[10px] text-[14px] outline-none transition-colors focus:border-[#d35400] focus:ring-4 focus:ring-[#d35400]/10 bg-white placeholder:text-[#999] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                type="text"
                                id="lastName"
                                name="lastName"
                                placeholder="Smith"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className="text-[14px] font-semibold text-[#333]" htmlFor="email">Email Address</label>
                        <input
                            className="border border-[#ddd] rounded-[6px] px-[12px] py-[10px] text-[14px] outline-none transition-colors focus:border-[#d35400] focus:ring-4 focus:ring-[#d35400]/10 bg-white placeholder:text-[#999] disabled:bg-gray-100 disabled:cursor-not-allowed"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="alice@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className="text-[14px] font-semibold text-[#333]" htmlFor="phoneNumber">Mobile Number</label>
                        <div className="flex items-center border border-[#ddd] rounded-[6px] px-[12px] transition-colors focus-within:border-[#d35400] focus-within:ring-4 focus-within:ring-[#d35400]/10 bg-white">
                            <span className="text-[#666] font-semibold mr-[8px] whitespace-nowrap">+91</span>
                            <input
                                className="flex-1 border-none outline-none py-[10px] text-[14px] bg-transparent disabled:text-[#999] disabled:cursor-not-allowed placeholder:text-[#999]"
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="10-digit number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                maxLength="10"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                        <div className="flex flex-col gap-[8px]">
                            <label className="text-[14px] font-semibold text-[#333]" htmlFor="houseNumber">House No.</label>
                            <input
                                className="border border-[#ddd] rounded-[6px] px-[12px] py-[10px] text-[14px] outline-none transition-colors focus:border-[#d35400] focus:ring-4 focus:ring-[#d35400]/10 bg-white placeholder:text-[#999] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                type="text"
                                id="houseNumber"
                                name="houseNumber"
                                placeholder="B-221"
                                value={formData.houseNumber}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-[8px]">
                            <label className="text-[14px] font-semibold text-[#333]" htmlFor="address">Address</label>
                            <input
                                className="border border-[#ddd] rounded-[6px] px-[12px] py-[10px] text-[14px] outline-none transition-colors focus:border-[#d35400] focus:ring-4 focus:ring-[#d35400]/10 bg-white placeholder:text-[#999] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                type="text"
                                id="address"
                                name="address"
                                placeholder="Street name"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <label className="text-[14px] font-semibold text-[#333]" htmlFor="password">Password</label>
                        <div className="flex items-center border border-[#ddd] rounded-[6px] px-[12px] transition-colors focus-within:border-[#d35400] focus-within:ring-4 focus-within:ring-[#d35400]/10 bg-white">
                            <input
                                className="flex-1 border-none outline-none py-[10px] text-[14px] bg-transparent disabled:text-[#999] disabled:cursor-not-allowed placeholder:text-[#999]"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
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
                        {!loading && 'Sign Up'}
                    </button>
                </form>

                <div className="text-center mt-[30px] text-[14px]">
                    <span className="text-[#666]">Already have an account? </span>
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-[#d35400] font-semibold bg-transparent border-none cursor-pointer p-0 hover:text-[#b84400] hover:underline"
                    >
                        Sign In
                    </button>
                </div>
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

export default RegisterPage;
