<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevAgency — Превращаем идеи в продукты</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#06060a;--bg2:#0c0c14;--bg3:#12121e;
  --border:#1e1e30;--border2:#2a2a42;
  --cyan:#00d4ff;--cyan2:#00a8cc;
  --violet:#7c3aed;--violet2:#5b21b6;
  --text:#eeeeff;--muted:#6b7a99;--muted2:#3a3a5c;
  --green:#00ff88;--amber:#ffb300;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Outfit',sans-serif;font-weight:400;line-height:1.6;overflow-x:hidden}
#grid-canvas{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.35}

/* ══════════════════════════════════════════
   NAV — animated
══════════════════════════════════════════ */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  padding:0 5vw;height:68px;
  display:flex;align-items:center;justify-content:space-between;
  transition:all .4s;
}
nav::after{
  content:'';position:absolute;inset:0;bottom:0;top:auto;height:1px;
  background:linear-gradient(90deg,transparent,var(--border2),transparent);
  opacity:0;transition:opacity .4s;
}
nav.scrolled::after{opacity:1}
nav.scrolled{background:rgba(6,6,10,.85);backdrop-filter:blur(24px)}

.nav-logo{
  font-family:'Syne',sans-serif;font-weight:800;font-size:1.15rem;
  letter-spacing:-.03em;color:var(--text);text-decoration:none;
  display:flex;align-items:center;gap:10px;
}
.logo-mark{
  width:32px;height:32px;border-radius:8px;
  position:relative;overflow:hidden;
  background:linear-gradient(135deg,var(--cyan),var(--violet));
  display:flex;align-items:center;justify-content:center;
}
.logo-mark::before{
  content:'';position:absolute;inset:1px;border-radius:7px;
  background:var(--bg);
}
.logo-mark span{
  font-family:'DM Mono',monospace;font-size:.65rem;font-weight:500;
  color:var(--cyan);position:relative;z-index:1;
}
.nav-links{display:flex;gap:2.5rem;list-style:none}
.nav-links a{
  color:var(--muted);font-size:.85rem;text-decoration:none;
  position:relative;letter-spacing:.02em;transition:color .25s;
  padding:.25rem 0;
}
.nav-links a::after{
  content:'';position:absolute;bottom:-2px;left:0;right:100%;
  height:1px;background:var(--cyan);transition:right .3s;
}
.nav-links a:hover{color:var(--text)}
.nav-links a:hover::after{right:0}
.nav-ctas{display:flex;gap:.75rem;align-items:center}

/* ── BORDER-TRACE BUTTON (the magic effect) ── */
.btn-trace{
  position:relative;padding:.5rem 1.25rem;
  font-family:'Outfit',sans-serif;font-size:.85rem;font-weight:500;
  color:var(--muted);text-decoration:none;cursor:pointer;
  border-radius:8px;transition:color .25s;display:inline-flex;align-items:center;gap:.4rem;
  background:transparent;border:none;
  isolation:isolate;
}
.btn-trace::before{
  content:'';position:absolute;inset:0;border-radius:8px;padding:1px;
  background:conic-gradient(from var(--angle,0deg),transparent 0deg,var(--cyan) 60deg,var(--violet) 120deg,transparent 180deg,transparent 360deg);
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  opacity:0;transition:opacity .3s;
}
.btn-trace::after{
  content:'';position:absolute;inset:0;border-radius:8px;
  border:1px solid var(--border2);transition:border-color .3s;
}
.btn-trace:hover{color:var(--text)}
.btn-trace:hover::before{opacity:1;animation:trace-spin 2s linear infinite}
.btn-trace:hover::after{border-color:transparent}
@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes trace-spin{to{--angle:360deg}}

/* ── GLOWING PRIMARY BUTTON ── */
.btn-glow{
  position:relative;padding:.55rem 1.35rem;
  font-family:'Outfit',sans-serif;font-size:.85rem;font-weight:600;
  color:#06060a;text-decoration:none;cursor:pointer;
  border-radius:8px;border:none;
  background:var(--cyan);
  display:inline-flex;align-items:center;gap:.4rem;
  overflow:hidden;isolation:isolate;
  transition:color .2s,box-shadow .3s,transform .2s;
  box-shadow:0 0 20px rgba(0,212,255,.2);
}
.btn-glow::before{
  content:'';position:absolute;
  top:-50%;left:-60%;
  width:40%;height:200%;
  background:rgba(255,255,255,.35);
  transform:skewX(-20deg);
  transition:left .5s;
}
.btn-glow:hover::before{left:120%}
.btn-glow:hover{
  box-shadow:0 0 40px rgba(0,212,255,.45),0 0 80px rgba(0,212,255,.15);
  transform:translateY(-1px);
}
.btn-lg{padding:.75rem 1.75rem!important;font-size:1rem!important}

