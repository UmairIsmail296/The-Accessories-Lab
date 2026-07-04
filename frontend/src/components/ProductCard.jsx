import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';
import NotifyMePopup from './NotifyMePopUs';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [adding, setAdding] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image ? [product.image] : [];

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (product.isSoldOut) {
      setShowNotifyPopup(true);
      return;
    }

    if (!user) {
      toast.error('Please login first!');
      navigate('/login');
      return;
    }
    setAdding(true);
    const success = await addToCart(product._id);
    setTimeout(() => {
      setAdding(false);
      if (success) toast.success('Added to cart!');
      else toast.error('Failed to add');
    }, 600);
  };

  const handleNotifyClick = (e) => {
    e.stopPropagation();
    setShowNotifyPopup(true);
  };

  return (
    <>
      {showNotifyPopup && (
        <NotifyMePopup product={product} onClose={() => setShowNotifyPopup(false)} />
      )}

      <div
        className={`card-style group cursor-pointer opacity-0 animate-fadeInUp relative hover-lift ${
          theme === 'dark' ? 'hover:shadow-xl hover:shadow-primary/10' : 'hover:shadow-xl hover:shadow-gray-300/50'
        }`}
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {/* Image Section */}
        <div className={`relative overflow-hidden aspect-square ${
          theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-50'
        }`}>
          {/* Loading skeleton */}
          {!imgLoaded && (
            <div className={`absolute inset-0 animate-pulse ${
              theme === 'dark' ? 'bg-[#12122a]' : 'bg-gray-200'
            }`}></div>
          )}

          <img
            src={getImageUrl(images[currentImg])}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${
              product.isSoldOut ? 'grayscale opacity-60' : ''
            } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300';
              setImgLoaded(true);
            }}
          />

          {/* SOLD OUT Overlay */}
          {product.isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="bg-red-600 text-white px-6 py-2 rounded-lg font-black text-lg transform rotate-[-15deg] shadow-2xl border-2 border-white">
                SOLD OUT
              </div>
            </div>
          )}

          {/* Image Indicators */}
          {images.length > 1 && !product.isSoldOut && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentImg(i); setImgLoaded(false); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentImg ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Brand Badge */}
          {product.brand && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-primary to-red-400 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg z-10">
              {product.brand}
            </span>
          )}

          {/* Sold Out Badge */}
          {product.isSoldOut && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg z-10 animate-pulse">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className={`font-bold text-base mb-1 truncate group-hover:text-primary transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {product.name}
          </h3>
          <p className={`text-sm mb-3 line-clamp-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {product.description}
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-lg font-black ${
              product.isSoldOut ? 'text-gray-500 line-through' : 'text-primary'
            }`}>
              Rs. {product.price.toLocaleString()}
            </span>
            {!product.isSoldOut ? (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`text-sm font-bold py-2 px-4 rounded-xl transition-all duration-500 ${
                  adding
                    ? 'bg-green-500 text-white scale-110'
                    : 'bg-gradient-to-r from-primary to-red-400 text-white hover:shadow-lg hover:shadow-primary/30 hover:scale-105'
                } active:scale-95`}
              >
                {adding ? '✓ Added!' : 'Add to Cart'}
              </button>
            ) : (
              <button
                onClick={handleNotifyClick}
                className="text-sm font-bold py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
              >
                🔔 Notify Me
              </button>
            )}
          </div>

          {product.isSoldOut && (
            <p className={`text-xs text-center mt-2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Get notified when back in stock
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCard;