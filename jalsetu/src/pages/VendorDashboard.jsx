// src/pages/VendorDashboard.jsx
// Full vendor panel: online toggle, pricing config, incoming orders, active orders

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/shared/Navbar';
import StatusBadge from '../components/shared/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  toggleVendorOnline,
  updateVendorProfile,
  listenVendorOrders,
  listenVendorActiveOrders,
  updateOrderStatus,
  getDistanceKm,
} from '../firebase/helpers';

// ── Small helpers ─────────────────────────────────────────────────────────────
const Stat = ({ label, value, sub }) => (
  <div className="card text-center">
    <p className="font-display font-bold text-3xl text-jal-700">{value}</p>
    <p className="text-jal-800 font-semibold text-sm mt-1">{label}</p>
    {sub && <p className="text-jal-400 text-xs mt-0.5">{sub}</p>}
  </div>
);

// ── Order card shown in incoming requests ─────────────────────────────────────
const IncomingOrderCard = ({ order, vendorLocation, onAccept, onReject }) => {
  const dist = vendorLocation && order.location
    ? getDistanceKm(vendorLocation.lat, vendorLocation.lng, order.location.lat, order.location.lng).toFixed(1)
    : null;

  return (
    <motion.div
      className="card border-2 border-jal-200 shadow-soft"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-display font-bold text-jal-800 text-lg">{order.customerName}</p>
          <p className="text-jal-400 text-sm">📞 {order.customerPhone}</p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-2xl text-jal-600">₹{order.totalPrice}</p>
          {dist && <p className="text-jal-400 text-xs">{dist} km away</p>}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          ['📍 Address',  order.address || '—'],
          ['🏢 Floor',    order.floor === 0 ? 'Ground' : `Floor ${order.floor}`],
          ['🪣 Quantity', order.quantity],
          ['⏰ Slot',     order.timeSlot === 'morning' ? '🌅 Morning' : '🌆 Evening'],
        ].map(([k, v]) => (
          <div key={k} className="bg-jal-50 rounded-xl p-2">
            <p className="text-jal-400 text-xs">{k}</p>
            <p className="text-jal-800 text-sm font-semibold truncate">{v}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onAccept(order.id)}
          className="flex-1 btn-primary py-2.5 text-sm"
        >
          ✅ Accept
        </button>
        <button
          onClick={() => onReject(order.id)}
          className="flex-1 border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-2xl text-sm transition-colors"
        >
          ❌ Reject
        </button>
      </div>
    </motion.div>
  );
};

