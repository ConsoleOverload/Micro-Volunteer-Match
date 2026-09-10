import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';

export default function ImpactChart({ totalMinutes = 180 }) {
  // Weekly simulation data
  const days = [
    { day: 'Mon', mins: 15 },
    { day: 'Tue', mins: 30 },
    { day: 'Wed', mins: 0 },
    { day: 'Thu', mins: 15 },
    { day: 'Fri', mins: 30 },
    { day: 'Sat', mins: 45 },
    { day: 'Sun', mins: 45 },
  ];

  const maxMins = 60;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            Weekly Contribution Activity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {totalMinutes} minutes contributed overall
          </p>
        </div>

        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          +75m this week
        </span>
      </div>

      {/* SVG Bar Chart */}
      <div className="pt-4 pb-2">
        <div className="flex items-end justify-between gap-2 h-36 border-b border-slate-800 px-2">
          {days.map((item, idx) => {
            const heightPercent = Math.max((item.mins / maxMins) * 100, 4);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.mins}m
                </span>

                <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-28 relative">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full transition-all duration-500 rounded-t-md ${
                      item.mins > 0
                        ? 'bg-gradient-to-t from-brand-600 to-emerald-400 group-hover:brightness-125'
                        : 'bg-slate-800/40'
                    }`}
                  />
                </div>

                <span className="text-xs text-slate-400 font-medium">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
