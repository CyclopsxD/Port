import { 
  PortfolioData, 
  TeamMember, 
  ContactMessage, 
  AuditLog, 
  AnalyticsMetric, 
  PortfolioProject,
  PortfolioHero,
  PortfolioAbout,
  PortfolioSkill,
  TimelineEvent,
  UserRole,
  SystemSettings
} from "../types";
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocFromServer,
  writeBatch,
  increment
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";

// Connection validator per security skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. Client is currently offline.");
    }
  }
}
testConnection();

// Direct starter defaults for initial DB seed
const DEFAULT_HERO: PortfolioHero = {
  title: "Nischal KC",
  subtitle: "Full Stack Engineer & Solution Architect",
  description: "Crafting scalable cloud architectures, high-performance web products, and modern user experiences. Specialized in React, Node.js, and Distributed Systems.",
  ctaText: "Explore Projects",
  githubUrl: "https://github.com/nischalkc",
  linkedinUrl: "https://linkedin.com",
  emailContact: "12kcnischal@gmail.com",
  avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
  showResumeBtn: true,
  resumeUrl: "#",
  bannerUrl: "",
  animationType: "particles",
  animationSpeed: "normal",
  titleColor: "indigo-purple",
  techStackLabel: "Main Tech Stack",
  techStackList: "React / Node.js / Python",
  versionLabel: "v2.0.4 Admin"
};

