import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Workshop } from '../../types';
import { calculateSeats } from '../../utils/workshopRules';
import { normalizeBannerUrl } from '../../data/seedData';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#101D32] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-wider text-[#101D32] bg-[#FFD6B0] border border-[#101D32] px-2.5 py-0.5 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-[#F4511E]" />
              Faculty Management Console
            </span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-[#101410] tracking-tight">
            Manage My Workshops
          </h1>
          <p className="text-sm text-[#101D32]/80 mt-1">
            Publish, edit schedules, adjust capacity limits, and review active sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setVerifierWorkshopId(undefined);
              setVerifierOpen(true);
            }}
            className="px-4 py-2 border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] hover:bg-[#FFD6B0] rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5 text-[#F4511E]" />
            <span>Scan Tickets</span>
          </button>
          <button
            onClick={() => navigateTo('organizer-registrations')}
            className="px-4 py-2 border-2 border-[#101D32] bg-white text-[#101D32] hover:bg-[#FFD6B0] rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#F4511E]" />
            <span>View Attendees</span>
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>New Workshop</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#101D32]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workshops by title, venue, track..."
            className="w-full pl-10 pr-3.5 py-2 text-xs border-2 border-[#101D32] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4511E] bg-white text-[#101410]"
          />
        </div>
        <div className="text-xs text-[#101D32]/80 font-bold">
          Showing <strong className="text-[#101410] font-mono">{filteredWorkshops.length}</strong> sessions
        </div>
      </div>

      {/* Workshops Table */}
      {filteredWorkshops.length === 0 ? (
        <div className="bg-white border-2 border-[#101D32] rounded-xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-[4px_4px_0px_0px_#101D32]">
          <h3 className="text-base font-heading font-extrabold text-[#101410]">No Workshops Found</h3>
          <p className="text-xs text-[#101D32]/70">
            {myWorkshops.length === 0
              ? 'You have not created any workshops yet.'
              : 'No workshops match your current search query.'}
          </p>
          <div className="pt-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-xs font-heading font-bold cursor-pointer"
            >
              Create Workshop
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FFF5E9] text-[#101D32] border-b-2 border-[#101D32] font-heading font-extrabold uppercase tracking-wider text-[11px]">
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
              <tbody className="divide-y-2 divide-[#101D32]/10 text-[#101410]">
                {filteredWorkshops.map((ws) => {
                  const seats = calculateSeats(ws, registrations);
                  return (
                    <tr key={ws.id} className="hover:bg-[#FFF5E9]/50 transition-colors">
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={normalizeBannerUrl(ws.bannerImageUrl, ws)}
                            alt={ws.title}
                            className="w-12 h-12 rounded-lg border border-[#101D32] object-cover shrink-0 bg-[#FFF5E9]"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = normalizeBannerUrl('', ws);
                            }}
                          />
                          <div>
                            <div className="font-heading font-extrabold text-[#101410] line-clamp-1">{ws.title}</div>
                            <div className="text-[11px] text-[#101D32]/70 truncate">{ws.venue}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
                          {ws.pricingType === 'PAID' ? `₹${ws.price}` : 'FREE'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#101D32] font-semibold">
                        <span className="px-2.5 py-0.5 bg-white text-[#101D32] rounded-md text-[11px] border border-[#101D32]">
                          {ws.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#101410]">
                        <div className="font-bold text-[#101410]">{ws.date}</div>
                        <div className="text-[#101D32]/70 text-[11px]">{ws.startTime} - {ws.endTime}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-[#101410]">{seats.registeredCount}</span>
                        <span className="text-[#101D32]/70 font-mono"> / {ws.capacity}</span>
                        {seats.isFull ? (
                          <span className="ml-1.5 text-[#E84316] font-bold text-[10px] uppercase">
                            Full
                          </span>
                        ) : (
                          <span className="ml-1.5 text-[#F4511E] font-bold text-[10px]">
                            ({seats.availableSeats} left)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => togglePublishStatus(ws.id)}
                          title="Click to toggle publish status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border border-[#101D32] uppercase cursor-pointer transition-colors ${
                            ws.status === 'PUBLISHED'
                              ? 'bg-[#FFD6B0] text-[#101D32]'
                              : 'bg-[#FFF5E9] text-[#101D32]'
                          }`}
                        >
                          {ws.status === 'PUBLISHED' && <CheckCircle className="w-3 h-3 text-[#F4511E]" />}
                          <span>{ws.status}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setVerifierWorkshopId(ws.id);
                            setVerifierOpen(true);
                          }}
                          className="p-1.5 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded transition-colors shadow-[1px_1px_0px_0px_#101D32] cursor-pointer"
                          title="Scan Tickets for this Workshop"
                        >
                          <Scan className="w-4 h-4 text-[#F4511E]" />
                        </button>
                        <button
                          onClick={() => navigateTo('workshop-detail', ws.id)}
                          className="p-1.5 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded transition-colors shadow-[1px_1px_0px_0px_#101D32] cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[#F4511E]" />
                        </button>
                        <button
                          onClick={() => handleEdit(ws)}
                          className="p-1.5 text-[#101D32] bg-white hover:bg-[#FFD6B0] border border-[#101D32] rounded transition-colors shadow-[1px_1px_0px_0px_#101D32] cursor-pointer"
                          title="Edit Workshop"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setWorkshopToDelete(ws)}
                          className="p-1.5 text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D32]/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] space-y-4 z-10 text-xs text-[#101410]"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFD6B0] border border-[#101D32] text-[#E84316] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-heading font-extrabold text-[#101410]">Confirm Workshop Removal</h3>
                <p className="text-[#101D32]/80 mt-1">
                  Are you sure you want to remove <strong className="text-[#101410]">{workshopToDelete.title}</strong>?
                </p>
              </div>

              <div className="p-3.5 bg-[#FFF5E9] border border-[#101D32] rounded-lg text-[#101D32] text-[11px] leading-relaxed">
                Note: If this workshop already has active participant registrations,
                it will be marked <strong className="font-bold text-[#E84316]">CANCELLED</strong> to preserve participant ticket records.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#101D32]/10">
                <button
                  onClick={() => setWorkshopToDelete(null)}
                  className="px-4 py-2 font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] border border-[#101D32] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 font-heading font-bold text-white bg-[#E84316] hover:bg-rose-700 rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] cursor-pointer"
                >
                  Proceed
                </button>
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
