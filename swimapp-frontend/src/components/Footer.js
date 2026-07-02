import React from "react";
import { FaSwimmingPool } from "react-icons/fa";

const techStack = ["React", "Django REST Framework", "PostgreSQL"];

export default function Footer() {
  return (
    <footer style={{
      background: "rgba(10, 22, 40, 0.98)",
      borderTop: "1px solid rgba(14, 165, 233, 0.18)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Top glow accent line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "40%",
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.6), transparent)",
        pointerEvents: "none",
      }} />

      {/* Faint lane-line background texture */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent calc(12.5% - 1px), rgba(14,165,233,0.03) calc(12.5% - 1px), rgba(14,165,233,0.03) 12.5%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "44px 24px 28px",
      }}>

        {/* Top row */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "28px",
          marginBottom: "32px",
        }}>

          {/* Branding */}
          <div style={{ minWidth: "200px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(14,165,233,0.1)",
                border: "1px solid rgba(14,165,233,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <FaSwimmingPool size={16} color="#0EA5E9" />
              </div>
              <span style={{
                fontSize: "16px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.01em",
              }}>
                SwimMeet
              </span>
            </div>
            <p style={{
              margin: 0,
              fontSize: "12px",
              color: "#475569",
              lineHeight: "1.6",
              maxWidth: "210px",
            }}>
              A full-stack swim competition platform built for district, state &amp; national level meets.
            </p>
          </div>

          {/* Tech stack */}
          <div>
            <p style={{
              margin: "0 0 10px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#475569",
              textTransform: "uppercase",
            }}>
              Built with
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {techStack.map((tech) => (
                <span key={tech} style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#38BDF8",
                  background: "rgba(14,165,233,0.08)",
                  border: "1px solid rgba(14,165,233,0.18)",
                  borderRadius: "999px",
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.15), transparent)",
          marginBottom: "22px",
        }} />

        {/* Bottom row */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}>

          {/* Developer credit */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}>
              V
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#E2E8F0" }}>
                Vishnu Bhargava
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>
                Jaypee University of Information Technology
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p style={{
            margin: 0,
            fontSize: "11px",
            color: "#334155",
            letterSpacing: "0.02em",
          }}>
            © 2026 SwimMeet Management System. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}