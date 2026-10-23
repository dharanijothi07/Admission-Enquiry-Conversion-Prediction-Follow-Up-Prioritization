import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserPlus,
  Save,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  HelpCircle
} from 'lucide-react';
import { EnquiryService } from '../services/enquiryService';
import { AuthService } from '../services/authService';
import { MLService } from '../services/mlService';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { PriorityBadge } from '../components/common/Badge';
import { FeatureContributionBar } from '../components/ml/FeatureContributionBar';
import { AcademicProgram, LeadSource, EnquiryStatus, AdmissionEnquiry } from '../types/enquiry';
import { User } from '../types/auth';

const PROGRAMS: AcademicProgram[] = [
  'B.Tech Artificial Intelligence & Data Science',
  'B.Tech Computer Science & Engineering',
  'B.Tech Information Technology',
  'B.Tech Electronics & Communication',
  'B.Tech Mechanical Engineering',
  'B.Sc Data Science & AI',
  'MCA - Cloud Computing',
  'MBA - Technology Management'
];

const SOURCES: LeadSource[] = [
  'Website Form',
  'Walk-in / Campus Visit',
  'Alumni Referral',
  'Education Fair / Expo',
  'Google Search Ads',
  'Social Media (Instagram/LinkedIn)',
  'School Outreach Program'
];

