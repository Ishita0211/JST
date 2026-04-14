// src/pages/OrderPage.jsx
// Full order placement page with location, quantity, floor, time slot, and pricing

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { createOrder, getNearbyVendors } from '../firebase/helpers';
import { useAuth } from '../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_PRICES   = { '20L': 35, '40L': 65 };
const FLOOR_CHARGE  = 5; // ₹ per floor above ground (vendors may override)
const TIME_SLOTS    = [
  { id: 'morning', label: 'Morning', time: '7 AM – 12 PM', icon: '🌅' },
  { id: 'evening', label: 'Evening', time: '4 PM – 8 PM',  icon: '🌆' },
];

// ── Small UI helpers ──────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
  </div>
);

const PricingRow = ({ label, value, bold }) => (
  <div className={`flex justify-between items-center py-2 ${bold ? '' : 'border-b border-jal-50'}`}>
    <span className={`text-sm ${bold ? 'font-display font-bold text-jal-800 text-base' : 'text-jal-500'}`}>{label}</span>
    <span className={`${bold ? 'font-display font-bold text-xl text-jal-600' : 'font-semibold text-jal-800'}`}>{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function OrderPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Form state
  const [form, setForm] = useState({
    address:      '',
    lat:          null,
    lng:          null,
    quantity:     '20L',
    floor:        0,
    timeSlot:     'morning',
    customerName: profile?.name  || '',
    customerPhone: profile?.phone || '',
  });

  const [locLoading,    setLocLoading]    = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [vendorPrice,   setVendorPrice]   = useState(null); // cheapest nearby vendor pricing

  // ── Pricing calculation ────────────────────────────────────────────────────
  const basePrice   = vendorPrice?.base_price   || BASE_PRICES[form.quantity];
  const floorCharge = vendorPrice?.floor_charge  || FLOOR_CHARGE;
  const floorTotal  = form.floor > 0 ? form.floor * floorCharge : 0;
  const qty         = parseInt(form.quantity) / 20; // 1 for 20L, 2 for 40L
  const totalPrice  = (basePrice * qty) + floorTotal;

  // ── Auto-detect location ───────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setForm(f => ({ ...f, lat, lng }));

        // Reverse geocode using Google Maps Geocoding API
        try {
          const res  = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            setForm(f => ({ ...f, address: data.results[0].formatted_address }));
          }
        } catch {
          setForm(f => ({ ...f, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
        }

        // Fetch nearby vendors
        const vendors = await getNearbyVendors(lat, lng, 5);
        setNearbyVendors(vendors);
        if (vendors.length > 0) {
          // Pick vendor with lowest base price for pricing preview
          const cheapest = vendors.reduce((a, b) =>
            (a.base_price || 99) < (b.base_price || 99) ? a : b
          );
          setVendorPrice(cheapest);
          toast.success(`${vendors.length} vendor(s) found near you!`);
        } else {
          toast('No vendors online nearby right now. Your order will be queued.', { icon: 'ℹ️' });
        }
        setLocLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error('Could not detect location. Please enter manually.');
        setLocLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  // ── Submit order ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.address.trim()) { toast.error('Please enter or detect your location'); return; }
    if (!form.customerName.trim())  { toast.error('Please enter your name');        return; }
    if (!form.customerPhone.trim()) { toast.error('Please enter your phone number'); return; }

    setSubmitting(true);
    try {
      const orderId = await createOrder({
        customerId:    user?.uid     || 'guest',
        customerName:  form.customerName,
        customerPhone: form.customerPhone,
        address:       form.address,
        location:      form.lat ? { lat: form.lat, lng: form.lng } : null,
        quantity:      form.quantity,
        floor:         Number(form.floor),
        timeSlot:      form.timeSlot,
        priceBreakdown: {
          basePrice,
          floorCharge,
          floorTotal,
          totalPrice,
          qty,
        },
        totalPrice,
        nearbyVendorCount: nearbyVendors.length,
      });

      toast.success('Order placed! Searching for vendors…');
      navigate(`/order/status/${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen flex flex-col bg-jal-50">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-jal-900 mb-2">
              Place Your Order 💧
            </h1>
            <p className="text-jal-500">Fill in your details below. Takes less than 2 minutes.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Personal Info ── */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h2 className="font-display font-semibold text-jal-800 text-lg mb-5">
                👤 Your Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Your Name">
                  <input
                    className="input"
                    placeholder="Rahul Sharma"
                    value={form.customerName}
                    onChange={e => set('customerName', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    className="input"
                    placeholder="+91 98765 43210"
                    type="tel"
                    value={form.customerPhone}
                    onChange={e => set('customerPhone', e.target.value)}
                    required
                  />
                </Field>
              </div>
            </motion.div>

            {/* ── Location ── */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <h2 className="font-display font-semibold text-jal-800 text-lg mb-5">
                📍 Delivery Location
              </h2>
              <Field label="Address">
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Enter your full address…"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locLoading}
                    className="btn-outline px-4 py-3 shrink-0 text-sm"
                    title="Auto-detect location"
                  >
                    {locLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-jal-400 border-t-transparent rounded-full animate-spin" />
                    ) : '📡'}
                  </button>
                </div>
              </Field>

              {nearbyVendors.length > 0 && (
                <p className="mt-2 text-green-600 text-sm font-semibold">
                  ✅ {nearbyVendors.length} vendor(s) available near you
                </p>
              )}

              <div className="mt-4">
                <Field label="Floor Number (0 = Ground)">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="50"
                    value={form.floor}
                    onChange={e => set('floor', e.target.value)}
                  />
                </Field>
                {form.floor > 0 && (
                  <p className="mt-1 text-jal-400 text-xs">
                    Floor charge: ₹{floorCharge} × {form.floor} = ₹{floorTotal}
                  </p>
                )}
              </div>
            </motion.div>

            {/* ── Quantity ── */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="font-display font-semibold text-jal-800 text-lg mb-5">
                🪣 Quantity
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {['20L', '40L'].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => set('quantity', q)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                      form.quantity === q
                        ? 'border-jal-500 bg-jal-50 shadow-soft'
                        : 'border-jal-100 hover:border-jal-300'
                    }`}
                  >
                    <p className="font-display font-bold text-2xl text-jal-700">{q}</p>
                    <p className="text-jal-500 text-sm">
                      {q === '20L' ? '1 Can' : '2 Cans'}
                    </p>
                    <p className="text-jal-600 font-semibold mt-1">
                      from ₹{BASE_PRICES[q]}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Time Slot ── */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <h2 className="font-display font-semibold text-jal-800 text-lg mb-5">
                ⏰ Delivery Slot
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => set('timeSlot', slot.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                      form.timeSlot === slot.id
                        ? 'border-jal-500 bg-jal-50 shadow-soft'
                        : 'border-jal-100 hover:border-jal-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{slot.icon}</div>
                    <p className="font-display font-bold text-jal-700">{slot.label}</p>
                    <p className="text-jal-400 text-xs mt-0.5">{slot.time}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Price Summary ── */}
            <motion.div
              className="card border-2 border-jal-200 shadow-soft"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="font-display font-semibold text-jal-800 text-lg mb-5">
                💰 Price Summary
              </h2>
              <div>
                <PricingRow label={`Base price (${form.quantity} × ${qty})`} value={`₹${basePrice * qty}`} />
                <PricingRow label={`Floor charge (floor ${form.floor})`}     value={`₹${floorTotal}`}     />
                <div className="mt-3 pt-3 border-t-2 border-jal-100">
                  <PricingRow label="Total" value={`₹${totalPrice}`} bold />
                </div>
              </div>
              <p className="text-xs text-jal-400 mt-3">
                * Price may vary slightly based on the accepting vendor's rates.
              </p>
            </motion.div>

            {/* ── Submit ── */}
            <motion.button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-lg py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order…
                </span>
              ) : (
                '💧 Place Order Now'
              )}
            </motion.button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