// ── Active order card ─────────────────────────────────────────────────────────
const ActiveOrderCard = ({ order, onMarkOnWay, onDeliver }) => (
  <motion.div
    className="card border-2 border-green-200 bg-green-50/40"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    layout
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-display font-bold text-jal-800">{order.customerName}</p>
        <p className="text-jal-400 text-sm">📞 {order.customerPhone}</p>
      </div>
      <StatusBadge status={order.status} />
    </div>

    <p className="text-jal-600 text-sm mb-1">📍 {order.address}</p>
    <p className="text-jal-500 text-sm mb-4">
      🪣 {order.quantity} · Floor {order.floor} · ₹{order.totalPrice}
    </p>

    <div className="flex gap-3">
      {order.status === 'accepted' && (
        <button
          onClick={() => onMarkOnWay(order.id)}
          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 rounded-2xl text-sm transition-colors"
        >
          🛺 Mark On the Way
        </button>
      )}
      {order.status === 'on_the_way' && (
        <button
          onClick={() => onDeliver(order.id)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-2xl text-sm transition-colors"
        >
          🎉 Mark as Delivered
        </button>
      )}
      <a
        href={`tel:${order.customerPhone}`}
        className="border-2 border-jal-200 text-jal-600 hover:bg-jal-50 font-semibold px-4 py-2.5 rounded-2xl text-sm transition-colors"
      >
        📞
      </a>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const { user, vendorData, refreshVendorData } = useAuth();

  const [isOnline,      setIsOnline]      = useState(vendorData?.is_online   || false);
  const [incomingOrders, setIncoming]     = useState([]);
  const [activeOrders,   setActive]       = useState([]);
  const [settings,       setSettings]     = useState({
    base_price:   vendorData?.base_price   || 35,
    floor_charge: vendorData?.floor_charge || 5,
    time_slots:   vendorData?.time_slots   || ['morning', 'evening'],
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab,      setActiveTab]    = useState('orders'); // 'orders' | 'settings'

  // Update local state when vendorData loads
  useEffect(() => {
    if (vendorData) {
      setIsOnline(vendorData.is_online);
      setSettings({
        base_price:   vendorData.base_price   || 35,
        floor_charge: vendorData.floor_charge || 5,
        time_slots:   vendorData.time_slots   || ['morning', 'evening'],
      });
    }
  }, [vendorData]);

  // Real-time listeners
  useEffect(() => {
    if (!user) return;
    const unsubIncoming = listenVendorOrders(user.uid, setIncoming);
    const unsubActive   = listenVendorActiveOrders(user.uid, setActive);
    return () => { unsubIncoming(); unsubActive(); };
  }, [user]);

  // ── Toggle online ────────────────────────────────────────────────────────
  const handleToggleOnline = async () => {
    if (!vendorData?.is_verified) {
      toast.error('Your account is pending admin approval');
      return;
    }
    const next = !isOnline;
    setIsOnline(next);
    try {
      await toggleVendorOnline(user.uid, next);
      toast.success(next ? '✅ You are now online!' : '⏸ You are now offline');
    } catch {
      setIsOnline(!next);
      toast.error('Failed to update status');
    }
  };

  // ── Accept order ────────────────────────────────────────────────────────
  const handleAccept = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { status: 'accepted', vendorId: user.uid });
      toast.success('Order accepted! Head to the customer.');
    } catch {
      toast.error('Failed to accept order. It may have been taken.');
    }
  };

  // ── Reject order ────────────────────────────────────────────────────────
  const handleReject = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { status: 'rejected' });
      toast('Order rejected', { icon: '❌' });
    } catch {
      toast.error('Failed to reject order');
    }
  };

  // ── Mark on the way ──────────────────────────────────────────────────────
  const handleOnWay = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { status: 'on_the_way' });
      toast.success('🛺 Status updated – on the way!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Mark delivered ───────────────────────────────────────────────────────
  const handleDeliver = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { status: 'delivered' });
      toast.success('🎉 Delivery marked complete!');
    } catch {
      toast.error('Failed to mark delivered');
    }
  };

  // ── Save settings ────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateVendorProfile(user.uid, settings);
      await refreshVendorData();
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSlot = (slot) => {
    setSettings(s => ({
      ...s,
      time_slots: s.time_slots.includes(slot)
        ? s.time_slots.filter(x => x !== slot)
        : [...s.time_slots, slot],
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-jal-50">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-jal-900">
                Vendor Dashboard
              </h1>
              <p className="text-jal-400 text-sm">
                {vendorData?.name || 'Welcome back'} · {vendorData?.city || ''}
              </p>
            </div>

            {/* Verification badge */}
            {vendorData?.is_verified ? (
              <span className="badge badge-delivered">✅ Verified</span>
            ) : (
              <span className="badge badge-searching">⏳ Pending Approval</span>
            )}
          </div>

          {/* ── Online toggle ── */}
          <motion.div
            className={`card flex items-center justify-between shadow-soft border-2 transition-colors ${
              isOnline ? 'border-green-300 bg-green-50/50' : 'border-jal-100'
            }`}
            layout
          >
            <div>
              <p className="font-display font-bold text-jal-800 text-lg">
                {isOnline ? '🟢 You are Online' : '⚫ You are Offline'}
              </p>
              <p className="text-jal-400 text-sm">
                {isOnline
                  ? 'Receiving new orders from nearby customers'
                  : 'Toggle on to start receiving orders'}
              </p>
            </div>

            {/* Toggle switch */}
            <button
              onClick={handleToggleOnline}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                isOnline ? 'bg-green-500' : 'bg-jal-200'
              }`}
              aria-label="Toggle online status"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow"
                animate={{ x: isOnline ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </motion.div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Today's Orders" value={activeOrders.length} sub="active" />
            <Stat label="Pending"        value={incomingOrders.length} sub="incoming" />
            <Stat label="Base Price"     value={`₹${settings.base_price}`} sub="per 20L" />
          </div>

          {/* ── Tab bar ── */}
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-jal-100">
            {[
              { id: 'orders',   label: `Orders (${incomingOrders.length + activeOrders.length})` },
              { id: 'settings', label: 'Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-jal-500 text-white shadow-sm'
                    : 'text-jal-500 hover:text-jal-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Incoming */}
                <section>
                  <h2 className="font-display font-semibold text-jal-800 text-lg mb-3">
                    🔔 Incoming Orders ({incomingOrders.length})
                  </h2>
                  {incomingOrders.length === 0 ? (
                    <div className="card text-center py-10 text-jal-400">
                      <div className="text-4xl mb-3">⏳</div>
                      <p className="font-medium">No incoming orders right now</p>
                      <p className="text-sm mt-1">Make sure you're online to receive orders</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {incomingOrders.map(order => (
                          <IncomingOrderCard
                            key={order.id}
                            order={order}
                            vendorLocation={vendorData?.location}
                            onAccept={handleAccept}
                            onReject={handleReject}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </section>

                {/* Active */}
                <section>
                  <h2 className="font-display font-semibold text-jal-800 text-lg mb-3">
                    🚚 Active Deliveries ({activeOrders.length})
                  </h2>
                  {activeOrders.length === 0 ? (
                    <div className="card text-center py-8 text-jal-400">
                      <p className="text-sm">No active deliveries</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeOrders.map(order => (
                        <ActiveOrderCard
                          key={order.id}
                          order={order}
                          onMarkOnWay={handleOnWay}
                          onDeliver={handleDeliver}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="card shadow-soft space-y-6">
                  <h2 className="font-display font-semibold text-jal-800 text-lg">
                    ⚙️ Vendor Settings
                  </h2>

                  {/* Pricing */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Base Price per 20L Can (₹)</label>
                      <input
                        type="number"
                        min="20"
                        max="200"
                        className="input"
                        value={settings.base_price}
                        onChange={e => setSettings(s => ({ ...s, base_price: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-jal-400 mt-1">Recommended: ₹30–₹50</p>
                    </div>
                    <div>
                      <label className="label">Floor Charge per Level (₹)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        className="input"
                        value={settings.floor_charge}
                        onChange={e => setSettings(s => ({ ...s, floor_charge: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-jal-400 mt-1">Charged per floor above ground</p>
                    </div>
                  </div>

                  {/* Time slots */}
                  <div>
                    <label className="label">Available Time Slots</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'morning', label: '🌅 Morning', time: '7 AM – 12 PM' },
                        { id: 'evening', label: '🌆 Evening', time: '4 PM – 8 PM'  },
                      ].map(slot => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleSlot(slot.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all ${
                            settings.time_slots.includes(slot.id)
                              ? 'border-jal-500 bg-jal-50'
                              : 'border-jal-100 hover:border-jal-200'
                          }`}
                        >
                          <p className="font-semibold text-jal-800 text-sm">{slot.label}</p>
                          <p className="text-jal-400 text-xs">{slot.time}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location update note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
                    📍 <strong>Location tip:</strong> Your location is automatically captured when you go online.
                    Ensure location permissions are enabled on your device.
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="btn-primary w-full py-3"
                  >
                    {savingSettings ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </span>
                    ) : 'Save Settings'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
