// src/pages/AdminPanel.jsx
// Admin panel: view/approve/reject vendors, view all orders, remove bad actors

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/shared/Navbar';
import StatusBadge from '../components/shared/StatusBadge';
import {
  getAllVendors,
  setVendorVerification,
  deleteVendor,
  listenAllOrders,
} from '../firebase/helpers';

// ── Small helpers ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color = 'text-jal-700' }) => (
  <div className="card text-center">
    <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>
    <p className="text-jal-500 text-sm mt-1">{label}</p>
  </div>
);

// ── Vendor row ────────────────────────────────────────────────────────────────
const VendorRow = ({ vendor, onApprove, onReject, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0 }}
    className="card flex flex-col sm:flex-row sm:items-center gap-4"
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-display font-semibold text-jal-800">{vendor.name}</p>
        {vendor.is_verified ? (
          <span className="badge badge-delivered">✅ Verified</span>
        ) : (
          <span className="badge badge-searching">⏳ Pending</span>
        )}
        {vendor.is_online && <span className="badge badge-accepted">🟢 Online</span>}
      </div>
      <p className="text-jal-500 text-sm truncate">{vendor.email}</p>
      <p className="text-jal-400 text-xs mt-0.5">
        📞 {vendor.phone} · 📍 {vendor.city || 'Unknown'} ·
        ₹{vendor.base_price}/can · ₹{vendor.floor_charge}/floor
      </p>
    </div>

    <div className="flex gap-2 shrink-0">
      {!vendor.is_verified && (
        <button
          onClick={() => onApprove(vendor.id)}
          className="btn-primary text-xs py-2 px-3"
        >
          ✅ Approve
        </button>
      )}
      {vendor.is_verified && (
        <button
          onClick={() => onReject(vendor.id)}
          className="border border-amber-300 text-amber-600 hover:bg-amber-50 text-xs font-semibold py-2 px-3 rounded-xl transition-colors"
        >
          ⏸ Suspend
        </button>
      )}
      <button
        onClick={() => onDelete(vendor.id, vendor.name)}
        className="border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold py-2 px-3 rounded-xl transition-colors"
      >
        🗑️
      </button>
    </div>
  </motion.div>
);

// ── Order row ─────────────────────────────────────────────────────────────────
const OrderRow = ({ order }) => {
  const time = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
    : '—';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-jal-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-jal-800 text-sm truncate">
          #{order.id.slice(0, 8).toUpperCase()} · {order.customerName}
        </p>
        <p className="text-jal-400 text-xs truncate">{order.address}</p>
        <p className="text-jal-400 text-xs">{time} · {order.quantity} · ₹{order.totalPrice}</p>
      </div>
      <StatusBadge status={order.status} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [vendors,    setVendors]    = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [activeTab,  setActiveTab]  = useState('vendors');
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all'); // all | pending | verified

  // Load vendors
  useEffect(() => {
    getAllVendors().then(v => { setVendors(v); setLoading(false); });
  }, []);

  // Real-time orders
  useEffect(() => {
    const unsub = listenAllOrders(setOrders);
    return unsub;
  }, []);

  const handleApprove = async (uid) => {
    try {
      await setVendorVerification(uid, true);
      setVendors(vs => vs.map(v => v.id === uid ? { ...v, is_verified: true } : v));
      toast.success('Vendor approved!');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (uid) => {
    try {
      await setVendorVerification(uid, false);
      setVendors(vs => vs.map(v => v.id === uid ? { ...v, is_verified: false } : v));
      toast('Vendor suspended', { icon: '⏸' });
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (uid, name) => {
    if (!confirm(`Remove vendor "${name}"? This cannot be undone.`)) return;
    try {
      await deleteVendor(uid);
      setVendors(vs => vs.filter(v => v.id !== uid));
      toast.success('Vendor removed');
    } catch { toast.error('Failed'); }
  };

  // Derived stats
  const pending    = vendors.filter(v => !v.is_verified).length;
  const verified   = vendors.filter(v =>  v.is_verified).length;
  const online     = vendors.filter(v => v.is_online).length;
  const delivered  = orders.filter(o => o.status === 'delivered').length;
  const active     = orders.filter(o => ['accepted','on_the_way'].includes(o.status)).length;

  const filteredVendors = vendors.filter(v =>
    filter === 'all'     ? true :
    filter === 'pending' ? !v.is_verified :
    filter === 'verified' ? v.is_verified : true
  );

  const filteredOrders = orders.slice(0, 50); // show latest 50

  return (
    <div className="min-h-screen flex flex-col bg-jal-50">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="font-display font-bold text-2xl text-jal-900">Admin Panel 🛡️</h1>
            <p className="text-jal-400 text-sm">Manage vendors, orders, and platform health</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="Total Vendors"  value={vendors.length} />
            <StatCard label="Pending"        value={pending}   color="text-amber-600" />
            <StatCard label="Verified"       value={verified}  color="text-green-600" />
            <StatCard label="Online Now"     value={online}    color="text-blue-600" />
            <StatCard label="Delivered"      value={delivered} color="text-jal-600" />
          </div>

          {/* Tab bar */}
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-jal-100">
            {[
              { id: 'vendors', label: `Vendors (${vendors.length})` },
              { id: 'orders',  label: `Orders (${orders.length})`   },
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
            {/* ── VENDORS ── */}
            {activeTab === 'vendors' && (
              <motion.div
                key="vendors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Filter bar */}
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'verified'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                        filter === f
                          ? 'bg-jal-500 text-white'
                          : 'bg-white text-jal-500 hover:bg-jal-50 border border-jal-100'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="spinner" />
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="card text-center py-12 text-jal-400">
                    <div className="text-4xl mb-3">🔍</div>
                    <p>No vendors found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredVendors.map(v => (
                        <VendorRow
                          key={v.id}
                          vendor={v}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ORDERS ── */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-jal-800">
                      All Orders (latest 50)
                    </h2>
                    <div className="flex gap-2 text-sm">
                      <span className="badge badge-accepted">{active} active</span>
                      <span className="badge badge-delivered">{delivered} delivered</span>
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <p className="text-jal-400 text-center py-8">No orders yet</p>
                  ) : (
                    <div>
                      {filteredOrders.map(o => <OrderRow key={o.id} order={o} />)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
