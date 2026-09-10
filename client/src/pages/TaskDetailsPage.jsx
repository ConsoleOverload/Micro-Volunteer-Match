import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MatchBadge from '../components/MatchBadge';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  User,
  Check,
} from 'lucide-react';

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);
    } catch (err) {
      console.error('Fetch task details error:', err);
      setErrorMsg('Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSpinner text="Loading task details..." />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Task Not Found</h2>
        <Link to="/tasks" className="text-indigo-600 hover:underline text-xs">
          ← Back to Find Opportunities
        </Link>
      </div>
    );
  }

  const isCreator = user && task.creator && (task.creator._id || task.creator) === user._id;
  const isVolunteer =
    user &&
    task.volunteers &&
    task.volunteers.some((v) => (v._id || v) === user._id);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setActionLoading(true);
      setErrorMsg('');
      await api.post(`/tasks/${task._id}/accept`);
      setSuccessMsg('Task Accepted ✓');
      fetchTaskDetails();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to accept task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await api.post(`/tasks/${task._id}/complete`);
      setSuccessMsg('Task marked completed! Waiting for creator confirmation.');
      fetchTaskDetails();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await api.post(`/tasks/${task._id}/confirm`);
      setSuccessMsg('Completion confirmed! Contribution minutes awarded to volunteer.');
      fetchTaskDetails();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to confirm task completion.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to tasks</span>
      </button>

      {/* Main Task Header Card */}
      <div className="app-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                🏷 {task.category}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ⏱ {task.duration} minutes
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {task.title}
            </h1>

            {task.creator && (
              <p className="text-xs text-slate-500">
                Posted by <strong className="text-slate-800">{task.creator.name}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {task.matchPercentage !== undefined && (
              <MatchBadge score={task.matchPercentage} size="large" />
            )}
          </div>
        </div>

        {/* YOUR MATCH SECTION */}
        {task.matchPercentage !== undefined && !isCreator && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Your Match: <span className="text-emerald-700 text-sm font-extrabold">{task.matchPercentage}%</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Skill match
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Availability match
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Duration match
              </span>
            </div>

            {task.matchReasons && task.matchReasons.length > 0 && (
              <p className="text-xs text-emerald-800 italic pt-1">
                “{task.matchReasons[0].replace(/^✓\s*/, '')}”
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Task Description</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {task.description}
          </p>
        </div>

        {/* Required Skills */}
        {task.requiredSkills && task.requiredSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {task.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="block text-[10px] text-slate-400">Location</span>
              <span className="font-semibold">📍 {task.location || 'Online'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="block text-[10px] text-slate-400">Schedule</span>
              <span className="font-semibold">{task.preferredTime || 'Flexible'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="block text-[10px] text-slate-400">Posted By</span>
              <span className="font-semibold">{task.creator?.name || 'User'}</span>
            </div>
          </div>
        </div>

        {/* Revealed Instructions upon Acceptance or for Creator */}
        {(isVolunteer || isCreator) && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
            <h4 className="text-xs font-bold text-indigo-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Volunteer Instructions & Contact Details
            </h4>
            <p className="text-xs text-indigo-900 leading-relaxed">
              {task.contactInstructions || 'Contact details provided by creator.'}
            </p>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-bold">
            {successMsg}
          </p>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!isVolunteer && !isCreator && task.status === 'OPEN' && (
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                {actionLoading ? 'Accepting...' : 'Accept Task'}
              </button>
            )}

            {isVolunteer && (
              <span className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Task Accepted ✓
              </span>
            )}

            {isVolunteer && task.status !== 'COMPLETED' && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                {actionLoading ? 'Updating...' : 'Mark Completed'}
              </button>
            )}

            {isCreator && task.status !== 'COMPLETED' && (
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                {actionLoading ? 'Confirming...' : 'Confirm Completion'}
              </button>
            )}

            {task.status === 'COMPLETED' && (
              <span className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs">
                ✓ Task Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
