import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { 
  Users, 
  Car, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  TrendingUp, 
  Wrench,
  ArrowUpRight
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
  Cell 
} from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching live dashboard metrics from MySQL..." />;

  if (error) {
    return (
      <div className="p-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <h3 className="font-bold text-lg">Unable to connect to server</h3>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const {
    totalCustomers,
    totalVehicles,
    todayBookings,
    pendingServices,
    completedServices,
    totalRevenue,
    bookingStats,
    monthlyRevenue,
    popularServices,
    recentBookings
  } = data;

  const pieData = [
    { name: 'Pending', value: bookingStats?.Pending || 0, color: '#f59e0b' },
    { name: 'Confirmed', value: bookingStats?.Confirmed || 0, color: '#3b82f6' },
    { name: 'In Progress', value: bookingStats?.InProgress || 0, color: '#a855f7' },
    { name: 'Completed', value: bookingStats?.Completed || 0, color: '#10b981' },
    { name: 'Cancelled', value: bookingStats?.Cancelled || 0, color: '#ef4444' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/15">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
            Live Overview
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2">
            AutoCare Pro Service Hub
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Real-time MySQL business performance & operational diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-right">
            <div className="text-[10px] text-blue-200 uppercase font-bold">Total Revenue</div>
            <div className="text-xl font-black text-white flex items-center justify-end">
              ₹ {totalRevenue?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCustomers}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Customers</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
            <Car className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalVehicles}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Vehicles</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{todayBookings}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Today Bookings</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingServices}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Pending Services</div>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedServices}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Completed Services</div>
        </div>

        {/* Card 6 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-slate-900 truncate">
            ₹{totalRevenue >= 100000 ? `${(totalRevenue / 100000).toFixed(2)}L` : totalRevenue}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Revenue</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-500">Revenue in ₹ from completed paid services</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue || []}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Booking Status Ratio</h3>
            <p className="text-xs text-slate-500">Distribution of service requests</p>
          </div>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 font-medium">{item.name}:</span>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Services & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Services Frequency */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" /> Popular Services
            </h3>
            <span className="text-xs font-semibold text-slate-400">Top 5</span>
          </div>

          <div className="space-y-3">
            {popularServices?.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{item.name}</div>
                  <div className="text-[11px] text-slate-500">{item.count} Bookings completed</div>
                </div>
                <div className="text-xs font-bold text-emerald-600">
                  ₹{Number(item.revenue).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">Recent Service Bookings</h3>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 cursor-pointer">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Booking ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Vehicle</th>
                  <th className="py-2.5">Service</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings?.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50/80">
                    <td className="py-3 font-mono font-bold text-blue-600">{b.booking_id}</td>
                    <td className="py-3 font-semibold text-slate-800">{b.customer_name}</td>
                    <td className="py-3 font-mono text-slate-600">{b.registration_number}</td>
                    <td className="py-3 font-medium text-slate-700">{b.service_type}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
