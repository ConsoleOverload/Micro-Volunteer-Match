import React from 'react';
import { Target, Sparkles } from 'lucide-react';

export default function MatchBadge({ score, size = 'normal' }) {
  const isHighMatch = score >= 90;
  const isMidMatch = score >= 75;

  const sizeClasses =
    size === 'large'
      ? 'px-3.5 py-1.5 text-sm font-extrabold shadow-sm'
      : 'px-2.5 py-1 text-xs font-bold shadow-sm';

  if (isHighMatch) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 ${sizeClasses}`}
      >
        <Target className="w-3.5 h-3.5 text-emerald-600" />
        <span>🎯 {score}% Match</span>
      </span>
    );
  }

  if (isMidMatch) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-300 text-indigo-700 ${sizeClasses}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>{score}% Match</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 ${sizeClasses}`}
    >
      <span>{score}% Match</span>
    </span>
  );
}
