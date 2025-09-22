import React from 'react';
import { cn } from '../../lib/utils';

export function RainbowCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl border-0 shadow-sm transition-all duration-200 hover:shadow-md",
        "[background:linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.05*1rem)_solid_transparent]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function RainbowInput({ children, className, ...props }) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 rounded-lg border-0 bg-white text-gray-900 placeholder-gray-500",
        "[background:linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.05*1rem)_solid_transparent]",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </input>
  );
}

export function RainbowTextarea({ children, className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full px-3 py-2 rounded-lg border-0 bg-white text-gray-900 placeholder-gray-500 resize-none",
        "[background:linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.05*1rem)_solid_transparent]",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </textarea>
  );
}

export function RainbowSelect({ children, className, ...props }) {
  return (
    <select
      className={cn(
        "w-full px-3 py-2 rounded-lg border-0 bg-white text-gray-900",
        "[background:linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.05*1rem)_solid_transparent]",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}