const DEFAULT_SETTINGS: SystemSettings = {
  primaryColor: "#6366f1",
  secondaryColor: "#a855f7",
  backgroundColor: "#050508",
  textColor: "#cbd5e1",
  fontFamily: "Space Grotesk",
  cornerRadius: "medium",
  animationsEnabled: true,
  animationStyle: "slide",
  animationDuration: 600,
  animationDelay: 100,
  socialLinks: [
    { platform: "GitHub", url: "https://github.com/nischalkc", icon: "github" },
    { platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
    { platform: "Twitter", url: "https://twitter.com", icon: "twitter" }
  ],
  heroBadgeText: "Available for Collaborations",
  heroWelcomePrefix: "Hi, I'm",
  aboutMilestoneLabel: "Milestones & Bio",
  aboutSectionHeading: "About & Experience",
  aboutVerificationText: "Verified Nepal Resident Code-base Author",
  aboutTimelineHeading: "Professional History",
  skillsSubLabel: "Tech Stack Capabilities",
  skillsSectionHeading: "Technical Expertise",
  contactSubLabel: "Secure Communications",
  contactSectionHeading: "Get In Touch",
  contactSidebarTitle: "Let's Discuss New Ventures",
  contactSidebarContent: "Whether you have an upcoming project to launch, a system architecture to audit, or a complex system bottleneck to solve, my inbox is open. I synchronize logs daily and reply with direct technical reviews inside 24 hours.",
  contactFormTitle: "Send Message Inquiry",
  contactCtaText: "Establish Communication Channel",
  contactFooterLabel: "TLS End-to-End Encrypted Node Gateway",
  footerLeftText: "NISCHAL KC &copy; 2026",
  footerRightText: "Fully Customizable Client Control Workspace • Active TLS Protection",
  cardGlassEffect: "frosted",
  cardShadowGlow: "soft-indigo",
  cardBorderStrength: "normal",
  boxAnimationStiffness: 100,
  boxAnimationDamping: 15,
  logoLetterOverride: "N",
  logoTextOverride: "NISCHAL",
  logoSubTextOverride: "v2.0.4 Admin",
  logoGradientColorFrom: "#6366f1",
  logoGradientColorTo: "#9333ea",
  logoGlowIntensity: "soft",
  rolePermissions: {
    Admin: {
      manageContent: true,
      manageProjects: true,
      manageSkills: true,
      manageSeats: true,
      viewAnalytics: true
    },
    Contributor: {
      manageContent: true,
      manageProjects: true,
      manageSkills: true,
      manageSeats: false,
      viewAnalytics: true
    },
    Viewer: {
      manageContent: false,
      manageProjects: false,
      manageSkills: false,
      manageSeats: false,
      viewAnalytics: true
    }
  }
};

const DEFAULT_ABOUT: PortfolioAbout = {
  title: "Engineering Solutions with Clean Code",
  content: "I am a passionate software engineer focused on designing robust, high-availability backends and pixel-perfect, highly responsive frontends. I love exploring system performance bottlenecks and automating operational build pipelines. When I'm not writing code, I research web security, participate in dev hackathons, and collaborate with teams globally to streamline digital products.",
  yearsOfExperience: 3,
  highlightStats: [
    { label: "Completed Projects", value: "14+" },
    { label: "GitHub Contributions", value: "850+" },
    { label: "API Integrations", value: "30+" },
    { label: "Client Satisfaction", value: "100%" }
  ]
};

const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: "proj_1",
    title: "HamroShare - Market Analyzer",
    description: "An advanced real-time visualization platform for the Nepal Stock Exchange (NEPSE). Features technical charts, live ticker updates, and multi-indicator portfolio tracking.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
    category: "Web",
    techStack: ["React", "TypeScript", "Tailwind CSS", "Recharts", "Node.js"],
    liveUrl: "https://hamroshare.demo",
    githubUrl: "https://github.com/nischalkc/hamroshare",
    featured: true,
    clicksCount: 142
  },
  {
    id: "proj_2",
    title: "NepSewa - Local Services Hub",
    description: "A collaborative localized marketplace bridging freelance technicians and service providers with household searchers. Features location maps, real-time chats, and custom invoicing.",
    image: "https://images.unsplash.com/photo-1521791136368-1a4682773d5a?auto=format&fit=crop&q=80&w=800",
    category: "Web",
    techStack: ["Next.js", "Django", "PostgreSQL", "Docker", "Tailwind"],
    liveUrl: "https://nepsewa.demo",
    githubUrl: "https://github.com/nischalkc/nepsewa",
    featured: true,
    clicksCount: 98
  },
  {
    id: "proj_3",
    title: "Sadhana - Zen Workspace Utility",
    description: "A minimalist performance application featuring a synchronized Pomodoro timer, hierarchical task trackers, ambient sound players, and local sync engines for offline usage.",
    image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800",
    category: "Utility",
    techStack: ["Vite", "React", "motion", "Context API", "LocalForage"],
    liveUrl: "https://sadhana.demo",
    githubUrl: "https://github.com/nischalkc/sadhana",
    featured: false,
    clicksCount: 45
  },
  {
    id: "proj_4",
    title: "LMS - MeroPathshala Portal",
    description: "Multi-tenant educational management workspace. Includes interactive digital classrooms, assignment managers, auto-graded quizzes, and parents performance visualizers.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    category: "Web",
    techStack: ["React Native", "Express", "MongoDB", "Socket.io", "AWS S3"],
    liveUrl: "https://meropathshala.demo",
    githubUrl: "https://github.com/nischalkc/meropathshala",
    featured: true,
    clicksCount: 175
  }
];

const DEFAULT_SKILLS: PortfolioSkill[] = [
  { id: "sk_1", name: "React / React Native", category: "Frontend", level: 92 },
  { id: "sk_2", name: "TypeScript / ESNext", category: "Frontend", level: 88 },
  { id: "sk_3", name: "Tailwind CSS", category: "Frontend", level: 95 },
  { id: "sk_4", name: "Node.js & Express", category: "Backend", level: 90 },
  { id: "sk_5", name: "Django (Python)", category: "Backend", level: 80 },
  { id: "sk_6", name: "PostgreSQL & Redis", category: "Backend", level: 85 },
  { id: "sk_7", name: "Docker & Kubernetes", category: "DevOps", level: 78 },
  { id: "sk_8", name: "CI / CD Pipelines (GitHub Actions)", category: "DevOps", level: 82 },
  { id: "sk_9", name: "UI/UX & Figma Prototyping", category: "Design/Other", level: 84 }
];

