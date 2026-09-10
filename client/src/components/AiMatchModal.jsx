import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, UserCheck, X, AlertCircle } from 'lucide-react';
import { TrustBadges } from './TrustBadges.jsx';

export const AiMatchModal = ({ isOpen, onClose, task }) => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      fetchMatches();
    }
  }, [isOpen, task]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post('/api/ai/match', {
        taskId: task._id,
        title: task.title,
        description: task.description,
        category: task.category
      });

      setMatches(res.data.matches || []);
      setIsAiGenerated(res.data.isAiGenerated);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate volunteer matches');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              AI Smart Volunteer Matcher
            </h3>
            <p className="text-xs text-slate-500">
              {isAiGenerated ? 'Powered by Gemini AI' : 'Smart Skill & Location Match'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl mb-4 text-xs text-emerald-800 font-medium">
          Matching candidate volunteers for task: <strong className="text-emerald-950">{task.title}</strong>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">
              Analyzing campus volunteer profiles & skills...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No matching volunteers found in the campus pool currently.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {matches.map((m, idx) => (
              <div
                key={m.userId || idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      {m.name ? m.name.charAt(0) : 'V'}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{m.name}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {m.matchScore}% Match
                  </span>
                </div>

                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{m.oneLineReason}"
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
