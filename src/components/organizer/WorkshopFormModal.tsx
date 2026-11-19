import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Workshop, WorkshopFormData, WorkshopStatus } from '../../types';
import { apiFetch } from '../../utils/api';
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
import {
  X,
  Image as ImageIcon,
  Check,
  Navigation,
  Sparkles,
  CreditCard,
  Lock,
  Tag,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkshopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopToEdit?: Workshop | null;
}

const PRESET_BANNERS = [
  { id: 'web', label: 'Full-Stack Web Engineering', url: BANNER_WEB },
  { id: 'spring-rest', label: 'Enterprise REST APIs', url: BANNER_SPRING_REST },
  { id: 'dsa', label: 'Algorithms & Problem Solving', url: BANNER_DSA_JAVA },
  { id: 'devops-pipe', label: 'Continuous Delivery & Infrastructure', url: BANNER_DEVOPS_DOCKER },
  { id: 'cloud-aws', label: 'Cloud Systems & Scalability', url: BANNER_CLOUD },
  { id: 'sys-arch', label: 'Enterprise Architecture & Systems', url: BANNER_SYSTEM_ARCH },
  { id: 'ai', label: 'Applied Artificial Intelligence', url: BANNER_AI },
  { id: 'cyber', label: 'Cybersecurity & Defense', url: BANNER_CYBER },
  { id: 'collab', label: 'Innovation & Studio Lab', url: HERO_IMAGE },
];

