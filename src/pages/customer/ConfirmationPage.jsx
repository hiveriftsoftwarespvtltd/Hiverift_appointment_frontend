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
      <div className="min-h-[calc(100vh-140px)] bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gold-BORDER border-t-gold-PRIMARY rounded-full animate-spin"></div>
          <p className="text-xs text-charcoal-MUTED">Loading Confirmation Details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-ivory py-12 px-4 text-center">
        <div className="max-w-md mx-auto bg-white border border-ivory-BORDER rounded-2xl p-8 shadow-subtle">
          <h2 className="text-xl font-bold text-charcoal mb-2">Appointment Not Found</h2>
          <p className="text-xs text-charcoal-MUTED mb-6">
            We couldn't retrieve the specified booking details.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-PRIMARY text-white font-bold text-xs shadow-gold hover:bg-gold-DARK"
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
    <div className="min-h-[calc(100vh-140px)] bg-ivory py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Confirmation Outer Card */}
        <div className="bg-white border border-ivory-BORDER rounded-2xl shadow-outer p-6 sm:p-10 space-y-8 text-center">

          {/* Status Icon & Header */}
          <div className="flex flex-col items-center">
            {isPending ? (
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 shadow-sm">
                <Hourglass className="w-9 h-9 animate-pulse" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            )}

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                isPending
                  ? 'bg-amber-50 text-amber-700 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isPending ? 'Request Pending Approval' : 'Booking Confirmed'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight font-sans">
              {isPending ? 'Appointment Request Received!' : 'Appointment Confirmed!'}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-SECONDARY mt-1 max-w-md">
              {isPending
                ? `Your booking request has been submitted and is pending admin review. A notification email has been sent to ${appointment.customerEmail}.`
                : `A confirmation email has been sent to ${appointment.customerEmail}.`}
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-ivory border border-ivory-BORDER rounded-xl p-6 text-left space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-ivory-BORDER pb-3">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wide">
                Booking Details
              </span>
              <span className="text-xs font-mono font-bold text-gold-DARK bg-gold-SOFT px-2.5 py-0.5 rounded border border-gold-BORDER">
                ID: {appointment._id ? appointment._id.slice(-6).toUpperCase() : 'APP-01'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gold-PRIMARY flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-MUTED block text-[11px]">Scheduled Date</span>
                  <span className="font-bold text-charcoal text-sm">
                    {new Date(appointment.appointmentDate + 'T00:00:00').toLocaleDateString(
                      'en-US',
                      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-PRIMARY flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-MUTED block text-[11px]">Time & Duration</span>
                  <span className="font-bold text-charcoal text-sm">
                    {format12Hour(appointment.startTime)} - {format12Hour(appointment.endTime)}
                  </span>
                  <span className="text-[10px] text-charcoal-MUTED block font-medium">
                    ({appointment.duration} Minutes Duration)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {appointment.meetingTypeTitle === 'Phone Call' ? (
                  <Phone className="w-4 h-4 text-gold-PRIMARY flex-shrink-0 mt-0.5" />
                ) : (
                  <Video className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-charcoal-MUTED block text-[11px]">Meeting Platform</span>
                  <span className="font-bold text-charcoal text-sm">
                    {appointment.meetingTypeTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gold-PRIMARY flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-MUTED block text-[11px]">Customer Name</span>
                  <span className="font-bold text-charcoal text-sm">
                    {appointment.customerName}
                  </span>
                </div>
              </div>
            </div>

            {/* Meeting Link / Action Box */}
            {appointment.meetingLink && !isPending && (
              <div className="pt-3 border-t border-ivory-BORDER flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-gold-BORDER/50">
                <div className="text-xs">
                  <span className="font-bold text-charcoal block">Google Meet / Zoom Link</span>
                  <span className="text-[11px] text-charcoal-MUTED truncate max-w-xs block">
                    {appointment.meetingLink}
                  </span>
                </div>
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap"
                >
                  Join Meeting
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-ivory-BORDER bg-white text-charcoal font-bold text-xs shadow-xs hover:bg-ivory transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold-PRIMARY text-white font-bold text-xs shadow-gold hover:bg-gold-DARK transition-all"
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
