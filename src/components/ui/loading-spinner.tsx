
'use client';

import { Loader2, Wifi, SignalHigh, Server, Zap } from 'lucide-react';

const LoadingSpinner = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-transparent text-foreground p-4">
      <div className="relative flex justify-center items-center mb-6">
        {/* Central spinning loader */}
        <Loader2 className="h-16 w-16 text-primary animate-spin" />

        {/* Surrounding "telecom" icons with subtle animations */}
        <Wifi className="absolute h-8 w-8 text-primary opacity-75 animate-ping" style={{ animationDuration: '2.5s', top: '-25px', left: '-35px' }} />
        <SignalHigh className="absolute h-8 w-8 text-primary opacity-75 animate-pulse" style={{ animationDuration: '2s', bottom: '-25px', right: '-40px', animationDelay: '0.5s' }} />
        <Server className="absolute h-7 w-7 text-primary opacity-60" style={{ top: '30px', left: '-50px', animation: 'pulse-subtle 2.2s infinite ease-in-out 0.2s' }} />
        <Zap className="absolute h-7 w-7 text-primary opacity-60" style={{ bottom: '25px', right: '-55px', animation: 'pulse-subtle 2.7s infinite ease-in-out 0.7s' }} />

      </div>
      <p className="text-xl font-semibold text-primary">{message}</p>
       <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
