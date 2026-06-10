import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  User, 
  Check, 
  BarChart2, 
  Edit3, 
  Inbox, 
  LogOut, 
  LineChart, 
  Mail, 
  MailOpen, 
  Trash, 
  FileLock, 
  Users,
  ShieldAlert,
  Download,
  Menu,
  X,
  Globe,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Key,
  Shield
} from "lucide-react";
import { auth, googleProvider, signInWithPopup } from "../firebase";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};
import { 
  PortfolioData, 
  TeamMember, 
  ContactMessage, 
  AuditLog, 
  AnalyticsMetric, 
  UserRole 
} from "../types";
import AnalyticsPanel from "./AnalyticsPanel";
import AdminSettings from "./AdminSettings";

interface AdminDashboardProps {
  portfolioData: PortfolioData;
  onUpdatePortfolio: (data: PortfolioData) => void;
  team: TeamMember[];
  onUpdateTeam: (team: TeamMember[]) => void;
  messages: ContactMessage[];
  onUpdateMessages: (msgs: ContactMessage[]) => void;
  logs: AuditLog[];
  analytics: AnalyticsMetric[];
  currentUser: { name: string; role: UserRole; isRealFirebase?: boolean } | null;
  onLogin: (name: string, role: UserRole) => void;
  onLogout: () => void;
  onTriggerApiSync: (githubUser: string) => Promise<void>;
  onAddAuditLog: (action: string) => void;
  onNavigate: (view: string) => void;
}

