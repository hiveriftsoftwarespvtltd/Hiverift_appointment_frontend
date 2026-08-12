import React, { useState, useEffect } from 'react';
import { Video, Phone, Check, Save, PhoneCall } from 'lucide-react';
import api from '../../services/api';

export const AdminMeetingTypes = () => {
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [savingHelpline, setSavingHelpline] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [helplinePhone, setHelplinePhone] = useState('+91 98765 43210');

  const fetchMeetingTypes = () => {
    setLoading(true);
    api
      .get('/admin/meeting-types')
      .then((res) => {
        setMeetingTypes(res.data);
      })
      .catch((err) => { console.error('Error fetching meeting types', err); })
      .finally(() => setLoading(false));
  };

  const fetchHelpline = () => {
    api
      .get('/admin/helpline')
      .then((res) => {
        if (res.data && res.data.helplinePhone) {
          setHelplinePhone(res.data.helplinePhone);
        }
      })
      .catch((err) => { console.error('Error fetching helpline', err); });
  };

  useEffect(() => {
    fetchMeetingTypes();
    fetchHelpline();
  }, []);

  const handleChange = (id, field, value) => {
    setMeetingTypes((prev) =>
      prev.map((item) => (item._id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async (item) => {
    setSavingId(item._id);
    setSuccessMsg('');
    try {
      await api.patch(`/admin/meeting-types/${item._id}`, {
        title: item.title,
        meetingLink: item.meetingLink,
        phoneNumber: item.phoneNumber,
        isActive: item.isActive,
      });
      setSuccessMsg(`Updated ${item.title} configuration!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchMeetingTypes();
    } catch (err) {
      alert('Failed to update meeting type.');
    } finally {
      setSavingId(null);
    }
  };

  const handleQuickHelplineSave = async () => {
    setSavingHelpline(true);
    setSuccessMsg('');
    try {
      await api.patch('/admin/helpline', { helplinePhone });
      setSuccessMsg(`Website Helpline Number updated to ${helplinePhone}! Live on website Header & Footer.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchHelpline();
    } catch (err) {
      alert('Failed to update helpline number.');
    } finally {
      setSavingHelpline(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-[11px] font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" />
            <span>Configuration Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] font-sans tracking-tight">
            Meeting Types & Support Helpline
          </h1>
          <p className="text-xs text-[#5B6472] font-medium">
            Configure Google Meet links, Zoom links, and the Phone Support number displayed on the client website
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5 shadow-xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{successMsg}</span>
        </div>
      )}

      {/* QUICK HELPLINE NUMBER BOX */}
      <div className="bg-gradient-to-r from-[#EAF3FF] to-white border border-[#BFD8FF] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2578FB] text-white flex items-center justify-center shadow-blue flex-shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-[#111827]">Website Helpline Phone Number</h2>
            <p className="text-[11px] text-[#5B6472]">
              Displayed on the client website Header ("Need help?") & Footer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="text"
            placeholder="+91 98765 43210"
            value={helplinePhone}
            onChange={(e) => setHelplinePhone(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#BFD8FF] text-xs font-bold text-[#111827] focus:outline-none focus:border-[#2578FB] shadow-xs min-w-[200px]"
          />
          <button
            onClick={handleQuickHelplineSave}
            disabled={savingHelpline}
            className="px-4 py-2.5 rounded-xl bg-[#2578FB] text-white font-extrabold text-xs shadow-blue hover:bg-[#1257C7] disabled:opacity-50 transition-all whitespace-nowrap"
          >
            {savingHelpline ? 'Saving...' : 'Save Helpline'}
          </button>
        </div>
      </div>

      {/* MEETING TYPES CARDS GRID */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-[#5B6472] bg-white rounded-2xl border border-[#E2E8F0]">
            <div className="w-8 h-8 border-3 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin mx-auto mb-3"></div>
            Loading meeting types...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {meetingTypes.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#BFD8FF] transition-all"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${item.type === 'PHONE_CALL' ? 'bg-[#EAF3FF] border border-[#BFD8FF]' : 'bg-emerald-50 border border-emerald-200'}`}>
                        {item.type === 'PHONE_CALL' ? (
                          <Phone className="w-5 h-5 text-[#2578FB]" />
                        ) : (
                          <Video className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#111827]">{item.title}</h3>
                        <span className="text-[10px] font-mono text-[#5B6472]">{item.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#5B6472]">Active</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isActive}
                          onChange={(e) => handleChange(item._id, 'isActive', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2578FB]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#5B6472] font-bold mb-1.5">Display Title</label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleChange(item._id, 'title', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold focus:outline-none focus:border-[#2578FB] transition-colors"
                      />
                    </div>

                    {item.type === 'PHONE_CALL' ? (
                      <div>
                        <label className="block text-[#5B6472] font-bold mb-1.5">Phone Call Number</label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          value={item.phoneNumber || ''}
                          onChange={(e) => handleChange(item._id, 'phoneNumber', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold focus:outline-none focus:border-[#2578FB] transition-colors"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[#5B6472] font-bold mb-1.5">Meeting Link (URL)</label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/..."
                          value={item.meetingLink || ''}
                          onChange={(e) => handleChange(item._id, 'meetingLink', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-semibold focus:outline-none focus:border-[#2578FB] transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => handleSave(item)}
                    disabled={savingId === item._id}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-extrabold text-xs shadow-blue hover:scale-[1.02] disabled:opacity-50 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingId === item._id ? 'Saving...' : 'Save Configuration'}
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

export default AdminMeetingTypes;
