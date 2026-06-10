import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, useScroll } from "motion/react";

interface Interactive3DTiltProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  key?: React.Key;
}

export function Interactive3DTilt({ children, className = "", glowColor = "rgba(99, 102, 241, 0.15)" }: Interactive3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Create motion values for rotation and mouse position
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  
  // Smooth out the movement using spring physics
  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-15, 15]), { stiffness: 150, damping: 20 });
  
  // Spot glare coordinates
  const glareX = useSpring(useTransform(x, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const glareY = useSpring(useTransform(y, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });

  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative position inside the card from 0 to 1
    const mouseX = (e.clientX - rect.left) / width;
    const mouseY = (e.clientY - rect.top) / height;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    // Reset to defaults
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`perspective-[1000px] h-full ${className}`}
    >
      <motion.div
        style={{
          rotateX: hovered ? rotateX : 0,
          rotateY: hovered ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full rounded-[2.5rem] transition-all duration-300 ease-out"
      >
        {/* Dynamic mouse-following glass glow overlay */}
        {hovered && (
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${glowColor} 0%, transparent 60%)`,
              transform: "translateZ(8px)",
            }}
            className="absolute inset-0 rounded-[2.5rem] pointer-events-none z-30 mix-blend-screen"
          />
        )}
        
        {/* Border shine gloss overlay */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 pointer-events-none z-20 transition-opacity duration-300 group-hover:border-white/20" />

        {/* Dynamic inner element wrapping */}
        <div style={{ transform: "translateZ(4px)", transformStyle: "preserve-3d" }} className="relative z-10 w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Interactive floating Game status overlay HUD
export function GamingStatsHUD() {
  const stats = [
    { label: "SLA RATIO", value: "99.98%", color: "text-emerald-400" },
    { label: "LATENCY", value: "14ms", color: "text-cyan-400" },
    { label: "EXPERIENCE", value: "LEVEL 24", color: "text-purple-400" },
    { label: "UPTIME", value: "365 DAYS", color: "text-indigo-400" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="hidden lg:flex flex-col space-y-3 p-4 bg-slate-950/70 border border-white/[0.05] backdrop-blur-xl rounded-2xl shadow-xl w-48 font-mono pointer-events-auto absolute -right-8 bottom-12 z-20"
      style={{ transform: "translateZ(20px)" }}
    >
      <div className="flex items-center space-x-1.5 border-b border-white/[0.08] pb-1.5 mb-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-[10px] font-bold tracking-widest text-slate-300">LIVE SYSTEM HUD</span>
      </div>
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col space-y-0.5">
          <span className="text-[8px] text-slate-500 font-bold tracking-wider">{stat.label}</span>
          <span className={`text-xs font-black ${stat.color}`}>{stat.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

// 3D-like floating abstract geometric elements (SVGs with multi-layer gradients & custom drag or flow effects)
export function Floating3DGeometric() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Interactive Floater 1: Neon Cyan Pyramid Shape */}
      <motion.div
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        dragElastic={0.4}
        animate={{
          y: [0, -25, 0],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[20%] left-[8%] w-16 h-16 opacity-30 cursor-grab active:cursor-grabbing pointer-events-auto hidden md:block"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-[0_10px_15px_rgba(34,211,238,0.2)]">
          <path d="M50 10 L15 80 L85 80 Z" fill="url(#pyramidGrad1)" />
          <path d="M50 10 L85 80 L50 90 Z" fill="url(#pyramidGrad2)" opacity="0.8" />
          <defs>
            <linearGradient id="pyramidGrad1" x1="50" y1="10" x2="15" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="pyramidGrad2" x1="50" y1="10" x2="85" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Interactive Floater 2: Neon Pink Torus/Ring */}
      <motion.div
        drag
        dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
        dragElastic={0.3}
        animate={{
          y: [-15, 20, -15],
          rotate: [0, -360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[55%] right-[10%] w-20 h-20 opacity-30 cursor-grab active:cursor-grabbing pointer-events-auto hidden md:block"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-[0_12px_20px_rgba(236,72,153,0.25)]">
          <circle cx="50" cy="50" r="30" stroke="url(#torusGrad)" strokeWidth="14" fill="none" />
          <defs>
            <linearGradient id="torusGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ec4899" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Interactive Floater 3: Neon Emerald Octahedron / Gem */}
      <motion.div
        drag
        dragConstraints={{ left: -80, right: 80, top: -80, bottom: 80 }}
        dragElastic={0.5}
        animate={{
          y: [15, -20, 15],
          rotateX: [0, 180, 360],
          rotateY: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[15%] left-[12%] w-14 h-14 opacity-25 cursor-grab active:cursor-grabbing pointer-events-auto hidden lg:block"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-[0_10px_15px_rgba(16,185,129,0.2)]">
          <path d="M50 5 L85 50 L50 95 L15 50 Z" fill="url(#gemGrad1)" />
          <path d="M50 5 L50 95 L15 50 Z" fill="url(#gemGrad2)" opacity="0.6" />
          <defs>
            <linearGradient id="gemGrad1" x1="50" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="gemGrad2" x1="50" y1="5" x2="15" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

// 3D Animated Developer Character Puppet built with modular layered visual elements
// Reacts on Scroll and Mouse Movements
export function CharacterPuppet3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Connect to actual window scroll
  const { scrollYProgress } = useScroll();
  
  // Scale scroll rate into custom rotation and float levels
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scrollTranslateY = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const gearOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [1, 0.7, 0.8, 1]);
  
  // Spring dynamics for smooth animated feel
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 90, damping: 22 });
  const smoothFloat = useSpring(scrollTranslateY, { stiffness: 100, damping: 18 });

  // Floating hover factors
  const hoverX = useMotionValue(0.5);
  const hoverY = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(hoverY, [0, 1], [25, -25]), { stiffness: 120, damping: 15 });
  const tiltY = useSpring(useTransform(hoverX, [0, 1], [-25, 25]), { stiffness: 120, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xVal = (e.clientX - rect.left) / rect.width;
    const yVal = (e.clientY - rect.top) / rect.height;
    hoverX.set(xVal);
    hoverY.set(yVal);
  };

  const handleMouseLeave = () => {
    hoverX.set(0.5);
    hoverY.set(0.5);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-square flex items-center justify-center p-4 cursor-pointer"
    >
      {/* 3D Space Scene box */}
      <motion.div 
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative flex items-center justify-center transition-shadow duration-300"
      >
        {/* Stage shadow background */}
        <div className="absolute bottom-[2%] w-[80%] h-6 bg-indigo-950/40 rounded-full blur-xl pointer-events-none transform -rotate-12 translate-z-[-20px]" />
        
        {/* Outer orbital rings (Renders a futuristic 3D gyroscope compass) */}
        <motion.div 
          style={{ rotate: smoothScrollRotate, transform: "translateZ(-15px)" }}
          className="absolute w-[95%] h-[95%] rounded-full border border-dashed border-indigo-500/15 pointer-events-none"
        />
        <motion.div 
          style={{ rotate: smoothScrollRotate, transform: "translateZ(-10px) rotate(-90deg)" }}
          className="absolute w-[80%] h-[80%] rounded-full border border-double border-purple-500/20 pointer-events-none"
        />

        {/* Floating Developer Desk Base Core */}
        <motion.div
          style={{ y: smoothFloat, transform: "translateZ(10px)" }}
          className="relative w-[75%] h-[75%] flex items-center justify-center"
        >
          {/* Main Character Holographic Core */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[85%] h-[85%] filter drop-shadow-[0_15px_22px_rgba(139,92,246,0.35)]">
            {/* Upper floating device body */}
            <motion.g 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Isometric 3D Screen Console Block */}
              <path d="M100 25 L160 55 L100 85 L40 55 Z" fill="url(#coreScreenTop)" />
              <path d="M40 55 L100 85 L100 135 L40 105 Z" fill="url(#coreScreenLeft)" />
              <path d="M100 85 L160 55 L160 105 L100 135 Z" fill="#4f46e5" opacity="0.85" />

              {/* Glowing Holographic Face matrix */}
              <circle cx="100" cy="85" r="30" fill="url(#neonGaze)" opacity="0.4" className="animate-pulse" />
              <path d="M85 85 Q100 100 115 85" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="88" cy="78" rx="3.5" ry="5.5" fill="#22d3ee" />
              <ellipse cx="112" cy="78" rx="3.5" ry="5.5" fill="#22d3ee" />
            </motion.g>

            {/* Floating Mechanical Antennas */}
            <motion.line 
              x1="60" y1="55" x2="35" y2="25" 
              stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round"
              animate={{ transform: ["rotate(0deg)", "rotate(-5deg)", "rotate(0deg)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.line 
              x1="140" y1="55" x2="165" y2="25" 
              stroke="#10b981" strokeWidth="3.5" strokeLinecap="round"
              animate={{ transform: ["rotate(0deg)", "rotate(5deg)", "rotate(0deg)"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            />

            {/* Glowing bottom server stack pedestal */}
            <path d="M100 135 L140 155 L100 175 L60 155 Z" fill="url(#serverBaseTop)" />
            <path d="M60 155 L100 175 L100 190 L60 170 Z" fill="url(#serverBaseLeft)" />
            <path d="M100 175 L140 155 L140 170 L100 190 Z" fill="#312e81" />

            {/* Glow definitions */}
            <defs>
              <linearGradient id="coreScreenTop" x1="100" y1="25" x2="100" y2="85" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="coreScreenLeft" x1="40" y1="55" x2="100" y2="135" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#3730a3" />
              </linearGradient>
              <radialGradient id="neonGaze" cx="100" cy="85" r="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="serverBaseTop" x1="100" y1="135" x2="100" y2="175" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e1b4b" />
                <stop offset="1" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="serverBaseLeft" x1="60" y1="155" x2="100" y2="190" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4338ca" />
                <stop offset="1" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Orbiting Component: DB Cylinder */}
        <motion.div 
          style={{ y: smoothFloat }}
          animate={{
            x: [35, 45, 35],
            y: [-125, -115, -125],
            rotate: [20, 25, 20],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-6 w-12 h-14 bg-emerald-950/50 border border-emerald-500/20 backdrop-blur-lg rounded-xl z-20 flex flex-col justify-center items-center shadow-[0_4px_15px_rgba(16,185,129,0.15)] pointer-events-none select-none"
        >
          {/* Cylinder 3D Server look */}
          <div className="w-[80%] h-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mt-1.5" />
          <div className="w-[80%] h-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mt-1.5 animate-pulse" />
          <div className="w-[80%] h-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mt-1.5" />
          <span className="text-[7px] font-mono text-emerald-400 font-extrabold mt-1 tracking-wider">DB_NODES</span>
        </motion.div>

        {/* Orbiting Component: Code bracket block */}
        <motion.div 
          style={{ y: smoothFloat }}
          animate={{
            x: [-35, -45, -35],
            y: [85, 75, 85],
            rotate: [-15, -10, -15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-6 w-14 h-14 bg-pink-950/40 border border-pink-500/20 backdrop-blur-lg rounded-xl z-20 flex flex-col justify-center items-center shadow-[0_4px_15px_rgba(236,72,153,0.15)] pointer-events-none select-none"
        >
          <span className="text-pink-400 text-lg font-black font-mono">{"{ }"}</span>
          <span className="text-[7px] font-mono text-pink-400/70 font-extrabold tracking-wider">TS_CORE</span>
        </motion.div>

        {/* Orbiting Component: Animated Floating Cloud Node */}
        <motion.div 
          style={{ y: smoothFloat }}
          animate={{
            x: [15, 5, 15],
            y: [-30, -10, -30],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-4 w-12 h-12 bg-cyan-950/50 border border-cyan-500/20 backdrop-blur-lg rounded-full z-20 flex flex-col justify-center items-center shadow-[0_4px_15px_rgba(6,182,212,0.15)] pointer-events-none select-none"
        >
          <span className="text-cyan-400 text-sm font-semibold animate-bounce">☁</span>
          <span className="text-[6.5px] font-mono text-cyan-400 font-extrabold tracking-widest mt-0.5">CLOUD</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 3D vertical sidebar scroll tracker widget
export function ScrollProgressIndicator3D() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [0, 1080]);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[90] hidden md:flex flex-col items-center space-y-4">
      {/* 3D Spin Indicator */}
      <motion.div 
        style={{ rotate: scrollRotate }}
        className="w-9 h-9 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-transform flex-shrink-0"
      >
        {/* Inside spinning atomic ring symbol */}
        <div className="w-5 h-5 rounded-full border border-dashed border-indigo-400 flex items-center justify-center animate-spin" style={{ animationDuration: "8s" }}>
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
        </div>
      </motion.div>

      {/* Progress Line */}
      <div className="relative w-1 h-36 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.02]">
        <motion.div 
          style={{ scaleY, originY: 0 }}
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full"
        />
      </div>

      <span className="text-[8px] font-mono font-bold tracking-widest text-slate-500 rotate-90 translate-y-4">SCROLL</span>
    </div>
  );
}

export function BackgroundCosmicParticles() {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3.5 + 1.5, // 1.5px to 5px
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 25 + 15, // 15 to 40 seconds
    delay: Math.random() * -25, // Negative delay to start immediately
    color: i % 4 === 0 
      ? "bg-indigo-500/25" 
      : i % 4 === 1 
        ? "bg-purple-500/30" 
        : i % 4 === 2
          ? "bg-cyan-400/25"
          : "bg-emerald-400/20"
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color} blur-[0.5px]`}
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.15, 0.7, 0.15],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

