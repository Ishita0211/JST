// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/shared/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-8xl mb-6 water-drop">💧</div>
          <h1 className="font-display font-bold text-5xl text-jal-800 mb-3">404</h1>
          <p className="text-jal-500 text-lg mb-8">
            Oops! This page has run dry.
          </p>
          <Link to="/" className="btn-primary px-8 py-3">
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
