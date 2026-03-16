import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';

const roleMap = { SUPER_ADMIN: '/super-admin/dashboard', ADMIN: '/admin/dashboard', STAFF: '/staff/dashboard', CUSTOMER: '/businesses' };

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const user = await login(form.email, form.password); navigate(roleMap[user.role] || '/businesses'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">B</div>
          <h1 className="text-3xl font-bold text-slate-900">BookEase Pro</h1>
          <p className="text-slate-500 mt-1">Universal Appointment Platform</p>
        </div>
        <div className="card shadow-md">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Email</label><input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="label">Password</label><input type="password" className="input" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">New here? <Link to="/register" className="text-primary-600 hover:underline font-medium">Create account</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;
