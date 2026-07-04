import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';

const categories = [
  { name: 'Airpods', path: '/airpods' },
  { name: 'Handfree', path: '/handfree' },
  { name: 'Back Covers', path: '/mobile-back-covers' },
  { name: 'Adapters', path: '/adapters' },
  { name: 'Charging Leads', path: '/charging-leads' },
  { name: 'Cooling Fans', path: '/cooling-fans' },
  { name: 'Splitters', path: '/splitters' },
  { name: 'Connectors', path: '/connectors' },
  { name: 'Watches', path: '/mobile-watch' },
  { name: 'Headphones', path: '/headphones' },
  { name: 'Speakers', path: '/speakers' },
  { name: 'Powerbank', path: '/powerbank' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, logoutUser } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  useEffect(() => {
    setImgError(false);
  }, [user?.profilePic]);

  const handleLogout = () => {
    logoutUser();
    setShowProfileMenu(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // ✅ Handles both Cloudinary URLs and local URLs
  const profilePicUrl = user?.profilePic ? getImageUrl(user.profilePic, null) : null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? `glass ${theme === 'dark' ? 'shadow-lg shadow-black/20' : 'shadow-lg shadow-gray-200/50'}`
        : theme === 'dark' ? 'bg-[#0a0a0f]/90' : 'bg-white/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-1 group">
            <span className="text-lg md:text-2xl font-black gradient-text group-hover:animate-wiggle">THE</span>
            <span className={`text-lg md:text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ACCESSORIES</span>
            <span className="text-lg md:text-2xl font-black gradient-text">LAB</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-5">
            <Link to="/" className={`font-medium transition-all hover:text-primary ${
              isActive('/') ? 'text-primary' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Home</Link>

            <div className="relative" onMouseEnter={() => setShowCategories(true)} onMouseLeave={() => setShowCategories(false)}>
              <button className={`font-medium transition-all hover:text-primary ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Categories <span className={`ml-1 inline-block transition-transform ${showCategories ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {showCategories && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-2xl shadow-2xl py-3 w-56 animate-fadeInDown ${
                  theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white border border-gray-100'
                }`}>
                  {categories.map((cat) => (
                    <Link key={cat.path} to={cat.path} className={`block px-5 py-2.5 text-sm font-medium transition-all ${
                      isActive(cat.path) ? 'text-primary bg-primary/10' :
                      theme === 'dark' ? 'text-gray-300 hover:text-primary hover:bg-white/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}>{cat.name}</Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/track-order" className={`font-medium transition-all hover:text-primary ${
              isActive('/track-order') ? 'text-primary' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Track Order</Link>

            <Link to="/reviews" className={`font-medium transition-all hover:text-primary ${
              isActive('/reviews') ? 'text-primary' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Reviews</Link>

            <Link to="/contact" className={`font-medium transition-all hover:text-primary ${
              isActive('/contact') ? 'text-primary' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Contact</Link>

            <button onClick={toggleTheme} className={`relative w-14 h-7 rounded-full transition-all duration-500 ${
              theme === 'dark' ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-gradient-to-r from-yellow-300 to-orange-300'
            }`}>
              <div className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-xs ${
                theme === 'dark' ? 'left-0.5 bg-indigo-600' : 'left-7 bg-yellow-500'
              }`}>{theme === 'dark' ? '🌙' : '☀️'}</div>
            </button>

            {user ? (
              <>
                <Link to="/cart" className="relative group">
                  <span className={`font-medium transition-all group-hover:text-primary ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-5 bg-gradient-to-r from-primary to-red-400 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-soft">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="relative group flex items-center gap-2"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden border-2 transition-all duration-300 ${
                      showProfileMenu ? 'border-primary scale-110' : 'border-transparent group-hover:border-primary'
                    }`}>
                      {profilePicUrl && !imgError ? (
                        <img
                          src={profilePicUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                          key={user.profilePic}
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                      <div className={`absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl py-2 z-50 animate-fadeInDown ${
                        theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white border border-gray-100'
                      }`}>
                        <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                              {profilePicUrl && !imgError ? (
                                <img src={profilePicUrl} alt="" className="w-full h-full object-cover" key={user.profilePic + '-dropdown'} />
                              ) : (
                                user.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                              <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <Link to="/profile" className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                          theme === 'dark' ? 'text-gray-300 hover:text-primary hover:bg-white/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                        }`}><span>👤</span> My Profile</Link>

                        <Link to="/my-orders" className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                          theme === 'dark' ? 'text-gray-300 hover:text-primary hover:bg-white/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                        }`}><span>📦</span> My Orders</Link>

                        <Link to="/cart" className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                          theme === 'dark' ? 'text-gray-300 hover:text-primary hover:bg-white/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                        }`}>
                          <span>🛒</span> My Cart
                          {cartCount > 0 && (
                            <span className="ml-auto bg-primary text-white text-[10px] font-bold rounded-full px-2 py-0.5">{cartCount}</span>
                          )}
                        </Link>

                        <Link to="/track-order" className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                          theme === 'dark' ? 'text-gray-300 hover:text-primary hover:bg-white/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                        }`}><span>🔍</span> Track Order</Link>

                        <div className={`my-1 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}></div>

                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-red-400 hover:bg-red-500/10 transition-all">
                          <span>🚪</span> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`font-medium transition-all hover:text-primary ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center space-x-3">
            <button onClick={toggleTheme} className="text-xl transition-transform hover:scale-125">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {user && (
              <>
                <Link to="/cart" className="relative">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>

                <Link to="/profile" className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden border-2 border-transparent">
                    {profilePicUrl && !imgError ? (
                      <img src={profilePicUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} key={user.profilePic + '-mobile'} />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center">{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </Link>
              </>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              <div className="space-y-1.5 w-6">
                <span className={`block h-0.5 rounded bg-current transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 rounded bg-current transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 rounded bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`px-4 py-4 space-y-2 border-t overflow-y-auto max-h-[80vh] ${
          theme === 'dark' ? 'bg-[#0a0a0f] border-gray-800' : 'bg-white border-gray-100'
        }`}>
          {user && (
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${
              theme === 'dark' ? 'bg-[#12122a]' : 'bg-gray-50'
            }`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                {profilePicUrl && !imgError ? (
                  <img src={profilePicUrl} alt="" className="w-full h-full object-cover" key={user.profilePic + '-mobile-menu'} />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
              </div>
            </div>
          )}

          <Link to="/" className={`block py-2.5 px-4 rounded-xl font-medium ${
            isActive('/') ? 'text-primary bg-primary/10' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>🏠 Home</Link>
          <Link to="/track-order" className={`block py-2.5 px-4 rounded-xl font-medium ${
            isActive('/track-order') ? 'text-primary bg-primary/10' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>🔍 Track Order</Link>
          <Link to="/reviews" className={`block py-2.5 px-4 rounded-xl font-medium ${
            isActive('/reviews') ? 'text-primary bg-primary/10' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>⭐ Reviews</Link>
          <Link to="/contact" className={`block py-2.5 px-4 rounded-xl font-medium ${
            isActive('/contact') ? 'text-primary bg-primary/10' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>💬 Contact Us</Link>

          <div className="py-2 px-4">
            <p className="text-primary font-bold text-sm mb-2">CATEGORIES</p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link key={cat.path} to={cat.path} className={`py-2 px-3 rounded-lg text-sm transition-all ${
                  isActive(cat.path) ? 'text-primary bg-primary/10' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>{cat.name}</Link>
              ))}
            </div>
          </div>

          {user ? (
            <>
              <div className={`my-2 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}></div>
              <Link to="/profile" className={`block py-2.5 px-4 rounded-xl font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>👤 My Profile</Link>
              <Link to="/my-orders" className={`block py-2.5 px-4 rounded-xl font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>📦 My Orders</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2.5 px-4 rounded-xl font-medium text-red-400 hover:bg-red-500/10">
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2 px-4">
              <Link to="/login" className="block btn-secondary text-center text-sm py-2.5">Login</Link>
              <Link to="/signup" className="block btn-primary text-center text-sm py-2.5">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;