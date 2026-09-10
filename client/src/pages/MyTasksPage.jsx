import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import {
  ListTodo,
  PlusCircle,
  Clock,
  CheckCircle2,
  UserCheck,
  User,
  MapPin,
} from 'lucide-react';

export default function MyTasksPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'helping');

  const [postedTasks, setPostedTasks] = useState([]);
  const [helpingTasks, setHelpingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setPostedTasks(res.data.userPostedTasks || []);
      setHelpingTasks(res.data.upcomingTasks || []);
    } catch (err) {
      console.error('Fetch my tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleMarkCompleted = async (taskId, duration = 15) => {
    try {
      setActionLoading(true);
      setMessage('');
      await api.post(`/tasks/${taskId}/complete`);
      setMessage(`Marked completed! Waiting for creator confirmation.`);
      fetchMyTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to mark task complete.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCompletion = async (taskId, duration = 15) => {
    try {
      setActionLoading(true);
      setMessage('');
      await api.post(`/tasks/${taskId}/confirm`);
      setMessage(`+${duration} minutes contributed! Task completion confirmed.`);
      fetchMyTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to confirm completion.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ListTodo className="w-8 h-8 text-indigo-600" />
            My Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track tasks you are helping with and tasks you have posted.
          </p>
        </div>

        <Link
          to="/post-task"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Task</span>
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Section Switcher Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveSection('helping')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSection === 'helping'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          Tasks I'm Helping With ({helpingTasks.length})
        </button>

        <button
          onClick={() => setActiveSection('posted')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeSection === 'posted'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          Tasks I Posted ({postedTasks.length})
        </button>
      </div>

      {/* SECTION 1: TASKS I'M HELPING WITH */}
      {activeSection === 'helping' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Tasks I'm Helping With</h2>

          {loading ? (
            <LoadingSpinner text="Loading accepted tasks..." />
          ) : helpingTasks.length === 0 ? (
            <div className="app-card p-12 text-center text-slate-500 space-y-3">
              <Clock className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No active tasks accepted</h3>
              <p className="text-xs max-w-sm mx-auto">
                Explore the marketplace to find tasks matching your skills.
              </p>
              <Link
                to="/tasks"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Find Opportunities →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {helpingTasks.map((task) => (
                <div key={task._id} className="app-card p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {task.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ⏱ {task.duration} min
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Status: In Progress
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm"
                      >
                        View Details
                      </Link>

                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleMarkCompleted(task._id, task.duration)}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Posted by: <strong className="text-slate-800">{task.creator?.name || 'User'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Location: <strong className="text-slate-800">📍 {task.location || 'Online'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TASKS I POSTED */}
      {activeSection === 'posted' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Tasks I Posted</h2>

          {loading ? (
            <LoadingSpinner text="Loading posted tasks..." />
          ) : postedTasks.length === 0 ? (
            <div className="app-card p-12 text-center text-slate-500 space-y-3">
              <PlusCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No tasks posted yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Need help with peer tutoring, code, poster design, or event prep?
              </p>
              <Link
                to="/post-task"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                + Post a Task Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {postedTasks.map((task) => {
                const hasVolunteer = task.volunteers && task.volunteers.length > 0;
                const volunteerName = hasVolunteer ? task.volunteers[0].name : null;

                return (
                  <div key={task._id} className="app-card p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {task.category}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            ⏱ {task.duration} min
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                              hasVolunteer
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            Status: {hasVolunteer ? `Volunteer: ${volunteerName}` : 'Waiting for Volunteer'}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm"
                        >
                          View Details
                        </Link>

                        {hasVolunteer && task.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleConfirmCompletion(task._id, task.duration)}
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                          >
                            Confirm Completion
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                    {hasVolunteer && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Accepted by Volunteer: <strong className="text-slate-900">{volunteerName}</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
