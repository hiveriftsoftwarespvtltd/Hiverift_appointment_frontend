import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('vineetvineet8006@gmail.com');
  const [password, setPassword] = useState('123456');
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
    <div className="min-h-[calc(100vh-140px)] bg-ivory flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-ivory-BORDER rounded-2xl shadow-outer p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gold-SOFT border border-gold-BORDER flex items-center justify-center text-gold-PRIMARY mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-charcoal font-sans">Admin Portal Login</h2>
          <p className="text-xs text-charcoal-MUTED mt-1">
            Access HiveRift Appointment System Management
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-MUTED absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hiverift.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-ivory border border-ivory-BORDER text-sm text-charcoal focus:outline-none focus:border-gold-PRIMARY focus:ring-2 focus:ring-gold-PRIMARY/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-charcoal-MUTED absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-ivory border border-ivory-BORDER text-sm text-charcoal focus:outline-none focus:border-gold-PRIMARY focus:ring-2 focus:ring-gold-PRIMARY/15"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gold-PRIMARY text-white font-bold text-xs shadow-gold hover:bg-gold-DARK disabled:opacity-50 transition-all hover:-translate-y-0.5 mt-2"
          >
            {loading ? 'Authenticating...' : 'Login to Admin Dashboard'}
          </button>
        </form>

        <div className="bg-gold-SOFT/50 border border-gold-BORDER/40 p-3 rounded-lg text-center">
          <p className="text-[11px] text-gold-DARK">
            Default Admin: <strong>vineetvineet8006@gmail.com</strong> / <strong>123456</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
