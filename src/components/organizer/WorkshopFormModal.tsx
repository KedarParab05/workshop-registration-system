import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Workshop, WorkshopFormData, WorkshopStatus } from '../../types';
import {
  BANNER_WEB,
  BANNER_AI,
  BANNER_CLOUD,
  BANNER_CYBER,
  BANNER_SPRING_REST,
  BANNER_DSA_JAVA,
  BANNER_DEVOPS_DOCKER,
  BANNER_SYSTEM_ARCH,
  HERO_IMAGE,
} from '../../data/seedData';
import { X, Image as ImageIcon, Calendar, Clock, MapPin, Check, Navigation, Sparkles, CreditCard, Lock, AlertCircle, Info, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkshopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopToEdit?: Workshop | null;
}

const PRESET_BANNERS = [
  { id: 'web', label: 'Full Stack React & Spring', url: BANNER_WEB },
  { id: 'spring-rest', label: 'Spring Boot 3 APIs', url: BANNER_SPRING_REST },
  { id: 'dsa', label: 'Java DSA & Algorithms', url: BANNER_DSA_JAVA },
  { id: 'devops-pipe', label: 'DevOps & Docker CI/CD', url: BANNER_DEVOPS_DOCKER },
  { id: 'cloud-aws', label: 'Cloud & Kubernetes', url: BANNER_CLOUD },
  { id: 'sys-arch', label: 'System Flow Architecture', url: BANNER_SYSTEM_ARCH },
  { id: 'ai', label: 'Artificial Intelligence', url: BANNER_AI },
  { id: 'cyber', label: 'Cybersecurity', url: BANNER_CYBER },
  { id: 'collab', label: 'Innovation Lab', url: HERO_IMAGE },
];

