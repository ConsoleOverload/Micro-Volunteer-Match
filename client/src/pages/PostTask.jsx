import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import {
  PlusCircle,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  BookOpen,
  Box,
  Palette,
  Languages,
  HelpCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Tutoring', icon: BookOpen, desc: 'Quick subject check or study tips' },
  { name: 'Donation Sorting', icon: Box, desc: 'Sort supplies, cans, or clothes' },
  { name: 'Design', icon: Palette, desc: 'Poster layout, graphics, formatting' },
  { name: 'Translation', icon: Languages, desc: 'Short paragraph translation' },
  { name: 'Directions', icon: MapPin, desc: 'Campus building or lab escort' },
  { name: 'Other', icon: HelpCircle, desc: 'General 15-minute campus favor' }
];

const CAMPUS_LOCATIONS = [
  'Anurag University - A-Block (Engineering)',
  'Anurag University - B-Block (Pharmacy & Sciences)',
  'Anurag University - C-Block (Management & Humanities)',
  'Anurag University - Central Library',
  'Anurag University - Student Activity Center',
  'Anurag University - Sports Complex & Grounds',
  'Anurag University - Campus Cafeteria'
];

export const PostTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tutoring');
  const [isUrgent, setIsUrgent] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [campusLocation, setCampusLocation] = useState(
    user?.campusLocation || 'Anurag University - Central Library'
  );

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAiSummarize = async () => {
    if (!description.trim()) {
      alert('Please enter a description first to summarize.');
      return;
    }
    try {
      setAiLoading(true);
      const res = await axios.post('/api/ai/summarize', {
        title,
        description
      });
      if (res.data.summary) {
        setTitle(res.data.summary);
      }
    } catch (err) {
      console.warn('AI summary failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await axios.post('/api/tasks', {
        title,
        description,
        category,
        isUrgent,
        estimatedMinutes: Number(estimatedMinutes),
        campusLocation
      });

      navigate(`/task/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating task request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">
              Post 15-Minute Help Task
            </h2>
            <p className="text-xs text-slate-500">
              Low-friction quick requests matched with nearby student volunteers
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Urgent SOS Toggle Banner */}
          <div
            onClick={() => setIsUrgent(!isUrgent)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
              isUrgent
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isUrgent ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  SOS Urgent Request
                  {isUrgent && <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">ACTIVE (+20 Karma)</span>}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pins task to the top of campus feed with visual SOS highlight for immediate response
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={() => {}}
              className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const selected = category === cat.name;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <IconComp className={`w-4 h-4 ${selected ? 'text-emerald-600' : 'text-slate-500'}`} />
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="text-xs font-bold">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Request */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Detailed Description</label>
              <button
                type="button"
                onClick={handleAiSummarize}
                disabled={aiLoading}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                {aiLoading ? 'AI Summarizing...' : 'AI Title Preview'}
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Describe what you need assistance with in detail (e.g. Stuck on Calculus 2 integration by parts problem #4)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Title / Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Task Title (Short & Punchy)
            </label>
            <input
              type="text"
              required
              placeholder="Need quick 15-min Calculus II integration check"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Location & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Location Zone</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Time (Minutes)</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={5}>5 Minutes (Micro Quick)</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes (Standard)</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes Max</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Posting Request...' : 'Publish Micro Task to Campus Feed'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
