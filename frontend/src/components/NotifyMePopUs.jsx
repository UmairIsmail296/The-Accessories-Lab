import { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NotifyMePopup = ({ product, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/products/${product._id}/notify`, {
        email: formData.email,
        name: formData.name,
        userId: user?._id || null,
      });

      toast.success('You will be notified!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay animate-scaleIn" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-3xl p-8 animate-slideUp ${
          theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <span className="text-4xl">🔔</span>
        </div>

        <h3 className={`text-2xl font-bold text-center mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Notify Me When Available
        </h3>

        <p className={`text-center text-sm mb-6 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Get an email as soon as <span className="text-primary font-bold">{product.name}</span> is back in stock!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Your Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-[#0a0a1a] text-gray-300 hover:bg-[#1a1a3e]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : '🔔 Notify Me'}
            </button>
          </div>
        </form>

        <p className={`text-center text-xs mt-6 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          We respect your privacy. Your email will only be used for this notification.
        </p>
      </div>
    </div>
  );
};

export default NotifyMePopup;