import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  MessageSquare,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Filter
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { PriorityBadge, StatusBadge, ChannelBadge } from '../components/common/Badge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { FollowUpService } from '../services/followUpService';
import { EnquiryService } from '../services/enquiryService';
import { FollowUpTask, CallDisposition } from '../types/followUp';
import { AdmissionEnquiry } from '../types/enquiry';

export const CounsellorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal state
  const [selectedTask, setSelectedTask] = useState<FollowUpTask | null>(null);
  const [outcome, setOutcome] = useState<CallDisposition>('Interested - Requested Prospectus');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const allTasks = await FollowUpService.getAllTasks();
      const allEnquiries = await EnquiryService.getAllEnquiries();

      // Filter for this counsellor if user id is counsellor, otherwise show all
      const myTasks = user?.role === 'counsellor' 
        ? allTasks.filter((t) => t.counsellorId === user.id)
        : allTasks;
      
      const myEnquiries = user?.role === 'counsellor'
        ? allEnquiries.filter((e) => e.counsellorId === user.id)
        : allEnquiries;

      setTasks(myTasks);
      setEnquiries(myEnquiries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await FollowUpService.updateTaskStatus(selectedTask.id, 'Completed', outcome, notes);
      
      // Also log interaction on the parent enquiry
      await EnquiryService.addInteraction(selectedTask.enquiryId, {
        counsellorName: user?.name || 'Counsellor',
        type: 'Call',
        notes: `Call Outcome: ${outcome}. Notes: ${notes}`,
        outcome
      });

      setSelectedTask(null);
      setNotes('');
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Task breakdown
  const pendingTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'Overdue');
  const urgentTasks = pendingTasks.filter((t) => t.priority === 'Urgent');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Prioritized Calling Cockpit</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Vanakkam, {user?.name}! 👋
            </h1>
            <p className="text-xs text-indigo-200 max-w-xl mt-1 leading-relaxed">
              Your call queue is dynamically ranked by machine-learning conversion likelihood. Prioritize Urgent leads to maximize admission conversions today.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <Award className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">
                Your Win Rate
              </p>
              <p className="text-xl font-black text-white">
                {user?.conversionRate || 44.2}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Calls & Tasks Today"
          value={pendingTasks.length}
          subtitle="Pending follow-up actions"
          icon={CalendarCheck}
          colorScheme="indigo"
          onClick={() => navigate('/follow-ups')}
        />
        <MetricCard
          title="Urgent High-Intent"
          value={urgentTasks.length}
          subtitle="Probability >= 85%"
          icon={AlertTriangle}
          colorScheme="rose"
          trend={{ value: 'Call immediately', isPositive: false }}
        />
        <MetricCard
          title="Completed Today"
          value={completedTasks.length}
          subtitle="Logged interactions"
          icon={CheckCircle}
          colorScheme="emerald"
          trend={{ value: 'Target: 15 calls/day', isPositive: true }}
        />
        <MetricCard
          title="Assigned Students"
          value={enquiries.length}
          subtitle="Under your guidance"
          icon={PhoneCall}
          colorScheme="sky"
          onClick={() => navigate('/enquiries')}
        />
      </div>

      {/* Main Prioritized Calling Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Smart Prioritized Follow-Up Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by algorithm: Candidates with highest enrollment readiness appear first
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/follow-ups')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 transition-colors"
            >
              Full Calendar View
            </button>
            <button
              onClick={() => navigate('/enquiries/new')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              + Quick Add Lead
            </button>
          </div>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">All caught up!</p>
            <p className="text-xs">No pending follow-ups in your queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingTasks.map((task) => {
              const matchedEnquiry = enquiries.find((e) => e.id === task.enquiryId);
              const topDriver = matchedEnquiry?.prediction.topDrivers[0];

              return (
                <div
                  key={task.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Student & Course Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-extrabold text-slate-900 text-base">
                        {task.studentName}
                      </span>
                      <PriorityBadge priority={task.priority} size="sm" />
                      <ChannelBadge channel={task.channel} />
                      <span className="text-xs text-slate-400 font-mono">
                        {task.scheduledTime}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-indigo-600 mb-2">
                      Interested in: {task.courseInterested}
                    </p>

                    {/* AI Explainability Hint Box */}
                    {topDriver && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">AI Pitch Driver:</span>
                        <span>{topDriver.explanation}</span>
                      </div>
                    )}

                    {task.notes && (
                      <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                        "{task.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions & Conversion Probability */}
                  <div className="flex items-center gap-4 self-end lg:self-center shrink-0">
                    {matchedEnquiry && (
                      <div className="text-right">
                        <ScoreGauge score={matchedEnquiry.prediction.probabilityPercentage} size="sm" />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Log Outcome</span>
                      </button>

                      <button
                        onClick={() => navigate(`/enquiries/${task.enquiryId}`)}
                        className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white text-xs transition-colors"
                        title="View Full Student Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Call Outcome Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Log Follow-Up Call Outcome"
        subtitle={`Candidate: ${selectedTask?.studentName} • ${selectedTask?.courseInterested}`}
      >
        <form onSubmit={handleCompleteTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Call Disposition / Result
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as CallDisposition)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Interested - Requested Prospectus">Interested - Requested Prospectus</option>
              <option value="High Intent - Scheduling Campus Visit">High Intent - Scheduling Campus Visit</option>
              <option value="Needs Parent Approval">Needs Parent Approval</option>
              <option value="Fee Scholarship Discussion">Fee Scholarship Discussion</option>
              <option value="Enrolled / Paid Application Fee">Enrolled / Paid Application Fee</option>
              <option value="Follow Up Tomorrow">Follow Up Tomorrow</option>
              <option value="Not Reachable">Not Reachable</option>
              <option value="Joined Another Institution">Joined Another Institution</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Interaction Notes & Action Taken
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Student visited CSE lab, father agreed for tuition loan. Call scheduled for Monday."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {submitting ? 'Updating...' : 'Save & Close Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
