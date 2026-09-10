import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { TrustBadges } from '../components/TrustBadges.jsx';
import { KarmaBadge } from '../components/KarmaBadge.jsx';
import { SkillVerifyModal } from '../components/SkillVerifyModal.jsx';
import { AiMatchModal } from '../components/AiMatchModal.jsx';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Zap,
  Sparkles,
  ArrowLeft,
  UserCheck,
  Award,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [accepting, setAccepting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Task Direct Chat State
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const chatBottomRef = useRef(null);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/tasks/${id}`);
      setTask(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading task details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskChat = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('mvm_token');
      const res = await axios.get(`/api/tasks/${id}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      // ignore silently
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (task && user) {
      fetchTaskChat();
      const interval = setInterval(fetchTaskChat, 4000); // auto-refresh chat every 4s
      return () => clearInterval(interval);
    }
  }, [task, user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAccept = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setAccepting(true);
      const res = await axios.patch(`/api/tasks/${id}/accept`);
      setTask(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept task');
    } finally {
      setAccepting(false);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      const res = await axios.patch(`/api/tasks/${id}/complete`);
      setTask(res.data);
      await refreshUser();

      // If user is poster and volunteer accepted, open skill verification modal!
      if (user?._id === task.postedBy?._id && task.acceptedBy) {
        setIsVerifyModalOpen(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete task');
    } finally {
      setCompleting(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSendingChat(true);
      const token = localStorage.getItem('mvm_token');
      const res = await axios.post(
        `/api/tasks/${id}/chat`,
        { text: chatInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
      setChatInput('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">{error || 'Task not found'}</h3>
        <Link to="/feed" className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
          Back to Feed
        </Link>
      </div>
    );
  }

  const isPoster = user?._id === task.postedBy?._id;
  const isAcceptor = user?._id === task.acceptedBy?._id;
  const isCompleted = task.status === 'completed';
  const isAccepted = task.status === 'accepted';
  const isOpen = task.status === 'open';

  return (
    <div className="max-w-3xl mx-auto my-8 px-4 space-y-6">
      {/* Back button */}
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Task Feed
      </Link>

      {/* Main Task Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Urgent Banner */}
        {task.isUrgent && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white" /> SOS URGENT REQUEST (+20 Karma)
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              Est: ~{task.estimatedMinutes} Mins
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
              Category: {task.category}
            </span>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {task.walkTimeEstimate || '~10 min walk'}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : isAccepted
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                Status: {task.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
              {task.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {task.description}
            </p>
          </div>

          {/* Location & Time info */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Campus Location: <strong>{task.campusLocation}</strong></span>
          </div>

          {/* Requester & Volunteer Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Requester Profile Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Posted By (Requester)
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {task.postedBy?.name ? task.postedBy.name.charAt(0) : 'U'}
                </div>
                <div>
                  <Link
                    to={`/profile/${task.postedBy?._id}`}
                    className="text-xs font-bold text-slate-800 hover:text-emerald-700 block"
                  >
                    {task.postedBy?.name || 'Campus Peer'}
                  </Link>
                  <TrustBadges badges={task.postedBy?.trustBadges || []} size="sm" />
                </div>
              </div>
            </div>

            {/* Volunteer Profile Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Volunteer (Helper)
              </span>
              {task.acceptedBy ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {task.acceptedBy.name ? task.acceptedBy.name.charAt(0) : 'V'}
                  </div>
                  <div>
                    <Link
                      to={`/profile/${task.acceptedBy._id}`}
                      className="text-xs font-bold text-slate-800 hover:text-teal-700 block"
                    >
                      {task.acceptedBy.name}
                    </Link>
                    <TrustBadges badges={task.acceptedBy.trustBadges || []} size="sm" />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-2">
                  Waiting for a campus volunteer to accept...
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* AI Recommendation Button for Requester */}
            {isPoster && isOpen && (
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                Find Best AI Matches
              </button>
            )}

            {/* Main Action State Buttons */}
            <div className="w-full sm:w-auto flex flex-wrap items-center gap-3 ml-auto">
              {/* Chat Toggle Button */}
              <button
                type="button"
                onClick={() => setShowChat(!showChat)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <MessageSquare className="w-4 h-4 text-teal-600" />
                {showChat ? 'Hide Task Chat' : `Chat (${messages.length})`}
                {showChat ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isOpen && !isPoster && (
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {accepting ? 'Accepting...' : 'Accept Help Task (+10/+20 Karma)'}
                </button>
              )}

              {isAccepted && (isPoster || isAcceptor) && (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completing ? 'Confirming...' : 'Mark Task Completed'}
                </button>
              )}

              {isCompleted && (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Task Successfully Completed & Karma Awarded!
                </div>
              )}
            </div>
          </div>

          {/* TASK DIRECT CHAT SECTION */}
          {showChat && (
            <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-extrabold tracking-wide uppercase">
                    Task Direct Chat & Meetup Coordination
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {messages.length} Messages
                </span>
              </div>

              {/* Messages Thread */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-64 overflow-y-auto space-y-3 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                    <MessageSquare className="w-7 h-7 text-slate-300" />
                    <p>No messages yet. Send a message to coordinate task location or timing!</p>
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
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
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

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message to coordinate with helper / requester..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {sendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal Prompt */}
      {task.acceptedBy && (
        <SkillVerifyModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          task={task}
          volunteer={task.acceptedBy}
          onVerified={fetchTask}
        />
      )}

      {/* AI Candidate Match Modal */}
      <AiMatchModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        task={task}
      />
    </div>
  );
};
