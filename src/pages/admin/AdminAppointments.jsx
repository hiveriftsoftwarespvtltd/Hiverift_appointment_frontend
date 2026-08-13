import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  Filter,
  Trash2,
  Eye,
  Clock,
  Phone,
  Video,
  X,
  RefreshCw,
  ExternalLink,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Building,
  Globe,
  CheckCircle2,
  Check,
} from 'lucide-react';
import api from '../../services/api';

// Helper: Get Today's date in Eastern Time (America/New_York) YYYY-MM-DD
const getTodayInET = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const partMap = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }
  return `${partMap.year}-${partMap.month}-${partMap.day}`;
};

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Tabs: UPCOMING | PAST | ALL
  const [activeTab, setActiveTab] = useState('UPCOMING');

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  // Pagination state (4 entries per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const todayInET = getTodayInET();

  const fetchAppointments = (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    let url = '/admin/appointments?';
    if (statusFilter) url += `status=${statusFilter}&`;
    if (dateFilter) url += `date=${dateFilter}&`;

    api
      .get(url)
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        console.error('Error fetching appointments', err);
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  // Fetch on filters change
  useEffect(() => {
    fetchAppointments(false);
  }, [statusFilter, dateFilter]);

  // Live Auto-Refresh polling (every 15 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, statusFilter, dateFilter]);

  // Reset to page 1 whenever tab, search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, dateFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/appointments/${id}/status`, { status: newStatus });
      fetchAppointments(true);
      if (selectedApp && selectedApp._id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment record?')) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      fetchAppointments(true);
      if (selectedApp && selectedApp._id === id) setSelectedApp(null);
    } catch (err) {
      alert('Failed to delete appointment.');
    }
  };

  const format12Hour = (time24) => {
    if (!time24) return '';
    let [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const mins = m < 10 ? '0' + m : m.toString();
    return `${h.toString().padStart(2, '0')}:${mins} ${ampm}`;
  };

  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
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

  // Tab Counters
  const upcomingCount = appointments.filter(
    (a) => a.appointmentDate >= todayInET && a.status !== 'CANCELLED' && a.status !== 'COMPLETED',
  ).length;

  const pastCount = appointments.filter(
    (a) =>
      a.appointmentDate < todayInET ||
      a.status === 'COMPLETED' ||
      a.status === 'CANCELLED' ||
      a.status === 'NO_SHOW',
  ).length;

  const totalCount = appointments.length;

  // Filter Appointments by Active Tab & Search Query
  const filteredAppointments = appointments.filter((app) => {
    // Tab filter
    if (activeTab === 'UPCOMING') {
      const isUpcomingDate = app.appointmentDate >= todayInET;
      const isPendingOrConfirmed = app.status !== 'CANCELLED' && app.status !== 'COMPLETED';
      if (!isUpcomingDate || !isPendingOrConfirmed) return false;
    } else if (activeTab === 'PAST') {
      const isPastDate = app.appointmentDate < todayInET;
      const isFinishedStatus = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(app.status);
      if (!isPastDate && !isFinishedStatus) return false;
    }

    // Search query filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (
      app.customerName || `${app.firstName || ''} ${app.lastName || ''}`
    ).toLowerCase();
    const email = (app.customerEmail || '').toLowerCase();
    const mobile = (app.customerMobile || '').toLowerCase();
    const business = (app.businessName || app.companyName || '').toLowerCase();
    return (
      name.includes(q) ||
      email.includes(q) ||
      mobile.includes(q) ||
      business.includes(q)
    );
  });

  // Sort Filtered Appointments Chronologically
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (activeTab === 'UPCOMING') {
      // Earliest upcoming dates first
      if (a.appointmentDate !== b.appointmentDate) {
        return a.appointmentDate < b.appointmentDate ? -1 : 1;
      }
      return (a.startTime || '').localeCompare(b.startTime || '');
    } else if (activeTab === 'PAST') {
      // Most recent past dates first
      if (a.appointmentDate !== b.appointmentDate) {
        return a.appointmentDate > b.appointmentDate ? -1 : 1;
      }
      return (b.startTime || '').localeCompare(a.startTime || '');
    } else {
      // All: Earliest to latest
      if (a.appointmentDate !== b.appointmentDate) {
        return a.appointmentDate < b.appointmentDate ? -1 : 1;
      }
      return (a.startTime || '').localeCompare(b.startTime || '');
    }
  });

  // Pagination calculation
  const totalItems = sortedAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentAppointments = sortedAppointments.slice(startIndex, endIndex);

  // Group paginated items by date
  const groupedAppointments = currentAppointments.reduce((groups, app) => {
    const dateKey = app.appointmentDate;
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(app);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    if (activeTab === 'PAST') {
      return a > b ? -1 : 1;
    }
    return a < b ? -1 : 1;
  });

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Header with Live Auto-Refresh Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-[11px] font-bold uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Bookings Manager (ET)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] font-sans tracking-tight">
            Consultation Bookings
          </h1>
          <p className="text-xs text-[#5B6472] font-medium">
            Standardized in Eastern Time (ET) · Today: <span className="font-bold text-[#111827]">{todayInET}</span>
          </p>
        </div>

        {/* Live Auto-Refresh Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
            title="Toggle live 15s auto-refresh"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            ></span>
            <span>{autoRefresh ? 'Auto-Refresh: ON (15s)' : 'Auto-Refresh: OFF'}</span>
          </button>

          <button
            onClick={() => fetchAppointments(false)}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2578FB] hover:bg-[#1257C7] text-white font-bold text-xs shadow-blue transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Modern Tabs Bar (Upcoming | Past | All) */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('UPCOMING')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'UPCOMING'
              ? 'bg-[#2578FB] text-white shadow-blue font-extrabold'
              : 'text-[#5B6472] hover:bg-[#F8FAFC] hover:text-[#111827]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming & Today</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'UPCOMING'
                ? 'bg-white/20 text-white'
                : 'bg-[#EAF3FF] text-[#2578FB]'
            }`}
          >
            {upcomingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PAST')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'PAST'
              ? 'bg-[#2578FB] text-white shadow-blue font-extrabold'
              : 'text-[#5B6472] hover:bg-[#F8FAFC] hover:text-[#111827]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Past & Completed</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'PAST'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {pastCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#2578FB] text-white shadow-blue font-extrabold'
              : 'text-[#5B6472] hover:bg-[#F8FAFC] hover:text-[#111827]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>All Bookings</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'ALL'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {totalCount}
          </span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5B6472] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, business, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#111827] focus:outline-none focus:border-[#2578FB] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B6472] flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#2578FB] transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="NO_SHOW">NO_SHOW</option>
          </select>
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#2578FB] transition-colors"
        />
      </div>

      {/* Appointments Data View (Grouped Date-Wise) */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-[#5B6472]">Loading appointments...</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs font-bold text-[#5B6472]">
            No appointments found matching your filters.
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const apps = groupedAppointments[dateKey];
            const dateObj = new Date(dateKey + 'T00:00:00');
            const dayFull = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const ddmmyyyy = formatDateDDMMYYYY(dateKey);

            return (
              <div
                key={dateKey}
                className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden"
              >
                {/* DATE GROUP HEADER */}
                <div className="bg-[#EAF3FF]/50 border-b border-[#BFD8FF]/50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#2578FB] text-white flex items-center justify-center shadow-blue flex-shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#111827] font-sans block">
                          {dayFull} (ET)
                        </span>
                        {dateKey === todayInET ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            TODAY
                          </span>
                        ) : dateKey > todayInET ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#EAF3FF] text-[#2578FB] border border-[#BFD8FF] text-[10px] font-extrabold">
                            UPCOMING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-300 text-[10px] font-bold">
                            PAST
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#2578FB] font-mono">
                        Date: {ddmmyyyy}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#2578FB] bg-white px-3.5 py-1.5 rounded-full border border-[#BFD8FF] shadow-2xs">
                    {apps.length} {apps.length === 1 ? 'Consultation' : 'Consultations'}
                  </span>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#5B6472] uppercase tracking-wider text-[10px] font-extrabold">
                        <th className="py-3 px-4">Client / Business</th>
                        <th className="py-3 px-4">Meeting Type</th>
                        <th className="py-3 px-4">Time Slot (ET)</th>
                        <th className="py-3 px-4">Join Link</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {apps.map((app) => {
                        const displayName =
                          app.customerName ||
                          `${app.firstName || ''} ${app.lastName || ''}`.trim() ||
                          'Client';
                        const business = app.businessName || app.companyName;

                        return (
                          <tr key={app._id} className="hover:bg-[#EAF3FF]/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#111827]">{displayName}</div>
                              {business && (
                                <div className="text-[11px] text-[#2578FB] font-medium">
                                  {business}
                                </div>
                              )}
                              <div className="text-[#5B6472] text-[11px]">
                                {app.customerEmail} · {app.customerMobile}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FF] text-[#2578FB] border border-[#BFD8FF] font-extrabold text-[11px]">
                                {app.meetingTypeTitle}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[#111827] font-medium">
                              <div className="font-bold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#2578FB]" />
                                {format12Hour(app.startTime)} - {format12Hour(app.endTime)} ET
                              </div>
                              <div className="text-[#5B6472] text-[11px]">
                                30 Mins Consultation
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {app.meetingLink ? (
                                <a
                                  href={app.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2578FB] hover:bg-[#1257C7] text-white font-extrabold text-[11px] transition-all"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Join</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-[#5B6472] text-[11px] font-medium">
                                  {app.customerMobile}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold focus:outline-none cursor-pointer ${getStatusBadge(
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
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  title="View Full Details"
                                  className="p-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EAF3FF] text-[#5B6472] hover:text-[#2578FB] hover:border-[#BFD8FF] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(app._id)}
                                  title="Delete"
                                  className="p-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-red-50 text-[#5B6472] hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION CONTROLS (3 entries per page) */}
      {!loading && totalItems > 0 && (
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-semibold text-[#5B6472]">
            Showing{' '}
            <span className="font-extrabold text-[#111827]">
              {totalItems === 0 ? 0 : startIndex + 1}
            </span>{' '}
            to <span className="font-extrabold text-[#111827]">{endIndex}</span> of{' '}
            <span className="font-extrabold text-[#111827]">{totalItems}</span> appointments
            <span className="ml-2 text-[11px] text-[#2578FB] bg-[#EAF3FF] px-2 py-0.5 rounded-md border border-[#BFD8FF] font-bold">
              (3 per page)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#5B6472] hover:bg-[#EAF3FF] hover:text-[#2578FB] hover:border-[#BFD8FF] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white shadow-blue scale-105'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#5B6472] hover:bg-[#EAF3FF] hover:text-[#2578FB]'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#5B6472] hover:bg-[#EAF3FF] hover:text-[#2578FB] hover:border-[#BFD8FF] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] border border-[#BFD8FF] flex items-center justify-center text-[#2578FB]">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[#111827]">
                  Consultation Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-xl text-[#5B6472] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Client Name
                  </span>
                  <span className="font-extrabold text-[#111827] text-sm">
                    {selectedApp.customerName ||
                      `${selectedApp.firstName || ''} ${selectedApp.lastName || ''}`.trim()}
                  </span>
                </div>
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Status
                  </span>
                  <span
                    className={`font-extrabold px-2.5 py-0.5 rounded-lg border inline-block mt-0.5 ${getStatusBadge(
                      selectedApp.status,
                    )}`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#E2E8F0] pt-3">
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Email
                  </span>
                  <span className="font-semibold text-[#111827]">
                    {selectedApp.customerEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Mobile
                  </span>
                  <span className="font-semibold text-[#111827] font-mono">
                    {selectedApp.customerMobile}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#E2E8F0] pt-3">
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Business Name
                  </span>
                  <span className="font-semibold text-[#111827]">
                    {selectedApp.businessName || selectedApp.companyName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Purpose
                  </span>
                  <span className="font-semibold text-[#111827]">
                    {selectedApp.purpose || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#E2E8F0] pt-3">
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Meeting Type
                  </span>
                  <span className="font-extrabold text-[#111827]">
                    {selectedApp.meetingTypeTitle}
                  </span>
                </div>
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                    Client Timezone
                  </span>
                  <span className="font-semibold text-[#2578FB] truncate block">
                    {selectedApp.clientTimezone || 'America/New_York (ET)'}
                  </span>
                </div>
              </div>

              {selectedApp.meetingLink && (
                <div className="border-t border-[#E2E8F0] pt-3 bg-[#EAF3FF]/40 p-3 rounded-xl border border-[#BFD8FF] flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-[#2578FB] block text-xs">
                      Direct Meeting Link
                    </span>
                    <span className="text-[10px] text-[#5B6472] truncate max-w-xs block font-mono">
                      {selectedApp.meetingLink}
                    </span>
                  </div>
                  <a
                    href={selectedApp.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#2578FB] hover:bg-[#1257C7] text-white font-extrabold text-xs rounded-xl shadow-blue flex items-center gap-1.5 transition-colors"
                  >
                    <span>Join</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="border-t border-[#E2E8F0] pt-3">
                <span className="text-[#5B6472] block text-[11px] font-semibold mb-0.5">
                  Scheduled Time (Eastern Time - ET)
                </span>
                <span className="font-extrabold text-[#111827]">
                  {selectedApp.appointmentDate} at {format12Hour(selectedApp.startTime)} -{' '}
                  {format12Hour(selectedApp.endTime)} ET (30 Mins)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-extrabold text-xs rounded-xl shadow-blue cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAppointments;
