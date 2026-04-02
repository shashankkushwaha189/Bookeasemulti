import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setMessage(res.data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await authAPI.resetPassword({ email, otp, newPassword });
      setMessage(res.data.message || 'Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 p-4 xs:p-2">
      <div className="w-full max-w-md xs:max-w-sm">
        <div className="text-center mb-6 xs:mb-4">
          <div className="w-14 h-14 xs:w-12 xs:h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl xs:text-xl mx-auto mb-4 xs:mb-3 shadow-lg">B</div>
          <h1 className="text-3xl xs:text-2xl font-bold text-slate-900">BookEase</h1>
          <p className="text-slate-500 xs:text-xs mt-1">Reset your password</p>
        </div>
        
        <div className="card shadow-md">
          <h2 className="text-xl xs:text-lg font-semibold text-slate-800 mb-6 xs:mb-4">
            {step === 1 ? 'Forgot Password' : 'Enter OTP & New Password'}
          </h2>
          
          {error && <div className="mb-4 p-3 xs:p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm xs:text-xs">{error}</div>}
          {message && <div className="mb-4 p-3 xs:p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm xs:text-xs">{message}</div>}
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4 xs:space-y-3">
              <div>
                <label className="label">Registered Email</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full" 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 xs:space-y-3">
              <div>
                <label className="label">6-Digit OTP</label>
                <input 
                  type="text" 
                  className="input text-center tracking-[0.5em] font-mono text-xl" 
                  placeholder="------" 
                  maxLength={6}
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                  required 
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="input pr-10" 
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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
              <button 
                type="submit" 
                className="btn-primary w-full" 
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm xs:text-xs text-slate-500 mt-6 xs:mt-4">
            Remembered your password? <Link to="/login" className="text-primary-600 hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
