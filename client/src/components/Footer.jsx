import React from 'react';
import { Heart, Shield, Sparkles, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-slate-900 text-slate-900" />
              </div>
              <span className="text-base font-extrabold text-white">
                Micro-Volunteer Match
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering college campus communities through micro 15-minute acts of mutual assistance. Tutoring, donation sorting, translation, poster design, and fast directions.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Trust & Gamification Engine
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Karma Points (+10 base, +20 urgent, +5 fast response)
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                Trust Badges (Verified, Fast Responder, Campus Regular)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Campus Zone Walk Time Estimates (~5m, ~10m, ~15m+)
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Hackathon Ready Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built with MongoDB, Express, React (Vite), Node.js, Tailwind CSS, and optional Google Gemini AI candidate matching.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Micro-Volunteer Match. College Community Platform.</span>
          <span className="text-emerald-400 font-semibold">15 Minutes Can Change Someone's Day 🌱</span>
        </div>
      </div>
    </footer>
  );
};
