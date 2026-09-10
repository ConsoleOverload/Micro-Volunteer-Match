import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Heart, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    try {
      setLoading(true);
      setError('');
      await login(demoEmail, 'password123');
      navigate('/feed');
    } catch (err) {
      setError('Demo login failed. Make sure seed script has run.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md mx-auto">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Log in to connect with campus peers & solve 15-min tasks
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="alex@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Hackathon Accounts Quick Selector */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Quick Demo Login Accounts:
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('alex@campus.edu')}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-left border border-emerald-200 transition-all"
            >
              <div className="text-xs font-bold">Alex (210 Karma)</div>
              <div className="text-[10px] text-emerald-700">Tutoring & Code</div>
            </button>

            <button
              onClick={() => handleDemoLogin('samantha@campus.edu')}
              className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl text-left border border-teal-200 transition-all"
            >
              <div className="text-xs font-bold">Samantha (320 Karma)</div>
              <div className="text-[10px] text-teal-700">Spanish Translation</div>
            </button>

            <button
              onClick={() => handleDemoLogin('maya@campus.edu')}
              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-left border border-purple-200 transition-all"
            >
              <div className="text-xs font-bold">Maya (160 Karma)</div>
              <div className="text-[10px] text-purple-700">Poster Art & Design</div>
            </button>

            <button
              onClick={() => handleDemoLogin('jordan@campus.edu')}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-left border border-amber-200 transition-all"
            >
              <div className="text-xs font-bold">Jordan (85 Karma)</div>
              <div className="text-[10px] text-amber-700">Food Drive Sorting</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-emerald-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};
