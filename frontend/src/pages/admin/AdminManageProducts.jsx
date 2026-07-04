import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import socket from '../../utils/socket';

const AdminManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [togglingId, setTogglingId] = useState(null);
  const [showSubscribers, setShowSubscribers] = useState(null);
  const [subscribersData, setSubscribersData] = useState(null);
  const { admin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const categories = [
    'all', 'airpods', 'handfree', 'mobile-back-covers', 'adapters',
    'charging-leads', 'cooling-fans', 'splitters', 'connectors',
    'mobile-watch', 'headphones', 'speakers', 'powerbank',
  ];

  useEffect(() => {
    fetchProducts();

    socket.on('product_added', (product) => {
      setProducts((prev) => [product, ...prev]);
    });

    socket.on('product_updated', (updated) => {
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    });

    socket.on('product_deleted', (id) => {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    });

    return () => {
      socket.off('product_added');
      socket.off('product_updated');
      socket.off('product_deleted');
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products/admin/all', {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      toast.success('Product deleted!');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleSoldOut = async (id, currentStatus) => {
    const confirmMsg = currentStatus
      ? 'Mark this product as AVAILABLE? All notify subscribers will receive an email.'
      : 'Mark this product as SOLD OUT?';

    if (!window.confirm(confirmMsg)) return;

    setTogglingId(id);
    try {
      const { data } = await axios.put(
        `/api/products/${id}/toggle-sold-out`,
        {},
        { headers: { Authorization: `Bearer ${admin.token}` } }
      );

      if (data.notifiedCount > 0) {
        toast.success(`Product back in stock! ${data.notifiedCount} subscribers notified via email.`, {
          duration: 5000,
        });
      } else if (data.isSoldOut) {
        toast.success('Product marked as Sold Out');
      } else {
        toast.success('Product is now Available');
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const viewSubscribers = async (productId) => {
    try {
      const { data } = await axios.get(`/api/products/${productId}/subscribers`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      setSubscribersData(data);
      setShowSubscribers(productId);
    } catch (error) {
      toast.error('Failed to fetch subscribers');
    }
  };

  let filteredProducts = filterCategory === 'all'
    ? products
    : products.filter((p) => p.category === filterCategory);

  if (filterStock === 'in-stock') {
    filteredProducts = filteredProducts.filter((p) => !p.isSoldOut);
  } else if (filterStock === 'sold-out') {
    filteredProducts = filteredProducts.filter((p) => p.isSoldOut);
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <nav className={`border-b px-6 py-4 ${
        theme === 'dark' ? 'bg-[#0d0d1a] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black">
            <span className="gradient-text">MANAGE PRODUCTS</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Link to="/admin/add-product" className="btn-primary text-sm py-2 px-4">Add New</Link>
            <Link to="/admin/dashboard" className="text-primary hover:underline text-sm">Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Subscribers Modal */}
      {showSubscribers && subscribersData && (
        <div className="popup-overlay" onClick={() => setShowSubscribers(null)}>
          <div
            className={`w-full max-w-2xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  🔔 Notify Subscribers
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {subscribersData.productName} — {subscribersData.count} subscribers
                </p>
              </div>
              <button
                onClick={() => setShowSubscribers(null)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-[#0a0a1a] text-white hover:bg-[#1a1a3e]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✕
              </button>
            </div>

            {subscribersData.subscribers.length > 0 ? (
              <div className="space-y-2">
                {subscribersData.subscribers.map((sub, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {sub.name || 'Anonymous'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sub.email}
                      </p>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>No subscribers yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stock Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'all', label: 'All Products' },
            { value: 'in-stock', label: '✓ Available' },
            { value: 'sold-out', label: '✕ Sold Out' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStock(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filterStock === filter.value
                  ? 'bg-primary text-white'
                  : theme === 'dark'
                    ? 'bg-card text-gray-400 hover:text-white border border-gray-800'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterCategory === cat
                  ? 'bg-primary text-white'
                  : theme === 'dark'
                    ? 'bg-card text-gray-400 hover:text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {filteredProducts.length} product(s)
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const imageUrl = product.image?.startsWith('http')
                ? product.image
                : `http://localhost:5000${product.image}`;

              return (
                <div key={product._id} className={`rounded-xl p-4 ${
                  theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-md border border-gray-100'
                } ${product.isSoldOut ? 'opacity-90' : ''}`}>
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className={`w-20 h-20 object-cover rounded-lg ${product.isSoldOut ? 'grayscale' : ''}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100';
                        }}
                      />
                      {product.isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded transform -rotate-12">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </h3>
                      <p className={`font-bold ${product.isSoldOut ? 'text-gray-500 line-through' : 'text-primary'}`}>
                        Rs. {product.price.toLocaleString()}
                      </p>
                      <p className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {product.category.replace(/-/g, ' ')}
                      </p>

                      {/* Subscribers count if sold out */}
                      {product.isSoldOut && product.notifySubscribers?.length > 0 && (
                        <button
                          onClick={() => viewSubscribers(product._id)}
                          className="text-xs text-orange-500 font-bold mt-1 hover:underline"
                        >
                          🔔 {product.notifySubscribers.length} subscriber(s)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-all font-bold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleSoldOut(product._id, product.isSoldOut)}
                      disabled={togglingId === product._id}
                      className={`flex-1 text-white text-xs py-2 px-3 rounded-lg transition-all font-bold disabled:opacity-50 ${
                        product.isSoldOut
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {togglingId === product._id
                        ? '...'
                        : product.isSoldOut
                          ? '✓ Mark Available'
                          : '✕ Mark Sold Out'
                      }
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-lg transition-all font-bold"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No products found
            </p>
            <Link to="/admin/add-product" className="btn-primary">Add First Product</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageProducts;