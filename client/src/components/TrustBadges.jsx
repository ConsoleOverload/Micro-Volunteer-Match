import React from 'react';
import { ShieldCheck, Zap, Award } from 'lucide-react';

export const TrustBadges = ({ badges = [], size = 'sm' }) => {
  if (!badges || badges.length === 0) return null;

  const badgeConfig = {
    'Verified': {
      label: 'Verified',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: ShieldCheck
    },
    'Fast Responder': {
      label: 'Fast Responder',
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Zap
    },
    'Campus Regular': {
      label: 'Campus Regular',
      bg: 'bg-teal-100 text-teal-800 border-teal-300',
      icon: Award
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {badges.map((badgeName) => {
        const config = badgeConfig[badgeName] || {
          label: badgeName,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: ShieldCheck
        };
        const IconComponent = config.icon;

        return (
          <span
            key={badgeName}
            className={`inline-flex items-center gap-1 font-semibold rounded-full border shadow-sm ${config.bg} ${
              isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
            }`}
            title={`Trust Badge: ${config.label}`}
          >
            <IconComponent className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
            {config.label}
          </span>
        );
      })}
    </div>
  );
};
