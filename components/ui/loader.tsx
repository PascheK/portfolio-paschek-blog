"use client";

import { motion } from "framer-motion";

export function Loader({ size = 24 }: { size?: number }) {
  const s = size;
  const stroke = Math.max(2, Math.round(s * 0.1));
  return (
    <div className="w-full flex items-center justify-center py-8" role="status" aria-label="Loading">
      <motion.svg
        width={s}
        height={s}
        viewBox="0 0 50 50"
        className="text-blue-300 dark:text-blue-300"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 1.2 }}
      >
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray="100 60"
          strokeDashoffset="0"
          animate={{ strokeDashoffset: [0, -160] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />
      </motion.svg>
    </div>
  );
}
