import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const OrderConfirmation = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrder(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Order not found</p>
      </div>
    );
  }

  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-500/10',
    dispatch: 'text-orange-400 bg-orange-500/10',
    delivery: 'text-blue-400 bg-blue-500/10',
    completed: 'text-green-400 bg-green-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
  };

  const statusLabels = {
    pending: 'Order Placed',
    dispatch: 'Dispatched',
    delivery: 'Out for Delivery',
    completed: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto animate-fadeInUp">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scaleIn">
            <span className="text-green-400 text-4xl">✓</span>
          </div>
          <h1 className={`text-3xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Order Confirmed!
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Confirmation email sent to {order.customerEmail}
          </p>
        </div>

        {/* Receipt */}
        <div className={`rounded-3xl overflow-hidden border ${
          theme === 'dark' ? 'bg-[#12122a] border-gray-800' : 'bg-white border-gray-100 shadow-xl'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center">
            <h2 className="text-2xl font-black text-white">THE ACCESSORIES LAB</h2>
            <p className="text-white/70 text-sm mt-1">Order Receipt</p>
          </div>

          <div className="p-6 md:p-8">
            {/* Tracking ID */}
            <div className={`rounded-xl p-4 mb-6 text-center neon-glow ${
              theme === 'dark' ? 'bg-[#0a0a1a] border border-primary/30' : 'bg-gray-50 border border-primary/20'
            }`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Tracking ID
              </p>
              <p className="text-xl font-black gradient-text tracking-wider mt-1">
                {order.trackingId}
              </p>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Name</p>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {order.customerPhone}
                </p>
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {order.customerEmail}
                </p>
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Date</p>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(order.createdAt).toLocaleDateString('en-PK')}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className={`rounded-xl p-4 mb-6 ${
              theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-50'
            }`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Delivery Address
              </p>
              <p className={`font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {order.customerAddress}, {order.customerCity}
              </p>
            </div>

            {/* Status */}
            <div className="text-center mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

            {/* Items */}
            <div className="space-y-3 my-6">
              <div className={`grid grid-cols-4 text-xs font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <span className="col-span-2">Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
              </div>
              {order.items.map((item, index) => (
                <div key={index} className={`grid grid-cols-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="col-span-2 text-sm">{item.name}</span>
                  <span className="text-center text-sm">{item.quantity}</span>
                  <span className="text-right text-sm text-primary font-bold">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

            {/* Totals */}
            <div className="mt-4 space-y-2">
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Subtotal</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>🚚 Delivery Charges</span>
                <span>Rs. {order.deliveryCharges}</span>
              </div>
              <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />
              <div className="flex justify-between text-2xl font-black">
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total</span>
                <span className="gradient-text">Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/track-order')} className="btn-secondary">
            Track Order
          </button>
          <button onClick={() => navigate('/my-orders')} className="btn-outline">
            All Orders
          </button>
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;