import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  Calendar, 
  ClipboardCheck, 
  CreditCard, 
  BarChart3 
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { label: 'Customers', path: '/customers', icon: Users, badge: null },
    { label: 'Vehicles', path: '/vehicles', icon: Car, badge: null },
    { label: 'Mechanics', path: '/mechanics', icon: Wrench, badge: null },
    { label: 'Bookings', path: '/bookings', icon: Calendar, badge: null },
    { label: 'Services', path: '/services', icon: ClipboardCheck, badge: null },
    { label: 'Payments', path: '/payments', icon: CreditCard, badge: null },
    { label: 'Reports', path: '/reports', icon: BarChart3, badge: null }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Management Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-2 mt-6">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          AutoCare Pro SaaS
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Connected to local MySQL Database <code className="text-blue-300 font-mono">autocare_db</code>.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
