import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { TaskCardSkeleton } from '../components/LoadingSkeleton';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Tutoring',
  'Technology',
  'Design',
  'Translation',
  'Community',
  'Environment',
  'Event Support',
  'Donations',
  'Other',
];

const DURATIONS = ['All', 5, 10, 15, 20, 25, 30, 60];

export default function TaskDiscoveryPage() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [duration, setDuration] = useState(searchParams.get('duration') || 'All');
  const [skill, setSkill] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        sort,
      };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (duration !== 'All') params.duration = duration;
      if (skill !== 'All') params.skill = skill;

      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks || []);
      setTotalPages(res.data.pages || 1);
      setTotalTasks(res.data.totalTasks || 0);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [category, duration, skill, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTasks();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Find Opportunities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Displaying tasks posted by real users ({totalTasks} open opportunities).
          </p>
        </div>

        <Link
          to="/post-task"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Task</span>
        </Link>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or skill (e.g. Python, Graphic Design)..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
        >
          Search
        </button>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              category === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Additional Simple Filters Toolbar */}
      <div className="app-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Duration:</span>
            <select
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Durations' : `${d} Minutes`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-semibold"
          >
            <option value="newest">Newest First</option>
            <option value="match">Highest Match %</option>
            <option value="shortest">Shortest Duration</option>
          </select>
        </div>
      </div>

      {/* Task Marketplace Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : tasks.length === 0 ? (
        <div className="app-card p-12 text-center text-slate-500 space-y-3">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tasks found matching your criteria</h3>
          <p className="text-xs">Try adjusting your category or search query.</p>
          <Link
            to="/post-task"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm"
          >
            + Post a Task
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onAcceptSuccess={fetchTasks} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 disabled:opacity-40 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 disabled:opacity-40 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
