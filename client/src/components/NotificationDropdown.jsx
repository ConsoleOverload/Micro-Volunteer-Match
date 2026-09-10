import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Sparkles, Trophy, CheckCircle2, Info } from 'lucide-react';

export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'MATCH':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'BADGE_EARNED':
        return <Trophy className="w-4 h-4 text-amber-600" />;
      case 'TASK_ACCEPTED':
      case 'TASK_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 shadow-xl py-2 z-50 rounded-xl max-h-[28rem] flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2 py-0.5 rounded-full border border-indigo-200">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.read) markAsRead(notif._id);
              }}
              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                !notif.read ? 'bg-slate-50/80' : ''
              }`}
            >
              <div className="mt-0.5 flex-shrink-0 p-2 rounded-xl bg-slate-100 border border-slate-200">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className={`text-xs font-semibold truncate ${!notif.read ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>

                {notif.relatedTask && (
                  <Link
                    to={`/tasks/${notif.relatedTask._id || notif.relatedTask}`}
                    onClick={onClose}
                    className="inline-block mt-1.5 text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    View Task →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
