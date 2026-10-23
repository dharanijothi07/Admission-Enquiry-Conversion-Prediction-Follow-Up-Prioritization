import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('priya@edupredict.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Select one of the demo accounts below.');
    }
  };

  const handleQuickLogin = async (targetEmail: string, role: 'admin' | 'counsellor') => {
    setEmail(targetEmail);
    await login(targetEmail);
    navigate(role === 'admin' ? '/admin' : '/counsellor');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Left Feature Showcase Banner */}
      <div className="md:w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 md:p-14 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-indigo-900/60 relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">EduPredict.AI</h1>
              <p className="text-xs text-indigo-300 font-medium">
                College Final Year Project Prototype
              </p>
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-6">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>AI-Driven Admissions Intelligence System</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Admission Enquiry Conversion Prediction & Follow-Up Prioritization
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
            Solve admission leakage and counsellor fatigue through machine-learning lead scoring, TreeSHAP explainability, and intelligent daily call queues.
          </p>

          <div className="space-y-3.5">
            {[
              'XGBoost ensemble predicting enrollment likelihood from academic & telemetry signals',
              'Explainable feature contributions so counsellors understand student motivation',
              'Automated prioritization tiers (Urgent, High, Medium, Low) for optimized callback schedules',
              'Executive admissions funnel & counsellor efficiency analytics'
            ].map((feature, i) => (
              <div key={i} className="flex items-start space-x-3 text-xs md:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-indigo-900/60 text-xs text-indigo-400">
          Academic Project Demonstration • Strictly Synthetic Demo Data
        </div>
      </div>

      {/* Right Login Card */}
      <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-6 md:p-14">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Sign In to Portal</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a persona or enter simulated credentials to proceed
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="name@edupredict.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Role Switchers for Viva / Evaluators */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              Quick 1-Click Demo Profiles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@edupredict.edu', 'admin')}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Admin / Dean
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Dr. S. Rangarajan
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('priya@edupredict.edu', 'counsellor')}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Admissions Counsellor
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Priya Sundaram
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
