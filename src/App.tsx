/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/public/LandingPage';
import { WorkshopList } from './components/public/WorkshopList';
import { WorkshopDetail } from './components/public/WorkshopDetail';
import { OurStoryPage } from './components/public/OurStoryPage';
import { ContactPage } from './components/public/ContactPage';
import { AuthModal } from './components/auth/AuthModal';
import { RoleSelectorModal } from './components/common/RoleSelectorModal';
import { ProfileModal } from './components/common/ProfileModal';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard';
import { MyRegistrations } from './components/participant/MyRegistrations';
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard';
import { WorkshopRegistrations } from './components/organizer/WorkshopRegistrations';
import { VolunteerGatePortal } from './components/volunteer/VolunteerGatePortal';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { currentUser, currentVolunteer, activePage, alerts, dismissAlert } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<'PARTICIPANT' | 'ORGANIZER' | 'VOLUNTEER' | undefined>(undefined);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <LandingPage
            onOpenAuth={() => { setAuthInitialRole(undefined); setAuthModalOpen(true); }}
            onOpenRoleSelector={() => setRoleModalOpen(true)}
          />
        );
      case 'workshops':
        return <WorkshopList />;
      case 'workshop-detail':
        return <WorkshopDetail onOpenAuth={() => { setAuthInitialRole(undefined); setAuthModalOpen(true); }} />;
      case 'participant-dashboard':
        return currentUser?.role === 'ORGANIZER' ? <OrganizerDashboard /> : <ParticipantDashboard />;
      case 'my-registrations':
        return currentUser?.role === 'ORGANIZER' ? <OrganizerDashboard /> : <MyRegistrations />;
      case 'organizer-dashboard':
      case 'organizer-workshops':
        return currentUser?.role === 'PARTICIPANT' ? <ParticipantDashboard /> : <OrganizerDashboard />;
      case 'organizer-registrations':
        return currentUser?.role === 'PARTICIPANT' ? <MyRegistrations /> : <WorkshopRegistrations />;
      case 'admin-dashboard':
        return <SuperAdminDashboard />;
      case 'volunteer-portal':
        return <VolunteerGatePortal />;
      case 'our-story':
        return <OurStoryPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return (
          <LandingPage
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenRoleSelector={() => setRoleModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5E9] font-sans text-[#101D32] selection:bg-[#FFD6B0] selection:text-[#101D32] transition-colors duration-200 w-full max-w-full overflow-x-clip relative">
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenRoleSelector={() => setRoleModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Toast Notification Container with Motion */}
      <div className="fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-50 flex flex-col gap-2 w-full max-w-[calc(100vw-32px)] sm:max-w-sm pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3.5 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-start gap-2.5 text-xs ${
                alert.type === 'success'
                  ? 'bg-[#101D32] text-white shadow-[4px_4px_0px_0px_#F4511E]'
                  : alert.type === 'error'
                  ? 'bg-[#F4511E] text-white'
                  : 'bg-[#FFD6B0] text-[#101D32] font-semibold'
              }`}
            >
              {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#F4511E] shrink-0 mt-0.5" />}
              {alert.type === 'error' && <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />}
              {alert.type === 'info' && <Info className="w-4 h-4 text-[#101D32] shrink-0 mt-0.5" />}
              <div className="flex-1 leading-snug">{alert.message}</div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-0.5 opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className={`flex-1 w-full max-w-full overflow-x-clip ${activePage === 'home' ? 'pt-0' : 'pt-24 sm:pt-28'}`}>
        {renderCurrentPage()}
      </main>

      <Footer
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenRoleSelector={() => setRoleModalOpen(true)}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialRole={authInitialRole} />
      <RoleSelectorModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onOpenAuthModal={(role) => {
          setRoleModalOpen(false);
          setAuthInitialRole(role);
          setAuthModalOpen(true);
        }}
      />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