export const WorkshopFormModal: React.FC<WorkshopFormModalProps> = ({
  isOpen,
  onClose,
  workshopToEdit,
}) => {
  const { createWorkshop, updateWorkshop, registrations } = useApp();

  const [formData, setFormData] = useState<WorkshopFormData>({
    title: '',
    summary: '',
    description: '',
    category: 'Web Development',
    bannerImageUrl: BANNER_WEB,
    date: '',
    startTime: '10:00',
    endTime: '13:00',
    venue: '',
    onlineMode: false,
    meetingLink: '',
    capacity: 30,
    registrationDeadline: '',
    learningOutcomes: '',
    status: 'PUBLISHED',
    pricingType: 'PAID',
    price: 199,
    currency: 'INR',
    razorpayKeyId: '',
  });

  const [customUrlMode, setCustomUrlMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (workshopToEdit) {
      const savedCreds = (() => {
        try { return JSON.parse(localStorage.getItem('wh_workshop_creds') || '{}'); } catch { return {}; }
      })();
      const cred = savedCreds[workshopToEdit.id] || {};

      setFormData({
        title: workshopToEdit.title,
        summary: workshopToEdit.summary,
        description: workshopToEdit.description,
        category: workshopToEdit.category,
        bannerImageUrl: workshopToEdit.bannerImageUrl,
        date: workshopToEdit.date,
        startTime: workshopToEdit.startTime,
        endTime: workshopToEdit.endTime,
        venue: workshopToEdit.venue,
        venueAddress: workshopToEdit.venueAddress || '',
        latitude: workshopToEdit.latitude,
        longitude: workshopToEdit.longitude,
        mapUrl: workshopToEdit.mapUrl || '',
        onlineMode: workshopToEdit.onlineMode,
        meetingLink: workshopToEdit.meetingLink || '',
        capacity: workshopToEdit.capacity,
        registrationDeadline: workshopToEdit.registrationDeadline,
        learningOutcomes: workshopToEdit.learningOutcomes?.join('\n') || '',
        status: workshopToEdit.status,
        pricingType: workshopToEdit.pricingType || 'FREE',
        price: workshopToEdit.price || 0,
        currency: workshopToEdit.currency || 'INR',
        razorpayKeyId: workshopToEdit.razorpayKeyId || cred.razorpayKeyId || '',
      });
      const matchesPreset = PRESET_BANNERS.some((b) => b.url === workshopToEdit.bannerImageUrl);
      setCustomUrlMode(!matchesPreset);
    } else {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const dateStr = futureDate.toISOString().split('T')[0];

      setFormData({
        title: '',
        summary: '',
        description: '',
        category: 'Web Development',
        bannerImageUrl: BANNER_WEB,
        date: dateStr,
        startTime: '10:00',
        endTime: '13:00',
        venue: 'Engineering Hall Lab 201',
        venueAddress: '',
        latitude: undefined,
        longitude: undefined,
        mapUrl: '',
        onlineMode: false,
        meetingLink: '',
        capacity: 30,
        registrationDeadline: dateStr,
        learningOutcomes: 'Understand core system concepts\nPractical coding exercises\nReview best practices',
        status: 'PUBLISHED',
        pricingType: 'PAID',
        price: 199,
        currency: 'INR',
        razorpayKeyId: '',
      });
      setCustomUrlMode(false);
    }
    setErrors({});
  }, [workshopToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (workshopToEdit) {
      const result = await updateWorkshop(workshopToEdit.id, formData);
      if (result.success) {
        onClose();
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } else {
      const result = await createWorkshop(formData);
      if (result.success) {
        onClose();
      } else if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08482D]/40 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-[#14231b] rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-[#DCE4D6] dark:border-[#203a2c] my-auto max-h-[92vh] overflow-y-auto text-xs z-10 text-[#101410] dark:text-[#E8F0DF] transition-colors"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#5E5E61] hover:text-[#101410] dark:hover:text-white hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7] dark:bg-[#1f3d2d] px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-[#08482D] dark:text-[#a8d38d]" />
                Academic Session Builder
              </span>
              </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#101410] dark:text-white">
              {workshopToEdit ? 'Edit Academic Workshop' : 'Create New Academic Workshop'}
            </h2>
            <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-1">
              Configure session schedule, topic track, and free capacity limits.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                Workshop Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Modern Web Architecture with Microservices"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] ${
                  errors.title ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                }`}
              />
              {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Academic Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Publication Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkshopStatus })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                >
                  <option value="PUBLISHED">Published (Open for Registration)</option>
                  <option value="DRAFT">Draft (Hidden from Catalog)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                Short Summary (1-2 sentences for card catalog) *
              </label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief takeaway and target audience..."
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] ${
                  errors.summary ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                }`}
              />
              {errors.summary && <p className="text-rose-500 text-[11px] mt-1">{errors.summary}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                Comprehensive Syllabus & Details *
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the agenda, required tools, and workshop lab structure..."
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] ${
                  errors.description ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                }`}
              />
              {errors.description && <p className="text-rose-500 text-[11px] mt-1">{errors.description}</p>}
            </div>

            {/* Banner Theme Selection */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#F5F8EF] dark:bg-[#18281f] border border-[#DCE4D6] dark:border-[#22392c]">
              <div className="flex items-center justify-between">
                <label className="font-heading font-semibold text-[#101410] dark:text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                  Select Visual Banner Theme
                </label>
                <button
                  type="button"
                  onClick={() => setCustomUrlMode(!customUrlMode)}
                  className="text-[11px] text-[#08482D] dark:text-[#DAE7C7] hover:underline font-semibold"
                >
                  {customUrlMode ? 'Choose from Presets' : 'Custom Image URL'}
                </button>
              </div>

              {!customUrlMode ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {PRESET_BANNERS.map((banner) => {
                    const isSelected = formData.bannerImageUrl === banner.url;
                    return (
                      <button
                        type="button"
                        key={banner.id}
                        onClick={() => setFormData({ ...formData, bannerImageUrl: banner.url })}
                        className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#08482D] ring-2 ring-[#08482D]/30'
                            : 'border-[#DCE4D6] dark:border-[#22392c] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={banner.url}
                          alt={banner.label}
                          className="h-16 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/fullstack-web-workshop-banner.jpg';
                          }}
                        />
                        <div className="p-1 text-[10px] font-semibold text-[#101410] dark:text-slate-300 truncate">
                          {banner.label}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#08482D] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="url"
                  value={formData.bannerImageUrl}
                  onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-white dark:bg-[#14231b] text-[#101410] dark:text-white"
                />
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Workshop Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white ${
                    errors.date ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white ${
                    errors.time ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                  }`}
                />
                {errors.time && <p className="text-rose-500 text-[11px] mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Delivery Mode Toggle: In-Person Campus vs Online Webcast */}
            <div className="p-3.5 rounded-2xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF]/60 dark:bg-[#18281f]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-heading font-semibold text-[#101410] dark:text-white text-xs block">
                  Workshop Delivery Mode
                </span>
                <span className="text-[11px] text-[#5E5E61] dark:text-slate-400">
                  Choose physical campus venue or virtual webinar session.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, onlineMode: false, venue: formData.venue === 'Online Webcast (Zoom/Meet)' ? '' : formData.venue })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all ${
                    !formData.onlineMode
                      ? 'bg-[#08482D] text-white shadow-sm'
                      : 'border border-[#DCE4D6] dark:border-[#22392c] text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]'
                  }`}
                >
                  📍 In-Person Campus
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, onlineMode: true, venue: formData.venue || 'Online Webcast (Zoom/Meet)' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all ${
                    formData.onlineMode
                      ? 'bg-[#08482D] text-white shadow-sm'
                      : 'border border-[#DCE4D6] dark:border-[#22392c] text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]'
                  }`}
                >
                  🌐 Online Webcast
                </button>
              </div>
            </div>

            {formData.onlineMode && (
              <div className="p-3.5 rounded-2xl border border-[#DAE7C7] dark:border-[#2d4d3a] bg-[#E8F0DF]/50 dark:bg-[#1a3325]/30 space-y-2">
                <label className="block font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] text-xs">
                  Virtual Meeting Link (Zoom, Google Meet, MS Teams)
                </label>
                <input
                  type="url"
                  value={formData.meetingLink || ''}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-white dark:bg-[#14231b] text-[#101410] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                />
              </div>
            )}

            {/* Venue & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  {formData.onlineMode ? 'Online Platform Note' : 'Venue / Lab Location *'}
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder={formData.onlineMode ? "e.g. Zoom / Google Meet Link Above" : "e.g. CS Innovation Center Lab 302"}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white ${
                    errors.venue ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                  }`}
                />
                {errors.venue && <p className="text-rose-500 text-[11px] mt-1">{errors.venue}</p>}
              </div>

              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                  Free Seat Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white ${
                    errors.capacity ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                  }`}
                />
                {errors.capacity && <p className="text-rose-500 text-[11px] mt-1">{errors.capacity}</p>}
              </div>
            </div>

            {/* GPS Location (for In-Person workshops only) */}
            {!formData.onlineMode && (
              <div className="space-y-3 p-4 rounded-2xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF]/60 dark:bg-[#18281f]/40">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span className="font-heading font-semibold text-[#101410] dark:text-white text-xs">
                    GPS Location for Participants (Enables Map Navigation)
                  </span>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1 text-xs">
                    Full Address / Location Description
                  </label>
                  <input
                    type="text"
                    value={formData.venueAddress || ''}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="e.g. Engineering Block 3, North Campus, University Road, City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-white dark:bg-[#14231b] text-[#101410] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                  />
                </div>

                {/* Google Maps Link */}
                <div>
                  <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1 text-xs">
                    Google Maps Link <span className="text-[#5E5E61] font-normal">(Paste share link — coordinates auto-extracted)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.mapUrl || ''}
                      onChange={(e) => {
                        const url = e.target.value;
                        let lat: number | undefined;
                        let lng: number | undefined;

                        const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                        if (atMatch) {
                          lat = parseFloat(atMatch[1]);
                          lng = parseFloat(atMatch[2]);
                        } else {
                          const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                          if (qMatch) {
                            lat = parseFloat(qMatch[1]);
                            lng = parseFloat(qMatch[2]);
                          }
                        }

                        setFormData({ ...formData, mapUrl: url, latitude: lat, longitude: lng });
                      }}
                      placeholder="Paste Google Maps link — e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
                      className="w-full px-3.5 py-2.5 pr-24 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-white dark:bg-[#14231b] text-[#101410] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                    />
                    {formData.mapUrl && (
                      <a
                        href={formData.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-lg text-[10px] font-heading font-semibold transition-colors"
                      >
                        Preview ↗
                      </a>
                    )}
                  </div>
                  {/* Show parsed coordinates */}
                  {(formData.latitude && formData.longitude) ? (
                    <p className="text-[11px] text-[#08482D] dark:text-[#a8d38d] mt-1 flex items-center gap-1 font-medium">
                      ✅ Coordinates detected: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                    </p>
                  ) : formData.mapUrl ? (
                    <p className="text-[11px] text-amber-500 mt-1">
                      ⚠ Short link detected — coordinates will resolve when participants open the map.
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {/* ━━━━━ Registration & Pricing Configuration ━━━━━ */}
            <div className="space-y-4 p-4 rounded-2xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF]/60 dark:bg-[#18281f]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span className="font-heading font-semibold text-[#101410] dark:text-white text-xs">
                    Registration Fee & Razorpay Gateway
                  </span>
                </div>
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#08482D] dark:text-[#DAE7C7] bg-[#DAE7C7]/50 dark:bg-[#08482D]/40 px-2.5 py-0.5 rounded-full">
                  Razorpay Enabled
                </span>
              </div>

              {/* Pricing Lock Warning */}
              {workshopToEdit && registrations.some(r => r.workshopId === workshopToEdit.id && (r.status === 'CONFIRMED' || r.status === 'ATTENDED')) && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Pricing is locked because participants have already registered. Create a new session to change pricing.</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Price Input */}
                <div>
                  <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1 text-xs">
                    Workshop Registration Fee (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#08482D] dark:text-[#DAE7C7] font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, pricingType: 'PAID', price: parseFloat(e.target.value) || 0 })}
                      placeholder="199"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#14231b] text-[#101410] dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#08482D] ${
                        errors.price ? 'border-rose-500' : 'border-[#DCE4D6] dark:border-[#22392c]'
                      }`}
                    />
                  </div>
                  {errors.price && <p className="text-rose-500 text-[11px] mt-1">{errors.price}</p>}
                </div>

                {/* Razorpay Gateway Notice */}
                <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-[#DAE7C7] dark:border-[#22392c] rounded-xl text-xs text-[#08482D] dark:text-[#DAE7C7]">
                  <CreditCard className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Official Razorpay Gateway Active</strong>: All participant registrations for this workshop will be securely processed and verified via Razorpay Checkout.
                  </div>
                </div>

                {/* Quick Price Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-medium">Quick set:</span>
                  {[10, 50, 100, 199, 299, 499].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, pricingType: 'PAID', price: preset })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors ${
                        formData.price === preset
                          ? 'bg-[#08482D] text-white border-[#08482D]'
                          : 'bg-white dark:bg-[#14231b] text-[#08482D] dark:text-[#DAE7C7] border-[#DCE4D6] dark:border-[#22392c] hover:border-[#08482D]'
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payment Gateway Information (Paid Workshops Only) ── */}
            {formData.pricingType === 'PAID' && (
              <div className="p-4 rounded-2xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#16291e] space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                  <span className="text-sm font-heading font-bold text-[#101410] dark:text-[#f0f5ee]">
                    Payment Gateway (Razorpay Exclusive)
                  </span>
                </div>
                <p className="text-[11px] text-[#5E5E61] dark:text-[#8ba895]">
                  Paid registrations are processed securely via Razorpay with encrypted payment verification.
                </p>
                <div>
                  <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-white mb-1">
                    Razorpay Key ID (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={formData.razorpayKeyId || ''}
                    onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                    placeholder="rzp_live_... or leave blank for platform default"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-white dark:bg-[#14231b] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] font-mono"
                  />
                  <p className="text-[10px] text-[#5E5E61] dark:text-[#8ba895] mt-0.5">
                    Leave blank to use the platform default Razorpay gateway credentials.
                  </p>
                </div>
              </div>
            )}

            {/* Learning Outcomes */}
            <div>
              <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1">
                Key Learning Outcomes (1 per line)
              </label>              <textarea
                rows={3}
                value={formData.learningOutcomes}
                onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                placeholder="Hands-on coding experience&#10;Understanding scalability and fault-tolerance&#10;Deployment to production cloud"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-[#DCE4D6] dark:border-[#203a2c] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] text-[#5E5E61] dark:text-slate-300 font-semibold font-heading"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#08482D] hover:bg-[#0c5c3b] text-white font-semibold font-heading shadow-md shadow-[#08482D]/20"
              >
                {workshopToEdit ? 'Save Workshop Changes' : 'Create Academic Workshop'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
