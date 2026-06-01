import React, { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* 4PLANET — Master prototype · v1.3 (v10) — planetary operating system */

const useFonts = () => {
  useEffect(() => {
    const id = "fp-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@300;400;500&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      :root { color-scheme: light; --fp-blue: #2E2EFF; --fp-blue-deep: #0E0EAB; --fp-red: #FF4D22; --fp-earth: #1FA463; --fp-paper: #F8F7F4; }
      html, body, #root { background:#fff; }
      html { scroll-behavior: smooth; }
      body { font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; letter-spacing: -0.01em; color: #0a0a0a; }
      .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0; }
      .display { letter-spacing: -0.04em; line-height: 0.98; }
      .display-tight { letter-spacing: -0.05em; line-height: 0.92; }
      .tab-nums { font-variant-numeric: tabular-nums; }
      ::selection { background: var(--fp-blue); color: #fff; }
      section[id] { scroll-margin-top: 72px; }
      @media (min-width: 768px) { section[id] { scroll-margin-top: 96px; } }
      :focus { outline: none; }
      a:focus-visible, button:focus-visible { outline: 2px solid var(--fp-blue); outline-offset: 3px; }
      @keyframes fp-scanline { from { background-position: 0 0; } to { background-position: 0 200px; } }
      @keyframes fp-scan-horizontal { from { transform: translateX(-110%); } to { transform: translateX(110%); } }
      @keyframes fp-pulse-ring { 0% { transform: scale(0.4); opacity: 0.5; } 100% { transform: scale(2.6); opacity: 0; } }
      @keyframes fp-blink { 0%, 80%, 100% { opacity: 1; } 85% { opacity: 0.3; } }
      .fp-scanlines { background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255,255,255,0.045) 3px, rgba(255,255,255,0.045) 4px); animation: fp-scanline 18s linear infinite; }
      .fp-grain { background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 3px 3px; }
      .fp-blink { animation: fp-blink 2.4s ease-in-out infinite; }
      .fp-quiet-grid { background-image: linear-gradient(to right, rgba(46,46,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(46,46,255,0.025) 1px, transparent 1px); background-size: 80px 80px; }
      @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } .fp-scanlines, .fp-blink { animation: none !important; } }
      @media (max-width: 767px) { .fp-scanlines { animation-duration: 36s; } }
    `;
    document.head.appendChild(style);
  }, []);
};

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const handler = (e) => setReduced(e.matches);
    m.addEventListener?.("change", handler);
    return () => m.removeEventListener?.("change", handler);
  }, []);
  return reduced;
};

const useLiveClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return `${String(now.getUTCHours()).padStart(2,"0")}:${String(now.getUTCMinutes()).padStart(2,"0")}`;
};

const useEscape = (open, onClose) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
};

const Scanlines = ({ className = "" }) => <div aria-hidden className={`pointer-events-none absolute inset-0 fp-scanlines ${className}`} />;
const Grain = ({ className = "" }) => <div aria-hidden className={`pointer-events-none absolute inset-0 fp-grain ${className}`} />;
const QuietAmbient = ({ opacity = 0.4 }) => <div aria-hidden className="pointer-events-none absolute inset-0 fp-quiet-grid" style={{ opacity }} />;

const SonarPulse = ({ color = "rgba(255,255,255,0.5)", count = 3 }) => {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {!reduced && Array.from({ length: count }).map((_, i) => (
        <span key={i} className="absolute h-32 w-32 rounded-full border" style={{ borderColor: color, animation: `fp-pulse-ring 5s linear infinite`, animationDelay: `${i * 1.6}s` }} />
      ))}
      <span className="absolute h-1.5 w-1.5 rounded-full" style={{ background: color, opacity: 0.85 }} />
    </div>
  );
};

const HorizontalScan = ({ color = "rgba(255,255,255,0.15)" }) => {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute inset-y-0 w-32" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)`, animation: "fp-scan-horizontal 7.5s linear infinite" }} /></div>;
};

const TC = ({ pos = "tr", lines = [], color = "text-white/80", sub = "text-white/55" }) => {
  const p = pos === "tr" ? "right-4 top-4 text-right md:right-6 md:top-6" : pos === "tl" ? "left-4 top-4 md:left-6 md:top-6" : pos === "br" ? "right-4 bottom-4 text-right md:right-6 md:bottom-6" : "left-4 bottom-4 md:left-6 md:bottom-6";
  return <div className={`absolute ${p} font-mono text-[10px] uppercase tracking-[0.22em] ${color}`}>{lines.map((l, i) => <div key={i} className={i === 0 ? "" : `mt-1 ${sub}`}>{l}</div>)}</div>;
};

/* ============================================================
   WORLD ATMOSPHERIC PANELS (4)
   ============================================================ */
const AtmosphericPanel = ({ domain, className = "", showOverlay = true }) => {
  if (domain === "OCE4N") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #4848FF 0%, #2E2EFF 22%, #0E0E5C 58%, #02021A 100%)" }} />
      <Scanlines /><HorizontalScan color="rgba(255,255,255,0.12)" /><SonarPulse color="rgba(255,255,255,0.5)" count={3} /><Grain className="opacity-50" />
      <div className="absolute left-4 inset-y-6 flex flex-col justify-between font-mono text-[9px] tracking-[0.18em] uppercase text-white/55 md:left-6">
        <span>—0 m</span><span>—120</span><span>—340</span><span>—780</span><span>—2400</span>
      </div>
      {showOverlay && <>
        <TC pos="tr" lines={["OCE4N / WORLD","78°23′N · 14°57′E","DEEP OCEAN INTELLIGENCE"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 fp-blink" />Hydroacoustic pass · illustrative</div>
      </>}
    </div>
  );
  if (domain === "E4RTH") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0A1F0E 0%, #061008 38%, #0A0805 72%, #1A0905 100%)" }} />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {[{y:100,op:0.18},{y:130,op:0.22},{y:160,op:0.28},{y:190,op:0.35},{y:220,op:0.42},{y:250,op:0.5}].map((c,i) => (
          <path key={i} d={`M -10 ${c.y} Q 80 ${c.y-14} 150 ${c.y-6} T 290 ${c.y-10} T 420 ${c.y+4}`} stroke="#1FA463" strokeOpacity={c.op} strokeWidth="0.9" fill="none" />
        ))}
        <circle cx="200" cy="190" r="2" fill="#1FA463" opacity="0.85" />
        <line x1="200" y1="22" x2="200" y2="188" stroke="#1FA463" strokeOpacity="0.25" strokeDasharray="2 3" />
      </svg>
      <Scanlines /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["E4RTH / WORLD","3°08′S · 60°01′W","BIOSPHERE INTELLIGENCE"]} color="text-[#1FA463]/85" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1FA463] fp-blink" />Canopy index 0.78 · illustrative</div>
      </>}
    </div>
  );
  if (domain === "S4PIENS") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #2E2E2E 0%, #1A1A1A 40%, #0A0A0A 100%)" }} />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
        {[[50,130,22],[85,80,22],[120,170,22],[155,60,22],[190,110,22],[225,40,22],[260,140,22],[295,90,22],[330,170,22]].map(([x,h,w],i) => <rect key={i} x={x} y={300-h} width={w} height={h} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />)}
        <line x1="0" y1="280" x2="400" y2="280" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      </svg>
      <Scanlines /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["S4PIENS / WORLD","59°55′N · 10°45′E","HUMAN SYSTEMS"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 fp-blink" />Material flow · illustrative</div>
      </>}
    </div>
  );
  if (domain === "4CULTURE") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-black" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
        <circle cx="200" cy="280" r="4" fill="#FF4D22" />
        <path d="M 100 280 Q 200 200, 300 280" stroke="#FF4D22" strokeOpacity="0.6" fill="none" strokeWidth="0.8" />
        <path d="M 50 280 Q 200 120, 350 280" stroke="#FF4D22" strokeOpacity="0.4" fill="none" strokeWidth="0.8" />
        <path d="M 0 280 Q 200 30, 400 280" stroke="#FF4D22" strokeOpacity="0.25" fill="none" strokeWidth="0.8" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><div className="display text-[180px] font-medium leading-none text-white/[0.06] md:text-[280px]">04</div></div>
      <Scanlines /><Grain className="opacity-30" />
      {showOverlay && <>
        <TC pos="tr" lines={["4CULTURE / WORLD","ISSUE 04 / TX","CULTURAL TRANSMISSION"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D22] fp-blink" />On air · cultural channel</div>
      </>}
    </div>
  );
  return null;
};

/* ============================================================
   PROJECT SUB-ATMOSPHERES — 17 unique sub-worlds
   ============================================================ */
