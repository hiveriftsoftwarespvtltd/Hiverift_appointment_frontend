import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Building,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Shield,
  Sparkles,
  Check,
  CalendarCheck2,
  Globe,
} from 'lucide-react';
import bookingAppointmentImg from '../../assets/bookingappointment.png';
import hiveriftLogo from '../../assets/LOGO.svg';
import api from '../../services/api';

// Popular Timezone Options with clean labels for mobile & desktop
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: '🇮🇳 India (IST, UTC+5:30)' },
  { value: 'America/New_York', label: '🇺🇸 US Eastern (ET, UTC-5)' },
  { value: 'America/Chicago', label: '🇺🇸 US Central (CT, UTC-6)' },
  { value: 'America/Denver', label: '🇺🇸 US Mountain (MT, UTC-7)' },
  { value: 'America/Los_Angeles', label: '🇺🇸 US Pacific (PT, UTC-8)' },
  { value: 'Europe/London', label: '🇬🇧 UK London (GMT/BST)' },
  { value: 'Europe/Paris', label: '🇪🇺 Europe Paris/Berlin (CET)' },
  { value: 'Asia/Dubai', label: '🇦🇪 Dubai (GST, UTC+4)' },
  { value: 'Asia/Singapore', label: '🇸🇬 Singapore (SGT, UTC+8)' },
  { value: 'Australia/Sydney', label: '🇦🇺 Sydney (AEST, UTC+10)' },
  { value: 'Asia/Tokyo', label: '🇯🇵 Tokyo (JST, UTC+9)' },
  { value: 'America/Toronto', label: '🇨🇦 Toronto (ET, UTC-5)' },
  { value: 'America/Vancouver', label: '🇨🇦 Vancouver (PT, UTC-8)' },
];

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

// Convert ET Date (YYYY-MM-DD) & Time (HH:mm) to any client Timezone
const convertSlotFromET = (dateStr, timeStr, targetTimeZone, durationMins = 30) => {
  if (!dateStr || !timeStr) return { startLabel: '', endLabel: '', clientDate: '' };

  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);

  // Guess UTC
  const guess = new Date(Date.UTC(y, m - 1, d, h, min, 0));

  // Determine America/New_York offset difference
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

  // Format in Target TimeZone
  const tzTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const tzDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    startLabel: tzTimeFormatter.format(startUtc),
    endLabel: tzTimeFormatter.format(endUtc),
    clientDate: tzDateFormatter.format(startUtc),
  };
};