export default function AdminDashboard({
  portfolioData,
  onUpdatePortfolio,
  team,
  onUpdateTeam,
  messages,
  onUpdateMessages,
  logs,
  analytics,
  currentUser,
  onLogin,
  onLogout,
  onTriggerApiSync,
  onAddAuditLog,
  onNavigate
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "settings" | "inbox" | "logs">("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCredentialManager, setShowCredentialManager] = useState(false);
  const [bulkEmailsText, setBulkEmailsText] = useState("");
  const [bulkRole, setBulkRole] = useState<UserRole>("Contributor");
  const [bulkMessage, setBulkMessage] = useState("");
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  
  // Login form inputs
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");

  const presets = {
    admin: { name: "Nischal KC", email: "12kcnischal@gmail.com", role: "Admin" as UserRole, code: "nischal" }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = presets.admin;
    if (passcode.toLowerCase() === target.code) {
       onLogin(target.name, target.role);
       onAddAuditLog(`Logged into admin session as '${target.name}'`);
       setPasscode("");
       setLoginError("");
    } else {
       setLoginError("Invalid authorization passcode.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        onAddAuditLog(`Google Authentication success: ${result.user.email}`);
      }
    } catch (e: any) {
      console.error("Google login error:", e);
      setLoginError(e?.message || "Google authentication failed. Check configuration or console.");
    }
  };

  const handleBulkInviteSeats = async () => {
    if (!bulkEmailsText.trim()) {
      setBulkMessage("Error: Please provide at least one email address.");
      return;
    }
    
    setIsBulkSaving(true);
    setBulkMessage("");
    
    const emails = bulkEmailsText
      .split(/[\n,]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 3 && e.includes("@"));
      
    if (emails.length === 0) {
      setBulkMessage("Error: No valid email addresses found.");
      setIsBulkSaving(false);
      return;
    }
    
    try {
      const existingEmails = new Set(team.map(m => m.email.toLowerCase()));
      const addedNames: string[] = [];
      const newTeam = [...team];
      
      emails.forEach((email) => {
        if (!existingEmails.has(email)) {
          const defaultName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          const newId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          
          newTeam.push({
            id: newId,
            name: defaultName,
            email,
            role: bulkRole,
            status: "Active",
            avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
            lastActive: "Pending Registration"
          });
          
          addedNames.push(`${defaultName} (${bulkRole})`);
        }
      });
      
      if (addedNames.length === 0) {
        setBulkMessage("All of the specified emails are already registered in team seats!");
      } else {
        await onUpdateTeam(newTeam);
        onAddAuditLog(`Bulk invited ${addedNames.length} new structural team seats: ${addedNames.join(", ")}`);
        setBulkEmailsText("");
        setBulkMessage(`Successfully registered ${addedNames.length} new team members!`);
      }
    } catch (err: any) {
      console.error("Bulk add members failed:", err);
      setBulkMessage("System Error: Failed to write members to database.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleToggleReadMessage = (id: string) => {
    const next = messages.map(m => {
      if (m.id === id) {
        return { ...m, read: !m.read };
      }
      return m;
    });
    onUpdateMessages(next);
  };

  const handleDeleteMessage = (id: string) => {
    const next = messages.filter(m => m.id !== id);
    onUpdateMessages(next);
    onAddAuditLog("Deleted a contact message in administrator inbox");
  };

  const handleExportProjectsBackup = () => {
    try {
      const projectsData = portfolioData.projects || [];
      const jsonStr = JSON.stringify(projectsData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `portfolio-projects-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onAddAuditLog(`Exported ${projectsData.length} projects for local JSON backup`);
    } catch (error) {
      console.error("Backup export failed:", error);
    }
  };

  // Render Login state if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 mesh-background">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px]" />
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 w-full max-w-lg bg-slate-900 border border-white/[0.08] rounded-2xl overflow-hidden p-6 sm:p-8 shadow-2xl"
        >
          <motion.div variants={itemVariants} className="text-center space-y-3 mb-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">Access Control Center</h2>
            <p className="text-xs text-gray-400">Unlock your personal dashboard with your administrator passcode.</p>
          </motion.div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">

            {/* Passcode input */}
            <motion.div variants={itemVariants} className="space-y-1.5 flex flex-col">
              <label className="text-[10px] text-gray-500 font-bold uppercase font-mono tracking-wider">
                Input Admin Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Passcode is: nischal"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/[0.08] focus:border-blue-500 rounded-xl text-white text-sm"
                  required
                />
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
              </div>
            </motion.div>

            {loginError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 font-medium font-sans flex items-center space-x-1"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{loginError}</span>
              </motion.p>
            )}

            <motion.button
              id="admin-login-submit"
              type="submit"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Verify Access Clearance</span>
            </motion.button>
          </form>

          {/* Real Google Authentication */}
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-white/[0.05]"></div>
            <span className="flex-shrink mx-4 text-[9px] text-gray-500 font-mono tracking-widest uppercase">OR ENABLE REAL BACKEND ACTIONS</span>
            <div className="flex-grow border-t border-white/[0.05]"></div>
          </div>

          <motion.button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleLogin}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold rounded-xl cursor-pointer transition-colors shadow-2xl border border-white/[0.08]"
          >
            <svg className="w-4 h-4 mr-1 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.61 0 3.09.55 4.23 1.64l3.15-3.15C17.43 1.68 14.9 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 7.04 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.43c-.28 1.44-1.09 2.66-2.31 3.48l3.6 2.8c2.1-1.94 3.77-5.18 3.77-8.39z"
              />
              <path
                fill="#FBBC05"
                d="M5.1 14.7c-.25-.75-.39-1.55-.39-2.7s.14-1.95.39-2.7L1.5 6.5C.54 8.42 0 10.51 0 12.7c0 2.19.54 4.28 1.5 6.2l3.6-2.7z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.95-1.07 7.93-2.91l-3.6-2.8c-1.2.82-2.73 1.3-4.33 1.3-3.22 0-5.99-2-6.91-5.26l-3.6 2.8C3.4 20.35 7.35 23 12 23z"
              />
            </svg>
            <span>Lock & Log in with Google</span>
          </motion.button>

          {/* Guidelines notes */}
          <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-white/[0.05] flex items-start space-x-2 text-[11px] text-gray-500">
            <FileLock className="w-4.5 h-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This sandbox deploys complete RBAC workflows. Switch presets above at any point to verify interface adaptive lock states for Creators, Admins, and Visitors.
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Logged-in State dashboard content
  const activeUnreadCount = messages.filter(m => !m.read).length;

  const handleExportLogsCSV = () => {
    const headers = "Log ID,User,Role,Action,Timestamp\n";
    const rows = logs.map(item => {
      const cleanId = (item.id || "").replace(/"/g, '""');
      const cleanUser = (item.user || "").replace(/"/g, '""');
      const cleanRole = (item.role || "").replace(/"/g, '""');
      const cleanAction = (item.action || "").replace(/"/g, '""');
      const cleanTime = (item.timestamp || "").replace(/"/g, '""');
      return `"${cleanId}","${cleanUser}","${cleanRole}","${cleanAction}","${cleanTime}"`;
    }).join("\n");
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.href = uri;
    link.setAttribute("download", `audit_logs_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR (Desktop permanent / collapsible) */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 border-r border-white/5 bg-slate-900 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}>
        {/* Sidebar Header / Branding */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 h-16">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
                <span className="font-bold text-white text-base">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-wider text-white font-mono">AIRFRAME</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">Management</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow">
              <span className="font-bold text-white text-base">A</span>
            </div>
          )}

          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors border-none cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand trigger */}
        {!sidebarOpen && (
          <div className="flex justify-center py-2.5 border-b border-white/5">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors border-none cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Session card info */}
        <div className="p-4 border-b border-white/5 bg-slate-950/20">
          <div className="flex items-center space-x-3">
            <img 
              src={portfolioData.hero.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150"}
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-white/15 object-cover"
            />
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/10 uppercase tracking-widest leading-none block w-fit mt-0.5">
                  {currentUser.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-grow py-4 overflow-y-auto space-y-6 px-3">
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2 font-mono">
                Management Deck
              </p>
            )}

            {[
              { id: "analytics", label: "Overview Metrics", icon: LineChart },
              { id: "settings", label: "Content Editor", icon: Settings },
              { id: "inbox", label: "Client Inquiries", icon: Inbox, badge: activeUnreadCount },
              { id: "logs", label: "Audit Trails", icon: History }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`airframe-sidebar-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border-none cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {sidebarOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 ml-auto">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-4 border-t border-white/5">
            {sidebarOpen && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2 font-mono">
                System Exit
              </p>
            )}

            <button
              onClick={() => onNavigate("hero")}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 border-none cursor-pointer transition-all"
              title="Return to guest application feed"
            >
              <Globe className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              {sidebarOpen && <span>View Guest Portal</span>}
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/10 border-none cursor-pointer transition-all"
              title="Terminate administrative session"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Sign Out Deck</span>}
            </button>
          </div>
        </div>

        {/* Sidebar Footer context */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/5 bg-slate-950/20 text-[9px] text-slate-500 font-mono flex flex-col space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser.isRealFirebase ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span>{currentUser.isRealFirebase ? "Live Cloud Mode" : "Local Sandbox"}</span>
            </div>
            <p>Airframe Platform v1.1.0</p>
          </div>
        )}
      </aside>

      {/* 2. SIDEBAR MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Sidebar content */}
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-white/5 h-full p-4 space-y-6"
            >
              {/* Header with Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="font-bold text-white text-base">A</span>
                  </div>
                  <span className="font-bold text-xs tracking-wider text-white font-mono">AIRFRAME</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Identity card */}
              <div className="p-3 bg-slate-950/40 rounded-xl flex items-center space-x-3">
                <img 
                  src={portfolioData.hero.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150"}
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-white/10 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest">{currentUser.role}</span>
                </div>
              </div>

              {/* Navigation links */}
              <div className="flex-grow space-y-1">
                {[
                  { id: "analytics", label: "Overview Metrics", icon: LineChart },
                  { id: "settings", label: "Content Editor", icon: Settings },
                  { id: "inbox", label: "Client Inquiries", icon: Inbox, badge: activeUnreadCount },
                  { id: "logs", label: "Audit Trails", icon: History }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
                        isActive 
                          ? "bg-indigo-600 text-white" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 ml-auto">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Session actions */}
              <div className="space-y-1 pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    onNavigate("hero");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white border-none cursor-pointer transition-all"
                >
                  <Globe className="w-4.5 h-4.5 text-emerald-400" />
                  <span>View Guest Portal</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-red-400 hover:text-white border-none cursor-pointer transition-all"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN WORKSPACE CONTENT HOST */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top bar Header area */}
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/5 h-16 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Hamburger Trigger for Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg border-none cursor-pointer flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-widest pl-0.5 leading-none mb-1">
                <span>System Root</span>
                <span>/</span>
                <span className="text-indigo-400 font-bold">{activeTab}</span>
              </div>
              <h1 className="text-sm font-bold text-white capitalize leading-tight">
                {activeTab === "analytics" && "Analytical Dashboard Overview"}
                {activeTab === "settings" && "Comprehensive Portfolio Editor"}
                {activeTab === "inbox" && "Inbound Client Enquiries Inbox"}
                {activeTab === "logs" && "Collaboration Audit logs"}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Logged in User Identification */}
            <div className="flex items-center space-x-2.5 bg-slate-950/40 border border-white/[0.05] rounded-xl px-3 py-1.5 shrink-0 select-none">
              <div className="relative">
                <img 
                  src={portfolioData.hero.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150"}
                  alt="Current Session"
                  referrerPolicy="no-referrer"
                  className="w-6.5 h-6.5 rounded-full object-cover border border-white/10"
                />
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-slate-900 bg-emerald-500" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[10px] font-bold text-white leading-tight font-sans tracking-wide truncate max-w-[85px]">{currentUser.name}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-[8px] font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/10 px-1 py-0.5 rounded leading-none uppercase tracking-wider">{currentUser.role}</span>
                </div>
              </div>
            </div>

            {/* Quick-access Credential Manager Button */}
            {currentUser.role === "Admin" && (
              <button
                onClick={() => setShowCredentialManager(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white hover:text-white rounded-lg border border-indigo-500/35 transition-all text-xs font-semibold font-mono cursor-pointer"
                title="Credential Manager Workspace: Easily add or update credentials for other administrators"
              >
                <Key className="w-3.5 h-3.5 text-indigo-200" />
                <span className="hidden lg:inline">Credential Manager</span>
              </button>
            )}

            {/* Status light */}
            <div className={`hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border text-[10px] uppercase font-mono font-bold tracking-wider ${
              currentUser.isRealFirebase 
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/25 text-amber-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser.isRealFirebase ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span>{currentUser.isRealFirebase ? "Cloud Live Sync Connection Online" : "Sandbox Identity Mode"}</span>
            </div>

            {/* Export DB Button */}
            <button
              onClick={handleExportProjectsBackup}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-950/20 hover:bg-blue-950/40 text-blue-400 hover:text-blue-300 rounded-lg border border-blue-500/20 transition-all text-xs font-semibold font-mono cursor-pointer"
              title="Download entire current project database structure as JSON backup file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Backup DB</span>
            </button>
          </div>
        </header>

        {/* Primary Page Canvas */}
        <main className="flex-grow p-6 space-y-6">
          
          {/* Informative Synchronizer Status bar */}
          {!currentUser.isRealFirebase && activeTab === "analytics" && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold uppercase tracking-wider block font-mono text-[9px]">Simulated Developer Sandbox Context</span>
                <p className="opacity-90 leading-relaxed">
                  You are exploring the dashboard as a local system architect. Any custom data saves will adjust simulated memory structures transiently. To save changes permanently into your cloud Firestore bucket, sign out and sign back in using a Google credential.
                </p>
              </div>
            </div>
          )}

          {/* Active Tab Frame Router */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "analytics" && (
                <AnalyticsPanel
                  analytics={analytics}
                  logs={logs}
                  team={team}
                />
              )}

              {activeTab === "settings" && (
                <AdminSettings
                  portfolioData={portfolioData}
                  onUpdatePortfolio={onUpdatePortfolio}
                  team={team}
                  onUpdateTeam={onUpdateTeam}
                  currentUserRole={currentUser.role}
                  currentUsername={currentUser.name}
                  onTriggerApiSync={onTriggerApiSync}
                  onAddAuditLog={onAddAuditLog}
                  onNavigate={onNavigate}
                />
              )}

              {activeTab === "inbox" && (
                <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6 space-y-6 shadow-md">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-display font-bold text-white text-base">Direct Client Contact Queries</h3>
                      <p className="text-xs text-slate-400">Review message submissions generated from the web portal.</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2.5 py-1 rounded-full">
                      Inbox count: <strong className="text-indigo-400">{messages.length}</strong>submissions
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-mono text-xs">
                      Inbox empty. No client queries received.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all ${
                            msg.read
                              ? "bg-slate-950/40 border-white/[0.04] opacity-75"
                              : "bg-slate-950 border-blue-500/20 shadow"
                          }`}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-white">{msg.name}</span>
                              <span className="text-xs text-gray-400 font-mono">({msg.email})</span>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <p className="text-xs font-semibold text-blue-400 font-mono">Subject: {msg.subject}</p>
                            <p className="text-sm text-slate-300 leading-relaxed font-sans pt-1">{msg.message}</p>
                          </div>

                          <div className="flex items-center space-x-2.5 self-end md:self-start">
                            <button
                              id={`msg-read-${msg.id}`}
                              onClick={() => handleToggleReadMessage(msg.id)}
                              className={`p-2 rounded-lg cursor-pointer transition-colors border-none ${
                                msg.read 
                                  ? "bg-slate-900 hover:bg-slate-800 text-gray-400" 
                                  : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400"
                              }`}
                              title={msg.read ? "Mark as Unread" : "Mark as Read"}
                            >
                              {msg.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                            </button>
                            <button
                              id={`msg-delete-${msg.id}`}
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-2 bg-red-950/20 hover:bg-red-950/45 text-red-400 rounded-lg cursor-pointer transition-all border-none"
                              title="Purge Message"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "logs" && (
                <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6 space-y-6 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-display font-bold text-white text-base">Collaboration Audit Log</h3>
                      <p className="text-xs text-slate-400">All structural system activities, database adjustments & clearance operations recorded.</p>
                    </div>
                    <button
                      onClick={handleExportLogsCSV}
                      className="inline-flex items-center space-x-1.5 py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all w-fit"
                      title="Export entire system trails feed to CSV"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Logs CSV</span>
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 bg-slate-950/80 border border-white/[0.04] rounded-xl space-y-2 hover:bg-slate-950 transition-colors text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white font-sans">{log.user}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold bg-slate-900 border border-white/[0.05] text-gray-400 uppercase tracking-wide">
                              {log.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans">{log.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 4. QUICK-ACCESS CREDENTIAL MANAGER MODAL */}
      <AnimatePresence>
        {showCredentialManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCredentialManager(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/[0.08] w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-white text-sm sm:text-base leading-tight">Credential & Seat Workspace</h3>
                    <p className="text-[10px] text-gray-400 leading-none mt-0.5">Invite, assign roles, and handle credentials of active administrators.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCredentialManager(false)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-left">
                {/* 1. SEATS BATCH INVITE FORM */}
                <div className="p-4 bg-slate-950 border border-white/[0.05] rounded-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-extrabold uppercase text-indigo-400">Batch Invite Multiple Seats</h4>
                      <p className="text-[10px] text-gray-500 leading-none">Enter comma-separated or newline-separated emails to register multiple collaborators.</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-300">
                      Multi-User Signup
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] text-gray-400 font-mono font-semibold uppercase">Email Addresses</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., mail1@nepal.np, mail2@company.global&#10;or separate by line breaks"
                      value={bulkEmailsText}
                      onChange={(e) => setBulkEmailsText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/[0.06] rounded-lg text-white font-mono text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 font-mono font-semibold uppercase">Designated Seat Role</label>
                      <select
                        value={bulkRole}
                        onChange={(e) => setBulkRole(e.target.value as UserRole)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white font-sans text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      >
                        <option value="Admin">Admin (Full Editing / Rules configuration)</option>
                        <option value="Contributor">Contributor (Editing bio, skills, and projects)</option>
                        <option value="Viewer">Viewer (Read-only observation access)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleBulkInviteSeats}
                        disabled={isBulkSaving}
                        className="w-full flex items-center justify-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-mono font-bold text-xs rounded-lg cursor-pointer transition-colors"
                      >
                        {isBulkSaving ? (
                          <span>Processing Seat Registrations...</span>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Confirm Batch Allocations</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {bulkMessage && (
                    <div className={`p-2 rounded text-[11px] font-mono ${
                      bulkMessage.includes("Error") 
                        ? "bg-red-500/10 border border-red-500/15 text-red-300" 
                        : "bg-emerald-500/10 border border-emerald-500/15 text-emerald-300"
                    }`}>
                      {bulkMessage}
                    </div>
                  )}
                </div>

                {/* 2. LIVE CREDENTIAL ROSTER */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400">Current Corporate Seating List</h4>
                    <span className="text-[10px] font-mono text-slate-500">Seat count: <strong>{team.length}</strong></span>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {team.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-950/40 border border-white/[0.04] rounded-xl hover:bg-slate-950/80 transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-white/5 object-cover"
                          />
                          <div className="text-left min-w-0">
                            <h5 className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-xs">{member.name}</h5>
                            <p className="text-[10px] text-gray-400 font-mono truncate max-w-[150px] sm:max-w-xs leading-none mt-0.5">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2.5">
                          {/* Role tag badge */}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider ${
                            member.role === "Admin" 
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10" 
                              : member.role === "Contributor" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {member.role}
                          </span>

                          <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">
                            {member.lastActive === "Invited" || member.lastActive === "Pending Registration" ? "Pending" : `Active`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-zinc-500 italic text-center font-sans">
                    * Need to modify details or remove active members? Head over to the <strong>Content Editor / Team Seats & Permissions</strong> subtab to access secure administrative overrides.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCredentialManager(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-white font-mono text-xs rounded-lg border-none cursor-pointer"
                >
                  Close Manager
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
