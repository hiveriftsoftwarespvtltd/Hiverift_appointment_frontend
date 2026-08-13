import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Video,
  Clock,
  Ban,
  LogOut,
  UserCheck,
  Calendar,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import hiveriftLogo from '../../assets/LOGO.svg';

export const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/admin/meeting-types', label: 'Meeting Types', icon: Video },
    { to: '/admin/working-hours', label: 'Working Hours', icon: Clock },
    { to: '/admin/blocked-times', label: 'Blocked Times', icon: Ban },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return 'Admin Dashboard';
      case '/admin/appointments':
        return 'Appointments Management';
      case '/admin/meeting-types':
        return 'Meeting Types & Links';
      case '/admin/working-hours':
        return 'Weekly Working Hours';
      case '/admin/blocked-times':
        return 'Blocked Dates & Times';
      default:
        return 'Admin Portal';
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-gray-800">

      {/* DESKTOP SIDEBAR (FIXED POSITION & NO HORIZONTAL SCROLL) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E2E8F0] flex-col justify-between p-4 shadow-subtle z-30 fixed top-0 left-0 bottom-0 h-screen flex-shrink-0 overflow-hidden select-none">
        <div className="overflow-y-auto overflow-x-hidden pr-0.5">
          {/* Logo Header */}
          <Link to="/admin/dashboard" className="flex items-center justify-between gap-2 mb-6 px-1 pt-1">
            <img
              src={hiveriftLogo}
              alt="HiveRift Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-[9px] tracking-widest text-[#2578FB] uppercase font-bold whitespace-nowrap bg-[#EAF3FF] px-2 py-0.5 rounded-full border border-[#BFD8FF]">
              Admin
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 overflow-hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-150 w-full ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white shadow-blue'
                        : 'text-[#5B6472] hover:text-[#111827] hover:bg-[#EAF3FF]/60 font-semibold'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-3 overflow-hidden">
          
          {/* Customer View Link */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 bg-[#F8FAFC] hover:bg-[#EAF3FF] rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#2578FB] transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {admin && (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-[#EAF3FF]/60 rounded-xl border border-[#BFD8FF]">
              <div className="w-7 h-7 rounded-lg bg-[#2578FB] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="font-bold text-xs text-[#111827] block truncate">
                  {admin.name || 'Admin'}
                </span>
                <span className="text-[10px] text-[#5B6472] block truncate">
                  {admin.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-red-200 bg-red-50/80 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          ></div>

          <aside className="relative w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between p-4 shadow-2xl z-50 h-full overflow-hidden">
            <div className="overflow-y-auto overflow-x-hidden">
              <div className="flex items-center justify-between mb-6 px-1 pt-1 border-b border-[#E2E8F0] pb-3">
                <Link to="/admin/dashboard" className="flex items-center gap-2">
                  <img
                    src={hiveriftLogo}
                    alt="HiveRift Logo"
                    className="h-9 w-auto object-contain"
                  />
                </Link>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#EAF3FF] text-gray-500 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 overflow-hidden">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-colors w-full ${
                          isActive
                            ? 'bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white shadow-blue'
                            : 'text-[#5B6472] hover:text-[#111827] hover:bg-[#EAF3FF]/60 font-semibold'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2 overflow-hidden">
              {admin && (
                <div className="flex items-center gap-2.5 px-3 py-2 bg-[#EAF3FF]/60 rounded-xl border border-[#BFD8FF]">
                  <div className="w-6 h-6 rounded-lg bg-[#2578FB] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <span className="font-bold text-xs text-[#111827] block truncate">
                      {admin.name || 'Admin'}
                    </span>
                    <span className="text-[10px] text-[#5B6472] block truncate">
                      {admin.email}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-red-200 bg-red-50/80 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* RIGHT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:pl-64">

        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-[#E2E8F0] text-gray-700 hover:bg-[#EAF3FF] transition-colors"
              title="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-[#5B6472] hidden sm:inline">Admin Portal</span>
              <span className="text-[#5B6472] hidden sm:inline">/</span>
              <span className="font-bold text-[#111827]">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-xs font-bold shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#2578FB]" />
              <span>{todayFormatted}</span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full space-y-6">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