export const AddEditEnquiry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [counsellors, setCounsellors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    program: 'B.Tech Artificial Intelligence & Data Science' as AcademicProgram,
    leadSource: 'Website Form' as LeadSource,
    status: 'New' as EnquiryStatus,
    counsellorId: '',
    counsellorName: '',
    qualifyingExam: '12th Standard / HSC' as AdmissionEnquiry['qualifyingExam'],
    percentageScore: 85,
    mathsPhysicsScore: 88,
    entranceExamPercentile: 85,
    category: 'General' as AdmissionEnquiry['category'],
    budgetRange: '₹1.5L - ₹2.5L / year' as AdmissionEnquiry['budgetRange'],
    hostelRequired: true,
    busTransportRequired: false,
    enquiryDate: new Date().toISOString().split('T')[0],
    engagementScore: 70,
    brochureDownloaded: true,
    campusVisitAttended: false,
    parentAccompanied: false
  });

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const users = await AuthService.getAllUsers();
        const counsellorsList = users.filter((u) => u.role === 'counsellor');
        setCounsellors(counsellorsList);

        if (counsellorsList.length > 0 && !formData.counsellorId) {
          setFormData((prev) => ({
            ...prev,
            counsellorId: counsellorsList[0].id,
            counsellorName: counsellorsList[0].name
          }));
        }

        if (id) {
          const existing = await EnquiryService.getEnquiryById(id);
          if (existing) {
            setFormData({
              studentName: existing.studentName,
              email: existing.email,
              phone: existing.phone,
              city: existing.city,
              state: existing.state,
              program: existing.program,
              leadSource: existing.leadSource,
              status: existing.status,
              counsellorId: existing.counsellorId,
              counsellorName: existing.counsellorName,
              qualifyingExam: existing.qualifyingExam,
              percentageScore: existing.percentageScore,
              mathsPhysicsScore: existing.mathsPhysicsScore || 0,
              entranceExamPercentile: existing.entranceExamPercentile || 0,
              category: existing.category,
              budgetRange: existing.budgetRange,
              hostelRequired: existing.hostelRequired,
              busTransportRequired: existing.busTransportRequired,
              enquiryDate: existing.enquiryDate,
              engagementScore: existing.engagementScore,
              brochureDownloaded: existing.brochureDownloaded,
              campusVisitAttended: existing.campusVisitAttended,
              parentAccompanied: existing.parentAccompanied
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Live real-time ML score calculation based on current form inputs
  const livePrediction = MLService.predictConversion(formData as any);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.studentName.trim()) {
      errs.studentName = 'Student name is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid email is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errs.phone = 'Valid 10-digit mobile number is required';
    }
    if (formData.percentageScore < 35 || formData.percentageScore > 100) {
      errs.percentageScore = 'Marks must be between 35% and 100%';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await EnquiryService.updateEnquiry(id, formData);
        navigate(`/enquiries/${id}`);
      } else {
        const created = await EnquiryService.createEnquiry(formData as any);
        navigate(`/enquiries/${created.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCounsellorChange = (counsellorId: string) => {
    const selected = counsellors.find((c) => c.id === counsellorId);
    setFormData({
      ...formData,
      counsellorId,
      counsellorName: selected ? selected.name : ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/enquiries')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Edit Admission Enquiry' : 'Register New Admission Enquiry'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Input candidate academic credentials & telemetry for instant AI conversion scoring
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 Cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Section 1: Candidate Basic Information */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              1. Candidate Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="e.g. Sivaramakrishnan M"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 ${
                    errors.studentName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.studentName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.studentName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="siva.student@gmail.com"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98401 23456"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 ${
                    errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Coimbatore"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Tamil Nadu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Program & Cutoff Marks */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              2. Academic Credentials & Program Preference (ML Core Features)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Desired Degree Program *
                </label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value as AcademicProgram })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  12th / UG Percentage Marks (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="35"
                  max="100"
                  value={formData.percentageScore}
                  onChange={(e) => setFormData({ ...formData, percentageScore: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400">Higher percentage triggers scholarship eligibility</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Maths & Physics Cutoff Marks (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.mathsPhysicsScore}
                  onChange={(e) => setFormData({ ...formData, mathsPhysicsScore: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Lead Attribution Source *
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value as LeadSource })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Budget Capacity
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Under ₹1.5L / year">Under ₹1.5L / year (Loan/Scholarship needed)</option>
                  <option value="₹1.5L - ₹2.5L / year">₹1.5L - ₹2.5L / year (Standard Tuition)</option>
                  <option value="Above ₹2.5L / year">Above ₹2.5L / year (Premium/NRI)</option>
                  <option value="Seeking Scholarship">Seeking Full Merit Scholarship</option>
                </select>
              </div>
            </div>

            {/* Engagement & Campus Visit Checklist */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.campusVisitAttended}
                  onChange={(e) => setFormData({ ...formData, campusVisitAttended: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Campus Visit Attended
                </span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.parentAccompanied}
                  onChange={(e) => setFormData({ ...formData, parentAccompanied: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Parent / Guardian Accompanied
                </span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.brochureDownloaded}
                  onChange={(e) => setFormData({ ...formData, brochureDownloaded: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Curriculum Brochure Downloaded
                </span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hostelRequired}
                  onChange={(e) => setFormData({ ...formData, hostelRequired: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Campus Hostel Accommodation Needed
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Lifecycle & Assignment */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              3. Lifecycle Status & Counsellor Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Counsellor *
                </label>
                <select
                  value={formData.counsellorId}
                  onChange={(e) => handleCounsellorChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Enquiry Stage
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EnquiryStatus })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Campus Visit Scheduled">Campus Visit Scheduled</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/enquiries')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Evaluating & Saving...' : isEdit ? 'Update Enquiry' : 'Save & Calculate Score'}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Live AI Prediction Preview (Instant feedback while filling the form!) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-lg border border-indigo-900/60 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60 mb-4">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm tracking-tight text-white">
                  Live AI Lead Score Preview
                </h4>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real-time
              </span>
            </div>

            <div className="text-center py-4 bg-slate-800/40 rounded-xl border border-slate-700/50 mb-4">
              <div className="text-4xl font-black text-indigo-300 tracking-tight">
                {livePrediction.probabilityPercentage}%
              </div>
              <div className="text-xs text-indigo-200 mt-1 font-medium">
                Predicted Conversion Likelihood
              </div>
              <div className="mt-3">
                <PriorityBadge priority={livePrediction.priority} size="md" />
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-3 bg-indigo-900/40 rounded-xl border border-indigo-800/50 mb-4 text-xs text-indigo-200">
              <span className="font-bold text-white block mb-0.5">
                Recommended Action:
              </span>
              <span>{livePrediction.recommendedAction}</span>
            </div>

            {/* Dynamic SHAP Feature Drivers */}
            <div>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Top Factors Influencing This Score:
              </p>
              <div className="space-y-2">
                {livePrediction.topDrivers.map((d, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-[11px] flex items-center justify-between"
                  >
                    <span className="text-slate-300 truncate max-w-[180px]">
                      {d.featureName}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        d.weight > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {d.weight > 0 ? `+${(d.weight * 100).toFixed(0)}%` : `${(d.weight * 100).toFixed(0)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-900/60 text-[10px] text-indigo-400 leading-relaxed">
              Note: Model recalculates instantly as marks, campus visit status, and lead source change.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
