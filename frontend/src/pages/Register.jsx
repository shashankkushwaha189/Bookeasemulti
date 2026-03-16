import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register({ ...form, role: 'CUSTOMER' }); navigate('/businesses'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">B</div>
          <h1 className="text-3xl font-bold text-slate-900">BookEase Pro</h1>
          <p className="text-slate-500 mt-1">Create your account</p>
        </div>
        <div className="card shadow-md">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Create account</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="label">Email</label><input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="label">Phone</label><input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">Password</label><input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Register;
