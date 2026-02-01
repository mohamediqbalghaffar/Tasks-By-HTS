import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Positioning & Layout
          'relative inline-flex items-center justify-center overflow-hidden rounded-full',
          'px-6 py-3', // Corresponds to padding: 12px 24px
          
          // Font & Text
          'text-base font-semibold text-white no-underline',

          // The Glass Effect Foundation
          'border border-white/20 bg-white/15 shadow-lg shadow-black/10',
          'backdrop-blur-sm saturate-150',
          
          // Inner Shadow for depth
          'style-glowing-border',

          // Transitions
          'transition-all duration-300 ease-in-out',

          // Hover State
          'hover:bg-white/25 hover:shadow-xl hover:shadow-black/15 hover:-translate-y-px',

          // Active State
          'active:translate-y-0 active:bg-white/10',

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

LiquidGlassButton.displayName = 'LiquidGlassButton';

export default LiquidGlassButton;
