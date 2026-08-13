import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ChevronRight,
  ArrowUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import hiveriftLogo from '../../assets/LOGO.svg';

export const Footer = () => {
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');

  useEffect(() => {
    api
      .get('/helpline')
      .then((res) => {
        if (res.data && res.data.helplinePhone) {
          setSupportPhone(res.data.helplinePhone);
        }
      })
      .catch((err) => {
        console.error('Error loading footer helpline number', err);
      });
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#111827] text-gray-400 font-sans relative overflow-hidden text-xs">



      {/* Decorative Background Blob Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2578FB]/5 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1257C7]/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 relative z-10">

        {/* Main 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">

          {/* Column 1: Brand Logo & Description (Spans 2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div
              className="inline-flex items-center bg-white px-3.5 py-2 rounded-2xl shadow-subtle group cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-300"
              onClick={scrollToTop}
            >
              <img
                src={hiveriftLogo}
                alt="HiveRift Logo"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>

            <p className="text-gray-400 leading-relaxed text-xs max-w-sm">
              Schedule meetings effortlessly with our simple and secure appointment booking portal. Connect via Google Meet, Zoom, or Phone Calls in under 60 seconds.
            </p>

            {/* Social Media Hover Icons */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                {[
                  { icon: Facebook, label: 'Facebook', href: '#' },
                  { icon: Twitter, label: 'Twitter', href: '#' },
                  { icon: Linkedin, label: 'LinkedIn', href: '#' },
                  { icon: Instagram, label: 'Instagram', href: '#' },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={idx}
                      href={s.href}
                      aria-label={s.label}
                      className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2578FB] hover:border-[#2578FB] hover:scale-110 transition-all duration-300 shadow-xs"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 font-medium">
              {[
                { label: 'Book Appointment', target: 'book-appointment' },
                { label: 'About Us', target: 'about' },
                { label: 'Services', target: 'services' },
                { label: 'How It Works', target: 'how-it-works' },
                { label: 'Contact Us', target: 'contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`#${link.target}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.target);
                    }}
                    className="group inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <ChevronRight className="w-3 h-3 text-[#2578FB] transition-transform duration-200 group-hover:translate-x-1" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Customers */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              For Customers
            </h4>
            <ul className="space-y-2.5 font-medium">
              {[
                'Privacy Policy',
                'Terms of Service',
                'Refund Policy',
                'NRPG Request Policy',
                'Help & Support',
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="group inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <ChevronRight className="w-3 h-3 text-[#2578FB] transition-transform duration-200 group-hover:translate-x-1" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Details */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Contact Details
            </h4>
            <ul className="space-y-3 font-medium">
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-[#2578FB] group-hover:bg-[#2578FB] group-hover:text-white group-hover:border-[#2578FB] group-hover:scale-110 transition-all duration-300 flex-shrink-0 mt-0.5 shadow-xs">
                  <Phone className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block font-semibold group-hover:text-[#2578FB] transition-colors">Helpline Number</span>
                  <a
                    href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                    className="font-extrabold text-white group-hover:text-[#2578FB] transition-colors text-xs"
                  >
                    {supportPhone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-[#2578FB] group-hover:bg-[#2578FB] group-hover:text-white group-hover:border-[#2578FB] group-hover:scale-110 transition-all duration-300 flex-shrink-0 mt-0.5 shadow-xs">
                  <Mail className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block font-semibold group-hover:text-[#2578FB] transition-colors">Send email</span>
                  <a
                    href="mailto:hello@hiverift.com"
                    className="font-bold text-gray-300 group-hover:text-white transition-colors text-xs"
                  >
                    hello@hiverift.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-[#2578FB] group-hover:bg-[#2578FB] group-hover:text-white group-hover:border-[#2578FB] group-hover:scale-110 transition-all duration-300 flex-shrink-0 mt-0.5 shadow-xs">
                  <Clock className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block font-semibold group-hover:text-[#2578FB] transition-colors">Working Hours</span>
                  <span className="font-bold text-gray-300 group-hover:text-white text-xs transition-colors">Mon - Sat: 10:00 AM - 7:00 PM</span>
                </div>
              </li>

              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-[#2578FB] group-hover:bg-[#2578FB] group-hover:text-white group-hover:border-[#2578FB] group-hover:scale-110 transition-all duration-300 flex-shrink-0 mt-0.5 shadow-xs">
                  <MapPin className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block font-semibold group-hover:text-[#2578FB] transition-colors">Office Location</span>
                  <span className="font-bold text-gray-400 group-hover:text-white text-[11px] leading-tight block transition-colors">
                    1234 E Grand River Ave, Lansing, MI 48906
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-6 text-center text-gray-400 text-xs font-medium">
          <p>
            © {new Date().getFullYear()}{' '}
            <span className="font-extrabold text-[#2578FB] hover:underline cursor-pointer">
              HiveRift
            </span>
            . All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
