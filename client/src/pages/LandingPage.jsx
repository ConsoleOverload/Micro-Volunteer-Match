import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Clock, Users, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 py-12">
      {/* HERO SECTION */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-8 pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Micro-Volunteering Platform</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Give 15 minutes. <br className="hidden sm:inline" />
          <span className="text-indigo-600">Make an impact.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          “Connect your skills with people who need a little help.”
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/post-task"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <span>Find Help</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/tasks"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Volunteer</span>
          </Link>
        </div>
      </section>

      {/* 3-STEP SECTION: Post -> Match -> Help */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How Micro-Volunteering Works</h2>
          <p className="text-slate-500 text-sm mt-1">Simple 3-step community impact</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="app-card p-6 text-center space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Post</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Share a simple bite-sized task you need help with (15-20 minutes).
            </p>
          </div>

          {/* Step 2 */}
          <div className="app-card p-6 text-center space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Match</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our smart algorithm pairs your task with skilled, available volunteers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="app-card p-6 text-center space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Help</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Volunteer completes the task and tracks impact minutes on their profile.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Impact Highlight */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-8 text-white text-center space-y-4 shadow-sm">
          <h3 className="text-xl font-bold">Ready to make a difference?</h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Join hundreds of students and community members sharing skills and getting quick help.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all"
            >
              <span>Create an Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