const DEFAULT_TIMELINE: TimelineEvent[] = [
  {
    id: "time_1",
    role: "Full Stack Engineer",
    company: "TechNexus Solutions, Kathmandu",
    period: "2024 - Present",
    description: "Designing corporate microservices and real-time transaction processing dashboards. Optimized slow database query speeds by 34% using custom caching strategies.",
    logoColor: "bg-blue-600"
  },
  {
    id: "time_2",
    role: "Backend Web Developer",
    company: "Innova Nepal Solutions",
    period: "2023 - 2024",
    description: "Built multi-tenant enterprise resource planning systems (ERP) with complex RBAC structures. Maintained high-performance systems with 99.9% uptime compliance.",
    logoColor: "bg-purple-600"
  },
  {
    id: "time_3",
    role: "Software Engineering Intern",
    company: "Nepal Telecom Systems Lab",
    period: "2022 - 2023",
    description: "Assisted in writing unit tests, refactoring React state managers, and scripting server status checkers. Broadened knowledge in telecommunication routing APIs.",
    logoColor: "bg-emerald-600"
  }
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [];

const DEFAULT_MESSAGES: ContactMessage[] = [
  {
    id: "msg_1",
    name: "Preeti Adhikari",
    email: "preeti@startup.io",
    subject: "Contract Inquiry for hamroshare integration",
    message: "Hi Nischal, we loved your Nepalese share market visualization app. We are looking to build a tailored analytics screen for our custom index. Are you open to a contract position next month?",
    timestamp: "2026-06-02T14:22:00Z",
    read: false
  },
  {
    id: "msg_2",
    name: "Devendra Thapa",
    email: "devendra@fintech.com.np",
    subject: "Collaboration on NepSewa Core Gateway",
    message: "A quick question about the Django framework architecture you incorporated for NepSewa. Can you do a quick engineering review of our payments flow next week?",
    timestamp: "2026-05-31T09:15:00Z",
    read: true
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log_1",
    user: "Nischal KC",
    role: "Admin",
    action: "Updated Hero Title text and subtitle styling",
    timestamp: "2026-06-03T06:45:00Z"
  },
  {
    id: "log_2",
    user: "Nischal KC",
    role: "Admin",
    action: "Added tech tag 'Recharts' to project 'HamroShare'",
    timestamp: "2026-06-02T19:10:00Z"
  },
  {
    id: "log_3",
    user: "Nischal KC",
    role: "Admin",
    action: "Configured secure Firebase client environment keys",
    timestamp: "2026-06-01T11:00:00Z"
  }
];

const generateAnalyticsTrend = (): AnalyticsMetric[] => {
  const trend: AnalyticsMetric[] = [];
  const baseDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateString = d.toISOString().split("T")[0];
    const seed = i * 15;
    trend.push({
      date: dateString,
      views: Math.floor(180 + Math.sin(i * 1.2) * 50 + seed),
      clicks: Math.floor(45 + Math.sin(i * 1.5) * 15 + Math.floor(seed / 3)),
      contacts: Math.floor(1 + Math.sin(i * 0.9) * 2 + (i % 3 === 0 ? 1 : 0))
    });
  }
  return trend;
};

// Seeding engine to bootstrap database with developer presets
async function ensureSeedData() {
  try {
    const heroRef = doc(db, "portfolio", "hero");
    const heroSnap = await getDoc(heroRef);
    if (heroSnap.exists()) {
      return; // Database is already seeded
    }
    
    console.info("Firestore is currently unseeded. Bootstrapping initial secure profile context...");
    
    const batch = writeBatch(db);
    
    // Seed general settings
    batch.set(doc(db, "portfolio", "hero"), DEFAULT_HERO);
    batch.set(doc(db, "portfolio", "about"), DEFAULT_ABOUT);
    batch.set(doc(db, "portfolio", "settings"), DEFAULT_SETTINGS);

    // Keep projects, skills, timeline, messages, logs empty to prevent restoring backups
    const trend = generateAnalyticsTrend();
    for (const point of trend) {
      batch.set(doc(db, "analytics", point.date), point);
    }

    await batch.commit();
    console.info("Firestore database seed complete with clean profile.");
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (
      errorMsg.includes("offline") || 
      errorMsg.includes("Could not reach Cloud Firestore backend") || 
      errorMsg.includes("Failed to get document") ||
      errorMsg.includes("network")
    ) {
      console.warn("Firestore is offline or unreachable during seeding check. Skipping remote seeding and continuing using local presets: ", errorMsg);
    } else {
      console.warn("Non-fatal seeding check error: ", errorMsg);
    }
  }
}

