import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto">
        <h1 className="section-title">
          <span className="text-primary">My</span> Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No orders yet</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-card rounded-xl p-6 cursor-pointer hover:border-primary border border-transparent transition-all"
                onClick={() => navigate(`/order-confirmation/${order._id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID: <span className="text-white font-mono">{order._id}</span></p>
                    <p className="text-white font-semibold mt-1">
                      {order.items.length} item(s)
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary text-xl font-bold">Rs. {order.totalAmount.toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;