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
  ArrowRight,
  Zap,
  Check,
  Star,
  Layers,
  Lock,
  CalendarCheck2,
} from 'lucide-react';
import heroBanner from '../../assets/herobanner.png';
import bookingAppointmentImg from '../../assets/bookingappointment.png';
import api from '../../services/api';

export const BookingPage = () => {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [selectedMeetingType, setSelectedMeetingType] = useState(null);

  // Default date to today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Time state - default 10:00 AM (10:00)
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [duration, setDuration] = useState(30);

  // Availability state
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [timeError, setTimeError] = useState('');

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [purpose, setPurpose] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch Meeting Types
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
  }, []);

  // Fetch Availability whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    setAvailabilityLoading(true);
    setTimeError('');

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
  }, [selectedDate, duration]);

  // Helper: Convert time HH:mm to minutes from midnight
  const timeToMins = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper: Convert minutes from midnight to 12h format string (e.g. 11:37 AM)
  const format12Hour = (time24) => {
    if (!time24) return '';
    let [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const mins = m < 10 ? '0' + m : m;
    return `${h}:${mins} ${ampm}`;
  };

  // Compute End Time 12h string
  const getEndTimeStr = (time24, dur) => {
    if (!time24) return '';
    const startMins = timeToMins(time24);
    const endMins = startMins + Number(dur);
    const h = Math.floor(endMins / 60);
    const m = endMins % 60;
    const padH = h < 10 ? '0' + h : h;
    const padM = m < 10 ? '0' + m : m;
    return format12Hour(`${padH}:${padM}`);
  };

  // Real-time time validation
  useEffect(() => {
    if (!selectedTime || !availability) return;
    setTimeError('');

    if (!availability.isAvailableDay) {
      setTimeError(availability.reason || 'Organization is closed on this day.');
      return;
    }

    const reqStartMins = timeToMins(selectedTime);
    const reqEndMins = reqStartMins + Number(duration);

    // Check past date / time today
    if (selectedDate < todayStr) {
      setTimeError('Cannot select a past date.');
      return;
    }
    if (selectedDate === todayStr) {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      if (reqStartMins < currentMins) {
        setTimeError('Selected time has already passed today.');
        return;
      }
    }

    // Check Working Hours
    if (availability.workingHours) {
      const wStartMins = timeToMins(availability.workingHours.startTime);
      const wEndMins = timeToMins(availability.workingHours.endTime);

      if (reqStartMins < wStartMins || reqEndMins > wEndMins) {
        setTimeError(
          `Appointment must end within working hours (${format12Hour(
            availability.workingHours.startTime,
          )} - ${format12Hour(availability.workingHours.endTime)}).`,
        );
        return;
      }
    }

    // Check Blocked Times
    if (availability.blockedTimes && availability.blockedTimes.length > 0) {
      for (const block of availability.blockedTimes) {
        if (block.isFullDay) {
          setTimeError(`Selected date is blocked (${block.reason}).`);
          return;
        }
        if (block.startTime && block.endTime) {
          const bStart = timeToMins(block.startTime);
          const bEnd = timeToMins(block.endTime);
          if (reqStartMins < bEnd && reqEndMins > bStart) {
            setTimeError(
              `Selected time overlaps with a blocked period (${format12Hour(
                block.startTime,
              )} - ${format12Hour(block.endTime)}: ${block.reason}).`,
            );
            return;
          }
        }
      }
    }

    // Check Existing Bookings
    if (availability.existingBookings && availability.existingBookings.length > 0) {
      for (const booking of availability.existingBookings) {
        const bkStart = timeToMins(booking.startTime);
        const bkEnd = timeToMins(booking.endTime);
        if (reqStartMins < bkEnd && reqEndMins > bkStart) {
          setTimeError(
            `Selected time slot overlaps with an existing appointment (${format12Hour(
              booking.startTime,
            )} - ${format12Hour(booking.endTime)}). Please choose another time.`,
          );
          return;
        }
      }
    }
  }, [selectedTime, selectedDate, duration, availability]);

  const handleNextStep = () => {
    if (step === 1 && !selectedMeetingType) {
      alert('Please select a meeting type.');
      return;
    }
    if (step === 2) {
      if (!selectedDate || !selectedTime) {
        alert('Please select a date and time.');
        return;
      }
      if (timeError) {
        alert(timeError);
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!customerName || !customerMobile || !customerEmail) {
      setBookingError('Please fill in all required fields (Name, Mobile, Email).');
      return;
    }

    setBookingLoading(true);

    try {
      const payload = {
        customerName,
        customerMobile,
        customerEmail,
        companyName,
        purpose,
        meetingTypeId: selectedMeetingType._id,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        duration: Number(duration),
      };

      const res = await api.post('/appointments', payload);
      if (res.data && res.data.appointment) {
        navigate(`/appointment/confirmation/${res.data.appointment._id}`, {
          state: { appointment: res.data.appointment },
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to book appointment. Please check availability and try again.';
      setBookingError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const renderIconForMeeting = (typeCode) => {
    switch (typeCode) {
      case 'GOOGLE_MEET':
        return <Video className="w-6 h-6 text-emerald-600" />;
      case 'ZOOM':
        return <Video className="w-6 h-6 text-blue-600" />;
      case 'PHONE_CALL':
        return <Phone className="w-6 h-6 text-gold-PRIMARY" />;
      default:
        return <Video className="w-6 h-6 text-gold-PRIMARY" />;
    }
  };

  return (
    <div className="bg-ivory text-charcoal font-sans overflow-x-hidden w-full">

      {/* 1. HERO SECTION WITH 100% FULL-WIDTH BACKGROUND IMAGE */}
      <section
        id="home"
        className="relative w-full py-10 sm:py-14 bg-cover bg-center bg-no-repeat overflow-hidden border-b border-[#E4E9F0]"
        style={{
          backgroundImage: `url(${heroBanner})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-[#2578FB]" />
                SIMPLE · FAST · SECURE
              </div>

              <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#111827] tracking-tight font-sans leading-[1.15]">
                Schedule Your Appointment <span className="text-[#2578FB]">in Just a Few Clicks</span>
              </h1>

              <p className="text-[#5B6472] text-base sm:text-lg leading-relaxed max-w-xl font-medium">
                Book a Google Meet, Zoom, or Phone Call with our team at a time that suits you. No login required.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => scrollToSection('book-appointment')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-bold text-sm shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] transition-all hover:-translate-y-0.5"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Book an Appointment
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#BFD8FF] text-[#2578FB] font-bold text-sm hover:bg-[#EAF3FF] transition-all"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Micro pills */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#5B6472] font-semibold">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#2578FB]" />
                  No Login Required
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#2578FB]" />
                  Quick & Easy
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#2578FB]" />
                  100% Secure
                </span>
              </div>
            </div>

            {/* Hero Right Mockup Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl p-3 bg-gradient-to-tr from-[#BFD8FF]/30 via-[#EAF3FF] to-white border border-[#BFD8FF]/50 shadow-outer">
                <img
                  src="/images/hero_laptop_mockup.png"
                  alt="HiveRift Appointment Booking Mockup"
                  className="w-full h-auto rounded-2xl object-cover shadow-subtle hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION (WHY CHOOSE HIVERIFT?) */}
      <section id="services" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#2578FB] uppercase tracking-widest">
            WHY CHOOSE HIVERIFT?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-2 tracking-tight">
            A <span className="text-[#2578FB]">Better Way</span> to Meet
          </h2>
          <p className="text-[#5B6472] text-sm sm:text-base mt-2">
            We make scheduling simple, efficient and hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: CalendarIcon,
              title: 'Easy Scheduling',
              desc: "Pick a date and any available time slot within our working hours. It's that simple.",
            },
            {
              icon: Video,
              title: 'Multiple Meeting Types',
              desc: 'Choose between Google Meet, Zoom, or a Phone Call - whatever works best for you.',
            },
            {
              icon: User,
              title: 'No Login Needed',
              desc: 'Book your appointment without creating an account or logging in. Just fill in your details.',
            },
            {
              icon: Lock,
              title: 'Secure & Private',
              desc: 'Your information is safe with us, and will never be shared with anyone.',
            },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-subtle hover:border-[#BFD8FF] hover:shadow-blue hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EAF3FF] border border-[#BFD8FF] flex items-center justify-center text-[#2578FB] mb-4 group-hover:scale-110 transition-transform">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#111827] mb-2">{item.title}</h3>
                <p className="text-xs text-[#5B6472] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ABOUT US SECTION */}
      <section id="about" className="py-12 bg-white/70 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Image with Floating Badges & HiveRift Highlights */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl p-3 bg-[#F8FAFC] border border-[#E2E8F0] shadow-outer overflow-visible">
                <img
                  src="/images/about_us_usa_executive.png"
                  alt="About HiveRift Team"
                  className="w-full h-[410px] object-cover rounded-2xl shadow-subtle"
                />

                {/* Bottom Left Floating Badge */}
                <div className="absolute -bottom-5 left-4 sm:left-6 bg-white border border-[#BFD8FF] shadow-xl px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2578FB] text-white flex items-center justify-center shadow-blue">
                    <Star className="w-4.5 h-4.5 fill-current" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-[#111827] block">5,000+</span>
                    <span className="text-[10px] text-[#5B6472] font-bold block">Appointments Booked</span>
                  </div>
                </div>

                {/* Bottom Right Floating Badge */}
                <div className="absolute -bottom-5 right-4 sm:right-6 bg-white border border-emerald-300 shadow-xl px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-[#111827] block">Instant Sync</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold block">Google Meet & Zoom</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right About Text */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-[#2578FB] uppercase tracking-widest">
                ABOUT HIVERIFT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight">
                Your Time <span className="text-[#2578FB]">Matters</span>, We Make It Count
              </h2>
              <p className="text-[#5B6472] text-sm leading-relaxed">
                HiveRift helps you connect with our experts at a time that works best for you. Whether it's a quick discussion or a detailed consultation, we're here to help.
              </p>

              <div className="space-y-3 pt-2 text-xs font-semibold text-[#5B6472]">
                {[
                  'Flexible scheduling within working hours',
                  'Real-time availability to avoid conflicts',
                  'Instant confirmation with meeting details',
                  'Professional support whenever you need it',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] flex items-center justify-center text-[#2578FB]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <button
                  onClick={() => scrollToSection('book-appointment')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-bold text-xs shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] transition-all"
                >
                  Learn More About Us
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. ULTRA-ATTRACTIVE "HOW IT WORKS" STEPPER SECTION */}
      <section id="how-it-works" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#2578FB]/10 via-[#EAF3FF] to-transparent blur-3xl rounded-full -z-10 pointer-events-none"></div>

        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3FF] border border-[#BFD8FF] text-[#2578FB] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2578FB] animate-pulse" />
            <span>SIMPLE 4-STEP PROCESS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight">
            Book in <span className="text-[#2578FB]">4 Simple Steps</span>
          </h2>

          <p className="text-[#5B6472] text-sm sm:text-base leading-relaxed">
            From selecting your preferred platform to receiving instant confirmations - scheduling takes under 60 seconds.
          </p>
        </div>

        {/* 4 STEPS GRID WITH CONNECTING TIMELINE BAR */}
        <div className="relative">
          {/* Horizontal Connecting Progress Line (Desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-[#2578FB] via-[#BFD8FF] to-[#2578FB] rounded-full z-0 opacity-60"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              {
                stepNum: '01',
                title: 'Choose Meeting Type',
                desc: 'Select Google Meet, Zoom, or Phone Call based on your preference.',
                icon: CalendarCheck2,
                tag: 'Step 1: Selection',
                gradient: 'from-emerald-500/10 via-emerald-500/15 to-emerald-500/20 text-emerald-700 border-emerald-300/80',
                dotColor: 'bg-emerald-500',
              },
              {
                stepNum: '02',
                title: 'Pick Date & Time',
                desc: 'Choose any available date & 15-60 min time slot within working hours.',
                icon: Clock,
                tag: 'Step 2: Realtime Check',
                gradient: 'from-[#2578FB]/10 via-[#2578FB]/15 to-[#2578FB]/20 text-[#2578FB] border-[#BFD8FF]',
                dotColor: 'bg-[#2578FB]',
              },
              {
                stepNum: '03',
                title: 'Enter Your Details',
                desc: 'Fill in your name, contact info, and brief meeting purpose.',
                icon: User,
                tag: 'Step 3: Quick Info',
                gradient: 'from-amber-500/10 via-amber-500/15 to-amber-500/20 text-amber-800 border-amber-300/80',
                dotColor: 'bg-amber-500',
              },
              {
                stepNum: '04',
                title: 'Instant Confirmation',
                desc: 'Receive live meeting links & email notifications instantly.',
                icon: CheckCircle2,
                tag: 'Step 4: Live Link',
                gradient: 'from-[#1257C7]/10 via-[#2578FB]/15 to-[#2578FB]/20 text-[#1257C7] border-[#2578FB]/60',
                dotColor: 'bg-[#1257C7]',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.stepNum}
                  className="bg-white border border-[#E4E9F0] rounded-2xl p-6 shadow-card hover:shadow-floating hover:border-[#2578FB] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between space-y-6 group relative"
                >
                  {/* Glowing Step Number Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2578FB] to-[#1257C7] text-white flex items-center justify-center font-extrabold text-lg shadow-blue group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-[#111827]/20 group-hover:text-[#2578FB] font-mono transition-colors">
                      {s.stepNum}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-[#111827] group-hover:text-[#2578FB] transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#5B6472] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {/* Feature Tag Pill */}
                  <div className="pt-3 border-t border-[#E4E9F0]">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-gradient-to-r shadow-xs transition-all ${s.gradient}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor} animate-pulse`}></span>
                      <span>{s.tag}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE BOOKING WIDGET SECTION WITH OUTER BOOKINGAPPOINTMENT BACKGROUND */}
      <section
        id="book-appointment"
        className="relative w-full py-16 sm:py-24 bg-cover bg-center bg-no-repeat overflow-hidden border-y border-[#E4E9F0] my-8"
        style={{
          backgroundImage: `url(${bookingAppointmentImg})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl border border-[#BFD8FF] shadow-floating p-6 sm:p-12 relative overflow-hidden backdrop-blur-xs bg-white/70">

            <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3FF]/90 border border-[#BFD8FF] text-[#2578FB] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#2578FB] animate-pulse" />
                Easy Online Booking
              </div>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-[#111827] tracking-tight font-sans mb-2">
                Book an Appointment
              </h2>
              <p className="text-[#5B6472] text-sm sm:text-base font-medium">
                Choose your preferred meeting type, date and time. It's quick and easy.
              </p>
            </div>

            {/* ULTRA-PROFESSIONAL STEPPER HEADER (NO OUTER BORDER) */}
            <div className="mb-10 max-w-4xl mx-auto bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xs relative z-10">
              <div className="flex items-center justify-between relative">

                {/* Background Progress Line */}
                <div className="absolute left-[12%] right-[12%] top-5 -translate-y-1/2 h-1.5 bg-[#E4E9F0] rounded-full z-0"></div>

                {/* Active Progress Line */}
                <div
                  className="absolute left-[12%] top-5 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#2578FB] to-[#1257C7] rounded-full transition-all duration-500 shadow-blue z-0"
                  style={{ width: `${((step - 1) / 3) * 76}%` }}
                ></div>

                {[
                  { num: 1, title: 'Meeting Type', icon: CalendarCheck2 },
                  { num: 2, title: 'Date & Time', icon: Clock },
                  { num: 3, title: 'Your Details', icon: User },
                  { num: 4, title: 'Confirmation', icon: CheckCircle2 },
                ].map((s) => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  const Icon = s.icon;

                  return (
                    <div key={s.num} className="flex flex-col items-center relative z-10 space-y-2 group cursor-pointer" onClick={() => isCompleted && setStep(s.num)}>

                      {/* Circle Badge */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${isActive
                          ? 'bg-gradient-to-br from-[#2578FB] to-[#1257C7] text-white ring-4 ring-[#2578FB]/20 scale-110 shadow-blue'
                          : isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs hover:scale-105'
                            : 'bg-white border-2 border-[#DCE3EC] text-[#8A94A6] shadow-2xs'
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Step Title & Tag */}
                      <div className="text-center">
                        <span
                          className={`block text-[10px] font-extrabold uppercase tracking-wider ${isActive
                            ? 'text-[#2578FB]'
                            : isCompleted
                              ? 'text-emerald-600'
                              : 'text-[#8A94A6]'
                            }`}
                        >
                          Step {s.num}
                        </span>
                        <span
                          className={`text-xs font-bold transition-colors ${isActive
                            ? 'text-[#111827]'
                            : isCompleted
                              ? 'text-emerald-700'
                              : 'text-[#5B6472]'
                            }`}
                        >
                          {s.title}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Layout: Main Selection + Live Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Content Area (8 cols) */}
              <div className="lg:col-span-8 space-y-6">

                {/* STEP 1: Meeting Type */}
                {step === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-lg font-bold text-charcoal">Select Meeting Type</h3>
                      <p className="text-xs text-charcoal-MUTED">How would you like to meet?</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {meetingTypes.map((type) => {
                        const isSelected = selectedMeetingType?._id === type._id;
                        return (
                          <div
                            key={type._id}
                            onClick={() => setSelectedMeetingType(type)}
                            className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between h-36 ${isSelected
                              ? 'bg-[#EAF3FF] border-2 border-[#2578FB] shadow-blue scale-[1.02]'
                              : 'bg-white border-[#E2E8F0] hover:border-[#BFD8FF] hover:bg-[#EAF3FF]/40 hover:-translate-y-0.5'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                                {renderIconForMeeting(type.type)}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-[#2578FB]" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#111827]">{type.title}</h4>
                              <p className="text-[11px] text-[#5B6472] truncate mt-0.5">
                                {type.type === 'PHONE_CALL'
                                  ? 'Direct voice call'
                                  : type.type === 'GOOGLE_MEET'
                                    ? 'Google Meet video meeting'
                                    : 'Zoom video meeting'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2: Date & Time */}
                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">Select Date & Time</h3>
                      <p className="text-xs text-[#5B6472]">
                        Pick your preferred date and exact start time.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-[#E2E8F0]">
                      {/* Date Picker */}
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                          Choose Date *
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-medium text-sm focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 transition-all"
                        />
                        {availabilityLoading && (
                          <p className="text-[11px] text-[#2578FB] mt-1 animate-pulse font-medium">
                            Checking schedule availability...
                          </p>
                        )}
                      </div>

                      {/* Start Time Picker */}
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                          Start Time (Exact Minute Allowed) *
                        </label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] font-medium text-sm focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15 transition-all"
                        />
                        <p className="text-[11px] text-[#5B6472] mt-1">
                          e.g., 11:37 AM or 02:15 PM
                        </p>
                      </div>

                      {/* Duration Selection */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                          Duration *
                        </label>
                        <div className="flex items-center gap-3">
                          {[15, 30, 45, 60].map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setDuration(dur)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${duration === dur
                                ? 'bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white border-[#2578FB] shadow-xs'
                                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#111827] hover:border-[#BFD8FF] hover:bg-[#EAF3FF]/40'
                                }`}
                            >
                              {dur} Mins
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Info / Error Feedback */}
                    {availability && (
                      <div className="space-y-2">
                        {availability.workingHours && (
                          <div className="flex items-center gap-2 text-xs text-[#1E293B] bg-[#EAF3FF] px-3.5 py-2 rounded-lg border border-[#BFD8FF]">
                            <Clock className="w-4 h-4 text-[#2578FB]" />
                            <span>
                              Working Hours for this day:{' '}
                              <strong>
                                {format12Hour(availability.workingHours.startTime)} -{' '}
                                {format12Hour(availability.workingHours.endTime)}
                              </strong>
                            </span>
                          </div>
                        )}

                        {timeError ? (
                          <div className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 p-3.5 rounded-lg border border-red-200">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">Selected time unavailable:</span> {timeError}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                              Requested slot (<strong>{format12Hour(selectedTime)}</strong> to{' '}
                              <strong>{getEndTimeStr(selectedTime, duration)}</strong>) is available!
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Customer Details Form */}
                {step === 3 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">Your Details</h3>
                      <p className="text-xs text-[#5B6472]">
                        Please enter your contact info to receive appointment confirmation.
                      </p>
                    </div>

                    {bookingError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                        {bookingError}
                      </div>
                    )}

                    <form onSubmit={handleConfirmBooking} className="space-y-4 bg-white p-5 rounded-xl border border-[#E2E8F0]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Enter Your Name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15"
                            />
                          </div>
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                            <input
                              type="tel"
                              required
                              placeholder="e.g. +91 98765 43210"
                              value={customerMobile}
                              onChange={(e) => setCustomerMobile(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                            <input
                              type="email"
                              required
                              placeholder="e.g. mail@example.com"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15"
                            />
                          </div>
                        </div>

                        {/* Company Name (Optional) */}
                        <div>
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Company Name
                          </label>
                          <div className="relative">
                            <Building className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="e.g. Company Name"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15"
                            />
                          </div>
                        </div>

                        {/* Purpose */}
                        <div>
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Purpose of Meeting 
                          </label>
                          <div className="relative">
                            <FileText className="w-4 h-4 text-[#5B6472] absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="e.g. Enter Purpose of Meeting"
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#111827] focus:outline-none focus:border-[#2578FB] focus:ring-2 focus:ring-[#2578FB]/15"
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#BFD8FF] text-[#2578FB] bg-white text-xs font-bold hover:bg-[#EAF3FF] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={step === 2 && (Boolean(timeError) || !selectedTime)}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white text-xs font-bold shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={bookingLoading}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white text-sm font-bold shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    >
                      {bookingLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Processing Booking...
                        </span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm Appointment
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>

              {/* Right Live Summary Card (4 cols) */}
              <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-[#111827] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2578FB]" />
                  Your Appointment
                </h3>

                <div className="space-y-3.5 text-xs">
                  {/* Meeting Type */}
                  <div className="border-b border-[#E2E8F0] pb-2.5">
                    <span className="text-[#5B6472] block text-[11px] font-medium">Meeting Type</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {selectedMeetingType?.type === 'PHONE_CALL' ? (
                        <Phone className="w-3.5 h-3.5 text-[#2578FB]" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span className="font-bold text-[#111827]">
                        {selectedMeetingType ? selectedMeetingType.title : 'Not selected'}
                      </span>
                    </div>
                    {selectedMeetingType && (
                      <span className="text-[10px] text-[#5B6472] block truncate mt-0.5">
                        {selectedMeetingType.type === 'PHONE_CALL'
                          ? 'Phone Call'
                          : 'Online Video Meeting'}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="border-b border-[#E2E8F0] pb-2.5">
                    <span className="text-[#5B6472] block text-[11px] font-medium">Date</span>
                    <span className="font-bold text-[#111827] block mt-0.5">
                      {selectedDate
                        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : 'Not selected'}
                    </span>
                  </div>

                  {/* Time & Duration */}
                  <div className="border-b border-[#E2E8F0] pb-2.5">
                    <span className="text-[#5B6472] block text-[11px] font-medium">Time & Duration</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-bold text-[#111827]">
                        {selectedTime
                          ? `${format12Hour(selectedTime)} - ${getEndTimeStr(selectedTime, duration)}`
                          : 'Not selected'}
                      </span>
                      <span className="font-bold text-[#2578FB] bg-[#EAF3FF] px-2 py-0.5 rounded text-[11px] border border-[#BFD8FF]">
                        {duration} Mins
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Customer Details Preview */}
                  {(customerName || customerEmail || customerMobile) && (
                    <div className="border-b border-[#E2E8F0] pb-2.5 space-y-1.5 bg-[#F8FAFC] p-2.5 rounded-lg">
                      <span className="text-[#5B6472] block text-[10px] font-bold uppercase tracking-wider">
                        Customer Info
                      </span>
                      {customerName && (
                        <div className="flex items-center gap-1.5 text-[#111827] font-semibold text-[11px]">
                          <User className="w-3 h-3 text-[#2578FB]" />
                          <span className="truncate">{customerName}</span>
                        </div>
                      )}
                      {customerMobile && (
                        <div className="flex items-center gap-1.5 text-[#5B6472] text-[11px]">
                          <Phone className="w-3 h-3 text-[#2578FB]" />
                          <span className="truncate">{customerMobile}</span>
                        </div>
                      )}
                      {customerEmail && (
                        <div className="flex items-center gap-1.5 text-[#5B6472] text-[11px]">
                          <Mail className="w-3 h-3 text-[#2578FB]" />
                          <span className="truncate">{customerEmail}</span>
                        </div>
                      )}
                      {companyName && (
                        <div className="flex items-center gap-1.5 text-[#5B6472] text-[10px]">
                          <Building className="w-3 h-3" />
                          <span className="truncate">{companyName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Security Info Box */}
                <div className="bg-[#EAF3FF]/70 border border-[#BFD8FF] p-3 rounded-xl flex items-start gap-2.5 mt-4">
                  <Shield className="w-4 h-4 text-[#2578FB] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#1E293B] leading-relaxed font-medium">
                    Your information is safe and will only be used to send appointment details.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. READY TO GET STARTED CTA BANNER */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#EAF3FF] via-white to-[#EAF3FF] border border-[#BFD8FF] rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-subtle">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
              Ready to Get Started?
            </h2>
            <p className="text-[#5B6472] text-xs sm:text-sm font-medium">
              Book your appointment now and connect with our team at your convenience.
            </p>
          </div>
          <button
            onClick={() => scrollToSection('book-appointment')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2578FB] to-[#1257C7] text-white font-bold text-sm shadow-blue hover:from-[#1257C7] hover:to-[#0D47A1] transition-all hover:-translate-y-0.5"
          >
            <CalendarIcon className="w-4 h-4" />
            Book an Appointment
          </button>
        </div>
      </section>

    </div>
  );
};

export default BookingPage;

