import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { KarmaBadge } from '../components/KarmaBadge.jsx';
import { TrustBadges } from '../components/TrustBadges.jsx';
import { Users, MapPin, Calendar, UserPlus, UserMinus, Trash2, ArrowLeft, Loader2, ShieldCheck, Flame, CheckCircle2, MessageSquare, Send, Lock } from 'lucide-react';

export const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Team Chat states
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/teams/${id}`);
      setTeam(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('mvm_token');
      const res = await axios.get(`/api/teams/${id}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      // ignore non-member forbidden error silently
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  useEffect(() => {
    if (team && isAuthenticated && team.members?.some((m) => m._id === user?._id)) {
      fetchChatMessages();
      const interval = setInterval(fetchChatMessages, 4000); // auto-refresh chat every 4s
      return () => clearInterval(interval);
    }
  }, [team, isAuthenticated, user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const token = localStorage.getItem('mvm_token');
      const res = await axios.post(
        `/api/teams/${id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeam(res.data.team);
      setMessages(res.data.team.messages || []);
      setSuccessMsg('You have successfully joined this team!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error joining team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setActionLoading(true);
      setError('');
      const token = localStorage.getItem('mvm_token');
      const res = await axios.post(
        `/api/teams/${id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeam(res.data.team);
      setSuccessMsg('You have left the team.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error leaving team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('mvm_token');
      await axios.delete(`/api/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/teams');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting team');
      setActionLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      setSendingChat(true);
      const token = localStorage.getItem('mvm_token');
      const res = await axios.post(
        `/api/teams/${id}/chat`,
        { text: chatInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
      setChatInput('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send chat message');
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading team profile...</p>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
        <p className="text-sm font-bold text-rose-600">{error}</p>
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teams Directory
        </Link>
      </div>
    );
  }

  const isMember = isAuthenticated && team?.members?.some((m) => m._id === user?._id);
  const isCreator = isAuthenticated && (team?.createdBy?._id === user?._id || team?.createdBy === user?._id);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back button */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Campus Teams
      </Link>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 shadow-xs">
          {error}
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                {team.category}
              </span>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {team.campusLocation}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {team.name}
            </h1>

            <p className="text-xs text-slate-400 font-medium">
              Established {new Date(team.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} • Created by <span className="text-slate-600 font-semibold">{team.createdBy?.name || 'Campus Member'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-200"
                title="Delete Team"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {isMember ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                Leave Team
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Join Campus Squad
              </button>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Team Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            About the Club & Mission
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {team.description}
          </p>
        </div>
      </div>

      {/* TEAM MEMBER CHAT AREA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold tracking-wide">
              Team Squad Chat Room
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {isMember ? `${messages.length} Messages` : 'Members Only'}
          </span>
        </div>

        {isMember ? (
          <div className="p-6 space-y-4">
            {/* Chat Thread */}
            <div className="h-72 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <p>No chat messages yet. Send the first message to your squad!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                        {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Type a message to your team squad..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatInput.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {sendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/50 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Team Chat Locked</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Join <strong>{team.name}</strong> to unlock the private squad chat room and coordinate campus volunteer activities!
            </p>
            {isAuthenticated ? (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Join Team to Chat
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors"
              >
                Log in to Join & Chat
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Member Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Club Roster ({team.members?.length || 0})
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Active Volunteer Helpers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.members?.map((member) => (
            <div
              key={member._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-3 hover:border-emerald-200 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <Link
                      to={`/profile/${member._id}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors block"
                    >
                      {member.name}
                    </Link>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {member.campusLocation}
                    </p>
                  </div>
                </div>

                {/* Skills tags */}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <KarmaBadge score={member.karmaScore || 0} />
                {member.streakCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {member.streakCount}w
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
