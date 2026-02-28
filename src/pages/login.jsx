import React, { useState } from 'react';
import './login.css';

const LoginPage = () => {
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
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // Replace with your API endpoint
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobileNumber, password }),
            });

            if (response.ok) {
                setSuccess('Login successful!');
                setMobileNumber('');
                setPassword('');
                // Redirect logic here
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="input-group">
                        <label htmlFor="mobile">Mobile Number</label>
                        <div className="input-wrapper">
                            <span className="country-code">+91</span>
                            <input
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

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#forgot-password">Forgot Password?</a>
                    <span className="divider">•</span>
                    <a href="#signup">Create Account</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;