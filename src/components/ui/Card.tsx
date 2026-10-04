"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  padding = true,
  hover = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-surface border border-border rounded-xl ${padding ? "p-5" : ""} ${
        hover ? "hover:border-forest/30 hover:shadow-sm cursor-pointer transition-all duration-200" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}