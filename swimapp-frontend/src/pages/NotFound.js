import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaSwimmingPool } from "react-icons/fa";

export default function NotFound() {
  const canvasRef = useRef(null);

  // Animated pool lane ripple background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Lane divider lines with sine-wave ripple
      const numLanes = 8;
      const laneW = width / numLanes;

      for (let i = 1; i < numLanes; i++) {
        const x = i * laneW;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(14, 165, 233, ${0.06 + 0.04 * Math.sin(t * 0.8 + i)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 14]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Horizontal wave lines (like pool water surface)
      for (let y = 80; y < height; y += 48) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.04 + 0.025 * Math.sin(t + y * 0.02)})`;
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += 4) {
          const wave = Math.sin(x * 0.012 + t * 1.2 + y * 0.03) * 6;
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      // Subtle bubble particles
      for (let b = 0; b < 12; b++) {
        const bx = ((b * 137 + t * 18) % width);
        const by = height - ((t * 22 + b * 80) % height);
        const alpha = 0.04 + 0.04 * Math.sin(t + b);
        ctx.beginPath();
        ctx.arc(bx, by, 2 + b % 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${alpha})`;
        ctx.fill();
      }

      t += 0.016;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0A1628 0%, #0d1f3c 60%, #0A1628 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated canvas background */}
      <canvas ref={canvasRef} style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }} />

      {/* Glow blob */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
        height: "300px",
        background: "radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Main card */}
      <div style={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        maxWidth: "560px",
        width: "100%",
        background: "rgba(14, 165, 233, 0.04)",
        border: "1px solid rgba(14, 165, 233, 0.18)",
        borderRadius: "24px",
        padding: "52px 40px 44px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(14,165,233,0.08)",
      }}>

        {/* Icon */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "rgba(14, 165, 233, 0.1)",
          border: "1px solid rgba(14, 165, 233, 0.25)",
          marginBottom: "28px",
          boxShadow: "0 0 24px rgba(14,165,233,0.2)",
        }}>
          <FaSwimmingPool size={28} color="#0EA5E9" />
        </div>

        {/* 404 — scoreboard style */}
        <div style={{ marginBottom: "8px", lineHeight: 1 }}>
          <span style={{
            fontFamily: "'Courier New', 'Lucida Console', monospace",
            fontSize: "clamp(72px, 16vw, 110px)",
            fontWeight: 800,
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #0EA5E9 30%, #38BDF8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
            filter: "drop-shadow(0 0 28px rgba(14,165,233,0.45))",
          }}>
            404
          </span>
        </div>

        {/* Timing-board label below 404 */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(14, 165, 233, 0.08)",
          border: "1px solid rgba(14, 165, 233, 0.2)",
          borderRadius: "999px",
          padding: "4px 14px",
          marginBottom: "24px",
        }}>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#0EA5E9",
            display: "inline-block",
            boxShadow: "0 0 6px #0EA5E9",
          }} />
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#38BDF8",
            textTransform: "uppercase",
          }}>
            Lane Not Found
          </span>
        </div>

        {/* Heading */}
        <h2 style={{
          margin: "0 0 12px",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: "#E2E8F0",
          letterSpacing: "0.01em",
        }}>
          You've gone out of bounds
        </h2>

        {/* Body */}
        <p style={{
          color: "#94A3B8",
          margin: "0 0 36px",
          fontSize: "0.95rem",
          lineHeight: "1.65",
        }}>
          This page doesn't exist or was moved to a different lane.
          Head back to the starting block and try again.
        </p>

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.25), transparent)",
          marginBottom: "32px",
        }} />

        {/* CTA */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(14,165,233,0.35)",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(14,165,233,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(14,165,233,0.35)";
            }}
          >
            🏊 Back to Home
          </button>
        </Link>

        {/* Footer note */}
        <p style={{
          marginTop: "20px",
          fontSize: "0.78rem",
          color: "#475569",
        }}>
          SwimMeet Management System
        </p>
      </div>
    </div>
  );
}