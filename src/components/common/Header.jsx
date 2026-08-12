import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PhoneCall, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import hiveriftLogo from '../../assets/LOGO.svg';

export const Header = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');

  const isHomePage = location.pathname === '/' || location.pathname === '/appointment';
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Fetch live website helpline phone number
    api
      .get('/helpline')
      .then((res) => {
        if (res.data && res.data.helplinePhone) {
          setSupportPhone(res.data.helplinePhone);
        }
      })
      .catch((err) => {
        console.error('Error loading helpline number', err);
      });
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (!isHomePage) return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link 
          to={isAdminPage ? "/admin/dashboard" : "/"} 
          className="flex items-center gap-3 group flex-shrink-0"
        >
          <img
            src={hiveriftLogo}
            alt="HiveRift Logo"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          {isAdminPage && (
            <span className="text-[10px] tracking-widest text-[#2578FB] bg-[#EAF3FF] border border-[#BFD8FF] px-2.5 py-0.5 rounded-full uppercase font-bold whitespace-nowrap">
              Admin Portal
            </span>
          )}
        </Link>

        {/* Center Single Page Nav Links (Desktop) */}
        {isHomePage && (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-[#1F2937]">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className="hover:text-gold-PRIMARY transition-colors"
            >
              Home
            </a>
            <a
              href="#book-appointment"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('book-appointment');
              }}
              className="hover:text-gold-PRIMARY transition-colors"
            >
              Book Appointment
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              className="hover:text-gold-PRIMARY transition-colors"
            >
              About Us
            </a>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('services');
              }}
              className="hover:text-gold-PRIMARY transition-colors"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('how-it-works');
              }}
              className="hover:text-gold-PRIMARY transition-colors"
            >
              How It Works
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              className="hover:text-gold-PRIMARY transition-colors"
            >
              Contact Us
            </a>
          </nav>
        )}

        {/* Right Action */}
        <div className="flex items-center gap-3 text-sm">
          {!isAdminPage && (
            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="hidden sm:flex items-center gap-2 bg-[#EAF3FF] border border-[#BFD8FF] px-4 py-1.5 rounded-full text-xs font-medium text-[#111827] shadow-xs hover:bg-[#2578FB] hover:text-white hover:border-[#2578FB] hover:shadow-blue transition-all duration-300 group cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#2578FB] group-hover:text-white group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden md:inline font-semibold">Need help?</span>
              <span className="font-extrabold">{supportPhone}</span>
            </a>
          )}

          {isAdminPage && admin && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5 bg-gold-SOFT px-3 py-1.5 rounded-lg border border-gold-BORDER">
                <ShieldCheck className="w-4 h-4 text-gold-PRIMARY" />
                {admin.name || 'Admin'}
              </span>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-charcoal-MUTED hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button (Customer View) */}
          {isHomePage && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-ivory-BORDER text-charcoal hover:bg-gold-SOFT transition-colors"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

      </div>

      {/* Mobile Dropdown Menu (Customer View) */}
      {isHomePage && mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-ivory-BORDER px-4 py-4 space-y-3 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-2 text-sm font-bold text-[#1F2937]">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className="py-1.5 hover:text-gold-PRIMARY transition-colors"
            >
              Home
            </a>
            <a
              href="#book-appointment"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('book-appointment');
              }}
              className="py-1.5 hover:text-gold-PRIMARY transition-colors"
            >
              Book Appointment
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              className="py-1.5 hover:text-gold-PRIMARY transition-colors"
            >
              About Us
            </a>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('services');
              }}
              className="py-1.5 hover:text-gold-PRIMARY transition-colors"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('how-it-works');
              }}
              className="py-1.5 hover:text-gold-PRIMARY transition-colors"
            >
              How It Works
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              className="py-1.5 hover:text-gold-PRIMARY transition-colors"
            >
              Contact Us
            </a>
          </nav>

          <div className="pt-3 border-t border-ivory-BORDER flex items-center justify-between">
            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal bg-gold-SOFT px-3.5 py-2 rounded-xl border border-gold-BORDER"
            >
              <PhoneCall className="w-4 h-4 text-gold-PRIMARY" />
              <span>Call {supportPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
