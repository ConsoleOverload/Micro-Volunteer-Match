import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { TaskCardSkeleton } from '../components/LoadingSkeleton';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  PlusCircle,
  Search,
  ArrowRight,
  ListTodo,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    );
  }

  const {
    stats = {},
    userPostedTasks = [],
    recommendedTasks = [],
  } = data || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Hi, {user?.name || 'Sanjana'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back to your Micro-Volunteer Match dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/post-task"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Task</span>
          </Link>
          <Link
            to="/tasks"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm shadow-sm transition-all flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Find Tasks</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: TASKS FOR YOU */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Tasks for You
            </h2>
            <p className="text-xs text-slate-500">
              Tasks posted by other real users that match your profile.
            </p>
          </div>
          <Link to="/tasks" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
            <span>View All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedTasks.length === 0 ? (
          <div className="app-card p-8 text-center text-slate-500 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-medium">No open task matches right now.</p>
            <Link to="/post-task" className="text-xs text-indigo-600 hover:underline inline-block">
              + Post a task requesting help
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedTasks.slice(0, 3).map((task) => (
              <TaskCard key={task._id} task={task} onAcceptSuccess={fetchDashboard} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: MY ACTIVITY (SIMPLE STATISTICS) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">My Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="app-card p-6 text-center space-y-1">
            <span className="block text-3xl font-extrabold text-indigo-600">
              {stats?.completedTasksCount || 0}
            </span>
            <span className="text-sm font-semibold text-slate-700">Tasks Completed</span>
          </div>

          <div className="app-card p-6 text-center space-y-1">
            <span className="block text-3xl font-extrabold text-emerald-600">
              {stats?.contributionMinutes || 0} min
            </span>
            <span className="text-sm font-semibold text-slate-700">Time Contributed</span>
          </div>

          <div className="app-card p-6 text-center space-y-1">
            <span className="block text-3xl font-extrabold text-amber-600">
              {userPostedTasks.length || stats?.postedTasksCount || 0}
            </span>
            <span className="text-sm font-semibold text-slate-700">Tasks Posted</span>
          </div>
        </div>
      </section>
    </div>
  );
}
