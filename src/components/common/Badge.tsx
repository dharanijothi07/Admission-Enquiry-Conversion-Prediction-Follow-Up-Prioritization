import React from 'react';
import { PriorityTier } from '../../types/prediction';
import { EnquiryStatus } from '../../types/enquiry';
import { FollowUpChannel, FollowUpStatus } from '../../types/followUp';

interface PriorityBadgeProps {
  priority: PriorityTier;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  switch (priority) {
    case 'Urgent':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 ${sizeClasses[size]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Urgent Follow-up
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 ${sizeClasses[size]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          High Priority
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 ${sizeClasses[size]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 ${sizeClasses[size]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Low
        </span>
      );
  }
};

interface StatusBadgeProps {
  status: EnquiryStatus | FollowUpStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs font-medium'
  };

  const getStyle = () => {
    switch (status) {
      case 'Converted':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Application Submitted':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Campus Visit Scheduled':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Discussion':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'Lost':
      case 'Cancelled':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'New':
      default:
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${getStyle()} ${sizeClasses[size]}`}>
      {status}
    </span>
  );
};

export const ChannelBadge: React.FC<{ channel: FollowUpChannel }> = ({ channel }) => {
  const getColors = () => {
    switch (channel) {
      case 'Phone Call':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'WhatsApp':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Campus Visit':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Email':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Virtual Counselling':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${getColors()}`}>
      {channel}
    </span>
  );
};
