import React from 'react';
import { Car, LogOut, UserCheck, ShieldCheck, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Car className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                AutoCare <span className="text-blue-600">Pro</span>
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                SaaS Edition
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              "Smart Service. Better Vehicles."
            </p>
          </div>
        </div>

        {/* Status indicator & User menu */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>MySQL Connected</span>
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    {user.name}
                    {user.role === 'admin' && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                    )}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 capitalize">
                    {user.role} Account
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
