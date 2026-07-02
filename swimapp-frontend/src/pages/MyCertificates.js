import React, { useEffect, useState } from "react";
import { certificatesAPI } from "../services/api";

// ---- Theme tokens (matches navy/blue glassmorphism Navbar) ----
const theme = {
    bgDeep: "rgba(10, 22, 40, 0.95)",
    bgPanel: "rgba(14, 165, 233, 0.06)",
    glassBorder: "rgba(14, 165, 233, 0.2)",
    glassBorderHover: "rgba(14, 165, 233, 0.4)",
    textPrimary: "#E2E8F0",
    textMuted: "#94A3B8",
    blueAccent: "#0EA5E9",
    blueAccentLight: "#38BDF8",
    blueGlow: "rgba(14, 165, 233, 0.35)",
    gold: "#E6B73D",
    goldGlow: "rgba(230, 183, 61, 0.35)",
    silver: "#C7CFDB",
    silverGlow: "rgba(199, 207, 219, 0.30)",
    bronze: "#CB8A4F",
    bronzeGlow: "rgba(203, 138, 79, 0.30)",
};

function SectionHeading({ icon, title, count, accent, glow }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "40px 0 18px",
        }}>
            <div style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
                border: `1px solid ${accent}55`,
                boxShadow: `0 0 18px ${glow}`,
            }}>
                {icon}
            </div>
            <h3 style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: theme.textPrimary,
            }}>
                {title}
            </h3>
            <span style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: theme.textMuted,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${theme.glassBorder}`,
                borderRadius: "999px",
                padding: "2px 10px",
                marginLeft: "2px",
            }}>
                {count}
            </span>
            <div style={{
                flex: 1,
                height: "1px",
                background: `linear-gradient(90deg, ${theme.glassBorder}, transparent)`,
            }} />
        </div>
    );
}

function EmptyRow({ label }) {
    return (
        <div style={{
            padding: "18px 20px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.03)",
            border: `1px dashed ${theme.glassBorder}`,
            color: theme.textMuted,
            fontSize: "0.9rem",
        }}>
            {label}
        </div>
    );
}

function CertCard({ title, subtitle, rank, accent, glow, buttonLabel, onClick }) {
    const [hover, setHover] = useState(false);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "18px 20px",
                marginBottom: "14px",
                borderRadius: "14px",
                background: theme.bgPanel,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: `1px solid ${hover ? theme.glassBorderHover : theme.glassBorder}`,
                boxShadow: hover
                    ? `0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px ${accent}22, 0 0 24px ${glow}`
                    : "0 4px 16px rgba(0,0,0,0.25)",
                transform: hover ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.25s ease",
                overflow: "hidden",
            }}
        >
            {/* Lane-line accent edge */}
            <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                background: `linear-gradient(180deg, ${accent}, ${accent}66)`,
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "10px" }}>
                {rank !== undefined && (
                    <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "1rem",
                        color: accent,
                        background: `${accent}1A`,
                        border: `1px solid ${accent}44`,
                    }}>
                        #{rank}
                    </div>
                )}
                <div>
                    <h5 style={{
                        margin: 0,
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: theme.textPrimary,
                    }}>
                        {title}
                    </h5>
                    {subtitle && (
                        <p style={{
                            margin: "4px 0 0",
                            fontSize: "0.85rem",
                            color: theme.textMuted,
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={onClick}
                style={{
                    flexShrink: 0,
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: `1px solid ${accent}55`,
                    background: hover
                        ? `linear-gradient(135deg, ${accent}, ${accent}AA)`
                        : `${accent}22`,
                    color: hover ? "#0A1628" : accent,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                }}
            >
                {buttonLabel}
            </button>
        </div>
    );
}

function MyCertificates() {
    const [data, setData] = useState({
        participation: [],
        gold: [],
        silver: [],
        bronze: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCertificates();
    }, []);

    async function loadCertificates() {
        try {
            const response = await certificatesAPI.getMyCertificates();
            setData(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function downloadCertificate(type, id) {

        try {
    
            let response;
    
            switch (type) {
    
                case "participation":
    
                    response =
                        await certificatesAPI.downloadParticipation(id);
    
                    break;
    
                case "gold":
    
                    response =
                        await certificatesAPI.downloadGold(id);
    
                    break;
    
                case "silver":
    
                    response =
                        await certificatesAPI.downloadSilver(id);
    
                    break;
    
                case "bronze":
    
                    response =
                        await certificatesAPI.downloadBronze(id);
    
                    break;
    
                default:
                    return;
    
            }
    
            const blob = new Blob(
                [response.data],
                {
                    type: "application/pdf",
                }
            );
    
            const fileURL =
                window.URL.createObjectURL(blob);
    
            const link =
                document.createElement("a");
    
            link.href = fileURL;
    
            link.download =
                `${type}_certificate.pdf`;
    
            document.body.appendChild(link);
    
            link.click();
    
            link.remove();
    
            window.URL.revokeObjectURL(fileURL);
    
        }
    
        catch (error) {

            console.log("DOWNLOAD ERROR:", error);
        
            console.log("Status:", error.response?.status);
        
            console.log("Data:", error.response?.data);
        
            alert(
                `Error ${error.response?.status}\n` +
                JSON.stringify(error.response?.data)
            );
        
        }
    
    }

    const totalCerts =
        (data.participation?.length || 0) +
        (data.gold?.length || 0) +
        (data.silver?.length || 0) +
        (data.bronze?.length || 0);

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(180deg, #0A1628 0%, #0A1628 100%)",
            padding: "32px 16px 64px",
        }}>
            <div style={{ maxWidth: "780px", margin: "0 auto" }}>

                {/* Hero header */}
                <div style={{
                    borderRadius: "18px",
                    padding: "28px 28px",
                    background: theme.bgPanel,
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: `1px solid ${theme.glassBorder}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 40px ${theme.blueGlow}`,
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            letterSpacing: "0.01em",
                        }}>
                            <span style={{ fontSize: "1.4rem", marginRight: "8px" }}>🏆</span>
                            <span style={{
                                background: `linear-gradient(135deg, ${theme.blueAccent}, ${theme.blueAccentLight})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}>
                                My Certificates
                            </span>
                        </h2>
                        <p style={{
                            margin: "6px 0 0",
                            color: theme.textMuted,
                            fontSize: "0.9rem",
                        }}>
                            Every dive, every lap, every podium finish — all in one place.
                        </p>
                    </div>
                    <div style={{
                        textAlign: "center",
                        padding: "8px 18px",
                        borderRadius: 20,
                        background: "rgba(14, 165, 233, 0.1)",
                        border: "1px solid rgba(14, 165, 233, 0.3)",
                    }}>
                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: theme.blueAccent }}>
                            {totalCerts}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: theme.textMuted, letterSpacing: "0.04em" }}>
                            TOTAL
                        </div>
                    </div>
                </div>

                {loading && (
                    <p style={{ color: theme.textMuted, textAlign: "center", marginTop: "40px" }}>
                        Loading your certificates…
                    </p>
                )}

                {!loading && (
                    <>
                        {/* Participation */}
                        <SectionHeading
                            icon="🎽"
                            title="Participation Certificates"
                            count={data.participation?.length || 0}
                            accent={theme.blueAccent}
                            glow={theme.blueGlow}
                        />
                        {data.participation?.length === 0 ? (
                            <EmptyRow label="No participation certificates yet — compete in a meet to earn one." />
                        ) : (
                            data.participation.map((item) => (
                                <CertCard
                                    key={item.registration_id}
                                    title={item.event}
                                    subtitle={item.meet}
                                    accent={theme.blueAccent}
                                    glow={theme.blueGlow}
                                    buttonLabel="Download"
                                    onClick={() =>
                                        downloadCertificate(
                                            "participation",
                                            item.registration_id
                                        )
                                    }
                                />
                            ))
                        )}

                        {/* Gold */}
                        <SectionHeading
                            icon="🥇"
                            title="Gold Certificates"
                            count={data.gold?.length || 0}
                            accent={theme.gold}
                            glow={theme.goldGlow}
                        />
                        {data.gold?.length === 0 ? (
                            <EmptyRow label="No gold finishes yet." />
                        ) : (
                            data.gold.map((item) => (
                                <CertCard
                                    key={item.result_id}
                                    title={item.event}
                                    rank={item.rank}
                                    accent={theme.gold}
                                    glow={theme.goldGlow}
                                    buttonLabel="Download Gold"
                                    onClick={() =>
                                        downloadCertificate(
                                            "gold",
                                            item.result_id
                                        )
                                    }
                                />
                            ))
                        )}

                        {/* Silver */}
                        <SectionHeading
                            icon="🥈"
                            title="Silver Certificates"
                            count={data.silver?.length || 0}
                            accent={theme.silver}
                            glow={theme.silverGlow}
                        />
                        {data.silver?.length === 0 ? (
                            <EmptyRow label="No silver finishes yet." />
                        ) : (
                            data.silver.map((item) => (
                                <CertCard
                                    key={item.result_id}
                                    title={item.event}
                                    rank={item.rank}
                                    accent={theme.silver}
                                    glow={theme.silverGlow}
                                    buttonLabel="Download Silver"
                                    onClick={() =>
    downloadCertificate(
        "silver",
        item.result_id
    )
}
                                />
                            ))
                        )}

                        {/* Bronze */}
                        <SectionHeading
                            icon="🥉"
                            title="Bronze Certificates"
                            count={data.bronze?.length || 0}
                            accent={theme.bronze}
                            glow={theme.bronzeGlow}
                        />
                        {data.bronze?.length === 0 ? (
                            <EmptyRow label="No bronze finishes yet." />
                        ) : (
                            data.bronze.map((item) => (
                                <CertCard
                                    key={item.result_id}
                                    title={item.event}
                                    rank={item.rank}
                                    accent={theme.bronze}
                                    glow={theme.bronzeGlow}
                                    buttonLabel="Download Bronze"
                                    onClick={() =>
    downloadCertificate(
        "bronze",
        item.result_id
    )
}
                                />
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MyCertificates;