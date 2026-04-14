// src/pages/AuthPage.jsx
// Unified login / signup page for customers and vendors

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser, registerUser, createVendorProfile } from '../firebase/helpers';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';

const Field = ({ label, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
  </div>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Redirect if already logged in
  if (user && profile) {
    if (profile.role === 'vendor') navigate('/vendor', { replace: true });
    else if (profile.role === 'admin') navigate('/admin', { replace: true });
    else navigate('/', { replace: true });
  }

  const [mode, setMode]       = useState('login'); // 'login' | 'signup'
  const [role, setRole]       = useState('customer'); // 'customer' | 'vendor'
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    name:        '',
    email:       '',
    phone:       '',
    password:    '',
    confirmPass: '',
    city:        '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'signup' && form.password !== form.confirmPass) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        // ── LOGIN ──
        const cred = await loginUser(form.email, form.password);
        toast.success('Welcome back! 👋');

        // Wait a moment for AuthContext to update profile, then redirect
        setTimeout(() => {
          const savedRole = cred.user.photoURL; // we use photoURL field for quick role check
          navigate('/', { replace: true });
        }, 500);

      } else {
        // ── SIGNUP ──
        const firebaseUser = await registerUser({
          email:    form.email,
          password: form.password,
          name:     form.name,
          phone:    form.phone,
          role,
        });

        // Extra setup for vendors
        if (role === 'vendor') {
          await createVendorProfile(firebaseUser.uid, {
            name:          form.name,
            email:         form.email,
            phone:         form.phone,
            city:          form.city,
            base_price:    35,    // default ₹35 per can
            floor_charge:  5,     // default ₹5 per floor
            time_slots:    ['morning', 'evening'],
            location:      null,  // vendor sets location in dashboard
            is_online:     false,
            is_verified:   false, // admin must approve
          });
          toast.success('Account created! Wait for admin approval.');
          navigate('/vendor', { replace: true });
        } else {
          toast.success('Account created! Welcome to JalSetu 💧');
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.code === 'auth/user-not-found'    ? 'No account found with this email'  :
        err.code === 'auth/wrong-password'    ? 'Incorrect password'                :
        err.code === 'auth/email-already-in-use' ? 'Email already registered'      :
        err.code === 'auth/weak-password'     ? 'Password must be at least 6 characters' :
        'Something went wrong. Try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-jal-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-jal-400 to-jal-600 rounded-3xl flex items-center justify-center shadow-glow mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
                <path d="M12 2 C12 2 4 12 4 17 A8 8 0 0 0 20 17 C20 12 12 2 12 2Z" />
              </svg>
            </div>
            <h1 className="font-display font-bold text-2xl text-jal-900">
              {mode === 'login' ? 'Welcome back' : 'Join JalSetu'}
            </h1>
            <p className="text-jal-400 text-sm mt-1">
              {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
            </p>
          </motion.div>

          <motion.div
            className="card shadow-soft"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Mode toggle */}
            <div className="flex bg-jal-50 p-1 rounded-2xl mb-6">
              {['login', 'signup'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-jal-700 shadow-sm'
                      : 'text-jal-400 hover:text-jal-600'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Role selection */}
                    <div>
                      <label className="label">I am a…</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'customer', label: 'Customer 🏠',  desc: 'Order water' },
                          { id: 'vendor',   label: 'Vendor 🚚',    desc: 'Deliver water' },
                        ].map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`p-3 rounded-2xl border-2 text-center transition-all ${
                              role === r.id
                                ? 'border-jal-500 bg-jal-50'
                                : 'border-jal-100 hover:border-jal-300'
                            }`}
                          >
                            <p className="font-semibold text-sm text-jal-800">{r.label}</p>
                            <p className="text-xs text-jal-400">{r.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Field label="Full Name">
                      <input
                        className="input"
                        placeholder="Rahul Sharma"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Phone Number">
                      <input
                        className="input"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        required
                      />
                    </Field>

                    {role === 'vendor' && (
                      <Field label="City / Area">
                        <input
                          className="input"
                          placeholder="e.g. Bangalore, Koramangala"
                          value={form.city}
                          onChange={e => set('city', e.target.value)}
                          required
                        />
                      </Field>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="Email Address">
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </Field>

              <Field label="Password">
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  minLength={6}
                  required
                />
              </Field>

              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Field label="Confirm Password">
                      <input
                        className="input"
                        type="password"
                        placeholder="••••••••"
                        value={form.confirmPass}
                        onChange={e => set('confirmPass', e.target.value)}
                        minLength={6}
                        required
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === 'signup' && role === 'vendor' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700">
                  ⚠️ Vendor accounts require admin approval before you can go live. We'll notify you via email.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </motion.div>

          <p className="text-center text-sm text-jal-400 mt-4">
            <Link to="/" className="hover:text-jal-600 transition-colors">← Back to Home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
