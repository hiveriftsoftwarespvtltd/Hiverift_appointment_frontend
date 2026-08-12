import React, { useState, useEffect } from 'react';
import { Ban, Plus, Trash2, Calendar, Clock, PhoneCall, Check } from 'lucide-react';
import api from '../../services/api';

export const AdminBlockedTimes = () => {
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('15:00');
  const [isFullDay, setIsFullDay] = useState(false);
  const [reason, setReason] = useState('Internal Meeting');

  const [helplinePhone, setHelplinePhone] = useState('+91 98765 43210');
  const [phoneTypeObj, setPhoneTypeObj] = useState(null);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchBlockedTimes = () => {
    setLoading(true);
    api
      .get('/admin/blocked-times')
      .then((res) => { setBlockedTimes(res.data); })
      .catch((err) => { console.error('Error fetching blocked times', err); })
      .finally(() => setLoading(false));
  };

  const fetchHelplineNumber = () => {
    api
      .get('/admin/helpline')
      .then((res) => {
        if (res.data && res.data.helplinePhone) {
          setHelplinePhone(res.data.helplinePhone);
        }
      })
      .catch((err) => { console.error('Error fetching helpline number', err); });
  };

  useEffect(() => {
    fetchBlockedTimes();
    fetchHelplineNumber();
  }, []);

  const handleUpdateHelpline = async (e) => {
    e.preventDefault();
    setSavingPhone(true);
    setPhoneSuccess('');
    try {
      await api.patch('/admin/helpline', { helplinePhone });
      setPhoneSuccess(`Website helpline phone updated to "${helplinePhone}"! Live on website.`);
      setTimeout(() => setPhoneSuccess(''), 4000);
      fetchHelplineNumber();
    } catch (err) {
      alert('Failed to update helpline phone number.');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!date) { setError('Please select a date to block.'); return; }
    setSubmitting(true);
    try {
      await api.post('/admin/blocked-times', {
        date,
        startTime: isFullDay ? null : startTime,
        endTime: isFullDay ? null : endTime,
        isFullDay,
        reason: reason || 'Blocked',
      });
      fetchBlockedTimes();
      setDate('');
      setReason('Internal Meeting');
      setIsFullDay(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block time slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this blocked time slot?')) return;
    try {
      await api.delete(`/admin/blocked-times/${id}`);
      fetchBlockedTimes();
    } catch (err) {
      alert('Failed to delete blocked time.');
    }
  };

  const format12Hour = (time24) => {
    if (!time24) return '';
    let [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; h = h ? h : 12;
    const mins = m < 10 ? '0' + m : m;
    return `${h}:${mins} ${ampm}`;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-[11px] font-bold uppercase tracking-wider">
            <Ban className="w-3.5 h-3.5" />
            <span>Availability Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] font-sans tracking-tight">
            Blocked Dates & Website Settings
          </h1>
          <p className="text-xs text-[#5B6472] font-medium">
            Manage website "Need help?" phone number and block dates or time slots from booking
          </p>
        </div>
      </div>

      {/* HELPLINE PHONE NUMBER */}
      <div className="bg-gradient-to-r from-[#EAF3FF] to-white border border-[#BFD8FF] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2578FB] text-white flex items-center justify-center shadow-blue flex-shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#111827] font-sans">
                Update "Need Help?" Phone Number
              </h2>
              <p className="text-[11px] text-[#5B6472]">
                Displayed on the client website Header ("Need help?") & Footer.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateHelpline} className="flex items-center gap-2.5">
            <input
              type="text"
              required
              placeholder="e.g. +91 98765 43210"
              value={helplinePhone}
              onChange={(e) => setHelplinePhone(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#BFD8FF] text-xs font-bold text-[#111827] focus:outline-none focus:border-[#2578FB] shadow-xs min-w-[200px]"
            />
            <button
              type="submit"
              disabled={savingPhone}
              className="px-4 py-2.5 rounded-xl bg-[#2578FB] text-white font-extrabold text-xs shadow-blue hover:bg-[#1257C7] disabled:opacity-50 transition-all whitespace-nowrap"
            >
              {savingPhone ? 'Updating...' : 'Update Phone'}
            </button>
          </form>
        </div>

        {phoneSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{phoneSuccess}</span>
          </div>
        )}
      </div>

      {/* BLOCKED TIMES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Left Form: Add Blocked Period */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-5 space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] border border-[#BFD8FF] flex items-center justify-center text-[#2578FB]">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-sm text-[#111827]">Add Blocked Period</h2>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#5B6472] mb-1.5">Select Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold focus:outline-none focus:border-[#2578FB] transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-[#5B6472] mb-1.5">Reason</label>
              <input
                type="text"
                placeholder="e.g. Holiday or Team Outing"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] focus:outline-none focus:border-[#2578FB] transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 py-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFullDay}
                  onChange={(e) => setIsFullDay(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2578FB]"></div>
              </label>
              <span className="font-bold text-[#111827]">Block Full Day</span>
            </div>

            {!isFullDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5B6472] mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold focus:outline-none focus:border-[#2578FB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5B6472] mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold focus:outline-none focus:border-[#2578FB] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-extrabold text-xs shadow-blue hover:scale-[1.02] disabled:opacity-50 transition-all"
            >
              <Ban className="w-4 h-4" />
              {submitting ? 'Blocking...' : 'Block Selected Period'}
            </button>
          </form>
        </div>

        {/* Right List: Active Blocked Slots */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-5 space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Ban className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-sm text-[#111827]">
              Active Blocked Periods ({blockedTimes.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-[#5B6472]">Loading blocked periods...</p>
            </div>
          ) : blockedTimes.length === 0 ? (
            <div className="py-10 text-center text-xs font-bold text-[#5B6472] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-8">
              No dates or times are currently blocked.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {blockedTimes.map((item) => (
                <div key={item._id} className="py-3.5 flex items-center justify-between gap-4 text-xs group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-[#111827]">
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold">
                        {item.isFullDay
                          ? 'FULL DAY'
                          : `${format12Hour(item.startTime)} – ${format12Hour(item.endTime)}`}
                      </span>
                    </div>
                    <p className="text-[#5B6472] text-[11px] font-medium">Reason: {item.reason}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    title="Remove Block"
                    className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-red-50 text-[#5B6472] hover:text-red-600 hover:border-red-200 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminBlockedTimes;