/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */
section{position:relative;z-index:1}
.container{max-width:1180px;margin:0 auto;padding:0 5vw}
.hero{min-height:100vh;display:flex;align-items:center;padding-top:68px}
.hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;width:100%}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:.5rem;
  font-family:'DM Mono',monospace;font-size:.72rem;
  color:var(--cyan);letter-spacing:.12em;text-transform:uppercase;
  margin-bottom:1.5rem;padding:.3rem .75rem;
  border:1px solid rgba(0,212,255,.2);border-radius:4px;
  background:rgba(0,212,255,.04);
}
.eyebrow-dot{width:5px;height:5px;border-radius:50%;background:var(--cyan);animation:pdot 1.8s infinite}
@keyframes pdot{0%,100%{opacity:1}50%{opacity:.3}}
h1{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(2.4rem,4.8vw,3.8rem);line-height:1.04;
  letter-spacing:-.04em;margin-bottom:1.5rem;
}
.gradient-text{
  background:linear-gradient(100deg,var(--cyan) 0%,#6ee7f7 40%,var(--violet) 80%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.hero-sub{font-size:1.05rem;color:var(--muted);line-height:1.75;max-width:460px;margin-bottom:2.5rem;font-weight:300}
.hero-ctas{display:flex;gap:.875rem;flex-wrap:wrap}
.hero-stats{
  display:flex;gap:2.5rem;margin-top:3rem;padding-top:2rem;
  border-top:1px solid var(--border);
}
.stat-num{font-family:'Syne',sans-serif;font-weight:800;font-size:1.9rem;line-height:1;color:var(--text)}
.stat-num em{font-style:normal;color:var(--cyan)}
.stat-label{font-size:.78rem;color:var(--muted);margin-top:.2rem;letter-spacing:.02em}

/* Terminal */
.hero-visual{position:relative}
.terminal{
  background:var(--bg2);border:1px solid var(--border);border-radius:14px;
  overflow:hidden;
  box-shadow:0 0 100px rgba(0,212,255,.06),0 40px 80px rgba(0,0,0,.6);
  font-family:'DM Mono',monospace;font-size:.78rem;
}
.terminal-bar{
  background:var(--bg3);padding:.65rem 1.1rem;
  display:flex;align-items:center;gap:.5rem;
  border-bottom:1px solid var(--border);
}
.td{width:10px;height:10px;border-radius:50%}
.terminal-file{
  margin-left:.5rem;color:var(--muted);font-size:.7rem;
  display:flex;align-items:center;gap:.4rem;
}
.terminal-body{padding:1.25rem 1.5rem;line-height:2}
.t-c{color:var(--cyan)}.t-g{color:var(--green)}.t-v{color:#a78bfa}.t-a{color:var(--amber)}.t-m{color:var(--muted)}
.t-cursor{display:inline-block;width:2px;height:.85em;background:var(--cyan);margin-left:2px;animation:blink .9s infinite;vertical-align:text-bottom}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.t-tag{
  display:inline-block;font-size:.62rem;padding:.1rem .4rem;border-radius:3px;
  background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.15);
  color:var(--cyan);letter-spacing:.06em;vertical-align:middle;margin-left:.3rem;
}
.terminal-status{
  border-top:1px solid var(--border);padding:.75rem 1.5rem;
  display:flex;align-items:center;gap:.75rem;
  background:rgba(0,255,136,.03);
}
.status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pdot 2s infinite;box-shadow:0 0 8px var(--green)}
.status-text{font-size:.72rem;color:var(--green);letter-spacing:.04em}

/* Floating badge */
.float-badge{
  position:absolute;right:-20px;top:-20px;
  background:var(--bg2);border:1px solid rgba(124,58,237,.35);
  border-radius:10px;padding:.65rem 1rem;font-size:.72rem;
  color:#c4b5fd;font-family:'DM Mono',monospace;
  box-shadow:0 0 40px rgba(124,58,237,.2);
  animation:float 4s ease-in-out infinite;
}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* ══════════════════════════════════════════
   CLIENTS TICKER
══════════════════════════════════════════ */
.clients-section{
  padding:3.5rem 0;
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  overflow:hidden;
}
.clients-label{
  text-align:center;font-family:'DM Mono',monospace;font-size:.68rem;
  color:var(--muted2);letter-spacing:.12em;text-transform:uppercase;
  margin-bottom:2rem;
}
.ticker-row{overflow:hidden;margin-bottom:.75rem}
.ticker-row:last-child{margin-bottom:0}
.ticker-inner{
  display:flex;gap:2rem;align-items:center;
  white-space:nowrap;width:max-content;
}
.ticker-row:nth-child(2) .ticker-inner{animation:tick-left 22s linear infinite}
.ticker-row:nth-child(3) .ticker-inner{animation:tick-right 28s linear infinite}
@keyframes tick-left{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes tick-right{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
.client-chip{
  display:inline-flex;align-items:center;gap:.6rem;
  padding:.45rem 1rem;border-radius:6px;
  border:1px solid var(--border);background:var(--bg2);
  color:var(--muted);font-size:.8rem;font-family:'Outfit',sans-serif;
  flex-shrink:0;transition:all .3s;cursor:default;
  white-space:nowrap;
}
.client-chip-dot{
  width:6px;height:6px;border-radius:50%;
  flex-shrink:0;
}
.ticker-row:nth-child(2) .client-chip-dot{background:var(--cyan)}
.ticker-row:nth-child(3) .client-chip-dot{background:var(--violet)}

/* ══════════════════════════════════════════
   SECTIONS SHARED
══════════════════════════════════════════ */
.section-tag{
  font-family:'DM Mono',monospace;font-size:.68rem;
  color:var(--cyan);letter-spacing:.15em;text-transform:uppercase;
  margin-bottom:.875rem;display:block;
}
h2{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(1.7rem,3.2vw,2.6rem);letter-spacing:-.04em;
  line-height:1.1;margin-bottom:1rem;
}
.section-sub{color:var(--muted);font-size:.95rem;line-height:1.75;font-weight:300}

/* ══════════════════════════════════════════
   PAIN
══════════════════════════════════════════ */
.pain{padding:7rem 0}
.pain-grid{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center}
.pain-cards{display:flex;flex-direction:column;gap:.875rem}
.pain-card{
  background:var(--bg2);border:1px solid var(--border);
  border-radius:10px;padding:1.25rem 1.5rem;
  display:flex;gap:1rem;align-items:flex-start;
  transition:transform .3s,border-color .3s,box-shadow .3s;
  position:relative;overflow:hidden;cursor:default;
}
.pain-card::before{
  content:'';position:absolute;left:0;top:0;bottom:0;
  width:3px;background:var(--border2);border-radius:0 2px 2px 0;
  transition:background .3s,box-shadow .3s;
}
.pain-card:hover{transform:translateX(6px);border-color:var(--border2);box-shadow:0 8px 40px rgba(0,0,0,.3)}
.pain-card:hover::before{background:var(--cyan);box-shadow:0 0 12px var(--cyan)}
.pain-icon{
  width:38px;height:38px;border-radius:8px;
  background:var(--bg3);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  font-size:1.1rem;flex-shrink:0;transition:border-color .3s;
}
.pain-card:hover .pain-icon{border-color:rgba(0,212,255,.25)}
.pain-title{font-weight:500;margin-bottom:.25rem;font-size:.92rem}
.pain-desc{color:var(--muted);font-size:.82rem;line-height:1.6}

/* ══════════════════════════════════════════
   HOW
══════════════════════════════════════════ */
.how{
  padding:7rem 0;
  background:linear-gradient(180deg,transparent,rgba(0,212,255,.018) 50%,transparent);
}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:4rem;position:relative}
.steps-line{
  position:absolute;top:27px;
  left:calc(12.5% + 27px);right:calc(12.5% + 27px);
  height:1px;overflow:hidden;
}
.steps-line-fill{
  height:100%;
  background:linear-gradient(90deg,var(--cyan),var(--violet));
  opacity:.3;
  animation:line-grow 1.5s ease-out forwards;transform-origin:left;transform:scaleX(0);
}
@keyframes line-grow{to{transform:scaleX(1)}}
.step{text-align:center;padding:0 1.25rem}
.step-num{
  width:54px;height:54px;border-radius:50%;
  background:var(--bg2);border:1px solid var(--border2);
  font-family:'Syne',sans-serif;font-weight:800;font-size:.95rem;
  color:var(--cyan);display:flex;align-items:center;justify-content:center;
  margin:0 auto 1.25rem;position:relative;z-index:1;
  transition:all .4s;
}
.step:hover .step-num{
  background:rgba(0,212,255,.08);border-color:var(--cyan);
  box-shadow:0 0 28px rgba(0,212,255,.25);transform:scale(1.08);
}
.step-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.9rem;margin-bottom:.5rem}
.step-desc{color:var(--muted);font-size:.8rem;line-height:1.65}
.step-badge{
  display:inline-block;margin-top:.625rem;
  font-family:'DM Mono',monospace;font-size:.62rem;
  color:var(--violet);letter-spacing:.04em;
  padding:.2rem .5rem;background:rgba(124,58,237,.08);
  border:1px solid rgba(124,58,237,.18);border-radius:3px;
}

/* ══════════════════════════════════════════
   SERVICES
══════════════════════════════════════════ */
.services{padding:7rem 0}
.services-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:1px;background:var(--border);
  border:1px solid var(--border);border-radius:14px;
  overflow:hidden;margin-top:4rem;
}
.svc{
  background:var(--bg);padding:2rem;
  transition:background .3s;cursor:default;
  position:relative;overflow:hidden;
}
.svc::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(0,212,255,.04),transparent 60%);
  opacity:0;transition:opacity .35s;
}
.svc:hover{background:var(--bg2)}
.svc:hover::after{opacity:1}
.svc-icon{
  width:42px;height:42px;border-radius:9px;
  background:var(--bg3);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  font-size:1.2rem;margin-bottom:.875rem;transition:border-color .3s;
}
.svc:hover .svc-icon{border-color:rgba(0,212,255,.25)}
.svc-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.95rem;margin-bottom:.35rem}
.svc-desc{color:var(--muted);font-size:.8rem;line-height:1.6}

