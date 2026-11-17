import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  MapPin,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#FFF5E9] text-[#101D32]">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#101D32] rounded-xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[6px_6px_0px_0px_#F4511E] border-2 border-[#101D32] relative overflow-hidden"
      >
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
            <GraduationCap className="w-3.5 h-3.5 text-[#F4511E]" />
            <span>Student Learning Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-[#FFF5E9]">
            Welcome back, {currentUser?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#FFF5E9]/80 max-w-xl leading-relaxed font-sans">
            You are enrolled in <strong className="text-white font-mono">{confirmedRegistrations.length}</strong> active academic sessions.
            Access your schedule, verified digital QR passes, and venue maps below.
          </p>
        </div>

        <button
          onClick={() => navigateTo('workshops')}
          className="w-full sm:w-auto px-6 py-3 bg-[#F4511E] hover:bg-[#E84316] text-white font-heading font-extrabold text-xs rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#FFF5E9] neo-btn flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Explore More Workshops</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD6B0] border-2 border-[#101D32] text-[#F4511E] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-[#101D32] font-mono">
              {confirmedRegistrations.length}
            </div>
            <div className="text-xs text-[#101D32]/70 font-bold">Active Enrollments</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD6B0] border-2 border-[#101D32] text-[#F4511E] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-[#101D32] font-mono">
              {upcomingRegistrations.length}
            </div>
            <div className="text-xs text-[#101D32]/70 font-bold">Upcoming Sessions</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD6B0] border-2 border-[#101D32] text-[#F4511E] flex items-center justify-center font-bold shrink-0 shadow-[2px_2px_0px_0px_#101D32]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-[#101D32] font-mono">
              {completedRegistrations.length}
            </div>
            <div className="text-xs text-[#101D32]/70 font-bold">Completed / Verified</div>
          </div>
        </div>
      </div>

      {/* Upcoming Workshop Registrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-extrabold text-[#101D32]">
              Your Upcoming Enrolled Sessions
            </h3>
            <p className="text-xs text-[#101D32]/70 font-medium">
              Show your cryptographic QR pass at the entrance gate for instant admission.
            </p>
          </div>
          <button
            onClick={() => navigateTo('my-registrations')}
            className="text-xs font-heading font-extrabold text-[#F4511E] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingRegistrations.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#101D32]/50 mx-auto" />
            <h4 className="font-heading font-extrabold text-sm text-[#101D32]">
              No upcoming workshop enrollments
            </h4>
            <p className="text-xs text-[#101D32]/70 max-w-sm mx-auto font-medium">
              You haven't registered for any upcoming sessions yet. Explore the schedule to claim your seat.
            </p>
            <button
              onClick={() => navigateTo('workshops')}
              className="mt-2 px-6 py-2.5 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-xl border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] neo-btn text-xs font-heading font-extrabold cursor-pointer"
            >
              Explore Workshops
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingRegistrations.map((reg) => {
              const ws = workshops.find((w) => w.id === reg.workshopId);
              if (!ws) return null;

              return (
                <div
                  key={reg.id}
                  className="bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
                        {ws.category}
                      </span>
                      <span className="font-mono text-[11px] text-[#F4511E] font-bold">
                        {reg.ticketCode || 'TKT-CONFIRMED'}
                      </span>
                    </div>

                    <h4 className="font-heading font-extrabold text-[#101D32] text-base line-clamp-1">
                      {ws.title}
                    </h4>

                    <div className="text-[#101D32]/70 space-y-1 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                        <span>{ws.date} ({ws.startTime} - {ws.endTime})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                        <span className="truncate">{ws.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t-2 border-[#101D32]/10 bg-[#FFF5E9] flex items-center justify-between">
                    <span className="text-[#101D32] font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F4511E]" />
                      <span>Confirmed</span>
                    </span>

                    <button
                      onClick={() => navigateTo('workshop-detail', ws.id)}
                      className="text-xs font-heading font-extrabold text-[#F4511E] hover:underline cursor-pointer"
                    >
                      View Ticket Pass &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
