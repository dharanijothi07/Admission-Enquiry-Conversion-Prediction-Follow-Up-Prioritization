import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Trash2,
  Download,
  Sparkles,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { EnquiryService } from '../services/enquiryService';
import { AdmissionEnquiry, EnquiryFilterState } from '../types/enquiry';

export const EnquiryList: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<EnquiryFilterState>({
    searchQuery: '',
    program: '',
    status: '',
    priority: '',
    leadSource: '',
    counsellorId: '',
    minProbability: 0
  });

  // Sorting
  const [sortBy, setSortBy] = useState<'probability' | 'name' | 'date'>('probability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await EnquiryService.getAllEnquiries();
      setEnquiries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete enquiry for student ${name}?`)) {
      await EnquiryService.deleteEnquiry(id);
      await loadEnquiries();
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      program: '',
      status: '',
      priority: '',
      leadSource: '',
      counsellorId: '',
      minProbability: 0
    });
  };

  // Filtered & Sorted items
  const filtered = EnquiryService.filterEnquiries(enquiries, filters);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'probability') {
      const diff = b.prediction.probabilityPercentage - a.prediction.probabilityPercentage;
      return sortOrder === 'desc' ? diff : -diff;
    }
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.studentName.localeCompare(b.studentName)
        : b.studentName.localeCompare(a.studentName);
    }
    // date
    return sortOrder === 'desc'
      ? new Date(b.enquiryDate).getTime() - new Date(a.enquiryDate).getTime()
      : new Date(a.enquiryDate).getTime() - new Date(b.enquiryDate).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admission Enquiry Bank
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized candidate directory evaluated by XGBoost conversion model
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/enquiries/new')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Enquiry</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by student name, application ID, city, phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Lifecycle Statuses</option>
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

        {/* Second Row Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by:
            </span>

            {/* Min score pill */}
            <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-lg">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span className="text-[11px] text-slate-600">Min Prob:</span>
              <select
                value={filters.minProbability}
                onChange={(e) => setFilters({ ...filters, minProbability: Number(e.target.value) })}
                className="bg-transparent font-bold text-indigo-700 text-[11px] focus:outline-hidden"
              >
                <option value={0}>Any Score</option>
                <option value={50}>≥ 50%</option>
                <option value={75}>≥ 75% High Intent</option>
                <option value={85}>≥ 85% Urgent</option>
              </select>
            </div>

            {/* Lead Source */}
            <select
              value={filters.leadSource}
              onChange={(e) => setFilters({ ...filters, leadSource: e.target.value })}
              className="bg-slate-100 border-none rounded-lg px-2.5 py-1 text-slate-700 text-[11px] font-medium"
            >
              <option value="">All Sources</option>
              <option value="Walk-in / Campus Visit">Walk-in / Campus Visit</option>
              <option value="Website Form">Website Form</option>
              <option value="Alumni Referral">Alumni Referral</option>
              <option value="Google Search Ads">Google Search Ads</option>
              <option value="Education Fair / Expo">Education Fair</option>
              <option value="Social Media (Instagram/LinkedIn)">Social Media</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Sort controls */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="font-semibold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="probability">AI Probability</option>
              <option value="name">Candidate Name</option>
              <option value="date">Enquiry Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-slate-500 hover:text-indigo-600 rounded bg-slate-100"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            Loading candidates...
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="font-semibold text-slate-700">No matching enquiries found</p>
            <p className="text-xs mt-1">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Candidate & App ID</th>
                  <th className="py-3.5 px-4">Program & Academics</th>
                  <th className="py-3.5 px-4">Source & City</th>
                  <th className="py-3.5 px-4">Assigned Counsellor</th>
                  <th className="py-3.5 px-4">AI Score</th>
                  <th className="py-3.5 px-4">Priority Tier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="hover:bg-indigo-50/20 transition-colors group"
                  >
                    {/* Candidate */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {enquiry.studentName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {enquiry.applicationNo} • {enquiry.phone}
                      </div>
                    </td>

                    {/* Program */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {enquiry.program}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        12th / UG: <span className="font-bold text-slate-700">{enquiry.percentageScore}%</span>
                        {enquiry.mathsPhysicsScore ? ` (PCM: ${enquiry.mathsPhysicsScore}%)` : ''}
                      </div>
                    </td>

                    {/* Source & Location */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{enquiry.leadSource}</div>
                      <div className="text-[11px] text-slate-400">{enquiry.city}, {enquiry.state}</div>
                    </td>

                    {/* Counsellor */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{enquiry.counsellorName}</div>
                      <div className="text-[10px] text-slate-400">
                        Last talk: {enquiry.lastContactedDate || 'Pending initial call'}
                      </div>
                    </td>

                    {/* Conversion Probability */}
                    <td className="py-3.5 px-4">
                      <ScoreGauge score={enquiry.prediction.probabilityPercentage} size="sm" />
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={enquiry.priorityTier} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={enquiry.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => navigate(`/enquiries/${enquiry.id}`)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors"
                          title="View Full Details & AI Insights"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(enquiry.id, enquiry.studentName)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing <strong>{sorted.length}</strong> enquiries</span>
          <span className="text-[11px] text-slate-400">
            Predictions computed on submission via simulated tree-based heuristics
          </span>
        </div>
      </div>
    </div>
  );
};
