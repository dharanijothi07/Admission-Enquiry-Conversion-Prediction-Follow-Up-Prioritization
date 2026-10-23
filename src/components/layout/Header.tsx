import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  PlusCircle,
  RotateCcw,
  Sparkles,
  UserCheck,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EnquiryService } from '../../services/enquiryService';
import { FollowUpService } from '../../services/followUpService';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, switchRole, allUsers, switchUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleResetData = () => {
    if (window.confirm('Reset all demo enquiries and follow-ups to initial college prototype state?')) {
      EnquiryService.resetToDemoData();
      FollowUpService.resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Project Breadcrumb */}
        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-800">College Admissions CRM</span>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600 font-medium capitalize">
            {role} Portal
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Role Quick-Switch Pill for College Project Testing */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Switch View:
          </span>
          <button
            onClick={() => switchRole('admin')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              role === 'admin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin View
          </button>
          <button
            onClick={() => switchRole('counsellor')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              role === 'counsellor'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Counsellor View
          </button>
        </div>

        {/* User Persona Switcher */}
        <select
          value={user?.id}
          onChange={(e) => switchUser(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          title="Switch Active Persona"
        >
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>

        {/* Reset Demo Data */}
        <button
          onClick={handleResetData}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-transparent hover:border-slate-200 transition-colors"
          title="Reset dataset to default demo fixtures"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden xl:inline">Reset Demo</span>
        </button>

        {/* Quick Add Enquiry CTA */}
        <button
          onClick={() => navigate('/enquiries/new')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Enquiry</span>
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
