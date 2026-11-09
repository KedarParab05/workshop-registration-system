import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  MapPin,
  Sparkles,
  QrCode,
  GraduationCap,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ParticipantDashboard: React.FC = () => {
  const { currentUser, registrations, workshops, navigateTo, refreshData } = useApp();

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const myRegistrations = registrations.filter(
    (r) =>
      r.participantId === currentUser?.id ||
      (currentUser?.email && r.participantEmail?.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const confirmedRegistrations = myRegistrations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'ATTENDED'
  );

  const today = new Date().toISOString().split('T')[0];

  const upcomingRegistrations = myRegistrations.filter((r) => {
    if (r.status === 'CANCELLED' || r.status === 'ATTENDED') return false;
    const ws = workshops.find((w) => w.id === r.workshopId);
    return ws && ws.date >= today;
  });

  const completedRegistrations = myRegistrations.filter((r) => {
    if (r.status === 'CANCELLED') return false;
    if (r.status === 'ATTENDED') return true;
    const ws = workshops.find((w) => w.id === r.workshopId);
    return ws && ws.date < today;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#08482D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-[#0c5c3b] relative overflow-hidden"
      >
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold bg-[#DAE7C7] text-[#08482D]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Learning Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-[#F5F8EF]">
            Welcome back, {currentUser?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#DAE7C7]/90 max-w-xl leading-relaxed">
            You are enrolled in <strong className="text-white font-mono">{confirmedRegistrations.length}</strong> active academic sessions.
            All workshops are completely free. Access your schedule, digital QR passes, and venue maps below.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('workshops')}
          className="w-full sm:w-auto px-6 py-3 bg-[#DAE7C7] hover:bg-[#c9dcaf] text-[#08482D] font-heading font-semibold text-xs rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <span>Explore More Workshops</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-[#14231b] p-5 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs flex items-center gap-4 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee] font-mono">
              {confirmedRegistrations.length}
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">Active Free Enrollments</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-[#14231b] p-5 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs flex items-center gap-4 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee] font-mono">
              {upcomingRegistrations.length}
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">Upcoming Sessions</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white dark:bg-[#14231b] p-5 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs flex items-center gap-4 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1b3025] text-[#08482D] dark:text-[#9ee2b8] flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee] font-mono">
              {completedRegistrations.length}
            </div>
            <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] font-medium">Completed / Verified</div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Workshop Registrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
              Your Upcoming Enrolled Sessions
            </h3>
            <p className="text-xs text-[#5E5E61] dark:text-[#8ba895]">
              Show your cryptographic QR pass at the entrance gate for instant admission.
            </p>
          </div>
          <button
            onClick={() => navigateTo('my-registrations')}
            className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#9ee2b8] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingRegistrations.length === 0 ? (
          <div className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#5E5E61] dark:text-[#8ba895] mx-auto opacity-50" />
            <h4 className="font-heading font-bold text-sm text-[#101410] dark:text-[#f0f5ee]">
              No upcoming workshop enrollments
            </h4>
            <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] max-w-sm mx-auto">
              You haven't registered for any upcoming sessions yet. Explore the schedule to claim your free seat.
            </p>
            <button
              onClick={() => navigateTo('workshops')}
              className="mt-2 px-5 py-2.5 bg-[#08482D] text-[#F5F8EF] rounded-xl text-xs font-heading font-semibold hover:bg-[#0c5c3b] transition-colors"
            >
              Explore Free Workshops
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingRegistrations.map((reg) => {
              const ws = workshops.find((w) => w.id === reg.workshopId);
              if (!ws) return null;

              return (
                <motion.div
                  key={reg.id}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#5E5E61] dark:text-[#8ba895]">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#DAE7C7] text-[#08482D]">
                        {ws.category}
                      </span>
                      <span className="font-mono text-[11px] text-[#08482D] dark:text-[#9ee2b8] font-semibold">
                        {reg.ticketCode || 'TKT-CONFIRMED'}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-[#101410] dark:text-[#f0f5ee] text-sm line-clamp-1">
                      {ws.title}
                    </h4>

                    <div className="text-[#5E5E61] dark:text-[#8ba895] space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                        <span>{ws.date} ({ws.startTime} - {ws.endTime})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                        <span className="truncate">{ws.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-[#DCE4D6]/70 dark:border-[#233d2e] bg-[#F5F8EF]/40 dark:bg-[#1b3025]/30 flex items-center justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </span>

                    <button
                      onClick={() => navigateTo('workshop-detail', ws.id)}
                      className="text-xs font-heading font-semibold text-[#08482D] dark:text-[#9ee2b8] hover:underline"
                    >
                      View Ticket Pass &rarr;
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
