import React from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';

const ALL_BADGES = [
  {
    id: 'first_step',
    name: '🌱 First Step',
    description: 'Completed your first micro-task.',
    req: '1 task',
  },
  {
    id: 'quick_helper',
    name: '⚡ Quick Helper',
    description: 'Completed 3 micro-tasks.',
    req: '3 tasks',
  },
  {
    id: 'community_builder',
    name: '💙 Community Builder',
    description: 'Contributed 60+ volunteer minutes.',
    req: '60 mins',
  },
  {
    id: 'consistent_helper',
    name: '🔥 Consistent Helper',
    description: 'Completed tasks across 5 different days.',
    req: '5 streak days',
  },
  {
    id: 'impact_maker',
    name: '🏆 Impact Maker',
    description: 'Contributed 300+ volunteer minutes.',
    req: '300 mins',
  },
];

export default function BadgesList({ userBadges = [] }) {
  const earnedSet = new Set((userBadges || []).map((b) => b.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Achievements & Badges
        </h3>
        <span className="text-xs text-brand-300 font-semibold bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
          {earnedSet.size} / {ALL_BADGES.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_BADGES.map((badge) => {
          const isUnlocked = earnedSet.has(badge.id);
          const userBadgeObj = (userBadges || []).find((b) => b.id === badge.id);

          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isUnlocked
                  ? 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${
                    isUnlocked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {isUnlocked ? badge.name.split(' ')[0] : <Lock className="w-4 h-4 text-slate-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-xs font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                      {badge.name}
                    </h4>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-500">{badge.req}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                    {badge.description}
                  </p>
                  {isUnlocked && userBadgeObj?.awardedAt && (
                    <span className="inline-block mt-1 text-[9px] text-emerald-400 font-medium">
                      Unlocked {new Date(userBadgeObj.awardedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
