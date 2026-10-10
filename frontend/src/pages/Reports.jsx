import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Wrench, 
  Users, 
  CreditCard,
  Filter,
  ArrowDownToLine
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-31');
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [activeTab, fromDate, toDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      const params = { from: fromDate, to: toDate };
      switch (activeTab) {
        case 'revenue':
          res = await reportAPI.getRevenueReport(params);
          break;
        case 'bookings':
          res = await reportAPI.getBookingsReport(params);
          break;
        case 'services':
          res = await reportAPI.getServicesReport(params);
          break;
        case 'mechanics':
          res = await reportAPI.getMechanicsReport(params);
          break;
        case 'customers':
          res = await reportAPI.getCustomersReport(params);
          break;
        default:
          res = await reportAPI.getRevenueReport(params);
      }
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2563eb', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      {/* Header & Date Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Analytics & Reports Suite
          </h2>
          <p className="text-xs text-slate-500">Comprehensive Recharts diagnostics and financial breakdown.</p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 px-2 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filter Range:
          </div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
          />
          <span className="text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
          />
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'revenue', label: 'Revenue Report', icon: TrendingUp },
          { key: 'bookings', label: 'Bookings Analysis', icon: Calendar },
          { key: 'services', label: 'Service Breakdown', icon: Wrench },
          { key: 'mechanics', label: 'Technician Performance', icon: Users },
          { key: 'customers', label: 'Top Customers', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content Body */}
      {loading ? (
        <LoadingSpinner text="Generating Recharts analytics from MySQL database..." />
      ) : (
        <div className="space-y-6">
          {/* TAB 1: REVENUE REPORT */}
          {activeTab === 'revenue' && reportData && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl text-white shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">Total Period Revenue</div>
                  <div className="text-3xl font-black mt-1">
                    ₹ {reportData.grandTotal?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Daily Revenue Flow (₹)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.dailyRevenue || []}>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip formatter={(val) => [`₹ ${Number(val).toLocaleString('en-IN')}`, 'Revenue']} />
                        <Line type="monotone" dataKey="total_revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Payment Methods Breakdown</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.paymentMethodBreakdown || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                        >
                          {(reportData.paymentMethodBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(reportData.paymentMethodBreakdown || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-900">₹{Number(item.value).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS ANALYSIS */}
          {activeTab === 'bookings' && reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Daily Booking Volume</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.dailyBookings || []}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="total_bookings" fill="#2563eb" name="Total Bookings" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed_bookings" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Booking Status Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.statusBreakdown || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                      >
                        {(reportData.statusBreakdown || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES REPORT */}
          {activeTab === 'services' && reportData && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Service Category Revenue & Volume</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Service Type</th>
                      <th className="py-3 px-4">Total Done</th>
                      <th className="py-3 px-4">Parts Revenue</th>
                      <th className="py-3 px-4">Labor Revenue</th>
                      <th className="py-3 px-4">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(reportData.serviceTypes || []).map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-800">{st.name}</td>
                        <td className="py-3 px-4 font-bold text-blue-600">{st.total_services}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">₹{Number(st.total_parts_cost).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">₹{Number(st.total_labor_cost).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-600 text-sm">
                          ₹{Number(st.total_revenue).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MECHANICS REPORT */}
          {activeTab === 'mechanics' && reportData && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Technician Productivity Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Mechanic</th>
                      <th className="py-3 px-4">Specialization</th>
                      <th className="py-3 px-4">Assigned Jobs</th>
                      <th className="py-3 px-4">Completed Jobs</th>
                      <th className="py-3 px-4">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(reportData.mechanicPerformance || []).map((m) => (
                      <tr key={m.mechanic_id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-800">{m.name}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-600">{m.specialization}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{m.total_assigned}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{m.total_completed}</td>
                        <td className="py-3 px-4 font-mono font-black text-slate-900">
                          ₹{Number(m.revenue_generated).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS REPORT */}
          {activeTab === 'customers' && reportData && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Top 10 High-Value Customers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Vehicles</th>
                      <th className="py-3 px-4">Bookings Count</th>
                      <th className="py-3 px-4">Total Amount Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(reportData.topCustomers || []).map((c) => (
                      <tr key={c.customer_id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.email}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{c.total_vehicles}</td>
                        <td className="py-3 px-4 font-bold text-blue-600">{c.total_bookings}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-600 text-sm">
                          ₹{Number(c.total_spent).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
