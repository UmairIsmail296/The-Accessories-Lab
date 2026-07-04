import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setGoogleUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (token && name && email && id) {
      const userData = { _id: id, name, email, token };
      setGoogleUser(userData);
      toast.success(`Welcome, ${name}!`);
      navigate('/');
    } else {
      toast.error('Google login failed');
      navigate('/login');
    }
  }, []);

  return (
    <div className="page-container flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default GoogleCallback;