/* ══════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════ */
.testimonials{
  padding:7rem 0;
  border-top:1px solid var(--border);
}
.testi-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:1.25rem;margin-top:4rem;
}
.testi-card{
  background:var(--bg2);border:1px solid var(--border);
  border-radius:14px;padding:1.75rem;
  position:relative;overflow:hidden;
  transition:transform .35s,border-color .35s,box-shadow .35s;
  cursor:default;
}
.testi-card::before{
  content:'';position:absolute;inset:0;border-radius:14px;padding:1px;
  background:linear-gradient(135deg,rgba(0,212,255,.15),transparent 50%,rgba(124,58,237,.1));
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  opacity:0;transition:opacity .35s;
}
.testi-card:hover{transform:translateY(-6px);border-color:var(--border2);box-shadow:0 20px 60px rgba(0,0,0,.4)}
.testi-card:hover::before{opacity:1}
.testi-quote{
  font-size:2.5rem;line-height:1;color:var(--cyan);
  opacity:.2;font-family:'Georgia',serif;margin-bottom:-.5rem;
}
.testi-text{
  color:var(--text);font-size:.875rem;line-height:1.75;
  margin-bottom:1.25rem;font-weight:300;
}
.testi-stars{
  display:flex;gap:.2rem;margin-bottom:1rem;
}
.star{
  width:14px;height:14px;
  background:var(--amber);
  clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
}
.testi-author{display:flex;align-items:center;gap:.75rem}
.testi-avatar{
  width:40px;height:40px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:'Syne',sans-serif;font-weight:800;font-size:.85rem;
  flex-shrink:0;border:2px solid var(--border2);
}
.testi-name{font-weight:500;font-size:.875rem}
.testi-role{font-size:.76rem;color:var(--muted)}
/* Featured card (center) */
.testi-card.featured{
  border-color:rgba(0,212,255,.15);
  background:linear-gradient(135deg,rgba(0,212,255,.04),rgba(124,58,237,.04));
}

