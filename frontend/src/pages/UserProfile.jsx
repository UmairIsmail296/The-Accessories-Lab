import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, logoutUser, updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editData, setEditData] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [profileRes, ordersRes, viewedRes] = await Promise.all([
        axios.get('/api/auth/profile', { headers }),
        axios.get('/api/orders/my-orders', { headers }),
        axios.get('/api/auth/recently-viewed', { headers }),
      ]);
      setProfile(profileRes.data);
      setEditData({
        name: profileRes.data.name || '',
        phone: profileRes.data.phone || '',
      });
      setOrders(ordersRes.data.slice(0, 5));
      setRecentlyViewed(viewedRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB allowed.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP, GIF allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('name', profile?.name || '');
    formData.append('phone', profile?.phone || '');

    setUploading(true);
    try {
      const { data } = await axios.put('/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile({ ...profile, profilePic: data.profilePic, name: data.name, phone: data.phone });

      updateUser({
        profilePic: data.profilePic,
        name: data.name,
        phone: data.phone,
      });

      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data } = await axios.put('/api/auth/profile', editData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      setProfile({ ...profile, name: data.name, phone: data.phone });
      updateUser({ name: data.name, phone: data.phone });
      setEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const profilePicUrl = profile?.profilePic ? getImageUrl(profile.profilePic, null) : null;

  const statusLabels = {
    pending: 'Placed',
    dispatch: 'Dispatched',
    delivery: 'Delivering',
    completed: 'Delivered',
    cancelled: 'Cancelled',
  };

  const statusColors = {
    pending: 'text-yellow-400',
    dispatch: 'text-orange-400',
    delivery: 'text-blue-400',
    completed: 'text-green-400',
    cancelled: 'text-red-400',
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-5xl mx-auto">
        <div className={`rounded-3xl p-8 mb-8 animate-fadeInDown ${
          theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-xl border border-gray-100'
        }`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-primary flex items-center justify-center text-4xl font-black ${
                theme === 'dark' ? 'bg-[#0a0a1a] text-primary' : 'bg-gray-50 text-primary'
              }`}>
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <span style={{ display: profilePicUrl ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <span className="text-white text-xs font-bold">{uploading ? '...' : 'Change'}</span>
                <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" disabled={uploading} />
              </label>

              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-3">
                  <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="input-field" placeholder="Your name" />
                  <input type="tel" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="input-field" placeholder="Phone number" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="btn-primary text-sm py-2 px-4">Save</button>
                    <button onClick={() => { setEditing(false); setEditData({ name: profile?.name || '', phone: profile?.phone || '' }); }}
                      className="btn-outline text-sm py-2 px-4">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile?.name}</h1>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{profile?.email}</p>
                  {profile?.phone && <p className="text-primary font-bold mt-1">{profile.phone}</p>}
                  <div className="flex gap-2 mt-3 justify-center md:justify-start">
                    <button onClick={() => setEditing(true)} className="btn-outline text-sm py-2 px-4">Edit Profile</button>
                    <button onClick={() => { logoutUser(); navigate('/'); }}
                      className="bg-red-500/10 text-red-400 border border-red-500/30 text-sm py-2 px-4 rounded-xl font-bold hover:bg-red-500/20 transition-all">Logout</button>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <div className={`text-center px-6 py-3 rounded-xl ${theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-50'}`}>
                <p className="text-2xl font-black text-primary">{orders.length}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Orders</p>
              </div>
              <div className={`text-center px-6 py-3 rounded-xl ${theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-50'}`}>
                <p className="text-2xl font-black text-primary">{recentlyViewed.length}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Viewed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`rounded-2xl p-6 animate-fadeInLeft ${
            theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h2>
              <Link to="/my-orders" className="text-primary text-sm hover:underline">View All</Link>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} onClick={() => navigate(`/order-confirmation/${order._id}`)}
                    className={`rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                      theme === 'dark' ? 'bg-[#0a0a1a] hover:bg-[#0f0f1f]' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{order.trackingId}</p>
                        <p className={`font-bold text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.items?.length} item(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold">Rs. {order.totalAmount?.toLocaleString()}</p>
                        <p className={`text-xs font-bold ${statusColors[order.status]}`}>{statusLabels[order.status]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📦</p>
                <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>No orders yet</p>
                <button onClick={() => navigate('/')} className="btn-primary text-sm mt-3 py-2 px-4">Start Shopping</button>
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-6 animate-fadeInRight ${
            theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
          }`}>
            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recently Viewed</h2>

            {recentlyViewed.length > 0 ? (
              <div className="space-y-3">
                {recentlyViewed.map((item) => {
                  if (!item.product) return null;
                  return (
                    <div key={item.product._id} onClick={() => navigate(`/product/${item.product._id}`)}
                      className={`flex gap-3 items-center rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01] ${
                        theme === 'dark' ? 'bg-[#0a0a1a] hover:bg-[#0f0f1f]' : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
                      <img src={getImageUrl(item.product.image)} alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100'; }} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.product.name}
                        </p>
                        <p className="text-primary font-bold text-sm">Rs. {item.product.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">👀</p>
                <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>No recently viewed products</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 stagger-children">
          {[
            { label: 'My Orders', path: '/my-orders', emoji: '📦' },
            { label: 'My Cart', path: '/cart', emoji: '🛒' },
            { label: 'Track Order', path: '/track-order', emoji: '🔍' },
            { label: 'Contact Us', path: '/contact', emoji: '💬' },
          ].map((action) => (
            <Link key={action.path} to={action.path}
              className={`card-style p-5 text-center group opacity-0 animate-fadeInUp ${
                theme === 'dark' ? 'hover:border-primary/30' : 'hover:shadow-lg'
              }`}>
              <span className="text-3xl block mb-2 group-hover:animate-bounce-soft">{action.emoji}</span>
              <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;