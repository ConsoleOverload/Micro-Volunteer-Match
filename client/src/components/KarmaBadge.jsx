import React from 'react';
import { Sparkles } from 'lucide-react';

export const KarmaBadge = ({ score = 0, tier = null }) => {
  const getTierInfo = (s) => {
    if (tier) return tier;
    if (s >= 300) return { title: 'Community Champion', badge: '🏆' };
    if (s >= 150) return { title: 'Campus Regular', badge: '⭐' };
    if (s >= 50) return { title: 'Rising Helper', badge: '🌱' };
    return { title: 'New Neighbor', badge: '👋' };
  };

  const tierInfo = getTierInfo(score);

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-full shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
      <span>{score} Karma</span>
      <span className="opacity-40">|</span>
      <span>{tierInfo.badge} {tierInfo.title}</span>
    </div>
  );
};