// Fetch all elements securely from Firestore
export async function getStoredData(): Promise<{
  portfolio: PortfolioData;
  team: TeamMember[];
  messages: ContactMessage[];
  logs: AuditLog[];
  analytics: AnalyticsMetric[];
}> {
  await ensureSeedData();

  // Implement a one-time clean reset to clear legacy files/edits by old users
  try {
    if (localStorage.getItem("admin_portfolio_pristine_reset_v5") !== "true") {
      console.info("One-time database reset is running to remove previous user edits and clear all profiles for a fresh start...");
      
      // Clear team completely to allow a brand-new superadmin setup
      const teamSnap = await getDocs(collection(db, "team"));
      for (const d of teamSnap.docs) {
        await deleteDoc(doc(db, "team", d.id));
      }

      // Restore portfolio documents
      await setDoc(doc(db, "portfolio", "hero"), DEFAULT_HERO);
      await setDoc(doc(db, "portfolio", "about"), DEFAULT_ABOUT);
      await setDoc(doc(db, "portfolio", "settings"), DEFAULT_SETTINGS);

      // Overwrite projects to be completely empty (do not restore backups)
      const projectsSnap = await getDocs(collection(db, "projects"));
      for (const d of projectsSnap.docs) {
        await deleteDoc(doc(db, "projects", d.id));
      }

      // Overwrite skills to be completely empty (do not restore backups)
      const skillsSnap = await getDocs(collection(db, "skills"));
      for (const d of skillsSnap.docs) {
        await deleteDoc(doc(db, "skills", d.id));
      }

      // Overwrite timeline to be completely empty (do not restore backups)
      const timelineSnap = await getDocs(collection(db, "timeline"));
      for (const d of timelineSnap.docs) {
        await deleteDoc(doc(db, "timeline", d.id));
      }

      // Clear inbox messages
      const msgSnap = await getDocs(collection(db, "messages"));
      for (const d of msgSnap.docs) {
        await deleteDoc(doc(db, "messages", d.id));
      }

      // Clear previous logs
      const logsSnap = await getDocs(collection(db, "logs"));
      for (const d of logsSnap.docs) {
        await deleteDoc(doc(db, "logs", d.id));
      }
      await setDoc(doc(db, "logs", "init_clean"), {
        id: "init_clean",
        user: "System",
        role: "Admin",
        action: "Pristine database initialization completed and historical legacy removed.",
        timestamp: new Date().toISOString()
      });

      localStorage.setItem("admin_portfolio_pristine_reset_v5", "true");
      console.info("One-time database reset completed successfully!");
    }
  } catch (err) {
    console.warn("One-time database reset was interrupted or offline:", err);
  }
  
  try {
    const heroSnap = await getDoc(doc(db, "portfolio", "hero"));
    const aboutSnap = await getDoc(doc(db, "portfolio", "about"));
    const settingsSnap = await getDoc(doc(db, "portfolio", "settings"));
    
    const projectsSnap = await getDocs(collection(db, "projects"));
    const projectsList: PortfolioProject[] = [];
    projectsSnap.forEach((d) => {
      projectsList.push(d.data() as PortfolioProject);
    });
    
    const skillsSnap = await getDocs(collection(db, "skills"));
    const skillsList: PortfolioSkill[] = [];
    skillsSnap.forEach((d) => {
      skillsList.push(d.data() as PortfolioSkill);
    });
    
    const timelineSnap = await getDocs(collection(db, "timeline"));
    const timelineList: TimelineEvent[] = [];
    timelineSnap.forEach((d) => {
      timelineList.push(d.data() as TimelineEvent);
    });
    
    let teamList: TeamMember[] = [];
    try {
      const teamSnap = await getDocs(collection(db, "team"));
      teamSnap.forEach((d) => {
        teamList.push(d.data() as TeamMember);
      });
    } catch (e) {
      console.warn("Unable to fetch team roster under current guest auth context (omitted gracefully):", e);
    }
    
    let messagesList: ContactMessage[] = [];
    try {
      const messagesSnap = await getDocs(collection(db, "messages"));
      messagesSnap.forEach((d) => {
        messagesList.push(d.data() as ContactMessage);
      });
      messagesList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      console.warn("Unable to fetch messages under current guest auth context (omitted gracefully):", e);
    }
    
    let logsList: AuditLog[] = [];
    try {
      const logsSnap = await getDocs(collection(db, "logs"));
      logsSnap.forEach((d) => {
        logsList.push(d.data() as AuditLog);
      });
      logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      console.warn("Unable to fetch audit logs under current guest auth context (omitted gracefully):", e);
    }
    
    let analyticsList: AnalyticsMetric[] = [];
    try {
      const analyticsSnap = await getDocs(collection(db, "analytics"));
      analyticsSnap.forEach((d) => {
        analyticsList.push(d.data() as AnalyticsMetric);
      });
      analyticsList.sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {
      console.warn("Unable to fetch analytics metrics under current guest auth context (omitted gracefully):", e);
    }
    
    return {
      portfolio: {
        hero: (heroSnap.data() as PortfolioHero) || DEFAULT_HERO,
        about: (aboutSnap.data() as PortfolioAbout) || DEFAULT_ABOUT,
        projects: projectsList,
        skills: skillsList,
        timeline: timelineList,
        settings: (settingsSnap.data() as SystemSettings) || DEFAULT_SETTINGS
      },
      team: teamList,
      messages: messagesList,
      logs: logsList,
      analytics: analyticsList
    };
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (
      errorMsg.includes("offline") || 
      errorMsg.includes("Could not reach Cloud Firestore backend") || 
      errorMsg.includes("Failed to get document") ||
      errorMsg.includes("network")
    ) {
      console.warn("Firestore client is offline or secure fetch blocked. Falling back gracefully to default presets: ", errorMsg);
      return {
        portfolio: {
          hero: DEFAULT_HERO,
          about: DEFAULT_ABOUT,
          projects: [],
          skills: [],
          timeline: [],
          settings: DEFAULT_SETTINGS
        },
        team: [],
        messages: [],
        logs: [
          {
            id: "init_offline",
            user: "System",
            role: "Admin",
            action: "Offline mode active. Backups and presets omitted as requested.",
            timestamp: new Date().toISOString()
          }
        ],
        analytics: generateAnalyticsTrend()
      };
    }
    handleFirestoreError(error, OperationType.GET, "database_fetch_stored_data");
    throw error;
  }
}

export async function savePortfolioData(data: PortfolioData, user: string, role: UserRole) {
  // Always commit to localStorage so guest / passcode admin sessions can retain visual edits/customizations locally
  try {
    localStorage.setItem("nischal_portfolio_override", JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to set guest localStorage overrides", err);
  }

  // Gracefully skip Firestore commits for simulated/passcode/visitor roles to prevent permission errors
  if (role !== "Admin" || !auth.currentUser) {
    console.info(`[Simulated Portfolio Save] Saved portfolio data in local state and localStorage override for ${user} (${role})`);
    return;
  }
  
  // Local validation to prevent oversized document saves (Firestore maximum 1MB per document)
  const heroStr = JSON.stringify(data.hero);
  if (heroStr.length > 850 * 1024) {
    const limError = new Error("Firestore payload limit: The main resume/bio details (Hero) exceeds 1MB database limits (usually due to a massive PDF file upload). Please reference a smaller PDF (under 400KB).");
    handleFirestoreError(limError, OperationType.WRITE, "portfolio/hero");
    throw limError;
  }

  const aboutStr = JSON.stringify(data.about);
  if (aboutStr.length > 850 * 1024) {
    const limError = new Error("Firestore payload limit: The secondary about content is too large to fit in a single document. Please compress your custom bio graphics or media assets (under 400KB).");
    handleFirestoreError(limError, OperationType.WRITE, "portfolio/about");
    throw limError;
  }

  try {
    await setDoc(doc(db, "portfolio", "hero"), data.hero);
    await setDoc(doc(db, "portfolio", "about"), data.about);
    if (data.settings) {
      await setDoc(doc(db, "portfolio", "settings"), data.settings);
    }
    
    // Deletions check for projects
    const existingProjects = await getDocs(collection(db, "projects"));
    const newProjectIds = new Set(data.projects.map(p => p.id));
    for (const snap of existingProjects.docs) {
      if (!newProjectIds.has(snap.id)) {
        await deleteDoc(doc(db, "projects", snap.id));
      }
    }
    for (const p of data.projects) {
      await setDoc(doc(db, "projects", p.id), p);
    }
    
    // Deletions check for skills
    const existingSkills = await getDocs(collection(db, "skills"));
    const newSkillIds = new Set(data.skills.map(s => s.id));
    for (const snap of existingSkills.docs) {
      if (!newSkillIds.has(snap.id)) {
        await deleteDoc(doc(db, "skills", snap.id));
      }
    }
    for (const s of data.skills) {
      await setDoc(doc(db, "skills", s.id), s);
    }
    
    // Deletions check for timeline events
    const existingTimeline = await getDocs(collection(db, "timeline"));
    const newTimelineIds = new Set(data.timeline.map(t => t.id));
    for (const snap of existingTimeline.docs) {
      if (!newTimelineIds.has(snap.id)) {
        await deleteDoc(doc(db, "timeline", snap.id));
      }
    }
    for (const t of data.timeline) {
      await setDoc(doc(db, "timeline", t.id), t);
    }
    
    await addAuditLog(user, role, "Modified Portfolio Content directly via Front-end Content Form.");
  } catch (error: any) {
    if (error && (error.message?.includes("exceeds the maximum allowed size") || error.code === "out-of-range" || error.message?.includes("too large"))) {
      const explicitError = new Error("Data payload size limit exceeded! Your resume PDF or custom bio assets are too large to write into the 1MB Firestore document. Please choose a file smaller than 400KB and try again.");
      handleFirestoreError(explicitError, OperationType.WRITE, "portfolio_save_data");
      throw explicitError;
    }
    handleFirestoreError(error, OperationType.WRITE, "portfolio_save_data");
  }
}

export async function addAuditLog(userName: string, role: UserRole, action: string) {
  // Gracefully filter out logging operations initiated by simulated passcode modes to prevent permission errors
  if (role !== "Admin" || !auth.currentUser) {
    console.info(`[Simulated Session Log] ${userName} (${role}): ${action}`);
    return;
  }

  const logId = `log_${Date.now()}`;
  const newLog: AuditLog = {
    id: logId,
    user: userName,
    role,
    action,
    timestamp: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, "logs", logId), newLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `logs/${logId}`);
  }
}