export const WorkshopFormModal: React.FC<WorkshopFormModalProps> = ({
  isOpen,
  onClose,
  workshopToEdit,
}) => {
  const { createWorkshop, updateWorkshop, registrations, showAlert } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<WorkshopFormData>({
    title: '',
    summary: '',
    description: '',
    category: 'Web Development',
    bannerImageUrl: BANNER_WEB,
    bannerImagePublicId: '',
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
    pricingType: 'FREE',
    price: 0,
    currency: 'INR',
    razorpayKeyId: '',
  });

  const [bannerTab, setBannerTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Process and optimize image file from user's local folder to lightweight sharp data URL
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1000;

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.82);
          resolve(optimized);
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDirectFile = async (file: File) => {
    setUploadError('');
    setUploadSuccess(false);

    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid format. Please select an image file (JPG, PNG, WebP, GIF, SVG).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds 20MB limit. Please select a smaller image.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Process directly from local device folder into optimized display URL
      const localDataUrl = await processImageFile(file);

      setFormData((prev) => ({
        ...prev,
        bannerImageUrl: localDataUrl,
        bannerImagePublicId: file.name,
      }));
      setUploadSuccess(true);
      setIsUploading(false);
      showAlert(`Image "${file.name}" loaded successfully from folder!`, 'success');

      // 2. Also attempt upload to cloud service in background if available
      try {
        const data = new FormData();
        data.append('file', file);
        data.append('folder', 'workshops');

        const res = await apiFetch('/api/uploads/image', {
          method: 'POST',
          body: data,
        });

        if (res.ok) {
          const json = await res.json();
          // STRICT CHECK: Only overwrite if it returned a real Cloudinary URL, NEVER fallback static image!
          if (json.success && json.url && json.url.includes('cloudinary.com')) {
            setFormData((prev) => ({
              ...prev,
              bannerImageUrl: json.url,
              bannerImagePublicId: json.publicId || file.name,
            }));
          }
        }
      } catch {
        // Cloud service unavailable: local image data is already active and ready to save!
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error loading image from folder.');
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleDirectFile(file);
  };

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
        bannerImagePublicId: workshopToEdit.bannerImagePublicId || '',
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

      if (workshopToEdit.bannerImagePublicId) {
        setBannerTab('upload');
      } else {
        const matchesPreset = PRESET_BANNERS.some((b) => b.url === workshopToEdit.bannerImageUrl);
        setBannerTab(matchesPreset ? 'preset' : 'url');
      }
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
        bannerImagePublicId: '',
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
        pricingType: 'FREE',
        price: 0,
        currency: 'INR',
        razorpayKeyId: '',
      });
      setBannerTab('preset');
    }
    setUploadError('');
    setUploadSuccess(false);
    setErrors({});
  }, [workshopToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const isFree = formData.pricingType === 'FREE' || Number(formData.price) === 0;
    const submissionData: WorkshopFormData = {
      ...formData,
      pricingType: isFree ? 'FREE' : 'PAID',
      price: isFree ? 0 : (Number(formData.price) || 0),
    };

    try {
      if (workshopToEdit) {
        const result = await updateWorkshop(workshopToEdit.id, submissionData);
        if (result.success) {
          onClose();
        } else if (result.errors) {
          setErrors(result.errors);
          const firstKey = Object.keys(result.errors)[0];
          const firstMsg = result.errors[firstKey];
          showAlert(firstMsg || 'Please review the highlighted fields.', 'error');
          modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const result = await createWorkshop(submissionData);
        if (result.success) {
          onClose();
        } else if (result.errors) {
          setErrors(result.errors);
          const firstKey = Object.keys(result.errors)[0];
          const firstMsg = result.errors[firstKey];
          showAlert(firstMsg || 'Please review the highlighted fields.', 'error');
          modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      showAlert(err.message || 'Failed to save workshop changes.', 'error');
    } finally {
      setIsSubmitting(false);
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
          className="fixed inset-0 bg-[#101D32]/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          ref={modalContentRef}
          className="relative bg-[#FFF5E9] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] my-auto max-h-[92vh] overflow-y-auto text-xs z-10 text-[#101D32]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#101D32] hover:bg-[#FFD6B0] border-2 border-transparent hover:border-[#101D32] transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#101D32] bg-[#FFD6B0] px-3 py-1 rounded-full border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]">
                <Sparkles className="w-3.5 h-3.5 text-[#F4511E]" />
                Academic Session Builder
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#101D32]">
              {workshopToEdit ? 'Edit Academic Workshop' : 'Create New Academic Workshop'}
            </h2>
            <p className="text-xs text-[#101D32]/75 font-medium mt-1">
              Configure session schedule, topic track, and capacity limits.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                Workshop Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Modern Web Architecture with Microservices"
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9] ${
                  errors.title ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              />
              {errors.title && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.title}</p>}
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                  Academic Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9] ${
                    errors.category ? 'border-rose-500 ring-1 ring-rose-500' : ''
                  }`}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                  Publication Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkshopStatus })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9]"
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
              <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                Short Summary (1-2 sentences for card catalog) *
              </label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief takeaway and target audience..."
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9] ${
                  errors.summary ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              />
              {errors.summary && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.summary}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                Comprehensive Syllabus & Details *
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the agenda, required tools, and workshop lab structure..."
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9] ${
                  errors.description ? 'border-rose-500 ring-1 ring-rose-500' : ''
                }`}
              />
              {errors.description && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.description}</p>}
            </div>

            {/* Banner Theme Selection & Cloudinary CDN */}
            <div className="space-y-3 p-4 rounded-2xl bg-white border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-heading font-extrabold text-[#101D32] flex items-center gap-1.5 text-xs">
                  <ImageIcon className="w-4 h-4 text-[#F4511E]" />
                  <span>Workshop Visual Banner</span>
                </label>
                {/* 3-way toggle */}
                <div className="flex items-center gap-1 bg-[#FFF5E9] p-1 rounded-xl border-2 border-[#101D32]">
                  <button
                    type="button"
                    onClick={() => setBannerTab('upload')}
                    className={`px-2.5 py-1 text-[11px] font-heading font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      bannerTab === 'upload'
                        ? 'bg-[#F4511E] text-white border-[#101D32] shadow-[1px_1px_0px_#101D32]'
                        : 'border-transparent text-[#101D32] hover:bg-[#FFD6B0]'
                    }`}
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload from Folder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTab('preset')}
                    className={`px-2.5 py-1 text-[11px] font-heading font-bold rounded-lg border transition-all cursor-pointer ${
                      bannerTab === 'preset'
                        ? 'bg-[#F4511E] text-white border-[#101D32] shadow-[1px_1px_0px_#101D32]'
                        : 'border-transparent text-[#101D32] hover:bg-[#FFD6B0]'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTab('url')}
                    className={`px-2.5 py-1 text-[11px] font-heading font-bold rounded-lg border transition-all cursor-pointer ${
                      bannerTab === 'url'
                        ? 'bg-[#F4511E] text-white border-[#101D32] shadow-[1px_1px_0px_#101D32]'
                        : 'border-transparent text-[#101D32] hover:bg-[#FFD6B0]'
                    }`}
                  >
                    Custom URL
                  </button>
                </div>
              </div>

              {/* Tab 1: Local Folder Upload & Cloud Storage */}
              {bannerTab === 'upload' && (
                <div className="space-y-3 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Upload Box / Action Trigger */}
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) handleDirectFile(droppedFile);
                    }}
                    className="border-2 border-dashed border-[#101D32] rounded-xl p-5 text-center bg-[#FFF5E9]/70 hover:bg-[#FFD6B0]/40 transition-all cursor-pointer shadow-inner"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#F4511E]" />
                        <span className="font-heading font-bold text-xs text-[#101D32]">
                          Processing image from folder...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFD6B0] border-2 border-[#101D32] shadow-[2px_2px_0px_#101D32] flex items-center justify-center">
                          <UploadCloud className="w-6 h-6 text-[#F4511E]" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-xs sm:text-sm text-[#101D32]">
                            Click to Browse Image from Your Folder
                          </p>
                          <p className="text-[11px] text-[#101D32]/70 font-medium mt-0.5">
                            Select any JPG, PNG, WebP, or GIF image from your computer or phone
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-white border border-[#101D32] rounded-lg text-xs font-bold text-[#101D32] shadow-[1px_1px_0px_#101D32] mt-1">
                          📁 Browse Files...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Image Preview if Loaded */}
                  {formData.bannerImageUrl && (
                    <div className="rounded-xl overflow-hidden border-2 border-[#101D32] bg-white p-3 flex flex-col sm:flex-row items-center gap-3 shadow-[2px_2px_0px_#101D32]">
                      <img
                        src={formData.bannerImageUrl}
                        alt="Current Banner"
                        className="w-full sm:w-36 h-20 object-cover rounded-lg border-2 border-[#101D32] shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = BANNER_WEB;
                        }}
                      />
                      <div className="flex-1 min-w-0 w-full space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active Banner Image</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-[#101D32]/80 font-mono truncate font-bold">
                          {formData.bannerImagePublicId || 'Custom Uploaded Image'}
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-md bg-[#FFF5E9] border border-[#101D32] text-[11px] font-heading font-bold text-[#101D32] hover:bg-[#FFD6B0] shadow-[1px_1px_0px_#101D32] cursor-pointer"
                          >
                            Replace with Another Image
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Tab 2: Preset Themes */}
              {bannerTab === 'preset' && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {PRESET_BANNERS.map((banner) => {
                    const isSelected = formData.bannerImageUrl === banner.url;
                    return (
                      <button
                        type="button"
                        key={banner.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            bannerImageUrl: banner.url,
                            bannerImagePublicId: '',
                          })
                        }
                        className={`relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#101D32] bg-[#FFD6B0] shadow-[3px_3px_0px_0px_#101D32] ring-2 ring-[#F4511E]'
                            : 'border-[#101D32] opacity-75 hover:opacity-100 bg-white hover:bg-[#FFF5E9]'
                        }`}
                      >
                        <img
                          src={banner.url}
                          alt={banner.label}
                          className="h-16 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = BANNER_WEB;
                          }}
                        />
                        <div className="p-1.5 text-[10px] font-bold text-[#101D32] truncate">
                          {banner.label}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#F4511E] text-white border border-[#101D32] flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Custom URL */}
              {bannerTab === 'url' && (
                <div className="space-y-1.5 pt-1">
                  <input
                    type="url"
                    value={formData.bannerImageUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bannerImageUrl: e.target.value,
                        bannerImagePublicId: '',
                      })
                    }
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium text-xs focus:outline-none focus:bg-[#FFF5E9]"
                  />
                  <p className="text-[10px] text-[#101D32]/60">
                    Paste an HTTPS image link from Unsplash, Imgur, or your university cloud.
                  </p>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                  Workshop Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] ${
                    errors.date ? 'border-rose-500' : ''
                  }`}
                />
                {errors.date && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] ${
                    errors.startTime ? 'border-rose-500' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] ${
                    errors.time || errors.endTime ? 'border-rose-500' : ''
                  }`}
                />
                {(errors.time || errors.startTime || errors.endTime) && (
                  <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.time || errors.startTime || errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Delivery Mode Toggle: In-Person Campus vs Online Webcast */}
            <div className="p-4 rounded-2xl border-2 border-[#101D32] bg-white shadow-[3px_3px_0px_0px_#101D32] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-heading font-bold text-[#101410] text-xs block">
                  Workshop Delivery Mode
                </span>
                <span className="text-[11px] text-[#101D32]/75 font-medium">
                  Choose physical campus venue or virtual webinar session.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, onlineMode: false, venue: formData.venue === 'Online Webcast (Zoom/Meet)' ? '' : formData.venue })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-[#101D32] transition-all ${
                    !formData.onlineMode
                      ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                      : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
                  }`}
                >
                  📍 In-Person Campus
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, onlineMode: true, venue: formData.venue || 'Online Webcast (Zoom/Meet)' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-[#101D32] transition-all ${
                    formData.onlineMode
                      ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                      : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
                  }`}
                >
                  🌐 Online Webcast
                </button>
              </div>
            </div>

            {formData.onlineMode && (
              <div className="p-4 rounded-2xl border-2 border-[#101D32] bg-white shadow-[3px_3px_0px_0px_#101D32] space-y-2">
                <label className="block font-heading font-bold text-[#101D32] text-xs">
                  Virtual Meeting Link (Zoom, Google Meet, MS Teams)
                </label>
                <input
                  type="url"
                  value={formData.meetingLink || ''}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-medium focus:outline-none focus:bg-white"
                />
              </div>
            )}

            {/* Venue & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                  {formData.onlineMode ? 'Online Platform Note' : 'Venue / Lab Location *'}
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder={formData.onlineMode ? "e.g. Zoom / Google Meet Link Above" : "e.g. CS Innovation Center Lab 302"}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] ${
                    errors.venue ? 'border-rose-500' : ''
                  }`}
                />
                {errors.venue && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.venue}</p>}
              </div>

              <div>
                <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                  Seat Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] ${
                    errors.capacity ? 'border-rose-500' : ''
                  }`}
                />
                {errors.capacity && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.capacity}</p>}
              </div>
            </div>

            {/* GPS Location (for In-Person workshops only) */}
            {!formData.onlineMode && (
              <div className="space-y-3 p-4 rounded-2xl border-2 border-[#101D32] bg-white shadow-[3px_3px_0px_0px_#101D32]">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#F4511E]" />
                  <span className="font-heading font-bold text-[#101D32] text-xs">
                    GPS Location for Participants (Enables Map Navigation)
                  </span>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block font-heading font-bold text-[#101D32] mb-1 text-xs">
                    Full Address / Location Description
                  </label>
                  <input
                    type="text"
                    value={formData.venueAddress || ''}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="e.g. Engineering Block 3, North Campus, University Road, City"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Google Maps Link */}
                <div>
                  <label className="block font-heading font-bold text-[#101D32] mb-1 text-xs">
                    Google Maps Link <span className="text-[#101D32]/70 font-normal">(Paste share link — coordinates auto-extracted)</span>
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
                      className="w-full px-3.5 py-2.5 pr-24 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-medium focus:outline-none focus:bg-white"
                    />
                    {formData.mapUrl && (
                      <a
                        href={formData.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#101D32] hover:bg-[#F4511E] text-white rounded-lg text-[10px] font-heading font-bold transition-colors"
                      >
                        Preview ↗
                      </a>
                    )}
                  </div>
                  {/* Show parsed coordinates */}
                  {(formData.latitude && formData.longitude) ? (
                    <p className="text-[11px] text-[#101D32] mt-1 flex items-center gap-1 font-bold">
                      📍 Coordinates detected: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                    </p>
                  ) : formData.mapUrl ? (
                    <p className="text-[11px] text-amber-600 font-bold mt-1">
                      ⚠ Short link detected — coordinates will resolve when participants open the map.
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {/* Registration & Pricing Configuration */}
            <div className="space-y-4 p-4 rounded-2xl border-2 border-[#101D32] bg-white shadow-[3px_3px_0px_0px_#101D32]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#F4511E]" />
                  <span className="font-heading font-bold text-[#101D32] text-xs">
                    Registration Fee & Pricing
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFD6B0] text-[#101D32] border border-[#101D32]">
                  {formData.pricingType === 'FREE' ? 'Free Workshop' : 'Paid · Razorpay'}
                </span>
              </div>

              {/* Free / Paid Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricingType: 'FREE', price: 0 })}
                  className={`flex-1 py-3 rounded-xl text-xs font-heading font-extrabold border-2 border-[#101D32] transition-all cursor-pointer ${
                    formData.pricingType === 'FREE'
                      ? 'bg-[#F4511E] text-white shadow-[3px_3px_0px_0px_#101D32]'
                      : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
                  }`}
                >
                  🎁 Free Workshop (₹0)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricingType: 'PAID', price: formData.price > 0 ? formData.price : 199 })}
                  className={`flex-1 py-3 rounded-xl text-xs font-heading font-extrabold border-2 border-[#101D32] transition-all cursor-pointer ${
                    formData.pricingType === 'PAID'
                      ? 'bg-[#F4511E] text-white shadow-[3px_3px_0px_0px_#101D32]'
                      : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
                  }`}
                >
                  💳 Paid Workshop
                </button>
              </div>

              {/* Free Workshop Info */}
              {formData.pricingType === 'FREE' && (
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border-2 border-emerald-700 text-emerald-950 rounded-xl text-xs font-medium shadow-[2px_2px_0px_#101D32]">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                  <div>
                    <strong className="text-emerald-900 block font-bold">Free Enrollment Active</strong>
                    Participants can RSVP and reserve seats instantly at no cost. Digital QR entry pass will be generated immediately without payment gateway.
                  </div>
                </div>
              )}

              {/* Paid Workshop Inputs */}
              {formData.pricingType === 'PAID' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-heading font-bold text-[#101D32] mb-1 text-xs">
                      Workshop Registration Fee (₹ INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#101D32] font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        step="1"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, pricingType: 'PAID', price: parseFloat(e.target.value) || 0 })}
                        placeholder="199"
                        className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] font-mono text-sm font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#101D32] ${
                          errors.price ? 'border-rose-500' : ''
                        }`}
                      />
                    </div>
                    {errors.price && <p className="text-rose-600 text-[11px] font-bold mt-1">{errors.price}</p>}
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-[#FFF5E9] border-2 border-[#101D32] rounded-xl text-xs text-[#101D32] font-medium">
                    <CreditCard className="w-4 h-4 shrink-0 mt-0.5 text-[#F4511E]" />
                    <div>
                      <strong>Official Razorpay Gateway Active</strong>: All participant registrations for this workshop will be securely processed and verified via Razorpay Checkout.
                    </div>
                  </div>

                  {/* Quick Price Presets */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-[#101D32]/75 font-bold">Quick set:</span>
                    {[10, 50, 100, 199, 299, 499].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, pricingType: 'PAID', price: preset })}
                        className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold border-2 border-[#101D32] transition-colors ${
                          formData.price === preset
                            ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                            : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Gateway Information (Paid Workshops Only) */}
            {formData.pricingType === 'PAID' && (
              <div className="p-4 rounded-2xl border-2 border-[#101D32] bg-white shadow-[3px_3px_0px_0px_#101D32] space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#F4511E]" />
                  <span className="text-sm font-heading font-bold text-[#101D32]">
                    Payment Gateway (Razorpay Exclusive)
                  </span>
                </div>
                <p className="text-[11px] text-[#101D32]/75 font-medium">
                  Paid registrations are processed securely via Razorpay with encrypted payment verification.
                </p>
                <div>
                  <label className="block text-xs font-heading font-bold text-[#101D32] mb-1">
                    Razorpay Key ID (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={formData.razorpayKeyId || ''}
                    onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                    placeholder="rzp_live_... or leave blank for platform default"
                    className="w-full px-3 py-2 text-xs rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] font-mono font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#101D32]"
                  />
                  <p className="text-[10px] text-[#101D32]/70 mt-1">
                    Leave blank to use the platform default Razorpay gateway credentials.
                  </p>
                </div>
              </div>
            )}

            {/* Learning Outcomes */}
            <div>
              <label className="block font-heading font-bold text-[#101D32] mb-1.5 text-xs">
                Key Learning Outcomes (1 per line)
              </label>
              <textarea
                rows={3}
                value={formData.learningOutcomes}
                onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                placeholder="Hands-on coding experience&#10;Understanding scalability and fault-tolerance&#10;Deployment to production cloud"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-[#101D32] font-medium shadow-[2px_2px_0px_0px_#101D32] focus:outline-none focus:bg-[#FFF5E9]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t-2 border-[#101D32] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border-2 border-[#101D32] bg-white hover:bg-[#FFD6B0] text-[#101D32] font-heading font-bold text-xs shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-50 text-white font-heading font-extrabold text-xs border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <span>{workshopToEdit ? 'Save Workshop Changes' : 'Create Academic Workshop'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
