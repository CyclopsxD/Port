import React, { useState, useEffect } from "react";
import { 
  getStoredData, 
  savePortfolioData, 
  saveTeamMembers, 
  saveMessages, 
  addContactMessage,
  trackPageView, 
  trackProjectClick, 
  trackContactSubmission, 
  addAuditLog, 
  syncGitHubProjects 
} from "./utils/storage";
import { 
  PortfolioData, 
  TeamMember, 
  ContactMessage, 
  AuditLog, 
  AnalyticsMetric, 
  UserRole,
  PortfolioProject,
  PortfolioSkill,
  TimelineEvent,
  PortfolioHero,
  PortfolioAbout,
  SystemSettings
} from "./types";
import { auth, onAuthStateChanged, signOut, db } from "./firebase";
import { doc, getDoc, onSnapshot, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import ProjectCard from "./components/ProjectCard";
import ProjectSkeleton from "./components/ProjectSkeleton";
import Contact from "./components/Contact";
import SortDropdown, { SortOption } from "./components/SortDropdown";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import { ScrollProgressIndicator3D, BackgroundCosmicParticles } from "./components/AmbientElements";
import { motion, AnimatePresence, useScroll, useSpring, LayoutGroup } from "motion/react";
import { Eye, Terminal, Sparkles, AlertCircle, LayoutGrid, List } from "lucide-react";

const applyLocalOverrides = (baseData: PortfolioData): PortfolioData => {
  const stored = localStorage.getItem("nischal_portfolio_override");
  if (!stored) return baseData;
  try {
    const parsed = JSON.parse(stored);
    return {
      ...baseData,
      hero: parsed.hero ? { ...baseData.hero, ...parsed.hero } : baseData.hero,
      about: parsed.about ? { ...baseData.about, ...parsed.about } : baseData.about,
      settings: parsed.settings ? { ...baseData.settings, ...parsed.settings } : baseData.settings,
      projects: parsed.projects && parsed.projects.length ? parsed.projects : baseData.projects,
      skills: parsed.skills && parsed.skills.length ? parsed.skills : baseData.skills,
      timeline: parsed.timeline && parsed.timeline.length ? parsed.timeline : baseData.timeline
    };
  } catch (e) {
    console.error("Local overrides merge failure", e);
    return baseData;
  }
};

const translatePortfolio = (data: PortfolioData, lang: string): PortfolioData => {
  if (lang === "en") return data;
  
  if (lang === "es") {
    return {
      ...data,
      hero: {
        ...data.hero,
        title: "Nischal KC",
        subtitle: "Arquitecto de Sistemas & Solucionador de Cuellos de Botella de Software",
        description: "Diseño sistemas distribuidos robustos, audito infraestructuras en la nube y optimizo el rendimiento de bases de datos críticas para empresas tecnológicas globales con eficiencia óptima de SLA.",
        ctaText: "Explorar Credenciales"
      },
      about: {
        ...data.about,
        title: "Sobre Mí",
        content: "Soy un aficionado a la computación en la nube y desarrollador full-stack originario de Nepal. Me especializo en desmantelar sistemas monolíticos complejos para convertirlos en microservicios limpios y escalables con tolerancia a fallas excepcional.",
        yearsOfExperience: data.about.yearsOfExperience,
        highlightStats: [
          { value: "5+", label: "Años Optimizando" },
          { value: "40M+", label: "Consultas Optimizadas" },
          { value: "99.9%", label: "Eficiencia de SLA" }
        ]
      }
    };
  }

  if (lang === "np") {
    return {
      ...data,
      hero: {
        ...data.hero,
        title: "निश्चल केसी",
        subtitle: "प्रणाली वास्तुकार र सफ्टवेयर सोलुसन विशेषज्ञ",
        description: "म बलियो वितरण प्रणालीहरू डिजाइन गर्छु, क्लाउड पूर्वाधारहरूको अडिट गर्छु र विश्वव्यापी प्राविधिक उद्यमहरूको लागि महत्त्वपूर्ण डाटाबेस प्रदर्शन अनुकूलन गर्छु।",
        ctaText: "योग्यता हेर्नुहोस्"
      },
      about: {
        ...data.about,
        title: "मेरो बारेमा",
        content: "म नेपालबाट आएको क्लाउड कम्प्युटिङ र फुल-स्ट्याक सफ्टवेयर इन्जिनियर हुँ। म जटिल सफ्टवेयर प्रणालीहरूलाई व्यवस्थित क्लाउड पूर्वाधारमा रूपान्तरण गर्न र डाटाबेस ट्युनिङ गर्न विशेषज्ञता राख्छु।",
        yearsOfExperience: data.about.yearsOfExperience,
        highlightStats: [
          { value: "५+", label: "वर्षको अनुभव" },
          { value: "४०M+", label: "सफल कोक्वेरी" },
          { value: "९९.९%", label: "विश्वसनीयता" }
        ]
      }
    };
  }

  return data;
};

const categoryVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 14,
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -20,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

const projectCardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 13
    }
  }
};

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [currentView, setCurrentView] = useState<string>("hero"); // hero, projects, about, skills, contact, admin
  
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem("nischal_admin_unlocked") === "true";
  });

  // Check URL prefix, Query parameters, or Hash for private sector key & backdoor paths
  useEffect(() => {
    const checkUrlAccess = () => {
      const href = window.location.href.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      
      const isBackdoor = 
        path === "/admin" ||
        path === "/admin/" ||
        path.endsWith("/admin") ||
        path.endsWith("/admin/") ||
        hash === "#admin" ||
        hash === "#/admin" ||
        hash.endsWith("/admin") ||
        hash.endsWith("/admin/") ||
        href.includes("nischal/admin") || 
        href.includes("nischal-admin") ||
        href.includes("?admin=true");

      if (isBackdoor) {
        if (href.includes("nischal/admin") || href.includes("nischal-admin")) {
          setAdminUnlocked(true);
          localStorage.setItem("nischal_admin_unlocked", "true");
        }
        setCurrentView("admin");
      }
    };

    checkUrlAccess();
    window.addEventListener("hashchange", checkUrlAccess);
    window.addEventListener("popstate", checkUrlAccess);
    return () => {
      window.removeEventListener("hashchange", checkUrlAccess);
      window.removeEventListener("popstate", checkUrlAccess);
    };
  }, []);

  // Backend Simulated States
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("nischal_portfolio_language") || "en";
  });

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("nischal_portfolio_language", lang);
  };
  
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsMetric[]>([]);
  
  // Authentication states
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole } | null>(null);
  const [selectedProjCategory, setSelectedProjCategory] = useState<string>("All");
  const [galleryLayout, setGalleryLayout] = useState<"grid" | "list">("grid");
  const [projectSortOption, setProjectSortOption] = useState<SortOption>("Popular");

  const isScrollingRef = React.useRef(false);

  const [isFiltering, setIsFiltering] = useState(false);

  // Trigger brief simulation loading state with high-fidelity skeletons
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [selectedProjCategory, projectSortOption]);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("nischal_portfolio_theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("nischal_portfolio_theme", theme);
  }, [theme]);

  const [systemStatus, setSystemStatus] = useState<{
    nodeUptime: number;
    serviceState: string;
    activeCluster: string;
    databaseSync: string;
    firewallShield: string;
    latencyRating: string;
    version: string;
  } | null>(null);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch("/api/system-status");
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
        }
      } catch (err) {
        console.warn("Could not query backend system status:", err);
      }
    };
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update browser tab title dynamically based on portfolio metadata
  useEffect(() => {
    if (portfolio?.hero?.title) {
      document.title = `${portfolio.hero.title} | Portfolio`;
    } else if (portfolio?.settings?.logoTextOverride) {
      document.title = `${portfolio.settings.logoTextOverride} | Portfolio`;
    } else {
      document.title = "Nischal KC | Creative Portfolio";
    }
  }, [portfolio]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // On-the-fly Custom Core Theme Color + Google Web Typography Injection
  useEffect(() => {
    if (!portfolio || !portfolio.settings) return;
    const settings = portfolio.settings;
    
    // 1. Load Custom Web Font via Google Fonts link
    const fontId = "dynamic-google-fonts-link";
    let linkEl = document.getElementById(fontId) as HTMLLinkElement;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.id = fontId;
      linkEl.rel = "stylesheet";
      document.head.appendChild(linkEl);
    }
    linkEl.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(settings.fontFamily)}:wght@300;400;500;600;700;800&display=swap`;

    // 2. Inject CSS Custom properties with high-contrast color modifiers
    const styleId = "dynamic-customization-style-tag";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const radiusMap = {
      none: "0px",
      medium: "12px",
      full: "9999px"
    };

    styleEl.innerHTML = `
      :root {
        --cms-primary-color: ${settings.primaryColor};
        --cms-secondary-color: ${settings.secondaryColor};
        --cms-bg-color: ${settings.backgroundColor};
        --cms-text-color: ${settings.textColor};
        --cms-font: "${settings.fontFamily}", "Inter", sans-serif;
        --cms-radius: ${radiusMap[settings.cornerRadius] || "12px"};
      }

      body {
        font-family: var(--cms-font) !important;
        background-color: var(--cms-bg-color) !important;
        color: var(--cms-text-color) !important;
      }

      .font-sans, .font-display, section, button, input, textarea, select {
        font-family: var(--cms-font) !important;
      }

      /* Dynamic custom-card-glass effect */
      .custom-card-glass {
        background-color: ${
          settings.cardGlassEffect === "translucent" ? "rgba(255, 255, 255, 0.02)" :
          settings.cardGlassEffect === "deep-solid" ? "#0d0d12" :
          "rgba(255, 255, 255, 0.04)"
        } !important;
        backdrop-filter: ${settings.cardGlassEffect === "deep-solid" ? "none" : "blur(18px)"} !important;
      }

      /* Dynamic custom-card-border strength */
      .custom-card-border {
        border-width: ${settings.cardBorderStrength === "none" ? "0px" : "1px"} !important;
        border-color: ${
          settings.cardBorderStrength === "subtle" ? "rgba(255, 255, 255, 0.03)" :
          "rgba(255, 255, 255, 0.09)"
        } !important;
      }

      /* Dynamic custom-card-glow shadow effects */
      .custom-card-glow {
        box-shadow: ${
          settings.cardShadowGlow === "cosmic-purple" ? `0 10px 30px -10px ${settings.secondaryColor}30, 0 0 15px 1px ${settings.secondaryColor}15` :
          settings.cardShadowGlow === "soft-indigo" ? `0 10px 30px -10px ${settings.primaryColor}22, 0 0 12px 1px ${settings.primaryColor}0c` :
          "none"
        } !important;
      }

      /* Dynamically override Tailwind theme colors on-the-fly */
      .text-indigo-400, .light .text-indigo-400, .text-indigo-300, .light .text-indigo-300 {
        color: var(--cms-primary-color) !important;
      }
      .bg-indigo-600, .light .bg-indigo-600, .bg-indigo-500, .light .bg-indigo-500 {
        background-color: var(--cms-primary-color) !important;
      }
      .border-indigo-500, .light .border-indigo-500, .border-indigo-600 {
        border-color: var(--cms-primary-color) !important;
      }

      .bg-indigo-600\\/10, .bg-indigo-500\\/10 {
        background-color: ${settings.primaryColor}1a !important;
      }
      .bg-indigo-600\\/20, .bg-indigo-500\\/20, .hover\\:bg-indigo-500\\/10:hover {
        background-color: ${settings.primaryColor}33 !important;
      }

      /* Secondary theme highlights mapping */
      .text-purple-400, .light .text-purple-400, .text-purple-300 {
        color: var(--cms-secondary-color) !important;
      }
      .bg-purple-600, .light .bg-purple-600, .bg-purple-500 {
        background-color: var(--cms-secondary-color) !important;
      }
      .border-purple-500, .border-purple-600 {
        border-color: var(--cms-secondary-color) !important;
      }

      /* Corner radius dynamics */
      .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-lg, .rounded-md {
        border-radius: var(--cms-radius) !important;
      }

      /* Mesh background tint based on color selection */
      .mesh-background {
        background-color: var(--cms-bg-color) !important;
        background-image: 
          radial-gradient(circle at 50% 0%, ${settings.primaryColor}29 0%, transparent 50%),
          radial-gradient(circle at 0% 100%, ${settings.secondaryColor}1c 0%, transparent 40%),
          radial-gradient(circle at 100% 50%, ${settings.primaryColor}16 0%, transparent 45%),
          radial-gradient(circle at 10% 30%, ${settings.secondaryColor}0f 0%, transparent 35%) !important;
        background-attachment: fixed !important;
      }
    `;
  }, [portfolio]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    
    if (view === "admin") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const elementMap: Record<string, string> = {
      hero: "hero-section",
      projects: "portfolio-gallery",
      about: "about-section",
      skills: "skills-section",
      contact: "contact-section"
    };

    const targetId = elementMap[view];
    if (targetId) {
      isScrollingRef.current = true;
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // Unlock observer after scroll animation finishes
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 1200);
      }, 50);
    }
  };

  // Scroll Spy to highlight the correct navbar item based on scroll position
  useEffect(() => {
    if (currentView === "admin") return;

    const handleScrollSpy = () => {
      if (isScrollingRef.current) return;

      const sections = ["hero-section", "portfolio-gallery", "about-section", "skills-section", "contact-section"];
      const viewMap: Record<string, string> = {
        "hero-section": "hero",
        "portfolio-gallery": "projects",
        "about-section": "about",
        "skills-section": "skills",
        "contact-section": "contact"
      };

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let currentActive = "hero";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentActive = viewMap[id];
            break;
          }
        }
      }

      // Check if we reached near the bottom of the page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        currentActive = "contact";
      } else if (window.scrollY < 80) {
        currentActive = "hero";
      }

      setCurrentView((prev) => {
        if (prev !== "admin" && prev !== currentActive) {
          return currentActive;
        }
        return prev;
      });
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    window.addEventListener("resize", handleScrollSpy);

    // Initial delay check to let element heights settle
    const timer = setTimeout(handleScrollSpy, 300);

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
      window.removeEventListener("resize", handleScrollSpy);
      clearTimeout(timer);
    };
  }, [portfolio]);

  // Real Firebase Authentication Listener with Single Administrator Auth Blockade (12kcnischal@gmail.com)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const allowedEmail = "12kcnischal@gmail.com";
          if (fbUser.email?.toLowerCase() === allowedEmail) {
            // Register or update this administrator profile in the team Firestore collection
            const adminProfile: TeamMember = {
              id: fbUser.uid,
              name: fbUser.displayName || "Nischal KC",
              email: allowedEmail,
              role: "Admin",
              status: "Active",
              avatarUrl: fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
              lastActive: new Date().toLocaleDateString()
            };

            await setDoc(doc(db, "team", fbUser.uid), adminProfile);

            setCurrentUser({
              name: adminProfile.name,
              role: "Admin",
              email: adminProfile.email,
              isRealFirebase: true,
              isSuperadmin: true
            } as any);
            setAdminUnlocked(true);
            localStorage.setItem("nischal_admin_unlocked", "true");
          } else {
            // Access blocked for any other identity
            console.warn("Unapproved account attempt blocked:", fbUser.email);
            alert("Access Blocked: Your account is not registered as an authorized administrator on this console.");
            await signOut(auth);
            setCurrentUser(null);
            setAdminUnlocked(false);
            localStorage.setItem("nischal_admin_unlocked", "false");
          }
        } catch (error) {
          console.error("Authentication verification handshake error:", error);
          await signOut(auth);
          setCurrentUser(null);
          setAdminUnlocked(false);
        }
      } else {
        setCurrentUser((current) => {
          if (current && (current as any).isRealFirebase) {
            return null;
          }
          return current;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Load Data on Boot and subscribe to live Firestore updates
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await getStoredData();
        setPortfolio(applyLocalOverrides(data.portfolio));
        setTeam(data.team);
        setMessages(data.messages);
        setLogs(data.logs);
        setAnalytics(data.analytics);

        // Track an organic home page view hits
        await trackPageView();
        
        // Refresh chart datasets
        const refreshedData = await getStoredData();
        setAnalytics(refreshedData.analytics);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };
    loadInitialData();

    // Set up active onSnapshot subscriptions for public portfolio files (robustly preserving simulated guest overrides)
    const unsubHero = onSnapshot(doc(db, "portfolio", "hero"), (snap) => {
      if (snap.exists()) {
        const heroData = snap.data() as PortfolioHero;
        setPortfolio(prev => {
          const fresh = prev ? { ...prev, hero: heroData } : { hero: heroData } as PortfolioData;
          return applyLocalOverrides(fresh);
        });
      }
    }, (error) => {
      console.error("onSnapshot subscription error for hero:", error);
    });

    const unsubAbout = onSnapshot(doc(db, "portfolio", "about"), (snap) => {
      if (snap.exists()) {
        const aboutData = snap.data() as PortfolioAbout;
        setPortfolio(prev => {
          const fresh = prev ? { ...prev, about: aboutData } : { about: aboutData } as PortfolioData;
          return applyLocalOverrides(fresh);
        });
      }
    }, (error) => {
      console.error("onSnapshot subscription error for about:", error);
    });

    const unsubSettings = onSnapshot(doc(db, "portfolio", "settings"), (snap) => {
      if (snap.exists()) {
        const settingsData = snap.data() as SystemSettings;
        setPortfolio(prev => {
          const fresh = prev ? { ...prev, settings: settingsData } : { settings: settingsData } as PortfolioData;
          return applyLocalOverrides(fresh);
        });
      }
    }, (error) => {
      console.error("onSnapshot subscription error for settings:", error);
    });

    const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
      const projectsList: PortfolioProject[] = [];
      snap.forEach((d) => {
        projectsList.push(d.data() as PortfolioProject);
      });
      setPortfolio(prev => {
        const fresh = prev ? { ...prev, projects: projectsList } : { projects: projectsList } as PortfolioData;
        return applyLocalOverrides(fresh);
      });
    }, (error) => {
      console.error("onSnapshot subscription error for projects:", error);
    });

    const unsubSkills = onSnapshot(collection(db, "skills"), (snap) => {
      const skillsList: PortfolioSkill[] = [];
      snap.forEach((d) => {
        skillsList.push(d.data() as PortfolioSkill);
      });
      setPortfolio(prev => {
        const fresh = prev ? { ...prev, skills: skillsList } : { skills: skillsList } as PortfolioData;
        return applyLocalOverrides(fresh);
      });
    }, (error) => {
      console.error("onSnapshot subscription error for skills:", error);
    });

    const unsubTimeline = onSnapshot(collection(db, "timeline"), (snap) => {
      const timelineList: TimelineEvent[] = [];
      snap.forEach((d) => {
        timelineList.push(d.data() as TimelineEvent);
      });
      setPortfolio(prev => {
        const fresh = prev ? { ...prev, timeline: timelineList } : { timeline: timelineList } as PortfolioData;
        return applyLocalOverrides(fresh);
      });
    }, (error) => {
      console.error("onSnapshot subscription error for timeline:", error);
    });

    return () => {
      unsubHero();
      unsubAbout();
      unsubSettings();
      unsubProjects();
      unsubSkills();
      unsubTimeline();
    };
  }, []);

  // Set up administrative subscriptions only if a real Firebase admin session is authenticated
  useEffect(() => {
    if (!currentUser || !auth.currentUser) {
      return;
    }

    const unsubTeam = onSnapshot(collection(db, "team"), (snap) => {
      const teamList: TeamMember[] = [];
      snap.forEach((d) => {
        const item = d.data() as TeamMember;
        teamList.push(item);
      });
      setTeam(teamList);
    }, (error) => {
      console.error("onSnapshot subscription error for team:", error);
    });

    let unsubMessages = () => {};
    let unsubLogs = () => {};
    let unsubAnalytics = () => {};

    if (currentUser.role === "Admin") {
      unsubMessages = onSnapshot(collection(db, "messages"), (snap) => {
        const messagesList: ContactMessage[] = [];
        snap.forEach((d) => {
          messagesList.push(d.data() as ContactMessage);
        });
        messagesList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setMessages(messagesList);
      }, (error) => {
        console.error("onSnapshot subscription error for messages:", error);
      });

      unsubLogs = onSnapshot(collection(db, "logs"), (snap) => {
        const logsList: AuditLog[] = [];
        snap.forEach((d) => {
          logsList.push(d.data() as AuditLog);
        });
        logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(logsList);
      }, (error) => {
        console.error("onSnapshot subscription error for logs:", error);
      });

      unsubAnalytics = onSnapshot(collection(db, "analytics"), (snap) => {
        const analyticsList: AnalyticsMetric[] = [];
        snap.forEach((d) => {
          analyticsList.push(d.data() as AnalyticsMetric);
        });
        analyticsList.sort((a, b) => a.date.localeCompare(b.date));
        setAnalytics(analyticsList);
      }, (error) => {
        console.error("onSnapshot subscription error for analytics:", error);
      });
    }

    return () => {
      unsubTeam();
      unsubMessages();
      unsubLogs();
      unsubAnalytics();
    };
  }, [currentUser]);

  // Sync state helpers
  const handleUpdatePortfolio = async (updated: PortfolioData) => {
    setPortfolio(updated);
    if (currentUser) {
      await savePortfolioData(updated, currentUser.name, currentUser.role);
    } else {
      await savePortfolioData(updated, "Visitor", "Viewer");
    }
    // Refresh statistics logs
    const ref = await getStoredData();
    setLogs(ref.logs);
  };

  const handleUpdateTeam = async (updatedTeam: TeamMember[]) => {
    setTeam(updatedTeam);
    await saveTeamMembers(updatedTeam);
  };

  const handleUpdateMessages = async (updatedMsgs: ContactMessage[]) => {
    setMessages(updatedMsgs);
    await saveMessages(updatedMsgs);
  };

  const handleSendMessage = async (msgPayload: Omit<ContactMessage, "id" | "timestamp" | "read">) => {
    const newMessage: ContactMessage = {
      ...msgPayload,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    const next = [newMessage, ...messages];
    setMessages(next);
    await addContactMessage(newMessage);

    // Bump database traffic tracking
    await trackContactSubmission();
    
    // Publish log
    await handleAddAuditLog(`Visitor '${newMessage.name}' submitted a contact message`);
    
    // Refresh state trackers
    const ref = await getStoredData();
    setAnalytics(ref.analytics);
    setLogs(ref.logs);
  };

  const handleAddAuditLog = async (action: string) => {
    const userString = currentUser ? currentUser.name : "System Daemon";
    const roleString = currentUser ? currentUser.role : "Viewer";
    await addAuditLog(userString, roleString, action);
    
    const ref = await getStoredData();
    setLogs(ref.logs);
  };

  const handleTrackProjectClick = async (projectId: string) => {
    await trackProjectClick(projectId);
    
    // Keep list clicksCount synced in state
    const ref = await getStoredData();
    setPortfolio(ref.portfolio);
    setAnalytics(ref.analytics);
  };

  const handleTriggerApiSync = async (githubUser: string) => {
    if (!portfolio) return;
    const syncedRepos = await syncGitHubProjects(githubUser);
    
    // Merge or append synced projects
    // To maintain brand consistency, we place github repos alongside the manual projects
    const filteredOriginal = portfolio.projects.filter(p => !p.id.startsWith("gh_"));
    const merged = [...syncedRepos, ...filteredOriginal];
    
    const updated = {
      ...portfolio,
      projects: merged
    };

    setPortfolio(updated);
    await savePortfolioData(updated, currentUser?.name || "System Synchronizer", currentUser?.role || "Contributor");
    await handleAddAuditLog(`Automated REST sync compiled ${syncedRepos.length} projects for GitHub user: @${githubUser}`);
    
    const ref = await getStoredData();
    setLogs(ref.logs);
  };

  const handleLogin = (name: string, role: UserRole) => {
    setCurrentUser({ name, role });
  };

  const handleLogout = async () => {
    if (currentUser) {
       await handleAddAuditLog(`Logged out of dashboard admin session`);
    }
    await signOut(auth);
    setAdminUnlocked(false);
    localStorage.setItem("nischal_admin_unlocked", "false");
    setCurrentUser(null);
    handleNavigate("hero");
  };

  // Safe Guard loading
  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508] font-mono text-xs">
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-500">Loading Portfolio Content Workspace...</p>
        </div>
      </div>
    );
  }

  // Filter Categories for Portfolio View and Apply Selected Order Index
  const sortProjects = (projectsList: PortfolioProject[]) => {
    const list = [...projectsList];
    if (projectSortOption === "Popular") {
      return list.sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0));
    }
    if (projectSortOption === "Newest") {
      return list.sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.id.replace(/\D/g, "")) || 0;
        if (numA !== numB) return numB - numA;
        return b.id.localeCompare(a.id);
      });
    }
    if (projectSortOption === "Alphabetical") {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  };

  const displayedPortfolio = translatePortfolio(portfolio, language);

  const pWeb = sortProjects(displayedPortfolio.projects.filter(p => p.category === "Web"));
  const pMobile = sortProjects(displayedPortfolio.projects.filter(p => p.category === "Mobile"));
  const pUtil = sortProjects(displayedPortfolio.projects.filter(p => p.category === "Utility"));

  return (
    <div className="relative min-h-screen mesh-background selection:bg-indigo-500/30 selection:text-white overflow-x-hidden font-sans transition-colors duration-300">
      {/* Immersive Cosmic Aurora Ambient Orbs (inspired by modern 3D games landing pages) */}
      <div className="absolute top-[3%] left-[-15%] w-[45rem] h-[45rem] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-glow-mesh-1" />
      <div className="absolute top-[28%] right-[-15%] w-[38rem] h-[38rem] bg-[#ec4899]/8 rounded-full blur-[120px] pointer-events-none animate-glow-mesh-2" />
      <div className="absolute top-[60%] left-[-20%] w-[50rem] h-[50rem] bg-purple-600/8 rounded-full blur-[160px] pointer-events-none animate-glow-mesh-1" />
      <div className="absolute bottom-[3%] right-[5%] w-[35rem] h-[35rem] bg-[#10b981]/5 rounded-full blur-[110px] pointer-events-none animate-glow-mesh-2" />
      
      {/* Dynamic Cyber Tech Grid Overlay */}
      <div className="absolute inset-0 cyber-grid-overlay opacity-35 pointer-events-none" />
      
      {/* Drifting Background Cosmic Sparkles & Star Particles */}
      <BackgroundCosmicParticles />

      {/* Horizontal Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 origin-left z-[100] pointer-events-none"
        style={{ scaleX }}
      />

      {/* 3D Scroll Progress Tracker Node */}
      {!(currentView === "admin" && adminUnlocked) && (
        <ScrollProgressIndicator3D />
      )}

      {/* Dynamic Uniform Header Navigation */}
      {!(currentView === "admin" && adminUnlocked) && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          adminUnlocked={adminUnlocked}
          theme={theme}
          onToggleTheme={toggleTheme}
          versionLabel={displayedPortfolio?.hero?.versionLabel}
          portfolioTitle={displayedPortfolio?.hero?.title}
          settings={displayedPortfolio?.settings}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      )}

      <AnimatePresence mode="wait">
        {/* VIEW CODE 1: SECURE MANAGEMENT DECK PANEL */}
        {currentView === "admin" ? (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {!adminUnlocked ? (
              <AdminLogin
                onUnlockPasscode={(passcode) => {
                  setAdminUnlocked(true);
                  localStorage.setItem("nischal_admin_unlocked", "true");
                  // Seed a simulated manual session
                  setCurrentUser({
                    name: "Developer Admin",
                    role: "Admin",
                    isRealFirebase: false
                  } as any);
                }}
                onGoogleLoginSuccess={(fbUser) => {
                  // Handled securely by the dynamic onAuthStateChanged subscription in App.tsx
                }}
                onGoBack={() => handleNavigate("hero")}
              />
            ) : (
              <AdminDashboard
                portfolioData={portfolio}
                onUpdatePortfolio={handleUpdatePortfolio}
                team={team}
                onUpdateTeam={handleUpdateTeam}
                messages={messages}
                onUpdateMessages={handleUpdateMessages}
                logs={logs}
                analytics={analytics}
                currentUser={currentUser}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onTriggerApiSync={handleTriggerApiSync}
                onAddAuditLog={handleAddAuditLog}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        ) : (
          /* VIEW CODE 2: GORGEOUS PORTFOLIO FRONT PAGE GUEST VIEW */
          <motion.div
            key="portfolio-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-0"
          >
            {/* HERO INTRODUCTION SCREEN */}
            <Hero 
              hero={displayedPortfolio.hero} 
              settings={displayedPortfolio.settings}
              onExplore={() => {
                const element = document.getElementById("portfolio-gallery");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }} 
            />

            {/* UPGRADED PROJECTS GALLERY INDICES SECTION */}
            <motion.section 
              id="portfolio-gallery" 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 60,
                    damping: 15,
                    staggerChildren: 0.15
                  }
                }
              }}
              className="py-24 px-4 bg-transparent relative"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
              <div className="max-w-7xl mx-auto space-y-16 px-4 sm:px-6 lg:px-8">
                
                {/* Visual Head */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  className="text-center space-y-3"
                >
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] font-mono">Curated Showcase Gallery</span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    Featured <span className="text-indigo-400">Solutions</span>
                  </h2>
                  <div className="w-12 h-1 bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] mx-auto rounded-full mt-2" />
                  <p className="text-slate-400 text-sm max-w-lg mx-auto pt-2 font-sans">
                    Explore web platform templates, stock market visualizers, and customizable software solutions developed by {portfolio.hero.title}.
                  </p>
                </motion.div>

                {/* Filters & Gallery Layout Switches */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-5xl mx-auto border-b border-white/[0.04] pb-6">
                  {/* Category Filter Toggle Tabs */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 0.1 } }
                    }}
                    className="flex flex-wrap justify-center md:justify-start gap-2"
                  >
                    {[
                      { id: "All", label: "Show All", icon: Eye },
                      { id: "Web", label: "Web Platforms", icon: Terminal },
                      { id: "Mobile", label: "Mobile Apps", icon: AlertCircle },
                      { id: "Utility", label: "Productivity/Utility", icon: Sparkles }
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isActive = selectedProjCategory === cat.id;
                      return (
                        <motion.button
                          key={cat.id}
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedProjCategory(cat.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 border cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] font-semibold"
                              : "bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/10 hover:bg-slate-900"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-indigo-400"}`} />
                          <span>{cat.label}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>

                  {/* Sorting & Layout Toggles */}
                  <div className="flex flex-wrap items-center justify-center md:items-center gap-3">
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 0.12 } }
                      }}
                    >
                      <SortDropdown 
                        currentSort={projectSortOption} 
                        onChange={setProjectSortOption} 
                      />
                    </motion.div>

                    {/* Desktop Layout Toggle (Grid/List) */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 0.15 } }
                      }}
                      className="flex items-center justify-center bg-slate-950/85 p-1 rounded-xl border border-white/5 self-center md:self-auto shadow-inner"
                    >
                      <button
                        type="button"
                        onClick={() => setGalleryLayout("grid")}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer ${
                          galleryLayout === "grid"
                            ? "bg-indigo-600 text-white font-semibold shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Grid Layout"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Grid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryLayout("list")}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer ${
                          galleryLayout === "list"
                            ? "bg-indigo-600 text-white font-semibold shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Single-Column List Layout"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>List</span>
                      </button>
                    </motion.div>
                  </div>
                </div>



                {/* Sub-group layout lists */}
                <LayoutGroup>
                  <motion.div layout className="space-y-16">
                    {/* Web Products */}
                    <AnimatePresence mode="popLayout">
                      {(selectedProjCategory === "All" || selectedProjCategory === "Web") && pWeb.length > 0 && (
                        <motion.div 
                          layout
                          variants={categoryVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-120px" }}
                          exit="exit"
                          className="space-y-6"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Terminal className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase font-mono text-sm">Category Index: Web Platforms & APIs</h3>
                          </div>
                          <motion.div layout className={galleryLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 max-w-3xl mx-auto gap-8 w-full"}>
                            {isFiltering ? (
                              Array.from({ length: Math.min(pWeb.length, 3) || 3 }).map((_, idx) => (
                                <motion.div key={`skeleton-web-${idx}`} variants={projectCardVariants} layout>
                                  <ProjectSkeleton layoutMode={galleryLayout} />
                                </motion.div>
                              ))
                            ) : (
                              pWeb.map((p) => (
                                <motion.div key={p.id} variants={projectCardVariants} layout>
                                  <ProjectCard 
                                    project={p} 
                                    onTrackClick={handleTrackProjectClick} 
                                  />
                                </motion.div>
                              ))
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Systems Utilities */}
                    <AnimatePresence mode="popLayout">
                      {(selectedProjCategory === "All" || selectedProjCategory === "Utility") && pUtil.length > 0 && (
                        <motion.div 
                          layout
                          variants={categoryVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-120px" }}
                          exit="exit"
                          className={`space-y-6 ${selectedProjCategory === "All" ? "pt-6 border-t border-white/[0.04]" : ""}`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                            <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase font-mono text-sm">Category Index: Productivity & Utilities</h3>
                          </div>
                          <motion.div layout className={galleryLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 max-w-3xl mx-auto gap-8 w-full"}>
                            {isFiltering ? (
                              Array.from({ length: Math.min(pUtil.length, 3) || 3 }).map((_, idx) => (
                                <motion.div key={`skeleton-util-${idx}`} variants={projectCardVariants} layout>
                                  <ProjectSkeleton layoutMode={galleryLayout} />
                                </motion.div>
                              ))
                            ) : (
                              pUtil.map((p) => (
                                <motion.div key={p.id} variants={projectCardVariants} layout>
                                  <ProjectCard 
                                    project={p} 
                                    onTrackClick={handleTrackProjectClick} 
                                  />
                                </motion.div>
                              ))
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mobile Apps */}
                    <AnimatePresence mode="popLayout">
                      {(selectedProjCategory === "All" || selectedProjCategory === "Mobile") && pMobile.length > 0 && (
                        <motion.div 
                          layout
                          variants={categoryVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-120px" }}
                          exit="exit"
                          className={`space-y-6 ${selectedProjCategory === "All" ? "pt-6 border-t border-white/[0.04]" : ""}`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <AlertCircle className="w-5 h-5 text-purple-400" />
                            <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase font-mono text-sm">Category Index: Mobile Architectures</h3>
                          </div>
                          <motion.div layout className={galleryLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 max-w-3xl mx-auto gap-8 w-full"}>
                            {isFiltering ? (
                              Array.from({ length: Math.min(pMobile.length, 3) || 3 }).map((_, idx) => (
                                <motion.div key={`skeleton-mobile-${idx}`} variants={projectCardVariants} layout>
                                  <ProjectSkeleton layoutMode={galleryLayout} />
                                </motion.div>
                              ))
                            ) : (
                              pMobile.map((p) => (
                                <motion.div key={p.id} variants={projectCardVariants} layout>
                                  <ProjectCard 
                                    project={p} 
                                    onTrackClick={handleTrackProjectClick} 
                                  />
                                </motion.div>
                              ))
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>

              </div>
            </motion.section>

            {/* MILESTONES CREDENTIALS TIMELINE ABOUT PANEL */}
            <About about={displayedPortfolio.about} timeline={displayedPortfolio.timeline} settings={displayedPortfolio.settings} />

            {/* TECHNICAL SKILLS TAXONOMY GRID */}
            <Skills skills={displayedPortfolio.skills} settings={displayedPortfolio.settings} />

            {/* CONTACT VISITOR COMMUNICATION BLOCK */}
            <Contact onSendMessage={handleSendMessage} settings={displayedPortfolio.settings} />

            {/* CLEAN AESTHETIC FOOTER */}
            <footer className="py-12 bg-transparent border-t border-white/5 relative text-center text-xs text-slate-500 font-mono tracking-wider space-y-4">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
              
              {systemStatus && (
                <div className="max-w-7xl mx-auto px-4 pb-4 border-b border-white/[0.03] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block tracking-widest">Engine Status</span>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      {systemStatus.serviceState}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block tracking-widest">Active Node</span>
                    <span className="text-[11px] font-semibold text-indigo-400 font-mono">
                      {systemStatus.activeCluster}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block tracking-widest">Database Sync</span>
                    <span className="text-[11px] font-semibold text-purple-400 font-mono">
                      {systemStatus.databaseSync}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-zinc-500 font-bold block tracking-widest">Engine Uptime</span>
                    <span className="text-[11px] font-semibold text-cyan-400 font-mono">
                      {systemStatus.nodeUptime}s (Online)
                    </span>
                  </div>
                </div>
              )}

              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-semibold text-white">
                  {displayedPortfolio?.settings?.footerLeftText 
                    ? displayedPortfolio.settings.footerLeftText.replace("&copy;", "©").replace("&amp;", "&") 
                    : "NISCHAL KC © 2026"}
                </span>
                <span className="font-medium text-slate-500">
                  {displayedPortfolio?.settings?.footerRightText || "Fully Customizable Client Control Workspace • Active TLS Protection"}
                </span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
