export type UserRole = "Admin" | "Contributor" | "Viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Pending" | "Suspended";
  avatarUrl: string;
  lastActive: string;
}

export interface PortfolioHero {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  githubUrl: string;
  linkedinUrl: string;
  emailContact: string;
  avatarUrl: string;
  showResumeBtn: boolean;
  resumeUrl: string;
  bannerUrl?: string;
  animationType?: string;
  animationSpeed?: "slow" | "normal" | "fast" | "none";
  titleColor?: string;
  techStackLabel?: string;
  techStackList?: string;
  versionLabel?: string;
}

export interface PortfolioAbout {
  title: string;
  content: string;
  yearsOfExperience: number;
  highlightStats: {
    label: string;
    value: string;
  }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "Web" | "Mobile" | "Design" | "Utility";
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  clicksCount: number;
}

export interface PortfolioSkill {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "DevOps" | "Design/Other";
  level: number; // 0 to 100
}

export interface TimelineEvent {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  logoColor?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  timestamp: string;
}

export interface AnalyticsMetric {
  date: string; // YYYY-MM-DD
  views: number;
  clicks: number;
  contacts: number;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface RolePermissions {
  manageContent: boolean;
  manageProjects: boolean;
  manageSkills: boolean;
  manageSeats: boolean;
  viewAnalytics: boolean;
}

export interface SystemSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  cornerRadius: "none" | "medium" | "full";
  animationsEnabled: boolean;
  animationStyle: "fade" | "slide" | "zoom";
  animationDuration: number;
  animationDelay: number;
  socialLinks: SocialLink[];
  rolePermissions?: {
    Admin: RolePermissions;
    Contributor: RolePermissions;
    Viewer: RolePermissions;
  };
  
  // Extended custom texts for full control
  heroBadgeText?: string;
  heroWelcomePrefix?: string;
  aboutMilestoneLabel?: string;
  aboutSectionHeading?: string;
  aboutVerificationText?: string;
  aboutTimelineHeading?: string;
  skillsSubLabel?: string;
  skillsSectionHeading?: string;
  contactSubLabel?: string;
  contactSectionHeading?: string;
  contactSidebarTitle?: string;
  contactSidebarContent?: string;
  contactFormTitle?: string;
  contactCtaText?: string;
  contactFooterLabel?: string;
  footerLeftText?: string;
  footerRightText?: string;

  // Box & component styles control
  cardGlassEffect?: "frosted" | "translucent" | "deep-solid";
  cardShadowGlow?: "none" | "soft-indigo" | "cosmic-purple";
  cardBorderStrength?: "normal" | "subtle" | "none";
  boxAnimationStiffness?: number;
  boxAnimationDamping?: number;

  // Navigation logo customizations
  logoLetterOverride?: string;
  logoTextOverride?: string;
  logoSubTextOverride?: string;
  logoGradientColorFrom?: string;
  logoGradientColorTo?: string;
  logoGlowIntensity?: "none" | "soft" | "vibrant";
}

export interface PortfolioData {
  hero: PortfolioHero;
  about: PortfolioAbout;
  projects: PortfolioProject[];
  skills: PortfolioSkill[];
  timeline: TimelineEvent[];
  settings?: SystemSettings;
}

