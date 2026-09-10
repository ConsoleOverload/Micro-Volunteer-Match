import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { TaskCard } from '../components/TaskCard.jsx';
import {
  Search,
  Zap,
  Filter,
  Plus,
  MapPin,
  Sparkles,
  BookOpen,
  Box,
  Palette,
  Languages,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'All',
  'Tutoring',
  'Donation Sorting',
  'Design',
  'Translation',
  'Directions',
  'Other'
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

export const Feed = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(
    user?.campusLocation || 'Anurag University - Central Library'
  );

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory, userLocation]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      params.userLocation = userLocation;

      const res = await axios.get('/api/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching task feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const urgentTasks = tasks.filter((t) => t.isUrgent && t.status === 'open');
  const regularTasks = tasks.filter((t) => !t.isUrgent || t.status !== 'open');

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/80 text-emerald-100 rounded-full text-xs font-bold border border-emerald-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            Micro-Volunteering Campus Network
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Small 15-Minute Help Tasks. <br />
            <span className="text-teal-300">Big Campus Impact.</span>
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Need a quick proofread, donation box sorting, or directions? Match with trusted peers nearby on campus.
          </p>

          {/* Quick Stats Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-teal-300" /> Avg Task: ~15 mins
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-300" /> Urgent SOS Pinning
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-300" /> Dynamic Karma Score
            </span>
          </div>
        </div>
      </section>

      {/* Controls & Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search tasks, skills, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </form>

          {/* Location Walk Time Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Your Campus Zone:</span>
            <select
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Post Task Action */}
          <Link
            to="/post-task"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Post 15-Min Request
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Feed Content */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading campus help feed...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No open help tasks found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no tasks matching your selected filters. Be the first to post a 15-minute micro task!
          </p>
          <Link
            to="/post-task"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Post a Request
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Urgent SOS Pinned Tasks */}
          {urgentTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-rose-500 text-rose-500" />
                  Urgent SOS Requests Pinned Top
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {urgentTasks.map((t) => (
                  <TaskCard key={t._id} task={t} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Open & Completed Tasks */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
              Community Task Feed ({regularTasks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularTasks.map((t) => (
                <TaskCard key={t._id} task={t} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
