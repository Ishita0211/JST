// src/components/shared/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/helpers';
import toast from 'react-hot-toast';

// ── Water drop SVG logo ────────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="w-9 h-9 bg-gradient-to-br from-jal-400 to-jal-600 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow">
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
        <path d="M12 2 C12 2 4 12 4 17 A8 8 0 0 0 20 17 C20 12 12 2 12 2Z" />
      </svg>
    </div>
    <span className="font-display font-bold text-xl text-jal-800 tracking-tight">
      Jal<span className="text-jal-500">Setu</span>
    </span>
  </Link>
);

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  // Role-based dashboard link
  const dashboardLink =
    profile?.role === 'vendor' ? '/vendor' :
    profile?.role === 'admin'  ? '/admin'  : null;

  const navLinks = [
    { label: 'Home',      href: '/' },
    { label: 'Order Now', href: '/order' },
    ...(dashboardLink ? [{ label: 'Dashboard', href: dashboardLink }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-jal-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-150 ${
                location.pathname === link.href
                  ? 'bg-jal-100 text-jal-700'
                  : 'text-jal-600 hover:bg-jal-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-jal-500 font-body">
                Hi, {profile?.name?.split(' ')[0] || 'there'} 👋
              </span>
              <button onClick={handleLogout} className="btn-outline text-sm py-2">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-primary text-sm py-2">
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-jal-50 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1">
            <span className={`block h-0.5 bg-jal-700 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-jal-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-jal-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-jal-100 bg-white px-4 pb-4 space-y-1"
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-jal-700 hover:bg-jal-50 font-medium"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl bg-jal-500 text-white font-semibold text-center mt-2"
              >
                Login / Sign Up
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
