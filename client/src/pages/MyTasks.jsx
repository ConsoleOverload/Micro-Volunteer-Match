import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { TaskCard } from '../components/TaskCard.jsx';
import { SkillVerifyModal } from '../components/SkillVerifyModal.jsx';
import { ListTodo, CheckCircle2, Clock, Send, ShieldCheck } from 'lucide-react';

export const MyTasks = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('accepted'); // 'posted' or 'accepted'
  const [postedTasks, setPostedTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [verifyTask, setVerifyTask] = useState(null);
  const [verifyVolunteer, setVerifyVolunteer] = useState(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tasks/mine');
      setPostedTasks(res.data.posted || []);
      setAcceptedTasks(res.data.accepted || []);
    } catch (err) {
      console.error('Error loading user tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId, volunteerObj) => {
    try {
      const res = await axios.patch(`/api/tasks/${taskId}/complete`);
      await fetchMyTasks();
      await refreshUser();

      if (activeTab === 'posted' && volunteerObj) {
        setVerifyTask(res.data);
        setVerifyVolunteer(volunteerObj);
        setIsVerifyOpen(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task completion');
    }
  };

  const tasksToDisplay = activeTab === 'posted' ? postedTasks : acceptedTasks;

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">My Campus Tasks</h1>
            <p className="text-xs text-slate-500">
              Manage your posted help requests and volunteer commitments
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('accepted')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'accepted'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Tasks I Accepted ({acceptedTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('posted')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'posted'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-teal-600" />
            Tasks I Posted ({postedTasks.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading your tasks...</p>
        </div>
      ) : tasksToDisplay.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            No tasks in "{activeTab === 'posted' ? 'Posted' : 'Accepted'}" tab
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'posted'
              ? 'You have not posted any help requests yet.'
              : 'You have not accepted any volunteer tasks yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasksToDisplay.map((t) => (
            <div key={t._id} className="space-y-2">
              <TaskCard task={t} />

              {/* Extra Complete Action Bar if Task is Accepted */}
              {t.status === 'accepted' && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-amber-900">
                    Dual Party Confirmation Needed
                  </span>
                  <button
                    onClick={() => handleMarkComplete(t._id, t.acceptedBy)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Confirm Complete ✓
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skill Endorsement Modal */}
      {verifyTask && verifyVolunteer && (
        <SkillVerifyModal
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          task={verifyTask}
          volunteer={verifyVolunteer}
          onVerified={fetchMyTasks}
        />
      )}
    </div>
  );
};
