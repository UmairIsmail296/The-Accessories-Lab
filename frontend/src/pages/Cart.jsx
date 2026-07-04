import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, cartLoading } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const deliveryCharges = 700;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  if (cartLoading) {
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
      <div className="max-w-6xl mx-auto">
        <h1 className="section-title animate-fadeInDown">
          <span className="gradient-text">Shopping</span>{' '}
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Cart</span>
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 animate-fadeInUp">
            <p className="text-6xl mb-4">🛒</p>
            <p className={`text-2xl mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Your cart is empty</p>
            <button onClick={() => navigate('/')} className="btn-primary">Continue Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => {
                if (!item.product) return null;
                return (
                  <div key={item.product._id}
                    className={`rounded-2xl p-4 flex gap-4 animate-fadeInLeft hover-lift ${
                      theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-md border border-gray-100'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}>
                    <img src={getImageUrl(item.product.image)} alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-xl cursor-pointer"
                      onClick={() => navigate(`/product/${item.product._id}`)}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200'; }} />
                    <div className="flex-1">
                      <h3 className={`font-bold cursor-pointer hover:text-primary transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        onClick={() => navigate(`/product/${item.product._id}`)}>
                        {item.product.name}
                      </h3>
                      {item.product.brand && (
                        <p className="text-primary text-sm">{item.product.brand}</p>
                      )}
                      <p className="text-primary font-bold mt-1">Rs. {item.product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeFromCart(item.product._id)}
                        className="text-red-400 hover:text-red-300 text-sm hover:scale-110 transition-all">Remove</button>
                      <div className={`flex items-center rounded-lg overflow-hidden ${
                        theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-100'
                      }`}>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="px-3 py-1 text-primary hover:bg-primary/10 transition-colors">-</button>
                        <span className={`px-4 py-1 font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="px-3 py-1 text-primary hover:bg-primary/10 transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`rounded-2xl p-6 h-fit sticky top-24 animate-fadeInRight ${
              theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>🚚 Delivery Charges</span>
                  <span>Rs. {deliveryCharges}</span>
                </div>
                <hr className={theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} />
                <div className={`flex justify-between text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>Total</span>
                  <span className="gradient-text">Rs. {(cartTotal + deliveryCharges).toLocaleString()}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full text-lg">
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;