import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QrScanner from 'qr-scanner';
import {
  X,
  Scan,
  Camera,
  UploadCloud,
  Keyboard,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Sparkles,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  MapPin,
  Check,
  Layers,
  Volume2,
  VolumeX,
  SwitchCamera,
  Zap,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Registration, Workshop } from '../../types';

interface QRVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopFilterId?: string;
}

interface ScanHistoryItem {
  id: string;
  timestamp: string;
  ticketCode: string;
  participantName: string;
  workshopTitle: string;
  status: 'GRANTED' | 'DENIED';
  message: string;
}

export const QRVerifierModal: React.FC<QRVerifierModalProps> = ({
  isOpen,
  onClose,
  workshopFilterId,
}) => {
  const { currentUser, workshops, registrations, verifyTicket } = useApp();

  // Tab mode: camera, image upload, or manual code input
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');

  // Organizer's workshops filter
  const myWorkshops = workshops.filter(
    (w) =>
      currentUser?.role === 'SUPER_ADMIN' ||
      w.organizerId === currentUser?.id ||
      (currentUser?.fullName && w.organizerNameSnapshot === currentUser.fullName)
  );

  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(
    workshopFilterId || (myWorkshops.length > 0 ? myWorkshops[0].id : 'ALL')
  );

  // Manual input state
  const [ticketInput, setTicketInput] = useState('');
  const [allowBypass, setAllowBypass] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const isScanningRef = useRef(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentCameraId, setCurrentCameraId] = useState<string>('environment');
  const [availableCameras, setAvailableCameras] = useState<QrScanner.Camera[]>([]);
  const [flashSupported, setFlashSupported] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  // Drag and drop image upload state
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scan History
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  // Verification result state
  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    registration?: Registration;
    workshop?: Workshop;
  }>({ status: 'idle', message: '' });

  // Sound feedback synthesizer
  const playAudioFeedback = useCallback(
    (success: boolean) => {
      if (!soundEnabled) return;
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        if (success) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.1); // E6
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } else {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, audioCtx.currentTime);
          osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        }
      } catch {
        // Audio unavailable
      }
    },
    [soundEnabled]
  );

  // Execute verification logic
  const processTicketVerification = useCallback(
    async (rawCode: string) => {
      if (!rawCode || !rawCode.trim()) return;

      const trimmed = rawCode.trim();
      const now = Date.now();

      // Debounce duplicate scans within 3 seconds
      if (
        lastScannedCodeRef.current &&
        lastScannedCodeRef.current.code === trimmed &&
        now - lastScannedCodeRef.current.time < 3000
      ) {
        return;
      }

      if (isScanningRef.current) return;
      isScanningRef.current = true;
      lastScannedCodeRef.current = { code: trimmed, time: now };

      setVerifying(true);
      setResult({ status: 'idle', message: '' });

      let codeToVerify = trimmed;
      let extractedWorkshopTitle = '';

      // Check if code is JSON encoded from QRTicketModal
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.ticketCode) {
          codeToVerify = parsed.ticketCode;
        }
        if (parsed.workshopTitle) {
          extractedWorkshopTitle = parsed.workshopTitle;
        }
      } catch {
        // Plain ticket code string
      }

      const activeTargetWorkshop = selectedWorkshopId !== 'ALL' ? selectedWorkshopId : undefined;
      const res = await verifyTicket(codeToVerify, allowBypass, activeTargetWorkshop);

      if (res.success && res.registration) {
        const ws = workshops.find((w) => w.id === res.registration?.workshopId);
        playAudioFeedback(true);
        setResult({
          status: 'success',
          message: res.message || 'Ticket verified successfully! Access granted.',
          registration: res.registration,
          workshop: ws,
        });

        // Add to live session history
        setScanHistory((prev) => [
          {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            ticketCode: codeToVerify,
            participantName: res.registration?.participantName || 'Attendee',
            workshopTitle: ws?.title || extractedWorkshopTitle || 'Workshop',
            status: 'GRANTED',
            message: '1-time entry granted',
          },
          ...prev.slice(0, 9),
        ]);
        setTicketInput('');
      } else {
        playAudioFeedback(false);
        const existing = registrations.find(
          (r) => r.ticketCode === codeToVerify || r.id === codeToVerify
        );
        const ws = existing ? workshops.find((w) => w.id === existing.workshopId) : undefined;

        setResult({
          status: 'error',
          message: res.message || 'Verification failed.',
          registration: existing,
          workshop: ws,
        });

        setScanHistory((prev) => [
          {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            ticketCode: codeToVerify,
            participantName: existing?.participantName || 'Unknown Attendee',
            workshopTitle: ws?.title || extractedWorkshopTitle || 'Unknown Session',
            status: 'DENIED',
            message: res.message || 'Invalid or already used pass',
          },
          ...prev.slice(0, 9),
        ]);
      }

      setVerifying(false);

      // Auto-resume camera scanning after 2.5 seconds
      setTimeout(() => {
        isScanningRef.current = false;
      }, 2500);
    },
    [allowBypass, playAudioFeedback, registrations, selectedWorkshopId, verifyTicket, workshops]
  );

  // Stable ref for verification
  const processRef = useRef(processTicketVerification);
  useEffect(() => {
    processRef.current = processTicketVerification;
  });

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      } catch {}
      qrScannerRef.current = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
    setFlashOn(false);
  }, []);

  // Start Ultra-Fast, Full-Frame QrScanner Engine
  const startCamera = useCallback(async (preferredCam: string = currentCameraId) => {
    setCameraError(null);
    setCameraLoading(true);

    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      } catch {}
      qrScannerRef.current = null;
    }

    if (!videoRef.current) {
      setCameraLoading(false);
      return;
    }

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (scanResult: QrScanner.ScanResult) => {
          if (scanResult && scanResult.data) {
            processRef.current(scanResult.data);
          }
        },
        {
          onDecodeError: () => {
            // Silently scan frames continuously
          },
          preferredCamera: preferredCam as any,
          maxScansPerSecond: 25,
          calculateScanRegion: (video) => ({
            x: 0,
            y: 0,
            width: video.videoWidth || 1280,
            height: video.videoHeight || 720,
            downScaledWidth: video.videoWidth || 1280,
            downScaledHeight: video.videoHeight || 720,
          }),
          highlightScanRegion: false,
          highlightCodeOutline: false,
          returnDetailedScanResult: true,
        }
      );

      scanner.setInversionMode('both');
      await scanner.start();
      qrScannerRef.current = scanner;
      setCameraActive(true);
      setCameraLoading(false);

      try {
        const stream = (videoRef.current?.srcObject as MediaStream) || null;
        const track = stream?.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities() as any;
          if (caps?.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
            await track.applyConstraints({
              advanced: [{ focusMode: 'continuous' }] as any,
            });
          }
        }
      } catch {}

      try {
        const cameras = await QrScanner.listCameras(false);
        setAvailableCameras(cameras);
      } catch {}

      try {
        const hasF = await scanner.hasFlash();
        setFlashSupported(hasF);
      } catch {
        setFlashSupported(false);
      }
    } catch {
      if (preferredCam === 'environment') {
        try {
          if (videoRef.current) {
            const fallbackScanner = new QrScanner(
              videoRef.current,
              (scanResult: QrScanner.ScanResult) => {
                if (scanResult && scanResult.data) {
                  processRef.current(scanResult.data);
                }
              },
              {
                preferredCamera: 'user',
                maxScansPerSecond: 25,
                calculateScanRegion: (video) => ({
                  x: 0,
                  y: 0,
                  width: video.videoWidth || 1280,
                  height: video.videoHeight || 720,
                  downScaledWidth: video.videoWidth || 1280,
                  downScaledHeight: video.videoHeight || 720,
                }),
                returnDetailedScanResult: true,
              }
            );
            fallbackScanner.setInversionMode('both');
            await fallbackScanner.start();
            qrScannerRef.current = fallbackScanner;
            setCurrentCameraId('user');
            setCameraActive(true);
            setCameraLoading(false);
            return;
          }
        } catch {}
      }

      setCameraError(
        'Unable to access camera. Please allow camera permissions or use the Barcode / File Upload mode below.'
      );
      setCameraActive(false);
      setCameraLoading(false);
    }
  }, [currentCameraId]);

  // Flip / Switch Camera
  const handleSwitchCamera = useCallback(async () => {
    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex((c) => c.id === currentCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      const nextId = availableCameras[nextIndex].id;
      setCurrentCameraId(nextId);
      await startCamera(nextId);
    } else {
      const nextMode = currentCameraId === 'environment' ? 'user' : 'environment';
      setCurrentCameraId(nextMode);
      await startCamera(nextMode);
    }
  }, [availableCameras, currentCameraId, startCamera]);

  // Toggle Flash
  const handleToggleFlash = useCallback(async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.toggleFlash();
        setFlashOn(qrScannerRef.current.isFlashOn());
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Handle uploaded image file
  const handleProcessImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setResult({ status: 'error', message: 'Please upload an image file (PNG, JPG, or WEBP).' });
      return;
    }

    setVerifying(true);
    setResult({ status: 'idle', message: '' });

    try {
      const decodedResult = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true,
      });

      if (decodedResult && decodedResult.data) {
        await processTicketVerification(decodedResult.data);
      } else {
        setResult({
          status: 'error',
          message: 'No QR code could be detected in this uploaded pass image. Please ensure the image is clear and well-lit.',
        });
        setVerifying(false);
      }
    } catch {
      setResult({
        status: 'error',
        message: 'No QR code found in this image. Please check the file and try again.',
      });
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  // Selected workshop object
  const activeWorkshopObj = workshops.find((w) => w.id === selectedWorkshopId);

  // Quick test codes for demo
  const testableRegistrations = registrations
    .filter(
      (r) =>
        r.status === 'CONFIRMED' &&
        (selectedWorkshopId === 'ALL' || r.workshopId === selectedWorkshopId)
    )
    .slice(0, 4);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08482D]/40 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-[#14231b] rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#DCE4D6] dark:border-[#203a2c] my-6 text-xs z-10 text-[#101410] dark:text-[#E8F0DF] transition-colors"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-[#5E5E61] hover:text-[#101410] dark:hover:text-white hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center justify-between gap-4 mb-4 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#08482D] text-[#DAE7C7] flex items-center justify-center shadow-md">
                <Scan className="w-6 h-6 text-[#DAE7C7]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-heading font-semibold text-[#08482D] dark:text-[#DAE7C7] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#08482D] dark:text-[#a8d38d]" />
                  Live Gate Scanner & Roster Verifier
                </div>
                <h2 className="text-xl font-heading font-bold text-[#101410] dark:text-white">
                  Ticket Scanner for Organizers
                </h2>
              </div>
            </div>

            {/* Sound Mute Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? 'border-[#DAE7C7] dark:border-[#2d4d3a] text-[#08482D] dark:text-[#DAE7C7] bg-[#E8F0DF] dark:bg-[#1b2f23]'
                  : 'border-[#DCE4D6] dark:border-[#22392c] text-[#5E5E61]'
              }`}
              title={soundEnabled ? 'Sound feedback active' : 'Sound feedback muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Respective Workshop Selector */}
          <div className="mb-4 p-3.5 rounded-2xl bg-[#F5F8EF] dark:bg-[#18281f] border border-[#DCE4D6] dark:border-[#22392c] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-heading font-semibold text-[#101410] dark:text-white flex items-center gap-1.5 text-xs">
                <Layers className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
                <span>Verifying For Respective Workshop:</span>
              </label>
              <span className="text-[11px] text-[#08482D] dark:text-[#DAE7C7] font-semibold">
                {activeWorkshopObj?.venue || 'Campus Venue'}
              </span>
            </div>

            <select
              value={selectedWorkshopId}
              onChange={(e) => {
                setSelectedWorkshopId(e.target.value);
                setResult({ status: 'idle', message: '' });
              }}
              className="w-full px-3 py-2 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-white dark:bg-[#14231b] text-[#101410] dark:text-white text-xs font-heading font-semibold focus:outline-none focus:ring-2 focus:ring-[#08482D]"
            >
              <option value="ALL">All My Hosted Workshops (Any Session)</option>
              {myWorkshops.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.title} — {ws.date} ({ws.startTime}) • {ws.venue}
                </option>
              ))}
            </select>

            {activeWorkshopObj && (
              <div className="flex items-center gap-2 text-[11px] text-[#5E5E61] dark:text-slate-400 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#08482D] dark:text-[#DAE7C7] shrink-0" />
                <span className="truncate">
                  Gate Location: <strong>{activeWorkshopObj.venue}</strong>
                  {activeWorkshopObj.venueAddress ? ` • ${activeWorkshopObj.venueAddress}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Scan Mode Tabs */}
          <div className="flex border-b border-[#DCE4D6] dark:border-[#203a2c] mb-4">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 pb-2.5 text-center font-heading font-semibold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'camera'
                  ? 'border-[#08482D] text-[#08482D] dark:border-[#DAE7C7] dark:text-[#DAE7C7]'
                  : 'border-transparent text-[#5E5E61] hover:text-[#101410] dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 pb-2.5 text-center font-heading font-semibold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-[#08482D] text-[#08482D] dark:border-[#DAE7C7] dark:text-[#DAE7C7]'
                  : 'border-transparent text-[#5E5E61] hover:text-[#101410] dark:hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload QR Image</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 pb-2.5 text-center font-heading font-semibold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'manual'
                  ? 'border-[#08482D] text-[#08482D] dark:border-[#DAE7C7] dark:text-[#DAE7C7]'
                  : 'border-transparent text-[#5E5E61] hover:text-[#101410] dark:hover:text-white'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Manual / USB Barcode</span>
            </button>
          </div>

          {/* TAB 1: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden border-2 border-[#DCE4D6] dark:border-[#203a2c] flex items-center justify-center">
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  muted
                  playsInline
                />

                {/* Top Control Bar: Flash & Flip Camera */}
                {cameraActive && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    {flashSupported && (
                      <button
                        type="button"
                        onClick={handleToggleFlash}
                        className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                          flashOn
                            ? 'bg-amber-400 text-slate-900 shadow-lg'
                            : 'bg-slate-900/70 text-white hover:bg-slate-800'
                        }`}
                        title={flashOn ? 'Turn Flash Off' : 'Turn Flash On'}
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="p-2 bg-slate-900/70 hover:bg-slate-800 text-white rounded-xl backdrop-blur-md transition-colors"
                      title="Switch / Flip Camera"
                    >
                      <SwitchCamera className="w-4 h-4 text-[#DAE7C7]" />
                    </button>
                  </div>
                )}

                {/* Target Frame Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-[#DAE7C7]/90 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#DAE7C7] rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#DAE7C7] rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#DAE7C7] rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#DAE7C7] rounded-br-lg" />

                      {/* Animated Scanning Laser Line */}
                      <motion.div
                        animate={{ y: [0, 180, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#DAE7C7] to-transparent shadow-[0_0_10px_rgba(218,231,199,0.9)]"
                      />
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {cameraLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                    <Loader2 className="w-7 h-7 text-[#DAE7C7] animate-spin" />
                    <span className="text-xs text-slate-300 font-medium">Initializing camera…</span>
                  </div>
                )}

                {/* Camera Inactive or Error State */}
                {!cameraActive && !cameraLoading && (
                  <div className="p-6 text-center space-y-3 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-[#DAE7C7] flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-300">
                      {cameraError || 'Camera is currently stopped.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-4 py-2 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl text-xs font-heading font-semibold transition-colors inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Start Camera Scanner</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5E5E61] dark:text-slate-400 px-1">
                <span>Point participant’s mobile QR pass at the viewfinder frame.</span>
                {cameraActive && (
                  <span className="flex items-center gap-1 text-[#08482D] dark:text-[#a8d38d] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#08482D] dark:bg-[#a8d38d] animate-pulse" />
                    Scanning active
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD QR IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleProcessImageFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-52 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-[#08482D] bg-[#E8F0DF]/50 dark:bg-[#1b2f23]'
                    : 'border-[#DCE4D6] dark:border-[#22392c] hover:border-[#08482D] bg-[#F5F8EF]/50 dark:bg-[#18281f]/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessImageFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center mb-3 shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="font-heading font-semibold text-[#101410] dark:text-white text-xs">
                  Click to select QR Ticket Screenshot or Drag & Drop
                </div>
                <p className="text-[11px] text-[#5E5E61] dark:text-slate-400 mt-1 max-w-xs">
                  Upload an image of the participant’s pass to decode and verify ticket instant validation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL INPUT / USB BARCODE */}
          {activeTab === 'manual' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processTicketVerification(ticketInput);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-heading font-semibold text-[#101410] dark:text-white mb-1.5">
                  Ticket Code / Barcode Scanner Input *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    placeholder="e.g. TKT-C5387CD1-6388 or scan barcode"
                    autoFocus
                    className="w-full pl-3.5 pr-24 py-3 text-sm font-mono border border-[#DCE4D6] dark:border-[#22392c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08482D] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={verifying || !ticketInput.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#08482D] hover:bg-[#0c5c3b] disabled:opacity-50 text-white rounded-lg font-heading font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Scan className="w-3.5 h-3.5 text-[#DAE7C7]" />
                    <span>{verifying ? 'Checking...' : 'Verify'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Demo Bypass Date Checkbox */}
          <div className="mt-3 flex items-center justify-between p-2.5 bg-[#F5F8EF] dark:bg-[#18281f] rounded-xl border border-[#DCE4D6] dark:border-[#22392c] text-[11px]">
            <div>
              <span className="font-heading font-semibold text-[#101410] dark:text-white block">
                Demo Testing: Allow Any Date Bypass
              </span>
              <span className="text-[#5E5E61] dark:text-slate-400">
                Enables ticket check-in simulation outside the workshop calendar date.
              </span>
            </div>
            <input
              type="checkbox"
              checked={allowBypass}
              onChange={(e) => setAllowBypass(e.target.checked)}
              className="w-4 h-4 rounded text-[#08482D] focus:ring-[#08482D] cursor-pointer"
            />
          </div>

          {/* VERIFICATION RESULT FEEDBACK BOX */}
          <AnimatePresence mode="wait">
            {result.status === 'success' && (
              <motion.div
                key="result-success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 p-4 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] border border-[#DAE7C7] dark:border-[#2d4d3a] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#08482D] dark:text-[#DAE7C7] font-heading font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-[#08482D] dark:text-[#a8d38d] shrink-0" />
                    <span>VALID PASS: ACCESS GRANTED</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#08482D] text-white text-[10px] font-bold uppercase tracking-wider">
                    Checked In
                  </span>
                </div>

                <p className="text-xs text-[#08482D] dark:text-[#DAE7C7] leading-relaxed font-medium">
                  {result.message}
                </p>

                {result.registration && (
                  <div className="p-3 bg-white/90 dark:bg-[#14231b]/90 rounded-xl border border-[#DAE7C7] dark:border-[#2d4d3a] text-xs space-y-1 shadow-sm">
                    <div className="flex items-center gap-1.5 font-semibold text-[#101410] dark:text-white">
                      <User className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d]" />
                      <span>{result.registration.participantName}</span>
                      <span className="text-[#5E5E61] dark:text-slate-400 font-normal">({result.registration.participantEmail})</span>
                    </div>
                    {result.workshop && (
                      <div className="text-[#5E5E61] dark:text-slate-300">
                        Workshop: <strong>{result.workshop.title}</strong> • Room: {result.workshop.venue}
                      </div>
                    )}
                    <div className="text-[11px] text-[#08482D] dark:text-[#DAE7C7] font-mono font-bold">
                      Ticket Code: {result.registration.ticketCode}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {result.status === 'error' && (
              <motion.div
                key="result-error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-2"
              >
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-heading font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>ENTRY DENIED: Verification Rejected</span>
                </div>

                <div className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                  {result.message}
                </div>

                {result.registration && (
                  <div className="p-2.5 bg-white/80 dark:bg-[#14231b]/80 rounded-xl border border-rose-200 dark:border-rose-900/60 text-[11px] text-[#5E5E61] dark:text-slate-300">
                    Participant: <strong>{result.registration.participantName}</strong> ({result.registration.participantEmail})
                    {result.workshop && (
                      <div className="mt-0.5 text-slate-500 dark:text-slate-400">
                        Scheduled for: <strong>{result.workshop.title}</strong> ({result.workshop.venue})
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Demo Test Buttons */}
          {testableRegistrations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#DCE4D6] dark:border-[#203a2c] space-y-2">
              <span className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-heading font-semibold uppercase tracking-wider block">
                Quick Test Codes (Confirmed Bookings for Selected Session):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {testableRegistrations.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setTicketInput(r.ticketCode || r.id);
                      processTicketVerification(r.ticketCode || r.id);
                    }}
                    className="p-2 rounded-xl bg-[#F5F8EF] dark:bg-[#18281f] hover:bg-[#E8F0DF] dark:hover:bg-[#1f382a] border border-[#DCE4D6] dark:border-[#22392c] text-left transition-colors truncate"
                  >
                    <div className="font-mono font-bold text-[11px] text-[#08482D] dark:text-[#DAE7C7] truncate">
                      {r.ticketCode || r.id}
                    </div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 truncate">
                      {r.participantName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LIVE GATE SESSION SCAN HISTORY */}
          {scanHistory.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#DCE4D6] dark:border-[#203a2c] space-y-2">
              <span className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-heading font-semibold uppercase tracking-wider block">
                Recent Scans In This Gate Session:
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#F5F8EF] dark:bg-[#18281f] border border-[#DCE4D6] dark:border-[#22392c] text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {item.status === 'GRANTED' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#08482D] dark:text-[#a8d38d] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span className="font-semibold text-[#101410] dark:text-white truncate">
                        {item.participantName}
                      </span>
                      <span className="font-mono text-[#5E5E61] dark:text-slate-400 text-[10px] truncate">
                        ({item.ticketCode})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#5E5E61] dark:text-slate-400 text-[10px]">{item.timestamp}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          item.status === 'GRANTED'
                            ? 'bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7]'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-[#DCE4D6] dark:border-[#203a2c] pt-3">
            <span className="text-[11px] text-[#5E5E61] dark:text-slate-400">
              Scanned status updates directly in real-time.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#E8F0DF] dark:bg-[#1a3325] hover:bg-[#DCE4D6] dark:hover:bg-[#224431] text-[#08482D] dark:text-[#DAE7C7] font-heading font-semibold text-xs rounded-xl transition-colors"
            >
              Done / Close Scanner
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
