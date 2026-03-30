"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Particles } from "@/components/ui/Particles";

export default function SplashPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    // 等待淡出动画完成后再跳转 (缩短至一半时间)
    setTimeout(() => {
      router.push("/home");
    }, 300);
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Background decoration - subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-[#0a0a0a] dark:to-black -z-10" />
      <Particles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Code & Life
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-12 text-sm md:text-base tracking-wide uppercase">
          A personal space for thoughts and code
        </p>

        <motion.button
          onClick={handleEnter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium text-sm transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
        >
          {isExiting ? "Entering..." : "Enter"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
