import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import socket from '../../utils/socket';

const AdminDashboard = () => {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchStats();
    socket.emit('join_admin');

    socket.on('new_order', (order) => {
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pendingOrders: prev.pendingOrders + 1,
      }));
      setRecentOrders((prev) => [order, ...prev].slice(0, 5));
    });

    return () => {
      socket.off('new_order');
    };
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('/api/products/admin/all', {
          headers: { Authorization: `Bearer ${admin.token}` },
        }),
        axios.get('/api/orders/admin/all', {
          headers: { Authorization: `Bearer ${admin.token}` },
        }),
      ]);

      const orders = ordersRes.data;
      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
      });
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Admin Nav */}
      <nav className="bg-darker border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black">
            <span className="text-primary">ADMIN</span> - THE ACCESSORIES LAB
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 hidden md:block">Welcome, {admin?.name}</span>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-all">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border-l-4 border-primary">
            <p className="text-gray-400 text-sm">Total Products</p>
            <p className="text-3xl font-black text-white mt-2">{stats.totalProducts}</p>
          </div>
          <div className="bg-card rounded-xl p-6 border-l-4 border-green-500">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-3xl font-black text-white mt-2">{stats.totalOrders}</p>
          </div>
          <div className="bg-card rounded-xl p-6 border-l-4 border-yellow-500">
            <p className="text-gray-400 text-sm">Active Orders</p>
            <p className="text-3xl font-black text-white mt-2">{stats.pendingOrders}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/add-product" className="bg-card hover:bg-cardHover rounded-xl p-6 text-center transition-all border border-transparent hover:border-primary">
            <p className="text-primary text-2xl font-bold mb-2">+</p>
            <p className="text-white font-semibold">Add Product</p>
          </Link>
          <Link to="/admin/manage-products" className="bg-card hover:bg-cardHover rounded-xl p-6 text-center transition-all border border-transparent hover:border-primary">
            <p className="text-primary text-2xl font-bold mb-2">&#9881;</p>
            <p className="text-white font-semibold">Manage Products</p>
          </Link>
          <Link to="/admin/orders" className="bg-card hover:bg-cardHover rounded-xl p-6 text-center transition-all border border-transparent hover:border-primary">
            <p className="text-primary text-2xl font-bold mb-2">&#9993;</p>
            <p className="text-white font-semibold">View Orders</p>
          </Link>
          <Link to="/" className="bg-card hover:bg-cardHover rounded-xl p-6 text-center transition-all border border-transparent hover:border-primary" target="_blank">
            <p className="text-primary text-2xl font-bold mb-2">&#8599;</p>
            <p className="text-white font-semibold">View Website</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary hover:underline text-sm">View All</Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-gray-700">
                    <th className="text-left py-3 px-2">Order ID</th>
                    <th className="text-left py-3 px-2">Customer</th>
                    <th className="text-left py-3 px-2">Amount</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-800 hover:bg-darker">
                      <td className="py-3 px-2 text-white text-sm font-mono">
                        {order._id.slice(-8)}
                      </td>
                      <td className="py-3 px-2 text-white">{order.customerName}</td>
                      <td className="py-3 px-2 text-primary font-bold">Rs. {order.totalAmount?.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;