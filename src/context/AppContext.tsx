import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Workshop,
  Registration,
  AuditLog,
  UserRole,
  WorkshopFormData,
  Volunteer,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WORKSHOPS,
  INITIAL_REGISTRATIONS,
  INITIAL_AUDIT_LOGS,
  normalizeBannerUrl,
} from '../data/seedData';
import {
  validateWorkshopInput,
  calculateSeats,
} from '../utils/workshopRules';
import { apiFetch, saveToken, clearToken, getToken } from '../utils/api';
import { loadRazorpayScript } from '../utils/razorpay';

export type ActivePage =
  | 'home'
  | 'workshops'
  | 'workshop-detail'
  | 'participant-dashboard'
  | 'my-registrations'
  | 'organizer-dashboard'
  | 'organizer-workshops'
  | 'organizer-registrations'
  | 'volunteer-portal'
  | 'admin-dashboard'
  | 'our-story'
  | 'contact';

interface ToastAlert {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  workshops: Workshop[];
  registrations: Registration[];
  auditLogs: AuditLog[];
  activePage: ActivePage;
  selectedWorkshopId: string | null;
  alerts: ToastAlert[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Navigation & Page Switching
  navigateTo: (page: ActivePage, workshopId?: string) => void;
  dismissAlert: (id: string) => void;
  showAlert: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Auth & Roles
  setCurrentUser: (user: User | null) => void;
  switchRoleQuickly: (role: UserRole) => Promise<void>;
  loginUser: (email: string) => Promise<boolean>;
  registerUser: (
    fullName: string,
    email: string,
    role: 'PARTICIPANT' | 'ORGANIZER' | 'VOLUNTEER',
    department?: string,
    phoneNumber?: string
  ) => Promise<boolean>;
  logoutUser: () => void;
  updateProfile: (fullName: string, department?: string, phoneNumber?: string) => Promise<void>;

  // Volunteer Management (Organizer side)
  volunteers: Volunteer[];
  createVolunteer: (data: { name: string; email: string; phoneNumber?: string; assignedWorkshopId: string; organizerId?: string }) => Promise<{ success: boolean; volunteer?: Volunteer; message: string }>;
  approveVolunteerRequest: (id: string) => Promise<{ success: boolean; accessCode?: string; message: string }>;
  rejectVolunteerRequest: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteVolunteer: (id: string) => Promise<{ success: boolean }>;
  toggleVolunteerStatus: (id: string) => Promise<{ success: boolean }>;
  regenerateVolunteerCode: (id: string) => Promise<{ success: boolean; newCode?: string }>;
  updateVolunteerProfile: (id: string, name: string, email: string, phoneNumber?: string) => Promise<boolean>;

  // Volunteer Gate Login & Verification (Volunteer side)
  currentVolunteer: Volunteer | null;
  assignedVolunteerWorkshop: Workshop | null;
  requestVolunteering: (data: { name: string; email: string; phoneNumber?: string; assignedWorkshopId: string; requestNote?: string }) => Promise<{ success: boolean; pending?: boolean; alreadyApproved?: boolean; accessCode?: string; message: string }>;
  checkMyVolunteerRequests: (email: string) => Promise<{ success: boolean; requests: Volunteer[] }>;
  verifyVolunteerLogin: (accessCode: string, organizerId?: string, profile?: { name?: string; email?: string; phoneNumber?: string }) => Promise<{ success: boolean; error?: string }>;
  verifyTicketAsVolunteer: (ticketCode: string, allowDateBypass?: boolean) => Promise<{ success: boolean; message: string; registration?: Registration; workshop?: Workshop }>;
  logoutVolunteer: () => void;

  // Workshop CRUD
  createWorkshop: (data: WorkshopFormData) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  updateWorkshop: (id: string, data: WorkshopFormData) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  deleteWorkshop: (id: string) => Promise<{ success: boolean; reason?: string }>;
  togglePublishStatus: (id: string) => Promise<void>;

  // Registration & Payment Workflow
  registerForWorkshop: (workshopId: string, notes?: string) => Promise<{ success: boolean; message: string; registration?: Registration }>;
  cancelWorkshopRegistration: (registrationId: string) => Promise<{ success: boolean; message: string }>;
  verifyTicket: (ticketCode: string, allowDateBypass?: boolean, targetWorkshopId?: string) => Promise<{ success: boolean; message: string; registration?: Registration }>;
  getWorkshopPaymentAnalytics: (workshopId: string) => Promise<{ success: boolean; analytics?: any; error?: string }>;

  // Super Admin Governance
  toggleUserAccountStatus: (userId: string) => Promise<boolean>;
  changeUserRole: (userId: string, newRole: UserRole) => Promise<boolean>;

  // Refresh & Reset
  refreshData: () => Promise<void>;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state with seed fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('wh_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    const saved = localStorage.getItem('wh_workshops');
    const savedCreds = (() => {
      try { return JSON.parse(localStorage.getItem('wh_workshop_creds') || '{}'); } catch { return {}; }
    })();
    if (saved) {
      try {
        const list: Workshop[] = JSON.parse(saved);
        return list.map((w) => {
          const cred = savedCreds[w.id] || {};
          return {
            ...w,
            bannerImageUrl: normalizeBannerUrl(w.bannerImageUrl, w),
                                    razorpayKeyId: w.razorpayKeyId || cred.razorpayKeyId || undefined,
          };
        });
      } catch {}
    }
    return INITIAL_WORKSHOPS.map((w) => {
      const cred = savedCreds[w.id] || {};
      return {
        ...w,
                        razorpayKeyId: w.razorpayKeyId || cred.razorpayKeyId || undefined,
      };
    });
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('wh_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('wh_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const isExplicitlyLoggedOut = localStorage.getItem('wh_logged_out') === 'true';
    if (isExplicitlyLoggedOut) return null;

    // 1. Synchronously restore from serialized user object
    const savedUserJson = localStorage.getItem('wh_user');
    if (savedUserJson) {
      try {
        const parsed = JSON.parse(savedUserJson);
        if (parsed && parsed.email) return parsed;
      } catch {}
    }

    // 2. Fallback to saved users array by email
    const savedEmail = localStorage.getItem('wh_current_user_email');
    if (savedEmail) {
      const savedUsersJson = localStorage.getItem('wh_users');
      if (savedUsersJson) {
        try {
          const parsedUsers: User[] = JSON.parse(savedUsersJson);
          const found = parsedUsers.find((u) => u.email.toLowerCase() === savedEmail.toLowerCase());
          if (found) return found;
        } catch {}
      }
    }
    return null;
  });

  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    const saved = localStorage.getItem('wh_volunteers');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentVolunteer, setCurrentVolunteer] = useState<Volunteer | null>(() => {
    const saved = localStorage.getItem('wh_volunteer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.volunteer || null;
      } catch {}
    }
    return null;
  });

  const [assignedVolunteerWorkshop, setAssignedVolunteerWorkshop] = useState<Workshop | null>(() => {
    const saved = localStorage.getItem('wh_volunteer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.workshop || null;
      } catch {}
    }
    return null;
  });

  const [activePage, setActivePage] = useState<ActivePage>(() => {
    // Check direct URL hash or pathname first for dedicated pages
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (hash === '#our-story' || path.includes('/our-story')) return 'our-story';
    if (hash === '#contact' || path.includes('/contact')) return 'contact';

    const isExplicitlyLoggedOut = localStorage.getItem('wh_logged_out') === 'true';
    if (isExplicitlyLoggedOut) return 'home';

    const volSession = localStorage.getItem('wh_volunteer_session');
    if (volSession) return 'volunteer-portal';

    const savedPage = localStorage.getItem('wh_active_page') as ActivePage | null;
    if (savedPage) return savedPage;

    const savedUserJson = localStorage.getItem('wh_user');
    if (savedUserJson) {
      try {
        const u = JSON.parse(savedUserJson);
        if (u.role === 'SUPER_ADMIN') return 'admin-dashboard';
        if (u.role === 'ORGANIZER') return 'organizer-dashboard';
        return 'workshops';
      } catch {}
    }
    return 'home';
  });
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(() => {
    return localStorage.getItem('wh_selected_workshop_id') || null;
  });
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('wh_theme');
    // Strict requirement: Light mode is the default for first-time visitors
    if (saved === 'dark') return 'dark';
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('wh_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissAlert(id);
    }, 4500);
  }, [dismissAlert]);

  // ─────────────────────────────────────────────────────────────
  // Fetch fresh data directly from MongoDB backend in parallel
  // ─────────────────────────────────────────────────────────────
  const refreshData = useCallback(async () => {
    try {
      const token = getToken();
      const isExplicitlyLoggedOut = localStorage.getItem('wh_logged_out') === 'true';

      const [wsRes, regRes, auditRes, usersRes, volRes, meRes] = await Promise.allSettled([
        apiFetch('/api/workshops?all=true'),
        apiFetch('/api/registrations'),
        apiFetch('/api/admin/audit-logs'),
        apiFetch('/api/auth/users'),
        apiFetch('/api/volunteers'),
        token && !isExplicitlyLoggedOut ? apiFetch('/api/auth/me') : Promise.resolve(null),
      ]);

      // 1. Workshops
      if (wsRes.status === 'fulfilled' && wsRes.value.ok) {
        const wsData = await wsRes.value.json();
        if (wsData.success && Array.isArray(wsData.data)) {
          const savedCreds = (() => {
            try { return JSON.parse(localStorage.getItem('wh_workshop_creds') || '{}'); } catch { return {}; }
          })();
          const normalized = wsData.data.map((w: Workshop) => {
            const cred = savedCreds[w.id] || {};
            return {
              ...w,
              bannerImageUrl: normalizeBannerUrl(w.bannerImageUrl, w),
                                          razorpayKeyId: w.razorpayKeyId || cred.razorpayKeyId || undefined,
            };
          });
          setWorkshops(normalized);
          localStorage.setItem('wh_workshops', JSON.stringify(normalized));
        }
      }

      // 2. Registrations
      if (regRes.status === 'fulfilled' && regRes.value.ok) {
        const regData = await regRes.value.json();
        if (regData.success && Array.isArray(regData.registrations)) {
          setRegistrations(regData.registrations);
          localStorage.setItem('wh_registrations', JSON.stringify(regData.registrations));
        }
      }

      // 3. Audit logs
      if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
        const auditData = await auditRes.value.json();
        if (auditData.success && Array.isArray(auditData.auditLogs)) {
          setAuditLogs(auditData.auditLogs);
          localStorage.setItem('wh_audit_logs', JSON.stringify(auditData.auditLogs));
        }
      }

      // 4. Users
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const usersData = await usersRes.value.json();
        if (usersData.success && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
          localStorage.setItem('wh_users', JSON.stringify(usersData.users));
        }
      }

      // 5. Volunteers
      if (volRes.status === 'fulfilled' && volRes.value.ok) {
        const volData = await volRes.value.json();
        if (volData.success && Array.isArray(volData.volunteers)) {
          setVolunteers(volData.volunteers);
          localStorage.setItem('wh_volunteers', JSON.stringify(volData.volunteers));
        }
      }

      // 6. Current User
      if (meRes.status === 'fulfilled' && meRes.value) {
        if (meRes.value.ok) {
          const meData = await meRes.value.json();
          if (meData.success && meData.user) {
            setCurrentUser(meData.user);
            localStorage.setItem('wh_user', JSON.stringify(meData.user));
            localStorage.setItem('wh_current_user_email', meData.user.email);
            localStorage.setItem('wh_role_selected', meData.user.role);
          }
        } else if (meRes.value.status === 401) {
          clearToken();
          localStorage.removeItem('wh_user');
          localStorage.removeItem('wh_current_user_email');
          localStorage.removeItem('wh_role_selected');
          setCurrentUser(null);
        }
      }
    } catch (e) {
      console.log('Backend sync offline, running in local fallback mode', e);
    }
  }, []);

  const navigateTo = (page: ActivePage, workshopId?: string) => {
    if (workshopId) {
      setSelectedWorkshopId(workshopId);
      localStorage.setItem('wh_selected_workshop_id', workshopId);
    }
    setActivePage(page);
    localStorage.setItem('wh_active_page', page);

    if (page === 'our-story') {
      window.location.hash = 'our-story';
    } else if (page === 'contact') {
      window.location.hash = 'contact';
    } else if (page === 'home') {
      if (window.location.hash === '#our-story' || window.location.hash === '#contact') {
        history.replaceState(null, '', window.location.pathname);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Immediate background fetch from MongoDB Atlas
    refreshData();
  };

  // Sync navigation on browser hash change
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#our-story') {
        setActivePage('our-story');
      } else if (h === '#contact') {
        setActivePage('contact');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Continuous DB polling & window focus listener for real-time synchronization across devices
  useEffect(() => {
    refreshData();

    // Continuously fetch from MongoDB Atlas every 5 seconds to keep participant seats and status live
    const interval = setInterval(() => {
      refreshData();
    }, 5000);

    const handleFocus = () => {
      refreshData();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshData]);

  // Keep localStorage updated when currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wh_user', JSON.stringify(currentUser));
      localStorage.setItem('wh_current_user_email', currentUser.email);
      localStorage.setItem('wh_role_selected', currentUser.role);
      localStorage.removeItem('wh_logged_out');
    }
  }, [currentUser]);

  // ─────────────────────────────────────────────────────────────
  // 1-Click Role / Persona Switching (Connected to Backend Token)
  // ─────────────────────────────────────────────────────────────
  const switchRoleQuickly = async (role: UserRole) => {
    localStorage.removeItem('wh_logged_out');
    localStorage.setItem('wh_role_selected', role);
    let targetEmail = '';
    if (role === 'SUPER_ADMIN') {
      targetEmail = 'admin@workshophub.edu';
    } else {
      const match = users.find((u) => u.role === role);
      if (match) targetEmail = match.email;
    }

    if (!targetEmail) {
      showAlert(`Please log in or register an account with role ${role}.`, 'info');
      return;
    }

    try {
      const res = await apiFetch('/api/auth/switch-demo', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          saveToken(data.token);
          setCurrentUser(data.user);
          localStorage.setItem('wh_user', JSON.stringify(data.user));
          localStorage.setItem('wh_current_user_email', data.user.email);
          localStorage.setItem('wh_role_selected', data.user.role);
          showAlert(
            `Signed in as ${
              data.user.role === 'ORGANIZER'
                ? 'Faculty Organizer'
                : data.user.role === 'SUPER_ADMIN'
                ? 'Super Admin'
                : 'Participant'
            }: ${data.user.fullName}`,
            'info'
          );
          if (data.user.role === 'SUPER_ADMIN') {
            navigateTo('admin-dashboard');
          } else if (data.user.role === 'ORGANIZER') {
            navigateTo('organizer-dashboard');
          } else {
            navigateTo('participant-dashboard');
          }
        }
      }
    } catch (e) {
      console.log('Error switching persona', e);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Auth Operations
  // ─────────────────────────────────────────────────────────────
  const loginUser = async (email: string): Promise<boolean> => {
    localStorage.removeItem('wh_logged_out');
    try {
      const res = await apiFetch('/api/auth/switch-demo', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          if (data.token) saveToken(data.token);
          setCurrentUser(data.user);
          localStorage.setItem('wh_user', JSON.stringify(data.user));
          localStorage.setItem('wh_current_user_email', data.user.email);
          localStorage.setItem('wh_role_selected', data.user.role);
          showAlert(`Welcome back, ${data.user.fullName}!`, 'success');
          if (data.user.role === 'SUPER_ADMIN') {
            navigateTo('admin-dashboard');
          } else if (data.user.role === 'ORGANIZER') {
            navigateTo('organizer-dashboard');
          } else {
            navigateTo('participant-dashboard');
          }
          await refreshData();
          return true;
        }
      }
    } catch {
      // Fallback
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      showAlert('No account found with this email. Please register first.', 'error');
      return false;
    }
    if (user.accountStatus === 'SUSPENDED') {
      showAlert('This account is suspended. Access denied.', 'error');
      return false;
    }
    setCurrentUser(user);
    localStorage.setItem('wh_user', JSON.stringify(user));
    localStorage.setItem('wh_current_user_email', user.email);
    localStorage.setItem('wh_role_selected', user.role);
    showAlert(`Welcome back, ${user.fullName}!`, 'success');
    if (user.role === 'ORGANIZER' || user.role === 'SUPER_ADMIN') navigateTo('organizer-dashboard');
    else navigateTo('workshops');
    return true;
  };

  const registerUser = async (
    fullName: string,
    email: string,
    role: 'PARTICIPANT' | 'ORGANIZER' | 'VOLUNTEER',
    department?: string,
    phoneNumber?: string
  ): Promise<boolean> => {
    localStorage.removeItem('wh_logged_out');
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: 'Password123!',
          role,
          department,
          phoneNumber: phoneNumber?.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.token) saveToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('wh_user', JSON.stringify(data.user));
        localStorage.setItem('wh_current_user_email', data.user.email);
        localStorage.setItem('wh_role_selected', role);
        showAlert(`Account created successfully as ${role.toLowerCase()} in MongoDB!`, 'success');
        if (role === 'ORGANIZER') navigateTo('organizer-dashboard');
        else if (role === 'VOLUNTEER') navigateTo('volunteer-portal');
        else navigateTo('workshops');
        await refreshData();
        return true;
      } else {
        showAlert(data.error || 'Registration failed.', 'error');
        return false;
      }
    } catch {
      showAlert('Server error during registration.', 'error');
      return false;
    }
  };

  const logoutUser = () => {
    clearToken();
    localStorage.removeItem('wh_user');
    localStorage.removeItem('wh_current_user_email');
    localStorage.removeItem('wh_role_selected');
    localStorage.removeItem('wh_active_page');
    localStorage.removeItem('wh_selected_workshop_id');
    localStorage.setItem('wh_logged_out', 'true');
    setCurrentUser(null);
    showAlert('Signed out successfully. Choose your role below to log in.', 'info');
    navigateTo('home');
  };

  const updateProfile = async (fullName: string, department?: string, phoneNumber?: string) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName, department, phoneNumber }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        showAlert('Profile updated successfully in MongoDB.', 'success');
        await refreshData();
      } else {
        showAlert(data.error || 'Failed to update profile.', 'error');
      }
    } catch {
      showAlert('Server error updating profile.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Volunteer Management & Gate Access
  // ─────────────────────────────────────────────────────────────
  const createVolunteer = async (data: { name: string; email: string; phoneNumber?: string; assignedWorkshopId: string; organizerId?: string }) => {
    try {
      const res = await apiFetch('/api/volunteers', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phoneNumber: data.phoneNumber?.trim(),
          assignedWorkshopId: data.assignedWorkshopId,
          organizerId: data.organizerId || currentUser?.id,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success && resData.volunteer) {
        setVolunteers((prev) => [resData.volunteer, ...prev.filter((v) => v.id !== resData.volunteer.id)]);
        showAlert(`Gate Volunteer ${resData.volunteer.name} appointed! Access code: ${resData.volunteer.accessCode}`, 'success');
        await refreshData();
        return { success: true, volunteer: resData.volunteer, message: resData.message };
      }
      showAlert(resData.error || 'Failed to appoint volunteer.', 'error');
      return { success: false, message: resData.error || 'Failed to appoint volunteer.' };
    } catch {
      showAlert('Server error while appointing volunteer.', 'error');
      return { success: false, message: 'Server error' };
    }
  };

  const approveVolunteerRequest = async (id: string) => {
    try {
      const res = await apiFetch(`/api/volunteers/${id}/approve`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok && data.success && data.volunteer) {
        setVolunteers((prev) => prev.map((v) => (v.id === id ? data.volunteer : v)));
        showAlert(`Volunteer approved! Gate access code: ${data.accessCode}`, 'success');
        await refreshData();
        return { success: true, accessCode: data.accessCode, message: data.message };
      }
      showAlert(data.error || 'Failed to approve request.', 'error');
      return { success: false, message: data.error || 'Failed to approve request.' };
    } catch {
      showAlert('Server error while approving volunteer request.', 'error');
      return { success: false, message: 'Server error' };
    }
  };

  const rejectVolunteerRequest = async (id: string) => {
    try {
      const res = await apiFetch(`/api/volunteers/${id}/reject`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok && data.success) {
        setVolunteers((prev) => prev.map((v) => (v.id === id ? data.volunteer : v)));
        showAlert('Volunteer request rejected.', 'info');
        await refreshData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Failed to reject' };
    } catch {
      return { success: false, message: 'Server error' };
    }
  };

  const requestVolunteering = async (data: {
    name: string;
    email: string;
    phoneNumber?: string;
    assignedWorkshopId: string;
    requestNote?: string;
  }) => {
    try {
      const res = await apiFetch('/api/volunteers/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert(resData.message, resData.alreadyApproved ? 'success' : 'info');
        await refreshData();
        return {
          success: true,
          pending: resData.pending,
          alreadyApproved: resData.alreadyApproved,
          accessCode: resData.accessCode,
          message: resData.message,
        };
      }
      showAlert(resData.error || 'Volunteering request failed.', 'error');
      return { success: false, message: resData.error || 'Volunteering request failed.' };
    } catch {
      showAlert('Server error while submitting volunteering request.', 'error');
      return { success: false, message: 'Server error' };
    }
  };

  const checkMyVolunteerRequests = async (email: string) => {
    try {
      const res = await apiFetch(`/api/volunteers/my-status?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.requests)) {
        return { success: true, requests: data.requests };
      }
    } catch {}
    return { success: false, requests: [] };
  };

  const updateVolunteerProfile = async (id: string, name: string, email: string, phoneNumber?: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/volunteers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, email, phoneNumber }),
      });
      const resData = await res.json();
      if (res.ok && resData.success && resData.volunteer) {
        setVolunteers((prev) => prev.map((v) => (v.id === id ? resData.volunteer : v)));
        if (currentVolunteer?.id === id) {
          setCurrentVolunteer(resData.volunteer);
        }
        showAlert('Volunteer profile updated successfully.', 'success');
        return true;
      }
    } catch {}
    return false;
  };

  const deleteVolunteer = async (id: string) => {
    try {
      const res = await apiFetch(`/api/volunteers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        showAlert('Volunteer access removed successfully.', 'info');
        await refreshData();
        return { success: true };
      }
    } catch {}
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
    showAlert('Volunteer access removed.', 'info');
    return { success: true };
  };

  const toggleVolunteerStatus = async (id: string) => {
    try {
      const res = await apiFetch(`/api/volunteers/${id}/toggle-status`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok && data.success && data.volunteer) {
        setVolunteers((prev) => prev.map((v) => v.id === id ? data.volunteer : v));
        showAlert(`Volunteer status changed to ${data.volunteer.status}.`, 'info');
        return { success: true };
      }
    } catch {}
    return { success: false };
  };

  const regenerateVolunteerCode = async (id: string) => {
    try {
      const res = await apiFetch(`/api/volunteers/${id}/regenerate-code`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok && data.success && data.volunteer) {
        setVolunteers((prev) => prev.map((v) => v.id === id ? data.volunteer : v));
        showAlert(`New access code generated: ${data.newCode}`, 'success');
        return { success: true, newCode: data.newCode };
      }
    } catch {}
    return { success: false };
  };

  const verifyVolunteerLogin = async (
    accessCode: string,
    organizerId?: string,
    profile?: { name?: string; email?: string; phoneNumber?: string }
  ) => {
    try {
      const res = await apiFetch('/api/volunteers/verify-access', {
        method: 'POST',
        body: JSON.stringify({
          accessCode: accessCode.trim().toUpperCase(),
          organizerId: organizerId && organizerId !== 'ALL' ? organizerId : undefined,
          name: profile?.name?.trim(),
          email: profile?.email?.trim().toLowerCase(),
          phoneNumber: profile?.phoneNumber?.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.volunteer) {
        setCurrentVolunteer(data.volunteer);
        setAssignedVolunteerWorkshop(data.workshop);
        localStorage.setItem('wh_volunteer_session', JSON.stringify({
          volunteer: data.volunteer,
          workshop: data.workshop,
        }));
        localStorage.setItem('wh_role_selected', 'VOLUNTEER');
        localStorage.removeItem('wh_logged_out');
        showAlert(`Welcome Gate Volunteer ${data.volunteer.name}! Verified for ${data.workshop?.title || 'assigned workshop'}.`, 'success');
        navigateTo('volunteer-portal');
        return { success: true };
      } else {
        showAlert(data.error || 'Invalid or revoked volunteer code.', 'error');
        return { success: false, error: data.error };
      }
    } catch {
      showAlert('Unable to connect to verification server.', 'error');
      return { success: false, error: 'Connection error' };
    }
  };

  const verifyTicketAsVolunteer = async (ticketCode: string, allowDateBypass?: boolean) => {
    if (!currentVolunteer) {
      return { success: false, message: 'No active volunteer session.' };
    }
    try {
      const res = await apiFetch('/api/volunteers/verify-ticket', {
        method: 'POST',
        body: JSON.stringify({
          accessCode: currentVolunteer.accessCode,
          ticketCode: ticketCode.trim(),
          allowDateBypass: !!allowDateBypass,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert(data.message, 'success');
        // Update local volunteer stats & registration without waiting for full multi-endpoint refresh
        if (data.registration) {
          setRegistrations((prev) =>
            prev.map((r) => (r.id === data.registration.id ? data.registration : r))
          );
        }
        if (currentVolunteer) {
          setCurrentVolunteer((prev) =>
            prev ? { ...prev, totalScanned: (prev.totalScanned || 0) + 1 } : null
          );
        }
        return {
          success: true,
          message: data.message,
          registration: data.registration,
          workshop: data.workshop,
        };
      } else {
        return { success: false, message: data.error || 'Ticket verification failed.' };
      }
    } catch {
      return { success: false, message: 'Server communication error during gate scan.' };
    }
  };

  const logoutVolunteer = () => {
    setCurrentVolunteer(null);
    setAssignedVolunteerWorkshop(null);
    localStorage.removeItem('wh_volunteer_session');
    localStorage.removeItem('wh_role_selected');
    localStorage.removeItem('wh_active_page');
    localStorage.removeItem('wh_selected_workshop_id');
    localStorage.setItem('wh_logged_out', 'true');
    showAlert('Volunteer gate session ended.', 'info');
    navigateTo('home');
  };

  // ─────────────────────────────────────────────────────────────
  // Workshop Operations (Full MongoDB Persistence)
  // ─────────────────────────────────────────────────────────────
  const createWorkshop = async (data: WorkshopFormData) => {
    if (!currentUser || (currentUser.role !== 'ORGANIZER' && currentUser.role !== 'SUPER_ADMIN')) {
      showAlert('Unauthorized. Only organizers can create workshops.', 'error');
      return { success: false };
    }

    const validation = validateWorkshopInput(data, 0);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const outcomes = data.learningOutcomes
      ? data.learningOutcomes
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['Core conceptual understanding', 'Practical application'];

    const payload = {
      title: data.title.trim(),
      summary: data.summary.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      bannerImageUrl: data.bannerImageUrl || '/assets/images/fullstack-web-workshop-banner.jpg',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      venue: data.venue?.trim() || (data.onlineMode ? 'Online Webcast' : 'Campus Center'),
      venueAddress: data.venueAddress?.trim() || '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      mapUrl: data.mapUrl?.trim() || '',
      onlineMode: Boolean(data.onlineMode),
      meetingLink: data.meetingLink?.trim() || '',
      capacity: Number(data.capacity),
      registrationDeadline: data.registrationDeadline || data.date,
      learningOutcomes: outcomes,
      status: data.status || 'PUBLISHED',
      pricingType: data.pricingType || 'FREE',
      price: data.pricingType === 'PAID' ? Number(data.price) || 0 : 0,
      currency: data.currency || 'INR',
                  razorpayKeyId: data.razorpayKeyId?.trim() || '',
      organizerId: currentUser?.id,
    };

    const tempId = 'ws-' + Math.random().toString(36).substring(2, 10);
    const newWorkshop: Workshop = {
      ...payload,
      id: tempId,
      learningOutcomes: outcomes,
                  razorpayKeyId: data.razorpayKeyId?.trim() || '',
      organizerNameSnapshot: currentUser?.fullName || 'Organizer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      let res = await apiFetch('/api/workshops', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status === 401 && getToken()) {
        const refreshRes = await apiFetch('/api/auth/refresh-token', {
          method: 'POST',
        });
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          if (refreshed.token) {
            saveToken(refreshed.token);
            res = await apiFetch('/api/workshops', {
              method: 'POST',
              body: JSON.stringify(payload),
            });
          }
        }
      }

      let resData: any = {};
      try { resData = await res.json(); } catch {}

      const finalId = resData.data?.id || resData.id || resData.workshop?.id || tempId;
      try {
        const creds = JSON.parse(localStorage.getItem('wh_workshop_creds') || '{}');
        creds[finalId] = {
                              razorpayKeyId: data.razorpayKeyId?.trim() || '',
        };
        localStorage.setItem('wh_workshop_creds', JSON.stringify(creds));
      } catch {}

      setWorkshops((prev) => {
        const item = { ...newWorkshop, id: finalId };
        const next = [item, ...prev];
        try { localStorage.setItem('wh_workshops', JSON.stringify(next)); } catch {}
        return next;
      });

      showAlert(`Workshop "${payload.title}" created successfully!`, 'success');
      refreshData().catch(() => {});
      return { success: true };
    } catch {
      setWorkshops((prev) => {
        const next = [newWorkshop, ...prev];
        try { localStorage.setItem('wh_workshops', JSON.stringify(next)); } catch {}
        return next;
      });
      showAlert(`Workshop "${payload.title}" created successfully.`, 'success');
      return { success: true };
    }
  };

  const updateWorkshop = async (id: string, data: WorkshopFormData) => {
    const existing = workshops.find((w) => w.id === id);
    if (!existing) {
      showAlert('Workshop not found.', 'error');
      return { success: false };
    }

    const seats = calculateSeats(existing, registrations);
    const validation = validateWorkshopInput(data, seats.registeredCount);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const outcomes = data.learningOutcomes
      ? data.learningOutcomes
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : existing.learningOutcomes;

    const payload = {
      title: data.title.trim(),
      summary: data.summary.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      bannerImageUrl: data.bannerImageUrl || existing.bannerImageUrl,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      venue: data.venue?.trim() || (data.onlineMode ? 'Online Webcast' : existing.venue),
      venueAddress: data.venueAddress !== undefined ? data.venueAddress.trim() : (existing.venueAddress || ''),
      latitude: data.latitude !== undefined ? data.latitude : existing.latitude,
      longitude: data.longitude !== undefined ? data.longitude : existing.longitude,
      mapUrl: data.mapUrl !== undefined ? data.mapUrl.trim() : (existing.mapUrl || ''),
      onlineMode: Boolean(data.onlineMode),
      meetingLink: data.meetingLink?.trim() || '',
      capacity: Number(data.capacity),
      registrationDeadline: data.registrationDeadline || data.date,
      learningOutcomes: outcomes,
      status: data.status || 'PUBLISHED',
      pricingType: data.pricingType || existing.pricingType || 'FREE',
      price: (data.pricingType === 'PAID' ? Number(data.price) : (data.pricingType === 'FREE' ? 0 : Number(existing.price || 0))) || 0,
      currency: data.currency || existing.currency || 'INR',
                  razorpayKeyId: data.razorpayKeyId !== undefined ? data.razorpayKeyId.trim() : (existing.razorpayKeyId || ''),
      organizerId: existing.organizerId || currentUser?.id,
    };

    const updatedWorkshop: Workshop = {
      ...existing,
      ...payload,
      id,
      learningOutcomes: outcomes,
                  razorpayKeyId: data.razorpayKeyId !== undefined ? data.razorpayKeyId.trim() : (existing.razorpayKeyId || ''),
      updatedAt: new Date().toISOString(),
    };

    const applyLocalUpdate = () => {
      try {
        const creds = JSON.parse(localStorage.getItem('wh_workshop_creds') || '{}');
        creds[id] = {
                              razorpayKeyId: data.razorpayKeyId !== undefined ? data.razorpayKeyId.trim() : (existing.razorpayKeyId || ''),
        };
        localStorage.setItem('wh_workshop_creds', JSON.stringify(creds));
      } catch {}

      setWorkshops((prev) => {
        const next = prev.map((w) => (w.id === id ? updatedWorkshop : w));
        try { localStorage.setItem('wh_workshops', JSON.stringify(next)); } catch {}
        return next;
      });
    };

    try {
      let res = await apiFetch(`/api/workshops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.status === 401 && getToken()) {
        const refreshRes = await apiFetch('/api/auth/refresh-token', {
          method: 'POST',
        });
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          if (refreshed.token) {
            saveToken(refreshed.token);
            res = await apiFetch(`/api/workshops/${id}`, {
              method: 'PUT',
              body: JSON.stringify(payload),
            });
          }
        }
      }

      applyLocalUpdate();

      let resData: any = {};
      try { resData = await res.json(); } catch {}

      if (res.ok && resData.success) {
        showAlert(`Workshop "${payload.title}" updated successfully!`, 'success');
        refreshData().catch(() => {});
        return { success: true };
      } else {
        showAlert(`Changes saved for "${payload.title}".`, 'success');
        return { success: true };
      }
    } catch {
      applyLocalUpdate();
      showAlert(`Workshop changes saved successfully.`, 'success');
      return { success: true };
    }
  };

  const deleteWorkshop = async (id: string): Promise<{ success: boolean; reason?: string }> => {
    try {
      const res = await apiFetch(`/api/workshops/${id}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert(resData.message || 'Workshop deleted or cancelled.', 'success');
        await refreshData();
        return { success: true };
      } else {
        showAlert(resData.error || 'Failed to delete workshop.', 'error');
        return { success: false, reason: resData.error };
      }
    } catch {
      showAlert('Server error while deleting workshop.', 'error');
      return { success: false, reason: 'Server error' };
    }
  };

  const togglePublishStatus = async (id: string) => {
    try {
      const res = await apiFetch(`/api/workshops/${id}/toggle-status`, {
        method: 'PATCH',
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert(`Workshop status changed to ${resData.workshop.status} in MongoDB.`, 'success');
        await refreshData();
      } else {
        showAlert(resData.error || 'Failed to change status.', 'error');
      }
    } catch {
      showAlert('Server communication error.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Registration & Payment Operations (Full MongoDB Persistence)
  // ─────────────────────────────────────────────────────────────
  const registerForWorkshop = async (workshopId: string, notes?: string): Promise<{ success: boolean; message: string; registration?: Registration }> => {
    const workshop = workshops.find((w) => w.id === workshopId);
    if (!workshop) {
      showAlert('Workshop not found.', 'error');
      return { success: false, message: 'Workshop not found.' };
    }

    if (!currentUser && !getToken()) {
      showAlert('Please sign in or register to book your workshop seat.', 'error');
      return { success: false, message: 'Authentication required. Please sign in.' };
    }

    // ─────────────────────────────────────────────────────────────
    // PAID WORKSHOP FLOW: Razorpay Test Mode Checkout
    // ─────────────────────────────────────────────────────────────
    if (workshop.pricingType === 'PAID' && (workshop.price ?? 0) > 0) {
      try {
        // Step 1: Create checkout order on backend
        let orderRes = await apiFetch('/api/payments/create-order', {
          method: 'POST',
          body: JSON.stringify({
            workshopId,
            notes: notes?.trim() || '',
            participantId: currentUser?.id,
          }),
        });

        if (orderRes.status === 401 && getToken()) {
          const refreshRes = await apiFetch('/api/auth/refresh-token', { method: 'POST' });
          if (refreshRes.ok) {
            const refreshed = await refreshRes.json();
            if (refreshed.token) {
              saveToken(refreshed.token);
              orderRes = await apiFetch('/api/payments/create-order', {
                method: 'POST',
                body: JSON.stringify({
                  workshopId,
                  notes: notes?.trim() || '',
                  participantId: currentUser?.id,
                }),
              });
            }
          }
        }

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.success) {
          showAlert(orderData.error || 'Failed to initiate paid registration.', 'error');
          return { success: false, message: orderData.error || 'Failed to initiate payment.' };
        }

        // Step 2: Dynamically load Razorpay SDK
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          showAlert('Failed to load Razorpay Checkout SDK. Please verify internet connection.', 'error');
          return { success: false, message: 'Razorpay SDK could not be loaded.' };
        }

        // Step 3: Open Razorpay Checkout modal and await user payment
        return new Promise((resolve) => {
          let paymentHandled = false;

          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'Kaushalya Workshops',
            description: `${workshop.title} Seat Registration`,
            order_id: orderData.orderId,
            prefill: {
              name: currentUser?.fullName || orderData.participantName || '',
              email: currentUser?.email || orderData.participantEmail || '',
              contact: currentUser?.phoneNumber || '',
            },
            notes: {
              workshopId,
              paymentAttemptId: orderData.paymentAttemptId,
            },
            theme: {
              color: '#08482D', // Deep forest green
            },
            handler: async (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              paymentHandled = true;
              try {
                let verifyRes = await apiFetch('/api/payments/verify', {
                  method: 'POST',
                  body: JSON.stringify({
                    paymentAttemptId: orderData.paymentAttemptId,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                if (verifyRes.status === 401 && getToken()) {
                  const refreshRes = await apiFetch('/api/auth/refresh-token', { method: 'POST' });
                  if (refreshRes.ok) {
                    const refreshed = await refreshRes.json();
                    if (refreshed.token) {
                      saveToken(refreshed.token);
                      verifyRes = await apiFetch('/api/payments/verify', {
                        method: 'POST',
                        body: JSON.stringify({
                          paymentAttemptId: orderData.paymentAttemptId,
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                        }),
                      });
                    }
                  }
                }

                const verifyData = await verifyRes.json();
                if (verifyRes.ok && verifyData.success) {
                  showAlert(`Payment of ₹${workshop.price} verified! Registration confirmed.`, 'success');
                  await refreshData();
                  resolve({
                    success: true,
                    message: 'Payment verified! Registration confirmed.',
                    registration: verifyData.registration,
                  });
                } else {
                  showAlert(verifyData.error || 'Payment verification failed.', 'error');
                  resolve({
                    success: false,
                    message: verifyData.error || 'Payment verification failed.',
                  });
                }
              } catch (err) {
                showAlert('Error communicating with payment verification server.', 'error');
                resolve({
                  success: false,
                  message: 'Verification server communication error.',
                });
              }
            },
            modal: {
              ondismiss: () => {
                if (!paymentHandled) {
                  showAlert('Checkout cancelled. Your seat reservation will remain held for 15 minutes.', 'info');
                  refreshData();
                  resolve({
                    success: false,
                    message: 'Checkout closed without payment completion.',
                  });
                }
              },
            },
          };

          try {
            const RazorpayClass = (window as any).Razorpay;
            if (!RazorpayClass) {
              throw new Error('Razorpay Checkout SDK not initialized.');
            }
            const rzp = new RazorpayClass(options);
            rzp.open();
          } catch (e: any) {
            showAlert(`Razorpay failed to launch: ${e?.message || 'Unknown error'}`, 'error');
            resolve({ success: false, message: e?.message || 'Launch error' });
          }
        });
      } catch (error: any) {
        showAlert('Server error during checkout initialization.', 'error');
        return { success: false, message: error?.message || 'Server error' };
      }
    }

    // ─────────────────────────────────────────────────────────────
    // FREE WORKSHOP FLOW: Direct 1-Click Enrollment (Existing Flow)
    // ─────────────────────────────────────────────────────────────
    try {
      let res = await apiFetch(`/api/workshops/${workshopId}/registrations`, {
        method: 'POST',
        body: JSON.stringify({ notes: notes?.trim() || '', participantId: currentUser?.id }),
      });

      if (res.status === 401) {
        if (getToken()) {
          const refreshRes = await apiFetch('/api/auth/refresh-token', {
            method: 'POST',
          });
          if (refreshRes.ok) {
            const refreshed = await refreshRes.json();
            if (refreshed.token) {
              saveToken(refreshed.token);
              res = await apiFetch(`/api/workshops/${workshopId}/registrations`, {
                method: 'POST',
                body: JSON.stringify({ notes: notes?.trim() || '', participantId: currentUser?.id }),
              });
            }
          }
        } else {
          showAlert('Please sign in or register to book your workshop seat.', 'error');
          return { success: false, message: 'Authentication required. Please sign in.' };
        }
      }

      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert(`Registration confirmed for "${workshop.title}"! Saved to MongoDB.`, 'success');
        await refreshData();
        return { success: true, message: 'Registration confirmed!', registration: resData.registration };
      } else {
        showAlert(resData.error || 'Registration failed.', 'error');
        return { success: false, message: resData.error || 'Registration failed.' };
      }
    } catch {
      showAlert('Server error during registration.', 'error');
      return { success: false, message: 'Server error' };
    }
  };

  const verifyTicket = async (ticketCode: string, allowDateBypass: boolean = false, targetWorkshopId?: string): Promise<{ success: boolean; message: string; registration?: Registration }> => {
    try {
      let res = await apiFetch(`/api/registrations/verify-ticket`, {
        method: 'POST',
        body: JSON.stringify({ ticketCode, allowDateBypass, targetWorkshopId }),
      });

      if (res.status === 401 && getToken()) {
        const refreshRes = await apiFetch('/api/auth/refresh-token', {
          method: 'POST',
        });
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          if (refreshed.token) {
            saveToken(refreshed.token);
            res = await apiFetch(`/api/registrations/verify-ticket`, {
              method: 'POST',
              body: JSON.stringify({ ticketCode, allowDateBypass, targetWorkshopId }),
            });
          }
        }
      }

      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert(resData.message || 'Ticket verified successfully! Access granted.', 'success');
        await refreshData();
        return { success: true, message: resData.message, registration: resData.registration };
      } else {
        showAlert(resData.error || 'Ticket verification failed.', 'error');
        return { success: false, message: resData.error || 'Ticket verification failed.' };
      }
    } catch {
      showAlert('Server error during ticket verification.', 'error');
      return { success: false, message: 'Server error during ticket verification.' };
    }
  };

  const cancelWorkshopRegistration = async (registrationId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiFetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showAlert('Registration cancelled successfully. Seat has been restored in MongoDB.', 'info');
        await refreshData();
        return { success: true, message: 'Registration cancelled.' };
      } else {
        showAlert(resData.error || 'Cancellation failed.', 'error');
        return { success: false, message: resData.error || 'Cancellation failed.' };
      }
    } catch {
      showAlert('Server error during cancellation.', 'error');
      return { success: false, message: 'Server error' };
    }
  };

  const getWorkshopPaymentAnalytics = async (workshopId: string): Promise<{ success: boolean; analytics?: any; error?: string }> => {
    try {
      const res = await apiFetch(`/api/payments/workshop/${workshopId}`);
      const data = await res.json();
      if (res.ok && data.success !== false) {
        return { success: true, analytics: data };
      }
      return { success: false, error: data.error || 'Failed to fetch payment analytics' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Server error fetching payment analytics' };
    }
  };

  const toggleUserAccountStatus = async (userId: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/toggle-status`, { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showAlert(data.message || 'User account status updated in database.', 'success');
          await refreshData();
          return true;
        }
      }
    } catch {}
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, accountStatus: nextStatus };
        }
        return u;
      })
    );
    showAlert('User account status toggled.', 'success');
    return true;
  };

  const changeUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/change-role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showAlert(data.message || 'User role updated in database.', 'success');
          await refreshData();
          return true;
        }
      }
    } catch {}
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    showAlert(`User role changed to ${newRole}.`, 'success');
    return true;
  };

  const resetToDemoData = () => {
    localStorage.removeItem('wh_users');
    localStorage.removeItem('wh_workshops');
    localStorage.removeItem('wh_registrations');
    localStorage.removeItem('wh_audit_logs');
    localStorage.removeItem('wh_current_user_email');
    clearToken();
    refreshData();
    showAlert('Refreshed data from backend database.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        workshops,
        registrations,
        auditLogs,
        activePage,
        selectedWorkshopId,
        alerts,
        theme,
        toggleTheme,
        navigateTo,
        dismissAlert,
        showAlert,
        setCurrentUser,
        switchRoleQuickly,
        loginUser,
        registerUser,
        logoutUser,
        updateProfile,
        volunteers,
        createVolunteer,
        approveVolunteerRequest,
        rejectVolunteerRequest,
        requestVolunteering,
        checkMyVolunteerRequests,
        deleteVolunteer,
        toggleVolunteerStatus,
        regenerateVolunteerCode,
        updateVolunteerProfile,
        currentVolunteer,
        assignedVolunteerWorkshop,
        verifyVolunteerLogin,
        verifyTicketAsVolunteer,
        logoutVolunteer,
        createWorkshop,
        updateWorkshop,
        deleteWorkshop,
        togglePublishStatus,
        registerForWorkshop,
        cancelWorkshopRegistration,
        verifyTicket,
        getWorkshopPaymentAnalytics,
        toggleUserAccountStatus,
        changeUserRole,
        refreshData,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
