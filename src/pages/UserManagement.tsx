import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Building,
  Award,
  CheckCircle,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { User, UserRole } from '../types/auth';

export const UserManagement: React.FC = () => {
  const { allUsers, refreshUsers, switchUser, user: currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [department, setDepartment] = useState('Engineering Admissions');
  const [role, setRole] = useState<UserRole>('counsellor');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await AuthService.createUser({
        name,
        email,
        phone,
        department,
        role,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 10000)}?w=150&auto=format&fit=crop&q=80`,
        activeEnquiriesCount: 0,
        conversionRate: 0,
        status: 'active'
      });

      await refreshUsers();
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('+91 ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admissions Staff & Counsellor Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure counsellor capacity, department routing, and monitor individual conversion win-rates
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Counsellors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allUsers.map((u) => {
          const isMe = u.id === currentUser?.id;
          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs relative flex flex-col justify-between ${
                isMe ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                      <p className="text-[11px] text-slate-500">{u.department}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                {/* Contact metadata */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.phone}</span>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-2 gap-2 text-center mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Active Leads
                    </span>
                    <span className="text-base font-black text-slate-800">
                      {u.activeEnquiriesCount}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      Win Rate
                    </span>
                    <span className="text-base font-black text-emerald-700">
                      {u.conversionRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Persona switch button for testing */}
              <button
                onClick={() => switchUser(u.id)}
                disabled={isMe}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isMe
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {isMe ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Currently Active Session</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Switch to this Persona</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Staff Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Admissions Counsellor / Admin"
        subtitle="Provision access credentials for college admissions team"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Staff Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meera Natarajan"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meera@edupredict.edu"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98405 11223"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering Admissions"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Role Privilege
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="counsellor">Admissions Counsellor</option>
                <option value="admin">Director / Administrator</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {submitting ? 'Creating...' : 'Register Staff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