const ProjectAtmosphere = ({ system, project, className = "", showOverlay = true }) => {
  const key = `${system.id}-${project.code}`;

  if (key === "OCE4N-01") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1a3a 0%, #0a0a2a 30%, #020210 70%, #000005 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <path d="M -20 160 Q 80 140, 180 180 T 380 170" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 5" fill="none" />
        <path d="M -20 200 Q 120 220, 220 200 T 420 215" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="3 5" fill="none" />
        <ellipse cx="200" cy="180" rx="32" ry="6" fill="rgba(255,255,255,0.08)" />
        <ellipse cx="190" cy="178" rx="3" ry="1.5" fill="rgba(255,255,255,0.18)" />
      </svg>
      <SonarPulse color="rgba(180,200,255,0.4)" count={2} /><Scanlines className="opacity-50" /><Grain className="opacity-60" />
      <div className="absolute left-4 inset-y-6 flex flex-col justify-between font-mono text-[9px] tracking-[0.18em] uppercase text-white/45 md:left-6">
        <span>—0 m</span><span>—500</span><span>—1200</span><span>—2400</span><span>—4500</span>
      </div>
      {showOverlay && <>
        <TC pos="tr" lines={["OCE4N_WH4LES / 01","67°N · NORWEGIAN SEA","ABYSSAL MONITORING"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 fp-blink" />Acoustic pass · illustrative</div>
      </>}
    </div>
  );

  if (key === "OCE4N-02") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #5AB4D9 0%, #2E7BB6 35%, #145080 70%, #051F3D 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:7}).map((_,i) => <path key={i} d={`M -20 ${30+i*14} Q ${80+i*6} ${25+i*14} ${180+i*4} ${35+i*14} T 420 ${30+i*14}`} stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" fill="none" />)}
        {[60,110,160,210,260,310].map((x,i) => <path key={i} d={`M ${x} 290 L ${x} ${260-(i%3)*4} M ${x-5} 270 L ${x+5} 270 M ${x-4} 280 L ${x+4} 280`} stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" strokeLinecap="round" />)}
      </svg>
      <Scanlines className="opacity-40" /><Grain className="opacity-50" />
      {showOverlay && <>
        <TC pos="tr" lines={["OCE4N_COR4L / 02","0°S 120°E · CORAL TRIANGLE","REEF SYSTEMS"]} color="text-white/85" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-white/85 fp-blink" />Reef health · monitoring</div>
      </>}
    </div>
  );

  if (key === "OCE4N-03") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #6C8FB5 0%, #355A7F 40%, #1A3A5C 70%, #0A1F3D 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:6}).map((_,i) => <path key={i} d={`M -10 ${50+i*30} Q 60 ${45+i*30} 130 ${52+i*30} T 280 ${50+i*30} T 420 ${48+i*30}`} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />)}
        {[[60,75],[120,60],[180,90],[240,70],[300,105],[340,80],[90,130],[200,140],[280,155]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r="1.5" fill="rgba(255,255,255,0.4)" />)}
        <path d="M 0 290 L 60 270 L 140 280 L 220 265 L 320 285 L 400 270 L 400 300 L 0 300 Z" fill="rgba(0,0,0,0.4)" />
      </svg>
      <Scanlines className="opacity-40" /><Grain className="opacity-50" />
      {showOverlay && <>
        <TC pos="tr" lines={["OCE4N_CLE4N / 03","COASTAL SECTOR","DEBRIS RECOVERY"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 fp-blink" />Recovery log · partner-submitted</div>
      </>}
    </div>
  );

  if (key === "OCE4N-04") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #2A6B5C 0%, #145247 35%, #0A3B33 70%, #021A14 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
        {[40,70,105,140,175,210,245,280,315,350,385].map((x,i) => {
          const top = 40 + (i%4)*12;
          return <g key={i}><line x1={x} y1={290} x2={x+(i%2===0?-2:2)} y2={top} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round" />{Array.from({length:4}).map((_,j) => <ellipse key={j} cx={x+(j%2===0?-4:4)} cy={top+25+j*30} rx="5" ry="2" fill="rgba(255,255,255,0.12)" transform={`rotate(${j%2===0?-20:20} ${x} ${top+25+j*30})`} />)}</g>;
        })}
        <path d="M 0 0 L 200 290 L 220 290 L 30 0 Z" fill="rgba(255,255,255,0.04)" />
        <path d="M 100 0 L 280 290 L 300 290 L 130 0 Z" fill="rgba(255,255,255,0.03)" />
      </svg>
      <Grain className="opacity-50" />
      {showOverlay && <>
        <TC pos="tr" lines={["OCE4N_RE:WILD / 04","NO · SE COAST","COASTAL RESTORATION"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1FA463] fp-blink" />Kelp restoration · monitoring</div>
      </>}
    </div>
  );

  if (key === "E4RTH-01") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0F2A14 0%, #0A1F0E 30%, #0B1410 60%, #1A0F08 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:9}).map((_,i) => {
          const y = 60+i*22;
          return <path key={i} d={`M -10 ${y} Q 50 ${y-8} 110 ${y+4} T 230 ${y-6} T 340 ${y+2} T 420 ${y-4}`} stroke="#1FA463" strokeOpacity={0.12+i*0.04} strokeWidth="0.7" fill="none" />;
        })}
        <path d="M -10 240 Q 70 230 110 250 Q 160 270 220 245 Q 280 220 340 248 T 420 240" stroke="rgba(140,180,200,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M -10 240 Q 70 230 110 250 Q 160 270 220 245 Q 280 220 340 248 T 420 240" stroke="rgba(140,180,200,0.15)" strokeWidth="5" fill="none" strokeLinecap="round" />
        {[[80,100],[180,80],[260,110],[320,90],[120,160],[280,175],[60,200]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r="1.5" fill="#1FA463" opacity="0.55" />)}
      </svg>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 60%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, rgba(255,255,255,0.04) 0%, transparent 50%)" }} />
      <Scanlines className="opacity-30" /><Grain className="opacity-50" />
      {showOverlay && <>
        <TC pos="tr" lines={["E4RTH_AM4ZONIA / 01","3°08′S · 60°01′W","RAINFOREST INTELLIGENCE"]} color="text-[#1FA463]/85" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1FA463] fp-blink" />Humidity 92% · canopy 0.78</div>
      </>}
    </div>
  );

  if (key === "E4RTH-02") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1814 0%, #060e0a 50%, #020805 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:9}).map((_,i) => <line key={`v-${i}`} x1={40+i*40} y1="0" x2={40+i*40} y2="300" stroke="rgba(31,164,99,0.08)" strokeWidth="0.3" />)}
        {Array.from({length:7}).map((_,i) => <line key={`h-${i}`} x1="0" y1={30+i*40} x2="400" y2={30+i*40} stroke="rgba(31,164,99,0.08)" strokeWidth="0.3" />)}
        <path d="M 60 220 L 100 180 L 140 200 L 200 140 L 260 160 L 320 110" stroke="#1FA463" strokeOpacity="0.5" strokeWidth="0.6" fill="none" strokeDasharray="2 3" />
        {[[60,220],[100,180],[140,200],[200,140],[260,160],[320,110]].map(([cx,cy],i) => <g key={i}><circle cx={cx} cy={cy} r="2.5" fill="#1FA463" opacity="0.7" /><circle cx={cx} cy={cy} r="6" stroke="#1FA463" strokeOpacity="0.25" strokeWidth="0.5" fill="none" /></g>)}
        <g transform="translate(200,140)"><circle r="14" stroke="#1FA463" strokeOpacity="0.4" strokeWidth="0.5" fill="none" /><line x1="-20" y1="0" x2="-16" y2="0" stroke="#1FA463" strokeOpacity="0.6" /><line x1="16" y1="0" x2="20" y2="0" stroke="#1FA463" strokeOpacity="0.6" /><line x1="0" y1="-20" x2="0" y2="-16" stroke="#1FA463" strokeOpacity="0.6" /><line x1="0" y1="16" x2="0" y2="20" stroke="#1FA463" strokeOpacity="0.6" /></g>
      </svg>
      <Scanlines className="opacity-50" /><Grain className="opacity-50" />
      {showOverlay && <>
        <TC pos="tr" lines={["E4RTH_SPECIES / 02","CLASSIFIED · TX:13","ECOLOGICAL ARCHIVE"]} color="text-[#1FA463]/85" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1FA463] fp-blink" />Telemetry · field notes</div>
      </>}
    </div>
  );

  if (key === "E4RTH-03") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0d1f2a 0%, #0a1820 35%, #061018 70%, #020810 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="200" cy="450" rx="280" ry="220" stroke="#1FA463" strokeOpacity="0.4" strokeWidth="0.6" fill="none" />
        <ellipse cx="200" cy="460" rx="290" ry="230" stroke="#1FA463" strokeOpacity="0.25" strokeWidth="0.5" fill="none" />
        <ellipse cx="200" cy="470" rx="300" ry="240" stroke="#1FA463" strokeOpacity="0.15" strokeWidth="0.4" fill="none" />
        <path d="M 100 100 Q 150 80, 200 100 T 300 100 Q 280 130, 240 130 T 160 130 Q 140 110, 150 90" stroke="rgba(180,210,230,0.3)" strokeWidth="0.6" fill="none" />
        <path d="M 110 110 Q 160 95, 210 110 T 290 110 Q 275 125, 235 125 T 165 120" stroke="rgba(180,210,230,0.2)" strokeWidth="0.4" fill="none" />
        {[40,70,110,160].map((y,i) => <line key={i} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" strokeDasharray="6 4" />)}
        {[[80,180],[180,200],[280,180],[330,220]].map(([cx,cy],i) => <g key={i}><circle cx={cx} cy={cy} r="1.5" fill="#1FA463" opacity="0.7" /><circle cx={cx} cy={cy} r="5" stroke="#1FA463" strokeOpacity="0.3" strokeWidth="0.4" fill="none" /></g>)}
      </svg>
      <Scanlines className="opacity-40" /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["E4RTH_CLIM4TE / 03","PLANETARY MONITORING","ATMOSPHERIC SCAN"]} color="text-[#1FA463]/85" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1FA463] fp-blink" />Restoration log · illustrative</div>
      </>}
    </div>
  );

  if (key === "E4RTH-04") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #2a2418 0%, #1a1610 40%, #0e0a06 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:6}).map((_,i) => {
          const y = 90+i*22;
          return <Fragment key={i}>
            <path d={`M -10 ${y} Q 50 ${y-12} 100 ${y-4} T 200 ${y-8}`} stroke="rgba(255,200,140,0.15)" strokeWidth="0.6" fill="none" />
            <path d={`M 200 ${y-8} Q 250 ${y-18} 310 ${y-12} T 420 ${y-16}`} stroke="#1FA463" strokeOpacity={0.4} strokeWidth="0.7" fill="none" />
          </Fragment>;
        })}
        <line x1="200" y1="20" x2="200" y2="280" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 4" />
        {[[240,230],[280,245],[330,220],[370,240]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r="2" fill="#1FA463" opacity="0.7" />)}
      </svg>
      <Scanlines className="opacity-30" /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["E4RTH_RE:WILD / 04","NO · UK FIELDS","TERRESTRIAL RESTORATION"]} color="text-[#1FA463]/85" />
        <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 md:bottom-6 md:left-6"><span>BEFORE</span><span className="mx-3">·</span><span>AFTER</span></div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1FA463] fp-blink" />Habitat survey · illustrative</div>
      </>}
    </div>
  );

  if (key === "S4PIENS-01") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #3a3024 0%, #261e15 50%, #14100a 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:8}).map((_,i) => <line key={`v-${i}`} x1={i*50} y1="60" x2={i*50} y2="280" stroke="rgba(255,210,140,0.15)" strokeWidth="0.4" />)}
        {Array.from({length:5}).map((_,i) => <line key={`h-${i}`} x1="0" y1={80+i*50} x2="400" y2={80+i*50} stroke="rgba(255,210,140,0.15)" strokeWidth="0.4" />)}
        <rect x="50" y="130" width="50" height="50" fill="rgba(31,164,99,0.18)" stroke="#1FA463" strokeOpacity="0.4" strokeWidth="0.6" />
        <rect x="150" y="180" width="100" height="50" fill="rgba(31,164,99,0.12)" stroke="#1FA463" strokeOpacity="0.3" strokeWidth="0.5" />
        <rect x="300" y="80" width="50" height="100" fill="rgba(31,164,99,0.15)" stroke="#1FA463" strokeOpacity="0.35" strokeWidth="0.5" />
        <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      </svg>
      <Scanlines className="opacity-30" /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["S4PIENS_FOOD / 01","LAND-USE SECTOR","REGENERATIVE SYSTEMS"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 fp-blink" />Soil index · illustrative</div>
      </>}
    </div>
  );

  if (key === "S4PIENS-02") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #e8e8ec 0%, #c8c8d0 35%, #8a8a96 70%, #2a2a32 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
        {[180,220,260].map((y,i) => <line key={i} x1="0" y1={y} x2="400" y2={y} stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />)}
        {[60,140,220,300,380].map((x,i) => <g key={i}>
          <line x1={x} y1="280" x2={x} y2="150" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />
          <line x1={x-15} y1="170" x2={x+15} y2="170" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
          <line x1={x-10} y1="190" x2={x+10} y2="190" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
          <line x1={x-6} y1="160" x2={x+6} y2="160" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
        </g>)}
        <g transform="translate(80, 60)"><line x1="0" y1="0" x2="0" y2="100" stroke="rgba(46,46,255,0.7)" strokeWidth="1.5" /><circle cx="0" cy="0" r="2.5" fill="#2E2EFF" /><line x1="0" y1="0" x2="-30" y2="-12" stroke="#2E2EFF" strokeOpacity="0.7" strokeWidth="1.5" /><line x1="0" y1="0" x2="22" y2="-25" stroke="#2E2EFF" strokeOpacity="0.7" strokeWidth="1.5" /><line x1="0" y1="0" x2="10" y2="32" stroke="#2E2EFF" strokeOpacity="0.7" strokeWidth="1.5" /></g>
        <g transform="translate(320, 80)"><line x1="0" y1="0" x2="0" y2="80" stroke="rgba(46,46,255,0.6)" strokeWidth="1.2" /><circle cx="0" cy="0" r="2" fill="#2E2EFF" /><line x1="0" y1="0" x2="-22" y2="-10" stroke="#2E2EFF" strokeOpacity="0.6" strokeWidth="1.2" /><line x1="0" y1="0" x2="18" y2="-20" stroke="#2E2EFF" strokeOpacity="0.6" strokeWidth="1.2" /><line x1="0" y1="0" x2="6" y2="26" stroke="#2E2EFF" strokeOpacity="0.6" strokeWidth="1.2" /></g>
      </svg>
      <Grain className="opacity-30" />
      {showOverlay && <>
        <TC pos="tr" lines={["S4PIENS_EN4RGY / 02","GRID 11kV · NO · DE","INFRASTRUCTURE"]} color="text-black/75" sub="text-black/50" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-black/60 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2E2EFF] fp-blink" />Load 78% · illustrative</div>
      </>}
    </div>
  );

  if (key === "S4PIENS-03") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f4f1ea 0%, #d8d3c8 50%, #8a8478 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:30}).map((_,i) => <line key={`v-${i}`} x1={i*14} y1="40" x2={i*14} y2="280" stroke="rgba(0,0,0,0.12)" strokeWidth="0.3" />)}
        {Array.from({length:16}).map((_,i) => <line key={`h-${i}`} x1="0" y1={40+i*16} x2="400" y2={40+i*16} stroke="rgba(0,0,0,0.1)" strokeWidth="0.3" />)}
        <path d="M 160 70 L 140 90 L 145 250 L 180 260 L 220 260 L 255 250 L 260 90 L 240 70 Z" stroke="rgba(0,0,0,0.4)" strokeWidth="0.7" fill="rgba(255,255,255,0.5)" />
        <path d="M 165 75 L 160 60 L 240 60 L 235 75" stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" fill="none" />
      </svg>
      <Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["S4PIENS_F4SHION / 03","MATERIAL REFORM","TEXTILE CIRCULARITY"]} color="text-black/75" sub="text-black/50" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-black/60 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2E2EFF] fp-blink" />Capsule · in development</div>
      </>}
    </div>
  );

  if (key === "S4PIENS-04") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #3a3a40 0%, #25252a 40%, #14141a 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:9}).map((_,i) => <line key={`v-${i}`} x1={i*50} y1="0" x2={i*50} y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />)}
        {Array.from({length:7}).map((_,i) => <line key={`h-${i}`} x1="0" y1={i*50} x2="400" y2={i*50} stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />)}
        {[[20,120,40,80],[80,80,30,120],[140,140,50,60],[220,100,40,100],[280,130,30,70],[340,110,40,90]].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />)}
        <circle cx="200" cy="150" r="60" stroke="#2E2EFF" strokeOpacity="0.4" strokeWidth="0.6" fill="none" strokeDasharray="4 4" />
        <path d="M 200 90 L 195 85 M 200 90 L 205 85" stroke="#2E2EFF" strokeOpacity="0.6" strokeWidth="0.7" />
        <path d="M 260 150 L 255 145 M 260 150 L 255 155" stroke="#2E2EFF" strokeOpacity="0.6" strokeWidth="0.7" />
      </svg>
      <Scanlines className="opacity-40" /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["S4PIENS_CIRCULAR / 04","OSLO · STOCKHOLM","MATERIAL FLOWS"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2E2EFF] fp-blink" />Reuse rate · partner data</div>
      </>}
    </div>
  );

  if (key === "4CULTURE-01") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-black" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <path d="M 80 0 L 60 300 L 90 300 L 100 0 Z" fill="rgba(255,77,34,0.08)" />
        <path d="M 200 0 L 180 300 L 220 300 L 210 0 Z" fill="rgba(255,77,34,0.06)" />
        <path d="M 320 0 L 300 300 L 340 300 L 340 0 Z" fill="rgba(255,77,34,0.05)" />
        <line x1="0" y1="220" x2="400" y2="220" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        {[20,60,90,120,160,200,240,280,320,360].map((x,i) => <rect key={i} x={x-4} y={240+(i%3)*4} width="8" height={50-(i%3)*4} fill="rgba(255,255,255,0.18)" />)}
        <circle cx="200" cy="120" r="4" fill="#FF4D22" />
        <circle cx="200" cy="120" r="14" stroke="#FF4D22" strokeOpacity="0.5" strokeWidth="0.5" fill="none" />
        <circle cx="200" cy="120" r="28" stroke="#FF4D22" strokeOpacity="0.3" strokeWidth="0.5" fill="none" />
      </svg>
      <Scanlines className="opacity-40" /><Grain className="opacity-30" />
      {showOverlay && <>
        <TC pos="tr" lines={["4CULTURE_4PLAY / 01","LIVE TRANSMISSION","EVENT SYSTEMS"]} color="text-white/85" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D22] fp-blink" />ON AIR · ticket = impact</div>
      </>}
    </div>
  );

  if (key === "4CULTURE-02") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-[#1a1a1a]" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="display text-[28vw] font-medium leading-[0.85] text-white/[0.07] md:text-[180px]">M4G</div>
          <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/40 mt-2">ISSUE 04 · TRANSMISSION</div>
        </div>
      </div>
      <div className="absolute inset-0">
        <div className="absolute left-12 top-0 bottom-0 w-px bg-white/[0.08]" />
        <div className="absolute right-12 top-0 bottom-0 w-px bg-white/[0.08]" />
        <div className="absolute left-0 right-0 top-12 h-px bg-white/[0.08]" />
        <div className="absolute left-0 right-0 bottom-12 h-px bg-white/[0.08]" />
      </div>
      <Scanlines className="opacity-30" /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["4CULTURE_M4G / 02","PUBLICATION","EDITORIAL LAYER"]} sub="text-white/50" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D22] fp-blink" />Print + digital</div>
      </>}
    </div>
  );

  if (key === "4CULTURE-03") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <rect x="40" y="50" width="80" height="110" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <rect x="50" y="60" width="60" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
        <rect x="160" y="70" width="100" height="80" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <rect x="170" y="80" width="80" height="60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
        <rect x="290" y="50" width="70" height="120" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <rect x="300" y="60" width="50" height="100" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
        <line x1="0" y1="220" x2="400" y2="220" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
        <text x="40" y="180" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">ED. 01 / 50</text>
        <text x="160" y="170" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">ED. 02 / 30</text>
        <text x="290" y="190" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">ED. 03 / 100</text>
      </svg>
      <Grain className="opacity-30" />
      {showOverlay && <>
        <TC pos="tr" lines={["4CULTURE_4RT / 03","EDITIONS · PRINTS","GALLERY OPERATIONS"]} sub="text-white/50" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D22] fp-blink" />Sale = impact unit</div>
      </>}
    </div>
  );

  if (key === "4CULTURE-04") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f8f7f4 0%, #d8d4cc 60%, #8a8478 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <rect x="80" y="40" width="100" height="140" fill="white" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
        <rect x="70" y="50" width="100" height="140" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" transform="rotate(-3 120 120)" />
        <rect x="220" y="40" width="100" height="140" fill="white" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
        <rect x="230" y="50" width="100" height="140" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" transform="rotate(3 280 120)" />
        <line x1="90" y1="60" x2="170" y2="60" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
        <line x1="90" y1="68" x2="160" y2="68" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
        <text x="90" y="170" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(0,0,0,0.55)">PRINT4PLANET</text>
        <line x1="230" y1="60" x2="310" y2="60" stroke="rgba(255,77,34,0.7)" strokeWidth="1" />
        <line x1="230" y1="68" x2="300" y2="68" stroke="rgba(255,77,34,0.5)" strokeWidth="0.5" />
        <text x="230" y="170" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(0,0,0,0.55)">EDITION / 50</text>
        <line x1="0" y1="220" x2="400" y2="220" stroke="rgba(0,0,0,0.15)" strokeWidth="0.4" />
      </svg>
      <Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["4CULTURE_PRINT / 04","DROPS · POSTERS","PRINT CULTURE"]} color="text-black/75" sub="text-black/50" />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-black/60 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D22] fp-blink" />Edition funds restoration</div>
      </>}
    </div>
  );

  if (key === "4CULTURE-05") return (
    <div className={`relative isolate overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-[#141414]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <rect x="40" y="40" width="320" height="220" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
        <rect x="60" y="60" width="80" height="60" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
        <text x="65" y="74" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">FILM</text>
        <rect x="160" y="60" width="80" height="60" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
        <text x="165" y="74" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">MUSIC</text>
        <rect x="260" y="60" width="80" height="60" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
        <text x="265" y="74" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">DESIGN</text>
        <rect x="60" y="150" width="130" height="90" fill="rgba(255,77,34,0.06)" stroke="rgba(255,77,34,0.3)" strokeWidth="0.5" />
        <text x="65" y="164" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,77,34,0.6)">PRODUCTION</text>
        <rect x="210" y="150" width="130" height="90" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
        <text x="215" y="164" fontSize="6" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">EDITORIAL</text>
        <circle cx="200" cy="150" r="3" fill="#FF4D22" />
      </svg>
      <Scanlines className="opacity-30" /><Grain className="opacity-40" />
      {showOverlay && <>
        <TC pos="tr" lines={["4CULTURE_4TELIER / 05","OSL · STUDIO","PRODUCTION ATELIER"]} />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 md:bottom-6 md:right-6"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D22] fp-blink" />In session</div>
      </>}
    </div>
  );

  return <AtmosphericPanel domain={system.id} className={className} showOverlay={showOverlay} />;
};

/* ============================================================
   DATA — full project narratives
   ============================================================ */
const SYSTEMS = [
  {
    id: "OCE4N", code: "01", title: "OCE4N", slug: "oce4n", domain: "Deep ocean intelligence",
    feel: "Massive, ancient, intelligent and emotional.",
    manifesto: "The protection of marine life — coral systems, kelp forests, migratory species and the integrity of coastal water.",
    color: "#2E2EFF", sectors: 4, partners: 3,
    projects: [
      { code: "01", name: "WH4LES", slug: "wh4les", unit: "Migratory whale monitoring",
        feel: "Deep ocean planetary consciousness — sonar, abyss, acoustic telemetry.",
        problem: "Industrial shipping, underwater noise, vessel strikes and climate disruption are reshaping whale migration and feeding patterns. Many populations across vast ocean regions remain poorly monitored over time.",
        whyItMatters: "Whales help regulate marine ecosystems. When they feed at depth and return nutrients to the surface, this can support phytoplankton — the microscopic organisms connected to ocean oxygen production, carbon cycling and the foundation of marine food webs.",
        approach: "WH4LES supports acoustic monitoring, migration observation, marine research communication and documentary work — in partnership with marine biologists and research consortia.",
        facts: ["Some whale populations migrate thousands of kilometres seasonally","Acoustic monitoring can detect populations not visible at surface","Phytoplankton produce a significant share of atmospheric oxygen"],
        impactUnit: "1 day of whale monitoring", impactPrice: "NOK 100", status: "PARTNER-READY", region: "NO · IS" },
      { code: "02", name: "COR4L", slug: "cor4l", unit: "Coral reef regeneration",
        feel: "Fragile underwater biome — refraction, biodiversity, regeneration.",
        problem: "Ocean warming, acidification, pollution and bleaching events are pushing coral reef systems into extreme stress. Some reefs have lost most of their living coral cover within decades.",
        whyItMatters: "Reefs are estimated to support a major share of marine species and protect coastlines from storms. When reefs decline, fisheries, coastal protection and biodiversity weaken together.",
        approach: "COR4L supports coral nursery operations, reef-resilience research and storytelling that makes reef systems emotionally and scientifically legible.",
        facts: ["Coral reefs support an estimated quarter of marine species","Bleaching can occur with sustained warming above thermal thresholds","Coral nurseries can restore fragments to damaged reef areas"],
        impactUnit: "Coral nursery support", impactPrice: "NOK 100", status: "PROTOTYPE", region: "ID" },
      { code: "03", name: "CLE4N", slug: "clean", unit: "Marine debris recovery",
        feel: "Coastal recovery — boats, material closeups, field teams.",
        problem: "Marine debris continues to accumulate across coastlines and open oceans. Once plastic fragments into microplastics, removal becomes extremely difficult.",
        whyItMatters: "Marine debris harms wildlife, damages habitats, and can enter food chains. Clean coastlines are part of ocean resilience — not cosmetic.",
        approach: "CLE4N funds measurable debris recovery through selected coastal partners — with location records, weight logs and photo documentation.",
        facts: ["Most marine debris is composed of plastic","Coastal recovery is most effective before debris fragments","Removal works best as ongoing partnership, not one-off cleanups"],
        impactUnit: "1 kg marine debris recovered", impactPrice: "NOK 50", status: "PILOT-READY", region: "ID · NO" },
      { code: "04", name: "RE:WILD", slug: "rewild-marine", unit: "Coastal ecosystem restoration",
        feel: "Underwater forests — kelp, seagrass, Nordic marine atmosphere.",
        problem: "Kelp forests, seagrass meadows and shellfish reefs have been degraded across many coastlines by pollution, warming waters, seabed disturbance and overgrazing.",
        whyItMatters: "Coastal ecosystems are nurseries, filters and carbon-storing systems. They support fish populations, water quality and biological structure in weakened marine environments.",
        approach: "RE:WILD MARINE connects funding and communication to restoration partners working with kelp, seagrass and shellfish reefs.",
        facts: ["Kelp forests can store carbon in coastal sediment systems","Seagrass meadows function as nurseries for many fish species","Recovery often requires multi-decade timeframes"],
        impactUnit: "1 m² coastal habitat restored", impactPrice: "NOK 50–100", status: "PROTOTYPE", region: "NO · SE" },
    ],
  },
  {
    id: "E4RTH", code: "02", title: "E4RTH", slug: "e4rth", domain: "Biosphere intelligence",
    feel: "Alive, sacred, intelligent and planetary.",
    manifesto: "Forests, biodiversity and the integrity of terrestrial life — built through stewardship and field-based ecology.",
    color: "#1FA463", sectors: 4, partners: 5,
    projects: [
      { code: "01", name: "AM4ZONIA", slug: "am4zonia", unit: "Rainforest biodiversity protection",
        feel: "Living rainforest intelligence — humidity, canopy, biosphere mapping.",
        problem: "The Amazon faces deforestation, extraction, fires, fragmentation and biodiversity loss. Damage to the rainforest affects systems far beyond the forest itself.",
        whyItMatters: "Rainforest systems influence rainfall, atmospheric moisture, carbon cycles, biodiversity stability and regional climate. A rainforest is a living climate system — not a collection of trees.",
        approach: "AM4ZONIA supports rainforest protection through indigenous-led stewardship, partner conservation and cultural storytelling that makes the value of standing forest easier to understand.",
        facts: ["Rainforests influence regional rainfall through evapotranspiration","Indigenous-stewarded forests show strong protection outcomes","Carbon stored in standing forest is released when forest is lost"],
        impactUnit: "1 m² rainforest under stewardship", impactPrice: "NOK 50", status: "PARTNER-READY", region: "BR · CO" },
      { code: "02", name: "SPECIES", slug: "species", unit: "Endangered species protection",
        feel: "Planetary species archive — tracking telemetry, zoological grids.",
        problem: "Species loss often happens quietly. Habitat fragmentation, illegal hunting, pollution and climate shifts remove key animals from ecosystems before most people notice.",
        whyItMatters: "Species shape food webs, pollination, migration and ecological balance. Predators, pollinators, grazers, seed dispersers and marine mammals all hold systems together.",
        approach: "SPECIES supports selected species protection projects through field partners, monitoring effort and public education.",
        facts: ["Keystone species can disproportionately shape entire ecosystems","Many species declines happen before being widely documented","Field-based protection requires long-term local presence"],
        impactUnit: "Field protection day", impactPrice: "NOK 100", status: "PARTNER-READY", region: "BR · KE" },
      { code: "03", name: "CLIM4TE", slug: "clim4te", unit: "Climate restoration",
        feel: "Planetary systems monitoring — weather, biosphere telemetry, Earth-scale mapping.",
        problem: "Climate change is often communicated through abstract numbers. People understand the problem, but struggle to see where their action actually goes.",
        whyItMatters: "Trees, soils, peatlands and restored landscapes can help bind carbon, stabilise ecosystems and strengthen biodiversity — when restoration is real, located and long-term.",
        approach: "CLIM4TE turns climate support into concrete restoration units — trees planted, habitats restored, stewardship actions — tied to specific partners, locations and follow-up records.",
        facts: ["Peatlands store large amounts of carbon when intact","Soil carbon recovery requires decades, not seasons","Restoration outcomes depend on location, species mix and stewardship"],
        impactUnit: "1 tree planted", impactPrice: "NOK 50", status: "PILOT-READY", region: "NO · SE · DK" },
      { code: "04", name: "RE:WILD", slug: "rewild-land", unit: "Terrestrial habitat restoration",
        feel: "Long-term ecological — soil, wild grasses, topographic markers.",
        problem: "Large areas of land have been simplified, drained, fragmented or overused. These landscapes lose biodiversity, soil quality and natural resilience.",
        whyItMatters: "Restored landscapes can support biodiversity, improve water cycles, rebuild soil health and create stronger ecosystems over decades.",
        approach: "RE:WILD LAND funds and communicates partner-led restoration of degraded habitats.",
        facts: ["Rewilding outcomes improve over decades","Biodiversity recovery is connected to soil and water restoration","Land-use change is a primary driver of biodiversity loss"],
        impactUnit: "1 m² damaged habitat restored", impactPrice: "NOK 50", status: "PROTOTYPE", region: "NO · UK" },
    ],
  },
  {
    id: "S4PIENS", code: "03", title: "S4PIENS", slug: "s4piens", domain: "Human systems",
    feel: "Architectural, clear, design-led.",
    manifesto: "The systems humans live inside — food, energy, mobility and circular practice in cities.",
    color: "#1a1a1a", sectors: 4, partners: 2,
    projects: [
      { code: "01", name: "FOOD", slug: "food", unit: "Regenerative food systems",
        feel: "Land-use grids, soil patterns, agricultural geometry.",
        problem: "Modern food systems contribute to emissions, soil degradation, biodiversity loss, water stress and human health pressure.",
        whyItMatters: "Food is one of the strongest links between human behaviour, land use, climate and biodiversity. Changing food systems can ease pressure across many of these systems at once.",
        approach: "FOOD supports knowledge partnerships and public communication around regenerative and low-impact food systems.",
        facts: ["Food production occupies a large share of habitable land","Regenerative practice can improve soil health over time","Diet shifts are among the most leveraged consumer choices"],
        impactUnit: "Knowledge partnership", impactPrice: "Project-based", status: "PROTOTYPE", region: "NO" },
      { code: "02", name: "EN4RGY", slug: "en4rgy", unit: "Energy systems & infrastructure",
        feel: "White architectural energy models — geothermal, grids, infrastructure clarity.",
        problem: "Global energy demand continues to rise while fossil systems continue to drive emissions, geopolitical pressure and ecological instability.",
        whyItMatters: "Energy systems shape climate, industry, cities, transport and everyday life. The transition must be understandable, scalable and credible — not abstract.",
        approach: "EN4RGY communicates clean energy systems, highlights promising infrastructure (geothermal, offshore wind, grids, storage, marine energy) and translates complex solutions into public-facing stories.",
        facts: ["Energy systems shape emissions across industry, transport and buildings","Geothermal, offshore wind and storage are advancing rapidly","Grids, transmission and demand systems are critical infrastructure"],
        impactUnit: "Research & communication module", impactPrice: "Project-based", status: "PROTOTYPE", region: "NO · DE" },
      { code: "03", name: "F4SHION", slug: "f4shion", unit: "Material & textile reform",
        feel: "Vogue-level styling — textile weave, material closeups, fashion editorial.",
        problem: "Fashion creates substantial waste, emissions, overproduction and material pressure. It is also one of the most visible ways people participate in consumption.",
        whyItMatters: "Clothing carries identity and culture. Changing fashion culture can change behaviour at scale — repair, reuse, resale, capsule design.",
        approach: "F4SHION supports second-hand, circular design, material reform and editorial storytelling through S4PIENS and 4CULTURE.",
        facts: ["A significant share of textile material is discarded each year","Reuse and repair can extend garment lifespans substantially","Material reform is a long-term industrial change"],
        impactUnit: "Capsule / repair / resale project", impactPrice: "Project-based", status: "PROTOTYPE", region: "NO · DK" },
      { code: "04", name: "CIRCULAR CITY", slug: "circular-city", unit: "Circular urban practice",
        feel: "Architecture, material libraries, urban grids, repair systems.",
        problem: "Urban systems consume enormous resources and produce vast material flows. Too much is extracted, used briefly and discarded.",
        whyItMatters: "Cities concentrate people, materials and energy — making them one of the most important places to redesign. Circular cities can reduce waste, extend product life and create smarter local systems.",
        approach: "CIRCULAR CITY supports pilots and partner models around repair, reuse, material intelligence and circular behaviour.",
        facts: ["Urban material flows are among the largest in modern economies","Repair, reuse and resale networks reduce extraction pressure","Circular outcomes depend on local infrastructure and behaviour"],
        impactUnit: "Circular city pilot", impactPrice: "Project-based", status: "PROTOTYPE", region: "NO · SE" },
    ],
  },
  {
    id: "4CULTURE", code: "04", title: "4CULTURE", slug: "4culture", domain: "Cultural transmission",
    feel: "Editorial, gallery, cinematic, transmissive.",
    manifesto: "The narrative layer that connects ecological work to attention, story and culture.",
    color: "#FF4D22", sectors: 5, partners: 2,
    projects: [
      { code: "01", name: "4PLAY", slug: "4play", unit: "Events & live culture",
        feel: "Gallery events — projection light, black rooms, red transmission graphics.",
        problem: "Culture generates attention and money — but too rarely connects that energy to real ecological outcomes.",
        whyItMatters: "Events can become bridges between emotion, community and environmental action. Music and live culture move people.",
        approach: "4PLAY creates concerts, club nights and cultural formats where part of the value generated funds selected ecological interventions.",
        facts: ["One ticket can fund one tree, one m² of rainforest, or another unit","Events build long-term community around ecological work","Cultural attention is one of the strongest funding levers"],
        impactUnit: "1 ticket = 1 impact unit", impactPrice: "By event", status: "PILOT-READY", region: "INT" },
      { code: "02", name: "4PLANET MAGAZINE", slug: "magazine", unit: "Editorial publication",
        feel: "Vogue editorial structure — National Geographic depth, white space, typography.",
        problem: "Environmental communication is often too technical, too moralising, or too visually weak. Attention drifts elsewhere.",
        whyItMatters: "Culture shapes attention. Attention shapes funding, behaviour and political will. Storytelling is infrastructure for ecological action.",
        approach: "4PLANET MAGAZINE publishes visual essays, field stories, interviews and project explainers — connecting ecology, science and culture.",
        facts: ["Editorial work translates field knowledge into wider culture","Strong visual culture sustains long-term attention","Magazine archives function as cultural memory"],
        impactUnit: "Issue / subscription", impactPrice: "By issue", status: "PILOT-READY", region: "INT" },
      { code: "03", name: "4RT", slug: "4rt", unit: "Art & exhibitions",
        feel: "Gallery minimalism — collector-grade presentation, cinematic nature imagery.",
        problem: "Art often communicates environmental urgency but rarely connects directly to measurable ecological action.",
        whyItMatters: "Art carries emotion, memory and value. Used well, it can fund protection while changing how people see nature.",
        approach: "4RT creates limited editions, exhibitions and print drops where each sale connects to defined impact units.",
        facts: ["Limited editions retain cultural value over time","Exhibitions create attention beyond the gallery","Sales can be directly linked to interventions"],
        impactUnit: "Edition purchase = impact unit", impactPrice: "By edition", status: "PARTNER-READY", region: "INT" },
      { code: "04", name: "PRINT4PLANET", slug: "print4planet", unit: "Print & material culture",
        feel: "Print drops — posters, photo books, editorial objects funding restoration.",
        problem: "Printed culture is a strong cultural medium that rarely funds the work it depicts.",
        whyItMatters: "Print is collected, kept, displayed. It carries images and ideas into homes and studios — a long-lasting form of attention.",
        approach: "PRINT4PLANET releases prints, photo books and editorial drops where each sale funds ongoing ecological work.",
        facts: ["Print culture creates physical, lasting attention","Drops can fund specific, named interventions","Photography and design connect emotionally with audiences"],
        impactUnit: "Print = impact unit", impactPrice: "By edition", status: "PROTOTYPE", region: "INT" },
      { code: "05", name: "4TELIER", slug: "4telier", unit: "Creative studio & collaborations",
        feel: "Studio — production atelier where film, music, design and editorial converge.",
        problem: "Cultural production around environmental work is often fragmented — film here, magazine there, campaign elsewhere — with no shared creative core.",
        whyItMatters: "A unified creative atelier can produce work that is more coherent, more cinematic and more emotionally connected across the platform.",
        approach: "4TELIER is the creative atelier behind 4PLANET — a production environment for film, music, art direction and editorial collaboration.",
        facts: ["A shared atelier reduces fragmentation across cultural outputs","Production craft sustains long-term quality","Collaboration between disciplines produces stronger work"],
        impactUnit: "Production module", impactPrice: "Project-based", status: "PROTOTYPE", region: "INT · OSL" },
    ],
  },
];

const PATHWAYS = [
  { id: "4PEOPLE", label: "4People", audience: "Members, creatives, supporters",
    headline: "Participate in planetary systems.",
    body: "Join the platform as a member. Activate impact. Enter the worlds. Track restoration over time.",
    ctas: [{ label: "Join free", href: "#membership", primary: true },{ label: "Activate membership", href: "#membership" },{ label: "Enter worlds", href: "#worlds" },{ label: "Track impact", href: "#impact" }] },
  { id: "4BRANDS", label: "4Brands", audience: "Sponsors, aligned brands, enterprise",
    headline: "Become Yours × 4PLANET.",
    body: "Sponsor a world. Co-produce a project. Build a co-branded planetary partnership — Brand × 4PLANET.",
    ctas: [{ label: "Partner with 4PLANET", href: "#partners", primary: true },{ label: "Sponsor a project", href: "#worlds" },{ label: "Request strategy session", href: "#partners" },{ label: "Build a custom program", href: "#partners" }] },
  { id: "4PARTNERS", label: "4Partners", audience: "NGOs, field operators, scientists, technology partners",
    headline: "Join the field network.",
    body: "For implementation organisations, restoration teams, marine biologists, indigenous stewards, technology partners and field researchers.",
    ctas: [{ label: "Join the field network", href: "#partners", primary: true },{ label: "Become an implementation partner", href: "#partners" },{ label: "Submit a project", href: "#partners" },{ label: "Apply for collaboration", href: "#partners" }] },
  { id: "INVESTORS", label: "Investors / Philanthropy", audience: "Foundations, philanthropy, strategic funders",
    headline: "Quiet institutional channel.",
    body: "A separate pathway for partners interested in the long-term system model, financial architecture and strategic positioning of 4PLANET.",
    subtle: true,
    ctas: [{ label: "View system model", href: "#partners", primary: true },{ label: "Request investor deck", href: "#partners" },{ label: "Schedule a meeting", href: "#partners" }] },
];

const IMPACT_ACTIONS = [
  { id: "tree", name: "Plant 1 tree", price: 50, currency: "NOK", domain: "E4RTH · CLIM4TE", systemId: "E4RTH", projectCode: "03", detail: "One tree planted by a CLIM4TE partner — location recorded, follow-up data collected." },
  { id: "rainforest", name: "Protect 1 m² rainforest", price: 50, currency: "NOK", domain: "E4RTH · AM4ZONIA", systemId: "E4RTH", projectCode: "01", detail: "One square metre of standing rainforest under long-term indigenous stewardship." },
  { id: "plastic", name: "Recover 1 kg marine debris", price: 50, currency: "NOK", domain: "OCE4N · CLE4N", systemId: "OCE4N", projectCode: "03", detail: "One kilogram of marine debris extracted and weighed by coastal recovery partners." },
  { id: "coral", name: "Support coral restoration", price: 100, currency: "NOK", domain: "OCE4N · COR4L", systemId: "OCE4N", projectCode: "02", detail: "Coral nursery operations with marine science teams in coral reef sectors." },
  { id: "habitat", name: "Restore 1 m² habitat", price: 50, currency: "NOK", domain: "E4RTH · RE:WILD", systemId: "E4RTH", projectCode: "04", detail: "One square metre of degraded habitat restored — designed for decades, not seasons." },
  { id: "whale", name: "Fund 1 day of whale monitoring", price: 100, currency: "NOK", domain: "OCE4N · WH4LES", systemId: "OCE4N", projectCode: "01", detail: "24 hours of acoustic and visual monitoring of migratory whale populations." },
];

const MEMBERSHIP_TIERS = [
  { n: "01", tier: "Member", price: "Free", positioning: "The first step into 4PLANET.",
    features: ["Access to all worlds and projects","Editorial newsletter and field notes","Read 4PLANET MAGAZINE","Cultural participation"], cta: "Join free" },
  { n: "02", tier: "Active member", price: "From NOK 150 / month", positioning: "Recurring participation in living systems.",
    features: ["Monthly contribution funds selected interventions","Personal impact record","Member access to events and live culture","Limited editions and print drops","Quarterly field report"], cta: "Activate membership", featured: true },
  { n: "03", tier: "Operating member", price: "From NOK 950 / year", positioning: "Deeper participation in the operating system.",
    features: ["Full reporting access","Priority event access","Direct connection to implementation partners","Annual operating report","Limited edition operating print"], cta: "Become operating" },
];

const PLANETARY_SIGNALS = [
  { n: "01", section: "Science", read: "8 min read", title: "The whale pump",
    teaser: "How whale feeding behaviour connects to phytoplankton, ocean oxygen and the planet's carbon cycle.",
    systemId: "OCE4N", projectCode: "01" },
  { n: "02", section: "Essay", read: "5 min read", title: "Rainforests create weather.",
    teaser: "A rainforest is not a collection of trees — it is a living climate system that moves water across regions.",
    systemId: "E4RTH", projectCode: "01" },
  { n: "03", section: "Field", read: "12 min read", title: "What kelp remembers.",
    teaser: "Restoration along Norwegian coastlines — and the slow return of kelp forests, sea urchins and biological structure.",
    systemId: "OCE4N", projectCode: "04" },
  { n: "04", section: "Operations", read: "6 min read", title: "Inside the intervention registry.",
    teaser: "How partner submissions become field notes, reviews and verified records — and why this design protects trust.",
    systemId: "E4RTH", projectCode: "03" },
];

const NAV_LINKS = [
  { id: "worlds", label: "Worlds" }, { id: "impact", label: "Impact" }, { id: "membership", label: "Membership" },
  { id: "signals", label: "Magazine" }, { id: "partners", label: "Partners" }, { id: "about", label: "About" },
];

const Reveal = ({ children, delay = 0, y = 8, className = "" }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
};

const Arrow = ({ className = "" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" /></svg>;

const ScrollLink = ({ href, onNavigate, children, className, ariaLabel }) => (
  <a href={href} aria-label={ariaLabel} onClick={(e) => {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); if (onNavigate) onNavigate(); }
  }} className={className}>{children}</a>
);

const StatusDot = ({ status, tone = "default" }) => {
  const map = { "PILOT-READY": "#16a34a", "PARTNER-READY": "#2E2EFF", PROTOTYPE: "#a1a1aa" };
  const textColor = tone === "light" ? "text-white/65" : "text-zinc-500";
  return <span className={`inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] ${textColor}`}><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: map[status] || "#a1a1aa" }} />{status}</span>;
};

/* ============================================================
   HEADER + HERO
   ============================================================ */
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const clock = useLiveClock();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  useEscape(open, () => setOpen(false));
  const close = () => setOpen(false);

  return (
    <>
      <header role="banner" className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-black/[0.05] bg-white/85 backdrop-blur-md" : "border-b border-transparent bg-white/0"}`}>
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6 md:h-16 md:px-12">
          <ScrollLink href="#top" className="flex items-baseline gap-2.5" ariaLabel="4PLANET — back to top">
            <span className="text-[15px] font-semibold tracking-tight md:text-[16px]">4PLANET</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 md:inline"><span className="tab-nums">{clock}</span> · OSL</span>
          </ScrollLink>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <ScrollLink key={l.id} href={`#${l.id}`} className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:text-black">{l.label}</ScrollLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ScrollLink href="#membership" className="hidden items-center gap-2 bg-[#2E2EFF] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-all hover:bg-[#0E0EAB] md:inline-flex">Join 4PLANET <Arrow className="h-3 w-3" /></ScrollLink>
            <button onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white/90 backdrop-blur-md transition-shadow active:scale-95 md:hidden">
              <span className="relative block h-3.5 w-4" aria-hidden>
                <span className={`absolute left-0 right-0 block h-px bg-black transition-all duration-300 ${open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"}`} />
                <span className={`absolute left-0 right-0 block h-px bg-black transition-all duration-300 ${open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-black/25" onClick={close} />
            <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="absolute left-3 right-3 top-[68px] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <div className="p-2">
                {NAV_LINKS.map((l) => (
                  <ScrollLink key={l.id} href={`#${l.id}`} onNavigate={close} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium tracking-tight text-black transition-colors hover:bg-zinc-50">
                    {l.label}
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400" aria-hidden>→</span>
                  </ScrollLink>
                ))}
                <div className="my-2 h-px bg-black/[0.05]" />
                <ScrollLink href="#membership" onNavigate={close} className="flex items-center justify-between rounded-xl bg-[#2E2EFF] px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white">Join 4PLANET <Arrow className="h-3 w-3" /></ScrollLink>
              </div>
              <div className="flex items-center justify-between border-t border-black/[0.05] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500"><span>v1.3 · Master platform</span><span>Oslo · 60°N</span></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => {
  const clock = useLiveClock();
  return (
    <section id="top" className="relative overflow-hidden bg-white pt-24 md:pt-32" aria-label="4PLANET introduction">
      <QuietAmbient opacity={0.5} />
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          <span className="flex items-center gap-2"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2E2EFF] fp-blink" />v1.3 · Planetary operating system</span>
          <span className="hidden md:inline tab-nums"><span className="text-zinc-400">UTC</span> {clock}<span className="mx-3 text-zinc-300">·</span>OSL 60°N</span>
        </div>
        <h1 className="display-tight mt-12 text-[13vw] font-medium md:mt-16 md:text-[10vw] lg:text-[140px]">4PLANET</h1>
        <div className="mt-10 grid grid-cols-12 gap-y-10 md:mt-16 md:gap-x-10">
          <div className="col-span-12 flex flex-col md:col-span-6">
            <Reveal><p className="display text-[30px] font-medium tracking-tight md:text-[52px] md:leading-[1.05]">A <span className="text-[#2E2EFF]">planetary operating system</span> for living Earth.</p></Reveal>
            <Reveal delay={0.1}><p className="mt-8 max-w-md text-[16px] leading-[1.55] text-zinc-700 md:mt-10 md:text-[19px] md:leading-[1.5]">A cultural and ecological platform turning funding, storytelling and partnerships into measurable action for the worlds and species that hold life on Earth together.</p></Reveal>
          </div>
          <div className="col-span-12 md:col-span-6">
            <Reveal delay={0.15}><AtmosphericPanel domain="OCE4N" className="aspect-[4/5] w-full md:aspect-[3/4]" /></Reveal>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-12 gap-2 md:mt-20">
          <ScrollLink href="#membership" className="col-span-12 inline-flex items-center justify-between bg-[#2E2EFF] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0E0EAB] md:col-span-4">Join 4PLANET <Arrow className="h-3 w-3" /></ScrollLink>
          <ScrollLink href="#worlds" className="col-span-12 inline-flex items-center justify-between border border-black px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:bg-black hover:text-white md:col-span-4">Explore worlds <Arrow className="h-3 w-3" /></ScrollLink>
          <ScrollLink href="#impact" className="col-span-12 inline-flex items-center justify-between border border-black/[0.12] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:border-black md:col-span-4">Fund impact <Arrow className="h-3 w-3" /></ScrollLink>
        </div>
        <div className="h-24 md:h-36" />
      </div>
    </section>
  );
};

