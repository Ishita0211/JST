// src/firebase/helpers.js
// All Firestore read/write helpers — keeps components clean

import {
  collection, doc, addDoc, updateDoc, getDocs, getDoc,
  query, where, onSnapshot, serverTimestamp, GeoPoint,
  orderBy, limit, deleteDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { db, auth } from './config';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerUser = async ({ email, password, name, phone, role }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  // Save extra profile info to Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    name,
    email,
    phone,
    role, // 'customer' | 'vendor' | 'admin'
    createdAt: serverTimestamp(),
  });

  return cred.user;
};

// Re-export setDoc (needed above and by other modules)
export { setDoc } from 'firebase/firestore';

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const createVendorProfile = async (uid, data) => {
  await setDoc(doc(db, 'vendors', uid), {
    uid,
    ...data,
    is_verified: false,  // Admin must approve
    is_online:   false,
    createdAt:   serverTimestamp(),
  });
};

export const updateVendorProfile = async (uid, data) => {
  await updateDoc(doc(db, 'vendors', uid), { ...data, updatedAt: serverTimestamp() });
};

export const getVendorProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'vendors', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Get all vendors (admin use)
export const getAllVendors = async () => {
  const snap = await getDocs(collection(db, 'vendors'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Toggle vendor online/offline status
export const toggleVendorOnline = async (uid, isOnline) => {
  await updateDoc(doc(db, 'vendors', uid), { is_online: isOnline, updatedAt: serverTimestamp() });
};

// Approve or reject vendor (admin)
export const setVendorVerification = async (uid, verified) => {
  await updateDoc(doc(db, 'vendors', uid), {
    is_verified: verified,
    updatedAt: serverTimestamp(),
  });
};

// Delete vendor (admin)
export const deleteVendor = async (uid) => {
  await deleteDoc(doc(db, 'vendors', uid));
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const createOrder = async (orderData) => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData,
    status:    'searching', // searching → accepted → on_the_way → delivered
    vendorId:  null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateOrderStatus = async (orderId, updates) => {
  await updateDoc(doc(db, 'orders', orderId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getOrderById = async (orderId) => {
  const snap = await getDoc(doc(db, 'orders', orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Real-time listener on a single order (for customer status screen)
export const listenOrder = (orderId, callback) =>
  onSnapshot(doc(db, 'orders', orderId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });

// Real-time listener for vendor's incoming orders
export const listenVendorOrders = (vendorUid, callback) =>
  onSnapshot(
    query(
      collection(db, 'orders'),
      where('status', '==', 'searching'),
      orderBy('createdAt', 'desc'),
    ),
    (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(orders);
    }
  );

// Real-time listener for vendor's accepted/active orders
export const listenVendorActiveOrders = (vendorUid, callback) =>
  onSnapshot(
    query(
      collection(db, 'orders'),
      where('vendorId', '==', vendorUid),
      where('status', 'in', ['accepted', 'on_the_way']),
      orderBy('createdAt', 'desc'),
    ),
    (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(orders);
    }
  );

// All orders for admin
export const listenAllOrders = (callback) =>
  onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100)),
    (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(orders);
    }
  );

// ─── Geo helpers ──────────────────────────────────────────────────────────────

// Haversine formula to get distance between two lat/lng points in km
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dl  = ((lng2 - lng1) * Math.PI) / 180;
  const a   =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Find online, verified vendors within radiusKm of a point
export const getNearbyVendors = async (lat, lng, radiusKm = 5) => {
  const snap = await getDocs(
    query(
      collection(db, 'vendors'),
      where('is_online',   '==', true),
      where('is_verified', '==', true),
    )
  );

  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(v => {
      if (!v.location?.lat || !v.location?.lng) return false;
      return getDistanceKm(lat, lng, v.location.lat, v.location.lng) <= radiusKm;
    });
};
