import React from 'react';

export function TaskCardSkeleton() {
  return (
    <div className="app-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-20 h-5 bg-slate-200 rounded-lg" />
        <div className="w-24 h-6 bg-slate-200 rounded-full" />
      </div>
      <div className="w-3/4 h-6 bg-slate-200 rounded-md" />
      <div className="w-full h-12 bg-slate-100 rounded-md" />
      <div className="flex gap-2">
        <div className="w-16 h-5 bg-slate-200 rounded-md" />
        <div className="w-16 h-5 bg-slate-200 rounded-md" />
      </div>
      <div className="w-full h-10 bg-slate-200 rounded-xl" />
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500 tracking-wide">{text}</p>
    </div>
  );
}
