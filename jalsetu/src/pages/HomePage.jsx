// src/pages/HomePage.jsx
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

// ── Animated water drop shapes ────────────────────────────────────────────────
const WaterDrop = ({ size = 80, delay = 0, x = 0, y = 0, opacity = 0.15 }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size * 1.2, opacity }}
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 5 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 0 C40 0 0 50 0 68 A40 40 0 0 0 80 68 C80 50 40 0 40 0Z" fill="#3b97f0" />
    </svg>
  </motion.div>
);

// ── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    className="card text-center"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="font-display font-semibold text-jal-800 text-lg mb-2">{title}</h3>
    <p className="text-jal-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

// ── Step card ─────────────────────────────────────────────────────────────────
const Step = ({ num, title, desc }) => (
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 shrink-0 rounded-2xl bg-jal-500 text-white font-display font-bold flex items-center justify-center shadow-soft">
      {num}
    </div>
    <div>
      <h4 className="font-display font-semibold text-jal-800">{title}</h4>
      <p className="text-jal-500 text-sm mt-0.5">{desc}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const orderRef = useRef(null);

  const scrollToOrder = () =>
    orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-jal-50 via-white to-jal-100 py-20 sm:py-32 px-4">
        {/* Background water drops */}
        <WaterDrop size={120} x={-5} y={-10} delay={0}   opacity={0.08} />
        <WaterDrop size={80}  x={85}  y={5}   delay={1}   opacity={0.10} />
        <WaterDrop size={60}  x={70}  y={60}  delay={2}   opacity={0.07} />
        <WaterDrop size={100} x={5}   y={60}  delay={1.5} opacity={0.06} />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-jal-100 text-jal-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm"
          >
            <span className="w-2 h-2 bg-jal-500 rounded-full animate-pulse-slow" />
            Now live across major cities in India
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="font-display font-extrabold text-4xl sm:text-6xl text-jal-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Water. Delivered
            <br />
            <span className="text-jal-500">the Right Way.</span>
          </motion.h1>

          <motion.p
            className="text-jal-600 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            Transparent pricing. Verified vendors. Reliable delivery.
            <br />Order 20L water cans straight to your doorstep.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button onClick={scrollToOrder} className="btn-primary text-base px-8 py-4">
              💧 Order Now
            </button>
            <Link to="/auth" className="btn-outline text-base px-8 py-4">
              Become a Vendor
            </Link>
          </motion.div>
        </div>

        {/* Hero illustration (inline SVG) */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <div className="relative w-64 sm:w-80">
            {/* Water can illustration */}
            <svg viewBox="0 0 200 260" className="w-full water-drop drop-shadow-xl" fill="none">
              {/* Can body */}
              <rect x="40" y="60" width="120" height="170" rx="20" fill="#dbeffe" stroke="#93d1fb" strokeWidth="2" />
              {/* Handle */}
              <path d="M70 60 Q70 30 100 30 Q130 30 130 60" stroke="#60b7f6" strokeWidth="6" fill="none" strokeLinecap="round" />
              {/* Label */}
              <rect x="55" y="100" width="90" height="80" rx="12" fill="white" opacity="0.8" />
              {/* Water level */}
              <rect x="40" y="160" width="120" height="70" rx="0 0 20 20" fill="#93d1fb" opacity="0.5" />
              {/* Cap */}
              <rect x="75" y="50" width="50" height="20" rx="8" fill="#3b97f0" />
              {/* JalSetu text on can */}
              <text x="100" y="148" textAnchor="middle" fill="#1e62d1" fontSize="13" fontFamily="Sora" fontWeight="bold">JalSetu</text>
              <text x="100" y="165" textAnchor="middle" fill="#60b7f6" fontSize="9" fontFamily="DM Sans">20 Litres</text>
              {/* Water drop icon on label */}
              <path d="M100 110 C100 110 90 122 90 128 A10 10 0 0 0 110 128 C110 122 100 110 100 110Z" fill="#3b97f0" opacity="0.6" />
            </svg>

            {/* Floating price tag */}
            <motion.div
              className="absolute -right-6 top-8 bg-white rounded-2xl shadow-card px-3 py-2 text-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-xs text-jal-400 font-body">From</p>
              <p className="font-display font-bold text-jal-700 text-lg">₹35</p>
            </motion.div>

            {/* Online vendor badge */}
            <motion.div
              className="absolute -left-8 bottom-12 bg-white rounded-2xl shadow-card px-3 py-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow" />
                <p className="text-xs font-semibold text-jal-700">12 vendors nearby</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── ORDER FORM (inline, quick) ────────────────────────────────────── */}
      <section ref={orderRef} className="py-16 px-4 bg-white" id="order">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-bold text-3xl text-jal-800 mb-3">
              Order Water Now
            </h2>
            <p className="text-jal-500">Fill in your details and we'll find a vendor near you.</p>
          </motion.div>

          {/* Redirect to full order page */}
          <motion.div
            className="card shadow-soft text-center py-12"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="text-6xl mb-4">💧</div>
            <h3 className="font-display font-semibold text-2xl text-jal-800 mb-2">
              Ready to order?
            </h3>
            <p className="text-jal-500 mb-6">
              Place your order in under 2 minutes. No account needed.
            </p>
            <Link to="/order" className="btn-primary text-base px-10 py-4 inline-block">
              Place Your Order →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-jal-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-jal-800 mb-3">Why JalSetu?</h2>
            <p className="text-jal-500 max-w-xl mx-auto">
              We're not just another delivery app. We're built for India's water needs.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <FeatureCard delay={0}    icon="🔍" title="Transparent Pricing"   desc="Know exactly what you pay — base price + floor charges, no hidden fees." />
            <FeatureCard delay={0.1}  icon="✅" title="Verified Vendors"       desc="Every vendor is manually verified before going live on the platform." />
            <FeatureCard delay={0.2}  icon="⚡" title="Fast Matching"          desc="Our system finds the nearest available vendor within seconds." />
            <FeatureCard delay={0.3}  icon="🗺️" title="Live Tracking"          desc="Know exactly where your delivery is at every step." />
            <FeatureCard delay={0.4}  icon="📱" title="WhatsApp Support"       desc="Reach us anytime on WhatsApp — quick responses guaranteed." />
            <FeatureCard delay={0.5}  icon="⏰" title="Time Slot Selection"    desc="Choose morning or evening delivery, whatever works for you." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display font-bold text-3xl text-jal-800 mb-8">
              How it works
            </h2>
            <div className="space-y-6">
              <Step num="1" title="Enter your location" desc="Auto-detect or type your address and floor number." />
              <Step num="2" title="Choose quantity & slot" desc="20L or 40L, morning or evening delivery." />
              <Step num="3" title="See live pricing"      desc="Transparent breakdown — base price + floor charges." />
              <Step num="4" title="Vendor accepts"        desc="Nearest verified vendor gets the request and accepts." />
              <Step num="5" title="Water delivered!"      desc="Track your order live and get delivery confirmation." />
            </div>
          </div>

          {/* Pricing calculator preview */}
          <motion.div
            className="card shadow-soft"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-display font-semibold text-jal-800 text-lg mb-4">Sample Pricing</h3>
            <div className="space-y-3">
              {[
                ['20L Can', '₹35'],
                ['Floor charge (5th floor)', '₹20'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-jal-50">
                  <span className="text-jal-600 text-sm">{label}</span>
                  <span className="font-semibold text-jal-800">{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="font-display font-bold text-jal-800">Total</span>
                <span className="font-display font-bold text-xl text-jal-600">₹55</span>
              </div>
            </div>
            <p className="text-xs text-jal-400 mt-4">
              * Actual price set by your chosen vendor. Floor charges vary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-jal-600 to-jal-800 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Ready for pure water at your door?
          </h2>
          <p className="text-jal-200 mb-8 text-lg">Join thousands of happy households across India.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/order" className="bg-white text-jal-700 hover:bg-jal-50 font-display font-bold px-8 py-4 rounded-2xl transition-colors shadow-glow">
              Order Now
            </Link>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-display font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
