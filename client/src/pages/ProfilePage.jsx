import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import { Edit3, MapPin, Sparkles, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfileState } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [availability, setAvailability] = useState(user?.availability?.timeSlots?.join(', ') || 'Afternoon, Evening');
  const [location, setLocation] = useState(user?.location || '');
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/users/${user._id}`);
      setProfileData(res.data.user);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const interestsArray = interests.split(',').map((i) => i.trim()).filter(Boolean);
      const slotsArray = availability.split(',').map((a) => a.trim()).filter(Boolean);

      const res = await api.put('/users/profile', {
        name,
        bio,
        skills: skillsArray,
        interests: interestsArray,
        availability: {
          timeSlots: slotsArray,
        },
        location,
      });

      updateUserProfileState(res.data);
      setProfileData(res.data);
      setEditModalOpen(false);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="app-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={profileData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData?.name || 'User'}`}
            alt={profileData?.name}
            className="w-24 h-24 rounded-2xl border border-slate-200 object-cover bg-slate-50 shadow-sm"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{profileData?.name}</h1>
                <p className="text-xs text-slate-500 font-medium">{profileData?.email}</p>
              </div>

              <button
                onClick={() => {
                  setName(profileData?.name || '');
                  setBio(profileData?.bio || '');
                  setSkills(profileData?.skills?.join(', ') || '');
                  setInterests(profileData?.interests?.join(', ') || '');
                  setAvailability(profileData?.availability?.timeSlots?.join(', ') || 'Afternoon, Evening');
                  setLocation(profileData?.location || '');
                  setEditModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 self-center sm:self-auto shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Edit Profile</span>
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{profileData?.bio}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
              <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-lg border border-indigo-200">
                📍 {profileData?.location || 'Campus / Remote'}
              </span>
            </div>
          </div>
        </div>

        {/* IMPACT STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="block text-3xl font-extrabold text-indigo-600">
              {profileData?.completedTasksCount || 0}
            </span>
            <span className="text-xs font-semibold text-slate-700">Tasks Completed</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="block text-3xl font-extrabold text-emerald-600">
              {profileData?.contributionMinutes || 0}
            </span>
            <span className="text-xs font-semibold text-slate-700">Minutes Contributed</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="block text-3xl font-extrabold text-amber-600">
              {stats?.postedTasksCount || 2}
            </span>
            <span className="text-xs font-semibold text-slate-700">Tasks Posted</span>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="app-card p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Profile Details & Availability
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <span className="block text-slate-500 font-semibold uppercase tracking-wider">Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {profileData?.skills?.map((s, idx) => (
                <span key={idx} className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg border border-indigo-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-slate-500 font-semibold uppercase tracking-wider">Interests</span>
            <div className="flex flex-wrap gap-1.5">
              {profileData?.interests?.map((i, idx) => (
                <span key={idx} className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg border border-emerald-200">
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <span className="block text-slate-500 font-semibold uppercase tracking-wider">Availability</span>
            <p className="text-slate-800 font-medium">
              {profileData?.availability?.timeSlots?.join(', ') || 'Afternoon, Evening'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 p-6 space-y-5 rounded-2xl shadow-xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interests (comma separated)</label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Time Slots</label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Afternoon, Evening"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