export const BookingPage = () => {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [selectedMeetingType, setSelectedMeetingType] = useState(null);

  // Timezone state: Detect client's local timezone automatically
  const [clientTimezone, setClientTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch (e) {
      return 'Asia/Kolkata';
    }
  });

  // Today in ET
  const todayInET = getTodayInET();
  const [selectedDate, setSelectedDate] = useState(todayInET);
  const [selectedTime, setSelectedTime] = useState(''); // HH:mm in ET
  const duration = 30; // Fixed to 30 minutes

  // Calendar navigation state (Year and Month)
  const [currentYear, setCurrentYear] = useState(() => {
    const [y] = todayInET.split('-').map(Number);
    return y;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [, m] = todayInET.split('-').map(Number);
    return m - 1; // 0-indexed month
  });

  // Availability state
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Customer Form Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [purpose, setPurpose] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Day index (0-6) to Backend DayOfWeek Enum Mapping
  const DAY_INDEX_TO_ENUM = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];

  // Admin Working Hours & Blocked Times state
  const [workingHours, setWorkingHours] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);

  // Helper: Check if a date is disabled (Past date OR Inactive day in Working Hours OR Blocked Full-day)
  const isDateDisabled = (dateStr) => {
    if (!dateStr) return true;
    if (dateStr < todayInET) return true; // Past date

    const [y, m, d] = dateStr.split('-').map(Number);
    // Use UTC date to avoid any browser timezone offset shifts
    const dayIndex = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay(); // 0 is Sunday, 1 is Monday...
    const dayEnum = DAY_INDEX_TO_ENUM[dayIndex];

    // 1. Check against Admin Working Hours
    if (workingHours && workingHours.length > 0) {
      const wh = workingHours.find(
        (w) =>
          String(w.dayOfWeek).toUpperCase() === dayEnum ||
          w.dayOfWeek === dayIndex,
      );
      if (wh && wh.isActive === false) {
        return true; // Admin marked this day of week as inactive / closed!
      }
    } else if (dayIndex === 0) {
      return true; // Default fallback: Sunday closed
    }

    // 2. Check against Admin Blocked Times (Full Day)
    if (blockedTimes && blockedTimes.length > 0) {
      const isBlocked = blockedTimes.some(
        (b) =>
          b.blockedDate === dateStr &&
          (b.isFullDay || (!b.startTime && !b.endTime)),
      );
      if (isBlocked) return true;
    }

    return false;
  };

  // Fetch Meeting Types, Working Hours, and Blocked Times on Mount
  useEffect(() => {
    api
      .get('/meeting-types')
      .then((res) => {
        setMeetingTypes(res.data);
        if (res.data.length > 0) {
          setSelectedMeetingType(res.data[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching meeting types', err);
      });

    api
      .get('/working-hours')
      .then((res) => {
        setWorkingHours(res.data);
      })
      .catch((err) => {
        console.error('Error fetching working hours', err);
      });

    api
      .get('/blocked-times')
      .then((res) => {
        setBlockedTimes(res.data);
      })
      .catch((err) => {
        console.error('Error fetching blocked times', err);
      });
  }, []);

  // Ensure default selected date is an active working date when config loads
  useEffect(() => {
    if (workingHours.length > 0 && isDateDisabled(selectedDate)) {
      const [y, m, d] = todayInET.split('-').map(Number);
      let checkDate = new Date(y, m - 1, d);
      for (let i = 0; i < 30; i++) {
        const padM =
          checkDate.getMonth() + 1 < 10
            ? '0' + (checkDate.getMonth() + 1)
            : checkDate.getMonth() + 1;
        const padD =
          checkDate.getDate() < 10 ? '0' + checkDate.getDate() : checkDate.getDate();
        const checkStr = `${checkDate.getFullYear()}-${padM}-${padD}`;
        if (!isDateDisabled(checkStr)) {
          setSelectedDate(checkStr);
          setCurrentYear(checkDate.getFullYear());
          setCurrentMonth(checkDate.getMonth());
          break;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    }
  }, [workingHours, blockedTimes]);

  // Fetch Availability whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    setAvailabilityLoading(true);
    setSelectedTime(''); // Do NOT auto select; wait for user to click a slot!

    api
      .get(`/appointments/availability?date=${selectedDate}&duration=${duration}`)
      .then((res) => {
        setAvailability(res.data);
      })
      .catch((err) => {
        console.error('Error checking availability', err);
      })
      .finally(() => {
        setAvailabilityLoading(false);
      });
  }, [selectedDate]);

  // Calendar Helper Functions
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
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

  const getEndTimeFormatted = (startTime24) => {
    if (!startTime24) return '';
    const [h, m] = startTime24.split(':').map(Number);
    const totalMins = h * 60 + m + duration;
    const endH = Math.floor(totalMins / 60);
    const endM = totalMins % 60;
    const endPadH = endH < 10 ? '0' + endH : endH.toString();
    const endPadM = endM < 10 ? '0' + endM : endM.toString();
    return format12Hour(`${endPadH}:${endPadM}`);
  };

  // Step Navigation
  const handleNextStep = () => {
    if (step === 1 && !selectedMeetingType) {
      alert('Please select a meeting type.');
      return;
    }
    if (step === 2) {
      if (!selectedDate || !selectedTime) {
        alert('Please select an available 30-minute time slot.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Form Submission
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!firstName.trim() || !lastName.trim()) {
      setBookingError('Please enter both your First Name and Last Name.');
      return;
    }

    if (!customerMobile || customerMobile.length !== 10) {
      setBookingError('Please enter a valid 10-digit US mobile number (numbers only).');
      return;
    }

    if (!customerEmail.trim()) {
      setBookingError('Please enter your email address.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setBookingError('Please select a valid date and 30-minute time slot.');
      return;
    }

    setBookingLoading(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        customerMobile: customerMobile.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        businessName: businessName.trim(),
        companyName: businessName.trim(),
        purpose: purpose.trim(),
        meetingTypeId: selectedMeetingType._id,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        duration: 30, // Strictly 30 mins
        clientTimezone: clientTimezone,
      };

      const res = await api.post('/appointments', payload);
      if (res.data && res.data.appointment) {
        navigate(`/appointment/confirmation/${res.data.appointment._id}`, {
          state: {
            appointment: res.data.appointment,
            clientTimezone: clientTimezone,
          },
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to book appointment. Please verify availability and try again.';
      setBookingError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Render Meeting Type Icon
  const renderIconForMeeting = (typeCode) => {
    switch (typeCode) {
      case 'GOOGLE_MEET':
        return <Video className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />;
      case 'ZOOM':
        return <Video className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />;
      case 'PHONE_CALL':
        return <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#2578FB]" />;
      default:
        return <Video className="w-5 h-5 sm:w-6 sm:h-6 text-[#2578FB]" />;
    }
  };

  // Converted current selected slot times
  const selectedSlotClientTz = convertSlotFromET(
    selectedDate,
    selectedTime,
    clientTimezone,
    duration,
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 sm:py-10 md:py-12 px-3 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat relative overflow-hidden bg-ivory text-charcoal font-sans"
      style={{
        backgroundImage: `url(${bookingAppointmentImg})`,
      }}
    >
      <div className="max-w-6xl w-full mx-auto relative z-10">
        <div className="rounded-2xl sm:rounded-3xl border border-[#BFD8FF] shadow-floating p-4 sm:p-8 md:p-12 relative overflow-hidden backdrop-blur-md bg-white/95">

          {/* Header / Brand Logo & Title */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 relative z-10 flex flex-col items-center">
            <img
              src={hiveriftLogo}
              alt="HiveRift Logo"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain mb-3 sm:mb-4"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#2578FB] animate-pulse" />
              Consultation Booking
            </div>
            <h1 className="font-extrabold text-xl sm:text-3xl md:text-4xl text-[#111827] tracking-tight font-sans">
              Book Your 30-Minute Consultation
            </h1>
          </div>

          {/* STEPPER PROGRESS HEADER - Fully Responsive on Mobile & Desktop */}
          <div className="mb-6 sm:mb-10 max-w-4xl mx-auto bg-white/90 backdrop-blur-md p-3 sm:p-6 rounded-2xl shadow-xs relative z-10 border border-[#E2E8F0]">
            <div className="flex items-center justify-between relative">
              {/* Background Progress Line */}
              <div className="absolute left-[10%] right-[10%] sm:left-[12%] sm:right-[12%] top-4 sm:top-5.5 -translate-y-1/2 h-1 sm:h-1.5 bg-[#E4E9F0] rounded-full z-0"></div>

              {/* Active Progress Line */}
              <div
                className="absolute left-[10%] sm:left-[12%] top-4 sm:top-5.5 -translate-y-1/2 h-1 sm:h-1.5 bg-gradient-to-r from-[#2578FB] to-[#1257C7] rounded-full transition-all duration-500 shadow-blue z-0"
                style={{ width: `${((step - 1) / 3) * 78}%` }}
              ></div>

              {[
                { num: 1, title: 'Meeting Type', shortTitle: 'Type', icon: CalendarCheck2 },
                { num: 2, title: 'Date & Time', shortTitle: 'Time', icon: Clock },
                { num: 3, title: 'Your Details', shortTitle: 'Details', icon: User },
                { num: 4, title: 'Confirmation', shortTitle: 'Confirm', icon: CheckCircle2 },
              ].map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                const Icon = s.icon;

                return (
                  <div
                    key={s.num}
                    className="flex flex-col items-center relative z-10 space-y-1 sm:space-y-2 group cursor-pointer"
                    onClick={() => isCompleted && setStep(s.num)}
                  >
                    <div
                      className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all duration-300 ${isActive
                        ? 'bg-gradient-to-br from-[#2578FB] to-[#1257C7] text-white ring-3 sm:ring-4 ring-[#2578FB]/20 scale-105 sm:scale-110 shadow-blue'
                        : isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs hover:scale-105'
                          : 'bg-white border-2 border-[#DCE3EC] text-[#8A94A6] shadow-2xs'
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>

                    <div className="text-center">
                      <span
                        className={`block text-[8px] sm:text-[10px] font-extrabold uppercase tracking-tight sm:tracking-wider ${isActive
                          ? 'text-[#2578FB]'
                          : isCompleted
                            ? 'text-emerald-600'
                            : 'text-[#8A94A6]'
                          }`}
                      >
                        Step {s.num}
                      </span>
                      <span
                        className={`text-[10px] sm:text-xs font-bold transition-colors leading-tight ${isActive
                          ? 'text-[#111827]'
                          : isCompleted
                            ? 'text-emerald-700'
                            : 'text-[#5B6472]'
                          }`}
                      >
                        <span className="sm:hidden">{s.shortTitle}</span>
                        <span className="hidden sm:inline">{s.title}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN STEP CONTENT AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

            {/* Left Selection Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* STEP 1: Meeting Type */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                      Select Meeting Type
                    </h3>
                    <p className="text-xs text-[#5B6472]">
                      Choose your preferred consultation format.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {meetingTypes.map((type) => {
                      const isSelected = selectedMeetingType?._id === type._id;
                      return (
                        <div
                          key={type._id}
                          onClick={() => setSelectedMeetingType(type)}
                          className={`cursor-pointer rounded-xl p-3.5 sm:p-4 border transition-all flex flex-col justify-between h-28 sm:h-36 ${isSelected
                            ? 'bg-[#EAF3FF] border-2 border-[#2578FB] shadow-blue scale-[1.01]'
                            : 'bg-white border-[#E2E8F0] hover:border-[#BFD8FF] hover:bg-[#EAF3FF]/40'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-white border border-[#E2E8F0]">
                              {renderIconForMeeting(type.type)}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#2578FB]" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-[#111827]">
                              {type.title}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-[#5B6472] truncate mt-0.5">
                              {type.type === 'PHONE_CALL'
                                ? 'Direct voice consultation'
                                : type.type === 'GOOGLE_MEET'
                                  ? 'Google Meet video call'
                                  : 'Zoom video conference'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Interactive Calendar & 30-Minute Slots with Responsive Timezone Selector */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-6 animate-fadeIn">

                  {/* Fixed 30-Minute Duration Banner + Responsive Timezone Dropdown */}
                  <div className="bg-gradient-to-r from-[#EAF3FF] to-[#F0F7FF] border border-[#BFD8FF] p-3 sm:p-4 rounded-2xl shadow-xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2578FB] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-blue flex-shrink-0">
                          30m
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#111827]">
                            30 Minutes Consultation
                          </h4>
                          <p className="text-[10px] sm:text-xs text-[#5B6472] font-medium">
                            Standard consultation length
                          </p>
                        </div>
                      </div>

                      {/* Timezone Selector - Clean and Mobile-Overflow Proof */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#BFD8FF] shadow-xs w-full sm:w-auto min-w-0">
                        <Globe className="w-3.5 h-3.5 text-[#2578FB] flex-shrink-0" />
                        <div className="flex flex-col text-left min-w-0 flex-1">
                          <label className="text-[8px] sm:text-[9px] font-extrabold text-[#5B6472] uppercase tracking-wider">
                            Your Timezone
                          </label>
                          <select
                            value={clientTimezone}
                            onChange={(e) => setClientTimezone(e.target.value)}
                            className="text-xs font-bold text-[#111827] bg-transparent focus:outline-none cursor-pointer w-full truncate pr-1"
                          >
                            {!TIMEZONE_OPTIONS.some((t) => t.value === clientTimezone) && (
                              <option value={clientTimezone}>
                                🌐 {clientTimezone}
                              </option>
                            )}
                            {TIMEZONE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calendar + Time Slot Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">

                    {/* Left: Monthly Calendar (7 Cols) */}
                    <div className="md:col-span-7 space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                        <div>
                          <h4 className="text-sm sm:text-base font-extrabold text-[#111827]">
                            {monthNames[currentMonth]} {currentYear}
                          </h4>
                          <span className="text-[10px] sm:text-[11px] text-[#5B6472] font-medium">
                            Select Consultation Date
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 sm:p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#5B6472] hover:text-[#111827] transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 sm:p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#5B6472] hover:text-[#111827] transition-all cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold text-[#8A94A6]">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <div key={d} className="py-0.5 sm:py-1">
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days Matrix */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {/* Empty offset cells before 1st day */}
                        {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }).map(
                          (_, idx) => (
                            <div key={`blank-${idx}`} className="h-8 sm:h-9"></div>
                          ),
                        )}

                        {/* Days of Month */}
                        {Array.from({
                          length: getDaysInMonth(currentYear, currentMonth),
                        }).map((_, idx) => {
                          const dayNum = idx + 1;
                          const padM =
                            currentMonth + 1 < 10
                              ? '0' + (currentMonth + 1)
                              : currentMonth + 1;
                          const padD = dayNum < 10 ? '0' + dayNum : dayNum;
                          const dateStr = `${currentYear}-${padM}-${padD}`;

                          const isPast = dateStr < todayInET;
                          const isToday = dateStr === todayInET;
                          const isSelected = dateStr === selectedDate;
                          const isDisabled = isDateDisabled(dateStr);

                          return (
                            <button
                              key={dateStr}
                              type="button"
                              disabled={isDisabled || isPast}
                              onClick={() => !isDisabled && !isPast && setSelectedDate(dateStr)}
                              title={
                                isDisabled
                                  ? 'Closed / Holiday / Inactive Day'
                                  : isPast
                                  ? 'Past date'
                                  : `Select ${dateStr}`
                              }
                              className={`h-8 sm:h-9 rounded-xl text-xs sm:text-sm font-bold transition-all relative flex items-center justify-center ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white shadow-blue scale-105 z-10 cursor-pointer'
                                  : isDisabled || isPast
                                    ? 'text-[#94A3B8] cursor-not-allowed select-none'
                                    : 'text-[#111827] hover:bg-[#EAF3FF] hover:text-[#2578FB] cursor-pointer'
                              }`}
                            >
                              <span>{dayNum}</span>
                              {isToday && !isSelected && !isDisabled && !isPast && (
                                <span className="w-1.5 h-1.5 bg-[#2578FB] rounded-full absolute bottom-1"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Calendar Bottom Legend */}
                      <div className="pt-2 sm:pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] sm:text-[11px] text-[#5B6472]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#2578FB]"></span>
                          <span>Selected Date</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#CBD5E1]"></span>
                          <span>Closed / Holiday</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Available 30-Minute Slots in Client Timezone (5 Cols) */}
                    <div className="md:col-span-5 md:border-l md:border-[#E2E8F0] md:pl-6 space-y-3 sm:space-y-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#111827]">
                            Available Slots
                          </h4>
                          <span className="text-[9px] sm:text-[10px] font-bold text-[#2578FB] bg-[#EAF3FF] px-2 py-0.5 rounded-md border border-[#BFD8FF]">
                            {clientTimezone.split('/')[1] || clientTimezone}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-[#5B6472] mt-0.5">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Loading State */}
                      {availabilityLoading && (
                        <div className="py-6 sm:py-8 flex flex-col items-center justify-center gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#BFD8FF] border-t-[#2578FB] rounded-full animate-spin"></div>
                          <span className="text-[10px] sm:text-[11px] text-[#5B6472] font-semibold">
                            Loading slots...
                          </span>
                        </div>
                      )}

                      {/* Closed or Blocked Day Notice */}
                      {!availabilityLoading && availability && !availability.isAvailableDay && (
                        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center space-y-1">
                          <AlertCircle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                          <p className="font-bold text-xs">No slots available</p>
                          <p className="text-[10px] sm:text-[11px] text-amber-700">
                            {availability.reason || 'Organization is closed on this day.'}
                          </p>
                        </div>
                      )}

                      {/* Available Slots Grid */}
                      {!availabilityLoading &&
                        availability &&
                        availability.isAvailableDay &&
                        availability.slots && (
                          <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                            {availability.slots.length === 0 ? (
                              <p className="text-xs text-center text-[#5B6472] py-4">
                                No 30-minute slots available.
                              </p>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {availability.slots.map((slot) => {
                                  const isSelected = selectedTime === slot.time;
                                  const conv = convertSlotFromET(
                                    selectedDate,
                                    slot.time,
                                    clientTimezone,
                                    duration,
                                  );

                                  return (
                                    <button
                                      key={slot.time}
                                      type="button"
                                      disabled={!slot.available}
                                      onClick={() => setSelectedTime(slot.time)}
                                      className={`px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-start justify-center cursor-pointer relative min-h-[44px] ${isSelected
                                        ? 'bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white border-[#2578FB] shadow-blue scale-[1.02]'
                                        : slot.available
                                          ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#111827] hover:border-[#BFD8FF] hover:bg-[#EAF3FF]'
                                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-extrabold text-[11px] sm:text-xs">
                                          {conv.startLabel}
                                        </span>
                                        {isSelected && (
                                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                                        )}
                                      </div>
                                      {clientTimezone !== 'America/New_York' && (
                                        <span
                                          className={`text-[8px] sm:text-[9px] font-medium mt-0.5 ${isSelected ? 'text-blue-100' : 'text-[#5B6472]'
                                            }`}
                                        >
                                          {format12Hour(slot.time)} ET
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Selected Slot Time Preview */}
                      {selectedTime && (
                        <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] sm:text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>
                              {selectedSlotClientTz.startLabel} - {selectedSlotClientTz.endLabel}
                            </span>
                          </div>
                          {clientTimezone !== 'America/New_York' && (
                            <p className="text-[9px] sm:text-[10px] text-emerald-700 pl-5">
                              Organizer: {format12Hour(selectedTime)} -{' '}
                              {getEndTimeFormatted(selectedTime)} ET
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3: Customer Details Form */}
              {step === 3 && (
                <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                      Booking Information
                    </h3>
                    <p className="text-xs text-[#5B6472]">
                      Enter your information to receive meeting link and calendar invite.
                    </p>
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                      {bookingError}
                    </div>
                  )}

                  <form
                    onSubmit={handleConfirmBooking}
                    className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0]"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 font-medium"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 font-medium"
                          />
                        </div>
                      </div>

                      {/* Business Name */}
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Business Name
                        </label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="Business name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 font-medium"
                          />
                        </div>
                      </div>

                      {/* Mobile Number (10 Digit Numeric Validation) */}
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Mobile Number <span className="text-red-500">*</span> (10 Digits)
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            placeholder="10-digit mobile number"
                            value={customerMobile}
                            onChange={(e) => {
                              const digitsOnly = e.target.value
                                .replace(/[^0-9]/g, '')
                                .slice(0, 10);
                              setCustomerMobile(digitsOnly);
                            }}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 font-mono"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                          <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 font-medium"
                          />
                        </div>
                      </div>

                      {/* Purpose */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Purpose of Consultation
                        </label>
                        <div className="relative">
                          <FileText className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                          <textarea
                            rows={3}
                            placeholder="Briefly describe meeting objective"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: Review & Confirm */}
              {step === 4 && (
                <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                      Review & Confirm
                    </h3>
                    <p className="text-xs text-[#5B6472]">
                      Review your consultation details before finalizing.
                    </p>
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                      {bookingError}
                    </div>
                  )}

                  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] space-y-3 sm:space-y-4 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-semibold">
                          Full Name
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#111827]">
                          {firstName} {lastName}
                        </span>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-semibold">
                          Business Name
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#111827]">
                          {businessName || 'N/A'}
                        </span>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-semibold">
                          Mobile Number
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#111827] font-mono">
                          {customerMobile}
                        </span>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-semibold">
                          Email Address
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#111827] truncate block">
                          {customerEmail}
                        </span>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-semibold">
                          Your Local Time ({clientTimezone.split('/')[1] || clientTimezone})
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#2578FB]">
                          {selectedSlotClientTz.startLabel} - {selectedSlotClientTz.endLabel}
                        </span>
                        {clientTimezone !== 'America/New_York' && (
                          <span className="text-[10px] text-[#5B6472] block mt-0.5 font-medium">
                            Organizer: {format12Hour(selectedTime)} -{' '}
                            {getEndTimeFormatted(selectedTime)} ET
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-semibold">
                          Meeting Type & Length
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#111827]">
                          {selectedMeetingType?.title} (30 Mins)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Step Control Buttons */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#111827] font-bold text-xs hover:bg-[#F8FAFC] transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-bold text-xs shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] transition-all cursor-pointer"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={bookingLoading}
                    onClick={handleConfirmBooking}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-extrabold text-xs sm:text-sm shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Book</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>

            {/* Right Summary Column (4 cols) */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-card space-y-3 sm:space-y-4 lg:sticky lg:top-24">
              <div className="border-b border-[#E2E8F0] pb-2.5 flex items-center justify-between">
                <h4 className="font-extrabold text-xs sm:text-sm text-[#111827]">
                  Consultation Summary
                </h4>
                <span className="text-[9px] sm:text-[10px] font-extrabold bg-[#EAF3FF] text-[#2578FB] px-2 py-0.5 rounded-md border border-[#BFD8FF]">
                  {selectedTime ? (clientTimezone.split('/')[1] || clientTimezone) : '30 Mins'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-medium">
                    Meeting Type
                  </span>
                  <span className="font-bold text-[#111827]">
                    {selectedMeetingType?.title || 'Not Selected'}
                  </span>
                </div>

                <div>
                  <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-medium">
                    Date
                  </span>
                  <span className="font-bold text-[#111827]">
                    {step > 1 && selectedDate ? selectedDate : 'Select in Step 2'}
                  </span>
                </div>

                {/* Time Display: Only shows once client selects a slot in Step 2 */}
                <div>
                  <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-medium">
                    {selectedTime
                      ? `Your Time (${clientTimezone.split('/')[1] || clientTimezone})`
                      : 'Time Slot'}
                  </span>
                  <span className="font-bold text-[#2578FB]">
                    {selectedTime
                      ? `${selectedSlotClientTz.startLabel} - ${selectedSlotClientTz.endLabel} (30 Mins)`
                      : 'Not Selected Yet'}
                  </span>
                </div>

                {selectedTime && clientTimezone !== 'America/New_York' && (
                  <div>
                    <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-medium">
                      Organizer Time (ET)
                    </span>
                    <span className="font-semibold text-[#111827]">
                      {format12Hour(selectedTime)} - {getEndTimeFormatted(selectedTime)} ET
                    </span>
                  </div>
                )}

                {firstName && (
                  <div>
                    <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-medium">
                      Client Name
                    </span>
                    <span className="font-bold text-[#111827]">
                      {firstName} {lastName}
                    </span>
                  </div>
                )}

                {businessName && (
                  <div>
                    <span className="text-[#5B6472] block text-[10px] sm:text-[11px] font-medium">
                      Business Name
                    </span>
                    <span className="font-bold text-[#111827]">{businessName}</span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-[#E2E8F0]">
                <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-2 text-[10px] sm:text-[11px] text-[#5B6472]">
                  <Shield className="w-3.5 h-3.5 text-[#2578FB] flex-shrink-0" />
                  <span>No upfront payment required. Instant confirmation.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingPage;
