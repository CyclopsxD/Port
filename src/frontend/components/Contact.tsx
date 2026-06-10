import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle, Mail, MapPin, Sparkles, Building } from "lucide-react";
import { ContactMessage, SystemSettings } from "../types";
import Confetti from "./Confetti";
import { Interactive3DTilt } from "./AmbientElements";

interface ContactProps {
  onSendMessage: (message: Omit<ContactMessage, "id" | "timestamp" | "read">) => void;
  settings?: SystemSettings;
}

export default function Contact({ onSendMessage, settings }: ContactProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSubmitting(true);
    
    // Simulate 1.2s network transit
    setTimeout(() => {
      onSendMessage({
        name: form.name,
        email: form.email,
        subject: form.subject || "General Consultation Inquiry",
        message: form.message
      });

      setIsSubmitting(false);
      setShowSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      
      // Clear banner
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1200);
  };

  const slideInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  return (
    <motion.section 
      id="contact-section" 
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
        
        {/* Section Heading */}
        <div className="text-center space-y-3">
          <motion.p variants={slideInUp} className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] font-mono">
            {settings?.contactSubLabel || "Secure Communications"}
          </motion.p>
          <motion.h2 variants={slideInUp} className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {settings?.contactSectionHeading ? (
              <span>
                {settings.contactSectionHeading.split(" ")[0]} <span className="text-indigo-400">{settings.contactSectionHeading.split(" ").slice(1).join(" ")}</span>
              </span>
            ) : (
              <span>Get In <span className="text-indigo-400">Touch</span></span>
            )}
          </motion.h2>
          <motion.div variants={slideInUp} className="w-12 h-1 bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] mx-auto rounded-full mt-2" />
        </div>

        {/* Contact Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Info Panel Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="lg:col-span-5 space-y-8 lg:pr-8"
          >
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">{settings?.contactSidebarTitle || "Let's Discuss New Ventures"}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans font-medium">
                {settings?.contactSidebarContent || "Whether you have an upcoming project to launch, a system architecture to audit, or a complex system bottleneck to solve, my inbox is open. I synchronize logs daily and reply with direct technical reviews inside 24 hours."}
              </p>
            </div>

            {/* Structured details cards */}
            <div className="space-y-4">
              <Interactive3DTilt glowColor="rgba(99, 102, 241, 0.2)">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="flex items-center space-x-3.5 p-5 custom-card-glass custom-card-border custom-card-glow hover:border-indigo-500/20 rounded-[2.5rem] text-sm transition-colors cursor-default"
                >
                  <div className="p-2 bg-indigo-500/15 rounded-xl text-indigo-400">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">Direct Connect</h4>
                    <p className="text-indigo-300 font-bold mt-0.5 font-mono">12kcnischal@gmail.com</p>
                  </div>
                </motion.div>
              </Interactive3DTilt>

              <Interactive3DTilt glowColor="rgba(168, 85, 247, 0.18)">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="flex items-center space-x-3.5 p-5 custom-card-glass custom-card-border custom-card-glow hover:border-indigo-500/20 rounded-[2.5rem] text-sm transition-colors cursor-default"
                >
                  <div className="p-2 bg-indigo-500/15 rounded-xl text-indigo-400">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">Geographical Base</h4>
                    <p className="text-slate-300 font-semibold mt-0.5">Kathmandu, Nepal</p>
                  </div>
                </motion.div>
              </Interactive3DTilt>

              <Interactive3DTilt glowColor="rgba(16, 185, 129, 0.18)">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="flex items-center space-x-3.5 p-5 custom-card-glass custom-card-border custom-card-glow hover:border-indigo-500/20 rounded-[2.5rem] text-sm transition-colors cursor-default"
                >
                  <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-400">
                    <Building className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">Workspace Model</h4>
                    <p className="text-slate-300 font-semibold mt-0.5">Hybrid / Remote Available</p>
                  </div>
                </motion.div>
              </Interactive3DTilt>
            </div>

            <div className="pt-4 flex items-center space-x-2 text-xs text-slate-500 font-mono">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{settings?.contactFooterLabel || "TLS End-to-End Encrypted Node Gateway"}</span>
            </div>
          </motion.div>

          {/* Form Panel Right */}
          <div className="lg:col-span-7">
            <Interactive3DTilt glowColor="rgba(99, 102, 241, 0.15)">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, type: "spring", stiffness: 120, delay: 0.1 }}
                className="custom-card-glass custom-card-border custom-card-glow rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden"
              >
                <h3 className="font-display font-semibold text-lg text-white mb-6">{settings?.contactFormTitle || "Send Message Inquiry"}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Your Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g., Subash Thapa"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-4 py-3 bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-zinc-655"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Your Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g., subash@organization.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-4 py-3 bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-zinc-655"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Subject Theme</label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g., HamroShare platform contract negotiation"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="px-4 py-3 bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-zinc-655"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Message Body <span className="text-red-400">*</span></label>
                <textarea
                  required
                  disabled={isSubmitting}
                  rows={5}
                  placeholder="Detail your requirements or inquiry notes here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="px-4 py-3 bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl text-white text-sm focus:outline-none transition-all leading-relaxed placeholder:text-zinc-655"
                />
              </div>

              <motion.button
                id="contact-submit-btn"
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all border border-indigo-500/20 ${
                  isSubmitting ? "bg-slate-800 text-gray-500" : "shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Transmitting..." : (settings?.contactCtaText || "Establish Communication Channel")}</span>
              </motion.button>
            </form>

            {/* Toast submission notification */}
            <AnimatePresence>
              {showSuccess && (
                <>
                  <Confetti />
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="absolute inset-0 bg-[#050508] border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in"
                  >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white font-display">Inquiry Transmitted Successfully</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Your query has been securely synchronized directly into Nischal's Admin Inbox module. Verify this by clicking "Admin Panel" in the nav bar.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 font-mono text-xs rounded border border-white/10 cursor-pointer"
                  >
                    Send Another
                  </button>
                </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </Interactive3DTilt>
      </div>

        </div>

      </div>
    </motion.section>
  );
}
