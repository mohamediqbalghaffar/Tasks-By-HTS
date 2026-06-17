'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { cn } from '@/lib/utils';

export function MotionBackground() {
    const { theme } = useUI();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate normalized coordinates (-1 to 1)
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Determine effective theme
    const isDark = typeof window !== 'undefined' && (
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    if (!isClient) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
            {/* Primary Abstract Blur Elements */}
            <motion.div 
                className={cn(
                    "absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-30",
                    isDark ? "bg-violet-900/40" : "bg-violet-300/40"
                )}
                animate={{
                    x: mousePosition.x * -20,
                    y: mousePosition.y * -20,
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                    x: { type: "spring", stiffness: 50, damping: 20 },
                    y: { type: "spring", stiffness: 50, damping: 20 }
                }}
            />
            <motion.div 
                className={cn(
                    "absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-20",
                    isDark ? "bg-cyan-900/40" : "bg-cyan-300/40"
                )}
                animate={{
                    x: mousePosition.x * 30,
                    y: mousePosition.y * 30,
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    scale: { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 },
                    x: { type: "spring", stiffness: 40, damping: 20 },
                    y: { type: "spring", stiffness: 40, damping: 20 }
                }}
            />

            {/* Central Watermark Logo with Parallax */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{
                        x: mousePosition.x * -40,
                        y: mousePosition.y * -40,
                        rotate: mousePosition.x * 2,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 40,
                        damping: 30,
                    }}
                    className="relative w-[60vw] max-w-[800px] aspect-square flex items-center justify-center"
                >
                    <motion.img
                        src="/logo.png"
                        alt="HTS Logo Background"
                        className={cn(
                            "w-full h-full object-contain transition-all duration-1000",
                            isDark 
                                ? "opacity-[0.03] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] grayscale mix-blend-screen" 
                                : "opacity-[0.04] grayscale drop-shadow-xl mix-blend-multiply"
                        )}
                        animate={{
                            scale: [0.95, 1.05, 0.95],
                            opacity: isDark ? [0.03, 0.05, 0.03] : [0.04, 0.06, 0.04]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            </div>
            
            {/* Ambient subtle noise overlay for texture */}
            <div 
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
