import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Hourglass,
  Calendar,
  Clock,
  Video,
  Phone,
  User,
  Mail,
  Building,
  ExternalLink,
  ArrowLeft,
  Printer,
  Sparkles,
  Globe,
} from 'lucide-react';
import api from '../../services/api';
import hiveriftLogo from '../../assets/LOGO.svg';

// Convert ET Date (YYYY-MM-DD) & Time (HH:mm) to any client Timezone
const convertSlotFromET = (dateStr, timeStr, targetTimeZone, durationMins = 30) => {
  if (!dateStr || !timeStr) return { startLabel: '', endLabel: '', clientDate: '' };

  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);

    const guess = new Date(Date.UTC(y, m - 1, d, h, min, 0));

    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const etParts = etFormatter.formatToParts(guess);
    const partMap = {};
    for (const p of etParts) {
      partMap[p.type] = p.value;
    }

    const etYear = parseInt(partMap.year, 10);
    const etMonth = parseInt(partMap.month, 10);
    const etDay = parseInt(partMap.day, 10);
    const etHour = parseInt(partMap.hour === '24' ? '0' : partMap.hour, 10);
    const etMinute = parseInt(partMap.minute, 10);

    const asDate = new Date(Date.UTC(etYear, etMonth - 1, etDay, etHour, etMinute, 0));
    const diff = guess.getTime() - asDate.getTime();
    const startUtc = new Date(guess.getTime() + diff);
    const endUtc = new Date(startUtc.getTime() + durationMins * 60 * 1000);

    const tzTimeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const tzDateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimeZone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      startLabel: tzTimeFormatter.format(startUtc),
      endLabel: tzTimeFormatter.format(endUtc),
      clientDate: tzDateFormatter.format(startUtc),
    };
  } catch (e) {
    return { startLabel: timeStr, endLabel: '', clientDate: dateStr };
  }
};

export const ConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [loading, setLoading] = useState(!appointment);

  const clientTz =
    location.state?.clientTimezone ||
    appointment?.clientTimezone ||
    (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      } catch (e) {
        return 'Asia/Kolkata';
      }
    })();

  useEffect(() => {
    if (!appointment && id) {
      api
        .get(`/admin/appointments/${id}`)
        .then((res) => {
          setAppointment(res.data);
        })
        .catch((err) => {
          console.error('Error fetching appointment details', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, appointment]);

  const format12Hour = (time24) => {
    if (!time24) return '';
    let [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const mins = m < 10 ? '0' + m : m.toString();
    return `${h.toString().padStart(2, '0')}:${mins} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#5B6472]">Loading Confirmation Details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex items-center justify-center text-center">
        <div className="max-w-md mx-auto bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#111827] mb-2">Appointment Not Found</h2>
          <p className="text-xs text-[#5B6472] mb-6 font-medium">
            We couldn't retrieve the specified booking details.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-bold text-xs shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Booking Page
          </Link>
        </div>
      </div>
    );
  }

  const isPending = appointment.status === 'PENDING';
  const displayName =
    appointment.customerName ||
    `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim() ||
    'Valued Client';
  const business = appointment.businessName || appointment.companyName || '';

  const conv = convertSlotFromET(
    appointment.appointmentDate,
    appointment.startTime,
    clientTz,
    appointment.duration || 30,
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full">

        {/* Confirmation Outer Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-card p-6 sm:p-10 space-y-8 text-center">

          {/* Status Icon & Header */}
          <div className="flex flex-col items-center">
            <img
              src={hiveriftLogo}
              alt="HiveRift Logo"
              className="h-11 w-auto object-contain mb-4"
            />
            <div className="w-16 h-16 rounded-2xl bg-[#EAF3FF] text-[#2578FB] border border-[#BFD8FF] flex items-center justify-center mb-4 shadow-blue">
              {isPending ? (
                <Hourglass className="w-8 h-8 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-[#EAF3FF] text-[#2578FB] border border-[#BFD8FF] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2578FB]" />
              {isPending ? 'Request Pending Approval' : 'Booking Confirmed'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-sans">
              HiveRift – Consultation Booking
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6472] mt-1 max-w-md font-medium leading-relaxed">
              {isPending
                ? `Your 30-minute consultation request has been received. A notification has been sent to ${appointment.customerEmail}.`
                : `Your 30-minute consultation is confirmed! Confirmation details sent to ${appointment.customerEmail}.`}
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-left space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2578FB]" />
                <span className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                  Booking Summary ({clientTz.split('/')[1] || clientTz})
                </span>
              </div>
              <span className="text-xs font-mono font-extrabold text-[#2578FB] bg-[#EAF3FF] px-2.5 py-0.5 rounded-lg border border-[#BFD8FF]">
                ID: {appointment._id ? appointment._id.slice(-6).toUpperCase() : 'APP-01'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-medium">Scheduled Date</span>
                  <span className="font-bold text-[#111827] text-sm">
                    {conv.clientDate || appointment.appointmentDate}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-medium">
                    Your Local Time ({clientTz.split('/')[1] || clientTz})
                  </span>
                  <span className="font-bold text-[#2578FB] text-sm">
                    {conv.startLabel} - {conv.endLabel}
                  </span>
                  {clientTz !== 'America/New_York' && (
                    <span className="text-[10px] text-[#5B6472] block font-medium mt-0.5">
                      Organizer Time: {format12Hour(appointment.startTime)} -{' '}
                      {format12Hour(appointment.endTime)} ET
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {appointment.meetingTypeTitle === 'Phone Call' ? (
                  <Phone className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                ) : (
                  <Video className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-medium">Meeting Platform</span>
                  <span className="font-bold text-[#111827] text-sm">
                    {appointment.meetingTypeTitle} (30 Mins)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-medium">Customer Name</span>
                  <span className="font-bold text-[#111827] text-sm">{displayName}</span>
                </div>
              </div>

              {business && (
                <div className="flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#5B6472] block text-[11px] font-medium">Business Name</span>
                    <span className="font-bold text-[#111827] text-sm">{business}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-medium">Email Address</span>
                  <span className="font-bold text-[#111827] text-sm">
                    {appointment.customerEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Meeting Link for Confirmed Bookings */}
            {!isPending && appointment.meetingLink && (
              <div className="pt-3 border-t border-[#E2E8F0] mt-3">
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-xs border border-emerald-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Meeting Call
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#111827] font-bold text-xs hover:bg-[#F8FAFC] transition-all w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Book Another Appointment
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F1F5F9] text-[#111827] font-bold text-xs hover:bg-[#E2E8F0] transition-all w-full sm:w-auto cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Confirmation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
