"use client";

import React, { useRef, useState, useEffect } from "react";

interface GlassModuleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GlassModule({ children, className = "", style = {} }: GlassModuleProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [yOffset, setYOffset] = useState(0);

  useEffect(() => {
    // Zero-G idle floating drift
    let animFrameId: number;
    let startTime = Math.random() * 100;

    const tick = () => {
      const time = (Date.now() / 1000) + startTime;
      // Soft drift: translateY between -5px and 5px
      setYOffset(Math.sin(time * 1.5) * 5);
      animFrameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      
      // Calculate cursor position relative to card center (-0.5 to 0.5)
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      // Interpolate tilt: max 8 degrees for elegant, premium look
      setTilt({ x: x * 8, y: -y * 8 });
    };

    if (isHovered) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovered]);

  return (
    <div
      ref={cardRef}
      className={`glass-module ${className}`}
      style={{
        ...style,
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${yOffset - 3}px)`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(${yOffset}px)`,
        transition: isHovered ? "transform 0.05s ease-out" : "transform 0.5s ease"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
    >
      {children}
    </div>
  );
}