/* ══════════════════════════════════════════
   MANAGERS
══════════════════════════════════════════ */
.managers{
  padding:7rem 0;
  border-top:1px solid var(--border);
  background:linear-gradient(135deg,rgba(124,58,237,.03),rgba(0,212,255,.02));
}
.managers-inner{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center}
.commission-card{
  background:var(--bg2);border:1px solid var(--border);
  border-radius:14px;padding:2.5rem;
  box-shadow:0 0 80px rgba(124,58,237,.07);
  position:relative;overflow:hidden;
}
.commission-card::before{
  content:'';position:absolute;top:-60px;right:-60px;
  width:200px;height:200px;border-radius:50%;
  background:radial-gradient(circle,rgba(124,58,237,.12),transparent 70%);
}
.comm-num{
  font-family:'Syne',sans-serif;font-weight:800;font-size:4.5rem;line-height:1;
  background:linear-gradient(135deg,var(--cyan),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:.2rem;
}
.comm-label{color:var(--muted);font-size:.875rem;margin-bottom:2rem}
.comm-items{display:flex;flex-direction:column;gap:.7rem}
.comm-item{
  display:flex;align-items:center;gap:.75rem;
  color:var(--muted);font-size:.85rem;
}
.comm-dot{
  width:6px;height:6px;border-radius:50%;flex-shrink:0;
  background:var(--cyan);box-shadow:0 0 8px var(--cyan);
}
.flow-steps{display:flex;flex-direction:column;gap:.875rem;margin-top:2.5rem}
.fstep{
  display:flex;gap:1rem;align-items:flex-start;
  padding:1rem 1.25rem;border-radius:10px;
  border:1px solid var(--border);background:var(--bg2);
  transition:border-color .25s,transform .25s;
}
.fstep:hover{border-color:var(--border2);transform:translateX(4px)}
.fstep-n{
  font-family:'DM Mono',monospace;font-size:.68rem;
  color:var(--cyan);background:rgba(0,212,255,.07);
  border:1px solid rgba(0,212,255,.14);
  border-radius:4px;padding:.2rem .5rem;flex-shrink:0;margin-top:.1rem;
}
.fstep-t{font-size:.875rem;font-weight:500;margin-bottom:.1rem}
.fstep-d{color:var(--muted);font-size:.78rem}

/* ══════════════════════════════════════════
   CTA FINAL
══════════════════════════════════════════ */
.cta-final{
  padding:9rem 0;text-align:center;position:relative;overflow:hidden;
}
.cta-glow{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:700px;height:400px;
  background:radial-gradient(ellipse,rgba(0,212,255,.07) 0%,transparent 70%);
  pointer-events:none;
}
.cta-final h2{font-size:clamp(2rem,4vw,3.5rem);margin-bottom:1rem}
.cta-final p{color:var(--muted);margin-bottom:2.5rem;font-size:1.05rem;font-weight:300}
.cta-btns{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap}

/* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
footer{
  border-top:1px solid var(--border);padding:2rem 5vw;
  display:flex;align-items:center;justify-content:space-between;
  position:relative;z-index:1;
}
footer p{color:var(--muted2);font-size:.78rem;font-family:'DM Mono',monospace}
footer a{color:var(--muted2);text-decoration:none;transition:color .2s}
footer a:hover{color:var(--muted)}

/* ══════════════════════════════════════════
   REVEAL
══════════════════════════════════════════ */
.reveal{opacity:0;transform:translateY(20px);transition:opacity .65s,transform .65s}
.reveal.visible{opacity:1;transform:none}
.d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media(max-width:900px){
  .hero-inner,.pain-grid,.managers-inner{grid-template-columns:1fr}
  .steps{grid-template-columns:repeat(2,1fr);gap:2rem}
  .steps-line{display:none}
  .services-grid,.testi-grid{grid-template-columns:1fr}
  .hero-stats{gap:1.5rem;flex-wrap:wrap}
  .float-badge{display:none}
  nav .nav-links{display:none}
}
@media(max-width:600px){h1{font-size:2.1rem}.services-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<canvas id="grid-canvas"></canvas>

<!-- ══ NAV ══ -->
<nav id="nav">
  <a class="nav-logo" href="#">
    <div class="logo-mark"><span>DA</span></div>
    DevAgency
  </a>
  <ul class="nav-links">
    <li><a href="#pain">Проблема</a></li>
    <li><a href="#how">Процесс</a></li>
    <li><a href="#services">Услуги</a></li>
    <li><a href="#managers">Партнёрам</a></li>
    <li><a href="#reviews">Отзывы</a></li>
  </ul>
  <div class="nav-ctas">
    <a href="/register?role=manager" class="btn-trace">Стать партнёром</a>
    <a href="/register?role=client" class="btn-glow">
      Обсудить проект
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
  </div>
</nav>

<!-- ══ HERO ══ -->
<section class="hero">
  <div class="container">
    <div class="hero-inner">
      <div>
        <div class="hero-eyebrow reveal"><span class="eyebrow-dot"></span>AI-powered development</div>
        <h1 class="reveal d1">
          Идея → работающий<br>
          <span class="gradient-text">продукт за недели</span>
        </h1>
        <p class="hero-sub reveal d2">
          Опишите задачу голосом или текстом. Искусственный интеллект 
          структурирует запрос, вы получаете чёткое предложение — 
          без встреч, без лишних слов.
        </p>
        <div class="hero-ctas reveal d3">
          <a href="/register?role=client" class="btn-glow btn-lg">Оставить заявку</a>
          <a href="#how" class="btn-trace btn-lg">Как это работает</a>
        </div>
        <div class="hero-stats reveal d3">
          <div><div class="stat-num"><em id="c1">0</em>+</div><div class="stat-label">Проектов запущено</div></div>
          <div><div class="stat-num"><em id="c2">0</em>%</div><div class="stat-label">Возвращаются снова</div></div>
          <div><div class="stat-num"><em id="c3">0</em>ч</div><div class="stat-label">Среднее время ответа</div></div>
        </div>
      </div>

      <div class="hero-visual reveal d2">
        <div class="float-badge">✦ AI обрабатывает за ~1.5s</div>
        <div class="terminal">
          <div class="terminal-bar">
            <div class="td" style="background:#ff5f57"></div>
            <div class="td" style="background:#febc2e"></div>
            <div class="td" style="background:#28c840"></div>
            <div class="terminal-file">
              <span style="color:var(--border2)">●</span>
              brief-analyzer
              <span class="t-tag">live</span>
            </div>
          </div>
          <div class="terminal-body">
            <div><span class="t-m">// Клиент: "Хочу систему учёта заказов..."</span></div>
            <div style="margin-top:.3rem"><span class="t-m">// Голосовое → текст → анализ боли</span></div>
            <div style="margin-top:.75rem">
              <span class="t-c">БОЛЬ</span> &nbsp;&nbsp;<span class="t-m">→</span> <span style="color:var(--text)">"Теряем 30% заявок в мессенджерах"</span>
            </div>
            <div>
              <span class="t-c">СЕЙЧАС</span> <span class="t-m">→</span> <span style="color:var(--text)">"Excel + WhatsApp + Post-it"</span>
            </div>
            <div>
              <span class="t-c">ЦЕЛЬ</span> &nbsp;&nbsp;<span class="t-m">→</span> <span style="color:var(--text)">"Единый дашборд + авто-уведомления"</span>
            </div>
            <div style="margin-top:.75rem">
              <span class="t-v">ФУНКЦИИ</span> <span class="t-m">→</span>
            </div>
            <div style="padding-left:1rem">
              <span class="t-g">✓</span> <span class="t-m">Приём заявок с сайта</span>
            </div>
            <div style="padding-left:1rem">
              <span class="t-g">✓</span> <span class="t-m">Статусы и история клиента</span>
            </div>
            <div style="padding-left:1rem">
              <span class="t-g">✓</span> <span class="t-m">Уведомления менеджерам</span>
            </div>
            <div style="margin-top:.75rem">
              <span class="t-a">КП готово за 2 часа</span> <span class="t-cursor"></span>
            </div>
          </div>
          <div class="terminal-status">
            <div class="status-dot"></div>
            <span class="status-text">Заявка структурирована · отправлено КП · ожидаем подтверждения</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ CLIENTS TICKER ══ -->
<div class="clients-section">
  <p class="clients-label">Нам доверяют</p>
  <div class="ticker-row">
    <div class="ticker-inner">
      <span class="client-chip"><span class="client-chip-dot"></span>Автосервис «Премиум»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Логистика Плюс</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Медклиника «Здоровье»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>СтройГрупп</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Ресторан «Мята»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>FinanceHub</span>
      <span class="client-chip"><span class="client-chip-dot"></span>RetailPro</span>
      <span class="client-chip"><span class="client-chip-dot"></span>EventMasters</span>
      <span class="client-chip"><span class="client-chip-dot"></span>ЮрБюро «Закон»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Автосервис «Премиум»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Логистика Плюс</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Медклиника «Здоровье»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>СтройГрупп</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Ресторан «Мята»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>FinanceHub</span>
      <span class="client-chip"><span class="client-chip-dot"></span>RetailPro</span>
      <span class="client-chip"><span class="client-chip-dot"></span>EventMasters</span>
      <span class="client-chip"><span class="client-chip-dot"></span>ЮрБюро «Закон»</span>
    </div>
  </div>
  <div class="ticker-row">
    <div class="ticker-inner">
      <span class="client-chip"><span class="client-chip-dot"></span>TechStartup Москва</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Агентство «Связь»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>EduPlatform</span>
      <span class="client-chip"><span class="client-chip-dot"></span>HR Solutions</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Доставка «Быстро»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>InvestGroup</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Фитнес-клуб «Форс»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>MediaHouse</span>
      <span class="client-chip"><span class="client-chip-dot"></span>PropTech RU</span>
      <span class="client-chip"><span class="client-chip-dot"></span>TechStartup Москва</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Агентство «Связь»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>EduPlatform</span>
      <span class="client-chip"><span class="client-chip-dot"></span>HR Solutions</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Доставка «Быстро»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>InvestGroup</span>
      <span class="client-chip"><span class="client-chip-dot"></span>Фитнес-клуб «Форс»</span>
      <span class="client-chip"><span class="client-chip-dot"></span>MediaHouse</span>
      <span class="client-chip"><span class="client-chip-dot"></span>PropTech RU</span>
    </div>
  </div>
</div>

<!-- ══ PAIN ══ -->
<section class="pain" id="pain">
  <div class="container">
    <div class="pain-grid">
      <div>
        <span class="section-tag reveal">// проблема</span>
        <h2 class="reveal">Узнаёте<br>себя?</h2>
        <p class="section-sub reveal" style="max-width:380px">Большинство бизнесов теряют деньги на ручных процессах — хотя цифровое решение готово за недели.</p>
      </div>
      <div class="pain-cards">
        <div class="pain-card reveal">
          <div class="pain-icon">⏱</div>
          <div>
            <div class="pain-title">Ручные процессы съедают время</div>
            <div class="pain-desc">Сотрудники делают вручную то, что автоматизируется за неделю. Excel, мессенджеры, бесконечные звонки.</div>
          </div>
        </div>
        <div class="pain-card reveal d1">
          <div class="pain-icon">🗂</div>
          <div>
            <div class="pain-title">Нет единого центра управления</div>
            <div class="pain-desc">Клиенты в одном месте, задачи в другом, деньги в третьем. Каждый новый инструмент добавляет хаос.</div>
          </div>
        </div>
        <div class="pain-card reveal d2">
          <div class="pain-icon">👁</div>
          <div>
            <div class="pain-title">Нет контроля над процессами</div>
            <div class="pain-desc">Непонятно на каком этапе задача, кто ответственный, что сделано. Всё держится на памяти и звонках.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ HOW ══ -->
<section class="how" id="how">
  <div class="container">
    <div style="text-align:center;max-width:500px;margin:0 auto">
      <span class="section-tag reveal">// процесс</span>
      <h2 class="reveal">Как мы работаем</h2>
      <p class="section-sub reveal">От первого сообщения до запуска — прозрачно</p>
    </div>
    <div class="steps">
      <div class="steps-line"><div class="steps-line-fill" id="steps-line"></div></div>
      <div class="step reveal">
        <div class="step-num">01</div>
        <div class="step-title">Опишите задачу</div>
        <div class="step-desc">Текстом или голосовым. Мы принимаем любой формат — без подготовки и презентаций.</div>
      </div>
      <div class="step reveal d1">
        <div class="step-num">02</div>
        <div class="step-title">AI структурирует бриф</div>
        <div class="step-desc">Система автоматически выделяет боль, текущий процесс и желаемый результат.</div>
        <span class="step-badge">автоматически</span>
      </div>
      <div class="step reveal d2">
        <div class="step-num">03</div>
        <div class="step-title">Получаете КП</div>
        <div class="step-desc">Чёткое предложение с цифрами в течение 2 часов. Общение через встроенный чат.</div>
      </div>
      <div class="step reveal d3">
        <div class="step-num">04</div>
        <div class="step-title">Контролируете статус</div>
        <div class="step-desc">Дашборд с реальным прогрессом. Уведомления при каждом обновлении.</div>
      </div>
    </div>
  </div>
</section>

<!-- ══ SERVICES ══ -->
<section class="services" id="services">
  <div class="container">
    <div style="max-width:440px">
      <span class="section-tag reveal">// услуги</span>
      <h2 class="reveal">Что<br>разрабатываем</h2>
      <p class="section-sub reveal">Полный цикл от идеи до продакшна</p>
    </div>
    <div class="services-grid reveal">
      <div class="svc"><div class="svc-icon">⚡</div><div class="svc-title">Веб-приложения</div><div class="svc-desc">Дашборды, B2B платформы, личные кабинеты. Современный стек, быстрая загрузка.</div></div>
      <div class="svc"><div class="svc-icon">🤖</div><div class="svc-title">Боты и мессенджеры</div><div class="svc-desc">Автоматизация продаж, поддержки и уведомлений через Telegram, WhatsApp.</div></div>
      <div class="svc"><div class="svc-icon">⚙️</div><div class="svc-title">Автоматизация</div><div class="svc-desc">Убираем ручной труд. Интеграции между сервисами, скрипты, workflows.</div></div>
      <div class="svc"><div class="svc-icon">📊</div><div class="svc-title">CRM-системы</div><div class="svc-desc">Кастомные CRM под ваш процесс. Без лишних функций, только то что нужно.</div></div>
      <div class="svc"><div class="svc-icon">🔗</div><div class="svc-title">Интеграции</div><div class="svc-desc">Подключаем платёжки, ERP, маркетплейсы, аналитику и любые внешние API.</div></div>
      <div class="svc"><div class="svc-icon">🛠</div><div class="svc-title">Внутренние инструменты</div><div class="svc-desc">Учёт, отчёты, порталы для команды. Всё что упрощает работу изнутри.</div></div>
    </div>
  </div>
</section>

<!-- ══ TESTIMONIALS ══ -->
<section class="testimonials" id="reviews">
  <div class="container">
    <div style="text-align:center;max-width:480px;margin:0 auto">
      <span class="section-tag reveal">// отзывы</span>
      <h2 class="reveal">О нас говорят</h2>
      <p class="section-sub reveal">Клиенты которые уже автоматизировали бизнес</p>
    </div>
    <div class="testi-grid">
      <div class="testi-card reveal">
        <div class="testi-quote">"</div>
        <p class="testi-text">Запустили CRM для автосервиса за три недели. Раньше теряли до 20% заявок в мессенджерах — теперь всё в одном месте. Рекомендую без вопросов.</p>
        <div class="testi-stars">
          <div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div>
        </div>
        <div class="testi-author">
          <div class="testi-avatar" style="background:rgba(0,212,255,.1);color:var(--cyan);border-color:rgba(0,212,255,.2)">АМ</div>
          <div>
            <div class="testi-name">Алексей Морозов</div>
            <div class="testi-role">Владелец, Автосервис «Премиум»</div>
          </div>
        </div>
      </div>

      <div class="testi-card featured reveal d1">
        <div class="testi-quote">"</div>
        <p class="testi-text">Написал в голосовом что хочу — через два часа получил конкретное КП с цифрами. Ни один другой подрядчик так не работал. Проект сдали в срок.</p>
        <div class="testi-stars">
          <div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div>
        </div>
        <div class="testi-author">
          <div class="testi-avatar" style="background:rgba(124,58,237,.12);color:#a78bfa;border-color:rgba(124,58,237,.25)">НК</div>
          <div>
            <div class="testi-name">Наталья Козлова</div>
            <div class="testi-role">CEO, EduPlatform</div>
          </div>
        </div>
      </div>

      <div class="testi-card reveal d2">
        <div class="testi-quote">"</div>
        <p class="testi-text">Интегрировали систему заказов с телеграм-ботом и складским учётом. Команда вникла в бизнес за первый звонок, не пришлось объяснять дважды.</p>
        <div class="testi-stars">
          <div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div>
        </div>
        <div class="testi-author">
          <div class="testi-avatar" style="background:rgba(0,255,136,.08);color:var(--green);border-color:rgba(0,255,136,.15)">ДВ</div>
          <div>
            <div class="testi-name">Дмитрий Волков</div>
            <div class="testi-role">Директор, Логистика Плюс</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ MANAGERS ══ -->
<section class="managers" id="managers">
  <div class="container">
    <div class="managers-inner">
      <div>
        <span class="section-tag reveal">// партнёрская программа</span>
        <h2 class="reveal">Зарабатывайте<br>на рекомендациях</h2>
        <p class="section-sub reveal" style="margin-bottom:2rem">Знаете бизнесы которым нужна автоматизация? Приводите клиентов — получайте комиссию. Никакого найма и обязательств.</p>
        <div class="flow-steps reveal">
          <div class="fstep">
            <span class="fstep-n">01</span>
            <div><div class="fstep-t">Находите клиента</div><div class="fstep-d">Любым способом — нетворкинг, соцсети, знакомые</div></div>
          </div>
          <div class="fstep">
            <span class="fstep-n">02</span>
            <div><div class="fstep-t">Описываете задачу</div><div class="fstep-d">AI структурирует бриф — вам не нужно быть технарём</div></div>
          </div>
          <div class="fstep">
            <span class="fstep-n">03</span>
            <div><div class="fstep-t">Получаете 30%</div><div class="fstep-d">Комиссия в личном кабинете, Telegram-уведомления о статусах</div></div>
          </div>
        </div>
        <div style="margin-top:2rem" class="reveal">
          <a href="/register?role=manager" class="btn-glow btn-lg">Стать партнёром</a>
        </div>
      </div>

      <div class="commission-card reveal">
        <div class="comm-num">30%</div>
        <div class="comm-label">комиссия с каждого закрытого проекта</div>
        <div class="comm-items">
          <div class="comm-item"><span class="comm-dot"></span>Никакого найма и трудоустройства</div>
          <div class="comm-item"><span class="comm-dot"></span>Прозрачный баланс в реальном времени</div>
          <div class="comm-item"><span class="comm-dot"></span>Уведомления о статусах в Telegram</div>
          <div class="comm-item"><span class="comm-dot"></span>Резерв комиссии с момента подписания</div>
          <div class="comm-item"><span class="comm-dot"></span>AI-инструменты для работы с клиентом</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ CTA FINAL ══ -->
<section class="cta-final">
  <div class="cta-glow"></div>
  <div class="container" style="position:relative">
    <span class="section-tag reveal">// начать</span>
    <h2 class="reveal">Готовы обсудить<br>ваш проект?</h2>
    <p class="reveal">Опишите задачу — ответим в течение 2 часов</p>
    <div class="cta-btns reveal">
      <a href="/register?role=client" class="btn-glow btn-lg">
        Оставить заявку
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
      <a href="/register?role=manager" class="btn-trace btn-lg">Стать партнёром</a>
    </div>
  </div>
</section>

<!-- ══ FOOTER ══ -->
<footer>
  <p>© 2024 DevAgency</p>
  <p style="display:flex;gap:1.5rem">
    <a href="/login">Войти</a>
    <a href="/register">Регистрация</a>
  </p>
</footer>

<script>
/* ── GRID CANVAS ── */
const cv=document.getElementById('grid-canvas'),cx=cv.getContext('2d')
let W,H,dots=[],t=0
function resize(){
  W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;dots=[]
  for(let i=0;i<Math.ceil(W/64);i++)for(let j=0;j<Math.ceil(H/64);j++)
    dots.push({x:i*64,y:j*64,r:Math.random()*1.5+.4,ph:Math.random()*Math.PI*2})
}
resize();window.addEventListener('resize',resize)
function frame(){
  cx.clearRect(0,0,W,H)
  cx.strokeStyle='rgba(28,28,46,.55)';cx.lineWidth=.5
  for(let x=0;x<W;x+=64){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}
  for(let y=0;y<H;y+=64){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()}
  dots.forEach(d=>{
    const a=.15+Math.sin(t*.012+d.ph)*.12
    cx.beginPath();cx.arc(d.x,d.y,d.r,0,Math.PI*2)
    cx.fillStyle=`rgba(0,212,255,${a})`;cx.fill()
  })
  t++;requestAnimationFrame(frame)
}
frame()

/* ── NAV ── */
const nav=document.getElementById('nav')
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>30))

