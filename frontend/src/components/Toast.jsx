import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type = 'success', message } = toast;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 text-white shadow-emerald-500/20';
      case 'error':
        return 'bg-rose-600 text-white shadow-rose-500/20';
      case 'info':
      default:
        return 'bg-blue-600 text-white shadow-blue-500/20';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 flex-shrink-0" />;
      case 'error': return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
      default: return <Info className="w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl max-w-md ${getStyle()}`}>
        {getIcon()}
        <span className="text-sm font-medium pr-2">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors ml-auto text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
