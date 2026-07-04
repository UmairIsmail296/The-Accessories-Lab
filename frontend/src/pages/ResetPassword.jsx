import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  if (!email || !otp) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Invalid access. Please start the forgot password process again.</p>
          <Link to="/forgot-password" className="btn-primary">Go to Forgot Password</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex items-center justify-center">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-card rounded-2xl p-8 shadow-2xl border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black">
              <span className="text-primary">Reset</span> Password
            </h1>
            <p className="text-gray-400 mt-2">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm new password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;