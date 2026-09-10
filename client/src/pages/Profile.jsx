import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { TrustBadges } from '../components/TrustBadges.jsx';
import { KarmaBadge } from '../components/KarmaBadge.jsx';
import {
  User,
  MapPin,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Tag,
  Plus,
  X,
  Edit3,
  Save,
  ShieldCheck
} from 'lucide-react';

const CAMPUS_LOCATIONS = [
  'Anurag University - A-Block (Engineering)',
  'Anurag University - B-Block (Pharmacy & Sciences)',
  'Anurag University - C-Block (Management & Humanities)',
  'Anurag University - Central Library',
  'Anurag University - Student Activity Center',
  'Anurag University - Sports Complex & Grounds',
  'Anurag University - Campus Cafeteria'
];

export const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [role, setRole] = useState('both');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${id}`);
      setProfile(res.data);

      // Populate edit fields
      setName(res.data.name || '');
      setCampusLocation(res.data.campusLocation || 'North Campus Library');
      setRole(res.data.role || 'both');
      setSkills(res.data.skills || []);
      setInterests(res.data.interests || []);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.patch(`/api/users/${id}`, {
        name,
        campusLocation,
        role,
        skills,
        interests
      });
      setProfile({ ...profile, ...res.data.user });
      setIsEditing(false);
      await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((item) => item !== s));

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (i) => setInterests(interests.filter((item) => item !== i));

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading user profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm font-bold">
        User profile not found.
      </div>
    );
  }

  const isOwner = currentUser?._id === profile._id;
  const karmaTier = profile.karmaTier || { title: 'New Neighbor', badge: '👋' };
  const verifiedMap = profile.verifiedSkillsMap || {};

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        <div className="gradient-hero h-32 relative">
          <div className="absolute top-4 right-4">
            <KarmaBadge score={profile.karmaScore} tier={karmaTier} />
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl shrink-0">
                <div className="w-full h-full rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-inner">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="space-y-1 mb-1">
                <h1 className="text-2xl font-black text-slate-800">{profile.name}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{profile.campusLocation}</span>
                  <span className="opacity-40">•</span>
                  <span className="capitalize font-semibold text-slate-700">{profile.role}</span>
                </div>
              </div>
            </div>

            {isOwner && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {/* Gamification Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Karma Score Box */}
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Karma Score
              </span>
              <div className="text-xl font-black text-emerald-950">{profile.karmaScore} pts</div>
              <div className="text-[11px] font-semibold text-emerald-700">{karmaTier.badge} {karmaTier.title}</div>
            </div>

            {/* Streak Counter Box */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> Weekly Streak
              </span>
              <div className="text-xl font-black text-amber-950">🔥 {profile.streakCount || 0} Wks</div>
              <div className="text-[11px] font-semibold text-amber-700">Consecutive Help</div>
            </div>

            {/* Tasks Completed Box */}
            <div className="p-3.5 bg-teal-50/80 rounded-2xl border border-teal-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                <Award className="w-3 h-3 text-teal-600" /> Completed Tasks
              </span>
              <div className="text-xl font-black text-teal-950">{profile.completedTasksCount || 0}</div>
              <div className="text-[11px] font-semibold text-teal-700">Peer Micro Helps</div>
            </div>

            {/* Trust Badges Summary Box */}
            <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" /> Trust Badges
              </span>
              <div className="pt-1">
                <TrustBadges badges={profile.trustBadges || []} size="sm" />
              </div>
            </div>
          </div>

          {/* Edit Form OR View Sections */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="pt-4 border-t border-slate-100 space-y-5">
              <h3 className="text-sm font-bold text-slate-800">Edit Profile Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campus Location</label>
                  <select
                    value={campusLocation}
                    onChange={(e) => setCampusLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a skill tag..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200"
                    >
                      {s}
                      <button type="button" onClick={() => removeSkill(s)}>
                        <X className="w-3 h-3 text-rose-600" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 pt-2 border-t border-slate-100">
              {/* Verified Skills Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Skills & Verified Endorsements
                </h3>
                {profile.skills?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skillName) => {
                      const count = verifiedMap[skillName] || 0;
                      const isVerified = count >= 3;

                      return (
                        <div
                          key={skillName}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{skillName}</span>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-white" /> ✓ Verified
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({count}/3 confirm)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Interests Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Interests & Causes
                </h3>
                {profile.interests?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No interests listed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
