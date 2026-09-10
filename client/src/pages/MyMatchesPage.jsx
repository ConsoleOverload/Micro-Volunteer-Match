import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import MatchBadge from '../components/MatchBadge';
import { TaskCardSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, Target, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function MyMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minMatchThreshold, setMinMatchThreshold] = useState(50);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches');
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error('Fetch matches error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((m) => m.matchPercentage >= minMatchThreshold);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-brand-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              AI Recommendation Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Recommended Matches</h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Calculated using your registered skills ({user?.skills?.join(', ') || 'General'}), availability, category interests, and preferred micro-volunteering duration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMatches}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Matches</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Filter className="w-4 h-4 text-brand-400" />
          <span>Minimum Match Score:</span>
          <select
            value={minMatchThreshold}
            onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value={50}>50%+ (All matches)</option>
            <option value={75}>75%+ (Good matches)</option>
            <option value={90}>90%+ (Top matches 🎯)</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          Showing {filteredMatches.length} of {matches.length} matches
        </span>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <Target className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No matches found at this threshold</h3>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your filter threshold or add more skills to your profile to unlock more opportunities!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredMatches.map((task) => (
            <TaskCard key={task._id} task={task} onAcceptSuccess={fetchMatches} />
          ))}
        </div>
      )}
    </div>
  );
}
