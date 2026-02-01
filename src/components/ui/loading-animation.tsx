
'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingAnimationProps {
  text: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ text }) => {
  const { language } = useLanguage();
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const displayText = useTransform(rounded, latest => text.slice(0, latest));

  React.useEffect(() => {
    const controls = animate(count, text.length, {
      type: 'tween',
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
      repeatDelay: 0.5,
    });
    return controls.stop;
  }, [text]);

  const svgPaths: Record<string, string> = {
    en: 'M10 80 C 40 20, 70 20, 100 80 S 130 140, 160 80 S 190 20, 220 80 S 250 140, 280 80 S 310 20, 340 80 S 370 140, 400 80',
    ku: 'M10 80 C 40 20, 70 20, 100 80 S 130 140, 160 80 S 190 20, 220 80 S 250 140, 280 80',
    ar: 'M10 80 C 40 20, 70 20, 100 80 S 130 140, 160 80 S 190 20, 220 80 S 250 140, 280 80',
  };

  const path = svgPaths[language] || svgPaths['en'];
  const viewBox = language === 'en' ? '0 0 410 160' : '0 0 290 160';

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-transparent text-foreground p-4">
      <div className="w-full max-w-md">
        <motion.svg
          width="100%"
          viewBox={viewBox}
          initial="hidden"
          animate="visible"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--primary-gradient-start))', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-gradient-end))', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <motion.path
            d={path}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </motion.svg>
      </div>
       <motion.p className="text-2xl font-semibold text-gradient mt-4 tabular-nums">
        {displayText}
      </motion.p>
    </div>
  );
};

export default LoadingAnimation;
