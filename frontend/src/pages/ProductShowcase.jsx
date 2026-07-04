import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotifyMePopup from '../components/NotifyMePopUs';
import { getImageUrl } from '../utils/imageHelper';
import toast from 'react-hot-toast';

const ProductShowcase = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [id]);

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
      if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
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

  const handleAddToCart = async () => {
    // ✅ CHECK SOLD OUT FIRST
    if (product.isSoldOut) {
      setShowNotifyPopup(true);
      return;
    }

    if (!user) {
      toast.error('Please login first!');
      navigate('/login');
      return;
    }
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
            <div className="w-1 h-12 bg-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-12 bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-12 bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className={`text-[10px] tracking-[8px] uppercase ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>
            Crafting Experience
          </p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
 const getImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200';
  return img.startsWith('http') ? img : `http://localhost:5000${img}`;
};

  const specs = product.specifications?.split('|').map(s => s.trim()).filter(Boolean) || [];

  // Color palette
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-[#08080a]' : 'bg-[#fafafa]';
  const textMain = isDark ? 'text-white' : 'text-black';
  const textMuted = isDark ? 'text-white/40' : 'text-black/40';
  const textSub = isDark ? 'text-white/60' : 'text-black/60';
  const borderColor = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const cardBg = isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]';

  return (
    <div className={`${bg} ${textMain} overflow-x-hidden relative`}>

      {/* ============ NOTIFY ME POPUP ============ */}
      {showNotifyPopup && (
        <NotifyMePopup
          product={product}
          onClose={() => setShowNotifyPopup(false)}
          onSuccess={() => fetchProduct()}
        />
      )}

      {/* ============ FLOATING NAV INDICATOR ============ */}
      <div className="fixed top-1/2 -translate-y-1/2 left-6 z-40 hidden lg:block">
        <div className="flex flex-col gap-3">
          {[
            { label: 'Hero', y: 0 },
            { label: 'Story', y: 1000 },
            { label: 'Detail', y: 2000 },
            { label: 'Features', y: 3000 },
            { label: 'Gallery', y: 4000 },
            { label: 'Style', y: 5000 },
            { label: 'Order', y: 6500 },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => window.scrollTo({ top: item.y, behavior: 'smooth' })}
              className="group flex items-center gap-3"
            >
              <span className={`text-[9px] uppercase tracking-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500 ${textMuted}`}>
                {item.label}
              </span>
              <div className={`w-px transition-all duration-500 ${
                Math.abs(scrollY - item.y) < 500
                  ? 'h-8 bg-primary'
                  : `h-4 ${isDark ? 'bg-white/20' : 'bg-black/20'} group-hover:h-6`
              }`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* ============ TOP CORNER INDICATORS ============ */}
      <div className="fixed top-20 left-6 z-40 hidden md:block">
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-xl border ${
          product.isSoldOut
            ? 'bg-red-500/10 border-red-500/30'
            : isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            product.isSoldOut ? 'bg-red-500' : 'bg-primary'
          }`}></div>
          <span className={`text-[10px] uppercase tracking-[3px] ${
            product.isSoldOut ? 'text-red-500' : textSub
          }`}>
            {product.isSoldOut ? 'Sold Out' : 'Now Viewing'}
          </span>
        </div>
      </div>

      <div className="fixed top-20 right-6 z-40 hidden md:block">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
        }`}>
          <span className={`text-[10px] uppercase tracking-[3px] ${textSub}`}>
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ================ HERO SECTION ================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Animated Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}></div>

        {/* Gradient Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30"
            style={{
              background: product.isSoldOut
                ? 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 50%)'
                : 'radial-gradient(circle, rgba(233,69,96,0.4) 0%, transparent 50%)',
              transform: `translate(${-200 + mousePos.x * 0.5}px, ${-200 + mousePos.y * 0.5}px)`,
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}></div>
          <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 50%)',
              transform: `translate(${200 - mousePos.x * 0.5}px, ${200 - mousePos.y * 0.5}px)`,
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}></div>
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: isDark
            ? 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }}></div>

        {/* SOLD OUT Banner */}
        {product.isSoldOut && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-red-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-[4px] shadow-2xl animate-pulse">
              ⚠️ Currently Sold Out
            </div>
          </div>
        )}

        {/* Top Number Badge */}
        <div className={`absolute ${product.isSoldOut ? 'top-48' : 'top-32'} left-1/2 -translate-x-1/2 flex flex-col items-center gap-4`}>
          <div className={`text-[10px] tracking-[10px] uppercase ${textMuted}`}>
            № 001 / Collection
          </div>
          <div className={`h-12 w-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto pt-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY / 700),
          }}>

          {/* Product Image with 3D effect */}
          <div className="mb-16 relative" style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 0.3}deg) rotateX(${-mousePos.y * 0.3}deg) translateZ(0)`,
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <div className="relative inline-block">
              {/* Reflection Glow */}
              <div className={`absolute -inset-20 blur-[100px] opacity-40 rounded-full ${
                product.isSoldOut
                  ? 'bg-gradient-to-br from-red-500 via-gray-500 to-gray-700'
                  : 'bg-gradient-to-br from-primary via-purple-500 to-pink-500'
              }`}></div>

              {/* Product Image */}
              <img
                src={getImageUrl(images[0])}
                alt={product.name}
                className={`relative w-full max-w-lg mx-auto object-contain ${
                  product.isSoldOut ? 'grayscale' : ''
                }`}
                style={{
                  filter: product.isSoldOut
                    ? 'grayscale(100%) drop-shadow(0 50px 80px rgba(239, 68, 68, 0.3)) drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
                    : 'drop-shadow(0 50px 80px rgba(233, 69, 96, 0.3)) drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800'; }}
              />

              {/* SOLD OUT Stamp */}
              {product.isSoldOut && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-red-600 text-white px-12 py-4 rounded-xl font-black text-4xl transform rotate-[-15deg] shadow-2xl border-4 border-white">
                    SOLD OUT
                  </div>
                </div>
              )}

              {/* Reflection Below */}
              <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-3/4 h-32 opacity-20"
                style={{
                  backgroundImage: `url(${getImageUrl(images[0])})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'top',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scaleY(-1)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
                  filter: product.isSoldOut ? 'blur(4px) grayscale(100%)' : 'blur(4px)',
                }}></div>
            </div>
          </div>

          {/* Brand Tag */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className={`h-px w-8 ${isDark ? 'bg-white/30' : 'bg-black/30'}`}></div>
            <p className="text-[10px] tracking-[8px] uppercase text-primary font-medium">
              {product.brand || 'Lab Series'}
            </p>
            <div className={`h-px w-8 ${isDark ? 'bg-white/30' : 'bg-black/30'}`}></div>
          </div>

          {/* Product Name */}
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

          {/* Tagline */}
          <p className={`text-base md:text-lg ${textSub} max-w-2xl mx-auto mb-12 font-light tracking-wide animate-fadeInUp`}
            style={{ animationDelay: '0.8s' }}>
            {product.isSoldOut ? (
              <>
                <span className="text-red-500 font-bold">Temporarily unavailable.</span>
                <br />
                <span className={textMuted}>Subscribe to get notified when it's back in stock.</span>
              </>
            ) : (
              <>
                Where engineering meets emotion.
                <br />
                <span className={textMuted}>Designed for those who seek perfection in every detail.</span>
              </>
            )}
          </p>

          {/* Price Pill */}
          <div className="inline-flex items-center gap-6 animate-fadeInUp" style={{ animationDelay: '1s' }}>
            <div className={`px-6 py-3 rounded-full border backdrop-blur-xl ${
              product.isSoldOut
                ? 'border-red-500/30 bg-red-500/5'
                : isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
            }`}>
              <span className={`text-[10px] uppercase tracking-[3px] ${textMuted} mr-3`}>From</span>
              <span className={`text-lg font-medium ${product.isSoldOut ? 'line-through text-red-500' : ''}`}>
                Rs. {product.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
          <span className={`text-[9px] tracking-[6px] uppercase ${textMuted}`}>
            {product.isSoldOut ? 'Get Notified' : 'Begin Journey'}
          </span>
          <div className="relative h-16 w-px overflow-hidden">
            <div className={`absolute inset-0 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
            <div className={`absolute inset-x-0 h-8 animate-scrollLine ${
              product.isSoldOut ? 'bg-red-500' : 'bg-primary'
            }`}></div>
          </div>
        </div>
      </section>

      {/* ================ MANIFESTO SECTION ================ */}
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary"></div>
                <p className={`text-xs uppercase tracking-[4px] ${textMuted}`}>
                  Designed in Pakistan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================ LARGE PRODUCT SHOWCASE ================ */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `url(${getImageUrl(images[0])})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${1.2 + Math.min(0.1, scrollY * 0.0001)}) translateY(${(scrollY - 1500) * 0.2}px)`,
              filter: product.isSoldOut ? 'blur(2px) grayscale(100%)' : 'blur(2px)',
            }}></div>

          <div className={`absolute inset-0 ${isDark
            ? 'bg-gradient-to-b from-[#08080a] via-transparent to-[#08080a]'
            : 'bg-gradient-to-b from-[#fafafa] via-transparent to-[#fafafa]'
          }`}></div>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/50' : 'bg-white/50'}`}></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            <p className="text-[10px] uppercase tracking-[8px] text-primary mb-8">A Closer Look</p>
            <h3 className={`text-4xl md:text-6xl lg:text-7xl font-thin leading-[1.05] ${textMain} mb-8`}>
              Every curve.
              <br />
              <span className="font-bold">Every detail.</span>
              <br />
              <span className={`font-light italic ${textSub}`}>Considered.</span>
            </h3>
          </div>

          <div className="absolute bottom-20 left-0 right-0 px-6">
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { value: '100%', label: 'Premium Quality' },
                { value: '24/7', label: 'Support Available' },
                { value: '1 Year', label: 'Warranty Included' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-thin mb-2">{stat.value}</div>
                  <div className={`text-[10px] uppercase tracking-[3px] ${textMuted}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================ SPECIFICATIONS SECTION ================ */}
      {specs.length > 0 && (
        <section className="relative py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 02</span>
              <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Specifications</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="lg:sticky lg:top-32">
                <p className="text-xs uppercase tracking-[6px] text-primary mb-6">Technical Excellence</p>
                <h2 className="text-5xl md:text-7xl font-thin leading-[1.05] mb-8">
                  Engineered
                  <br />
                  to <span className="font-bold gradient-text">perform.</span>
                </h2>
                <p className={`${textSub} text-lg font-light leading-relaxed max-w-md`}>
                  Each specification represents hours of research, testing, and refinement to deliver an uncompromising experience.
                </p>

                <div className={`mt-12 text-[140px] font-thin leading-none ${textMuted} opacity-30 select-none`}>
                  {specs.length.toString().padStart(2, '0')}
                </div>
              </div>

              <div className="space-y-px">
                {specs.map((spec, i) => (
                  <div key={i} className={`group p-8 border-b ${borderColor} hover:bg-primary/5 transition-all duration-500 cursor-default`}>
                    <div className="flex items-start gap-6">
                      <span className={`text-xs ${textMuted} pt-1 font-mono`}>
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className={`text-2xl md:text-3xl font-light ${textMain} group-hover:translate-x-2 transition-transform duration-500`}>
                          {spec}
                        </p>
                      </div>
                      <span className={`text-xl ${textMuted} group-hover:text-primary group-hover:translate-x-2 transition-all duration-500`}>
                        →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================ GALLERY SECTION ================ */}
      {images.length > 1 && (
        <section className="relative py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 03</span>
              <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Visual Story</span>
            </div>

            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-[6px] text-primary mb-6">Visual Showcase</p>
              <h2 className="text-5xl md:text-7xl font-thin leading-[1.05]">
                A study in
                <br />
                <span className="font-bold italic gradient-text">elegance.</span>
              </h2>
            </div>

            <div className="space-y-8">
              <div className="relative group overflow-hidden rounded-2xl aspect-[21/9]">
                <img
                  src={getImageUrl(images[0])}
                  alt=""
                  className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${
                    product.isSoldOut ? 'grayscale' : ''
                  }`}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1400'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                  <p className="text-[10px] tracking-[4px] uppercase mb-2 opacity-60">Hero Shot</p>
                  <p className="text-2xl font-light">{product.name}</p>
                </div>
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {images.slice(1, 3).map((img, i) => (
                    <div key={i} className="relative group overflow-hidden rounded-2xl aspect-square">
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${
                          product.isSoldOut ? 'grayscale' : ''
                        }`}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {images.slice(3, 6).map((img, i) => (
                    <div key={i} className="relative group overflow-hidden rounded-2xl aspect-[3/4]">
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${
                          product.isSoldOut ? 'grayscale' : ''
                        }`}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================ COLOR SELECTION ================ */}
      {product.colors?.length > 0 && (
        <section className="relative py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Chapter 04</span>
              <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
              <span className={`text-[10px] tracking-[6px] uppercase ${textMuted}`}>Personalization</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[400px] h-[400px] rounded-full opacity-50"
                    style={{
                      background: `radial-gradient(circle, ${getColorValue(selectedColor)}40 0%, transparent 70%)`,
                      transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}></div>
                </div>

                <img
                  src={getImageUrl(images[0])}
                  alt={product.name}
                  className={`relative w-full max-w-md mx-auto object-contain ${
                    product.isSoldOut ? 'grayscale' : ''
                  }`}
                  style={{
                    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.3))',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600'; }}
                />

                <div className="absolute top-4 right-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: getColorValue(selectedColor) }}></div>
                  <span className={`text-xs uppercase tracking-[3px] ${textSub}`}>{selectedColor}</span>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[6px] text-primary mb-6">Make it yours</p>
                <h2 className="text-5xl md:text-6xl font-thin leading-[1.05] mb-4">
                  Find your
                  <br />
                  <span className="font-bold italic gradient-text">perfect match.</span>
                </h2>
                <p className={`${textSub} text-lg font-light leading-relaxed mb-12 max-w-md`}>
                  Express your individuality with our carefully curated collection of premium finishes.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {product.colors.map((color, i) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={product.isSoldOut}
                      className={`group flex items-center gap-6 p-6 rounded-2xl border transition-all duration-500 ${
                        product.isSoldOut ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        selectedColor === color
                          ? isDark
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-primary/50 bg-primary/5'
                          : isDark
                            ? 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                            : 'border-black/5 hover:border-black/20 bg-black/[0.02]'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full transition-all duration-500 ${
                          selectedColor === color ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                          style={{
                            background: getColorValue(color),
                            boxShadow: `0 0 0 2px ${selectedColor === color ? '#e94560' : 'transparent'}, 0 10px 30px ${getColorValue(color)}40`,
                          }}></div>
                      </div>

                      <div className="flex-1 text-left">
                        <p className={`text-lg font-medium ${textMain}`}>{color}</p>
                        <p className={`text-xs uppercase tracking-[2px] ${textMuted} mt-1`}>
                          {selectedColor === color ? 'Selected' : 'Available'}
                        </p>
                      </div>

                      <div className={`text-sm transition-all duration-500 ${
                        selectedColor === color ? 'text-primary opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
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

      {/* ================ FINAL CTA - SOLD OUT OR RESERVE ================ */}
      <section className="relative py-40 px-6 overflow-hidden">

        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full opacity-10"
            style={{
              background: product.isSoldOut
                ? 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(233,69,96,0.5) 0%, transparent 70%)',
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
                <>
                  Be the first to
                  <br />
                  <span className="font-bold italic gradient-text">know.</span>
                </>
              ) : (
                <>
                  Begin your
                  <br />
                  <span className="font-bold italic gradient-text">journey.</span>
                </>
              )}
            </h2>

            {/* Premium Price Card */}
            <div className={`inline-block p-12 rounded-3xl border backdrop-blur-xl ${
              product.isSoldOut
                ? 'border-red-500/20 bg-red-500/[0.02]'
                : isDark
                  ? 'border-white/10 bg-white/[0.02]'
                  : 'border-black/10 bg-black/[0.02]'
            } mb-16`}>

              {/* ============ SOLD OUT VIEW ============ */}
              {product.isSoldOut ? (
                <>
                  {/* Sold Out Header */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-px bg-red-500"></div>
                    <p className="text-[10px] uppercase tracking-[6px] text-red-500 font-bold">Out of Stock</p>
                    <div className="w-12 h-px bg-red-500"></div>
                  </div>

                  {/* Sad Icon */}
                  <div className="text-7xl mb-6">😔</div>

                  {/* Sold Out Title */}
                  <h3 className={`text-3xl md:text-4xl font-thin mb-4 ${textMain}`}>
                    Temporarily <span className="font-bold text-red-500">Sold Out</span>
                  </h3>

                  {/* Price with line-through */}
                  <div className="mb-6">
                    <span className={`text-2xl ${textMuted} font-thin line-through`}>Rs.</span>
                    <span className="text-5xl md:text-6xl font-thin tracking-tight ml-2 line-through text-red-500">
                      {product.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Description */}
                  <p className={`text-sm ${textSub} mb-10 font-light max-w-md mx-auto`}>
                    This product is in high demand and currently unavailable.
                    <br />
                    <span className={textMuted}>Subscribe below to be notified the moment it's back in stock.</span>
                  </p>

                  {/* Subscribers Info */}
                  {product.notifySubscribers && product.notifySubscribers.length > 0 && (
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8 ${
                      isDark ? 'bg-white/5' : 'bg-black/5'
                    }`}>
                      <span className="text-2xl">🔔</span>
                      <span className={`text-sm ${textSub}`}>
                        <span className="text-primary font-bold">{product.notifySubscribers.length}</span> {product.notifySubscribers.length === 1 ? 'person is' : 'people are'} waiting
                      </span>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="space-y-3 max-w-sm mx-auto">
                    <button
                      onClick={() => setShowNotifyPopup(true)}
                      className="w-full py-5 rounded-full font-medium tracking-wide transition-all duration-500 group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white hover:shadow-2xl hover:shadow-orange-500/40"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <span className="text-xl">🔔</span>
                        <span>Notify Me When Available</span>
                      </span>
                    </button>

                    <button
                      onClick={() => navigate('/')}
                      className={`w-full py-5 rounded-full font-medium tracking-wide transition-all duration-300 border ${
                        isDark
                          ? 'border-white/20 text-white hover:bg-white/5 hover:border-white/30'
                          : 'border-black/20 text-black hover:bg-black/5 hover:border-black/30'
                      }`}
                    >
                      ← Browse Other Products
                    </button>

                    <a
                      href={`https://wa.me/923427600786?text=${encodeURIComponent(`Hi! I'm interested in: ${product.name} (Currently Sold Out). When will it be available?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-5 rounded-full font-medium tracking-wide transition-all duration-300 bg-green-500 hover:bg-green-600 text-white inline-flex items-center justify-center gap-3"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Ask on WhatsApp
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* ============ NORMAL VIEW (AVAILABLE) ============ */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-px bg-primary"></div>
                    <p className={`text-[10px] uppercase tracking-[6px] ${textMuted}`}>Investment</p>
                    <div className="w-12 h-px bg-primary"></div>
                  </div>

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

                  <div className="space-y-3 max-w-sm mx-auto">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className={`w-full py-5 rounded-full font-medium tracking-wide transition-all duration-500 group relative overflow-hidden ${
                        addingToCart
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-primary to-red-500 text-white hover:shadow-2xl hover:shadow-primary/40'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {addingToCart ? (
                          <>
                            <span className="text-lg">✓</span>
                            <span>Added to Bag</span>
                          </>
                        ) : (
                          <>
                            <span>Add To Cart</span>
                            <span className="transition-transform group-hover:translate-x-2">→</span>
                          </>
                        )}
                      </span>
                    </button>

                    <button
                      onClick={() => navigate(`/product/${id}`)}
                      className={`w-full py-5 rounded-full font-medium tracking-wide transition-all duration-300 border ${
                        isDark
                          ? 'border-white/20 text-white hover:bg-white/5 hover:border-white/30'
                          : 'border-black/20 text-black hover:bg-black/5 hover:border-black/30'
                      }`}
                    >
                      Learn More
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Service Cards - Only show when available */}
            {!product.isSoldOut && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                {[
                  { icon: '◇', label: 'Free Delivery', detail: 'Pakistan-wide shipping', sub: 'Premium handling' },
                  { icon: '○', label: 'Easy Returns', detail: '7-day return policy', sub: 'No questions asked' },
                  { icon: '△', label: 'Warranty', detail: '1-year coverage', sub: 'Brand certified' },
                ].map((item, i) => (
                  <div key={i} className={`p-8 rounded-2xl border ${
                    isDark ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-black/[0.01]'
                  } hover:scale-[1.02] transition-all duration-500 group`}>
                    <div className="text-3xl mb-4 text-primary group-hover:scale-110 transition-transform duration-500">
                      {item.icon}
                    </div>
                    <p className={`text-sm font-medium ${textMain} mb-2`}>{item.label}</p>
                    <p className={`text-xs ${textSub} mb-1`}>{item.detail}</p>
                    <p className={`text-[10px] uppercase tracking-[2px] ${textMuted}`}>{item.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* WhatsApp Help */}
            <div className="mt-20 pt-12 border-t border-white/5">
              <p className={`text-[10px] uppercase tracking-[4px] ${textMuted} mb-4`}>
                Need Assistance?
              </p>
              <a
                href={`https://wa.me/923427600786?text=${encodeURIComponent(`Hi! I'm interested in: ${product.name}${product.isSoldOut ? ' (Currently Sold Out)' : ''}`)}`}
                target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 text-base font-light ${textMain} hover:text-primary transition-colors group`}
              >
                <span>Chat on the Whatsapp</span>
                <span className="transition-transform group-hover:translate-x-2">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================ ELEGANT FOOTER ================ */}
      <footer className={`py-16 px-6 border-t ${borderColor}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-8 h-px ${isDark ? 'bg-white/20' : 'bg-black/20'}`}></div>
              <p className={`text-[10px] uppercase tracking-[6px] ${textMuted}`}>
                {product.brand || 'Premium'} Collection
              </p>
            </div>

            <p className={`text-[10px] uppercase tracking-[4px] ${textMuted}`}>
              The Accessories Lab · Karachi, Pakistan
            </p>

            <div className="flex items-center gap-6">
              <p className={`text-[10px] uppercase tracking-[6px] ${textMuted}`}>
                © {new Date().getFullYear()}
              </p>
              <div className={`w-8 h-px ${isDark ? 'bg-white/20' : 'bg-black/20'}`}></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper function
const getColorValue = (colorName) => {
  const colorMap = {
    'black': '#1a1a1a', 'white': '#f5f5f5', 'red': '#dc2626', 'blue': '#2563eb',
    'green': '#16a34a', 'yellow': '#eab308', 'pink': '#ec4899', 'purple': '#9333ea',
    'orange': '#ea580c', 'gold': '#fbbf24', 'silver': '#cbd5e1', 'navy': '#1e3a8a',
    'navy blue': '#1e3a8a', 'rose gold': '#e8b4b8', 'space grey': '#4b5563',
    'midnight': '#1e293b', 'midnight black': '#0f172a', 'pearl white': '#fafaf9',
    'army green': '#4d5d2f', 'brown': '#78350f', 'grey': '#6b7280', 'gray': '#6b7280',
    'titanium black': '#27272a', 'titanium grey': '#52525b', 'titanium silver': '#a1a1aa',
    'ivory': '#fffff0', 'graphite': '#374151', 'sand': '#d4b896', 'forest green': '#22543d',
    'olive': '#65741a', 'charcoal': '#36454f', 'teal': '#0d9488', 'coral': '#ff7f50',
    'cream': '#fffdd0', 'cream white': '#fefce8', 'deep blue': '#1e40af',
  };
  const lowerColor = colorName?.toLowerCase().trim() || '';
  if (colorMap[lowerColor]) return colorMap[lowerColor];
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerColor.includes(key) || key.includes(lowerColor)) return value;
  }
  return '#6b7280';
};

export default ProductShowcase;