import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';
import LoadingPopup from '../components/LoadingPopup';
import SuccessPopup from '../components/SuccessPopup';
import axios from 'axios';
import toast from 'react-hot-toast';

const pakistanCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan',
  'Sukkur', 'Muzaffarabad', 'Mirpur', 'Sahiwal', 'Jhang',
  'Other'
];

const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [trackingId, setTrackingId] = useState('');

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
  });

  const deliveryCharges = 700;
  const totalAmount = cartTotal + deliveryCharges;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!formData.customerPhone || !formData.customerAddress || !formData.customerCity) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const { data } = await axios.post('/api/orders',
        { ...formData, items },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setOrderId(data._id);
      setTrackingId(data.trackingId);
      setLoading(false);
      setShowSuccess(true);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (cart.length === 0 && !showSuccess) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center animate-fadeInUp">
          <p className="text-6xl mb-4">🛒</p>
          <p className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No items to checkout</p>
          <button onClick={() => navigate('/')} className="btn-primary">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {loading && (
        <LoadingPopup message="Placing Your Order..." subMessage="Please wait while we confirm your order and send you a receipt" />
      )}

      {showSuccess && (
        <SuccessPopup
          message="Order Confirmed! 🎉"
          subMessage={`Your tracking ID: ${trackingId}. A confirmation email with receipt has been sent.`}
          buttonText="View Receipt"
          onClose={() => navigate(`/order-confirmation/${orderId}`)}
        />
      )}

      <div className="max-w-5xl mx-auto animate-fadeInUp">
        <h1 className="section-title">
          <span className="gradient-text">Complete</span>{' '}
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Your Order</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className={`lg:col-span-3 rounded-2xl p-6 md:p-8 ${
            theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
          }`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Information</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="input-field" placeholder="Muhammad Ali" required />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email Address *</label>
                  <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="input-field" placeholder="email@example.com" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Mobile Number *</label>
                  <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className="input-field" placeholder="03XX-XXXXXXX" required />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>City *</label>
                  <select name="customerCity" value={formData.customerCity} onChange={handleChange} className="input-field" required>
                    <option value="">Select City</option>
                    {pakistanCities.map((city) => (<option key={city} value={city}>{city}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Complete Delivery Address *</label>
                <textarea name="customerAddress" value={formData.customerAddress} onChange={handleChange}
                  className="input-field h-24 resize-none" placeholder="House #, Street #, Area, Near Landmark..." required />
              </div>

              <div className={`rounded-xl p-4 ${
                theme === 'dark' ? 'bg-[#0a0a1a] border border-gray-800' : 'bg-gray-50 border border-gray-100'
              }`}>
                <p className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>📦 Order Timeline</p>
                <div className="space-y-2">
                  {[
                    { color: 'bg-yellow-500', text: 'Order Placed → Dispatched (2-3 days)' },
                    { color: 'bg-blue-500', text: 'Dispatched → Out for Delivery (2-3 days)' },
                    { color: 'bg-green-500', text: 'Out for Delivery → Delivered ✓' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${step.color}`}></div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-lg disabled:opacity-50">
                Confirm Order - Rs. {totalAmount.toLocaleString()}
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 rounded-2xl p-6 h-fit sticky top-24 ${
            theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
          }`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>

            <div className="space-y-3 mb-6">
              {cart.map((item) => {
                if (!item.product) return null;
                return (
                  <div key={item.product._id} className="flex gap-3 items-center">
                    <img src={getImageUrl(item.product.image)} alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100'; }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.product.name}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>x{item.quantity}</p>
                    </div>
                    <p className="text-primary font-bold text-sm">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>

            <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

            <div className="space-y-3 mt-4">
              <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>🚚 Delivery Charges</span>
                <span>Rs. {deliveryCharges}</span>
              </div>
              <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />
              <div className={`flex justify-between text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span>Total</span>
                <span className="gradient-text">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;