export async function saveTeamMembers(members: TeamMember[]) {
  if (!auth.currentUser) {
    console.info("[Simulated Team Save] Skip committing team roster to live DB under current guest auth context.");
    return;
  }
  try {
    const existingTeam = await getDocs(collection(db, "team"));
    const newMemberIds = new Set(members.map(m => m.id));
    for (const snap of existingTeam.docs) {
      if (!newMemberIds.has(snap.id)) {
        await deleteDoc(doc(db, "team", snap.id));
      }
    }
    for (const m of members) {
      await setDoc(doc(db, "team", m.id), m);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "team_sync_save");
  }
}

export async function saveMessages(messages: ContactMessage[]) {
  if (!auth.currentUser) {
    console.info("[Simulated Messages Save] Skip committing messages inbox to live DB under current guest auth context.");
    return;
  }
  try {
    const existingMsgs = await getDocs(collection(db, "messages"));
    const newMsgIds = new Set(messages.map(m => m.id));
    for (const snap of existingMsgs.docs) {
      if (!newMsgIds.has(snap.id)) {
        await deleteDoc(doc(db, "messages", snap.id));
      }
    }
    for (const m of messages) {
      await setDoc(doc(db, "messages", m.id), m);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "messages_sync_save");
  }
}

export async function addContactMessage(m: ContactMessage) {
  try {
    await setDoc(doc(db, "messages", m.id), m);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `messages/${m.id}`);
  }
}

