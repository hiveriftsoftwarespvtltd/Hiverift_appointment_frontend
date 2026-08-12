import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Video,
  Clock,
  Ban,
} from 'lucide-react';

export const AdminNav = () => {
  const tabs = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/admin/meeting-types', label: 'Meeting Types', icon: Video },
    { to: '/admin/working-hours', label: 'Working Hours', icon: Clock },
    { to: '/admin/blocked-times', label: 'Blocked Times', icon: Ban },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-ivory-BORDER pb-3 mb-6">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                ? 'bg-gold-PRIMARY text-white shadow-gold'
                : 'bg-white text-charcoal-SECONDARY hover:text-charcoal hover:bg-gold-SOFT/40 border border-ivory-BORDER'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AdminNav;
