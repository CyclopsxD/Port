import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Menu, X, ShieldAlert, ArrowRight, UserCheck, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { UserRole, SystemSettings } from "../types";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: { name: string; role: UserRole } | null;
  onLogout: () => void;
  adminUnlocked?: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  versionLabel?: string;
  portfolioTitle?: string;
  settings?: SystemSettings;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

export default function Navbar({ currentView, onNavigate, currentUser, onLogout, adminUnlocked = false, theme, onToggleTheme, versionLabel, portfolioTitle, settings, language, onLanguageChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const logoLetter = (settings?.logoLetterOverride || portfolioTitle || "Nischal").trim().charAt(0).toUpperCase();
  const brandName = (settings?.logoTextOverride || portfolioTitle || "Nischal").trim().toUpperCase();
  const subLabelText = settings?.logoSubTextOverride || versionLabel || "v2.0.4 Admin";

  const cornerClass = settings?.cornerRadius === "full" 
    ? "rounded-full" 
    : settings?.cornerRadius === "none" 
    ? "rounded-none" 
    : "rounded-xl";

  const fromColor = settings?.logoGradientColorFrom || "#6366f1";
  const toColor = settings?.logoGradientColorTo || "#9333ea";

  const logoStyle = {
    background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
    boxShadow: settings?.logoGlowIntensity === "vibrant"
      ? `0 0 25px ${fromColor}99, 0 0 10.5px ${toColor}55`
      : settings?.logoGlowIntensity === "none"
      ? "none"
      : `0 0 15px ${fromColor}40`
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "projects", label: "Projects" },
    { id: "about", label: "Credentials" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <nav
      id="navbar-container"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#050508]/85 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg shadow-indigo-950/10" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            id="nav-logo"
            onClick={() => handleItemClick("hero")}
            className="flex items-center space-x-3 text-white border-none cursor-pointer focus:outline-none"
          >
            <div 
              style={logoStyle}
              className={`w-10 h-10 ${cornerClass} flex items-center justify-center`}
            >
              <span className="font-bold text-white text-xl">{logoLetter}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-tight text-white">{brandName}</span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`relative px-4.5 py-2 text-sm font-medium tracking-wide rounded-lg transition-colors cursor-pointer focus:outline-none ${
                  currentView === item.id
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {currentView === item.id && (
                  <motion.span
                    layoutId="active-desktop-pill"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.12)]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher Dropdown */}
            {onLanguageChange && (
              <div className="relative">
                <select
                  id="language-selector"
                  value={language || "en"}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="px-3.5 py-2.5 bg-white/5 hover:bg-indigo-500/10 active:scale-95 border border-white/5 hover:border-indigo-500/20 text-slate-350 hover:text-white rounded-xl transition-all duration-300 cursor-pointer text-xs font-semibold focus:outline-none appearance-none pr-7 pl-8 select-none"
                >
                  <option value="en" className="bg-[#0b0b14] text-white">EN</option>
                  <option value="es" className="bg-[#0b0b14] text-white">ES</option>
                  <option value="np" className="bg-[#0b0b14] text-white">NP (नेपाली)</option>
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-desktop"
              type="button"
              onClick={onToggleTheme}
              className="p-2.5 bg-white/5 hover:bg-indigo-500/10 active:scale-95 border border-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-white rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center shadow-inner"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-indigo-400 transition-colors" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1.5 pl-3">
                <UserCheck className="w-4 h-4 text-emerald-400 mr-2" />
                <div className="text-left leading-none mr-3">
                  <p className="text-xs text-white font-medium">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{currentUser.role}</p>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-300 bg-red-950/20 hover:bg-red-950/50 hover:text-red-300 rounded border border-red-500/20 cursor-pointer transition-colors"
                >
                  Logout
                </button>
                <button
                  id="nav-goto-dashboard"
                  onClick={() => onNavigate("admin")}
                  className={`ml-1.5 px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                    currentView === "admin"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  Admin Panel
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              id="theme-toggle-mobile"
              type="button"
              onClick={onToggleTheme}
              className="p-2 bg-white/5 hover:bg-indigo-500/10 active:scale-95 border border-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-white rounded-lg transition-all duration-250 cursor-pointer flex items-center justify-center placeholder:"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {currentUser && (
              <button
                id="mobile-nav-dashboard-badge"
                onClick={() => onNavigate("admin")}
                className="p-2 bg-slate-900 border border-white/[0.06] rounded-lg text-xs font-semibold text-emerald-400"
              >
                Admin
              </button>
            )}
            <button
              id="mobile-hamburger-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-900 border-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#050508]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`mobile-nav-item-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`block w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-colors border-none cursor-pointer ${
                    currentView === item.id
                      ? "text-indigo-400 bg-white/5 border border-white/5"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-4 border-t border-white/[0.06] flex flex-col space-y-3">
                {/* Mobile Language Switcher */}
                {onLanguageChange && (
                  <div className="px-4 py-1 flex items-center justify-between border-b border-white/[0.04] pb-4">
                    <span className="text-xs font-mono text-slate-400">Language / भाषा</span>
                    <div className="relative w-36">
                      <select
                        id="mobile-language-selector"
                        value={language || "en"}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-xs focus:outline-none appearance-none pl-8 cursor-pointer"
                      >
                        <option value="en" className="bg-[#0b0b14]">English (EN)</option>
                        <option value="es" className="bg-[#0b0b14]">Español (ES)</option>
                        <option value="np" className="bg-[#0b0b14]">नेपाली (NP)</option>
                      </select>
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400 pointer-events-none" />
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                )}

                {currentUser ? (
                  <div className="space-y-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                        {currentUser.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{currentUser.name}</p>
                        <p className="text-xs text-slate-400">{currentUser.role}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        id="mobile-nav-to-admin"
                        onClick={() => handleItemClick("admin")}
                        className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-500 hover:text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer border-none shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      >
                        Dashboard
                      </button>
                      <button
                        id="mobile-nav-logout"
                        onClick={() => {
                          onLogout();
                          setIsOpen(false);
                        }}
                        className="px-3 py-2 bg-red-950/30 text-red-400 hover:bg-red-900/40 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-red-500/20"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