export async function trackPageView() {
  const today = new Date().toISOString().split("T")[0];
  const analyticRef = doc(db, "analytics", today);
  try {
    await setDoc(analyticRef, {
      date: today,
      views: increment(1),
      clicks: increment(0),
      contacts: increment(0)
    }, { merge: true });
  } catch (error) {
    console.warn("Unable to increment public page view metrics (omitted gracefully):", error);
  }
}

export async function trackProjectClick(projectId: string) {
  const projectRef = doc(db, "projects", projectId);
  try {
    const pSnap = await getDoc(projectRef);
    if (pSnap.exists()) {
      const pData = pSnap.data() as PortfolioProject;
      await setDoc(projectRef, {
        ...pData,
        clicksCount: pData.clicksCount + 1
      }, { merge: true });
    }
  } catch (error) {
    console.warn(`Unable to track project click for ${projectId} (omitted gracefully):`, error);
  }

  const today = new Date().toISOString().split("T")[0];
  const analyticRef = doc(db, "analytics", today);
  try {
    await setDoc(analyticRef, {
      date: today,
      views: increment(0),
      clicks: increment(1),
      contacts: increment(0)
    }, { merge: true });
  } catch (error) {
    console.warn("Unable to increment public click metrics (omitted gracefully):", error);
  }
}

