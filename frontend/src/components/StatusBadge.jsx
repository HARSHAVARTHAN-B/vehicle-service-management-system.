import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = (val) => {
    switch (val) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20 dot-amber';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20 dot-blue';
      case 'In Progress':
      case 'InProgress':
      case 'Busy':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20 dot-purple';
      case 'Completed':
      case 'Paid':
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20 dot-emerald';
      case 'Cancelled':
      case 'Failed':
      case 'Inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20 dot-rose';
      case 'Refunded':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20 dot-orange';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dot-slate';
    }
  };

  const getEmoji = (val) => {
    switch (val) {
      case 'Pending': return '🟡';
      case 'Confirmed': return '🔵';
      case 'In Progress':
      case 'InProgress':
      case 'Busy': return '🟣';
      case 'Completed':
      case 'Paid':
      case 'Available': return '🟢';
      case 'Cancelled':
      case 'Failed':
      case 'Inactive': return '🔴';
      case 'Refunded': return '🟠';
      default: return '⚪';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(status)} shadow-sm`}>
      <span className="text-[10px] leading-none">{getEmoji(status)}</span>
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
