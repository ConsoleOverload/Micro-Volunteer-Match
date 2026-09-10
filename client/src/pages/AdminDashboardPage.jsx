import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import { Shield, Users, CheckCircle2, Clock, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <LoadingSpinner text="Loading Admin Console..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Admin Moderation Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Control Panel</h1>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-white">{stats?.totalUsers || 0}</span>
          <span className="text-xs text-slate-400 font-medium">Registered Users</span>
        </div>
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-brand-300">{stats?.totalTasks || 0}</span>
          <span className="text-xs text-slate-400 font-medium">Total Tasks</span>
        </div>
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-emerald-400">{stats?.completedTasks || 0}</span>
          <span className="text-xs text-slate-400 font-medium">Completed Tasks</span>
        </div>
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-amber-400">{stats?.totalContributionMinutes || 0}m</span>
          <span className="text-xs text-slate-400 font-medium">Platform Minutes</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-400" />
          Registered Users ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Impact Mins</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full bg-slate-800" />
                    <span className="font-bold text-white">{u.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-400">{u.contributionMinutes || 0}m</td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="volunteer">volunteer</option>
                      <option value="creator">creator</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
