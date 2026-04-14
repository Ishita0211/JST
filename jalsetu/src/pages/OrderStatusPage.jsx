// src/pages/OrderStatusPage.jsx
// Real-time order tracking page. Uses Firestore onSnapshot listener.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import StatusBadge from '../components/shared/StatusBadge';
import { listenOrder } from '../firebase/helpers';

// ── Timeline steps ─────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'searching',  label: 'Order Placed',      icon: '📋', desc: 'We\'re finding a vendor near you' },
  { key: 'accepted',   label: 'Vendor Accepted',   icon: '✅', desc: 'A vendor has accepted your order' },
  { key: 'on_the_way', label: 'On the Way',         icon: '🛺', desc: 'Your water is on its way!' },
  { key: 'delivered',  label: 'Delivered',           icon: '🎉', desc: 'Enjoy your fresh water!' },
];

const STATUS_ORDER = ['searching', 'accepted', 'on_the_way', 'delivered'];

const getStepIndex = (status) => STATUS_ORDER.indexOf(status);

// ── Animated status icon ───────────────────────────────────────────────────────
const StatusIcon = ({ status }) => {
  const icons = {
    searching:  '🔍',
    accepted:   '✅',
    on_the_way: '🛺',
    delivered:  '🎉',
    rejected:   '❌',
  };
  return (
    <motion.div
      key={status}
      className="text-6xl sm:text-8xl"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {icons[status] || '📦'}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function OrderStatusPage() {
  const { id }    = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;

    // Real-time listener — updates automatically when vendor changes status
    const unsub = listenOrder(id, (data) => {
      setOrder(data);
      setLoading(false);
    });

    // Handle case where order doesn't exist
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Order not found');
        setLoading(false);
      }
    }, 8000);

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="spinner mx-auto" />
            <p className="text-jal-500 font-body">Loading your order…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="font-display font-bold text-2xl text-jal-800 mb-2">Order Not Found</h2>
            <p className="text-jal-500 mb-6">We couldn't find this order. Check your link.</p>
            <Link to="/order" className="btn-primary">Place New Order</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isRejected  = order.status === 'rejected';

  return (
    <div className="min-h-screen flex flex-col bg-jal-50">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-xl mx-auto space-y-6">

          {/* ── Main Status Card ── */}
          <motion.div
            className="card text-center shadow-soft"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatusIcon status={order.status} />

            <AnimatePresence mode="wait">
              <motion.div
                key={order.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <StatusBadge status={order.status} />
                <p className="text-jal-500 text-sm mt-2">
                  {STEPS.find(s => s.key === order.status)?.desc ||
                    (isRejected ? 'No vendor accepted in time. Please try again.' : '')}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Searching animation */}
            {order.status === 'searching' && (
              <div className="mt-6 flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-jal-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Progress Timeline ── */}
          {!isRejected && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h3 className="font-display font-semibold text-jal-800 mb-6">Order Progress</h3>
              <div className="space-y-0">
                {STEPS.map((step, idx) => {
                  const isDone    = idx <  currentStep;
                  const isActive  = idx === currentStep;
                  const isFuture  = idx >  currentStep;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      {/* Line + Dot */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 shrink-0
                            ${isDone   ? 'bg-jal-500 border-jal-500 text-white' :
                              isActive ? 'bg-jal-100 border-jal-500' :
                                         'bg-white border-jal-100'}`}
                          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {isDone ? '✓' : step.icon}
                        </motion.div>
                        {idx < STEPS.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-jal-400' : 'bg-jal-100'}`} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="pb-8">
                        <p className={`font-semibold text-sm ${isFuture ? 'text-jal-300' : 'text-jal-800'}`}>
                          {step.label}
                        </p>
                        {(isDone || isActive) && (
                          <p className="text-jal-400 text-xs mt-0.5">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Order Summary ── */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="font-display font-semibold text-jal-800 mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Order ID',     `#${id.slice(0, 8).toUpperCase()}`],
                ['Name',         order.customerName],
                ['Phone',        order.customerPhone],
                ['Address',      order.address],
                ['Floor',        order.floor === 0 ? 'Ground Floor' : `Floor ${order.floor}`],
                ['Quantity',     order.quantity],
                ['Time Slot',    order.timeSlot === 'morning' ? '🌅 Morning (7–12 PM)' : '🌆 Evening (4–8 PM)'],
                ['Total Price',  `₹${order.totalPrice}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-jal-50 last:border-0">
                  <span className="text-jal-400">{label}</span>
                  <span className="font-medium text-jal-800 max-w-[60%] text-right">{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Support ── */}
          <motion.div
            className="card bg-jal-50 border-jal-100 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-jal-600 text-sm mb-3">Need help with your order?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                💬 WhatsApp
              </a>
              <a
                href="tel:+919999999999"
                className="flex items-center justify-center gap-2 bg-jal-500 hover:bg-jal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                📞 Call Support
              </a>
            </div>
          </motion.div>

          {/* New order CTA */}
          {(order.status === 'delivered' || isRejected) && (
            <Link to="/order" className="btn-primary w-full text-center block py-4">
              {isRejected ? 'Try Again' : '💧 Order Again'}
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
