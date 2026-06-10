import React from "react";
import { motion } from "motion/react";
import { Github, Linkedin, Mail, ArrowRight, Terminal, Sparkles, FileText, Globe, ExternalLink } from "lucide-react";
import { PortfolioHero, SystemSettings } from "../types";
import { Interactive3DTilt, Floating3DGeometric } from "./AmbientElements";

export function getSocialIcon(iconName: string) {
  const icon = iconName ? iconName.toLowerCase() : "";
  if (icon.includes("github")) return <Github className="w-4 h-4" />;
  if (icon.includes("linkedin")) return <Linkedin className="w-4 h-4" />;
  if (icon.includes("mail") || icon.includes("email")) return <Mail className="w-4 h-4" />;
  if (icon.includes("globe") || icon.includes("website")) return <Globe className="w-4 h-4" />;
  return <ExternalLink className="w-4 h-4" />;
}

interface HeroProps {
  hero: PortfolioHero;
  settings?: SystemSettings;
  onExplore: () => void;
}

export default function Hero({ hero, settings, onExplore }: HeroProps) {
  // Extract tech stack list
  const techList = hero.techStackList
    ? hero.techStackList.split(",").map((s) => s.trim()).filter(Boolean)
    : ["TypeScript", "React", "Cloud Design", "PostgreSQL", "Firebase"];

  // Handle color formatting
  const textHighlightStyle = hero.titleColor === "purple"
    ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
    : hero.titleColor === "emerald"
    ? "bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
    : "bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400"; // default cosmic index

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center py-20 px-4 overflow-hidden bg-transparent">
      {/* Interactive 3D drag floater elements */}
      <Floating3DGeometric />

      {/* Subtle additional glow beneath the avatar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left px-4 sm:px-6">
        {/* Left Side: Copywrite & Interactive Bio Info */}
        <div className="flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/[0.08] rounded-full backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-[10.5px] font-bold font-mono text-slate-300 uppercase tracking-wider">
              {settings?.heroBadgeText || hero.versionLabel || "ACTIVE INFRASTRUCTURE LAB"}
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 35, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ 
                type: "spring",
                stiffness: 55,
                damping: 14,
                mass: 1.1,
                delay: 0.12 
              }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans tracking-tight text-white leading-none"
            >
              {settings?.heroWelcomePrefix || "Architect of"}{" "}
              <span className={textHighlightStyle}>
                {hero.title || "Nischal KC"}
              </span>
            </motion.h1>

            <motion.h3
              initial={{ opacity: 0, y: 25, scale: 0.98, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ 
                type: "spring",
                stiffness: 50,
                damping: 13,
                mass: 1.1,
                delay: 0.28 
              }}
              className="text-lg sm:text-xl font-bold font-sans text-slate-300 tracking-wide"
            >
              {hero.subtitle || "Systems Architect & Bootleneck Software Engineer"}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-sans"
            >
              {hero.description || "Deploying robust distributed web architectures, auditing critical database nodes, and automating microservice scaling targets to guarantee optimal SLAs."}
            </motion.p>
          </div>

          {/* Social Links Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2"
          >
            {hero.githubUrl && (
              <a
                href={hero.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 cursor-pointer active:scale-95"
                title="Github Workspace"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {hero.linkedinUrl && (
              <a
                href={hero.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 cursor-pointer active:scale-95"
                title="Linkedin Credentials"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {hero.emailContact && (
              <a
                href={`mailto:${hero.emailContact}`}
                className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 cursor-pointer active:scale-95"
                title="Direct System Mailbox"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}

            {/* Custom Settings Social Links Map */}
            {settings?.socialLinks && settings.socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 flex items-center space-x-1"
                title={link.platform}
              >
                {getSocialIcon(link.icon)}
              </a>
            ))}
          </motion.div>

          {/* Call to Actions Triggers */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4"
          >
            <button
              onClick={onExplore}
              className="px-6 py-3 games-gradient-button text-white text-sm font-semibold rounded-xl border border-indigo-500/10 transition-all duration-300 flex items-center space-x-2 cursor-pointer active:scale-98 group"
            >
              <span>{hero.ctaText || "Explore Credentials"}</span>
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {hero.showResumeBtn && hero.resumeUrl && (
              <a
                href={hero.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 cursor-pointer active:scale-98"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Get Resume / Portfolio PDF</span>
              </a>
            )}
          </motion.div>
        </div>

        {/* Right Side: Avatar Showcase Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full max-w-[320px] md:max-w-[360px] flex-shrink-0"
        >


          <Interactive3DTilt glowColor="rgba(168, 85, 247, 0.2)">
            <div className="relative group p-1.5 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-white/5 shadow-2xl h-full">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 rounded-[2.5rem] blur opacity-15 duration-1000 group-hover:opacity-25 transition-opacity" />
              
              <div className="relative bg-slate-950 rounded-[2.3rem] overflow-hidden aspect-square border border-white/10">
                <img
                  src={hero.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"}
                  alt={hero.title || "Nischal KC"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </Interactive3DTilt>

          {/* Quick tech stack badges */}
          {techList.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-5">
              <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-400 w-full mb-1">
                {hero.techStackLabel || "Core Engine Technologies"}
              </span>
              {techList.slice(0, 5).map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[10px] font-mono text-slate-400 bg-slate-950/90 border border-white/5 rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
