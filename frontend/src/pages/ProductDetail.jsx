import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';
import NotifyMePopup from '../components/NotifyMePopUs';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }

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
      if (success) toast.success('Added to cart!');
    }, 800);
  };

  const handleBuyNow = async () => {
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
      if (success) navigate('/cart');
    }, 600);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-6 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image ? [product.image] : [];

  const specs = product.specifications
    ? product.specifications.split('|').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className={`min-h-screen pt-20 pb-12 ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      {showNotifyPopup && (
        <NotifyMePopup product={product} onClose={() => setShowNotifyPopup(false)} onSuccess={() => fetchProduct()} />
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-4 text-sm animate-fadeInLeft flex-wrap">
          <button onClick={() => navigate('/')} className="text-primary hover:underline">Home</button>
          <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>/</span>
          <button onClick={() => navigate(`/${product.category}`)} className="text-primary hover:underline capitalize">
            {product.category.replace(/-/g, ' ')}
          </button>
          <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>/</span>
          <span className={`truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* LEFT - Image Gallery */}
          <div className="animate-fadeInLeft">
            <div className={`relative rounded-3xl overflow-hidden aspect-square mb-4 ${
              theme === 'dark' ? 'bg-[#12122a]' : 'bg-white shadow-lg'
            }`}>
              <img
                src={getImageUrl(images[currentImage])}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } ${product.isSoldOut ? 'grayscale' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600';
                  setImageLoaded(true);
                }}
              />

              {product.isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <div className="bg-red-600 text-white px-12 py-4 rounded-xl font-black text-3xl transform rotate-[-12deg] shadow-2xl border-4 border-white">
                    SOLD OUT
                  </div>
                </div>
              )}

              {product.brand && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-primary to-red-400 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-lg z-10">
                  {product.brand}
                </span>
              )}

              {product.isSoldOut && (
                <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-lg z-10 animate-pulse">
                  OUT OF STOCK
                </span>
              )}

              {images.length > 1 && !product.isSoldOut && (
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {currentImage + 1} / {images.length}
                </div>
              )}

              {images.length > 1 && !product.isSoldOut && (
                <>
                  <button
                    onClick={() => { setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1)); setImageLoaded(false); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                  >‹</button>
                  <button
                    onClick={() => { setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1)); setImageLoaded(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                  >›</button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 image-slider">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => { setCurrentImage(index); setImageLoaded(false); }}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      index === currentImage
                        ? 'border-primary shadow-lg shadow-primary/30 scale-105'
                        : theme === 'dark'
                          ? 'border-gray-700 opacity-60 hover:opacity-100'
                          : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} view ${index + 1}`}
                      className={`w-full h-full object-cover ${product.isSoldOut ? 'grayscale' : ''}`}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - Product Info */}
          <div className="animate-fadeInRight">
            {product.brand && (
              <p className="text-primary text-xs font-black uppercase tracking-[4px] mb-3">{product.brand}</p>
            )}

            <h1 className={`text-3xl md:text-4xl font-black mb-4 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{product.name}</h1>

            {product.isSoldOut ? (
              <div className="inline-flex items-center gap-2 mb-4 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-red-500 text-sm font-black uppercase tracking-wider">Sold Out</span>
              </div>
            ) : product.stock > 0 ? (
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-500 text-sm font-bold">In Stock ({product.stock} available)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-red-500 text-sm font-bold">Out of Stock</span>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl md:text-5xl font-black ${
                  product.isSoldOut ? 'text-gray-500 line-through' : 'gradient-text'
                }`}>Rs. {product.price.toLocaleString()}</span>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                + Rs. 700 Delivery (All Pakistan)
              </p>
            </div>

            <div className="mb-8">
              <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Description
              </h3>
              <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {product.description}
              </p>
            </div>

            {specs.length > 0 && (
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {specs.map((spec, i) => (
                    <div key={i} className={`px-4 py-3 rounded-xl text-sm font-medium ${
                      theme === 'dark' ? 'bg-[#12122a] text-gray-300 border border-gray-800' : 'bg-white text-gray-600 border border-gray-100 shadow-sm'
                    }`}>
                      ✓ {spec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Available Colors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={product.isSoldOut}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        product.isSoldOut ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        selectedColor === color
                          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                          : theme === 'dark'
                            ? 'bg-[#12122a] text-gray-300 border border-gray-700 hover:border-primary'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary shadow-sm'
                      }`}
                    >{color}</button>
                  ))}
                </div>
              </div>
            )}

            {!product.isSoldOut && (
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Quantity
                </h3>
                <div className={`inline-flex items-center rounded-xl overflow-hidden ${
                  theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 text-primary hover:bg-primary/10 transition-colors text-xl font-bold">−</button>
                  <span className={`px-8 py-3 font-bold text-xl border-x min-w-[80px] text-center ${
                    theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-900 border-gray-200'
                  }`}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="px-5 py-3 text-primary hover:bg-primary/10 transition-colors text-xl font-bold">+</button>
                </div>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total: <span className="text-primary font-bold">Rs. {(product.price * quantity).toLocaleString()}</span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              {product.isSoldOut ? (
                <>
                  <div className={`rounded-2xl p-6 text-center ${
                    theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className="text-5xl mb-3">😔</p>
                    <h3 className="text-red-500 font-black text-xl mb-2">Currently Sold Out</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      This product is temporarily unavailable.
                      <br />
                      Get notified when it's back in stock!
                    </p>
                  </div>

                  <button
                    onClick={() => setShowNotifyPopup(true)}
                    className="w-full text-lg py-4 rounded-2xl font-black transition-all duration-500 bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-95"
                  >🔔 Notify Me When Available</button>

                  <button
                    onClick={() => navigate(-1)}
                    className={`w-full text-lg py-4 rounded-2xl font-bold transition-all duration-300 ${
                      theme === 'dark' ? 'bg-[#12122a] text-white border-2 border-gray-700 hover:bg-white/5' : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 shadow-sm'
                    }`}
                  >← Continue Shopping</button>

                  {product.notifySubscribers && product.notifySubscribers.length > 0 && (
                    <div className={`text-center text-sm py-3 rounded-xl ${
                      theme === 'dark' ? 'bg-[#12122a] text-gray-400' : 'bg-gray-50 text-gray-500'
                    }`}>
                      🔔 <span className="text-primary font-bold">{product.notifySubscribers.length}</span> {product.notifySubscribers.length === 1 ? 'person is' : 'people are'} waiting
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0}
                    className={`w-full text-lg py-4 rounded-2xl font-black transition-all duration-500 ${
                      product.stock === 0 ? 'bg-gray-500 text-white cursor-not-allowed'
                        : addingToCart ? 'bg-green-500 text-white scale-[1.02]'
                        : 'bg-gradient-to-r from-primary to-red-500 hover:from-red-500 hover:to-primary text-white hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]'
                    } active:scale-95`}
                  >
                    {product.stock === 0 ? 'Out of Stock' : addingToCart ? '✓ Added to Cart!' : `🛒 Add to Cart — Rs. ${(product.price * quantity).toLocaleString()}`}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart || product.stock === 0}
                    className={`w-full text-lg py-4 rounded-2xl font-bold transition-all duration-300 ${
                      product.stock === 0 ? 'opacity-50 cursor-not-allowed'
                        : theme === 'dark' ? 'bg-[#12122a] text-white border-2 border-primary hover:bg-primary/10' : 'bg-white text-primary border-2 border-primary hover:bg-primary/5 shadow-sm'
                    }`}
                  >⚡ Buy Now</button>
                </>
              )}
            </div>

            <div className={`mt-8 rounded-2xl p-6 space-y-4 ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white border border-gray-100 shadow-sm'
            }`}>
              {[
                { icon: '🚚', title: 'Delivery: Rs. 700 (All Pakistan)', sub: 'Estimated delivery in 4-6 business days' },
                { icon: '💳', title: 'Cash on Delivery', sub: 'Pay when you receive your order' },
                { icon: '🔒', title: 'Brand Warranty', sub: `Official ${product.brand || 'brand'} warranty included` },
                { icon: '📞', title: '24/7 Customer Support', sub: 'WhatsApp us at 0342-7600786' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                    <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/923427600786?text=${encodeURIComponent(`Hi! I'm interested in: ${product.name} - Rs. ${product.price.toLocaleString()}${product.isSoldOut ? ' (Currently Sold Out)' : ''} - ${window.location.href}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Ask on WhatsApp
              </a>

              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className={`font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm ${
                  theme === 'dark' ? 'bg-[#12122a] text-white border border-gray-700 hover:border-primary' : 'bg-white text-gray-700 border border-gray-200 hover:border-primary shadow-sm'
                }`}
              >🔗 Share Link</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;