/* ============================================================
   PATHWAYS + IMPACT ACTIONS
   ============================================================ */
const Pathways = () => {
  const [activeId, setActiveId] = useState("4PEOPLE");
  const active = PATHWAYS.find((r) => r.id === activeId);
  return (
    <section id="pathways" className="relative bg-white py-24 md:py-32" aria-label="Choose your pathway">
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          <span>01 · Pathways</span>
          <span className="hidden md:inline">Choose how you enter the platform</span>
        </div>
        <div className="mt-10 grid grid-cols-12 gap-y-10 md:mt-14 md:gap-x-12">
          <div className="col-span-12 md:col-span-7">
            <Reveal>
              <h2 className="display text-[34px] font-medium tracking-tight md:text-[60px]">
                For people, brands, partners
                <br />and <span className="text-zinc-400">quiet institutional channels</span>.
              </h2>
            </Reveal>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-px bg-black/[0.06] md:mt-16 md:grid-cols-3" role="tablist">
          {PATHWAYS.filter(p => !p.subtle).map((r) => {
            const isActive = r.id === activeId;
            return (
              <button key={r.id} role="tab" aria-selected={isActive} aria-label={`Show pathway for ${r.label}`} onClick={() => setActiveId(r.id)} className={`flex flex-col items-start gap-4 p-7 text-left transition-all duration-500 md:p-9 ${isActive ? "bg-[#2E2EFF] text-white" : "bg-white hover:bg-[var(--fp-paper)]"}`}>
                <div className="flex w-full items-center justify-between">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${isActive ? "text-white/65" : "text-zinc-400"}`}>PATHWAY / 0{PATHWAYS.indexOf(r) + 1}</span>
                  {isActive && <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">Selected</span>}
                </div>
                <div className="display text-[28px] font-medium tracking-tight md:text-[38px]">{r.label}</div>
                <div className={`text-[13.5px] leading-[1.55] ${isActive ? "text-white/80" : "text-zinc-600"}`}>{r.audience}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-px">
          <button onClick={() => setActiveId("INVESTORS")} aria-label="Show pathway for Investors and Philanthropy" className={`flex w-full items-center justify-between border-t border-black/[0.06] px-7 py-6 text-left transition-colors md:px-9 md:py-7 ${activeId === "INVESTORS" ? "bg-black text-white" : "bg-white hover:bg-[var(--fp-paper)]"}`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
              <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${activeId === "INVESTORS" ? "text-white/65" : "text-zinc-400"}`}>PATHWAY / 04 · INSTITUTIONAL</span>
              <span className="text-[18px] font-medium tracking-tight md:text-[20px]">Investors / Philanthropy</span>
              <span className={`hidden text-[13px] md:inline ${activeId === "INVESTORS" ? "text-white/65" : "text-zinc-500"}`}>— foundations, philanthropy, strategic funders</span>
            </div>
            <Arrow className={`h-3 w-3 ${activeId === "INVESTORS" ? "text-white" : "text-zinc-400"}`} />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-12 border-t border-black/[0.08] pt-12 md:mt-16 md:pt-16" role="tabpanel">
            <div className="grid grid-cols-12 gap-y-10 md:gap-x-12">
              <div className="col-span-12 md:col-span-7">
                <h3 className="display text-[28px] font-medium tracking-tight md:text-[44px]">{active.headline}</h3>
                <p className="mt-7 max-w-xl text-[16px] leading-[1.6] text-zinc-700 md:text-[18px]">{active.body}</p>
              </div>
              <div className="col-span-12 md:col-span-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Actions for {active.label}</div>
                <div className="mt-6 flex flex-col gap-2">
                  {active.ctas.map((cta) => (
                    <ScrollLink key={cta.label} href={cta.href} className={cta.primary ? "inline-flex items-center justify-between bg-[#2E2EFF] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0E0EAB]" : "inline-flex items-center justify-between border border-black/[0.15] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:border-black hover:bg-black hover:text-white"}>
                      {cta.label} <Arrow className="h-3 w-3" />
                    </ScrollLink>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

const ImpactActions = ({ onEnterProject }) => (
  <section id="impact" className="relative bg-[var(--fp-paper)] py-24 md:py-36" aria-label="Impact actions">
    <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <span>02 · Impact</span>
        <span className="hidden md:inline">Fund measurable ecological action</span>
      </div>
      <div className="mt-10 grid grid-cols-12 gap-y-10 md:mt-14 md:gap-x-12">
        <div className="col-span-12 md:col-span-7">
          <Reveal><h2 className="display text-[34px] font-medium tracking-tight md:text-[60px]">Ecological action in <span className="text-[#2E2EFF]">simple units</span>.</h2></Reveal>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9 md:pt-4">
          <Reveal delay={0.1}><p className="text-[15px] leading-[1.6] text-zinc-700 md:text-[16px]">Each unit ties to a specific intervention, an implementation partner and a follow-up record. Directly fund measurable work.</p></Reveal>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-5 md:mt-20 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {IMPACT_ACTIONS.map((u, i) => {
          const system = SYSTEMS.find((s) => s.id === u.systemId);
          const project = system?.projects.find((p) => p.code === u.projectCode);
          return (
            <Reveal key={u.id} delay={i * 0.05} className="h-full">
              <div className="flex h-full flex-col bg-white">
                {project && <ProjectAtmosphere system={system} project={project} className="aspect-[16/9] w-full" showOverlay={false} />}
                <div className="flex flex-1 flex-col gap-5 p-6 md:p-8">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                    <span>{u.domain}</span>
                    <span className="tab-nums">{u.currency} {u.price}</span>
                  </div>
                  <h3 className="display text-[24px] font-medium tracking-tight md:text-[28px]">{u.name}</h3>
                  <p className="text-[13.5px] leading-[1.6] text-zinc-600 md:text-[14px]">{u.detail}</p>
                  <div className="mt-auto flex flex-col gap-2 md:flex-row">
                    <button className="inline-flex flex-1 items-center justify-between bg-[#2E2EFF] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0E0EAB]" aria-label={`Fund ${u.name}`}>Fund this <Arrow className="h-3 w-3" /></button>
                    {project && <button onClick={() => onEnterProject({ system, project })} className="inline-flex items-center justify-between border border-black/[0.15] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:border-black hover:bg-black hover:text-white" aria-label={`Read ${project.name} case`}>Read case <Arrow className="h-3 w-3" /></button>}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

/* ============================================================
   WORLDS + WORLD DRAWER + PROJECT IMMERSIVE
   ============================================================ */
const Worlds = ({ onEnterWorld }) => (
  <section id="worlds" className="relative bg-white py-24 md:py-36" aria-label="The four worlds">
    <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <span>03 · Worlds</span>
        <span className="hidden md:inline">Four planetary domains</span>
      </div>
      <div className="mt-10 grid grid-cols-12 gap-y-10 md:mt-14 md:gap-x-12">
        <div className="col-span-12 md:col-span-8">
          <Reveal><h2 className="display text-[40px] font-medium leading-[1.05] tracking-tight md:text-[80px] md:leading-[1]">Enter the worlds.</h2></Reveal>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-5 md:mt-20 md:grid-cols-2 md:gap-7">
        {SYSTEMS.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.08}>
            <motion.button onClick={() => onEnterWorld(s.id)} aria-label={`Enter ${s.title} world`} whileHover={{ y: -3 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="group relative block aspect-[4/5] w-full overflow-hidden bg-black text-left md:aspect-[5/6] lg:aspect-[4/5]">
              <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]">
                <AtmosphericPanel domain={s.id} className="h-full w-full" showOverlay={false} />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-between p-7 text-white md:p-10">
                <div className="flex items-start justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
                    <div className="flex items-center gap-2"><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />WORLD / {s.code}</div>
                    <div className="mt-1 text-white/45">{s.domain}</div>
                  </div>
                  <div className="text-right font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                    <div>{s.sectors} sectors</div>
                    <div className="mt-1">{s.partners} partners</div>
                  </div>
                </div>
                <div className="flex-1" />
                <div>
                  <div className="display text-[44px] font-medium tracking-tight md:text-[68px] lg:text-[80px]">{s.title}</div>
                  <p className="mt-5 max-w-md text-[13px] leading-[1.55] text-white/75 md:text-[14px]">{s.feel}</p>
                  <div className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 transition-colors group-hover:text-white">Enter world <Arrow className="h-3 w-3" /></div>
                </div>
              </div>
            </motion.button>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const WorldDrawer = ({ worldId, onClose, onEnterProject }) => {
  const open = !!worldId;
  const system = SYSTEMS.find((s) => s.id === worldId);
  useEscape(open, onClose);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  return (
    <AnimatePresence>
      {open && system && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[80] overflow-y-auto bg-black" role="dialog" aria-modal="true" aria-label={`${system.title} world`}>
          <div className="fixed inset-0 z-0">
            <AtmosphericPanel domain={system.id} className="h-full w-full" showOverlay={false} />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="sticky top-0 z-20 border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6 md:h-16 md:px-12">
              <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80">
                <span className="flex items-center gap-2"><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: system.color }} />WORLD / {system.code}</span>
                <span className="hidden md:inline text-white/45">{system.domain}</span>
              </div>
              <button onClick={onClose} aria-label="Close world" className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70 hover:text-white">Close ✕</button>
            </div>
          </div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-auto max-w-[1440px] px-6 py-16 text-white md:px-12 md:py-24">
            <div className="grid grid-cols-12 gap-y-10 md:gap-x-12">
              <div className="col-span-12 md:col-span-8">
                <h2 className="display-tight text-[60px] font-medium leading-[0.95] md:text-[180px]">{system.title}</h2>
                <p className="mt-8 max-w-2xl text-[18px] leading-[1.5] text-white/75 md:mt-12 md:text-[28px] md:leading-[1.35]">{system.feel}</p>
              </div>
              <div className="col-span-12 flex flex-col justify-end md:col-span-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Manifesto</div>
                <p className="mt-4 text-[14px] leading-[1.6] text-white/75 md:text-[15px]">{system.manifesto}</p>
                <div className="tab-nums mt-8 grid grid-cols-2 gap-px bg-white/[0.12]">
                  <div className="bg-black/40 p-4"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Sectors</div><div className="mt-1.5 text-[20px] font-medium">{system.sectors}</div></div>
                  <div className="bg-black/40 p-4"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Partners</div><div className="mt-1.5 text-[20px] font-medium">{system.partners}</div></div>
                </div>
              </div>
            </div>
            <div className="mt-20 md:mt-32">
              <div className="flex items-baseline justify-between border-b border-white/[0.12] pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">Sectors · {system.projects.length}</span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 md:inline">Enter a sector →</span>
              </div>
              <div className="divide-y divide-white/[0.08]">
                {system.projects.map((p) => (
                  <button key={p.code} onClick={() => onEnterProject({ system, project: p })} aria-label={`Enter ${p.name} sector`} className="group grid w-full grid-cols-12 items-center gap-x-3 gap-y-2 py-6 text-left transition-colors hover:bg-white/[0.04] md:gap-x-6 md:py-8">
                    <div className="col-span-12 flex items-center gap-6 md:col-span-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{p.code}</span>
                      <div className="display text-[28px] font-medium tracking-tight md:text-[40px]">{p.name}</div>
                    </div>
                    <div className="col-span-12 md:col-span-5">
                      <div className="text-[15px] text-white/85 md:text-[16px]">{p.unit}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{p.region}</div>
                    </div>
                    <div className="col-span-12 flex items-center justify-between md:col-span-4 md:justify-end md:gap-6">
                      <StatusDot status={p.status} tone="light" />
                      <Arrow className="hidden h-4 w-4 text-white/45 transition-colors group-hover:text-white md:block" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-16 grid grid-cols-12 gap-2 md:mt-24">
              <ScrollLink href="#membership" onNavigate={onClose} className="col-span-12 inline-flex items-center justify-between bg-[#2E2EFF] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0E0EAB] md:col-span-6">Join 4PLANET to track this world <Arrow className="h-3 w-3" /></ScrollLink>
              <ScrollLink href="#partners" onNavigate={onClose} className="col-span-12 inline-flex items-center justify-between border border-white px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-black md:col-span-6">Sponsor this world <Arrow className="h-3 w-3" /></ScrollLink>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NarrativeBlock = ({ label, body }) => (
  <div className="col-span-12 md:col-span-6">
    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">{label}</div>
    <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-white/85 md:text-[18px] md:leading-[1.55]">{body}</p>
  </div>
);

const ProjectImmersive = ({ data, onClose }) => {
  const open = !!data;
  useEscape(open, onClose);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  return (
    <AnimatePresence>
      {open && data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[90] overflow-y-auto bg-black" role="dialog" aria-modal="true" aria-label={`${data.project.name} sector`}>
          <div className="fixed inset-0 z-0">
            <ProjectAtmosphere system={data.system} project={data.project} className="h-full w-full" showOverlay={false} />
            <div className="absolute inset-0 bg-black/35" />
          </div>
          <div className="sticky top-0 z-20 border-b border-white/[0.08] bg-black/45 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6 md:h-16 md:px-12">
              <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80"><span>{data.system.title} / {data.project.code} — {data.project.name}</span></div>
              <button onClick={onClose} aria-label="Close sector" className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70 hover:text-white">Close ✕</button>
            </div>
          </div>
          <motion.article initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-auto max-w-[1440px] px-6 py-14 text-white md:px-12 md:py-20">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">{data.system.title}_{data.project.code} / SECTOR</div>
            <h2 className="display-tight mt-6 text-[56px] font-medium leading-[0.95] md:mt-10 md:text-[160px]">{data.project.name}</h2>
            <p className="mt-6 max-w-2xl text-[18px] leading-[1.5] text-white/80 md:mt-8 md:text-[26px] md:leading-[1.35]">{data.project.unit}.</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-white/[0.12] py-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
              <StatusDot status={data.project.status} tone="light" />
              <span><span className="text-white/45">Region</span> <span className="text-white/90">{data.project.region}</span></span>
              <span><span className="text-white/45">World</span> <span className="text-white/90">{data.system.title}</span></span>
              <span className="ml-auto">{data.project.impactUnit} · <span className="text-[#2E2EFF]">{data.project.impactPrice}</span></span>
            </div>
            <div className="mt-16 grid grid-cols-12 gap-y-14 md:mt-24 md:gap-x-12">
              <NarrativeBlock label="The problem" body={data.project.problem} />
              <NarrativeBlock label="Why it matters" body={data.project.whyItMatters} />
              <NarrativeBlock label="Our approach" body={data.project.approach} />
              <div className="col-span-12 md:col-span-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Key facts</div>
                <ul className="mt-5 space-y-3">
                  {data.project.facts.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] leading-[1.55] text-white/80 md:text-[16px]">
                      <span className="mt-3 h-px w-3 shrink-0 bg-white/40" />{f}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Facts are illustrative · Not overclaiming · Designed to introduce, not to verify</p>
              </div>
            </div>
            <div className="mt-20 border-t border-white/[0.12] pt-12 md:mt-28 md:pt-16">
              <div className="grid grid-cols-12 gap-y-8 md:gap-x-12">
                <div className="col-span-12 md:col-span-7">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Direct impact action</div>
                  <h3 className="display mt-5 text-[32px] font-medium tracking-tight md:text-[56px]">{data.project.impactUnit}</h3>
                  <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#2E2EFF]">Indicative · {data.project.impactPrice}</p>
                </div>
                <div className="col-span-12 flex flex-col gap-2 md:col-span-5 md:justify-end">
                  <button onClick={onClose} className="inline-flex items-center justify-between bg-[#2E2EFF] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0E0EAB]">Fund this intervention <Arrow className="h-3 w-3" /></button>
                  <ScrollLink href="#partners" onNavigate={onClose} className="inline-flex items-center justify-between border border-white/40 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-black">Sponsor this sector <Arrow className="h-3 w-3" /></ScrollLink>
                </div>
              </div>
            </div>
            <div className="mt-14 flex flex-col items-start justify-between gap-2 border-t border-white/[0.08] pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 md:flex-row">
              <span>4PLANET / {data.system.title} / {data.project.code} {data.project.name}</span>
              <span>Illustrative prototype · not verified field data</span>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   MEMBERSHIP
   ============================================================ */
const Membership = () => (
  <section id="membership" className="relative bg-white py-24 md:py-36" aria-label="Membership">
    <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <span>04 · Membership</span>
        <span className="hidden md:inline">Participation in planetary systems</span>
      </div>
      <div className="mt-10 grid grid-cols-12 gap-y-10 md:mt-14 md:gap-x-12">
        <div className="col-span-12 md:col-span-7">
          <Reveal><h2 className="display text-[34px] font-medium tracking-tight md:text-[60px]">Become part of the <span className="text-[#2E2EFF]">operating system</span>.</h2></Reveal>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9 md:pt-4">
          <Reveal delay={0.1}><p className="text-[15px] leading-[1.6] text-zinc-600 md:text-[16px]">Membership in 4PLANET is participation — not subscription. Start free. Activate when you're ready. Operate when you want to go deeper.</p></Reveal>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-px bg-black/[0.06] md:mt-20 md:grid-cols-3">
        {MEMBERSHIP_TIERS.map((t, i) => (
          <Reveal key={t.tier} delay={i * 0.07} className="h-full">
            <div className={`flex h-full min-h-[440px] flex-col gap-6 p-7 md:min-h-[500px] md:p-9 ${t.featured ? "bg-[#2E2EFF] text-white" : "bg-white"}`}>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${t.featured ? "text-white/65" : "text-zinc-400"}`}>TIER / {t.n}</span>
                <span className={`h-1.5 w-1.5 ${t.featured ? "bg-white" : "bg-black"}`} />
              </div>
              <div>
                <h4 className="text-[28px] font-medium tracking-tight md:text-[34px]">{t.tier}</h4>
                <p className={`mt-3 text-[14px] ${t.featured ? "text-white/75" : "text-zinc-600"}`}>{t.positioning}</p>
                <p className={`mt-5 font-mono text-[11px] uppercase tracking-[0.2em] ${t.featured ? "text-white/65" : "text-zinc-500"}`}>{t.price}</p>
              </div>
              <ul className="space-y-3 pt-2">
                {t.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-[14px] leading-[1.55] ${t.featured ? "text-white/90" : "text-zinc-700"}`}>
                    <span className={`mt-2 h-px w-3 shrink-0 ${t.featured ? "bg-white/40" : "bg-zinc-400"}`} />{f}
                  </li>
                ))}
              </ul>
              <button className={`mt-auto inline-flex items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${t.featured ? "border border-white text-white hover:bg-white hover:text-[#2E2EFF]" : "border border-black text-black hover:bg-black hover:text-white"}`}>{t.cta} <Arrow className="h-3 w-3" /></button>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Indicative pricing · membership system in development</p>
    </div>
  </section>
);

/* ============================================================
   PARTNERS / SPONSORS
   ============================================================ */
const Partners = () => (
  <section id="partners" className="relative bg-[var(--fp-paper)] py-24 md:py-36" aria-label="Partner programme">
    <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <span>05 · Partners</span>
        <span className="hidden md:inline">For sponsors, implementation partners and institutional funders</span>
      </div>
      <div className="mt-10 grid grid-cols-12 gap-y-10 md:mt-14 md:gap-x-12">
        <div className="col-span-12 md:col-span-7">
          <Reveal><h2 className="display text-[34px] font-medium tracking-tight md:text-[60px]">Become <span className="text-[#2E2EFF]">Yours × 4PLANET</span>.</h2></Reveal>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9 md:pt-4">
          <Reveal delay={0.1}><p className="text-[15px] leading-[1.6] text-zinc-700 md:text-[16px]">Co-branded planetary partnerships. Sponsor a world. Co-produce a project. Build a long-term cultural and ecological alliance.</p></Reveal>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-px bg-black/[0.06] md:mt-20 md:grid-cols-3">
        {[
          { n: "01", tier: "Sponsor", positioning: "Sponsor one project or one sector.", price: "From NOK 25 000 / quarter",
            features: ["Sponsor a single sector","Quarterly impact report","Editorial mention","Basic reporting access"] },
          { n: "02", tier: "Brand × 4PLANET", positioning: "Co-branded partnership across one or more worlds.", price: "By proposal", featured: true,
            features: ["Co-branded campaign","Sponsor a full world or domain","Cultural activation by P4NTHER","Full reporting access","Joint editorial publication"] },
          { n: "03", tier: "Implementation partner", positioning: "For NGOs, scientists, restoration teams.", price: "Open application",
            features: ["Join the field network","Receive funding routed via impact units","Submit field reports","Storytelling support","Long-term collaboration"] },
        ].map((t) => (
          <div key={t.tier} className={`flex h-full min-h-[440px] flex-col gap-6 p-7 md:min-h-[500px] md:p-9 ${t.featured ? "bg-black text-white" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${t.featured ? "text-white/65" : "text-zinc-400"}`}>TIER / {t.n}</span>
              <span className={`h-1.5 w-1.5 ${t.featured ? "bg-[#2E2EFF]" : "bg-black"}`} />
            </div>
            <div>
              <h4 className="text-[26px] font-medium tracking-tight md:text-[32px]">{t.tier}</h4>
              <p className={`mt-3 text-[14px] ${t.featured ? "text-white/75" : "text-zinc-600"}`}>{t.positioning}</p>
              <p className={`mt-5 font-mono text-[11px] uppercase tracking-[0.2em] ${t.featured ? "text-white/65" : "text-zinc-500"}`}>{t.price}</p>
            </div>
            <ul className="space-y-3 pt-2">
              {t.features.map((f) => (
                <li key={f} className={`flex items-start gap-3 text-[14px] leading-[1.55] ${t.featured ? "text-white/90" : "text-zinc-700"}`}>
                  <span className={`mt-2 h-px w-3 shrink-0 ${t.featured ? "bg-white/40" : "bg-zinc-400"}`} />{f}
                </li>
              ))}
            </ul>
            <ScrollLink href="#about" className={`mt-auto inline-flex items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${t.featured ? "border border-white text-white hover:bg-white hover:text-black" : "border border-black text-black hover:bg-black hover:text-white"}`}>Request brief <Arrow className="h-3 w-3" /></ScrollLink>
          </div>
        ))}
      </div>
      <div className="mt-16 grid grid-cols-12 gap-y-8 border-t border-black/[0.08] pt-12 md:mt-20 md:gap-x-12 md:pt-16">
        <div className="col-span-12 md:col-span-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Quiet institutional channel</div>
          <h3 className="display mt-5 text-[28px] font-medium tracking-tight md:text-[44px]">For foundations, philanthropy<br />and strategic funders.</h3>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="flex flex-col gap-2">
            <ScrollLink href="#about" className="inline-flex items-center justify-between border border-black/[0.15] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:border-black hover:bg-black hover:text-white">View system model <Arrow className="h-3 w-3" /></ScrollLink>
            <ScrollLink href="#about" className="inline-flex items-center justify-between border border-black/[0.15] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:border-black hover:bg-black hover:text-white">Request investor deck <Arrow className="h-3 w-3" /></ScrollLink>
            <ScrollLink href="#about" className="inline-flex items-center justify-between bg-black px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2E2EFF]">Schedule a meeting <Arrow className="h-3 w-3" /></ScrollLink>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ============================================================
   PLANETARY SIGNALS — magazine / culture layer
   ============================================================ */
const PlanetarySignals = ({ onEnterProject }) => (
  <section id="signals" className="relative bg-white py-24 md:py-36" aria-label="Planetary signals — magazine">
    <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <span>06 · Planetary Signals</span>
        <span className="hidden md:inline">Editorial · science · field · operations</span>
      </div>
      <div className="mt-10 grid grid-cols-12 gap-y-10 md:mt-14 md:gap-x-12">
        <div className="col-span-12 md:col-span-7">
          <Reveal><h2 className="display text-[34px] font-medium tracking-tight md:text-[60px]">From the field, the lab<br />and the <span className="text-zinc-400">cultural archive</span>.</h2></Reveal>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9 md:pt-4">
          <Reveal delay={0.1}><p className="text-[15px] leading-[1.6] text-zinc-700 md:text-[16px]">4PLANET MAGAZINE translates science, field work, ecology and culture into visual essays — published online and in print.</p></Reveal>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-px bg-black/[0.06] md:mt-20 md:grid-cols-2">
        {PLANETARY_SIGNALS.map((s, i) => {
          const system = SYSTEMS.find((sys) => sys.id === s.systemId);
          const project = system?.projects.find((p) => p.code === s.projectCode);
          return (
            <Reveal key={s.n} delay={i * 0.06} className="h-full">
              <article className="group flex h-full flex-col bg-white">
                {project && (
                  <button
                    onClick={() => onEnterProject({ system, project })}
                    aria-label={`Open story — ${s.title}`}
                    className="block w-full overflow-hidden"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <ProjectAtmosphere system={system} project={project} className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]" showOverlay={false} />
                    </div>
                  </button>
                )}
                <div className="flex flex-1 flex-col gap-5 p-7 md:p-10">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                    <span>STORY / {s.n} · {s.section}</span>
                    <span>{s.read}</span>
                  </div>
                  <h3 className="display text-[26px] font-medium tracking-tight md:text-[36px] md:leading-[1.05]">{s.title}</h3>
                  <p className="text-[14.5px] leading-[1.6] text-zinc-600 md:text-[15.5px]">{s.teaser}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{system?.title} · {project?.name}</span>
                    {project && (
                      <button onClick={() => onEnterProject({ system, project })} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:text-[#2E2EFF]" aria-label={`Read ${s.title}`}>
                        Read story <Arrow className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
      <div className="mt-16 grid grid-cols-12 gap-2 md:mt-20">
        <ScrollLink href="#membership" className="col-span-12 inline-flex items-center justify-between bg-[#2E2EFF] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0E0EAB] md:col-span-6">Subscribe to 4PLANET MAGAZINE <Arrow className="h-3 w-3" /></ScrollLink>
        <ScrollLink href="#partners" className="col-span-12 inline-flex items-center justify-between border border-black px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-colors hover:bg-black hover:text-white md:col-span-6">Partner on a story <Arrow className="h-3 w-3" /></ScrollLink>
      </div>
    </div>
  </section>
);

/* ============================================================
   ABOUT — origin, legacy, base
   ============================================================ */
const About = () => (
  <section id="about" className="relative bg-[var(--fp-paper)] py-24 md:py-36" aria-label="About 4PLANET">
    <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <span>07 · About</span>
        <span className="hidden md:inline">Origin · base · legacy</span>
      </div>
      <div className="mt-10 grid grid-cols-12 gap-y-12 md:mt-14 md:gap-x-12">
        <div className="col-span-12 md:col-span-8">
          <Reveal>
            <h2 className="display text-[34px] font-medium tracking-tight md:text-[60px]">A platform built on<br /><span className="text-[#2E2EFF]">stewardship</span> and <span className="text-zinc-500">continuity</span>.</h2>
          </Reveal>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-12 gap-y-12 md:mt-20 md:gap-x-12">
        <div className="col-span-12 md:col-span-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Origin</div>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.65] text-zinc-700 md:text-[19px] md:leading-[1.55]">
            4PLANET is founded by Odin Oddekalv — a second-generation
            environmental activist — and built in Oslo. The platform carries
            forward the lifelong work of Kurt Oddekalv and a tradition of
            field-based, uncompromising environmental practice.
          </p>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.65] text-zinc-600 md:text-[16px]">
            The current version is a prototype — a deliberate early-stage
            structure for inviting partners, members, foundations and
            implementation organisations into the system as it grows.
          </p>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="grid grid-cols-2 gap-px bg-black/[0.08]">
            <div className="bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Base</div>
              <div className="mt-3 text-[18px] font-medium tracking-tight">Oslo · Norway</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">60°N · 10°E</div>
            </div>
            <div className="bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Founded</div>
              <div className="mt-3 text-[18px] font-medium tracking-tight">P4NTHER collective</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Cultural arm · 4Culture</div>
            </div>
            <div className="bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Worlds</div>
              <div className="mt-3 text-[18px] font-medium tracking-tight">4 · 17 sectors</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">OCE4N · E4RTH · S4PIENS · 4CULTURE</div>
            </div>
            <div className="bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Stage</div>
              <div className="mt-3 text-[18px] font-medium tracking-tight">v1.3 · Prototype</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Inviting partners</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-black/[0.08] pt-12 md:mt-28 md:pt-16">
        <div className="grid grid-cols-12 gap-y-10 md:gap-x-12">
          <div className="col-span-12 md:col-span-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Legacy</div>
            <h3 className="display mt-5 text-[26px] font-medium tracking-tight md:text-[36px]">Continuity, not theatre.</h3>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.65] text-zinc-600 md:text-[16px]">
              Kurt Oddekalv built decades of environmental work in Norway through
              direct action, marine research support, documentation and
              long-term presence. 4PLANET continues that practice in a planetary
              and cultural form.
            </p>
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Position</div>
            <h3 className="display mt-5 text-[26px] font-medium tracking-tight md:text-[36px]">Independent. Cultural. Operational.</h3>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.65] text-zinc-600 md:text-[16px]">
              4PLANET is not an NGO and not a corporation. It is a hybrid
              platform — cultural, ecological, editorial, operational — designed
              to bring funding, attention and partnerships closer to verified
              field work.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ============================================================
   FINAL CTA + FOOTER
   ============================================================ */
const FinalCTA = () => (
  <section className="relative isolate overflow-hidden bg-black py-24 text-white md:py-32" aria-label="Join 4PLANET">
    <div className="absolute inset-0">
      <AtmosphericPanel domain="OCE4N" className="h-full w-full" showOverlay={false} />
      <div className="absolute inset-0 bg-black/55" />
    </div>
    <div className="relative mx-auto max-w-[1440px] px-6 md:px-12">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
        <span>08 · Enter the system</span>
        <span className="hidden md:inline">A planetary operating system in development</span>
      </div>
      <div className="mt-12 grid grid-cols-12 gap-y-10 md:mt-16 md:gap-x-12">
        <div className="col-span-12 md:col-span-8">
          <Reveal>
            <h2 className="display-tight text-[48px] font-medium leading-[0.95] md:text-[120px]">
              Become part of<br />4PLANET.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.55] text-white/75 md:mt-10 md:text-[22px] md:leading-[1.4]">
              Start free. Activate when you're ready. Operate when you want to
              go deeper. Co-produce a project. Sponsor a world. Join the field
              network.
            </p>
          </Reveal>
        </div>
        <div className="col-span-12 flex flex-col justify-end gap-2 md:col-span-4">
          <ScrollLink href="#membership" className="inline-flex items-center justify-between bg-[#2E2EFF] px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#0E0EAB]">Join 4PLANET <Arrow className="h-3 w-3" /></ScrollLink>
          <ScrollLink href="#worlds" className="inline-flex items-center justify-between border border-white/60 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-black">Explore worlds <Arrow className="h-3 w-3" /></ScrollLink>
          <ScrollLink href="#partners" className="inline-flex items-center justify-between border border-white/30 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/85 transition-colors hover:border-white hover:text-white">Partner with us <Arrow className="h-3 w-3" /></ScrollLink>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => {
  const clock = useLiveClock();
  return (
    <footer role="contentinfo" className="border-t border-black/[0.08] bg-white py-12 md:py-16">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-y-10 px-6 md:gap-x-12 md:px-12">
        <div className="col-span-12 md:col-span-4">
          <div className="text-[20px] font-semibold tracking-tight">4PLANET</div>
          <p className="mt-3 max-w-xs text-[13px] leading-[1.55] text-zinc-600">
            A planetary operating system — built in Oslo, scaled for Earth.
          </p>
          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            <span className="tab-nums">UTC {clock}</span> · OSL 60°N · v1.3
          </div>
        </div>
        <div className="col-span-6 md:col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Worlds</div>
          <ul className="mt-4 space-y-2 text-[13.5px] text-zinc-700">
            {SYSTEMS.map((s) => <li key={s.id}><a href="#worlds" className="hover:text-black">{s.title}</a></li>)}
          </ul>
        </div>
        <div className="col-span-6 md:col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Platform</div>
          <ul className="mt-4 space-y-2 text-[13.5px] text-zinc-700">
            <li><a href="#impact" className="hover:text-black">Impact</a></li>
            <li><a href="#membership" className="hover:text-black">Membership</a></li>
            <li><a href="#signals" className="hover:text-black">Magazine</a></li>
            <li><a href="#partners" className="hover:text-black">Partners</a></li>
            <li><a href="#about" className="hover:text-black">About</a></li>
          </ul>
        </div>
        <div className="col-span-12 md:col-span-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">Contact</div>
          <ul className="mt-4 space-y-2 text-[13.5px] text-zinc-700">
            <li>contact@4planet.system <span className="text-zinc-400">— placeholder</span></li>
            <li>partners@4planet.system <span className="text-zinc-400">— placeholder</span></li>
            <li>press@4planet.system <span className="text-zinc-400">— placeholder</span></li>
          </ul>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
            Illustrative prototype · all data shown is for design purposes
          </p>
        </div>
        <div className="col-span-12 flex flex-col items-start justify-between gap-2 border-t border-black/[0.08] pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 md:flex-row">
          <span>© 4PLANET / P4NTHER collective · Oslo</span>
          <span>Designed and built by P4NTHER · in development</span>
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   APP ROOT
   ============================================================ */
export default function App() {
  useFonts();
  const [activeWorld, setActiveWorld] = useState(null);
  const [activeProject, setActiveProject] = useState(null);

  return (
    <div className="min-h-screen bg-white text-black antialiased">
      <Header />
      <main>
        <Hero />
        <Pathways />
        <ImpactActions onEnterProject={setActiveProject} />
        <Worlds onEnterWorld={setActiveWorld} />
        <Membership />
        <Partners />
        <PlanetarySignals onEnterProject={setActiveProject} />
        <About />
        <FinalCTA />
      </main>
      <Footer />

      <WorldDrawer
        worldId={activeWorld}
        onClose={() => setActiveWorld(null)}
        onEnterProject={(d) => { setActiveWorld(null); setActiveProject(d); }}
      />
      <ProjectImmersive
        data={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </div>
  );
}