export async function trackContactSubmission() {
  const today = new Date().toISOString().split("T")[0];
  const analyticRef = doc(db, "analytics", today);
  try {
    await setDoc(analyticRef, {
      date: today,
      views: increment(0),
      clicks: increment(0),
      contacts: increment(1)
    }, { merge: true });
  } catch (error) {
    console.warn("Unable to increment public interaction metrics (omitted gracefully):", error);
  }
}

// REST Web API Sync with GitHub service endpoints
export async function syncGitHubProjects(username: string): Promise<PortfolioProject[]> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!response.ok) {
      throw new Error("Could not contact GitHub API");
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format");
    }

    return data.map((repo: any, index: number) => ({
      id: `gh_synced_${repo.id || index}`,
      title: repo.name.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: repo.description || `Automated workspace sync. Public repository containing code modules for ${repo.name}. Developed using ${repo.language || 'TypeScript'}.`,
      image: [
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"
      ][index % 4],
      category: repo.language === "Dart" || repo.language === "Kotlin" || repo.language === "Swift" ? "Mobile" : "Web",
      techStack: [repo.language || "TypeScript", "GitHub Sync", "REST API", "Clean Code"].filter(Boolean),
      githubUrl: repo.html_url,
      liveUrl: repo.homepage || undefined,
      featured: index < 2,
      clicksCount: Math.floor(Math.random() * 30)
    }));
  } catch (error) {
    console.warn("Mock syncing active due to rate limiting/error:", error);
    return [
      {
        id: "gh_mock_1",
        title: "Dijkstra Nepal Pathfinding",
        description: "Optimized graph library for mapping and routing Nepalese highways. Written purely in Go.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
        category: "Utility",
        techStack: ["Go", "Algorithm", "GIS", "GitHub Actions"],
        githubUrl: `https://github.com/${username}/dijkstra-nepal`,
        featured: true,
        clicksCount: 12
      },
      {
        id: "gh_mock_2",
        title: "React NEPSE Ticker SDK",
        description: "Custom lightweight npm library to stream real-time Nepal Stock Exchange stock movements cleanly.",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
        category: "Web",
        techStack: ["TypeScript", "NPM", "WebSocket", "Rollup"],
        githubUrl: `https://github.com/${username}/react-nepse-sdk`,
        liveUrl: "https://npmjs.org",
        featured: false,
        clicksCount: 22
      }
    ];
  }
}
