import React, { useState } from "react";
import { 
  ShieldAlert, 
  Terminal, 
  KeyRound, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  auth, 
  db, 
  signOut,
  googleProvider,
  signInWithPopup
} from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { TeamMember } from "../types";

interface AdminLoginProps {
  onUnlockPasscode: (passcode: string) => void;
  onGoogleLoginSuccess: (user: any) => void;
  onGoBack: () => void;
}

export default function AdminLogin({ onUnlockPasscode, onGoogleLoginSuccess, onGoBack }: AdminLoginProps) {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBypassOptions, setShowBypassOptions] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    setShowBypassOptions(false);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userEmail = result.user.email?.toLowerCase() || "";
        const userUid = result.user.uid;
        const displayName = result.user.displayName || "Google Admin";

        if (userEmail !== "12kcnischal@gmail.com") {
          await signOut(auth);
          setIsError(true);
          setErrorMessage("Access Blocked: Only the supreme administrator account (12kcnischal@gmail.com) is authorized on this system.");
          setIsLoading(false);
          return;
        }

        // Register/update this Google user as the single Admin
        const adminProfile: TeamMember = {
          id: userUid,
          name: displayName,
          email: userEmail,
          role: "Admin",
          status: "Active",
          avatarUrl: result.user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          lastActive: new Date().toLocaleDateString()
        };

        await setDoc(doc(db, "team", userUid), adminProfile);
        
        setIsSuccess(true);
        setTimeout(() => {
          onGoogleLoginSuccess(result.user);
          setIsLoading(false);
        }, 800);
      }
    } catch (err: any) {
      console.error("Google Auth execution failure:", err);
      setIsError(true);
      if (err?.code === "auth/operation-not-allowed") {
        setErrorMessage("Google Verification Blocked: Authentication is disabled on this database.");
        setShowBypassOptions(true);
      } else {
        setErrorMessage("Google Verification Error: " + (err?.message || "Check settings and try again."));
      }
      setIsLoading(false);
    }
  };

  const handleLocalBypass = () => {
    setIsLoading(true);
    setIsSuccess(true);
    setIsError(false);
    setTimeout(() => {
      onUnlockPasscode("nischal");
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050510] relative overflow-hidden flex items-center justify-center p-4">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-650/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Frame Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="w-full max-w-md relative z-10 bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Header decoration */}
        <div className="flex items-center justify-between text-slate-500 font-mono text-[9px] uppercase border-b border-white/[0.05] pb-4 tracking-wider">
          <span className="flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>ADMINISTRATIVE PORTAL v3.0</span>
          </span>
          <span className="text-indigo-400 font-bold font-mono">SECURE GATEWAY</span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-3.5 my-2">
          <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-xl text-white tracking-tight">
              {isSuccess 
                ? "ACCESS APPROVED" 
                : "GOOGLE AUTHENTICATION"}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {isSuccess 
                ? "Administrative authentication verified. Opening environmental console..."
                : "Standard email registration has been disabled. Use Google credentials to unlock access."}
            </p>
          </div>
        </div>

        {/* Main interactive state alerts */}
        {isError && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start space-x-2.5 text-xs text-red-300 animate-shake"
          >
            <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-0.5 text-left">
              <span className="font-bold font-mono text-[9px] uppercase tracking-wider block">Verification Error</span>
              <p className="opacity-90 leading-relaxed text-[11px]">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Context Content Form */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="auth-success-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6 animate-pulse" />
              </div>
              <p className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest animate-pulse">
                Synchronizing Secure Keys...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Form Content */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full py-4 px-4 bg-white hover:bg-slate-100 disabled:bg-slate-300 text-slate-900 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer border-none flex items-center justify-center space-x-3 shadow-lg hover:shadow-white/5 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Transmitting Security codes...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>

                {showBypassOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-slate-950/80 border border-indigo-500/15 rounded-xl space-y-2 mt-2"
                  >
                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                      <strong>OAuth Config Fallback:</strong> Local bypass allows structural debugging if live authentication is blockaded:
                    </p>
                    <button
                      type="button"
                      onClick={handleLocalBypass}
                      className="w-full py-2 bg-indigo-600/50 border border-indigo-500/20 hover:bg-indigo-600 text-white font-mono text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-all active:scale-[0.99]"
                    >
                      Bypass Blockade (Simulate Local Superadmin)
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back option */}
        <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-gray-400 font-mono">
          <button
            id="restricted-go-back-btn"
            onClick={onGoBack}
            className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none text-xs text-left"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Return Portfolio</span>
          </button>
          <span className="text-[9px] uppercase tracking-wider bg-slate-950 px-2.5 py-1 rounded-full border border-white/5 font-mono text-slate-500">
            Secure Gateway
          </span>
        </div>
      </motion.div>
    </div>
  );
}
