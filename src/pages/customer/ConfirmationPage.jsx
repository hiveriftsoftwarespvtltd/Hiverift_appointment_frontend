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
} from 'lucide-react';
import api from '../../services/api';

export const ConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [loading, setLoading] = useState(!appointment);

  useEffect(() => {
    if (!appointment && id) {
      api
        .get(`/appointments/${id}`)
        .then((res) => {
          setAppointment(res.data);
        })
        .catch((err) => {
          console.error('Error fetching appointment details', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, appointment]);

  const format12Hour = (time24) => {
    if (!time24) return '';
    let [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const mins = m < 10 ? '0' + m : m;
    return `${h}:${mins} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#5B6472]">Loading Confirmation Details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] py-12 px-4 text-center">
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

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Confirmation Outer Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-card p-6 sm:p-10 space-y-8 text-center">

          {/* Status Icon & Header */}
          <div className="flex flex-col items-center">
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
              {isPending ? 'Appointment Request Received!' : 'Appointment Confirmed!'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6472] mt-1 max-w-md font-medium leading-relaxed">
              {isPending
                ? `Your booking request has been submitted and is pending review. A confirmation email has been sent to ${appointment.customerEmail}.`
                : `A confirmation email with meeting instructions has been sent to ${appointment.customerEmail}.`}
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-left space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                Booking Details
              </span>
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
                    {new Date(appointment.appointmentDate + 'T00:00:00').toLocaleDateString(
                      'en-US',
                      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-medium">Time & Duration</span>
                  <span className="font-bold text-[#111827] text-sm">
                    {format12Hour(appointment.startTime)} - {format12Hour(appointment.endTime)}
                  </span>
                  <span className="text-[10px] text-[#5B6472] block font-semibold">
                    ({appointment.duration} Minutes Duration)
                  </span>
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
                    {appointment.meetingTypeTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#5B6472] block text-[11px] font-medium">Customer Name</span>
                  <span className="font-bold text-[#111827] text-sm">
                    {appointment.customerName}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Meeting Link Action Box */}
            {appointment.meetingLink && (
              <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#BFD8FF]">
                <div className="text-xs text-left">
                  <span className="font-extrabold text-[#111827] block">Meeting Link</span>
                  <span className="text-[11px] text-[#5B6472] truncate max-w-xs block font-mono">
                    {appointment.meetingLink}
                  </span>
                </div>
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#2578FB] to-[#1257C7] hover:from-[#1257C7] hover:to-[#0D47A1] text-white font-bold text-xs rounded-xl shadow-blue transition-all whitespace-nowrap"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Meeting</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Phone Call Info Action Box */}
            {appointment.phoneNumber && appointment.meetingTypeTitle === 'Phone Call' && (
              <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#BFD8FF]">
                <div className="text-xs text-left">
                  <span className="font-extrabold text-[#111827] block">Direct Phone Number</span>
                  <span className="text-sm text-[#2578FB] font-bold font-mono">
                    {appointment.phoneNumber}
                  </span>
                </div>
                <a
                  href={`tel:${appointment.phoneNumber}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#2578FB] to-[#1257C7] hover:from-[#1257C7] hover:to-[#0D47A1] text-white font-bold text-xs rounded-xl shadow-blue transition-all whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#111827] font-bold text-xs shadow-xs hover:bg-[#F8FAFC] transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-bold text-xs shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ConfirmationPage;

