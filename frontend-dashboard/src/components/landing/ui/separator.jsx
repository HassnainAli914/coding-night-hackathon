import React from 'react';

export default function Separator() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative flex items-center justify-center py-4">
        {/* Line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-neutral-800" />
        {/* Glowing center dot */}
        <div className="absolute h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      </div>
    </div>
  );
}
