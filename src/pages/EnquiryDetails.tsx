import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  CalendarPlus,
  PhoneCall,
  Mail,
  MapPin,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  History,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  FileText
} from 'lucide-react';
import { EnquiryService } from '../services/enquiryService';
import { FollowUpService } from '../services/followUpService';
import { PriorityBadge, StatusBadge, ChannelBadge } from '../components/common/Badge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { FeatureContributionBar } from '../components/ml/FeatureContributionBar';
import { Modal } from '../components/common/Modal';
import { AdmissionEnquiry, EnquiryStatus } from '../types/enquiry';
import { FollowUpChannel, CallDisposition } from '../types/followUp';

export const EnquiryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'prediction' | 'timeline'>('overview');

  // Modal states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLogInteractionOpen, setIsLogInteractionOpen] = useState(false);

  // New Follow-up state
  const [scheduledDate, setScheduledDate] = useState('2026-10-24');
  const [scheduledTime, setScheduledTime] = useState('11:00 AM');
  const [channel, setChannel] = useState<FollowUpChannel>('Phone Call');
  const [taskNotes, setTaskNotes] = useState('');

  // Log interaction state
  const [interactionType, setInteractionType] = useState<'Call' | 'WhatsApp' | 'Campus Visit' | 'Email'>('Call');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [interactionOutcome, setInteractionOutcome] = useState<CallDisposition>('Interested - Requested Prospectus');

  const loadEnquiry = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await EnquiryService.getEnquiryById(id);
      setEnquiry(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiry();
  }, [id]);

  const handleStageChange = async (newStatus: EnquiryStatus) => {
    if (!enquiry) return;
    const updated = await EnquiryService.updateEnquiry(enquiry.id, { status: newStatus });
    if (updated) {
      setEnquiry(updated);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry) return;

    await FollowUpService.createTask({
      enquiryId: enquiry.id,
      studentName: enquiry.studentName,
      courseInterested: enquiry.program,
      counsellorId: enquiry.counsellorId,
      counsellorName: enquiry.counsellorName,
      scheduledDate,
      scheduledTime,
      channel,
      status: 'Pending',
      priority: enquiry.priorityTier,
      notes: taskNotes
    });

    setIsScheduleOpen(false);
    setTaskNotes('');
    await loadEnquiry();
  };

  const handleLogInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry) return;

    await EnquiryService.addInteraction(enquiry.id, {
      counsellorName: enquiry.counsellorName,
      type: interactionType,
      notes: interactionNotes,
      outcome: interactionOutcome
    });

    setIsLogInteractionOpen(false);
    setInteractionNotes('');
    await loadEnquiry();
  };

  if (loading || !enquiry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { prediction } = enquiry;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/enquiries')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {enquiry.studentName}
              </h1>
              <StatusBadge status={enquiry.status} size="sm" />
              <PriorityBadge priority={enquiry.priorityTier} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              App #{enquiry.applicationNo} • Inquired on {enquiry.enquiryDate} • Assigned to: {enquiry.counsellorName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-indigo-400 text-xs font-semibold text-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
          >
            <CalendarPlus className="w-4 h-4 text-indigo-600" />
            <span>Schedule Follow-Up</span>
          </button>
          <button
            onClick={() => setIsLogInteractionOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-emerald-400 text-xs font-semibold text-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Log Call Note</span>
          </button>
          <button
            onClick={() => navigate(`/enquiries/edit/${enquiry.id}`)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/30 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Dossier</span>
          </button>
        </div>
      </div>

      {/* Hero Conversion Intelligence Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <ScoreGauge score={prediction.probabilityPercentage} size="lg" showLabel={false} />
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Conversion Probability Score
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700/40">
                {prediction.modelVersion}
              </span>
            </div>
            <h3 className="text-xl font-black text-white">
              {prediction.probabilityPercentage}% Likelihood to Enroll
            </h3>
            <p className="text-xs text-indigo-200/90 mt-1 max-w-xl leading-relaxed">
              <strong>Recommendation:</strong> {prediction.recommendedAction}
            </p>
          </div>
        </div>

        {/* Quick Lifecycle Stage Mover */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shrink-0 text-xs">
          <p className="text-indigo-200 font-semibold mb-2 text-[11px] uppercase tracking-wider">
            Quick Stage Progression:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(['In Discussion', 'Campus Visit Scheduled', 'Application Submitted', 'Converted'] as EnquiryStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleStageChange(st)}
                disabled={enquiry.status === st}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  enquiry.status === st
                    ? 'bg-emerald-500 text-white font-bold cursor-default'
                    : 'bg-white/10 hover:bg-white/20 text-indigo-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Dossier</span>
        </button>

        <button
          onClick={() => setActiveTab('prediction')}
          className={`pb-3 font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'prediction'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-indigo-600" />
          <span>Explainable AI Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Interactions & Call Logs ({enquiry.interactions.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Academic Qualifications & Program Details
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Interested Program</span>
                  <span className="font-bold text-slate-800">{enquiry.program}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Qualifying Examination</span>
                  <span className="font-bold text-slate-800">{enquiry.qualifyingExam}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Percentage Marks</span>
                  <span className="font-bold text-indigo-700 text-sm">{enquiry.percentageScore}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Maths & Physics Cutoff</span>
                  <span className="font-bold text-slate-800">
                    {enquiry.mathsPhysicsScore ? `${enquiry.mathsPhysicsScore}%` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Entrance Percentile</span>
                  <span className="font-bold text-slate-800">
                    {enquiry.entranceExamPercentile ? `${enquiry.entranceExamPercentile} %ile` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Quota / Category</span>
                  <span className="font-bold text-slate-800">{enquiry.category}</span>
                </div>
              </div>
            </div>

            {/* Telemetry & Logistics */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Logistics & Telemetry Engagement
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Campus Hostel</span>
                  <span className="font-semibold text-slate-800">
                    {enquiry.hostelRequired ? 'Hostel Needed' : 'Day Scholar'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Parent Accompanied</span>
                  <span className="font-semibold text-slate-800">
                    {enquiry.parentAccompanied ? 'Yes (High Intent)' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Campus Visit Status</span>
                  <span className="font-semibold text-slate-800">
                    {enquiry.campusVisitAttended ? 'Attended Walk-in' : 'Pending Visit'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Brochure Download</span>
                  <span className="font-semibold text-slate-800">
                    {enquiry.brochureDownloaded ? 'Downloaded' : 'Not Downloaded'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Digital Engagement Score</span>
                  <span className="font-bold text-emerald-600">{enquiry.engagementScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Budget Preference</span>
                  <span className="font-semibold text-slate-800">{enquiry.budgetRange}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Contact Information
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-3">
                  <PhoneCall className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <a href={`tel:${enquiry.phone}`} className="font-bold text-indigo-600 hover:underline">
                      {enquiry.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <a href={`mailto:${enquiry.email}`} className="font-medium text-slate-800 hover:underline">
                      {enquiry.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location</span>
                    <span className="font-medium text-slate-800">
                      {enquiry.city}, {enquiry.state}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Acquisition Channel
                </span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  {enquiry.leadSource}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Explainable AI Insights */}
      {activeTab === 'prediction' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  TreeSHAP Feature Attributions
                </h3>
                <p className="text-xs text-slate-500">
                  Deconstruction of positive and negative drivers influencing candidate conversion odds
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%
              </span>
            </div>

            <FeatureContributionBar drivers={prediction.topDrivers} />
          </div>

          {/* Risk Factors */}
          {prediction.riskFactors.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl">
              <h4 className="font-bold text-rose-800 text-sm flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Conversion Risk Flags Detected
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-700">
                {prediction.riskFactors.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Timeline & Interactions */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Counselling Interaction History
              </h3>
              <p className="text-xs text-slate-500">
                Chronological log of phone calls, campus visits, and status changes
              </p>
            </div>
            <button
              onClick={() => setIsLogInteractionOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              + Log Interaction
            </button>
          </div>

          {enquiry.interactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No interaction logs recorded yet. Click above to log the first phone call or visit.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-indigo-200 space-y-6">
              {enquiry.interactions.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white" />

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        {item.type} • {item.counsellorName}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{item.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.notes}
                    </p>

                    {item.outcome && (
                      <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Outcome: {item.outcome}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Schedule Follow-Up */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Follow-Up Task"
        subtitle={`Candidate: ${enquiry.studentName}`}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time Slot
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Communication Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as FollowUpChannel)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Phone Call">Phone Call</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Campus Visit">Campus Visit</option>
              <option value="Virtual Counselling">Virtual Counselling (Google Meet)</option>
              <option value="Email">Email</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Objective / Discussion Points
            </label>
            <textarea
              rows={3}
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="e.g. Explain hostel allocation and bus timings, confirm token payment date."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Add to Board
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Log Interaction */}
      <Modal
        isOpen={isLogInteractionOpen}
        onClose={() => setIsLogInteractionOpen(false)}
        title="Log Counselling Interaction"
        subtitle={`Candidate: ${enquiry.studentName}`}
      >
        <form onSubmit={handleLogInteractionSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Interaction Medium
              </label>
              <select
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Campus Visit">In-Person Campus Walk-in</option>
                <option value="Email">Email Communication</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Outcome Dispositiom
              </label>
              <select
                value={interactionOutcome}
                onChange={(e) => setInteractionOutcome(e.target.value as CallDisposition)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Interested - Requested Prospectus">Interested - Requested Prospectus</option>
                <option value="High Intent - Scheduling Campus Visit">Scheduling Campus Visit</option>
                <option value="Needs Parent Approval">Needs Parent Approval</option>
                <option value="Fee Scholarship Discussion">Fee Scholarship Discussion</option>
                <option value="Enrolled / Paid Application Fee">Enrolled / Paid Fee</option>
                <option value="Not Reachable">Not Reachable</option>
                <option value="Follow Up Tomorrow">Follow Up Tomorrow</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Discussion Summary
            </label>
            <textarea
              rows={3}
              value={interactionNotes}
              onChange={(e) => setInteractionNotes(e.target.value)}
              placeholder="Summary of conversation, questions raised by parents, next promised touchpoint..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogInteractionOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Interaction Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
