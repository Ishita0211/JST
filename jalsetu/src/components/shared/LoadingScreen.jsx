// src/components/shared/LoadingScreen.jsx
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jal-50 to-white flex flex-col items-center justify-center gap-6">
      {/* Animated water drops */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute w-16 h-16 rounded-full border-4 border-jal-400"
            animate={{ scale: [1, 2], opacity: [0.7, 0] }}
            transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="w-12 h-12 bg-gradient-to-br from-jal-400 to-jal-600 rounded-full flex items-center justify-center shadow-glow">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M12 2 C12 2 4 12 4 17 A8 8 0 0 0 20 17 C20 12 12 2 12 2Z" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="font-display font-bold text-2xl text-jal-700">JalSetu</p>
        <p className="text-jal-400 text-sm mt-1">{message}</p>
      </div>
    </div>
  );
}
