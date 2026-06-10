import React from "react";
import { motion } from "motion/react";
import { Tooltip } from "recharts";
import { Award, Briefcase, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { PortfolioAbout, TimelineEvent, SystemSettings } from "../types";
import { Interactive3DTilt } from "./AmbientElements";

interface AboutProps {
  about: PortfolioAbout;
  timeline: TimelineEvent[];
  settings?: SystemSettings;
}

export default function About({ about, timeline, settings }: AboutProps) {
  const slideInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  const stiff = settings?.boxAnimationStiffness ?? 100;
  const damp = settings?.boxAnimationDamping ?? 15;

  return (
    <motion.section 
      id="about-section" 
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
      className="py-24 px-4 bg-transparent relative"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="max-w-7xl mx-auto space-y-16 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <motion.div
            variants={slideInUp}
            className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] font-mono"
          >
            {settings?.aboutMilestoneLabel || "Milestones & Bio"}
          </motion.div>
          <motion.h2
            variants={slideInUp}
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white"
          >
            {settings?.aboutSectionHeading ? (
              <span>
                {settings.aboutSectionHeading.split(" & ")[0]} <span className="text-indigo-400">{settings.aboutSectionHeading.split(" & ")[1] || "Experience"}</span>
              </span>
            ) : (
              <span>About & <span className="text-indigo-400">Experience</span></span>
            )}
          </motion.h2>
          <motion.div variants={slideInUp} className="w-12 h-1 bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] mx-auto rounded-full mt-2" />
        </div>

        {/* Story & Bento Grid Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Detailed Narrative */}
          <Interactive3DTilt className="lg:col-span-7" glowColor="rgba(99, 102, 241, 0.15)">
            <motion.div 
              variants={slideInUp}
              className="custom-card-glass custom-card-border custom-card-glow rounded-[2.5rem] p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Award className="w-5 h-5" />
                  <h3 className="font-display text-xl font-bold text-white">
                    {about.title}
                  </h3>
                </div>
                <p className="text-base text-slate-300 leading-relaxed font-sans">
                  {about.content}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <span className="text-4xl font-display font-extrabold text-indigo-400">
                    {about.yearsOfExperience}+
                  </span>
                  <span className="text-xs text-slate-400 leading-tight block">
                    Years of<br />Industry Exp
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center space-x-1.5 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{settings?.aboutVerificationText || "Verified Nepal Resident Code-base Author"}</span>
                </div>
              </div>
            </motion.div>
          </Interactive3DTilt>

          {/* Dynamic Stat Bento Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {about.highlightStats.map((stat, idx) => (
              <Interactive3DTilt key={stat.label} glowColor="rgba(168, 85, 247, 0.18)">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 25, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ 
                    scale: 1.04, 
                    y: -5
                  }}
                  transition={{ 
                    duration: 0.4, 
                    type: "spring",
                    stiffness: stiff,
                    damping: damp
                  }}
                  className="custom-card-glass custom-card-border custom-card-glow hover:border-indigo-500/30 rounded-[2.5rem] p-5 flex flex-col justify-between transition-colors duration-300 cursor-default h-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <TrendingUp className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white leading-none">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase font-mono tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              </Interactive3DTilt>
            ))}
          </div>

        </div>

        {/* Career Timeline */}
        <motion.div variants={slideInUp} className="space-y-8">
          <div className="flex items-center space-x-2 text-white">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h3 className="font-display text-xl font-bold">{settings?.aboutTimelineHeading || "Professional History"}</h3>
          </div>

          <div className="relative border-l border-white/10 ml-4 pl-6 sm:pl-8 space-y-12">
            {timeline.map((event, index) => (
              <motion.div
                key={event.id}
                id={`timeline-event-${event.id}`}
                initial={{ opacity: 0, x: -30, y: 15 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ 
                  type: "spring",
                  stiffness: stiff + 50,
                  damping: damp + 5,
                  delay: index * 0.08 
                }}
                className="relative group/timeline"
              >
                {/* Timeline node icon with glow on hover */}
                <span className="absolute -left-[51px] sm:-left-[59px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-[#050508] border border-white/10 text-[10px] text-white group-hover/timeline:border-indigo-500/50 group-hover/timeline:shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 group-hover/timeline:scale-110 transition-transform" />
                </span>

                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="custom-card-glass custom-card-border custom-card-glow hover:border-indigo-500/30 p-5 sm:p-6 rounded-2xl transition-colors duration-300 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <h4 className="text-lg font-bold text-white font-display group-hover/timeline:text-indigo-400 transition-colors">
                        {event.role}
                      </h4>
                      <p className="text-sm font-medium text-indigo-400 font-mono">
                        {event.company}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/40 border border-white/5 text-slate-350 w-fit">
                      {event.period}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-sans pt-1">
                    {event.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
