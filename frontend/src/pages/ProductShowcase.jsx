import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';
import NotifyMePopup from '../components/NotifyMePopUs';
import toast from 'react-hot-toast';

const ProductShowcase = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorVariant, setSelectedColorVariant] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product) {
      if (product.colorVariants && product.colorVariants.length > 0) {
        setSelectedColorVariant(product.colorVariants[0]);
        setDisplayImages(product.colorVariants[0].images || []);
        setSelectedColor(product.colorVariants[0].colorName);
      } else {
        setDisplayImages(product.images || (product.image ? [product.image] : []));
      }
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
      if (user) {
        try {
          await axios.post('/api/auth/recently-viewed', { productId: data._id },
            { headers: { Authorization: `Bearer ${user.token}` } });
        } catch (err) { }
      }
    } catch (error) {
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (variant) => {
    setSelectedColorVariant(variant);
    setSelectedColor(variant.colorName);
    setDisplayImages(variant.images || []);
  };

  const handleAddToCart = async () => {
    if (product.isSoldOut) {
      setShowNotifyPopup(true);
      return;
    }
    if (!user) { toast.error('Please login first!'); navigate('/login'); return; }
    setAddingToCart(true);
    const success = await addToCart(product._id, quantity);
    setTimeout(() => {
      setAddingToCart(false);
      if (success) toast.success('Added to bag');
    }, 800);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-1 h-12 bg-primary animate-pulse"></div>
            <div className="w-1 h-12 bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-12 bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = displayImages.length > 0
    ? displayImages
    : (product.images && product.images.length > 0
        ? product.images
        : product.image ? [product.image] : []);

  const specs = product.specifications?.split('|').map(s => s.trim()).filter(Boolean) || [];
  const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;

  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-[#08080a]' : 'bg-[#fafafa]';
  const textMain = isDark ? 'text-white' : 'text-black';
  const textMuted = isDark ? 'text-white/40' : 'text-black/40';
  const textSub = isDark ? 'text-white/60' : 'text-black/60';
  const borderColor = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';

  return (
    <div className={`${bg} ${textMain} overflow-x-hidden relative`}>
      {showNotifyPopup && (
        <NotifyMePopup product={product} onClose={() => setShowNotifyPopup(false)} onSuccess={() => fetchProduct()} />
      )}

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30"
            style={{
              background: selectedColorVariant
                ? `radial-gradient(circle, ${selectedColorVariant.colorHex}40 0%, transparent 50%)`
                : 'radial-gradient(circle, rgba(233,69,96,0.4) 0%, transparent 50%)',
              transform: `translate(${-200 + mousePos.x * 0.5}px, ${-200 + mousePos.y * 0.5}px)`,
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}></div>
        </div>

        {product.isSoldOut && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-red-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-[4px] shadow-2xl animate-pulse">
              ⚠️ Currently Sold Out
            </div>
          </div>
        )}

        {/* Color Badge in Hero */}
        {selectedColorVariant && !product.isSoldOut && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20">
            <div className={`backdrop-blur-xl px-6 py-2 rounded-full flex items-center gap-3 shadow-lg border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
            }`}>
              <div className="w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ background: selectedColorVariant.colorHex }}></div>
              <span className={`text-xs uppercase tracking-[3px] font-medium ${textSub}`}>
                {selectedColorVariant.colorName} Edition
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto pt-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY / 700),
          }}>

          <div className="mb-16 relative" style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 0.3}deg) rotateX(${-mousePos.y * 0.3}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <div className="relative inline-block">
              <div className={`absolute -inset-20 blur-[100px] opacity-40 rounded-full ${
                product.isSoldOut
                  ? 'bg-gradient-to-br from-red-500 via-gray-500 to-gray-700'
                  : 'bg-gradient-to-br from-primary via-purple-500 to-pink-500'
              }`}></div>

              <img
                src={getImageUrl(images[0])}
                alt={product.name}
                key={selectedColor}
                className={`relative w-full max-w-lg mx-auto object-contain transition-all duration-700 animate-fadeInUp ${
                  product.isSoldOut ? 'grayscale' : ''
                }`}
                style={{
                  filter: product.isSoldOut
                    ? 'grayscale(100%) drop-shadow(0 50px 80px rgba(239, 68, 68, 0.3))'
                    : `drop-shadow(0 50px 80px ${selectedColorVariant?.colorHex || 'rgba(233, 69, 96, 0.3)'}40)`,
                }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800'; }}
              />

              {product.isSoldOut && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-red-600 text-white px-12 py-4 rounded-xl font-black text-4xl transform rotate-[-15deg] shadow-2xl border-4 border-white">
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-3 mb-6">
            <div className={`h-px w-8 ${isDark ? 'bg-white/30' : 'bg-black/30'}`}></div>
            <p className="text-[10px] tracking-[8px] uppercase text-primary font-medium">
              {product.brand || 'Lab Series'}
            </p>
            <div className={`h-px w-8 ${isDark ? 'bg-white/30' : 'bg-black/30'}`}></div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-thin tracking-tight leading-[0.85] mb-8">
            {product.name.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-3 animate-fadeInUp"
                style={{
                  animationDelay: `${0.2 + i * 0.1}s`,
                  fontWeight: i === 0 ? 200 : i === product.name.split(' ').length - 1 ? 800 : 300,
                }}>
                {word}
              </span>
            ))}
          </h1>

          <p className={`text-base md:text-lg ${textSub} max-w-2xl mx-auto mb-12 font-light tracking-wide animate-fadeInUp`}
            style={{ animationDelay: '0.8s' }}>
            {product.isSoldOut ? (
              <>
                <span className="text-red-500 font-bold">Temporarily unavailable.</span>
                <br />
                <span className={textMuted}>Subscribe to get notified when it's back.</span>
              </>
            ) : (
              <>Where engineering meets emotion.</>
            )}
          </p>

          <div className="inline-flex items-center gap-6 animate-fadeInUp" style={{ animationDelay: '1s' }}>
            <div className={`px-6 py-3 rounded-full border backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
            }`}>
              <span className={`text-[10px] uppercase tracking-[3px] ${textMuted} mr-3`}>From</span>
              <span className={`text-lg font-medium ${product.isSoldOut ? 'line-through text-red-500' : ''}`}>
                Rs. {product.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="relative py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 01</span>
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
            <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>The Vision</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[6px] text-primary mb-6">Our Philosophy</p>
              <h2 className="text-5xl md:text-7xl font-thin leading-[1.05] mb-8">
                Form follows
                <br />
                <span className="font-bold italic gradient-text">feeling.</span>
              </h2>
            </div>
            <div className="lg:col-span-7 lg:pl-16">
              <p className={`text-2xl md:text-3xl font-light leading-relaxed ${textSub} mb-8`}>
                "{product.description.substring(0, 120)}..."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECS */}
      {specs.length > 0 && (
        <section className="relative py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 02</span>
              <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Specifications</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="lg:sticky lg:top-32">
                <p className="text-xs uppercase tracking-[6px] text-primary mb-6">Technical Excellence</p>
                <h2 className="text-5xl md:text-7xl font-thin leading-[1.05] mb-8">
                  Engineered
                  <br />
                  to <span className="font-bold gradient-text">perform.</span>
                </h2>
              </div>

              <div className="space-y-px">
                {specs.map((spec, i) => (
                  <div key={i} className={`group p-8 border-b ${borderColor} hover:bg-primary/5 transition-all duration-500`}>
                    <div className="flex items-start gap-6">
                      <span className={`text-xs ${textMuted} pt-1 font-mono`}>
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className={`text-2xl md:text-3xl font-light ${textMain} group-hover:translate-x-2 transition-transform duration-500`}>
                          {spec}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ✅ GALLERY - Shows Current Color's Images */}
      {images.length > 0 && (
        <section className="relative py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 03</span>
              <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>
                {selectedColor ? `${selectedColor} Gallery` : 'Visual Story'}
              </span>
            </div>

            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-[6px] text-primary mb-6">Visual Showcase</p>
              <h2 className="text-5xl md:text-7xl font-thin leading-[1.05]">
                A study in
                <br />
                <span className="font-bold italic gradient-text">
                  {selectedColor || 'elegance'}.
                </span>
              </h2>
            </div>

            {/* Dynamic gallery based on current color images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={selectedColor}>
              {images.map((img, i) => (
                <div key={`${selectedColor}-${i}`}
                  className={`relative group overflow-hidden rounded-2xl aspect-square animate-fadeInUp ${
                    theme === 'dark' ? 'bg-[#12122a]' : 'bg-white shadow-lg'
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}>
                  <img src={getImageUrl(img)} alt=""
                    className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${
                      product.isSoldOut ? 'grayscale' : ''
                    }`}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600'; }} />

                  {/* Color badge on each image */}
                  {selectedColorVariant && (
                    <div className="absolute top-3 left-3 backdrop-blur-md bg-black/40 px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-white"
                        style={{ background: selectedColorVariant.colorHex }}></div>
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                        {selectedColor}
                      </span>
                    </div>
                  )}

                  {i === 0 && (
                    <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-full">
                      MAIN
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ✅ COLOR SELECTION SECTION */}
      {hasColorVariants && (
        <section className="relative py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 04</span>
              <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Personalization</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

              {/* Left - Product Preview */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[400px] h-[400px] rounded-full opacity-50"
                    style={{
                      background: `radial-gradient(circle, ${selectedColorVariant?.colorHex || '#6b7280'}40 0%, transparent 70%)`,
                      transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}></div>
                </div>

                <img
                  src={getImageUrl(images[0])}
                  alt={product.name}
                  key={`color-preview-${selectedColor}`}
                  className={`relative w-full max-w-md mx-auto object-contain animate-fadeInUp ${
                    product.isSoldOut ? 'grayscale' : ''
                  }`}
                  style={{
                    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.3))',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600'; }}
                />

                <div className="absolute top-4 right-4 flex items-center gap-3 backdrop-blur-md bg-black/40 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 rounded-full border border-white"
                    style={{ background: selectedColorVariant?.colorHex }}></div>
                  <span className="text-white text-xs uppercase tracking-[3px]">
                    {selectedColor}
                  </span>
                </div>
              </div>

              {/* Right - Color Options */}
              <div>
                <p className="text-xs uppercase tracking-[6px] text-primary mb-6">Make it yours</p>
                <h2 className="text-5xl md:text-6xl font-thin leading-[1.05] mb-4">
                  Find your
                  <br />
                  <span className="font-bold italic gradient-text">signature.</span>
                </h2>
                <p className={`${textSub} text-lg font-light leading-relaxed mb-12 max-w-md`}>
                  Choose from our curated collection of premium finishes.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {product.colorVariants.map((variant) => (
                    <button
                      key={variant.colorName}
                      onClick={() => handleColorChange(variant)}
                      disabled={product.isSoldOut}
                      className={`group flex items-center gap-6 p-6 rounded-2xl border transition-all duration-500 ${
                        product.isSoldOut ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        selectedColor === variant.colorName
                          ? isDark
                            ? 'border-primary/50 bg-primary/5 scale-105'
                            : 'border-primary/50 bg-primary/5 scale-105'
                          : isDark
                            ? 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                            : 'border-black/5 hover:border-black/20 bg-black/[0.02]'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-full transition-all duration-500 ${
                          selectedColor === variant.colorName ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                          style={{
                            background: variant.colorHex,
                            boxShadow: `0 0 0 3px ${selectedColor === variant.colorName ? '#e94560' : 'transparent'}, 0 10px 30px ${variant.colorHex}40`,
                          }}></div>
                      </div>

                      <div className="flex-1 text-left">
                        <p className={`text-lg font-medium ${textMain}`}>{variant.colorName}</p>
                        <p className={`text-xs uppercase tracking-[2px] ${textMuted} mt-1`}>
                          {selectedColor === variant.colorName
                            ? `✓ Selected · ${variant.images?.length || 0} Photos`
                            : `${variant.images?.length || 0} Photos Available`}
                        </p>
                      </div>

                      <div className={`text-sm transition-all duration-500 ${
                        selectedColor === variant.colorName ? 'text-primary opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}>
                        →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full opacity-10"
            style={{
              background: product.isSoldOut
                ? 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)'
                : `radial-gradient(circle, ${selectedColorVariant?.colorHex || '#e94560'}50 0%, transparent 70%)`,
            }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 05</span>
            <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
            <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>
              {product.isSoldOut ? 'Get Notified' : 'The Final Step'}
            </span>
          </div>

          <div className="text-center">
            <p className={`text-xs uppercase tracking-[6px] mb-8 ${
              product.isSoldOut ? 'text-red-500' : 'text-primary'
            }`}>
              {product.isSoldOut ? 'Currently Unavailable' : 'Make it yours'}
            </p>

            <h2 className="text-6xl md:text-8xl font-thin leading-[0.95] mb-16">
              {product.isSoldOut ? (
                <>Be the first to <span className="font-bold italic gradient-text">know.</span></>
              ) : (
                <>Begin your <span className="font-bold italic gradient-text">journey.</span></>
              )}
            </h2>

            <div className={`inline-block p-12 rounded-3xl border backdrop-blur-xl ${
              product.isSoldOut
                ? 'border-red-500/20 bg-red-500/[0.02]'
                : isDark
                  ? 'border-white/10 bg-white/[0.02]'
                  : 'border-black/10 bg-black/[0.02]'
            } mb-16`}>

              {product.isSoldOut ? (
                <>
                  <div className="text-7xl mb-6">😔</div>
                  <h3 className={`text-3xl md:text-4xl font-thin mb-4 ${textMain}`}>
                    Temporarily <span className="font-bold text-red-500">Sold Out</span>
                  </h3>

                  <div className="mb-6">
                    <span className={`text-2xl ${textMuted} font-thin line-through`}>Rs.</span>
                    <span className="text-5xl md:text-6xl font-thin tracking-tight ml-2 line-through text-red-500">
                      {product.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowNotifyPopup(true)}
                    className="w-full max-w-sm py-5 rounded-full font-medium tracking-wide bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-500"
                  >
                    🔔 Notify Me When Available
                  </button>
                </>
              ) : (
                <>
                  {selectedColorVariant && (
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ background: selectedColorVariant.colorHex }}></div>
                      <p className={`text-sm uppercase tracking-[4px] ${textSub}`}>
                        {selectedColor} Edition
                      </p>
                    </div>
                  )}

                  <div className="mb-8">
                    <span className={`text-2xl ${textMuted} font-thin`}>Rs.</span>
                    <span className="text-7xl md:text-9xl font-thin tracking-tight ml-2">
                      {product.price.toLocaleString()}
                    </span>
                  </div>

                  <p className={`text-sm ${textSub} mb-12 font-light`}>
                    Includes complimentary delivery within Pakistan
                    <br />
                    <span className={textMuted}>Cash on delivery available</span>
                  </p>

                  <div className="flex items-center justify-center gap-6 mb-10">
                    <span className={`text-[10px] uppercase tracking-[4px] ${textMuted}`}>Quantity</span>
                    <div className={`inline-flex items-center rounded-full overflow-hidden border ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={`w-12 h-12 hover:bg-primary/10 transition-colors text-lg ${textMain}`}>−</button>
                      <span className={`w-16 h-12 flex items-center justify-center font-medium border-x ${
                        isDark ? 'border-white/10' : 'border-black/10'
                      }`}>{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)}
                        className={`w-12 h-12 hover:bg-primary/10 transition-colors text-lg ${textMain}`}>+</button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`w-full max-w-sm mx-auto block py-5 rounded-full font-medium tracking-wide transition-all duration-500 ${
                      addingToCart
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-primary to-red-500 text-white hover:shadow-2xl hover:shadow-primary/40'
                    }`}
                  >
                    {addingToCart ? '✓ Added to Bag' : `Reserve Now — Rs. ${(product.price * quantity).toLocaleString()}`}
                  </button>

                  <button
                    onClick={() => navigate(`/product/${id}`)}
                    className={`w-full max-w-sm mx-auto mt-3 block py-5 rounded-full font-medium tracking-wide transition-all duration-300 border ${
                      isDark
                        ? 'border-white/20 text-white hover:bg-white/5'
                        : 'border-black/20 text-black hover:bg-black/5'
                    }`}
                  >
                    Learn More
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 px-6 border-t ${borderColor}`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className={`text-[10px] uppercase tracking-[6px] ${textMuted}`}>
            {product.brand || 'Premium'} Collection · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductShowcase;