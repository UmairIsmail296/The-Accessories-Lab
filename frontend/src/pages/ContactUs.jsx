import { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import LoadingPopup from '../components/LoadingPopup';
import SuccessPopup from '../components/SuccessPopup';
import toast from 'react-hot-toast';

const subjects = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'order-issue', label: 'Order Issue' },
  { value: 'return', label: 'Return / Exchange' },
  { value: 'other', label: 'Other' },
];

const ContactUs = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject) { toast.error('Please select a subject'); return; }
    setLoading(true);
    try {
      await axios.post('/api/contact', formData);
      setLoading(false);
      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const whatsappLink = 'https://wa.me/923427600786?text=' + encodeURIComponent('Hello! I need help.');

  return (
    <div className="page-container">
      {loading && <LoadingPopup message="Sending Message..." subMessage="We'll get back to you soon" />}
      {showSuccess && (
        <SuccessPopup
          message="Message Sent! 📨"
          subMessage="We'll respond within 24-48 hours. You can also reach us on WhatsApp."
          buttonText="Done"
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fadeInDown">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">Contact</span>{' '}
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Us</span>
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Have a question, complaint, or suggestion? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4 animate-fadeInLeft">
            {/* WhatsApp Card */}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className={`block rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] neon-glow ${
                theme === 'dark' ? 'bg-[#12122a] border border-gray-800 hover:border-green-500/50' : 'bg-white border border-gray-100 shadow-lg hover:shadow-xl'
              }`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>WhatsApp</h3>
                  <p className="text-green-500 font-bold">03095248054</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Tap to chat now</p>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white border border-gray-100 shadow-lg'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl">✉️</div>
                <div>
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                  <p className="text-primary font-bold text-sm">theaccessorieslab@gmail.com</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Response within 24-48 hours</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white border border-gray-100 shadow-lg'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl">📞</div>
                <div>
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Phone</h3>
                  <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>0342-7600786</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Mon-Sat, 10AM - 8PM</p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white border border-gray-100 shadow-lg'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl">📍</div>
                <div>
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Location</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pakistan</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Delivery across all Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-2 rounded-2xl p-6 md:p-8 animate-fadeInRight ${
            theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Your Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Muhammad Ali" required />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="email@example.com" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone (Optional)</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="03XX-XXXXXXX" />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Subject *</label>
                  <select name="subject" value={formData.subject} onChange={handleChange} className="input-field" required>
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} className="input-field h-40 resize-none" placeholder="Write your message, complaint, or suggestion here..." required />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-lg disabled:opacity-50">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;