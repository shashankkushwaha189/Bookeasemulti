import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const roleMap = { SUPER_ADMIN: '/super-admin/dashboard', ADMIN: '/admin/dashboard', STAFF: '/staff/dashboard', CUSTOMER: '/businesses' };

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const user = await login(form.email, form.password); navigate(roleMap[user.role] || '/businesses'); }
    catch (err) { 
      if (err.response?.data?.unverified) {
        navigate('/register', { state: { email: form.email, requireVerification: true, message: err.response.data.message } });
      } else {
        setError(err.response?.data?.message || 'Login failed.'); 
      }
    }
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(''); setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      navigate(roleMap[user.role] || '/businesses');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 p-4 xs:p-2 font-sans selection:bg-primary-500 selection:text-white">
      {/* Premium Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8 xs:mb-6">
          <div className="w-16 h-16 xs:w-14 xs:h-14 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl xs:text-2xl mx-auto mb-5 shadow-xl shadow-primary-500/30 transform transition hover:scale-105">B</div>
          <h1 className="text-4xl xs:text-3xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">BookEase</h1>
          <p className="text-slate-500/90 xs:text-sm mt-2 font-medium tracking-wide">Universal Appointment Platform</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-3xl border border-white/60 p-8 xs:p-6 transition-all">
          <h2 className="text-2xl xs:text-xl font-bold text-slate-800 mb-6 xs:mb-5 tracking-tight">Sign in</h2>
          
          {error && <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5 xs:space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="username" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400" 
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  required 
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-slate-900/10 focus:ring-2 focus:ring-slate-900/50 focus:outline-none active:scale-[0.98]" disabled={loading}>
              {loading ? 'Authenticating…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className="h-px flex-1 bg-slate-200"></span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Or continue with</span>
            <span className="h-px flex-1 bg-slate-200"></span>
          </div>

          <div className="mt-7 flex justify-center transition-transform hover:scale-[1.02] overflow-hidden w-full max-w-[350px] mx-auto">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Authentication Failed.')}
              shape="pill"
              size="large"
              width="300"
            />
          </div>
          <p className="text-center text-sm xs:text-xs text-slate-500 mt-8 font-medium">New to BookEase? <Link to="/register" className="text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 font-bold transition-all">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
