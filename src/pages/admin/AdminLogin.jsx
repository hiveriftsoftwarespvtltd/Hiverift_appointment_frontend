import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import hiveriftLogo from '../../assets/LOGO.svg';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-3xl shadow-card p-8 sm:p-10 space-y-6 relative overflow-hidden">
        
        {/* Top Decorative Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#2578FB]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src={hiveriftLogo}
              alt="HiveRift Logo"
              className="h-11 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Admin Gateway</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#111827] font-sans tracking-tight">
            Admin Portal Login
          </h2>
          <p className="text-xs text-[#5B6472] font-medium">
            Enter your authorized credentials to manage appointments
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2.5 shadow-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5B6472] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hiverift.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] font-medium focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#5B6472] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] font-medium focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#5B6472] hover:text-[#2578FB] transition-colors p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-extrabold text-xs shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] disabled:opacity-50 transition-all hover:-translate-y-0.5 mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : (
              'Login to Admin Dashboard'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;


