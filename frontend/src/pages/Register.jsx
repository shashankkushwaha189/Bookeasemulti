import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const { register, verifyOtp, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { 
      await register({ ...form, role: 'CUSTOMER' }); 
      setIsOtpSent(true);
    }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e, directOtp = null) => {
    if (e) e.preventDefault(); 
    setError(''); setLoading(true);
    const codeToVerify = directOtp || otp;
    if (codeToVerify.length !== 6) {
      setError('Please enter the 6-digit code.');
      setLoading(false);
      return;
    }
    try { 
      console.log('Verifying OTP for email:', form.email, 'code:', codeToVerify);
      const user = await verifyOtp(form.email, codeToVerify); 
      console.log('OTP verification successful:', user);
      navigate('/businesses'); 
    }
    catch (err) { 
      console.error('OTP verification error:', err);
      const errorMessage = err.response?.data?.message || 'Verification failed.';
      setError(errorMessage);
      
      // Add helpful error messages
      if (errorMessage.includes('Invalid or expired OTP')) {
        setError('Invalid or expired OTP. Please check your email and try again, or request a new OTP.');
      }
    }
    finally { setLoading(false); }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setOtp(val);
    if (val.length === 6) {
      handleVerifyOtp(null, val);
    }
  };

  const handleResendOtp = async () => {
    setError(''); setResendLoading(true);
    try {
      await register({ ...form, role: 'CUSTOMER' });
      setError(''); // Clear any existing errors
      setOtp(''); // Clear OTP input
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(''); setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      navigate('/businesses');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 p-4 font-sans selection:bg-primary-500 selection:text-white">
      {/* Premium Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10 my-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl mx-auto mb-5 shadow-xl shadow-primary-500/30 transform transition hover:scale-105">B</div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">BookEase</h1>
          <p className="text-slate-500/90 mt-2 font-medium tracking-wide">Create your account</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-3xl border border-white/60 p-8 transition-all">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">Register</h2>
          {error && <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">{error}</div>}
          
          {!isOtpSent ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400" placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="username" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all font-medium text-slate-800 placeholder-slate-400" 
                      placeholder="Min 6 characters" 
                      value={form.password} 
                      onChange={e => setForm({ ...form, password: e.target.value })} 
                      required 
                      minLength={6}
                      autoComplete="new-password"
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
                  {loading ? 'Creating…' : 'Create account'}
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
              
              <p className="text-center text-sm text-slate-500 mt-6 font-medium">Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 font-bold transition-all">Sign in</Link></p>
            </>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 text-center mb-4">Enter the 6-digit code sent to <br/><span className="text-primary-600 font-bold">{form.email}</span></label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-3xl font-mono font-bold tracking-[0.3em] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all text-slate-800 placeholder-slate-300" 
                    placeholder="000000" 
                    maxLength={6}
                    value={otp} 
                    onChange={handleOtpChange} 
                    required 
                  />
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-slate-900/10 focus:ring-2 focus:ring-slate-900/50 focus:outline-none active:scale-[0.98]" disabled={loading || otp.length < 6}>
                  {loading ? 'Verifying…' : 'Verify Account'}
                </button>
              </form>
              <div className="text-center space-y-4">
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : "Didn't receive the code? Resend OTP"}
                </button>
                <button type="button" onClick={() => setIsOtpSent(false)} className="text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors block">← Back to Register</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Register;
