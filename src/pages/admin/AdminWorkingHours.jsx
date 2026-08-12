import React, { useState, useEffect } from 'react';
import { Clock, Check, Save } from 'lucide-react';
import api from '../../services/api';

export const AdminWorkingHours = () => {
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchWorkingHours = () => {
    setLoading(true);
    api
      .get('/admin/working-hours')
      .then((res) => { setWorkingHours(res.data); })
      .catch((err) => { console.error('Error fetching working hours', err); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWorkingHours(); }, []);

  const handleChange = (id, field, value) => {
    setWorkingHours((prev) =>
      prev.map((item) => (item._id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async (item) => {
    setSavingId(item._id);
    setSuccessMsg('');
    try {
      await api.patch(`/admin/working-hours/${item._id}`, {
        startTime: item.startTime,
        endTime: item.endTime,
        isActive: item.isActive,
      });
      setSuccessMsg(`Updated schedule for ${item.dayOfWeek}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to update working hours.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-[11px] font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Schedule Manager</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] font-sans tracking-tight">
            Working Hours Management
          </h1>
          <p className="text-xs text-[#5B6472] font-medium">
            Configure weekly operating hours when customers can book appointments
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Schedule Table Container */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-6 space-y-4">
        <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#111827] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] border border-[#BFD8FF] flex items-center justify-center text-[#2578FB]">
              <Clock className="w-4 h-4" />
            </div>
            Weekly Operating Schedule
          </h2>
          <span className="text-[11px] text-[#5B6472] font-semibold bg-[#F8FAFC] px-3 py-1 rounded-lg border border-[#E2E8F0]">
            Format: 24-hour HH:mm
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-[#5B6472]">Loading schedule...</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {workingHours.map((item) => (
              <div
                key={item._id}
                className="py-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 text-xs"
              >
                {/* Day Name & Badge */}
                <div className="w-48 flex items-center gap-3 flex-shrink-0">
                  <span className="font-extrabold text-sm text-[#111827] min-w-[90px]">
                    {item.dayOfWeek}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {item.isActive ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>

                {/* Time Inputs */}
                <div className="flex items-center gap-2.5 flex-1">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${item.isActive ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <span className="text-[10px] font-bold text-[#5B6472]">Start:</span>
                    <input
                      type="time"
                      disabled={!item.isActive}
                      value={item.startTime || '09:00'}
                      onChange={(e) => handleChange(item._id, 'startTime', e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-[#111827] focus:outline-none disabled:opacity-40"
                    />
                  </div>

                  <span className="text-[#5B6472] font-bold text-xs">→</span>

                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${item.isActive ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <span className="text-[10px] font-bold text-[#5B6472]">End:</span>
                    <input
                      type="time"
                      disabled={!item.isActive}
                      value={item.endTime || '18:00'}
                      onChange={(e) => handleChange(item._id, 'endTime', e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-[#111827] focus:outline-none disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Toggle & Save */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => handleChange(item._id, 'isActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2578FB]"></div>
                  </label>

                  <button
                    onClick={() => handleSave(item)}
                    disabled={savingId === item._id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-extrabold text-xs shadow-blue hover:scale-105 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingId === item._id ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminWorkingHours;