/* ── REVEAL ── */
const els=document.querySelectorAll('.reveal')
new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.1}).observe
const io=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.1})
els.forEach(e=>io.observe(e))

/* ── COUNTERS ── */
function count(el,to,dur=1800){
  let s=null
  function step(ts){
    if(!s)s=ts
    const p=Math.min((ts-s)/dur,1),ease=1-Math.pow(1-p,3)
    el.textContent=Math.round(ease*to)
    if(p<1)requestAnimationFrame(step);else el.textContent=to
  }
  requestAnimationFrame(step)
}
const sio=new IntersectionObserver(en=>{
  if(en[0].isIntersecting){
    count(document.getElementById('c1'),47)
    count(document.getElementById('c2'),94)
    count(document.getElementById('c3'),2)
    sio.disconnect()
  }
},{threshold:.5})
sio.observe(document.querySelector('.hero-stats'))

/* ── STEPS LINE TRIGGER ── */
const lineEl=document.getElementById('steps-line')
const lio=new IntersectionObserver(en=>{
  if(en[0].isIntersecting){lineEl.style.animation='line-grow 1.2s ease-out forwards';lio.disconnect()}
},{threshold:.3})
if(lineEl)lio.observe(lineEl.parentElement)

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault()
    const t=document.querySelector(a.getAttribute('href'))
    if(t)t.scrollIntoView({behavior:'smooth',block:'start'})
  })
})
</script>
</body>
</html>