import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import WhatsAppButton from './components/WhatsAppButton';
import InitialLoader from './components/InitialLoader';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import ProductDetail from './pages/ProductDetail';
import ProductShowcase from './pages/ProductShowcase';
import GoogleCallback from './pages/GoogleCallback';
import TrackOrder from './pages/TrackOrder';
import ContactUs from './pages/ContactUs';
import Reviews from './pages/Reviews';
import UserProfile from './pages/UserProfile';

import Airpods from './pages/categories/Airpods';
import Handfree from './pages/categories/Handfree';
import MobileBackCovers from './pages/categories/MobileBackCovers';
import Adapters from './pages/categories/Adapters';
import ChargingLeads from './pages/categories/ChargingLeads';
import CoolingFans from './pages/categories/CoolingFans';
import Splitters from './pages/categories/Splitters';
import Connectors from './pages/categories/Connectors';
import MobileWatch from './pages/categories/MobileWatch';
import Headphones from './pages/categories/Headphones';
import Speakers from './pages/categories/Speakers';
import Powerbank from './pages/categories/Powerbank';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminManageProducts from './pages/admin/AdminManageProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminEditProduct from './pages/admin/AdminEditProduct';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [initialLoading, setInitialLoading] = useState(true);

  // Show loader only on first visit
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('hasLoaded');
    if (hasLoaded) {
      setInitialLoading(false);
    }
  }, []);

  const handleLoaderComplete = () => {
    setInitialLoading(false);
    sessionStorage.setItem('hasLoaded', 'true');
  };

  if (initialLoading) {
    return <InitialLoader onComplete={handleLoaderComplete} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { background: '#16213e', color: '#fff', border: '1px solid #e94560' }
      }} />

      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <WhatsAppButton />}

      <main className="flex-1">
        {/* PageTransition wraps routes for animation */}
        {!isAdminRoute ? (
          <PageTransition>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/google-callback" element={<GoogleCallback />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/showcase/:id" element={<ProductShowcase />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/reviews" element={<Reviews />} />

              <Route path="/airpods" element={<Airpods />} />
              <Route path="/handfree" element={<Handfree />} />
              <Route path="/mobile-back-covers" element={<MobileBackCovers />} />
              <Route path="/adapters" element={<Adapters />} />
              <Route path="/charging-leads" element={<ChargingLeads />} />
              <Route path="/cooling-fans" element={<CoolingFans />} />
              <Route path="/splitters" element={<Splitters />} />
              <Route path="/connectors" element={<Connectors />} />
              <Route path="/mobile-watch" element={<MobileWatch />} />
              <Route path="/headphones" element={<Headphones />} />
              <Route path="/speakers" element={<Speakers />} />
              <Route path="/powerbank" element={<Powerbank />} />

              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            </Routes>
          </PageTransition>
        ) : (
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/add-product" element={<AdminRoute><AdminAddProduct /></AdminRoute>} />
            <Route path="/admin/manage-products" element={<AdminRoute><AdminManageProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/edit-product/:id" element={<AdminRoute><AdminEditProduct /></AdminRoute>} />
          </Routes>
        )}
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;