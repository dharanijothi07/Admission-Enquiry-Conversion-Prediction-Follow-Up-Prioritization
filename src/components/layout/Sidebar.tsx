import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  ListFilter,
  UserPlus,
  CalendarClock,
  Sparkles,
  BarChart3,
  ShieldCheck,
  BrainCircuit,
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();

  const navItems = [
    {
      label: 'Admin Overview',
      path: '/admin',
      icon: LayoutDashboard,
      roles: ['admin'],
      badge: 'Director'
    },
    {
      label: 'My Follow-up Queue',
      path: '/counsellor',
      icon: Users2,
      roles: ['counsellor', 'admin'],
      badge: 'Action'
    },
    {
      label: 'Enquiry Bank',
      path: '/enquiries',
      icon: ListFilter,
      roles: ['admin', 'counsellor']
    },
    {
      label: 'New Admission Lead',
      path: '/enquiries/new',
      icon: UserPlus,
      roles: ['admin', 'counsellor']
    },
    {
      label: 'Follow-Up Board',
      path: '/follow-ups',
      icon: CalendarClock,
      roles: ['admin', 'counsellor'],
      badge: 'Live'
    },
    {
      label: 'Prediction Engine',
      path: '/prediction-insights',
      icon: Sparkles,
      roles: ['admin', 'counsellor']
    },
    {
      label: 'Conversion Analytics',
      path: '/analytics',
      icon: BarChart3,
      roles: ['admin', 'counsellor']
    },
    {
      label: 'Counsellors & Staff',
      path: '/users',
      icon: ShieldCheck,
      roles: ['admin']
    },
    {
      label: 'ML Model Evaluation',
      path: '/ml-evaluation',
      icon: BrainCircuit,
      roles: ['admin', 'counsellor'],
      badge: 'Academic'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <NavLink to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                EduPredict<span className="text-indigo-400">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Admissions CRM
              </span>
            </div>
          </NavLink>
        </div>

        {/* User Card in Sidebar */}
        <div className="px-4 py-3 m-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center space-x-3">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 uppercase tracking-wider font-mono">
              {role === 'admin' ? 'Admissions Dean' : 'Admissions Counsellor'}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Workspaces & Modules
          </div>

          {navItems.map((item) => {
            const hasAccess = item.roles.includes(role);
            if (!hasAccess) return null;

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge === 'Action'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.badge === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Project System Specs Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-300">Model Engine</span>
            <span className="text-emerald-400 font-mono">XGBoost v2.3</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Academic Project: Conversion Prediction & Prioritization Engine
          </p>
        </div>
      </aside>
    </>
  );
};
