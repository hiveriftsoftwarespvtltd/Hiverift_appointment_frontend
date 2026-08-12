import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Video,
  AlertCircle,
  TrendingUp,
  Mail,
  ChevronRight,
  Sparkles,
  Hourglass,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchStats = () => {
    setLoading(true);
    api
      .get('/admin/dashboard')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error('Error loading dashboard stats', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      await api.patch(`/admin/appointments/${appointmentId}/status`, {
        status: newStatus,
      });
      fetchStats();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const format12Hour = (time24) => {
    if (!time24) return '';
    let [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const mins = m < 10 ? '0' + m : m;
    return `${h}:${mins} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading && !stats) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#5B6472]">Loading Dashboard Overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#2578FB] animate-pulse" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] font-sans tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#5B6472] font-medium">
            Monitor appointments, approve pending requests, and join video meetings directly.
          </p>
        </div>

        <Link
          to="/admin/appointments"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-extrabold text-xs shadow-blue hover:scale-105 transition-all self-start sm:self-auto"
        >
          <span>Manage All Bookings</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metric Cards Grid (5 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Bookings */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex items-center justify-between hover:border-[#BFD8FF] transition-all group">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#5B6472] font-extrabold block uppercase tracking-wider">Total</span>
            <span className="text-2xl font-extrabold text-[#111827] block tracking-tight">
              {stats?.totalAppointments || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] border border-[#BFD8FF] flex items-center justify-center text-[#2578FB] shadow-xs group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex items-center justify-between hover:border-amber-300 transition-all group">
          <div className="space-y-0.5">
            <span className="text-[10px] text-amber-700 font-extrabold block uppercase tracking-wider">Pending</span>
            <span className="text-2xl font-extrabold text-amber-600 block tracking-tight">
              {stats?.pendingCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs group-hover:scale-110 transition-transform">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex items-center justify-between hover:border-emerald-300 transition-all group">
          <div className="space-y-0.5">
            <span className="text-[10px] text-emerald-700 font-extrabold block uppercase tracking-wider">Confirmed</span>
            <span className="text-2xl font-extrabold text-emerald-600 block tracking-tight">
              {stats?.confirmedCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex items-center justify-between hover:border-blue-300 transition-all group">
          <div className="space-y-0.5">
            <span className="text-[10px] text-blue-700 font-extrabold block uppercase tracking-wider">Completed</span>
            <span className="text-2xl font-extrabold text-blue-600 block tracking-tight">
              {stats?.completedCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Cancelled / No-Show */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex items-center justify-between hover:border-red-300 transition-all group">
          <div className="space-y-0.5">
            <span className="text-[10px] text-red-700 font-extrabold block uppercase tracking-wider">Cancelled</span>
            <span className="text-2xl font-extrabold text-red-600 block tracking-tight">
              {(stats?.cancelledCount || 0) + (stats?.noShowCount || 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs group-hover:scale-110 transition-transform">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Today's Schedule Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] border border-[#BFD8FF] flex items-center justify-center text-[#2578FB] shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#111827]">Today's Schedule</h2>
              <p className="text-xs text-[#5B6472] font-medium">
                {stats?.todayCount || 0} appointment(s) scheduled for today
              </p>
            </div>
          </div>
          
          <span className="text-xs font-bold text-[#2578FB] bg-[#EAF3FF] px-3.5 py-1.5 rounded-full border border-[#BFD8FF]">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {stats?.todayAppointments && stats.todayAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#5B6472] uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Meeting Type</th>
                  <th className="py-3 px-4">Scheduled Time</th>
                  <th className="py-3 px-4">Meeting Join Link</th>
                  <th className="py-3 px-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {stats.todayAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-[#EAF3FF]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#111827]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EAF3FF] text-[#2578FB] border border-[#BFD8FF] flex items-center justify-center font-extrabold text-xs shadow-2xs">
                          {app.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827]">{app.customerName}</div>
                          {app.companyName && (
                            <div className="text-[10px] text-[#5B6472] font-normal">{app.companyName}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <span className="px-3 py-1 rounded-lg bg-[#EAF3FF] text-[#2578FB] font-extrabold text-[11px] border border-[#BFD8FF] inline-flex items-center gap-1.5">
                        {app.meetingTypeTitle === 'Phone Call' ? (
                          <Phone className="w-3.5 h-3.5 text-[#2578FB]" />
                        ) : (
                          <Video className="w-3.5 h-3.5 text-[#2578FB]" />
                        )}
                        {app.meetingTypeTitle}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#2578FB]" />
                        {format12Hour(app.startTime)} - {format12Hour(app.endTime)}
                      </div>
                      <span className="text-[10px] text-[#5B6472] font-medium block">
                        Duration: {app.duration} mins
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {app.meetingLink ? (
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2578FB] hover:bg-[#1257C7] text-white font-extrabold text-[11px] shadow-blue transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B6472]">
                          <Phone className="w-3.5 h-3.5 text-[#2578FB]" />
                          <span>Call: {app.customerMobile}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold focus:outline-none cursor-pointer shadow-2xs ${getStatusBadge(
                          app.status,
                        )}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="NO_SHOW">NO_SHOW</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs font-bold text-[#5B6472] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            No appointments scheduled for today.
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
