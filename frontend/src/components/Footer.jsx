import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className={`border-t mt-auto ${
      theme === 'dark'
        ? 'bg-[#080810] border-gray-800'
        : 'bg-white border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-black mb-4">
              <span className="gradient-text">THE ACCESSORIES LAB</span>
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Your one-stop shop for premium mobile accessories from Ronin, Zero and more.
            </p>
          </div>

          <div>
            <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
            <div className="space-y-2">
              {[
                { name: 'Airpods', path: '/airpods' },
                { name: 'Handfree', path: '/handfree' },
                { name: 'Headphones', path: '/headphones' },
                { name: 'Speakers', path: '/speakers' },
                { name: 'Powerbank', path: '/powerbank' },
                { name: 'Watches', path: '/mobile-watch' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block transition-colors hover:text-primary ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contact</h4>
            <div className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>theaccessorieslab@gmail.com</p>
              <p>+92 3096248054</p>
              <p>Pakistan</p>
            </div>
          </div>
        </div>

        <div className={`border-t mt-8 pt-8 text-center ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
            &copy; {new Date().getFullYear()} THE ACCESSORIES LAB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;