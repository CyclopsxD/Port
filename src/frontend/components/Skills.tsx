import React, { useState } from "react";
import { motion } from "motion/react";
import { Cpu, Layout, Server, Settings, Palette } from "lucide-react";
import { PortfolioSkill, SystemSettings } from "../types";
import { Interactive3DTilt } from "./AmbientElements";

interface SkillsProps {
  skills: PortfolioSkill[];
  settings?: SystemSettings;
}

export default function Skills({ skills, settings }: SkillsProps) {
  const [activeTab, setActiveTab] = useState<"All" | "Frontend" | "Backend" | "DevOps" | "Design/Other">("All");

  const categories = [
    { id: "All", label: "All Skills", icon: Cpu },
    { id: "Frontend", label: "Frontend", icon: Layout },
    { id: "Backend", label: "Backend", icon: Server },
    { id: "DevOps", label: "DevOps/Infra", icon: Settings },
    { id: "Design/Other", label: "Design/Other", icon: Palette }
  ];

  const filteredSkills = activeTab === "All" 
    ? skills 
    : skills.filter(s => s.category === activeTab);

  const slideInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  const stiff = settings?.boxAnimationStiffness ?? 100;
  const damp = settings?.boxAnimationDamping ?? 15;

  return (
    <motion.section 
      id="skills-section" 
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
            staggerChildren: 0.12
          }
        }
      }}
      className="py-24 px-4 bg-transparent"
    >
      <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <motion.p variants={slideInUp} className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] font-mono">
            {settings?.skillsSubLabel || "Tech Stack Capabilities"}
          </motion.p>
          <motion.h2 variants={slideInUp} className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {settings?.skillsSectionHeading ? (
              <span>
                {settings.skillsSectionHeading.split(" ")[0]} <span className="text-indigo-400">{settings.skillsSectionHeading.split(" ").slice(1).join(" ")}</span>
              </span>
            ) : (
              <span>Technical <span className="text-indigo-400">Expertise</span></span>
            )}
          </motion.h2>
          <motion.div variants={slideInUp} className="w-12 h-1 bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] mx-auto rounded-full mt-2" />
        </div>

        {/* Category Toggles */}
        <motion.div variants={slideInUp} className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                id={`skills-tab-${cat.id}`}
                onClick={() => setActiveTab(cat.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer border transition-all ${
                  isActive
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Skills Level Representation Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
        >
          {filteredSkills.map((skill, index) => {
            const getGlowColor = (cat: string) => {
              if (cat === "Frontend") return "rgba(99, 102, 241, 0.18)";
              if (cat === "Backend") return "rgba(168, 85, 247, 0.18)";
              if (cat === "DevOps") return "rgba(236, 72, 153, 0.18)";
              return "rgba(16, 185, 129, 0.18)";
            };

            return (
              <Interactive3DTilt key={skill.id} glowColor={getGlowColor(skill.category)}>
                <motion.div
                  layout
                  id={`skill-item-${skill.id}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  whileHover={{ 
                    y: -5,
                    borderColor: "rgba(99, 102, 241, 0.45)"
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: (index % 3) * 0.08,
                    type: "spring",
                    stiffness: stiff,
                    damping: damp
                  }}
                  className="custom-card-glass custom-card-border custom-card-glow hover:border-indigo-500/30 p-5 rounded-[2.5rem] flex flex-col justify-between cursor-default transition-colors duration-300 h-full"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-white font-display text-sm tracking-wide">
                      {skill.name}
                    </span>
                    <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold">
                      {skill.level}%
                    </span>
                  </div>

                  {/* Progress Container */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-[#050508] h-2 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      />
                    </div>
                    
                    <span className="text-[10px] text-slate-500 font-mono font-medium block">
                      Domain Profile: {skill.category} List
                    </span>
                  </div>
                </motion.div>
              </Interactive3DTilt>
            );
          })}
        </motion.div>

      </div>
    </motion.section>
  );
}
