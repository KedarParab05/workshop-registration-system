import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QrScanner from 'qr-scanner';
import {
  Scan,
  Camera,
  UploadCloud,
  Keyboard,
  CheckCircle,
  AlertTriangle,
  Clock,
  KeyRound,
  ArrowRight,
  Loader2,
  XCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  LogOut,
  Users,
  Search,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  SwitchCamera,
  Check,
  Focus,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Registration, Volunteer, Workshop } from '../../types';

interface ScanHistoryItem {
  id: string;
  timestamp: string;
  ticketCode: string;
  participantName: string;
  status: 'GRANTED' | 'DENIED';
  message: string;
}

export const VolunteerGatePortal: React.FC = () => {
  const {
    currentVolunteer,
    assignedVolunteerWorkshop,
    registrations,
    verifyTicketAsVolunteer,
    verifyVolunteerLogin,
    checkMyVolunteerRequests,
    logoutVolunteer,
    navigateTo,
    currentUser,
  } = useApp();

  // ── Access Code Gate State ──
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [verifyingAccess, setVerifyingAccess] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [myRequests, setMyRequests] = useState<Volunteer[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Fetch volunteer requests when user is logged in but no active session
  useEffect(() => {
    if (currentUser?.email && !currentVolunteer) {
      setLoadingRequests(true);
      checkMyVolunteerRequests(currentUser.email)
        .then(({ requests }) => setMyRequests(requests))
        .catch(() => {})
        .finally(() => setLoadingRequests(false));
    }
  }, [currentUser?.email, currentVolunteer, checkMyVolunteerRequests]);

  // Unlock gate with Access Code
  const handleUnlockGate = useCallback(async () => {
    const code = accessCodeInput.trim().toUpperCase();
    if (!code) {
      setAccessError('Please enter your Access Code (e.g. VOL-123456).');
      return;
    }
    setVerifyingAccess(true);
    setAccessError('');
    const res = await verifyVolunteerLogin(code);
    setVerifyingAccess(false);
    if (!res.success) {
      setAccessError(res.error || 'Invalid or expired access code. Please contact your organizer.');
    }
  }, [accessCodeInput, verifyVolunteerLogin]);

  // Scanner UI States
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [ticketInput, setTicketInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [allowBypass, setAllowBypass] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [searchRoster, setSearchRoster] = useState('');
  const [flashSupported, setFlashSupported] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<QrScanner.Camera[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string>('environment');

  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    registration?: Registration;
    workshop?: Workshop;
  }>({
    status: 'idle',
    message: '',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const isScanningRef = useRef(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);

  // Audio synthesis feedback
  const playAudioFeedback = useCallback(
    (isSuccess: boolean) => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();

        if (isSuccess) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime);
          osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.08);
          osc.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.16);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } else {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, audioCtx.currentTime);
          osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        }
      } catch {}
    },
    [soundEnabled]
  );

  // Verification execution
  const processTicketVerification = useCallback(
    async (rawCode: string) => {
      if (!rawCode || !rawCode.trim()) return;

      const trimmed = rawCode.trim();
      const now = Date.now();

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
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.ticketCode) {
          codeToVerify = parsed.ticketCode;
        }
      } catch {}

      const res = await verifyTicketAsVolunteer(codeToVerify, allowBypass);

      if (res.success && res.registration) {
        playAudioFeedback(true);
        setResult({
          status: 'success',
          message: res.message || 'Ticket verified successfully! Access granted.',
          registration: res.registration,
          workshop: res.workshop || assignedVolunteerWorkshop || undefined,
        });

        setScanHistory((prev) => [
          {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            ticketCode: codeToVerify,
            participantName: res.registration?.participantName || 'Attendee',
            status: 'GRANTED',
            message: '1-time entry granted',
          },
          ...prev.slice(0, 9),
        ]);
        setTicketInput('');
      } else {
        playAudioFeedback(false);
        setResult({
          status: 'error',
          message: res.message || 'Verification failed.',
          workshop: res.workshop,
        });

        setScanHistory((prev) => [
          {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            ticketCode: codeToVerify,
            participantName: 'Attendee',
            status: 'DENIED',
            message: res.message || 'Invalid or already used pass',
          },
          ...prev.slice(0, 9),
        ]);
      }

      setVerifying(false);

      setTimeout(() => {
        isScanningRef.current = false;
      }, 2200);
    },
    [allowBypass, assignedVolunteerWorkshop, playAudioFeedback, verifyTicketAsVolunteer]
  );

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

  // Start Camera
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
          onDecodeError: () => {},
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
        setFlashOn(qrScannerRef.current.isFlashOn());
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (currentVolunteer && activeTab === 'camera') {
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
  }, [currentVolunteer?.id, activeTab, startCamera, stopCamera]);

  // Handle uploaded QR image
  const handleImageUpload = async (file: File) => {
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

  // Workshop roster counts
  const targetWorkshopId = currentVolunteer?.assignedWorkshopId;
  const workshopRegistrations = registrations.filter((r) => r.workshopId === targetWorkshopId);
  const attendedCount = workshopRegistrations.filter((r) => r.status === 'ATTENDED' || r.verified).length;
  const pendingCount = workshopRegistrations.filter((r) => r.status === 'CONFIRMED' && !r.verified).length;

  const filteredRoster = workshopRegistrations.filter((r) => {
    if (!searchRoster.trim()) return true;
    const q = searchRoster.toLowerCase();
    return (
      r.participantName.toLowerCase().includes(q) ||
      r.participantEmail.toLowerCase().includes(q) ||
      (r.ticketCode && r.ticketCode.toLowerCase().includes(q))
    );
  });

  // 1. If not logged in, prompt to log in first
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] mx-auto flex items-center justify-center border border-[#DAE7C7] dark:border-[#2d4d3a] shadow-lg">
          <KeyRound className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold text-[#101410] dark:text-white">
            Volunteer Gate Station Authentication
          </h2>
          <p className="text-sm text-[#5E5E61] dark:text-slate-400 max-w-md mx-auto">
            Please sign in with your account to access your assigned gate station and enter your organizer authorization access code.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="px-5 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl text-sm font-heading font-semibold shadow-md transition-colors"
          >
            Go to Home & Sign In
          </button>
          <button
            onClick={() => navigateTo('workshops')}
            className="px-5 py-2.5 border border-[#DCE4D6] dark:border-[#203a2c] text-[#101410] dark:text-slate-300 hover:bg-[#F5F8EF] dark:hover:bg-[#18281f] rounded-xl text-sm font-medium transition-colors"
          >
            Browse Workshops
          </button>
        </div>
      </div>
    );
  }

  // 2. If logged in but does not have an active volunteer gate session (Enter Access Code)
  if (!currentVolunteer) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DAE7C7] text-[#08482D]">
            <KeyRound className="w-3.5 h-3.5 text-[#08482D]" />
            <span>Volunteer Gate Station Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#101410] dark:text-white">
            Enter Organizer Authorization Code
          </h1>
          <p className="text-sm text-[#5E5E61] dark:text-slate-400 max-w-xl mx-auto">
            Welcome, <strong className="text-[#101410] dark:text-white">{currentUser.fullName}</strong>. Once the workshop organizer approves your application, they issue an Access Code (e.g., <code className="font-mono text-[#08482D] dark:text-[#DAE7C7] bg-[#E8F0DF] dark:bg-[#1a3325] px-1.5 py-0.5 rounded font-bold">VOL-XXXXXX</code>). Enter it below to unlock the Live Gate Scanner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Form: Enter Access Code */}
          <div className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
                  Unlock Live Gate Scanner
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400">Enter your issued authorization access code</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUnlockGate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-white mb-1.5">
                  Organizer Access Code *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5E61] dark:text-slate-400" />
                  <input
                    type="text"
                    value={accessCodeInput}
                    onChange={(e) => {
                      setAccessCodeInput(e.target.value.toUpperCase());
                      setAccessError('');
                    }}
                    placeholder="E.G. VOL-709810"
                    maxLength={14}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] font-mono text-sm tracking-wider font-bold text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D] uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                  />
                </div>
                <p className="text-[11px] text-[#5E5E61] dark:text-slate-400 mt-1">
                  Issued by your workshop organizer upon application approval.
                </p>
              </div>

              {accessError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{accessError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingAccess || !accessCodeInput.trim()}
                className="w-full py-3 bg-[#08482D] hover:bg-[#0c5c3b] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-heading font-semibold shadow-md shadow-[#08482D]/20 transition-all flex items-center justify-center gap-2"
              >
                {verifyingAccess ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#DAE7C7]" />
                    <span>Verifying Pass Code...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 text-[#DAE7C7]" />
                    <span>Verify Code & Open Gate Scanner</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#DCE4D6] dark:border-[#203a2c] flex items-center justify-between text-xs text-[#5E5E61] dark:text-slate-400">
              <span>Need to apply for a workshop?</span>
              <button
                onClick={() => navigateTo('workshops')}
                className="text-[#08482D] dark:text-[#DAE7C7] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Browse Workshops</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right side: My Volunteer Applications & Status */}
          <div className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-[#101410] dark:text-white text-base">
                  My Volunteer Applications
                </h3>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400">Live status verified in real-time</p>
              </div>
              <button
                onClick={() => {
                  if (currentUser?.email) {
                    setLoadingRequests(true);
                    checkMyVolunteerRequests(currentUser.email)
                      .then(({ requests }) => setMyRequests(requests))
                      .catch(() => {})
                      .finally(() => setLoadingRequests(false));
                  }
                }}
                disabled={loadingRequests}
                className="p-2 text-[#5E5E61] hover:text-[#08482D] dark:hover:text-[#DAE7C7] transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin text-[#08482D]' : ''}`} />
              </button>
            </div>

            {loadingRequests ? (
              <div className="py-8 text-center text-xs text-[#5E5E61] dark:text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#08482D] dark:text-[#DAE7C7] mx-auto" />
                <p>Checking status of your applications...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5E5E61] dark:text-slate-400 space-y-3">
                <HelpCircle className="w-8 h-8 text-[#5E5E61]/40 mx-auto" />
                <p>No volunteering applications found for {currentUser.email}.</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  Browse workshops and click <strong className="text-[#101410] dark:text-white">"Apply as Gate Volunteer"</strong> on any session to request an access pass from the organizer.
                </p>
                <button
                  onClick={() => navigateTo('workshops')}
                  className="px-4 py-2 bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] border border-[#DAE7C7] dark:border-[#2d4d3a] rounded-xl font-heading font-semibold text-xs hover:bg-[#DCE4D6] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Workshops</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] bg-[#F5F8EF] dark:bg-[#18281f] space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-heading font-bold text-[#101410] dark:text-white leading-snug">
                        {req.assignedWorkshopTitle || 'Assigned Workshop'}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          req.status === 'ACTIVE'
                            ? 'bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] border border-[#DAE7C7] dark:border-[#2d4d3a]'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {req.status === 'ACTIVE' ? 'APPROVED' : req.status === 'REJECTED' ? 'REJECTED' : 'PENDING'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#5E5E61] dark:text-slate-400">
                      Organizer: <strong className="text-[#101410] dark:text-white">{req.organizerName || 'Host'}</strong>
                    </div>

                    {req.status === 'ACTIVE' && req.accessCode && (
                      <div className="pt-2 border-t border-[#DCE4D6] dark:border-[#203a2c] flex items-center justify-between gap-2">
                        <div className="font-mono font-bold text-xs text-[#08482D] dark:text-[#DAE7C7]">
                          {req.accessCode}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAccessCodeInput(req.accessCode!);
                            setAccessError('');
                          }}
                          className="px-2.5 py-1 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-lg text-[11px] font-heading font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <KeyRound className="w-3 h-3 text-[#DAE7C7]" />
                          <span>Use This Code</span>
                        </button>
                      </div>
                    )}

                    {req.status === 'PENDING_APPROVAL' && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        Waiting for organizer review. Refresh once notified or approved.
                      </p>
                    )}

                    {req.status === 'REJECTED' && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400">
                        Application was declined by the workshop organizer.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Gate Scanner Station
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 transition-colors duration-200">
      {/* Volunteer Gate Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#08482D] rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-[#0b5435] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-[#DAE7C7]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#08482D] bg-[#DAE7C7] px-3 py-1 rounded-full shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#08482D]" />
              <span>Authorized Gate Attendant Station</span>
            </span>
            </div>
          <h1 className="text-xl sm:text-3xl font-heading font-bold tracking-tight text-white">
            Gate Scanner: {currentVolunteer?.name || 'Volunteer Attendant'}
          </h1>
          <div className="text-xs sm:text-sm text-[#DAE7C7]/90 flex flex-wrap items-center gap-2">
            <span>Appointed by: <strong className="text-white">{currentVolunteer?.organizerName}</strong></span>
            <span>•</span>
            <span>Code: <strong className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-white">{currentVolunteer?.accessCode}</strong></span>
            {currentVolunteer?.email && (
              <>
                <span>•</span>
                <span className="font-mono text-xs">{currentVolunteer.email}</span>
              </>
            )}
            {currentVolunteer?.phoneNumber && (
              <>
                <span>•</span>
                <span className="font-mono text-xs font-semibold">{currentVolunteer.phoneNumber}</span>
              </>
            )}
          </div>
          <p className="text-xs text-[#DAE7C7]/75 max-w-xl">
            Locked to session: <strong className="text-white">{currentVolunteer?.assignedWorkshopTitle}</strong>.
            Participants must present their 1-time digital ticket pass for verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end shrink-0 relative z-10">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
            title={soundEnabled ? 'Mute Scan Sound' : 'Enable Scan Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#DAE7C7]" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>
          <button
            onClick={() => {
              logoutVolunteer();
              navigateTo('home');
            }}
            className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white font-heading font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-rose-900/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Station</span>
          </button>
        </div>
      </motion.div>

      {/* Gate Station Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#101410] dark:text-white font-mono">
              {workshopRegistrations.length}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-medium">Session Capacity Enrolled</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#DAE7C7] dark:bg-[#1f3d2d] text-[#08482D] dark:text-[#a8d38d] flex items-center justify-center font-bold shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] font-mono">
              {attendedCount}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-medium">Admitted at Gate</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-amber-600 dark:text-amber-400 font-mono">
              {pendingCount}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-medium">Pending Entry</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7] flex items-center justify-center font-bold shrink-0">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-[#08482D] dark:text-[#DAE7C7] font-mono">
              {currentVolunteer?.totalScanned || scanHistory.filter((s) => s.status === 'GRANTED').length}
            </div>
            <div className="text-[11px] text-[#5E5E61] dark:text-slate-400 font-medium">Verified by You</div>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): High-Tech Viewfinder & Scan Modes */}
        <div className="lg:col-span-2 bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm p-6 space-y-6">
          {/* Mode Tabs */}
          <div className="flex items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`px-3.5 py-1.5 rounded-xl font-heading font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === 'camera'
                    ? 'bg-[#08482D] text-white shadow-sm'
                    : 'text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Instant QR Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3.5 py-1.5 rounded-xl font-heading font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-[#08482D] text-white shadow-sm'
                    : 'text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-3.5 py-1.5 rounded-xl font-heading font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  activeTab === 'manual'
                    ? 'bg-[#08482D] text-white shadow-sm'
                    : 'text-[#5E5E61] dark:text-slate-400 hover:bg-[#F5F8EF] dark:hover:bg-[#18281f]'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Barcode / Code</span>
              </button>
            </div>

            {/* Date bypass toggle for demo */}
            <label className="flex items-center gap-1.5 text-[11px] text-[#5E5E61] cursor-pointer">
              <input
                type="checkbox"
                checked={allowBypass}
                onChange={(e) => setAllowBypass(e.target.checked)}
                className="rounded border-[#DCE4D6] text-[#08482D] focus:ring-[#08482D]"
              />
              <span>Demo Date Bypass</span>
            </label>
          </div>

          {/* TAB 1: INSTANT QR SCANNER */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Camera Scanner Viewport */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video max-h-[420px] flex items-center justify-center border-2 border-[#DCE4D6] dark:border-[#203a2c] shadow-2xl select-none group">
                {/* Video Element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Precision Corner-Bracketed Laser Viewfinder Overlay */}
                {cameraActive && !cameraLoading && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                    {/* Viewfinder Reticle Frame */}
                    <div className="w-64 h-64 sm:w-72 sm:h-72 border border-[#DAE7C7]/40 rounded-3xl relative transition-all">
                      {/* Corner Brackets */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#DAE7C7] rounded-tl-2xl -mt-1 -ml-1 shadow-[0_0_12px_rgba(218,231,199,0.8)]" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#DAE7C7] rounded-tr-2xl -mt-1 -mr-1 shadow-[0_0_12px_rgba(218,231,199,0.8)]" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#DAE7C7] rounded-bl-2xl -mb-1 -ml-1 shadow-[0_0_12px_rgba(218,231,199,0.8)]" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#DAE7C7] rounded-br-2xl -mb-1 -mr-1 shadow-[0_0_12px_rgba(218,231,199,0.8)]" />

                      {/* Smooth Vertical Laser Sweep Bar */}
                      <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#DAE7C7] to-transparent shadow-[0_0_15px_rgba(218,231,199,1)] animate-laser-sweep rounded-full" />

                      {/* Center Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <Focus className="w-10 h-10 text-[#DAE7C7] animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Controls: Switch Camera + Flashlight */}
                {cameraActive && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-20">
                    {flashSupported && (
                      <button
                        type="button"
                        onClick={handleToggleFlash}
                        className={`p-2 rounded-xl text-xs font-heading font-medium backdrop-blur-md border transition-all shadow-lg flex items-center gap-1.5 ${
                          flashOn
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700/80'
                        }`}
                        title={flashOn ? 'Turn Flashlight Off' : 'Turn Flashlight On (Low Light Boost)'}
                      >
                        <Zap className={`w-3.5 h-3.5 ${flashOn ? 'fill-current text-slate-950' : 'text-amber-400'}`} />
                        <span className="hidden sm:inline">{flashOn ? 'Flash On' : 'Torch'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl text-xs font-heading font-medium backdrop-blur-md border border-slate-700/80 flex items-center gap-1.5 transition-colors shadow-lg"
                      title="Switch Camera Device"
                    >
                      <SwitchCamera className="w-3.5 h-3.5 text-[#DAE7C7]" />
                      <span className="hidden sm:inline">Flip Camera</span>
                    </button>
                  </div>
                )}

                {/* Camera Loading Overlay */}
                {cameraLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-xs text-slate-300 space-y-3 z-30">
                    <Loader2 className="w-8 h-8 animate-spin text-[#DAE7C7]" />
                    <p className="font-heading font-semibold">Starting instant QR scanner...</p>
                  </div>
                )}

                {/* Camera Error State */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-xs text-rose-400 space-y-3 z-30">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                    <p className="max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-4 py-2 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-xl font-heading font-semibold text-xs transition-colors"
                    >
                      Retry Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Viewfinder instructions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-[#5E5E61] dark:text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#08482D] dark:bg-[#a8d38d] animate-ping inline-block" />
                  <span>Ultra-Fast QR Engine Active · Millisecond instant detection</span>
                </span>
                <span className="font-mono text-[#5E5E61] dark:text-emerald-400 text-[10px]">
                  Multi-Orientation & Inverted Pass Compatible
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD PASS */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-[#DCE4D6] dark:border-[#203a2c] rounded-3xl p-8 text-center space-y-3 bg-[#F5F8EF]/50 dark:bg-[#18281f]/20">
              <UploadCloud className="w-12 h-12 text-[#08482D] dark:text-[#DAE7C7] mx-auto" />
              <div>
                <h4 className="font-heading font-semibold text-[#101410] dark:text-white text-sm">
                  Upload Attendee QR Ticket Pass
                </h4>
                <p className="text-xs text-[#5E5E61] dark:text-slate-400 mt-1">
                  Drag and drop a screenshot or image of the pass (PNG, JPG, WebP)
                </p>
              </div>
              <label className="inline-block px-5 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] text-white font-heading font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-sm">
                Browse Pass Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 3: BARCODE INPUT */}
          {activeTab === 'manual' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processTicketVerification(ticketInput);
              }}
              className="space-y-3"
            >
              <label className="block text-xs font-heading font-semibold text-[#101410] dark:text-white">
                Ticket Code / Barcode Scanner Input
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="e.g. TKT-B792A14-9201"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] font-mono text-xs text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
                />
                <button
                  type="submit"
                  disabled={verifying || !ticketInput.trim()}
                  className="px-5 py-2.5 bg-[#08482D] hover:bg-[#0c5c3b] disabled:opacity-50 text-white font-heading font-semibold text-xs rounded-xl shadow-md transition-colors"
                >
                  Verify Entry
                </button>
              </div>
              <p className="text-[11px] text-[#5E5E61] dark:text-slate-400">
                Supports USB handheld laser barcode scanners. Point-and-scan directly types into this field.
              </p>
            </form>
          )}

          {/* Instant Verification Feedback Banner */}
          {result.status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                result.status === 'success'
                  ? 'bg-[#E8F0DF] dark:bg-[#1a3325] border-[#DAE7C7] dark:border-[#2d4d3a] text-[#08482D] dark:text-[#DAE7C7]'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center gap-2 font-heading font-bold text-sm">
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-[#08482D] dark:text-[#a8d38d] shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{result.status === 'success' ? 'ENTRY GRANTED' : 'ENTRY DENIED'}</span>
              </div>
              <p className="leading-relaxed pl-7">{result.message}</p>
              {result.registration && (
                <div className="pl-7 pt-1 font-medium text-[11px]">
                  Participant: <strong>{result.registration.participantName}</strong> ({result.registration.participantEmail})
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column (1 Col): Live Gate Scan Feed */}
        <div className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#08482D] dark:text-[#DAE7C7]" />
              <span>Gate Scan Feed</span>
            </h3>
            <span className="text-[10px] text-[#5E5E61] dark:text-slate-400 font-mono font-semibold">
              {scanHistory.length} recorded
            </span>
          </div>

          {scanHistory.length === 0 ? (
            <div className="py-12 text-center text-[#5E5E61] dark:text-slate-400 text-xs space-y-2">
              <Scan className="w-8 h-8 text-[#5E5E61]/30 dark:text-slate-700 mx-auto" />
              <p>No passes scanned yet in this session.</p>
              <p className="text-[10px]">Scanned passes will appear in this real-time log.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 text-xs">
              {scanHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 ${
                    item.status === 'GRANTED'
                      ? 'bg-[#E8F0DF]/60 dark:bg-[#1a3325]/50 border-[#DAE7C7] dark:border-[#2d4d3a]'
                      : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div>
                    <div className="font-heading font-bold text-[#101410] dark:text-white">
                      {item.participantName}
                    </div>
                    <div className="font-mono text-[10px] text-[#5E5E61] dark:text-slate-400">
                      {item.ticketCode}
                    </div>
                    <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 mt-0.5">{item.message}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'GRANTED'
                          ? 'bg-[#E8F0DF] dark:bg-[#1a3325] text-[#08482D] dark:text-[#DAE7C7]'
                          : 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <div className="text-[10px] text-[#5E5E61] dark:text-slate-400 font-mono mt-1">{item.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assigned Workshop Attendee Roster (Read-Only Gate Reference) */}
      <div className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#203a2c] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE4D6] dark:border-[#203a2c] pb-3">
          <div>
            <h3 className="font-heading font-bold text-[#101410] dark:text-white text-xs">
              Session Attendee Roster ({workshopRegistrations.length})
            </h3>
            <p className="text-[11px] text-[#5E5E61] dark:text-slate-400">
              Reference list of confirmed attendees for {currentVolunteer?.assignedWorkshopTitle}.
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E5E61] dark:text-slate-400" />
            <input
              type="text"
              value={searchRoster}
              onChange={(e) => setSearchRoster(e.target.value)}
              placeholder="Filter by name, email, ticket..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DCE4D6] dark:border-[#22392c] bg-[#F5F8EF] dark:bg-[#18281f] text-[#101410] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08482D]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#DCE4D6] dark:border-[#203a2c]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8EF] dark:bg-[#18281f] text-[#5E5E61] dark:text-emerald-400 border-b border-[#DCE4D6] dark:border-[#203a2c] font-heading font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Ticket Pass Code</th>
                <th className="py-3 px-4">Gate Status</th>
                <th className="py-3 px-4 text-right">Quick Scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4D6]/70 dark:divide-[#22392c] text-[#101410] dark:text-slate-200">
              {filteredRoster.map((reg) => {
                const isAttended = reg.status === 'ATTENDED' || reg.verified;
                return (
                  <tr key={reg.id} className="hover:bg-[#F5F8EF]/60 dark:hover:bg-[#1b2b22] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-heading font-bold text-[#101410] dark:text-white">
                        {reg.participantName}
                      </div>
                      <div className="text-[#5E5E61] dark:text-slate-400 font-mono text-[11px]">{reg.participantEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#08482D] dark:text-[#DAE7C7]">
                      {reg.ticketCode || `TKT-${reg.id.substring(0, 8).toUpperCase()}`}
                    </td>
                    <td className="py-3 px-4">
                      {isAttended ? (
                        <span className="inline-flex items-center gap-1 text-[#08482D] dark:text-[#DAE7C7] font-semibold text-[11px] bg-[#E8F0DF] dark:bg-[#1a3325] px-2 py-0.5 rounded-full border border-[#DAE7C7] dark:border-[#2d4d3a]">
                          <CheckCircle className="w-3 h-3 text-[#08482D] dark:text-[#a8d38d]" />
                          <span>Attended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#08482D] dark:text-[#DAE7C7] font-semibold text-[11px] bg-[#F5F8EF] dark:bg-[#18281f] px-2 py-0.5 rounded-full border border-[#DCE4D6] dark:border-[#22392c]">
                          <Clock className="w-3 h-3 text-[#08482D] dark:text-[#a8d38d]" />
                          <span>Pending Entry</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isAttended && (
                        <button
                          type="button"
                          onClick={() => processTicketVerification(reg.ticketCode || reg.id)}
                          className="px-2.5 py-1 bg-[#08482D] hover:bg-[#0c5c3b] text-white rounded-lg text-xs font-heading font-semibold transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <Scan className="w-3 h-3 text-[#DAE7C7]" />
                          <span>Scan Pass</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
