import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import {
  Mail,
  Send,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  GraduationCap,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ContactPage: React.FC = () => {
  const { navigateTo, showAlert } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid university email address.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      setErrorMsg('Please write an inquiry message with at least 5 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
        showAlert('Your message has been sent successfully!', 'success');
      } else if (data.error) {
        setErrorMsg(data.error);
      } else if (res.status === 502 || res.status === 503 || res.status === 504) {
        setErrorMsg("We couldn't connect to the server. Please try again.");
      } else {
        setErrorMsg('Something went wrong. Please try again shortly.');
      }
    } catch {
      setErrorMsg("We couldn't connect to the server. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* ─────────────────────────────────────────────────────────────
          HEADER
      ───────────────────────────────────────────────────────────── */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DAE7C7] text-[#08482D] text-xs font-heading font-bold">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-[#101410] dark:text-[#f0f5ee] tracking-tight break-words px-2">
          Contact the Project Team
        </h1>

        <p className="text-sm sm:text-base text-[#5E5E61] dark:text-slate-300 leading-relaxed font-sans">
          Have questions about hosting an academic workshop, scheduling physical computer labs, or deploying Kaushalya for your campus department? Reach out to our coordination team.
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT GRID: FORM + CAMPUS COORDINATION INFO
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="p-8 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] border border-[#DAE7C7] dark:border-[#2d4d3a] text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#08482D] text-[#DAE7C7] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-heading font-bold text-lg text-[#08482D] dark:text-[#DAE7C7]">
                Thank you for your message!
              </h2>
              <p className="text-xs sm:text-sm text-[#08482D]/90 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Your inquiry has been successfully received and recorded in our institutional logs. Our campus coordination team will review and reply to your university email address.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#DAE7C7]" />
                  <span>Send another message</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
                <h2 className="text-lg font-heading font-bold text-[#101410] dark:text-white">
                  Send an Inquiry
                </h2>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400">
                  Fill out the form below. All communications are logged for administrative auditability.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-heading font-semibold text-[#101410] dark:text-white mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Omkar Parelkar"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-heading font-semibold text-[#101410] dark:text-white mb-1.5">
                    University Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mca26.omkar.parelkar@gnims.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-heading font-semibold text-[#101410] dark:text-white mb-1.5">
                  Message / Inquiry <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  disabled={loading}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your workshop proposal, department requirements, or technical inquiry..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] disabled:opacity-50"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-[#5E5E61] dark:text-slate-400">
                  Maintained by Department of Computer Science & Engineering.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5 text-[#DAE7C7]" />
                  <span>{loading ? 'Submitting...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Campus Details & Office Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#E8F0DF]/60 dark:bg-[#14231b]/60 border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-6 sm:p-8 space-y-5 transition-colors">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7]">
              Campus Coordination Desk
            </span>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#101410] dark:text-white font-heading font-semibold">
                    Master of Computer Applications (MCA)
                  </strong>
                  <span className="text-[#5E5E61] dark:text-slate-300">
                    Guru Nanak Institute of Management Studies (GNIMS)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#101410] dark:text-white font-heading font-semibold">
                    Campus Location
                  </strong>
                  <span className="text-[#5E5E61] dark:text-slate-300">
                    Guru Nanak Institute of Management Studies, Kings Circle, Matunga East, Mumbai, Maharashtra 400019
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#101410] dark:text-white font-heading font-semibold">
                    Direct Contact / Helpline
                  </strong>
                  <span className="text-[#5E5E61] dark:text-slate-300 flex items-center gap-1.5">
                    <a href="tel:+912224043928" className="font-semibold text-[#08482D] dark:text-[#DAE7C7] hover:underline">
                      +91 (022) 2404 3928
                    </a>
                    <span>(Academic Desk)</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#101410] dark:text-white font-heading font-semibold">
                    Coordinator Hours
                  </strong>
                  <span className="text-[#5E5E61] dark:text-slate-300">
                    Monday – Saturday: 09:00 AM – 06:00 PM IST
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DCE4D6] dark:border-[#203a2c]">
              <div className="flex items-center gap-2 text-[11px] text-[#08482D] dark:text-[#DAE7C7] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Typical response time: within 24 academic hours</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-6 sm:p-8 space-y-3.5 shadow-xs">
            <h3 className="text-sm font-heading font-bold text-[#101410] dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
              <span>Looking for Quick Answers?</span>
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 leading-relaxed">
              Before sending an inquiry, check our comprehensive Frequently Asked Questions covering pricing, Razorpay checkout, passes, and gate check-in.
            </p>
            <button
              onClick={() => {
                navigateTo('home');
                setTimeout(() => {
                  const el = document.getElementById('faq');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="text-xs font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] hover:underline inline-flex items-center gap-1.5 pt-1"
            >
              <span>View Homepage FAQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

