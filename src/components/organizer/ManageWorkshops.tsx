import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Workshop } from '../../types';
import { calculateSeats } from '../../utils/workshopRules';
import { WorkshopFormModal } from './WorkshopFormModal';
import { QRVerifierModal } from './QRVerifierModal';
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Sparkles,
  Scan,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ManageWorkshops: React.FC = () => {
  const {
    currentUser,
    workshops,
    registrations,
    deleteWorkshop,
    togglePublishStatus,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);
  const [verifierOpen, setVerifierOpen] = useState(false);
  const [verifierWorkshopId, setVerifierWorkshopId] = useState<string | undefined>(undefined);

  const myWorkshops = workshops.filter(
    (w) =>
      currentUser?.role === 'SUPER_ADMIN' ||
      w.organizerId === currentUser?.id ||
      (currentUser?.fullName && w.organizerNameSnapshot === currentUser.fullName)
  );

  const filteredWorkshops = myWorkshops.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.venue.toLowerCase().includes(q)
    );
  });

  const handleCreate = () => {
    setEditingWorkshop(null);
    setModalOpen(true);
  };

  const handleEdit = (ws: Workshop) => {
    setEditingWorkshop(ws);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (workshopToDelete) {
      deleteWorkshop(workshopToDelete.id);
      setWorkshopToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE4D6] dark:border-[#203a2c] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7] dark:bg-[#1f3d2d] px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" />
              Faculty Management Console
            </span>
            <span className="font-hand text-sm text-[#08482D] dark:text-[#DAE7C7] -rotate-1 hidden sm:inline">
              // syllabus & schedules
            </span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-[#101410] dark:text-white tracking-tight">
            Manage My Workshops
          </h1>
          <p className="text-sm text-[#5E5E61] dark:text-slate-400 mt-1">
            Publish, edit schedules, adjust capacity limits, and review active sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setVerifierWorkshopId(undefined);
              setVerifierOpen(true);
            }}
            className="px-4 py-2 border border-[#DAE7C7] dark:border-[#2d4d3a] bg-[#E8F0DF] dark:bg-[#1b2f23] text-[#08482D] dark:text-[#DAE7C7] rounded-xl text-xs font-heading font-semibold hover:bg-[#DCE4D6] dark:hover:bg-[#233d2e] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Scan className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" />
            <span>Scan Tickets</span>
          </button>
          <button
            onClick={() => navigateTo('organizer-registrations')}
            className="px-4 py-2 border border-[#DCE4D6] dark:border-[#22392c] bg-white dark:bg-[#14231b] text-[#5E5E61] dark:text-slate-200 rounded-xl text-xs font-heading font-semibold hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>View Attendees</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            className="px-4 py-2 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl text-xs font-heading font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-[#08482D]/20"
          >
            <PlusCircle className="w-4 h-4 text-[#DAE7C7]" />
            <span>New Workshop</span>
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#14231b] p-4 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center justify-between gap-4 transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5E5E61] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workshops by title, venue, track..."
            className="w-full pl-10 pr-3.5 py-2 text-xs border border-[#DCE4D6] dark:border-[#22392c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08482D] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white"
          />
        </div>
        <div className="text-xs text-[#5E5E61] dark:text-slate-400 font-medium">
          Showing <strong className="text-[#101410] dark:text-white font-mono">{filteredWorkshops.length}</strong> sessions
        </div>
      </div>

      {/* Workshops Table */}
      {filteredWorkshops.length === 0 ? (
        <div className="bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#203a2c] rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3 transition-colors">
          <h3 className="text-base font-heading font-bold text-[#101410] dark:text-white">No Workshops Found</h3>
          <p className="text-xs text-[#5E5E61] dark:text-slate-400">
            {myWorkshops.length === 0
              ? 'You have not created any workshops yet.'
              : 'No workshops match your current search query.'}
          </p>
          <div className="pt-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl text-xs font-heading font-semibold transition-colors"
            >
              Create Workshop
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#14231b] rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5F8EF] dark:bg-[#18281f] text-[#5E5E61] dark:text-emerald-400 border-b border-[#DCE4D6] dark:border-[#203a2c] font-heading font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Workshop</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4">Enrolled / Cap</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#22392c] text-[#101410] dark:text-slate-200">
                {filteredWorkshops.map((ws) => {
                  const seats = calculateSeats(ws, registrations);
                  return (
                    <tr key={ws.id} className="hover:bg-[#F5F8EF]/60 dark:hover:bg-[#1b2b22] transition-colors">
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={ws.bannerImageUrl}
                            alt={ws.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#E8F0DF] dark:bg-slate-800"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/images/fullstack-web-workshop-banner.jpg';
                            }}
                          />
                          <div>
                            <div className="font-heading font-bold text-[#101410] dark:text-white line-clamp-1">{ws.title}</div>
                            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 truncate">{ws.venue}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                          ws.pricingType === 'PAID'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-[#E8F0DF] dark:bg-[#1f382a] text-[#08482D] dark:text-[#DAE7C7] border border-[#DCE4D6] dark:border-[#284837]'
                        }`}>
                          {ws.pricingType === 'PAID' ? `₹${ws.price}` : 'FREE'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#5E5E61] dark:text-slate-300 font-medium">
                        <span className="px-2.5 py-0.5 bg-[#E8F0DF] dark:bg-[#1f382a] text-[#08482D] dark:text-[#DAE7C7] rounded-md text-[11px] font-medium border border-[#DCE4D6] dark:border-[#284837]">
                          {ws.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#101410] dark:text-slate-200">
                        <div className="font-bold text-[#101410] dark:text-white">{ws.date}</div>
                        <div className="text-[#5E5E61] dark:text-slate-400 text-[11px]">{ws.startTime} - {ws.endTime}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-[#101410] dark:text-white">{seats.registeredCount}</span>
                        <span className="text-[#5E5E61] dark:text-slate-400 font-mono"> / {ws.capacity}</span>
                        {seats.isFull ? (
                          <span className="ml-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[10px] uppercase">
                            Full
                          </span>
                        ) : (
                          <span className="ml-1.5 text-[#08482D] dark:text-[#a8d38d] font-semibold text-[10px]">
                            ({seats.availableSeats} left)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => togglePublishStatus(ws.id)}
                          title="Click to toggle publish status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            ws.status === 'PUBLISHED'
                              ? 'bg-[#E8F0DF] dark:bg-[#1b2f23] text-[#08482D] dark:text-[#DAE7C7] border border-[#DAE7C7] dark:border-[#2d4d3a]'
                              : ws.status === 'DRAFT'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                          }`}
                        >
                          {ws.status === 'PUBLISHED' && <CheckCircle className="w-3 h-3" />}
                          {ws.status === 'DRAFT' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                          <span>{ws.status}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setVerifierWorkshopId(ws.id);
                            setVerifierOpen(true);
                          }}
                          className="p-1.5 text-[#08482D] dark:text-[#DAE7C7] hover:bg-[#E8F0DF] dark:hover:bg-[#1b2f23] rounded-lg transition-colors"
                          title="Scan Tickets for this Workshop"
                        >
                          <Scan className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigateTo('workshop-detail', ws.id)}
                          className="p-1.5 text-[#5E5E61] dark:text-slate-400 hover:text-[#08482D] dark:hover:text-[#DAE7C7] hover:bg-[#F5F8EF] dark:hover:bg-[#1b2b22] rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(ws)}
                          className="p-1.5 text-[#5E5E61] dark:text-slate-400 hover:text-[#08482D] dark:hover:text-[#DAE7C7] hover:bg-[#F5F8EF] dark:hover:bg-[#1b2b22] rounded-lg"
                          title="Edit Workshop"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setWorkshopToDelete(ws)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                          title="Delete or Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete/Cancel Confirmation Modal */}
      <AnimatePresence>
        {workshopToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWorkshopToDelete(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-[#14231b] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCE4D6] dark:border-[#203a2c] space-y-4 z-10 text-xs text-[#101410] dark:text-[#E8F0DF]"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-heading font-bold text-[#101410] dark:text-white">Confirm Workshop Removal</h3>
                <p className="text-[#5E5E61] dark:text-slate-400 mt-1">
                  Are you sure you want to remove <strong className="text-[#101410] dark:text-white">{workshopToDelete.title}</strong>?
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                Note: Per academic data integrity policy, if this workshop already has active participant registrations,
                it will be set to <strong className="font-semibold">CANCELLED</strong> to preserve participant ticket records.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setWorkshopToDelete(null)}
                  className="px-4 py-2 font-heading font-semibold text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] rounded-xl"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 font-heading font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-500/20"
                >
                  Proceed
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WorkshopFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        workshopToEdit={editingWorkshop}
      />

      <QRVerifierModal
        isOpen={verifierOpen}
        onClose={() => setVerifierOpen(false)}
        workshopFilterId={verifierWorkshopId}
      />
    </div>
  );
};
