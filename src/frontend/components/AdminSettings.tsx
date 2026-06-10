import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Save, 
  Trash2, 
  Plus, 
  UserPlus, 
  RefreshCw, 
  Sparkles, 
  ShieldAlert, 
  FolderPlus, 
  UserCheck, 
  Github, 
  CheckCircle2,
  Lock,
  Download,
  Globe,
  Youtube,
  Twitter,
  Instagram,
  UserMinus,
  Edit,
  X,
  Shield,
  KeyRound
} from "lucide-react";

import { auth, createAuthUser } from "../firebase";
import { getSocialIcon } from "./Hero";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 130, damping: 17 }
  }
};
import { 
  PortfolioData, 
  TeamMember, 
  PortfolioProject, 
  PortfolioSkill, 
  UserRole,
  TimelineEvent,
  SystemSettings,
  RolePermissions
} from "../types";

interface AdminSettingsProps {
  portfolioData: PortfolioData;
  onUpdatePortfolio: (data: PortfolioData) => void;
  team: TeamMember[];
  onUpdateTeam: (team: TeamMember[]) => void;
  currentUserRole: UserRole;
  currentUsername: string;
  onTriggerApiSync: (githubUser: string) => Promise<void>;
  onAddAuditLog: (action: string) => void;
  onNavigate: (view: string) => void;
}

