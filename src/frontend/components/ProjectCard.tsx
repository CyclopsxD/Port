import React from "react";
import { motion } from "motion/react";
import { ExternalLink, Github, Sparkles, Flame, Code } from "lucide-react";
import { PortfolioProject } from "../types";
import { Interactive3DTilt } from "./AmbientElements";

interface ProjectCardProps {
  project: PortfolioProject;
  onTrackClick: (id: string) => void;
  key?: React.Key;
}

const getCategoryColors = (category: string) => {
  const cat = (category || "").toLowerCase();
  
  if (cat.includes("web") || cat.includes("frontend") || cat.includes("react")) {
    return {
      border: "hover:border-indigo-500/40",
      glow: "hover:shadow-[0_0_24px_rgba(99,102,241,0.18)]",
      gradient: "from-indigo-600/8 to-blue-600/4",
      badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600"
    };
  }
  if (cat.includes("mobile") || cat.includes("android") || cat.includes("ios") || cat.includes("flutter")) {
    return {
      border: "hover:border-purple-500/40",
      glow: "hover:shadow-[0_0_24px_rgba(168,85,247,0.18)]",
      gradient: "from-purple-600/8 to-pink-600/4",
      badge: "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-600"
    };
  }
  if (cat.includes("cloud") || cat.includes("backend") || cat.includes("system") || cat.includes("infra") || cat.includes("node") || cat.includes("api")) {
    return {
      border: "hover:border-emerald-500/40",
      glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.18)]",
      gradient: "from-emerald-600/8 to-teal-600/4",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600"
    };
  }
  if (cat.includes("ai") || cat.includes("intelligence") || cat.includes("model") || cat.includes("ml") || cat.includes("data") || cat.includes("llm")) {
    return {
      border: "hover:border-amber-500/40",
      glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.18)]",
      gradient: "from-amber-600/8 to-orange-600/4",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-600"
    };
  }
  
  // Default values
  return {
    border: "hover:border-indigo-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
    gradient: "from-indigo-600/5 to-purple-600/5",
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-600"
  };
};

export default function ProjectCard({ project, onTrackClick }: ProjectCardProps) {
  const handleLinkClick = (e: React.MouseEvent) => {
    // Track click when a demo or github link is used
    onTrackClick(project.id);
  };

  const colors = getCategoryColors(project.category);

  return (
    <div className="h-full w-full select-none will-change-transform">
      <Interactive3DTilt className="h-full" glowColor="rgba(99, 102, 241, 0.2)">
        <motion.div
          layout
          whileHover={{ y: -8, scale: 1.015 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          style={{ transformStyle: "preserve-3d" }}
          className={`group relative bg-[#0d0d18]/70 border border-white/[0.04] ${colors.border} ${colors.glow} rounded-[2.5rem] p-6 flex flex-col justify-between overflow-hidden shadow-xl h-full will-change-transform`}
        >
          {/* Background ambient glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

          <div className="space-y-4" style={{ transformStyle: "preserve-3d" }}>
            {/* Project Thumbnail Image with 3D Pop on Hover */}
            <motion.div 
              style={{ transformStyle: "preserve-3d", z: 10 }}
              whileHover={{ z: 25, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-white/5"
            >
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-[#0e0e1a] flex items-center justify-center">
                  <Code className="w-10 h-10 text-slate-800" />
                </div>
              )}

              {/* Category Pill Tag floating extra high */}
              <motion.span 
                style={{ z: 40 }}
                whileHover={{ z: 50, scale: 1.05 }}
                className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider uppercase bg-slate-900/90 rounded-full border backdrop-blur-md shadow-sm transition-all duration-200 ${colors.badge}`}
              >
                {project.category}
              </motion.span>

              {/* Project click stats floating extra high */}
              {project.clicksCount > 0 && (
                <motion.div 
                  style={{ z: 40 }}
                  whileHover={{ z: 48, scale: 1.03 }}
                  className="absolute bottom-3 right-3 px-2 py-0.5 text-[9.5px] font-bold font-mono uppercase bg-[#181829]/95 text-emerald-400 rounded-md border border-emerald-500/10 flex items-center space-x-1 backdrop-blur-md shadow-sm"
                >
                  <Flame className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{project.clicksCount} clicks</span>
                </motion.div>
              )}
            </motion.div>

            {/* Project Title & Context floating at depth */}
            <motion.div 
              style={{ z: 15 }}
              className="space-y-2 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors duration-200">
                  {project.title}
                </h4>
                {project.featured && (
                  <motion.span 
                    style={{ z: 25 }}
                    className="flex-shrink-0 flex items-center text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase font-mono shadow-sm"
                  >
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    Featured
                  </motion.span>
                )}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-3">
                {project.description}
              </p>
            </motion.div>
          </div>

          <div className="space-y-4 pt-4" style={{ transformStyle: "preserve-3d" }}>
            {/* Tech Stack Pills List */}
            {project.techStack && project.techStack.length > 0 && (
              <motion.div 
                style={{ z: 15 }}
                className="flex flex-wrap gap-1.5 justify-start"
              >
                {project.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[9.5px] font-mono tracking-wide text-slate-400 bg-white/[0.02] border border-white/[0.04] rounded"
                  >
                    {tech}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Bottom Actions Row */}
            <motion.div 
              style={{ z: 20, transformStyle: "preserve-3d" }}
              className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.03]"
            >
              {project.githubUrl && (
                <motion.a
                  style={{ z: 30 }}
                  whileHover={{ z: 40, scale: 1.05 }}
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/5 hover:border-white/10 transition-all duration-200 text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Source</span>
                </motion.a>
              )}

              {project.liveUrl && (
                <motion.a
                  style={{ z: 30 }}
                  whileHover={{ z: 42, scale: 1.05 }}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg border border-indigo-500/30 transition-all duration-200 text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)] active:scale-95"
                >
                  <span>Launch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </motion.a>
              )}
            </motion.div>
          </div>
        </motion.div>
      </Interactive3DTilt>
    </div>
  );
}
