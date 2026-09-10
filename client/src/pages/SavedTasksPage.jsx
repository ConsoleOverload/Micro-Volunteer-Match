import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { TaskCardSkeleton } from '../components/LoadingSkeleton';
import { Bookmark, Search } from 'lucide-react';

export default function SavedTasksPage() {
  const [savedTasks, setSavedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved');
      setSavedTasks(res.data || []);
    } catch (err) {
      console.error('Fetch saved tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedTasks();
  }, []);

  const handleSaveToggle = (taskId) => {
    setSavedTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
          <Bookmark className="w-3.5 h-3.5" />
          Bookmarked Opportunities
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Saved Tasks</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tasks you bookmarked to return to when your availability window opens.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : savedTasks.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No saved tasks yet</h3>
          <p className="text-xs">Click the bookmark icon on any task card to save it here for later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savedTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onSaveToggle={handleSaveToggle}
              onAcceptSuccess={fetchSavedTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
