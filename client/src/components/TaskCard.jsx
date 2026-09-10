import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Box,
  Palette,
  Languages,
  MapPin,
  HelpCircle,
  Clock,
  Zap,
  CheckCircle2,
  Flame,
  Sparkles
} from 'lucide-react';
import { TrustBadges } from './TrustBadges.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const categoryIcons = {
  'Tutoring': BookOpen,
  'Donation Sorting': Box,
  'Design': Palette,
  'Translation': Languages,
  'Directions': MapPin,
  'Other': HelpCircle
};

const categoryColors = {
  'Tutoring': 'bg-blue-50 text-blue-700 border-blue-200',
  'Donation Sorting': 'bg-amber-50 text-amber-700 border-amber-200',
  'Design': 'bg-purple-50 text-purple-700 border-purple-200',
  'Translation': 'bg-rose-50 text-rose-700 border-rose-200',
  'Directions': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Other': 'bg-slate-50 text-slate-700 border-slate-200'
};

export const TaskCard = ({ task, onAccept }) => {
  const { user } = useAuth();
  const IconComponent = categoryIcons[task.category] || HelpCircle;
  const categoryStyle = categoryColors[task.category] || categoryColors['Other'];

  const isCompleted = task.status === 'completed';
  const isAccepted = task.status === 'accepted';
  const isUrgent = task.isUrgent;

  // Hide accept button if logged-in user is the one who posted this task
  const isOwnTask = user && (
    user._id === task.postedBy?._id ||
    user._id === task.postedBy
  );

  // Potential Karma points for volunteer
  const karmaReward = isUrgent ? 20 : 10;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden relative ${
        isUrgent
          ? 'border-rose-400 shadow-md sos-pulse'
          : 'border-slate-200/80 shadow-sm hover:border-emerald-300'
      }`}
    >
      {/* Top Banner for Urgent Tasks */}
      {isUrgent && (
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1 text-xs font-bold flex items-center justify-between shadow-inner">
          <span className="flex items-center gap-1.5 animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-white" /> SOS URGENT REQUEST (+20 Karma)
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
            EST: ~{task.estimatedMinutes || 15} MIN
          </span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Category & Walk Time Header */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${categoryStyle}`}
          >
            <IconComponent className="w-4 h-4" />
            {task.category}
          </span>

          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{task.walkTimeEstimate || '~10 min walk'}</span>
          </div>
        </div>

        {/* Task Title & Description */}
        <div>
          <Link
            to={`/task/${task._id}`}
            className="group block"
          >
            <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
              {task.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Location & Time Info */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium text-slate-700">{task.campusLocation}</span>
        </div>
      </div>

      {/* Footer / Requester Details & Actions */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Requester Info */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {task.postedBy?.name ? task.postedBy.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-800 truncate">
              {task.postedBy?.name || 'Campus Peer'}
            </div>
            <TrustBadges badges={task.postedBy?.trustBadges || []} size="sm" />
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          ) : isAccepted ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold">
              In Progress
            </span>
          ) : isOwnTask ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
              Your Post
            </span>
          ) : (
            <Link
              to={`/task/${task._id}`}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <span>Accept</span>
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