export default function AdminSettings({
  portfolioData,
  onUpdatePortfolio,
  team,
  onUpdateTeam,
  currentUserRole,
  currentUsername,
  onTriggerApiSync,
  onAddAuditLog,
  onNavigate
}: AdminSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"content" | "projects" | "skills" | "team" | "customization" | "sync">("content");
  
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showAlert = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ type, message });
    // Scroll container to top so the notification is immediately visible
    try {
      const container = document.querySelector(".p-6.h-\\[480px\\]");
      if (container) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (_) {}
  };
  
  // Customization styling settings state bindings
  const [themeForm, setThemeForm] = useState<SystemSettings>(() => {
    return portfolioData.settings || {
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
        { platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" }
      ]
    };
  });

  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialIcon, setNewSocialIcon] = useState("github");

  // Validated Image File Reader with high-fidelity downstream compression (JPEG/PNG/WebP, 500KB cap)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "avatar" | "banner" | string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showAlert("Format mismatched: Only official JPEG, PNG, and WebP images are allowed.", "error");
      return;
    }
    
    const maxSize = 15 * 1024 * 1024; // 15MB Ultra High Fidelity modern capability
    if (file.size > maxSize) {
      showAlert("Performance Safeguard: Selected image exceeds 15MB. Please choose an image under 15MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 3840; // 4K/UHD Resolution Bounding Box for ultimate crispness

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL("image/webp", 0.95); // High quality WebP (95%)
          
          if (target === "avatar") {
            setHeroForm(prev => ({ ...prev, avatarUrl: webpDataUrl }));
            onAddAuditLog("Validated and uploaded a new profile avatar photo client-side");
            showAlert("Avatar photo resolved and loaded in memory! Remember to save content.", "success");
          } else if (target === "banner") {
            setHeroForm(prev => ({ ...prev, bannerUrl: webpDataUrl }));
            onAddAuditLog("Validated and uploaded a new background banner photo client-side (optimized to WebP)");
            showAlert("Banner cover resolved and loaded in memory! Remember to save content.", "success");
          } else {
            // Mapping for project screenshot edits
            if (editingProjectId) {
              setEditProjectForm(prev => ({ ...prev, image: webpDataUrl }));
              showAlert("Project screenshot optimization completed! Ready to publish.", "success");
            } else {
              setNewProject(prev => ({ ...prev, image: webpDataUrl }));
              showAlert("Project screenshot optimization completed! Ready to add.", "success");
            }
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Validated Resume Upload (Only pdf format)
  const handleResumePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showAlert("Security compliance: Resume / CV document upload accepts PDF formatted documents exclusively.", "error");
      return;
    }

    // Safety check: Firestore document limit is 1MB. Base64 encoding expands size by ~33%. 
    // Restricting PDF to 400KB ensures space for other text fields in the document.
    if (file.size > 400 * 1024) {
      showAlert("Safety limit: Please choose a PDF file smaller than 400 KB. High-resolution files exceed Firestore's 1MB size limit once encoded to database text.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64DataUrl = event.target?.result as string;
      setHeroForm(prev => ({ ...prev, resumeUrl: b64DataUrl }));
      onAddAuditLog("Validated and uploaded a new resume PDF attachment");
      showAlert("Official Resume PDF resolved! Press 'Save Bio Content' to deploy on the live site.", "success");
    };
    reader.readAsDataURL(file);
  };
  
  // Hero / About state bindings
  const [heroForm, setHeroForm] = useState(portfolioData.hero);
  const [aboutForm, setAboutForm] = useState(portfolioData.about);
  
  // Projects / Skills local editing states
  const [projectsList, setProjectsList] = useState<PortfolioProject[]>(portfolioData.projects);
  const [skillsList, setSkillsList] = useState<PortfolioSkill[]>(portfolioData.skills);
  const [timelineList, setTimelineList] = useState<TimelineEvent[]>(portfolioData.timeline);

  // Sync state bindings on prop updates to guarantee real-time collaboration with firebase/storage saves
  useEffect(() => {
    setHeroForm(portfolioData.hero);
  }, [portfolioData.hero]);

  useEffect(() => {
    setAboutForm(portfolioData.about);
  }, [portfolioData.about]);

  useEffect(() => {
    setProjectsList(portfolioData.projects);
  }, [portfolioData.projects]);

  useEffect(() => {
    setSkillsList(portfolioData.skills);
  }, [portfolioData.skills]);

  useEffect(() => {
    setTimelineList(portfolioData.timeline);
  }, [portfolioData.timeline]);

  useEffect(() => {
    if (portfolioData.settings) {
      setThemeForm(portfolioData.settings);
    }
  }, [portfolioData.settings]);

  // Editing Existing Project states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectForm, setEditProjectForm] = useState<Partial<PortfolioProject>>({});
  const [editTechInput, setEditTechInput] = useState("");
  
  // New Project Form drawer state
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState<Partial<PortfolioProject>>({
    title: "",
    description: "",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    category: "Web",
    techStack: [],
    liveUrl: "",
    githubUrl: "",
    featured: false
  });
  const [techInput, setTechInput] = useState("");

  // New Skill state
  const [newSkill, setNewSkill] = useState<Partial<PortfolioSkill>>({
    name: "",
    category: "Frontend",
    level: 80
  });

  // Team controls state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Contributor" as UserRole,
    password: ""
  });

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState("");
  const [editingMemberEmail, setEditingMemberEmail] = useState("");
  const [editingMemberRole, setEditingMemberRole] = useState<UserRole>("Contributor");

  // Secondary credentials and accounts toggles states
  const [passwordChangeMemberId, setPasswordChangeMemberId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [isUpdatingPasswordFlag, setIsUpdatingPasswordFlag] = useState(false);

  // GitHub user sync textbox
  const [gitHubUsername, setGitHubUsername] = useState("nischalkc");
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const checkPermission = (permission: keyof RolePermissions): boolean => {
    if (currentUserRole === "Admin") return true; 
    
    const systemPermissions = portfolioData.settings?.rolePermissions;
    if (systemPermissions && systemPermissions[currentUserRole]) {
      return systemPermissions[currentUserRole][permission];
    }
    
    const defaults: Record<UserRole, RolePermissions> = {
      Admin: { manageContent: true, manageProjects: true, manageSkills: true, manageSeats: true, viewAnalytics: true },
      Contributor: { manageContent: true, manageProjects: true, manageSkills: true, manageSeats: false, viewAnalytics: true },
      Viewer: { manageContent: false, manageProjects: false, manageSkills: false, manageSeats: false, viewAnalytics: true }
    };
    return defaults[currentUserRole][permission];
  };

  const isReadOnly = !checkPermission("manageContent");

  const handleHeroAndAboutSave = async () => {
    if (isReadOnly) return;

    // Safety checks for payload size constraints
    const heroSize = JSON.stringify(heroForm).length;
    const aboutSize = JSON.stringify(aboutForm).length;

    if (heroSize > 850 * 1024) {
      showAlert("Payload limit error: Your uploaded PDF Resume is too large! Please choose a smaller PDF (under 400KB) to ensure it fits safely inside the secure Firestore database, or paste an external URL instead.", "error");
      return;
    }

    if (aboutSize > 850 * 1024) {
      showAlert("Payload limit error: Your images or custom bio vectors are too large! Please optimize your images to fit within the database limits.", "error");
      return;
    }

    setIsSaving(true);
    showAlert("Synchronizing modifications to live secure cloud database...", "info");

    try {
      const updated: PortfolioData = {
        ...portfolioData,
        hero: heroForm,
        about: aboutForm
      };
      await onUpdatePortfolio(updated);
      onAddAuditLog(`Updated general portfolio headers and bio details`);
      showAlert("System Header modifications successfully deployed!", "success");
      setTimeout(() => {
        onNavigate("hero");
      }, 1500);
    } catch (err: any) {
      console.error("Save portfolio headers failed:", err);
      let errMsg = "Transaction abort: An unexpected error occurred while writing to the secure database.";
      try {
        if (err && err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) errMsg = parsed.error;
        }
      } catch (_) {
        if (err && err.message) errMsg = err.message;
      }
      showAlert(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditingProject = (proj: PortfolioProject) => {
    setEditingProjectId(proj.id);
    setEditProjectForm(proj);
    setEditTechInput(proj.techStack.join(", "));
  };

  const handleSaveEditedProject = async () => {
    if (isReadOnly || !editingProjectId) return;
    if (!checkPermission("manageProjects")) {
      showAlert("Privileged Projects Authorization mandatory to modify the projects inventory!", "error");
      return;
    }
    setIsSaving(true);
    showAlert("Saving project modifications...", "info");

    try {
      const nextList = projectsList.map(p => {
        if (p.id === editingProjectId) {
           return {
            ...p,
            title: editProjectForm.title || p.title,
            description: editProjectForm.description || p.description,
            image: editProjectForm.image || p.image,
            category: editProjectForm.category as any || p.category,
            techStack: editTechInput.split(",").map(s => s.trim()).filter(Boolean),
            liveUrl: editProjectForm.liveUrl || undefined,
            githubUrl: editProjectForm.githubUrl || undefined,
            featured: !!editProjectForm.featured,
          };
        }
        return p;
      });
      setProjectsList(nextList);
      const updatedData = { ...portfolioData, projects: nextList };
      await onUpdatePortfolio(updatedData);
      onAddAuditLog(`Updated existing project: ${editProjectForm.title}`);
      setEditingProjectId(null);
      showAlert("Project updated successfully!", "success");
      setTimeout(() => {
        onNavigate("hero");
      }, 1500);
    } catch (err: any) {
      console.error("Save project failed:", err);
      let errMsg = "Failed to save project modifications to database.";
      try {
        if (err && err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) errMsg = parsed.error;
        }
      } catch (_) {
        if (err && err.message) errMsg = err.message;
      }
      showAlert(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = async () => {
    if (isReadOnly) return;
    if (!checkPermission("manageProjects")) {
      showAlert("Privileged Projects Authorization mandatory to modify the projects inventory!", "error");
      return;
    }
    if (!newProject.title) {
      showAlert("Please provide a project title", "error");
      return;
    }

    setIsSaving(true);
    showAlert("Adding new project to database...", "info");

    try {
      const created: PortfolioProject = {
        id: `proj_${Date.now()}`,
        title: newProject.title || "New Project",
        description: newProject.description || "",
        image: newProject.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
        category: newProject.category as any,
        techStack: techInput.split(",").map(s => s.trim()).filter(Boolean),
        liveUrl: newProject.liveUrl || undefined,
        githubUrl: newProject.githubUrl || undefined,
        featured: !!newProject.featured,
        clicksCount: 0
      };

      const nextProjects = [created, ...projectsList];
      setProjectsList(nextProjects);
      
      const updatedData = { ...portfolioData, projects: nextProjects };
      await onUpdatePortfolio(updatedData);

      onAddAuditLog(`Added a new project record titled '${created.title}'`);
      
      // Clear state
      setNewProject({
        title: "",
        description: "",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
        category: "Web",
        techStack: [],
        liveUrl: "",
        githubUrl: "",
        featured: false
      });
      setTechInput("");
      setShowAddProject(false);
      showAlert("New project successfully added!", "success");
      setTimeout(() => {
        onNavigate("hero");
      }, 1500);
    } catch (err: any) {
      console.error("Add project failed:", err);
      let errMsg = "Failed to add project to database.";
      try {
        if (err && err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) errMsg = parsed.error;
        }
      } catch (_) {
        if (err && err.message) errMsg = err.message;
      }
      showAlert(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (isReadOnly) return;
    if (!checkPermission("manageProjects")) {
      showAlert("Privileged Projects Authorization mandatory to modify the projects inventory!", "error");
      return;
    }
    setIsSaving(true);
    showAlert(`Removing project '${name}'...`, "info");

    try {
      const next = projectsList.filter(p => p.id !== id);
      setProjectsList(next);
      const updatedData = { ...portfolioData, projects: next };
      await onUpdatePortfolio(updatedData);
      onAddAuditLog(`Deleted portfolio project: '${name}'`);
      showAlert(`Project '${name}' successfully deleted!`, "success");
      setTimeout(() => {
        onNavigate("hero");
      }, 1500);
    } catch (err: any) {
      console.error("Delete project failed:", err);
      let errMsg = "Failed to remove project from database.";
      try {
        if (err && err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) errMsg = parsed.error;
        }
      } catch (_) {
        if (err && err.message) errMsg = err.message;
      }
      showAlert(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (isReadOnly) return;
    if (!checkPermission("manageSkills")) {
      showAlert("Privileged Skills Authorization mandatory to modify technical skills radar!", "error");
      return;
    }
    if (!newSkill.name) return;
    setIsSaving(true);
    showAlert(`Adding skill capability '${newSkill.name}'...`, "info");

    try {
      const createdSkill: PortfolioSkill = {
        id: `sk_${Date.now()}`,
        name: newSkill.name,
        category: (newSkill.category as any) || "Frontend",
        level: Number(newSkill.level) || 80
      };

      const nextSkills = [...skillsList, createdSkill];
      setSkillsList(nextSkills);
      const updatedData = { ...portfolioData, skills: nextSkills };
      await onUpdatePortfolio(updatedData);
      onAddAuditLog(`Added a new skill tag: '${createdSkill.name}'`);

      setNewSkill({ name: "", category: "Frontend", level: 80 });
      showAlert("Skill capability added successfully!", "success");
      setTimeout(() => {
        onNavigate("hero");
      }, 1500);
    } catch (err: any) {
      console.error("Add skill failed:", err);
      let errMsg = "Failed to write skill tag to database.";
      try {
        if (err && err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) errMsg = parsed.error;
        }
      } catch (_) {
        if (err && err.message) errMsg = err.message;
      }
      showAlert(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (isReadOnly) return;
    if (!checkPermission("manageSkills")) {
      showAlert("Privileged Skills Authorization mandatory to modify technical skills radar!", "error");
      return;
    }
    setIsSaving(true);
    showAlert(`Removing skill tag '${name}'...`, "info");

    try {
      const next = skillsList.filter(s => s.id !== id);
      setSkillsList(next);
      const updatedData = { ...portfolioData, skills: next };
      await onUpdatePortfolio(updatedData);
      onAddAuditLog(`Removed technical skill tag: '${name}'`);
      showAlert("Skill successfully removed.", "success");
      setTimeout(() => {
        onNavigate("hero");
      }, 1500);
    } catch (err: any) {
      console.error("Delete skill failed:", err);
      let errMsg = "Failed to delete skill tag from database.";
      try {
        if (err && err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) errMsg = parsed.error;
        }
      } catch (_) {
        if (err && err.message) errMsg = err.message;
      }
      showAlert(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (isReadOnly) return;
    if (!checkPermission("manageSeats")) {
      showAlert("Privileged Seat Authorization mandatory to modify organization seating lists!", "error");
      return;
    }
    if (!newMember.name || !newMember.email) return;
    
    // Core Email/Password verification rule
    if (!newMember.password || newMember.password.length < 6) {
      showAlert("Credentials Error: A password of at least 6 characters is required to provision access.", "error");
      return;
    }

    setIsSaving(true);
    showAlert(`Registering team credentials for '${newMember.name}' via Firebase Auth...`, "info");

    try {
      // 1. Core Firebase Auth authentication call to create true login credentials
      const authUid = await createAuthUser(newMember.email, newMember.password);

      // 2. Map this real authenticated user ID as the TeamMember document key
      const createdMember: TeamMember = {
        id: authUid,
        name: newMember.name,
        email: newMember.email.trim().toLowerCase(),
        role: newMember.role as UserRole,
        status: "Active",
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
        lastActive: "Credentials Provisioned"
      };

      const updatedTeam = [...team, createdMember];
      await onUpdateTeam(updatedTeam);
      onAddAuditLog(`Provisioned new seat member '${createdMember.name}' [${createdMember.role}] with email/password authentication.`);
      setShowAddMember(false);
      setNewMember({ name: "", email: "", role: "Contributor", password: "" });
      showAlert(`Registered new seat member and provisioned credentials successfully!`, "success");
    } catch (err: any) {
      console.error("Add team member failed:", err);
      const errMsg = err.message || "";
      if (errMsg.includes("email-already-in-use") || errMsg.includes("auth/email-already-in-use")) {
        showAlert("Registration Failed: This email address is already registered in Firebase Authentication.", "error");
      } else if (errMsg.includes("weak-password")) {
        showAlert("Registration Failed: The provided password is too fragile.", "error");
      } else if (errMsg.includes("invalid-email")) {
        showAlert("Registration Failed: The workspace email address is invalid.", "error");
      } else {
        showAlert(`Could not register user to organization seating: ${err.message || err}`, "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: UserRole, name: string) => {
    if (isReadOnly) return;
    if (!checkPermission("manageSeats")) {
      showAlert("Administrative credentials required to edit role assignments.", "error");
      return;
    }

    setIsSaving(true);
    showAlert(`Updating credentials role for user...`, "info");

    try {
      const updated = team.map(m => {
        if (m.id === memberId) {
          return { ...m, role };
        }
        return m;
      });
      await onUpdateTeam(updated);
      onAddAuditLog(`Altered authorization role for user '${name}' to '${role}'`);
      showAlert(`Credentials changed successfully.`, "success");
    } catch {
      showAlert(`Administrative operation failed.`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMemberDetails = async (memberId: string, updatedName: string, updatedEmail: string, updatedRole: UserRole) => {
    if (isReadOnly) return;
    if (!checkPermission("manageSeats")) {
      showAlert("Administrative credentials required to edit seat details.", "error");
      return;
    }

    if (!updatedName.trim() || !updatedEmail.trim()) {
      showAlert("Name and Email parameters are required.", "error");
      return;
    }

    setIsSaving(true);
    showAlert(`Updating credentials for member '${updatedName}'...`, "info");

    try {
      const updated = team.map(m => {
        if (m.id === memberId) {
          return { ...m, name: updatedName.trim(), email: updatedEmail.trim().toLowerCase(), role: updatedRole };
        }
        return m;
      });
      await onUpdateTeam(updated);
      onAddAuditLog(`Altered credentials for user '${updatedName}' (${updatedRole})`);
      showAlert(`Credentials changed successfully.`, "success");
      setEditingMemberId(null);
    } catch {
      showAlert(`Administrative operation failed.`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (memberId: string, name: string) => {
    if (isReadOnly) return;
    if (!checkPermission("manageSeats")) {
      showAlert("Administrative credentials required to edit seat access.", "error");
      return;
    }

    const currentEmail = auth.currentUser?.email;
    const targetMember = team.find(m => m.id === memberId);
    const isSelf = targetMember && currentEmail && targetMember.email.toLowerCase() === currentEmail.toLowerCase();

    const confirmationText = isSelf
      ? `WARNING: You are about to remove YOUR OWN administrative seat (${name}) from the database! This will immediately log you out and lock administrative entry, but all updates and portfolio changes you made will be completely preserved. Proceed?`
      : `Are you absolutely sure you want to remove the seat of '${name}' from the administrator list? This action is permanent.`;

    if (!window.confirm(confirmationText)) {
      return;
    }

    setIsSaving(true);
    showAlert(`Removing credentials seat...`, "info");

    try {
      const updated = team.filter(m => m.id !== memberId);
      await onUpdateTeam(updated);
      onAddAuditLog(`Revoked seat access and deleted credentials for user '${name}' [ID: ${memberId}]`);
      showAlert(`Credentials seat deleted successfully.`, "success");
      
      if (isSelf) {
        // Redirect to homepage & reload to trigger complete session flush
        showAlert("Access revoked on self request. Signing out...", "info");
        setTimeout(() => {
          localStorage.removeItem("nischal_admin_unlocked");
          auth.signOut().then(() => {
            onNavigate("hero");
            window.location.reload();
          });
        }, 1500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMemberStatus = async (memberId: string, name: string, currentStatus: "Active" | "Pending" | "Suspended") => {
    if (isReadOnly) return;
    if (!checkPermission("manageSeats")) {
      showAlert("Administrative credentials required to toggle account status.", "error");
      return;
    }

    const currentEmail = auth.currentUser?.email;
    const targetMember = team.find(m => m.id === memberId);
    if (targetMember && currentEmail && targetMember.email.toLowerCase() === currentEmail.toLowerCase()) {
      showAlert("Operation Blocked: You cannot deactivate or suspend your own active administrator seat!", "error");
      return;
    }

    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    const statusText = nextStatus === "Suspended" ? "DEACTIVATE" : "ACTIVATING";

    if (!window.confirm(`Are you absolutely sure you want to ${statusText} the seat belonging to '${name}'?`)) {
      return;
    }

    setIsSaving(true);
    showAlert(`Altering system status for ${name}...`, "info");

    try {
      // 1. Update status in Auth (backend endpoint)
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/users/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ uid: memberId, status: nextStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error status ${res.status}`);
      }

      // 2. Update status in Firestore
      const updated = team.map(m => {
        if (m.id === memberId) {
          return { ...m, status: nextStatus as "Active" | "Pending" | "Suspended" };
        }
        return m;
      });
      await onUpdateTeam(updated);

      onAddAuditLog(`${nextStatus === "Suspended" ? "Suspended (deactivated)" : "Activated"} team seat access for user '${name}' [ID: ${memberId}]`);
      showAlert(`Successfully changed status for '${name}' to ${nextStatus}.`, "success");
    } catch (err: any) {
      console.error(err);
      showAlert(`Could not alter status: ${err.message || err}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeMemberPassword = async () => {
    if (isReadOnly) return;
    if (!checkPermission("manageSeats")) {
      showAlert("Administrative credentials required to update user passwords.", "error");
      return;
    }

    if (!passwordChangeMemberId) return;
    if (!newPasswordValue || newPasswordValue.length < 6) {
      showAlert("Credentials Error: Passwords must be at least 6 characters in length.", "error");
      return;
    }

    const targetMember = team.find(m => m.id === passwordChangeMemberId);
    if (!targetMember) return;

    setIsUpdatingPasswordFlag(true);
    showAlert(`Authorizing key change request for user '${targetMember.name}'...`, "info");

    try {
      // Send secure backend request
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ uid: passwordChangeMemberId, newPassword: newPasswordValue })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error status ${res.status}`);
      }

      onAddAuditLog(`Updated login credentials password for seat member '${targetMember.name}' [ID: ${passwordChangeMemberId}]`);
      showAlert(`Credentials password for '${targetMember.name}' updated successfully!`, "success");
      setPasswordChangeMemberId(null);
      setNewPasswordValue("");
    } catch (err: any) {
      console.error(err);
      showAlert(`Could not update password: ${err.message || err}`, "error");
    } finally {
      setIsUpdatingPasswordFlag(false);
    }
  };

  const handleGitHubSync = async () => {
    if (isReadOnly) return;
    setSyncing(true);
    setSyncSuccess(false);
    try {
      await onTriggerApiSync(gitHubUsername);
      setProjectsList(portfolioData.projects);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch {
      alert("Synchronizer ran into API rate constraints. Hybrid fallback generated.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
      {/* Alert Header on Unauthorized View */}
      {isReadOnly && (
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-6 py-3 flex items-center space-x-2.5 text-indigo-300">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-medium">
            Read-Only Dashboard: Authenticated as a <strong>Viewer</strong>. Level-up credentials to modify records.
          </span>
        </div>
      )}

      {/* Dynamic Status / Action Notification Banner */}
      {notification && (
        <div className={`px-6 py-4 flex items-center justify-between border-b transition-all duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-300" 
            : notification.type === "error" 
            ? "bg-red-950/50 border-red-500/20 text-red-300" 
            : "bg-blue-950/40 border-blue-500/20 text-blue-350"
        }`}>
          <div className="flex items-center space-x-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : notification.type === "error" ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
            )}
            <p className="text-xs font-mono leading-relaxed font-semibold">
              {notification.message}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="text-[10px] font-mono hover:text-white uppercase font-bold tracking-wider px-2 py-1 bg-white/5 border border-white/10 hover:border-white/20 rounded cursor-pointer transition-colors active:scale-95 shrink-0 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex border-b border-white/[0.06] bg-slate-950/60 overflow-x-auto">
        {[
          { id: "content", label: "Front Content" },
          { id: "projects", label: "Projects Inventory" },
          { id: "skills", label: "Skills Radar" },
          { id: "team", label: "Team Seats & Permissions" },
          { id: "customization", label: "Customization Engine" },
          { id: "sync", label: "Automated API Sync" }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`admin-subtab-${tab.id}`}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
              activeSubTab === tab.id
                ? "text-blue-400 border-blue-500 bg-slate-900"
                : "text-gray-400 border-transparent hover:text-white hover:bg-slate-900/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 h-[480px] overflow-y-auto">
        {/* TAB 1: CONTENT HEADER EDITING */}
        {activeSubTab === "content" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.h3 variants={itemVariants} className="font-display font-bold text-white text-base">Corporate Bio & Visual Headers</motion.h3>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Profile Name</label>
                <input
                  type="text"
                  value={heroForm.title}
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Job Subtitle</label>
                <input
                  type="text"
                  value={heroForm.subtitle}
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
            </motion.div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Short Description Intro</label>
              <textarea
                value={heroForm.description}
                disabled={isReadOnly}
                rows={3}
                onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Contact Email</label>
                <input
                  type="text"
                  value={heroForm.emailContact}
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, emailContact: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Avatar URL Link</label>
                  {heroForm.avatarUrl && (
                    <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Preview Loaded
                    </span>
                  )}
                </div>
                {heroForm.avatarUrl && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-950/60 border border-white/[0.04] rounded-lg mb-2">
                    <img 
                      src={heroForm.avatarUrl} 
                      alt="Avatar Live Preview" 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover bg-slate-900 border border-white/[0.1] shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-gray-300 font-medium truncate">{heroForm.avatarUrl}</p>
                      <p className="text-[9px] text-gray-500 font-mono">Profile picture preview</p>
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  value={heroForm.avatarUrl}
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500 font-mono text-xs"
                />
                {!isReadOnly && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      id="avatar-image-upload"
                      onChange={(e) => handleImageUpload(e, "avatar")}
                      className="hidden"
                    />
                    <label htmlFor="avatar-image-upload" className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-[10px] font-bold font-mono rounded cursor-pointer border border-indigo-500/20 text-indigo-300">
                      Upload Avatar Image
                    </label>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">CTA Button Name</label>
                <input
                  type="text"
                  value={heroForm.ctaText}
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Tech Stack Box Label</label>
                <input
                  type="text"
                  value={heroForm.techStackLabel || ""}
                  placeholder="e.g. Main Tech Stack"
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, techStackLabel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Tech Stack Box List</label>
                <input
                  type="text"
                  value={heroForm.techStackList || ""}
                  placeholder="e.g. React / Node.js / Python"
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, techStackList: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Navbar Version Label</label>
                <input
                  type="text"
                  value={heroForm.versionLabel || ""}
                  placeholder="e.g. v2.0.4 Admin"
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, versionLabel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
            </div>

             {/* Resume File URL & Switch */}
            <motion.div variants={itemVariants} className="p-4 bg-slate-950/40 border border-white/[0.05] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-indigo-400 uppercase font-mono">Resume / CV Document URL</label>
                <input
                  type="text"
                  value={heroForm.resumeUrl}
                  disabled={isReadOnly}
                  onChange={(e) => setHeroForm({ ...heroForm, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/... or other hosting URL"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs font-mono focus:border-indigo-500"
                />
                {!isReadOnly && (
                  <div className="flex items-center space-x-2 pt-1.5">
                    <input
                      type="file"
                      accept="application/pdf"
                      id="resume-pdf-upload"
                      onChange={handleResumePdfUpload}
                      className="hidden"
                    />
                    <label htmlFor="resume-pdf-upload" className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-[10px] font-bold font-mono rounded cursor-pointer border border-emerald-500/20 text-emerald-300 flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>Upload Official PDF Document</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2.5 pt-4 md:pt-6">
                <input
                  type="checkbox"
                  id="hero-show-resume-chk"
                  disabled={isReadOnly}
                  checked={heroForm.showResumeBtn}
                  onChange={(e) => setHeroForm({ ...heroForm, showResumeBtn: e.target.checked })}
                  className="rounded bg-slate-900 border-white/[0.08] text-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="hero-show-resume-chk" className="text-xs text-slate-300 font-sans cursor-pointer select-none">
                  Enable 'Get Resume' Button on Main Hero
                </label>
              </div>
            </motion.div>

            {/* BANNER VISUALS & ANIMATIONS SECURE MODULE */}
            <motion.div variants={itemVariants} className="p-5 bg-slate-950/50 border border-white/[0.05] rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider">Dynamic Banners, Accent Gradients & Animations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Custom Background Banner Image URL</label>
                  <input
                    type="text"
                    value={heroForm.bannerUrl || ""}
                    disabled={isReadOnly}
                    placeholder="e.g. https://images.unsplash.com/... or keep empty to use Dark Space Mesh"
                    onChange={(e) => setHeroForm({ ...heroForm, bannerUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs font-mono"
                  />
                  {!isReadOnly && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        id="banner-image-upload"
                        onChange={(e) => handleImageUpload(e, "banner")}
                        className="hidden"
                      />
                      <label htmlFor="banner-image-upload" className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-[10px] font-bold font-mono rounded cursor-pointer border border-indigo-500/20 text-indigo-300">
                        Upload Main Cover Banner Image
                      </label>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-500 font-sans">Provide an Unsplash or direct image URL to superimpose a sleek cover background over the page.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Primary Heading Gradient Mood</label>
                  <select
                    value={heroForm.titleColor || "indigo-purple"}
                    disabled={isReadOnly}
                    onChange={(e) => setHeroForm({ ...heroForm, titleColor: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="indigo-purple">Cosmic Slates (Indigo → Purple → Pink)</option>
                    <option value="emerald-teal">Eco Tech (Emerald → Teal → Indigo)</option>
                    <option value="amber-orange">Solar Flare (Amber → Orange → Rose)</option>
                    <option value="crimson-cyber">Neon Cyberpunk (Red → Pink → Indigo)</option>
                    <option value="electric-blue">Electric Deep (Cyan → Blue → Indigo)</option>
                  </select>
                  <p className="text-[9px] text-gray-500 font-sans">Swaps out the hue coordinates of your displayed name banner heading.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.04]">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Micro-Particle Animation Style</label>
                  <select
                    value={heroForm.animationType || "particles"}
                    disabled={isReadOnly}
                    onChange={(e) => setHeroForm({ ...heroForm, animationType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="particles">Floating Micro-Particles (Default)</option>
                    <option value="spotlight">Dynamic Interactive Spotlight Glow</option>
                    <option value="none">Sleek Minimal Static (No Background Motion)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Animation Translation Speed</label>
                  <select
                    value={heroForm.animationSpeed || "normal"}
                    disabled={isReadOnly}
                    onChange={(e) => setHeroForm({ ...heroForm, animationSpeed: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="slow">Slow & Cinematic</option>
                    <option value="normal">Ambient Normal</option>
                    <option value="fast">Fast & Energetic</option>
                    <option value="none">Paused / Frozen</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4 pt-4 border-t border-white/[0.04]">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-white font-display">Section: About Detailed Paragraph</h4>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Main Core Slogan Headline</label>
                <input
                  type="text"
                  value={aboutForm.title}
                  disabled={isReadOnly}
                  onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-450 uppercase font-mono">Narrative Biography Content</label>
                <textarea
                  value={aboutForm.content}
                  disabled={isReadOnly}
                  rows={4}
                  onChange={(e) => setAboutForm({ ...aboutForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.06] rounded-lg text-white text-sm focus:border-blue-500 leading-relaxed"
                />
              </div>
            </motion.div>

            {!isReadOnly && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="admin-save-content-btn"
                onClick={handleHeroAndAboutSave}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono uppercase font-bold tracking-wider cursor-pointer shadow-lg shadow-blue-500/10"
              >
                <Save className="w-4 h-4" />
                <span>Save Bio Content</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* TAB 2: PROJECTS MANAGEMENT */}
        {activeSubTab === "projects" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-white text-base">Projects Catalog</h3>
                <p className="text-xs text-slate-450">Manage elements in your portfolios showcase gallery.</p>
              </div>
              {!isReadOnly && (
                <button
                  id="admin-toggle-addproject-btn"
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold font-mono rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Record</span>
                </button>
              )}
            </div>

            {/* Add Project Form Frame */}
            {showAddProject && (
              <div className="p-4 bg-slate-950/80 border border-white/[0.08] rounded-xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-400">Add New Project Record</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] text-gray-450 font-semibold font-mono uppercase">Title</label>
                    <input
                      type="text"
                      placeholder="e.g., NEPSE Analyzer tool"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] text-gray-450 font-semibold font-mono uppercase">Category</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value as any })}
                      className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    >
                      <option value="Web">Web (SPA/Full Stack)</option>
                      <option value="Mobile">Mobile Application</option>
                      <option value="Utility">System Utility</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 flex flex-col">
                  <label className="text-[10px] text-gray-450 font-semibold font-mono uppercase">Description</label>
                  <textarea
                    placeholder="Short description of core features..."
                    rows={2}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                  />
                </div>

                <div className="space-y-1 flex flex-col">
                  <label className="text-[10px] text-indigo-400 font-bold font-mono uppercase">Backend Media - Card Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-1555066931-4365d14bab8c?..."
                    value={newProject.image}
                    onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                    className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs font-mono"
                  />
                  {!isReadOnly && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        id="new-project-image-upload"
                        onChange={(e) => handleImageUpload(e, "project_screenshot_new")}
                        className="hidden"
                      />
                      <label htmlFor="new-project-image-upload" className="px-2 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-[9px] font-bold font-mono rounded cursor-pointer border border-indigo-500/20 text-indigo-300">
                        Upload Screenshot Image (Up to 500KB - WebP Compressed)
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] text-gray-450 font-semibold font-mono uppercase">Github URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com..."
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] text-gray-450 font-semibold font-mono uppercase">Live URL (optional)</label>
                    <input
                      type="text"
                      placeholder="https://test.demo"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1 flex flex-col">
                    <label className="text-[10px] text-gray-450 font-semibold font-mono uppercase">Tech Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Next, Django"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="feat-proj-chk"
                      checked={newProject.featured}
                      onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                      className="rounded bg-slate-900 border-white/[0.08] text-blue-500 w-4 h-4"
                    />
                    <label htmlFor="feat-proj-chk" className="text-xs text-white cursor-pointer font-medium font-sans">
                      Highlight Showcase (Featured Project)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddProject(false)}
                    className="px-3 py-1.5 bg-slate-900 text-gray-400 font-mono text-xs rounded hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    id="admin-addproject-submit"
                    onClick={handleAddProject}
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold font-mono text-xs rounded hover:bg-blue-500"
                  >
                    Add Record
                  </button>
                </div>
              </div>
            )}

            {/* List Table of Projects */}
            <div className="space-y-3">
              {projectsList.map((proj) => {
                const isEditing = editingProjectId === proj.id;
                return (
                  <motion.div
                    key={proj.id}
                    variants={itemVariants}
                    className="p-3.5 bg-slate-950/80 border border-white/[0.04] rounded-xl hover:bg-slate-950 hover:border-white/[0.08] transition-all flex flex-col space-y-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-4">
                        <img
                          src={proj.image}
                          alt={proj.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white font-sans truncate">{proj.title}</h4>
                            {proj.featured && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 text-[9px] font-bold font-mono uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {proj.category} | {proj.techStack.slice(0, 3).join(", ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {!isReadOnly && (
                          <>
                            <button
                              onClick={() => isEditing ? setEditingProjectId(null) : handleStartEditingProject(proj)}
                              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg cursor-pointer transition-colors border-none"
                              title="Edit Record"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              id={`proj-delete-${proj.id}`}
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors border-none"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline expanded details form */}
                    {isEditing && (
                      <div className="p-4 bg-slate-900/60 border border-white/[0.04] rounded-lg mt-2 space-y-3 animate-fade-in text-left">
                        <h5 className="text-[10px] uppercase tracking-wider font-bold text-blue-400 font-mono">Modify Project Assets</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] font-mono text-slate-400 font-semibold uppercase">Title</label>
                            <input 
                              type="text" 
                              value={editProjectForm.title || ""} 
                              onChange={(e) => setEditProjectForm({...editProjectForm, title: e.target.value})}
                              className="px-2.5 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs" 
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] font-mono text-slate-400 font-semibold uppercase">Category</label>
                            <select 
                              value={editProjectForm.category || "Web"} 
                              onChange={(e) => setEditProjectForm({...editProjectForm, category: e.target.value as any})}
                              className="px-2.5 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs"
                            >
                              <option value="Web">Web (SPA/Full Stack)</option>
                              <option value="Mobile">Mobile Application</option>
                              <option value="Utility">System Utility</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-mono text-slate-400 font-semibold uppercase">Description</label>
                          <textarea 
                            rows={2} 
                            value={editProjectForm.description || ""} 
                            onChange={(e) => setEditProjectForm({...editProjectForm, description: e.target.value})}
                            className="px-2.5 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs leading-relaxed" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] font-mono text-slate-400 font-semibold uppercase">Image Asset URL</label>
                            <input 
                              type="text" 
                              value={editProjectForm.image || ""} 
                              onChange={(e) => setEditProjectForm({...editProjectForm, image: e.target.value})}
                              className="px-2.5 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs font-mono" 
                            />
                            {!isReadOnly && (
                              <div className="flex items-center space-x-2 pt-1">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  id={`edit-project-image-upload-${proj.id}`}
                                  onChange={(e) => handleImageUpload(e, "project_screenshot_edit")}
                                  className="hidden"
                                />
                                <label htmlFor={`edit-project-image-upload-${proj.id}`} className="px-2 py-0.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-[9px] font-bold font-mono rounded cursor-pointer border border-indigo-500/20 text-indigo-300">
                                  Upload New Screenshot (WebP)
                                </label>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] font-mono text-slate-400 font-semibold uppercase">Tech Tags (comma separated)</label>
                            <input 
                              type="text" 
                              value={editTechInput} 
                              onChange={(e) => setEditTechInput(e.target.value)}
                              className="px-2.5 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] font-mono text-slate-400 font-semibold uppercase">GitHub Sandbox Link</label>
                            <input 
                              type="text" 
                              value={editProjectForm.githubUrl || ""} 
                              onChange={(e) => setEditProjectForm({...editProjectForm, githubUrl: e.target.value})}
                              className="px-2.5 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs font-mono" 
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] font-mono text-slate-400 font-semibold uppercase">Live Build URL (optional)</label>
                            <input 
                              type="text" 
                              value={editProjectForm.liveUrl || ""} 
                              onChange={(e) => setEditProjectForm({...editProjectForm, liveUrl: e.target.value})}
                              className="px-2.5 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs font-mono" 
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="checkbox"
                            id={`edit-featured-chk-${proj.id}`}
                            checked={!!editProjectForm.featured}
                            onChange={(e) => setEditProjectForm({ ...editProjectForm, featured: e.target.checked })}
                            className="rounded bg-slate-950 border-white/[0.08] text-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor={`edit-featured-chk-${proj.id}`} className="text-xs text-slate-300 font-medium font-sans cursor-pointer select-none">
                            Promote to Feature Show-case Carousel
                          </label>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2 border-t border-white/[0.04]">
                          <button
                            onClick={() => setEditingProjectId(null)}
                            className="px-3 py-1 bg-slate-950 text-gray-400 hover:text-white rounded text-xs cursor-pointer border-none"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEditedProject}
                            className="px-3.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs cursor-pointer border-none"
                          >
                            Update Project
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: SKILLS MANAGER */}
        {activeSubTab === "skills" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <h3 className="font-display font-bold text-white text-base">Skills & Tech Stack Taxonomy</h3>
            
            {/* Quick Skill Creater */}
            {!isReadOnly && (
              <div className="p-4 bg-slate-950/60 border border-white/[0.06] rounded-xl flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 min-w-[150px] flex-1">
                  <span className="text-[10px] text-gray-450 font-bold font-mono uppercase">Skill Name</span>
                  <input
                    type="text"
                    placeholder="e.g., PostgreSQL"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-450 font-bold font-mono uppercase">Category</span>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                    className="px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                  >
                    <option value="Frontend">Frontend Tag</option>
                    <option value="Backend">Backend Tag</option>
                    <option value="DevOps">DevOps Tag</option>
                    <option value="Design/Other">Design/Other Tag</option>
                  </select>
                </div>
                <div className="space-y-1.5 w-24">
                  <span className="text-[10px] text-gray-450 font-bold font-mono uppercase">Proficiency</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs font-mono"
                  />
                </div>
                <button
                  id="admin-addskill-submit"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold font-mono uppercase cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
            )}

            {/* In-view List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsList.map((skill) => (
                <motion.div
                  key={skill.id}
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/[0.04] rounded-xl hover:border-white/[0.08]"
                >
                  <div>
                    <span className="text-sm font-semibold text-white font-sans">{skill.name}</span>
                    <span className="block text-[9px] text-gray-500 uppercase font-mono tracking-wider">{skill.category} List • {skill.level}% proficiency</span>
                  </div>

                  {!isReadOnly && (
                    <button
                      id={`skill-delete-${skill.id}`}
                      onClick={() => handleDeleteSkill(skill.id, skill.name)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer border-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: TEAM ACCESS SEATS */}
        {activeSubTab === "team" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-white text-base">Multi-User Seat Controls</h3>
                <p className="text-xs text-gray-400">Handle roles like Admin, Contributor, and Viewer to secure workflows.</p>
              </div>
              {!isReadOnly && currentUserRole === "Admin" && (
                <button
                  id="admin-toggle-addmember-btn"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-mono font-bold rounded-lg cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Seat</span>
                </button>
              )}
            </div>

            {/* Privileged Form Block */}
            {showAddMember && (
              <div className="p-4 bg-slate-950 border border-white/[0.08] rounded-xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-400">Register New Seat & Credentials</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5 col-span-1">
                    <span className="text-[10px] text-gray-450 font-bold font-mono">Full Name</span>
                    <input
                      type="text"
                      placeholder="e.g., Nirajan KC"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <span className="text-[10px] text-gray-450 font-bold font-mono">Work Email</span>
                    <input
                      type="email"
                      placeholder="nirajan@startup.np"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <span className="text-[10px] text-gray-450 font-bold font-mono">Credentials Password</span>
                    <input
                      type="password"
                      placeholder="Min 6 chars"
                      value={newMember.password}
                      onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <span className="text-[10px] text-gray-450 font-bold font-mono">System Role</span>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value as UserRole })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs"
                    >
                      <option value="Admin">Admin (Full Access / Rules)</option>
                      <option value="Contributor">Contributor (Edits allowed)</option>
                      <option value="Viewer">Viewer (Read-only)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="px-3 py-1.5 bg-slate-900 text-gray-400 font-mono text-xs rounded"
                  >
                    Cancel
                  </button>
                  <button
                    id="admin-addmember-submit"
                    onClick={handleAddMember}
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold font-mono text-xs rounded hover:bg-blue-500"
                  >
                    Add Seat
                  </button>
                </div>
              </div>
            )}

            {/* List Team Grid */}
            <div className="space-y-3.5">
              {team.map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="flex flex-col p-4 bg-slate-950/80 border border-white/[0.05] rounded-xl gap-4 text-left"
                >
                  {editingMemberId === member.id ? (
                    /* EDITING MODE FORM */
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center w-full">
                      <div className="col-span-1">
                        <label className="block text-[9px] uppercase font-mono text-zinc-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={editingMemberName}
                          onChange={(e) => setEditingMemberName(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-[9px] uppercase font-mono text-zinc-400 mb-1">Email</label>
                        <input
                          type="email"
                          value={editingMemberEmail}
                          onChange={(e) => setEditingMemberEmail(e.target.value)}
                          className="w-full bg-slate-100/10 border border-white/10 rounded px-2.5 py-1 text-xs text-zinc-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div className="col-span-1 flex items-end justify-between md:justify-end gap-2.5 pt-3 md:pt-0">
                        <div className="flex-1 md:flex-initial">
                          <label className="block text-[9px] uppercase font-mono text-zinc-500 mb-1">Role</label>
                          <select
                            value={editingMemberRole}
                            onChange={(e) => setEditingMemberRole(e.target.value as UserRole)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Contributor">Contributor</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </div>
                        <div className="flex gap-1.5 pt-4">
                          <button
                            type="button"
                            onClick={() => handleUpdateMemberDetails(member.id, editingMemberName, editingMemberEmail, editingMemberRole)}
                            className="p-1.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-800 hover:text-white transition-all cursor-pointer"
                            title="Save Credentials"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMemberId(null)}
                            className="p-1.5 rounded bg-zinc-950/40 border border-white/10 text-zinc-450 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                            title="Cancel Edit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE CARD */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className={`w-10 h-10 rounded-full object-cover bg-slate-900 border border-white/[0.08] ${
                            member.status === "Suspended" ? "grayscale opacity-40 border-red-500/30" : ""
                          }`}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
                            <span className={member.status === "Suspended" ? "line-through text-slate-500" : ""}>{member.name}</span>
                            {member.status === "Suspended" && (
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-red-950/50 text-red-500 border border-red-500/20 rounded">Suspended</span>
                            )}
                          </h4>
                          <p className={`text-xs text-gray-400 font-mono leading-none ${member.status === "Suspended" ? "text-slate-600" : ""}`}>{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 justify-end sm:justify-start flex-wrap gap-y-2">
                        <div className="text-xs text-right hidden sm:block">
                          <p className="text-slate-400 font-mono">Last active</p>
                          <p className="text-gray-500 font-mono text-[10px]">{member.lastActive}</p>
                        </div>

                        <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

                        <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/[0.06] text-xs font-mono text-gray-300">
                          {member.role}
                        </span>

                        <span className={`px-2.5 py-1 rounded border text-xs font-mono font-semibold ${
                          member.status === "Suspended"
                            ? "bg-red-950/40 text-red-400 border-red-500/20"
                            : "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {member.status || "Active"}
                        </span>

                        {currentUserRole === "Admin" && (
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              title="Set New Password for user"
                              onClick={() => {
                                setPasswordChangeMemberId(passwordChangeMemberId === member.id ? null : member.id);
                                setNewPasswordValue("");
                              }}
                              className={`p-1.5 px-2.5 rounded cursor-pointer transition-all flex items-center space-x-1.5 font-mono text-[11px] ${
                                passwordChangeMemberId === member.id
                                  ? "bg-purple-650 text-white border border-purple-500/50"
                                  : "bg-purple-950/30 hover:bg-purple-650 text-purple-400 hover:text-white border border-purple-500/20"
                              }`}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Password</span>
                            </button>

                            <button
                              type="button"
                              title={member.status === "Suspended" ? "Activate accounts credentials" : "Deactivate account"}
                              onClick={() => handleToggleMemberStatus(member.id, member.name, member.status || "Active")}
                              className={`p-1.5 px-2.5 rounded border cursor-pointer transition-all flex items-center space-x-1.5 font-mono text-[11px] ${
                                member.status === "Suspended"
                                  ? "bg-emerald-950/30 hover:bg-emerald-650 text-emerald-400 hover:text-white border-emerald-500/20"
                                  : "bg-orange-950/30 hover:bg-orange-650 text-orange-400 hover:text-white border-orange-500/20"
                              }`}
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{member.status === "Suspended" ? "Activate" : "Deactivate"}</span>
                            </button>

                            <button
                              type="button"
                              title="Edit Credentials"
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setEditingMemberName(member.name);
                                setEditingMemberEmail(member.email);
                                setEditingMemberRole(member.role);
                              }}
                              className="p-1.5 px-2.5 rounded bg-indigo-950/30 hover:bg-indigo-650 text-indigo-400 hover:text-white border border-indigo-500/20 cursor-pointer transition-all flex items-center space-x-1.5 font-mono text-[11px]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              title={member.email.toLowerCase() === auth.currentUser?.email?.toLowerCase() ? "Revoke My Access & Delete My Credentials" : "Delete Member Seat"}
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="p-1.5 px-2.5 rounded bg-red-950/30 hover:bg-red-650 text-red-400 hover:text-white border border-red-500/20 cursor-pointer transition-all flex items-center space-x-1.5 font-mono text-[11px]"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>
                                {member.email.toLowerCase() === auth.currentUser?.email?.toLowerCase() ? "Remove Self" : "Remove"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Change Password inline panel */}
                  {passwordChangeMemberId === member.id && (
                    <div className="mt-3.5 pt-3.5 border-t border-white/[0.06] flex flex-col md:flex-row items-end gap-3.5">
                      <div className="flex-1 space-y-1.5 w-full">
                        <span className="text-[10px] text-gray-400 font-bold font-mono uppercase flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                          Set New Login Password for {member.name}
                        </span>
                        <input
                          type="password"
                          placeholder="Enter new account password (min 6 characters)"
                          value={newPasswordValue}
                          onChange={(e) => setNewPasswordValue(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.06] rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordChangeMemberId(null);
                            setNewPasswordValue("");
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-gray-400 font-mono text-xs rounded transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isUpdatingPasswordFlag}
                          onClick={handleChangeMemberPassword}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs rounded transition-all cursor-pointer flex items-center space-x-1.5"
                        >
                          {isUpdatingPasswordFlag ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* ROLE PERMISSIONS CAPABILITIES MATRIX */}
            <div className="p-6 bg-slate-950/80 border border-white/[0.05] rounded-xl space-y-4 text-left">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Role Capabilities & Permissions Matrix</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Dynamically control which administrative seat roles can read, edit, or configure individual database records and system profiles.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300 font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 font-bold">Permissions / Modules</th>
                      <th className="py-2.5 font-bold text-center">Admin</th>
                      <th className="py-2.5 font-bold text-center">Contributor</th>
                      <th className="py-2.5 font-bold text-center">Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "manageContent", label: "Manage Layout & Content Settings", desc: "Allows updating Hero banners, bios, and general contact descriptors." },
                      { key: "manageProjects", label: "Inventory of Software Projects", desc: "Allows building, editing, and deleting projects records." },
                      { key: "manageSkills", label: "Capabilities & Skills Radar", desc: "Allows registering, configuring level sliders, and deleting skill tags." },
                      { key: "manageSeats", label: "Group Management & Invite Seats", desc: "Allows appointing team members, changing seat roles & credential controls." },
                      { key: "viewAnalytics", label: "Dashboard Analytical Overview", desc: "Allows fetching visits count, system charts, and inquiries feed." }
                    ].map((row) => {
                      const permKey = row.key as keyof RolePermissions;
                      const matrix = portfolioData.settings?.rolePermissions || {
                        Admin: { manageContent: true, manageProjects: true, manageSkills: true, manageSeats: true, viewAnalytics: true },
                        Contributor: { manageContent: true, manageProjects: true, manageSkills: true, manageSeats: false, viewAnalytics: true },
                        Viewer: { manageContent: false, manageProjects: false, manageSkills: false, manageSeats: false, viewAnalytics: true }
                      };

                      return (
                        <tr key={row.key} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="py-3">
                            <span className="font-bold text-white text-xs block font-sans">{row.label}</span>
                            <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">{row.desc}</span>
                          </td>
                          <td className="py-3 text-center">
                            <input 
                              type="checkbox"
                              checked={true}
                              disabled={true}
                              className="w-4 h-4 rounded border-gray-300 bg-gray-100 text-indigo-600 focus:ring-indigo-500 cursor-not-allowed"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <input 
                              type="checkbox"
                              checked={!!matrix.Contributor?.[permKey]}
                              onChange={async () => {
                                if (currentUserRole !== "Admin") {
                                  showAlert("Administrative privileges missing: Only Admins can modify the permissions matrix.", "error");
                                  return;
                                }
                                const updatedMatrix = {
                                  ...matrix,
                                  Contributor: {
                                    ...matrix.Contributor,
                                    [permKey]: !matrix.Contributor?.[permKey]
                                  }
                                };
                                const updatedData = {
                                  ...portfolioData,
                                  settings: {
                                    ...portfolioData.settings,
                                    rolePermissions: updatedMatrix
                                  }
                                };
                                try {
                                  await onUpdatePortfolio(updatedData);
                                  onAddAuditLog(`Altered permission rule [${permKey}] for Contributor role`);
                                  showAlert(`Permissions updated successfully!`, "success");
                                } catch (err) {
                                  showAlert("Could not write updated permission matrix.", "error");
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <input 
                              type="checkbox"
                              checked={!!matrix.Viewer?.[permKey]}
                              onChange={async () => {
                                if (currentUserRole !== "Admin") {
                                  showAlert("Administrative privileges missing: Only Admins can modify the permissions matrix.", "error");
                                  return;
                                }
                                const updatedMatrix = {
                                  ...matrix,
                                  Viewer: {
                                    ...matrix.Viewer,
                                    [permKey]: !matrix.Viewer?.[permKey]
                                  }
                                };
                                const updatedData = {
                                  ...portfolioData,
                                  settings: {
                                    ...portfolioData.settings,
                                    rolePermissions: updatedMatrix
                                  }
                                };
                                try {
                                  await onUpdatePortfolio(updatedData);
                                  onAddAuditLog(`Altered permission rule [${permKey}] for Viewer role`);
                                  showAlert(`Permissions updated successfully!`, "success");
                                } catch (err) {
                                  showAlert("Could not write updated permission matrix.", "error");
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4.5: TOTAL CUSTOMIZATION ENGINE */}
        {activeSubTab === "customization" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex justify-between items-center text-left">
              <div>
                <h3 className="font-display font-bold text-white text-base">Total Customization Engine</h3>
                <p className="text-xs text-slate-400">Adapt primary styles, fonts, corner radiuses, brand links, and animation characteristics cleanly.</p>
              </div>
            </motion.div>

            {/* Colors System & Branding presets */}
            <motion.div variants={itemVariants} className="p-5 bg-slate-950/50 border border-white/[0.05] rounded-xl space-y-4 text-left">
              <h4 className="text-xs font-mono font-bold uppercase text-indigo-400">Core Styling Coordinates & Presets</h4>
              
              {/* Presets Row to pick quick values */}
              <div className="space-y-1.5 pb-3 border-b border-white/[0.04]">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Quick Palette Presets</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { name: "Cosmic Indigo", primary: "#6366f1", secondary: "#a855f7", bg: "#050508", text: "#cbd5e1" },
                    { name: "Emerald Matrix", primary: "#10b981", secondary: "#06b6d4", bg: "#040e0a", text: "#e2e8f0" },
                    { name: "Cyber Sunset", primary: "#f43f5e", secondary: "#ec4899", bg: "#0d0514", text: "#f8fafc" },
                    { name: "Nordic Minimal", primary: "#3b82f6", secondary: "#14b8a6", bg: "#0b1329", text: "#cbd5e1" }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setThemeForm(prev => ({
                          ...prev,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          backgroundColor: preset.bg,
                          textColor: preset.text
                        }));
                      }}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-[10px] font-mono text-slate-300 rounded cursor-pointer select-none transition-all"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Primary Style color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      disabled={isReadOnly}
                      value={themeForm.primaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.primaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-white/[0.08] rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Secondary Accent Color</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      disabled={isReadOnly}
                      value={themeForm.secondaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.secondaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-white/[0.08] rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Dark Background</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      disabled={isReadOnly}
                      value={themeForm.backgroundColor}
                      onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.backgroundColor}
                      onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-white/[0.08] rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Main Text Shade</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      disabled={isReadOnly}
                      value={themeForm.textColor}
                      onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.textColor}
                      onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-slate-900 border border-white/[0.08] rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Typography & Radiuses */}
            <motion.div variants={itemVariants} className="p-5 bg-slate-950/50 border border-white/[0.05] rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-indigo-400 uppercase font-mono font-bold">Dynamic Web Typography (Google Fonts API)</span>
                <select
                  value={themeForm.fontFamily}
                  disabled={isReadOnly}
                  onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs cursor-pointer focus:border-indigo-500"
                >
                  <option value="Space Grotesk">Space Grotesk (Modern Sans Displays)</option>
                  <option value="Inter">Inter (Swiss Neutral Minimalist)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Sleek Tech Code)</option>
                  <option value="Syne">Syne (Cozy / Brutalist Artsy)</option>
                  <option value="Playfair Display">Playfair Display (Classy Editorial Serif)</option>
                  <option value="Outfit">Outfit (Clean High-Contrast Geometric)</option>
                </select>
                <p className="text-[9.5px] text-slate-500">Upon change, the portfolio downloads and dynamically applies the font properties from official CDN APIs.</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-indigo-400 uppercase font-mono font-bold">Global Component Corner Radiuses</span>
                <select
                  value={themeForm.cornerRadius}
                  disabled={isReadOnly}
                  onChange={(e) => setThemeForm({ ...themeForm, cornerRadius: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs cursor-pointer focus:border-indigo-500"
                >
                  <option value="none">None (Sharp Corners / Brutalist / Editorial)</option>
                  <option value="medium">Medium (Standard 12px Soft Round)</option>
                  <option value="full">Full Shape (Pill Caps & Capsules)</option>
                </select>
                <p className="text-[9.5px] text-slate-500">Governs border-radius parameters of card grids, upload fields, action tabs and CTA buttons securely.</p>
              </div>
            </motion.div>

            {/* Dynamic Navigation Brand Logo Panel */}
            <motion.div variants={itemVariants} className="p-5 bg-slate-950/50 border border-white/[0.05] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-sans">
              <div className="md:col-span-3 pb-2 border-b border-white/[0.04]">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-400">Navigation Brand Customizer (Focused Logo)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Customize your navbar logo initials, text, styles, gradient, and glow intensity.</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Logo Initials Letter</span>
                <input
                  type="text"
                  maxLength={2}
                  disabled={isReadOnly}
                  value={themeForm.logoLetterOverride || ""}
                  onChange={(e) => setThemeForm({ ...themeForm, logoLetterOverride: e.target.value })}
                  placeholder="N"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs focus:border-indigo-500 font-mono font-bold uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Navbar Brand Name</span>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={themeForm.logoTextOverride || ""}
                  onChange={(e) => setThemeForm({ ...themeForm, logoTextOverride: e.target.value })}
                  placeholder="NISCHAL"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs focus:border-indigo-500 font-bold uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Sub-label Version/Text</span>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={themeForm.logoSubTextOverride || ""}
                  onChange={(e) => setThemeForm({ ...themeForm, logoSubTextOverride: e.target.value })}
                  placeholder="v2.0.4 Admin"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Logo Color From</span>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    disabled={isReadOnly}
                    value={themeForm.logoGradientColorFrom || "#6366f1"}
                    onChange={(e) => setThemeForm({ ...themeForm, logoGradientColorFrom: e.target.value })}
                    className="w-8 h-8 rounded border-none cursor-pointer bg-transparent shadow"
                  />
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={themeForm.logoGradientColorFrom || ""}
                    onChange={(e) => setThemeForm({ ...themeForm, logoGradientColorFrom: e.target.value })}
                    placeholder="#6366f1"
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Logo Color To</span>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    disabled={isReadOnly}
                    value={themeForm.logoGradientColorTo || "#9333ea"}
                    onChange={(e) => setThemeForm({ ...themeForm, logoGradientColorTo: e.target.value })}
                    className="w-8 h-8 rounded border-none cursor-pointer bg-transparent shadow"
                  />
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={themeForm.logoGradientColorTo || ""}
                    onChange={(e) => setThemeForm({ ...themeForm, logoGradientColorTo: e.target.value })}
                    placeholder="#9333ea"
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Logo Shadow Glow</span>
                <select
                  value={themeForm.logoGlowIntensity || "soft"}
                  disabled={isReadOnly}
                  onChange={(e) => setThemeForm({ ...themeForm, logoGlowIntensity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs cursor-pointer focus:border-indigo-500"
                >
                  <option value="none">Flat (No Ambient Shadow glows)</option>
                  <option value="soft">Soft Ambient (Sleek Professional Glow)</option>
                  <option value="vibrant">Vibrant Aura (Dazzling Laser Glow)</option>
                </select>
              </div>
            </motion.div>

            {/* Box Styles, Card Glass, Shadows & Glowing effects */}
            <motion.div variants={itemVariants} className="p-5 bg-slate-950/50 border border-white/[0.05] rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-sans">
              <div className="md:col-span-3 pb-2 border-b border-white/[0.04]">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-400">Card Design & Box Styles Control</h4>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Glassmorphism Type</span>
                <select
                  value={themeForm.cardGlassEffect || "frosted"}
                  disabled={isReadOnly}
                  onChange={(e) => setThemeForm({ ...themeForm, cardGlassEffect: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs cursor-pointer focus:border-indigo-500"
                >
                  <option value="frosted">Frosted (Blur Backdrop Overlay)</option>
                  <option value="translucent">Translucent (Super Thin Overlay)</option>
                  <option value="deep-solid">Deep Solid (High-Contrast Solid Matte)</option>
                </select>
                <p className="text-[9.5px] text-slate-500">Changes the transparency and backdrop-filter level of page modules.</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Border Strength Style</span>
                <select
                  value={themeForm.cardBorderStrength || "normal"}
                  disabled={isReadOnly}
                  onChange={(e) => setThemeForm({ ...themeForm, cardBorderStrength: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs cursor-pointer focus:border-indigo-500"
                >
                  <option value="normal">Normal (0.09 White Border Outline)</option>
                  <option value="subtle">Subtle (Ultra-Thin 0.03 Border Line)</option>
                  <option value="none">Borderless (No Borders on Panels)</option>
                </select>
                <p className="text-[9.5px] text-slate-500">Regulates visual thickness thresholds across the workspace cards.</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Cosmic Card Shadow Glows</span>
                <select
                  value={themeForm.cardShadowGlow || "soft-indigo"}
                  disabled={isReadOnly}
                  onChange={(e) => setThemeForm({ ...themeForm, cardShadowGlow: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white text-xs cursor-pointer focus:border-indigo-500"
                >
                  <option value="none">None (Flat Matte Shadows)</option>
                  <option value="soft-indigo">Soft Indigo (Primary Tint Highlight Shadow)</option>
                  <option value="cosmic-purple">Cosmic Purple (Secondary Accent Glow Shadow)</option>
                </select>
                <p className="text-[9.5px] text-slate-500">Injects custom-color glowing borders or shadow drop fields beneath blocks.</p>
              </div>
            </motion.div>

            {/* Custom Texts & Section Headings Engine */}
            <motion.div variants={itemVariants} className="p-5 bg-slate-950/50 border border-white/[0.05] rounded-xl space-y-4 text-left font-sans">
              <div className="pb-2 border-b border-white/[0.04]">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-400">Micro-Texts and Section Headers Configurer</h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Override and fine-tune headings, tags, descriptions and contact form layouts saved across the visitor dashboard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hero / General branding texts */}
                <div className="space-y-3.5">
                  <h5 className="text-[10.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider">Hero Section Strings</h5>
                  
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Badge Text Status</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.heroBadgeText || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, heroBadgeText: e.target.value })}
                      placeholder="Available for Collaborations"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Greeting/Prefix Text</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.heroWelcomePrefix || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, heroWelcomePrefix: e.target.value })}
                      placeholder="Hi, I'm"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* About custom headers */}
                <div className="space-y-3.5">
                  <h5 className="text-[10.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider">About Section Strings</h5>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Timeline Upper Title</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.aboutMilestoneLabel || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, aboutMilestoneLabel: e.target.value })}
                      placeholder="Milestones & Bio"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Section Main Header</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.aboutSectionHeading || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, aboutSectionHeading: e.target.value })}
                      placeholder="About & Experience"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Verification Sub-label</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.aboutVerificationText || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, aboutVerificationText: e.target.value })}
                      placeholder="Verified Nepal Resident Code-base Author"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* Skills Taxonomy and Timeline */}
                <div className="space-y-3.5">
                  <h5 className="text-[10.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider">Skills & Experience Strings</h5>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Skills Accent Sub-label</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.skillsSubLabel || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, skillsSubLabel: e.target.value })}
                      placeholder="Tech Stack Capabilities"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Skills Main Section Title</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.skillsSectionHeading || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, skillsSectionHeading: e.target.value })}
                      placeholder="Technical Expertise"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Timeline History Heading</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.aboutTimelineHeading || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, aboutTimelineHeading: e.target.value })}
                      placeholder="Professional History"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* Contact communication strings */}
                <div className="space-y-3.5 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.04]">
                  <div className="md:col-span-2">
                    <h5 className="text-[10.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider">Contact Communication Module Strings</h5>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Contact Header Badge</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.contactSubLabel || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, contactSubLabel: e.target.value })}
                      placeholder="Secure Communications"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Contact Primary Header</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.contactSectionHeading || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, contactSectionHeading: e.target.value })}
                      placeholder="Get In Touch"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Sidebar Column Header</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.contactSidebarTitle || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, contactSidebarTitle: e.target.value })}
                      placeholder="Let's Discuss New Ventures"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Form Title Above Input Fields</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.contactFormTitle || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, contactFormTitle: e.target.value })}
                      placeholder="Send Message Inquiry"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Action Button CTA Text</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.contactCtaText || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, contactCtaText: e.target.value })}
                      placeholder="Establish Communication Channel"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Encrypted Sub-status Indicator</span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={themeForm.contactFooterLabel || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, contactFooterLabel: e.target.value })}
                      placeholder="TLS End-to-End Encrypted Node Gateway"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Sidebar Bio Details Paragraph</span>
                    <textarea
                      disabled={isReadOnly}
                      value={themeForm.contactSidebarContent || ""}
                      onChange={(e) => setThemeForm({ ...themeForm, contactSidebarContent: e.target.value })}
                      rows={2}
                      placeholder="Whether you have an upcoming project to launch, a system architecture to audit..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 leading-relaxed font-sans font-medium"
                    />
                  </div>
                </div>

                {/* Footer copyrights */}
                <div className="space-y-3.5 col-span-1 md:col-span-2 pt-2 border-t border-white/[0.04]">
                  <h5 className="text-[10.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider">Dynamic Copyright Footers</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Footer Left Text</span>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={themeForm.footerLeftText || ""}
                        onChange={(e) => setThemeForm({ ...themeForm, footerLeftText: e.target.value })}
                        placeholder="NISCHAL KC &copy; 2026"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Footer Right Sub-label</span>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={themeForm.footerRightText || ""}
                        onChange={(e) => setThemeForm({ ...themeForm, footerRightText: e.target.value })}
                        placeholder="Fully Customizable Client Control Workspace • Active TLS Protection"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded text-white text-xs focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Fine Animation constants */}
                <div className="space-y-3.5 col-span-1 md:col-span-2 pt-2 border-t border-white/[0.04] grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <h5 className="text-[10.5px] font-bold font-mono text-indigo-300 uppercase tracking-wider">Interactive Spring Constants (Physics Simulation)</h5>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Spring Stiffness ({themeForm.boxAnimationStiffness ?? 100})</span>
                    <input
                      type="range"
                      min={10}
                      max={400}
                      disabled={isReadOnly}
                      value={themeForm.boxAnimationStiffness ?? 100}
                      onChange={(e) => setThemeForm({ ...themeForm, boxAnimationStiffness: Number(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Spring Damping ({themeForm.boxAnimationDamping ?? 15})</span>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      disabled={isReadOnly}
                      value={themeForm.boxAnimationDamping ?? 15}
                      onChange={(e) => setThemeForm({ ...themeForm, boxAnimationDamping: Number(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none mt-2"
                    />
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Interactive Dynamic Social links manager */}
            <motion.div variants={itemVariants} className="p-5 bg-slate-950/50 border border-white/[0.05] rounded-xl space-y-4 text-left">
              <h4 className="text-xs font-mono font-bold uppercase text-indigo-400">Dynamic Social Links Manager</h4>
              
              <div className="space-y-3.5">
                {/* Platform insertion tools */}
                {!isReadOnly && (
                  <div className="p-4 bg-slate-900/60 border border-white/[0.04] rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1 flex flex-col">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Platform Label</span>
                      <input
                        type="text"
                        placeholder="e.g. YouTube, GitHub"
                        value={newSocialPlatform}
                        onChange={(e) => setNewSocialPlatform(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1 flex flex-col md:col-span-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Link URL Coordinate</span>
                      <input
                        type="text"
                        placeholder="https://youdomain.com/user"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs font-mono focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1 flex flex-col">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Brand Icon Choose</span>
                      <select
                        value={newSocialIcon}
                        onChange={(e) => setNewSocialIcon(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-white/[0.06] rounded text-white text-xs cursor-pointer focus:border-indigo-500"
                      >
                        <option value="github">github</option>
                        <option value="linkedin">linkedin</option>
                        <option value="twitter">twitter / x</option>
                        <option value="mail">mail / email</option>
                        <option value="youtube">youtube</option>
                        <option value="instagram">instagram</option>
                        <option value="globe">globe / general</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSocialPlatform || !newSocialUrl) {
                            showAlert("Inputs required to compile your brand link.", "error");
                            return;
                          }
                          const updatedLinks = [
                            ...(themeForm.socialLinks || []),
                            { platform: newSocialPlatform, url: newSocialUrl, icon: newSocialIcon }
                          ];
                          setThemeForm(prev => ({ ...prev, socialLinks: updatedLinks }));
                          setNewSocialPlatform("");
                          setNewSocialUrl("");
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-mono rounded text-xs cursor-pointer font-bold select-none border-none"
                      >
                        Add Social Handle
                      </button>
                    </div>
                  </div>
                )}

                {/* Display active links list */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Active Custom Social Links</span>
                  {themeForm.socialLinks && themeForm.socialLinks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {themeForm.socialLinks.map((link, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-white/[0.04] rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-slate-350 min-w-0 flex-1">
                            {getSocialIcon(link.icon)}
                            <div className="text-left min-w-0 flex-1 pl-1">
                              <p className="text-xs font-bold text-white leading-none">{link.platform}</p>
                              <p className="text-[10.5px] text-indigo-400 font-mono truncate max-w-[170px] mt-0.5">{link.url}</p>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (themeForm.socialLinks || []).filter((_, i) => i !== idx);
                                setThemeForm(prev => ({ ...prev, socialLinks: updated }));
                              }}
                              className="p-1.5 bg-red-950/20 hover:bg-red-950/50 hover:text-red-400 text-slate-500 rounded border border-red-500/10 cursor-pointer"
                              title="Delete platform link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-mono">No custom platforms active. Default coordinates visible on Home screen.</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Theme Form Save Action CTA */}
            {!isReadOnly && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (isReadOnly) return;
                  setIsSaving(true);
                  showAlert("Saving styling & customization preferences...", "info");
                  
                  try {
                    const updatedData: PortfolioData = {
                      ...portfolioData,
                      settings: themeForm
                    };
                    await onUpdatePortfolio(updatedData);
                    onAddAuditLog("Deployed updated Core customization parameters, styles and custom accounts map");
                    showAlert("CMS Customization properties deployed successfully! Main elements updated in real-time.", "success");
                    setTimeout(() => {
                      onNavigate("hero");
                    }, 1500);
                  } catch (err: any) {
                    console.error("Save settings failed:", err);
                    let errMsg = "Failed to write brand customization to database.";
                    try {
                      if (err && err.message) {
                        const parsed = JSON.parse(err.message);
                        if (parsed && parsed.error) errMsg = parsed.error;
                      }
                    } catch (_) {
                      if (err && err.message) errMsg = err.message;
                    }
                    showAlert(errMsg, "error");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono uppercase font-bold tracking-wider cursor-pointer shadow-lg shadow-blue-500/10"
              >
                <Save className="w-4 h-4" />
                <span>Save Styling Preferences</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* TAB 5: AUTOMATED GITHUB SYNC */}
        {activeSubTab === "sync" && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-start space-x-3.5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Github className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-display">Automated GitHub Profile Synchronizer</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Instantly synchronize text descriptions, titles, tech tags, and code repositories from your GitHub account. This connects directly to the GitHub REST API, automates mapping of repository entities, and overrides your projects inventory cleanly without coding.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-end bg-slate-950/60 p-5 rounded-xl border border-white/[0.04]">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold font-mono uppercase text-gray-455">GitHub Username</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={isReadOnly || syncing}
                    value={gitHubUsername}
                    onChange={(e) => setGitHubUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/[0.08] rounded-lg text-white font-mono text-sm uppercase focus:border-blue-500"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-500 font-mono text-sm leading-none">@</span>
                </div>
              </div>

              <button
                id="admin-sync-github-btn"
                onClick={handleGitHubSync}
                disabled={isReadOnly || syncing}
                className={`w-full sm:w-auto flex items-center justify-center space-x-1.5 px-6 py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-none ${
                  syncing ? "bg-slate-750 text-gray-500" : "bg-blue-600 hover:bg-blue-500 text-white shadow shadow-blue-500/10"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? "Syncing..." : "Sync Projects Now"}</span>
              </button>
            </motion.div>

            {syncSuccess && (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-lg animate-pulse">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>GitHub Synchronizer returned 100% success. Repositories compiled. UI states updated in real-time.</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
