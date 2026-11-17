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
  User,
  Sparkles,
  ShieldAlert,
  RefreshCw,
  MapPin,
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

  // Flip Camera
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
        const state = qrScannerRef.current.isFlashOn();
        setFlashOn(state);
      } catch {}
    }
  }, []);

  // Manage Camera lifecycle when modal is open / tab switches
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Image Upload Handler
  const handleProcessImageFile = async (file: File) => {
    if (!file) return;
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

  // Active workshop object
  const activeWorkshopObj = selectedWorkshopId !== 'ALL'
    ? myWorkshops.find((w) => w.id === selectedWorkshopId)
    : undefined;

  // Confirmed registrations for quick-test in demo mode
  const testableRegistrations = registrations
    .filter((r) => selectedWorkshopId === 'ALL' || r.workshopId === selectedWorkshopId)
    .filter((r) => r.status === 'CONFIRMED' && !r.verified)
    .slice(0, 4);

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
          className="relative bg-[#FFF5E9] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-[8px_8px_0px_0px_#101D32] border-2 border-[#101D32] my-auto max-h-[94vh] overflow-y-auto text-xs z-10 text-[#101D32]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-[#101D32] hover:bg-[#FFD6B0] border-2 border-transparent hover:border-[#101D32] transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center justify-between gap-4 mb-4 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#101D32] text-white border-2 border-[#101D32] flex items-center justify-center shadow-[2px_2px_0px_0px_#101D32]">
                <Scan className="w-6 h-6 text-[#FFD6B0]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#101D32] bg-[#FFD6B0] px-2.5 py-0.5 rounded-full border border-[#101D32]">
                  <Sparkles className="w-3 h-3 text-[#F4511E]" />
                  Live Gate Scanner & Roster Verifier
                </div>
                <h2 className="text-xl font-heading font-black text-[#101410] mt-0.5">
                  Ticket Scanner for Organizers
                </h2>
              </div>
            </div>

            {/* Sound Mute Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border-2 border-[#101D32] text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_#101D32] ${
                soundEnabled
                  ? 'bg-[#FFD6B0] text-[#101D32]'
                  : 'bg-white text-[#101D32]/60'
              }`}
              title={soundEnabled ? 'Sound feedback active' : 'Sound feedback muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#F4511E]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Respective Workshop Selector */}
          <div className="mb-4 p-3.5 rounded-2xl bg-white border-2 border-[#101D32] shadow-[3px_3px_0px_0px_#101D32] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-heading font-bold text-[#101410] flex items-center gap-1.5 text-xs">
                <Layers className="w-4 h-4 text-[#F4511E]" />
                <span>Verifying For Respective Workshop:</span>
              </label>
              <span className="text-[11px] text-[#F4511E] font-bold">
                {activeWorkshopObj?.venue || 'Campus Venue'}
              </span>
            </div>

            <select
              value={selectedWorkshopId}
              onChange={(e) => {
                setSelectedWorkshopId(e.target.value);
                setResult({ status: 'idle', message: '' });
              }}
              className="w-full px-3 py-2 rounded-xl border-2 border-[#101D32] bg-[#FFF5E9] text-[#101D32] text-xs font-heading font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#101D32]"
            >
              <option value="ALL">All My Hosted Workshops (Any Session)</option>
              {myWorkshops.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.title} — {ws.date} ({ws.startTime}) • {ws.venue}
                </option>
              ))}
            </select>

            {activeWorkshopObj && (
              <div className="flex items-center gap-2 text-[11px] text-[#101D32]/75 font-medium pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                <span className="truncate">
                  Gate Location: <strong>{activeWorkshopObj.venue}</strong>
                  {activeWorkshopObj.venueAddress ? ` • ${activeWorkshopObj.venueAddress}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Scan Mode Tabs */}
          <div className="flex border-b-2 border-[#101D32] mb-4">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 pb-2.5 text-center font-heading font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'camera'
                  ? 'border-[#F4511E] text-[#F4511E]'
                  : 'border-transparent text-[#101D32]/70 hover:text-[#101D32]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 pb-2.5 text-center font-heading font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-[#F4511E] text-[#F4511E]'
                  : 'border-transparent text-[#101D32]/70 hover:text-[#101D32]'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload QR Image</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 pb-2.5 text-center font-heading font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'manual'
                  ? 'border-[#F4511E] text-[#F4511E]'
                  : 'border-transparent text-[#101D32]/70 hover:text-[#101D32]'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Manual / USB Barcode</span>
            </button>
          </div>

          {/* TAB 1: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] flex items-center justify-center">
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
                      <SwitchCamera className="w-4 h-4 text-[#FFD6B0]" />
                    </button>
                  </div>
                )}

                {/* Target Frame Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-[#FFD6B0]/90 rounded-2xl relative shadow-[0_0_0_9999px_rgba(16,29,50,0.55)]">
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#F4511E] rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#F4511E] rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#F4511E] rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#F4511E] rounded-br-lg" />

                      {/* Animated Scanning Laser Line */}
                      <motion.div
                        animate={{ y: [0, 180, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#F4511E] to-transparent shadow-[0_0_10px_rgba(244,81,30,0.9)]"
                      />
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {cameraLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                    <Loader2 className="w-7 h-7 text-[#FFD6B0] animate-spin" />
                    <span className="text-xs text-slate-300 font-medium">Initializing camera…</span>
                  </div>
                )}

                {/* Camera Inactive or Error State */}
                {!cameraActive && !cameraLoading && (
                  <div className="p-6 text-center space-y-3 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-[#FFD6B0] flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-300">
                      {cameraError || 'Camera is currently stopped.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-4 py-2 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-xl text-xs font-heading font-extrabold border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-colors inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Start Camera Scanner</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#101D32]/75 px-1 font-medium">
                <span>Point participant’s mobile QR pass at the viewfinder frame.</span>
                {cameraActive && (
                  <span className="flex items-center gap-1 text-[#F4511E] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#F4511E] animate-pulse" />
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
                    ? 'border-[#F4511E] bg-[#FFD6B0]/50'
                    : 'border-[#101D32] hover:border-[#F4511E] bg-white'
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
                <div className="w-12 h-12 rounded-2xl bg-[#FFD6B0] text-[#101D32] border-2 border-[#101D32] flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#101D32]">
                  <UploadCloud className="w-6 h-6 text-[#F4511E]" />
                </div>
                <div className="font-heading font-bold text-[#101410] text-xs">
                  Click to select QR Ticket Screenshot or Drag & Drop
                </div>
                <p className="text-[11px] text-[#101D32]/70 mt-1 max-w-xs font-medium">
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
                <label className="block font-heading font-bold text-[#101410] mb-1.5">
                  Ticket Code / Barcode Scanner Input *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    placeholder="e.g. TKT-C5387CD1-6388 or scan barcode"
                    autoFocus
                    className="w-full pl-3.5 pr-24 py-3 text-sm font-mono border-2 border-[#101D32] rounded-xl focus:outline-none focus:bg-white bg-white text-[#101D32] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#101D32]"
                  />
                  <button
                    type="submit"
                    disabled={verifying || !ticketInput.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#F4511E] hover:bg-[#E84316] disabled:opacity-50 text-white rounded-lg font-heading font-extrabold text-xs flex items-center gap-1.5 border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] transition-all cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-white" />
                    <span>{verifying ? 'Checking...' : 'Verify'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Demo Bypass Date Checkbox */}
          <div className="mt-3 flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#101D32] text-[11px] shadow-[2px_2px_0px_0px_#101D32]">
            <div>
              <span className="font-heading font-bold text-[#101410] block">
                Demo Testing: Allow Any Date Bypass
              </span>
              <span className="text-[#101D32]/75 font-medium">
                Enables ticket check-in simulation outside the workshop calendar date.
              </span>
            </div>
            <input
              type="checkbox"
              checked={allowBypass}
              onChange={(e) => setAllowBypass(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-[#101D32] text-[#F4511E] focus:ring-[#F4511E] cursor-pointer"
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
                className="mt-4 p-4 rounded-2xl bg-white border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#101D32] font-heading font-black text-sm">
                    <CheckCircle className="w-5 h-5 text-[#F4511E] shrink-0" />
                    <span>VALID PASS: ACCESS GRANTED</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFD6B0] text-[#101D32] text-[10px] font-bold uppercase tracking-wider border border-[#101D32]">
                    Checked In
                  </span>
                </div>

                <p className="text-xs text-[#101D32] leading-relaxed font-bold">
                  {result.message}
                </p>

                {result.registration && (
                  <div className="p-3 bg-[#FFF5E9] rounded-xl border-2 border-[#101D32] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#101410]">
                      <User className="w-3.5 h-3.5 text-[#F4511E]" />
                      <span>{result.registration.participantName}</span>
                      <span className="text-[#101D32]/70 font-normal">({result.registration.participantEmail})</span>
                    </div>
                    {result.workshop && (
                      <div className="text-[#101D32]/80 font-medium">
                        Workshop: <strong>{result.workshop.title}</strong> • Room: {result.workshop.venue}
                      </div>
                    )}
                    <div className="text-[11px] text-[#F4511E] font-mono font-bold">
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
                className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 shadow-[4px_4px_0px_0px_#101D32] space-y-2"
              >
                <div className="flex items-center gap-2 text-rose-800 font-heading font-black text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>ENTRY DENIED: Verification Rejected</span>
                </div>

                <div className="text-xs text-rose-700 leading-relaxed font-bold">
                  {result.message}
                </div>

                {result.registration && (
                  <div className="p-2.5 bg-white rounded-xl border border-rose-300 text-[11px] text-[#101D32]">
                    Participant: <strong>{result.registration.participantName}</strong> ({result.registration.participantEmail})
                    {result.workshop && (
                      <div className="mt-0.5 text-[#101D32]/70 font-medium">
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
            <div className="mt-4 pt-3 border-t-2 border-[#101D32] space-y-2">
              <span className="text-[11px] text-[#101D32]/80 font-heading font-bold uppercase tracking-wider block">
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
                    className="p-2.5 rounded-xl bg-white hover:bg-[#FFD6B0] border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-left transition-all truncate"
                  >
                    <div className="font-mono font-bold text-[11px] text-[#F4511E] truncate">
                      {r.ticketCode || r.id}
                    </div>
                    <div className="text-[10px] text-[#101D32] font-semibold truncate">
                      {r.participantName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LIVE GATE SESSION SCAN HISTORY */}
          {scanHistory.length > 0 && (
            <div className="mt-4 pt-3 border-t-2 border-[#101D32] space-y-2">
              <span className="text-[11px] text-[#101D32]/80 font-heading font-bold uppercase tracking-wider block">
                Recent Scans In This Gate Session:
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border-2 border-[#101D32] text-[11px] shadow-[2px_2px_0px_0px_#101D32]"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {item.status === 'GRANTED' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span className="font-bold text-[#101410] truncate">
                        {item.participantName}
                      </span>
                      <span className="font-mono text-[#101D32]/70 text-[10px] truncate">
                        ({item.ticketCode})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#101D32]/70 text-[10px] font-mono">{item.timestamp}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border border-[#101D32] ${
                          item.status === 'GRANTED'
                            ? 'bg-[#FFD6B0] text-[#101D32]'
                            : 'bg-rose-100 text-rose-700'
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
          <div className="mt-5 flex items-center justify-between border-t-2 border-[#101D32] pt-3">
            <span className="text-[11px] text-[#101D32]/75 font-medium">
              Scanned status updates directly in real-time.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-[#FFD6B0] text-[#101D32] font-heading font-bold text-xs rounded-xl border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              Done / Close Scanner
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
