import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Calendar,
  Filter,
  Check,
  RefreshCw,
  ExternalLink,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  History,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FollowUpService } from '../services/followUpService';
import { AuthService } from '../services/authService';
import { PriorityBadge, ChannelBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FollowUpTask, FollowUpStatus, CallDisposition, PriorityAuditItem } from '../types/followUp';
import { User } from '../types/auth';

export const FollowUpTasks: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [counsellors, setCounsellors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view segment
  const [activeSegment, setActiveSegment] = useState<'today' | 'overdue' | 'upcoming' | 'completed' | 'all'>('today');
  const [filterCounsellor, setFilterCounsellor] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});

  // Modals
  const [completeModalTask, setCompleteModalTask] = useState<FollowUpTask | null>(null);
  const [rescheduleModalTask, setRescheduleModalTask] = useState<FollowUpTask | null>(null);
  const [overrideModalTask, setOverrideModalTask] = useState<FollowUpTask | null>(null);
  const [auditModalTask, setAuditModalTask] = useState<FollowUpTask | null>(null);
  const [auditTrail, setAuditTrail] = useState<PriorityAuditItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Form states
  const [outcome, setOutcome] = useState<CallDisposition>('Interested - Requested Prospectus');
  const [completionNotes, setCompletionNotes] = useState('');
  const [newDate, setNewDate] = useState('2026-10-24');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  
  // Override form states
  const [targetPriority, setTargetPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [overrideReasonText, setOverrideReasonText] = useState('');
  const [overrideError, setOverrideError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTasks, allUsers] = await Promise.all([
        FollowUpService.getAllTasks(),
        AuthService.getAllUsers()
      ]);
      setTasks(allTasks);
      setCounsellors(allUsers.filter((u) => u.role === 'counsellor'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalTask) return;
    await FollowUpService.updateTaskStatus(
      completeModalTask.id,
      'Completed',
      outcome,
      completionNotes
    );
    setCompleteModalTask(null);
    setCompletionNotes('');
    await loadData();
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalTask) return;
    await FollowUpService.rescheduleTask(
      rescheduleModalTask.id,
      newDate,
      newTime,
      rescheduleNotes
    );
    setRescheduleModalTask(null);
    setRescheduleNotes('');
    await loadData();
  };

  const handleOverridePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalTask) return;
    if (!overrideReasonText || overrideReasonText.trim().length < 5) {
      setOverrideError('A substantive explanation (min 5 characters) is required to override automated prioritization.');
      return;
    }

    await FollowUpService.overrideTaskPriority(
      overrideModalTask.id,
      targetPriority,
      overrideReasonText.trim(),
      'Staff Counsellor'
    );
    setOverrideModalTask(null);
    setOverrideReasonText('');
    setOverrideError('');
    await loadData();
  };

  const handleOpenAudit = async (task: FollowUpTask) => {
    setAuditModalTask(task);
    setAuditLoading(true);
    try {
      const logs = await FollowUpService.getTaskAuditTrail(task.id);
      setAuditTrail(logs);
    } finally {
      setAuditLoading(false);
    }
  };

  const toggleReasons = (id: string) => {
    setExpandedReasons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Group tasks into buckets
  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = tasks.filter((t) => t.isOverdue || t.status === 'Overdue' || (t.status === 'Pending' && t.scheduledDate < todayStr));
  const todayTasks = tasks.filter((t) => t.isDueToday || (t.status === 'Pending' && t.scheduledDate === todayStr));
  const upcomingTasks = tasks.filter((t) => t.status === 'Pending' && t.scheduledDate > todayStr);
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  const getFilteredList = () => {
    let list: FollowUpTask[] = [];
    if (activeSegment === 'today') list = todayTasks;
    else if (activeSegment === 'overdue') list = overdueTasks;
    else if (activeSegment === 'upcoming') list = upcomingTasks;
    else if (activeSegment === 'completed') list = completedTasks;
    else list = tasks;

    if (filterCounsellor) {
      list = list.filter((t) => t.counsellorId === filterCounsellor);
    }
    if (filterChannel) {
      list = list.filter((t) => t.channel === filterChannel);
    }
    if (filterPriority) {
      list = list.filter((t) => t.priority.toLowerCase() === filterPriority.toLowerCase());
    }
    return list;
  };

  const currentList = getFilteredList();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Follow-Up Prioritization Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Deterministic v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operational urgency scoring separating ML conversion propensity from immediate task deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/enquiries')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Callback</span>
          </button>
        </div>
      </div>

      {/* Ethical Governance Notice */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <span className="font-bold">Ethical & Safety Guardrails Active: </span>
          The Prioritization Engine optimizes counsellor contact queues only. It strictly does not automate admission decisions, does not use sensitive demographic/personal attributes, and permits counsellors to override rankings with mandatory audit documentation.
        </div>
      </div>

      {/* Operational Metric Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveSegment('today')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeSegment === 'today'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
              : 'bg-white text-slate-800 border-slate-200/90 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
            <Clock className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl font-black">{todayTasks.length}</div>
          <p className={`text-[11px] mt-0.5 ${activeSegment === 'today' ? 'text-indigo-100' : 'text-slate-400'}`}>
            Immediate action today
          </p>
        </button>

        <button
          onClick={() => setActiveSegment('overdue')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeSegment === 'overdue'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/25'
              : 'bg-white text-slate-800 border-slate-200/90 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Tasks</span>
            <AlertCircle className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl font-black">{overdueTasks.length}</div>
          <p className={`text-[11px] mt-0.5 ${activeSegment === 'overdue' ? 'text-rose-100' : 'text-rose-600 font-semibold'}`}>
            High operational urgency
          </p>
        </button>

        <button
          onClick={() => setActiveSegment('upcoming')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeSegment === 'upcoming'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
              : 'bg-white text-slate-800 border-slate-200/90 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Cadence</span>
            <Calendar className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl font-black">{upcomingTasks.length}</div>
          <p className={`text-[11px] mt-0.5 ${activeSegment === 'upcoming' ? 'text-indigo-100' : 'text-slate-400'}`}>
            Scheduled next 7 days
          </p>
        </button>

        <button
          onClick={() => setActiveSegment('completed')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeSegment === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
              : 'bg-white text-slate-800 border-slate-200/90 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl font-black">{completedTasks.length}</div>
          <p className={`text-[11px] mt-0.5 ${activeSegment === 'completed' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Logged & resolved
          </p>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterCounsellor}
            onChange={(e) => setFilterCounsellor(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Counsellors</option>
            {counsellors.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Channels</option>
            <option value="Phone Call">Phone Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Campus Visit">Campus Visit</option>
            <option value="Virtual Counselling">Virtual Counselling</option>
            <option value="Email">Email</option>
          </select>
        </div>

        <span className="text-slate-400 font-medium">
          Showing <strong>{currentList.length}</strong> tasks in queue
        </span>
      </div>

      {/* Tasks Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            Evaluating operational prioritization queue...
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">No tasks in this category</p>
            <p className="text-xs mt-1">Select another tab or schedule a callback from the enquiry list.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentList.map((task) => {
              const isOverdue = task.isOverdue || task.status === 'Overdue' || (task.status === 'Pending' && task.scheduledDate < todayStr);
              const isDueToday = task.isDueToday || (task.status === 'Pending' && task.scheduledDate === todayStr);

              return (
                <div
                  key={task.id}
                  className={`p-5 transition-colors flex flex-col gap-3 ${
                    isOverdue ? 'bg-rose-50/25 hover:bg-rose-50/50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Name, Badges, Timestamps */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900 text-sm md:text-base">
                          {task.studentName}
                        </span>

                        {/* Operational Priority */}
                        <PriorityBadge priority={task.priority} size="sm" />

                        {/* ML Conversion Propensity Separator */}
                        {task.conversionProbability !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            ML Propensity: {task.conversionProbability}%
                          </span>
                        )}

                        {/* Overdue / Due Today alerts */}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Overdue {task.daysOverdue ? `(${task.daysOverdue}d)` : ''}
                          </span>
                        )}
                        {isDueToday && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Due Today
                          </span>
                        )}

                        {/* Override Indicator */}
                        {task.isOverridden && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            <SlidersHorizontal className="w-3 h-3 text-purple-500" />
                            Counsellor Override
                          </span>
                        )}

                        <ChannelBadge channel={task.channel} />

                        <span className="text-xs text-slate-400 font-mono ml-auto">
                          📅 {task.scheduledDate} at {task.scheduledTime}
                        </span>
                      </div>

                      {/* Course & Counsellor line */}
                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-800 font-semibold">{task.courseInterested}</strong> • Counsellor: {task.counsellorName || 'Unassigned'}
                      </p>

                      {/* Deterministic Recommended Action Banner */}
                      {task.recommendedAction && (
                        <div className="bg-indigo-50/60 border border-indigo-100/90 rounded-xl p-2.5 flex items-start gap-2 text-xs text-indigo-900">
                          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Recommended Action: </span>
                            {task.recommendedAction}
                          </div>
                        </div>
                      )}

                      {/* Notes / Reason toggle */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex-1">
                          {task.notes}
                        </p>

                        {task.priorityReasons && task.priorityReasons.length > 0 && (
                          <button
                            onClick={() => toggleReasons(task.id)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <span>{expandedReasons[task.id] ? 'Hide Priority Drivers' : 'Why this priority?'}</span>
                            {expandedReasons[task.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Expandable Transparent Priority Reasons */}
                      {expandedReasons[task.id] && task.priorityReasons && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5 animate-fadeIn">
                          <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center justify-between">
                            <span>Deterministic Priority Calculation Breakdown:</span>
                            {task.operationalScore !== undefined && (
                              <span className="font-mono text-indigo-600">Urgency Score: {task.operationalScore}/100</span>
                            )}
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                            {task.priorityReasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                          {task.overrideReason && (
                            <p className="text-[11px] font-medium text-purple-700 border-t border-slate-200/60 pt-1.5 mt-1.5">
                              Override Justification: "{task.overrideReason}" by {task.overriddenByName || 'Counsellor'}
                            </p>
                          )}
                        </div>
                      )}

                      {task.outcome && (
                        <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Outcome Recorded: {task.outcome}
                        </div>
                      )}
                    </div>

                    {/* Task Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center mt-2 md:mt-0">
                      {task.status !== 'Completed' && (
                        <>
                          <button
                            onClick={() => setCompleteModalTask(task)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Log Result</span>
                          </button>

                          <button
                            onClick={() => {
                              setOverrideModalTask(task);
                              setTargetPriority(task.priority);
                              setOverrideReasonText('');
                              setOverrideError('');
                            }}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            title="Override engine priority with mandatory reason"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                            <span>Override</span>
                          </button>

                          <button
                            onClick={() => setRescheduleModalTask(task)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reschedule</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleOpenAudit(task)}
                        className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs transition-colors"
                        title="View Priority Audit History"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/enquiries/${task.enquiryId}`)}
                        className="p-2 border border-slate-200 hover:border-indigo-400 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white text-xs transition-colors"
                        title="View Student Dossier"
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

      {/* Modal: Mark Complete */}
      <Modal
        isOpen={!!completeModalTask}
        onClose={() => setCompleteModalTask(null)}
        title="Complete Follow-Up Touchpoint"
        subtitle={`Candidate: ${completeModalTask?.studentName}`}
      >
        <form onSubmit={handleMarkComplete} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Call Disposition Result *
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
              <option value="Enrolled / Paid Application Fee">Enrolled / Paid Fee</option>
              <option value="Not Reachable">Not Reachable</option>
              <option value="Follow Up Tomorrow">Follow Up Tomorrow</option>
              <option value="Joined Another Institution">Joined Another Institution</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Call Discussion Notes
            </label>
            <textarea
              rows={3}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Candidate requested syllabus details; willing to confirm seat by Friday..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCompleteModalTask(null)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Disposition
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Manual Priority Override */}
      <Modal
        isOpen={!!overrideModalTask}
        onClose={() => setOverrideModalTask(null)}
        title="Override Follow-Up Priority"
        subtitle={`Candidate: ${overrideModalTask?.studentName} • Current Priority: ${overrideModalTask?.priority}`}
      >
        <form onSubmit={handleOverridePriority} className="space-y-4">
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900">
            <span className="font-bold">Counsellor Override Policy: </span>
            You are overriding the engine's automated urgency. An immutable audit record will log your identity, timestamp, and provided explanation.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Priority Level *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Urgent', 'High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTargetPriority(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    targetPriority === p
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Substantive Justification / Override Reason *
            </label>
            <textarea
              rows={3}
              value={overrideReasonText}
              onChange={(e) => {
                setOverrideReasonText(e.target.value);
                setOverrideError('');
              }}
              placeholder="e.g. Student walked into campus admissions office with parents unexpectedly; requested immediate counselling session."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-purple-500"
              required
            />
            {overrideError && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{overrideError}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOverrideModalTask(null)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Confirm Override & Log Audit
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Audit Trail */}
      <Modal
        isOpen={!!auditModalTask}
        onClose={() => setAuditModalTask(null)}
        title="Prioritization Audit & History"
        subtitle={`Candidate: ${auditModalTask?.studentName} • Task ID: ${auditModalTask?.id}`}
      >
        <div className="space-y-4">
          <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Evaluation Engine:</span>
              <span className="font-mono font-semibold text-slate-800">PriorityEngine-v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ML Model Version:</span>
              <span className="font-mono font-semibold text-slate-800">{auditModalTask?.modelVersion || 'admission_model_v1.0.0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ML Conversion Propensity:</span>
              <span className="font-semibold text-indigo-600">{auditModalTask?.conversionProbability !== undefined ? `${auditModalTask.conversionProbability}%` : 'N/A'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Audit Event Log
            </h4>
            {auditLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading audit log...</p>
            ) : auditTrail.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                Initial engine evaluation logged at task schedule creation. No manual overrides yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {auditTrail.map((log) => (
                  <div key={log.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Priority: <span className="line-through text-slate-400">{log.previousPriority || 'N/A'}</span> → <strong className="text-purple-700">{log.newPriority}</strong> by {log.changedByName}
                    </div>
                    {log.overrideReason && (
                      <p className="text-slate-500 italic text-[11px] bg-slate-50 p-1.5 rounded">
                        "{log.overrideReason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setAuditModalTask(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Reschedule */}
      <Modal
        isOpen={!!rescheduleModalTask}
        onClose={() => setRescheduleModalTask(null)}
        title="Reschedule Follow-Up Task"
        subtitle={`Candidate: ${rescheduleModalTask?.studentName}`}
      >
        <form onSubmit={handleReschedule} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Target Date *
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Slot *
              </label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="09:30 AM">09:30 AM - Morning Slot</option>
                <option value="11:00 AM">11:00 AM - Late Morning</option>
                <option value="02:30 PM">02:30 PM - Afternoon</option>
                <option value="04:30 PM">04:30 PM - Evening Callback</option>
                <option value="06:30 PM">06:30 PM - Post-College Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reschedule Context Note
            </label>
            <textarea
              rows={2}
              value={rescheduleNotes}
              onChange={(e) => setRescheduleNotes(e.target.value)}
              placeholder="Candidate attending school exams; requested callback after 4 PM."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRescheduleModalTask(null)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Update Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
