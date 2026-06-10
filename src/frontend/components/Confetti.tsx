import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  spin: number;
}

const COLORS = ["#6366f1", "#4f46e5", "#10b981", "#059669", "#f59e0b", "#d97706", "#ec4899", "#8b5cf6"];

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: 35 + Math.random() * 30, // center it a bit around the middle
      y: 40 + Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.2,
      duration: 1 + Math.random() * 1.5,
      spin: Math.random() * 360,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => {
        const angle = (p.id / 40) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
        const speed = 100 + Math.random() * 150;
        const tx = Math.cos(angle) * speed;
        const ty = Math.sin(angle) * speed - 50; // drag up/down

        return (
          <div
            key={p.id}
            className="absolute rounded-sm opacity-90 animate-out fade-out"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              transform: `rotate(${p.spin}deg)`,
              animation: `confetti-blast-${p.id} ${p.duration}s cubic-bezier(0.1, 0.8, 0.3, 1) ${p.delay}s forwards`,
            }}
          >
            <style>{`
              @keyframes confetti-blast-${p.id} {
                0% {
                  transform: translate(0, 0) rotate(0deg) scale(1);
                  opacity: 1;
                }
                100% {
                  transform: translate(${tx}px, ${ty}px) rotate(${p.spin * 4}deg) scale(0);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}
