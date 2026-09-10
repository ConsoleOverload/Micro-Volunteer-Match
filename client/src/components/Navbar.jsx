import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Heart, PlusCircle, ListTodo, User, LogOut, Flame, Sparkles, Users } from 'lucide-react';
import { KarmaBadge } from './KarmaBadge.jsx';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-800 group-hover:text-emerald-700 transition-colors">
              Micro-Volunteer <span className="text-emerald-600">Match</span>
            </span>
            <span className="block text-[10px] font-semibold text-emerald-600 tracking-wider uppercase -mt-1">
              15-Min Campus Help
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/feed"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/feed') || isActive('/')
                ? 'bg-emerald-100/70 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Task Feed
          </Link>

          <Link
            to="/teams"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/teams')
                ? 'bg-emerald-100/70 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            Clubs & Teams
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/post-task"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/post-task')
                    ? 'bg-emerald-100/70 text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Post Help Request
              </Link>

              <Link
                to="/my-tasks"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/my-tasks')
                    ? 'bg-emerald-100/70 text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ListTodo className="w-4 h-4 text-emerald-600" />
                My Tasks
              </Link>
            </>
          )}
        </nav>

        {/* User Stats & Profile Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Karma & Streak info */}
              <div className="hidden sm:flex items-center gap-2">
                {user.streakCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full shadow-xs"
                    title={`${user.streakCount}-week help streak!`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
                    {user.streakCount}-wk streak
                  </span>
                )}
                <KarmaBadge score={user.karmaScore} tier={user.karmaTier} />
              </div>

              {/* Profile link */}
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-xl transition-all border border-slate-200"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold hidden sm:inline">{user.name?.split(' ')[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                Join Campus Pool
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
