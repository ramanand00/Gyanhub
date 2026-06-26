// components/Footer.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import API from '../services/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubscribeLoading(true);
    setSubscribeError('');
    
    try {
      // You can implement newsletter subscription endpoint
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      setSubscribeError('Failed to subscribe. Please try again.');
    } finally {
      setSubscribeLoading(false);
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Courses', path: '/courses' },
    { name: 'My Learning', path: '/my-learning' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const supportLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Refund Policy', path: '/refund' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
    { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com' },
    { name: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com' },
    { name: 'GitHub', icon: '🐙', url: 'https://github.com' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">GP</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">GyanPark</h3>
                <p className="text-xs text-green-400">Learning Platform</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering education through accessible, high-quality learning resources. 
              Join thousands of learners and creators on our platform.
            </p>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>Trusted by 1000+ learners</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>50+ Expert Creators</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>100+ Courses & Programs</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <span className="text-green-500">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <span className="text-green-500">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for updates on new courses and features.
            </p>
            
            <form onSubmit={handleSubscribe} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribeLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm whitespace-nowrap"
                >
                  {subscribeLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {subscribed && (
                <p className="mt-2 text-green-400 text-sm flex items-center gap-1">
                  <span>✅</span> Subscribed successfully!
                </p>
              )}
              {subscribeError && (
                <p className="mt-2 text-red-400 text-sm">{subscribeError}</p>
              )}
            </form>

            {/* Social Links */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Follow us:</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 hover:shadow-lg"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              © {currentYear} <span className="text-green-400 font-medium">GyanPark</span>. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-gray-500 hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-green-400 transition-colors">
                Cookies
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-500 hover:text-green-400 transition-colors flex items-center gap-1"
              >
                <span>⬆</span> Back to Top
              </button>
            </div>
          </div>
          
          {/* Additional Footer Info */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <span>Made with ❤️ in Nepal</span>
            <span className="w-px h-4 bg-gray-700"></span>
            <span>Version 2.0.0</span>
            <span className="w-px h-4 bg-gray-700"></span>
            <span>Powered by MERN Stack</span>
            <span className="w-px h-4 bg-gray-700"></span>
            <span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;