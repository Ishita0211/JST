// src/context/AuthContext.jsx
// Global auth state — wraps the entire app so any component can access user info

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, getVendorProfile } from '../firebase/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null);  // Firebase auth user
  const [profile,     setProfile]     = useState(null);  // Firestore user doc
  const [vendorData,  setVendorData]  = useState(null);  // Firestore vendor doc
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    // Listen for auth state changes (login / logout / page refresh)
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);

        // If this user is a vendor, also load vendor profile
        if (prof?.role === 'vendor') {
          const vd = await getVendorProfile(firebaseUser.uid);
          setVendorData(vd);
        }
      } else {
        setUser(null);
        setProfile(null);
        setVendorData(null);
      }
      setLoading(false);
    });

    return unsub; // cleanup on unmount
  }, []);

  const refreshVendorData = async () => {
    if (user) {
      const vd = await getVendorProfile(user.uid);
      setVendorData(vd);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, vendorData, loading, refreshVendorData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
