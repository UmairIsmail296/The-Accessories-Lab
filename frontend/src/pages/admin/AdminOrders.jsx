import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import socket from '../../utils/socket';

const statusLabels = {
  pending: 'Order Placed',
  dispatch: 'Dispatched',
  delivery: 'Out for Delivery',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  dispatch: 'bg-orange-500/20 text-orange-400',
  delivery: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const { admin } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    fetchOrders();
    socket.emit('join_admin');

    socket.on('new_order', (order) => {
      setOrders((prev) => [order, ...prev]);
      toast.success('New order received!');
    });

    socket.on('order_updated', (updated) => {
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    });

    return () => {
      socket.off('new_order');
      socket.off('order_updated');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `/api/orders/admin/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${admin.token}` } }
      );
      toast.success(`Order status updated to: ${statusLabels[status]}`);
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'dispatch',
      dispatch: 'delivery',
      delivery: 'completed',
    };
    return flow[currentStatus] || null;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <nav className={`border-b px-6 py-4 ${
        theme === 'dark' ? 'bg-[#0d0d1a] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black">
            <span className="gradient-text">MANAGE ORDERS</span>
          </h1>
          <Link to="/admin/dashboard" className="text-primary hover:underline text-sm font-medium">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fadeInDown">
          {['all', 'pending', 'dispatch', 'delivery', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-primary to-red-400 text-white shadow-lg shadow-primary/30'
                  : theme === 'dark'
                    ? 'bg-[#12122a] text-gray-400 hover:text-white border border-gray-800'
                    : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              {status === 'all' ? 'All' : statusLabels[status]}
              {status !== 'all' && (
                <span className="ml-1 text-xs opacity-60">
                  ({orders.filter(o => o.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {filteredOrders.length} order(s) found
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);

              return (
                <div key={order._id} className={`rounded-2xl p-6 transition-all duration-300 animate-fadeInUp ${
                  theme === 'dark'
                    ? 'bg-[#12122a] border border-gray-800 hover:border-primary/30'
                    : 'bg-white border border-gray-100 shadow-md hover:shadow-lg'
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`font-mono text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.trackingId}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Customer</p>
                          <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {order.customerName}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
                          <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {order.customerPhone}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
                          <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {order.customerEmail}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Address</p>
                          <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {order.customerAddress}, {order.customerCity}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className={`rounded-xl p-3 mb-3 ${
                        theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-50'
                      }`}>
                        {order.items.map((item, i) => (
                          <p key={i} className={`text-sm py-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.name} × {item.quantity} = <span className="text-primary font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </p>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          Subtotal: Rs. {order.subtotal?.toLocaleString()}
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          Delivery: Rs. {order.deliveryCharges}
                        </span>
                        <span className="text-primary font-black text-base">
                          Total: Rs. {order.totalAmount?.toLocaleString()}
                        </span>
                      </div>

                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {new Date(order.createdAt).toLocaleString('en-PK')}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-[160px]">
                      {/* Next Status Button */}
                      {nextStatus && (
                        <button
                          onClick={() => updateStatus(order._id, nextStatus)}
                          disabled={updatingId === order._id}
                          className="bg-gradient-to-r from-primary to-red-400 hover:from-red-400 hover:to-primary text-white text-sm py-2.5 px-4 rounded-xl font-bold transition-all duration-500 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 active:scale-95"
                        >
                          {updatingId === order._id ? (
                            <span className="flex items-center justify-center">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                              Updating...
                            </span>
                          ) : (
                            `Move to ${statusLabels[nextStatus]}`
                          )}
                        </button>
                      )}

                      {/* Cancel Button */}
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(order._id, 'cancelled')}
                          disabled={updatingId === order._id}
                          className={`text-sm py-2.5 px-4 rounded-xl font-bold transition-all duration-300 active:scale-95 ${
                            theme === 'dark'
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                              : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Status Badge for completed/cancelled */}
                      {(order.status === 'completed' || order.status === 'cancelled') && (
                        <div className={`text-center py-2.5 px-4 rounded-xl text-sm font-bold ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 animate-fadeInUp">
            <p className="text-5xl mb-4">📦</p>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No orders found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;