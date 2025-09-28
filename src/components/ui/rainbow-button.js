import React from 'react';
import { cn } from '../../lib/utils';

export function RainbowButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-white transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        
        // before styles
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",

        // light mode colors - 淡雅紫色调
        "bg-[linear-gradient(rgba(139,92,246,0.9),rgba(139,92,246,0.9)),linear-gradient(rgba(139,92,246,0.9)_50%,rgba(139,92,246,0.6)_80%,rgba(139,92,246,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // dark mode colors - 保持优雅的白色调
        "dark:bg-[linear-gradient(rgba(248,250,252,0.95),rgba(248,250,252,0.95)),linear-gradient(rgba(248,250,252,0.95)_50%,rgba(248,250,252,0.7)_80%,rgba(248,250,252,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}