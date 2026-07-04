import { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: {
    label: 'Order Placed',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    bgLight: 'bg-yellow-500/10',
    step: 1,
  },
  dispatch: {
    label: 'Dispatched',
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    bgLight: 'bg-orange-500/10',
    step: 2,
  },
  delivery: {
    label: 'Out for Delivery',
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    step: 3,
  },
  completed: {
    label: 'Delivered',
    color: 'bg-green-500',
    textColor: 'text-green-400',
    bgLight: 'bg-green-500/10',
    step: 4,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    bgLight: 'bg-red-500/10',
    step: 0,
  },
};

const steps = [
  { key: 'pending', label: 'Order Placed', emoji: '📋', days: '' },
  { key: 'dispatch', label: 'Dispatched', emoji: '📦', days: '2-3 days' },
  { key: 'delivery', label: 'Out for Delivery', emoji: '🚚', days: '2-3 days' },
  { key: 'completed', label: 'Delivered', emoji: '✅', days: '' },
];

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { theme } = useTheme();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data } = await axios.get(`/api/orders/track/${trackingId.trim()}`);
      setOrder(data);
    } catch (error) {
      setOrder(null);
      toast.error(error.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? (statusConfig[order.status]?.step || 0) : 0;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeInDown">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">Track</span>{' '}
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Your Order</span>
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Enter your tracking ID to see order status
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-10 animate-fadeInUp">
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              className="input-field flex-1 text-center text-lg font-mono tracking-widest"
              placeholder="TAL-XXXXXXX-XXXX"
            />
            <button type="submit" disabled={loading} className="btn-primary px-8 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Searching
                </span>
              ) : (
                'Track'
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
          </div>
        )}

        {!loading && searched && !order && (
          <div className="text-center py-10 animate-fadeInUp">
            <p className="text-5xl mb-4">🔍</p>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No order found with this tracking ID
            </p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Please check your tracking ID and try again
            </p>
          </div>
        )}

        {!loading && order && (
          <div className="animate-fadeInUp">
            {/* Tracking ID Card */}
            <div className={`rounded-2xl p-6 mb-8 text-center neon-glow ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
            }`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Tracking ID
              </p>
              <p className="text-2xl md:text-3xl font-black gradient-text tracking-wider">
                {order.trackingId}
              </p>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Ordered on {new Date(order.createdAt).toLocaleDateString('en-PK', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>

            {/* Status Timeline */}
            {!isCancelled ? (
              <div className={`rounded-2xl p-6 md:p-8 mb-8 ${
                theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
              }`}>
                <h3 className={`text-lg font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Progress
                </h3>

                {/* Desktop Timeline */}
                <div className="hidden md:block">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line Background */}
                    <div className={`absolute top-6 left-0 right-0 h-1 rounded-full ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                    }`}></div>
                    {/* Progress Line Active */}
                    <div
                      className="absolute top-6 left-0 h-1 rounded-full bg-gradient-to-r from-primary to-green-500 transition-all duration-1000"
                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => {
                      const isActive = currentStep >= step.key === 'pending' ? 1 : index + 1;
                      const isCompleted = currentStep > index + 1;
                      const isCurrent = currentStep === index + 1;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center" style={{ width: '25%' }}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 ${
                            isCurrent
                              ? 'bg-primary text-white scale-125 shadow-lg shadow-primary/40'
                              : isCompleted || (index + 1 <= currentStep)
                                ? 'bg-green-500 text-white'
                                : theme === 'dark'
                                  ? 'bg-gray-800 text-gray-500'
                                  : 'bg-gray-200 text-gray-400'
                          }`}>
                            {step.emoji}
                          </div>
                          <p className={`mt-3 text-xs font-bold text-center ${
                            isCurrent ? 'text-primary' :
                            (index + 1 <= currentStep) ? (theme === 'dark' ? 'text-white' : 'text-gray-900') :
                            (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')
                          }`}>
                            {step.label}
                          </p>
                          {step.days && (
                            <p className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                              {step.days}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Timeline */}
                <div className="md:hidden space-y-4">
                  {steps.map((step, index) => {
                    const isCurrent = currentStep === index + 1;
                    const isDone = index + 1 <= currentStep;

                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/40'
                            : isDone
                              ? 'bg-green-500 text-white'
                              : theme === 'dark'
                                ? 'bg-gray-800 text-gray-500'
                                : 'bg-gray-200 text-gray-400'
                        }`}>
                          {step.emoji}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${
                            isCurrent ? 'text-primary' :
                            isDone ? (theme === 'dark' ? 'text-white' : 'text-gray-900') :
                            (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')
                          }`}>
                            {step.label}
                          </p>
                          {step.days && (
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                              {step.days}
                            </p>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="ml-auto px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full animate-pulse">
                            CURRENT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl p-8 mb-8 text-center ${
                theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
              }`}>
                <p className="text-4xl mb-3">❌</p>
                <p className="text-red-400 font-bold text-xl">Order Cancelled</p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This order has been cancelled.
                </p>
              </div>
            )}

            {/* Order Details */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Details
              </h3>

              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className={`flex justify-between text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span>{item.name} x{item.quantity}</span>
                    <span className="text-primary font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />

              <div className="mt-4 space-y-2">
                <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Subtotal</span>
                  <span>Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>🚚 Delivery</span>
                  <span>Rs. {order.deliveryCharges}</span>
                </div>
                <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />
                <div className="flex justify-between text-lg font-black">
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total</span>
                  <span className="gradient-text">Rs. {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;