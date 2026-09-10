import React, { useState } from 'react';
import axios from 'axios';
import { Award, CheckCircle2, X } from 'lucide-react';

export const SkillVerifyModal = ({ isOpen, onClose, task, volunteer, onVerified }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(task?.category || 'Tutoring');

  if (!isOpen || !task || !volunteer) return null;

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/verifications', {
        skill: selectedSkill,
        userId: volunteer._id,
        taskId: task._id
      });

      setSuccessMsg(res.data.message || 'Skill endorsed!');
      if (onVerified) onVerified(res.data);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.message || 'Error endorsing skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <Award className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            Endorse {volunteer.name}'s Skill
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            {volunteer.name} successfully helped you with <strong className="text-emerald-700">{task.title}</strong>. Confirm their skill tag to help them earn a verified <span className="text-emerald-600 font-bold">✓</span> badge!
          </p>
        </div>

        {successMsg ? (
          <div className="my-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {successMsg}
          </div>
        ) : (
          <div className="my-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Skill to Verify
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={task.category}>{task.category} (Category)</option>
                {volunteer.skills?.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? 'Confirming...' : 'Confirm Skill ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
