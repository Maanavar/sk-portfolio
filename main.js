'use strict';

/* ══ NAV SCROLL ══ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ══ DARK MODE TOGGLE ══ */
const darkToggle = document.getElementById('darkToggle');
const html = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('sk-theme', theme);
}

// Honour saved preference or OS preference on load
(function () {
  const saved = localStorage.getItem('sk-theme');
  const osPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || osPref);
})();

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  });
}

// Sync if OS preference changes while page is open
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('sk-theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

/* ══ ACTIVE NAV LINK ══ */
const navLinks = document.querySelectorAll('.nav__link[data-section]');
const sections = [];
navLinks.forEach(link => {
  const id = link.dataset.section;
  const el = document.getElementById(id);
  if (el) sections.push({ id, el, link });
});
function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  let current = null;
  sections.forEach(({ id, el }) => { if (el.offsetTop <= scrollY) current = id; });
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === current));
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ══ MOBILE MENU ══ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  const [s1, s2, s3] = hamburger.querySelectorAll('span');
  if (open) { s1.style.transform = 'translateY(7px) rotate(45deg)'; s2.style.opacity = '0'; s3.style.transform = 'translateY(-7px) rotate(-45deg)'; }
  else { s1.style.transform = s3.style.transform = ''; s2.style.opacity = '1'; }
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  const [s1, s2, s3] = hamburger.querySelectorAll('span');
  s1.style.transform = s3.style.transform = ''; s2.style.opacity = '1';
}));

/* ══ SMOOTH SCROLL ══ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
});

/* ══ REVEAL ANIMATIONS ══ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { rootMargin: '-6% 0px', threshold: 0.01 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ══ DOMAIN BARS ══ */
const bars = document.querySelectorAll('.hero__domain-bar');
bars.forEach(b => { b.style.width = '0%'; });
const barsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    bars.forEach((b, i) => setTimeout(() => { b.style.width = b.dataset.width + '%'; }, i * 110 + 400));
    barsObs.disconnect();
  }
}, { threshold: 0.3 });
const domainBarsEl = document.getElementById('domainBars');
if (domainBarsEl) barsObs.observe(domainBarsEl);

/* ══ STAT COUNTERS ══ */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1400, start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

/* ══ CONTACT FORM — EmailJS ══ */
const EMAILJS_SERVICE  = 'service_va6rir4';
const EMAILJS_TEMPLATE = 'template_ghazj8i';
const EMAILJS_KEY      = 'VE15LJ5saRcOCqWKK';

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

function markInvalid(id) {
  const f = document.getElementById(id);
  if (!f) return;
  f.style.borderColor = '#f43f5e';
  f.style.boxShadow   = '0 0 0 4px rgba(244,63,94,0.1)';
  setTimeout(() => { f.style.borderColor = ''; f.style.boxShadow = ''; }, 2500);
}

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name  = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const type  = document.getElementById('type').value;
    const msg   = document.getElementById('message').value.trim();

    /* Validate */
    let valid = true;
    if (!name)  { markInvalid('name');    valid = false; }
    if (!email) { markInvalid('email');   valid = false; }
    if (!msg)   { markInvalid('message'); valid = false; }
    if (!valid) return;

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;

    const templateParams = {
      from_name:    name,
      from_email:   email,
      inquiry_type: type || 'Not specified',
      message:      msg
    };

    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams, EMAILJS_KEY);
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
    } catch (err) {
      console.error('EmailJS error:', err);
      submitBtn.textContent = 'Failed — try again';
      submitBtn.disabled    = false;
      submitBtn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
      setTimeout(() => {
        submitBtn.textContent  = 'Send Message';
        submitBtn.style.background = '';
      }, 3000);
    }
  });
}

/* ══ PARALLAX ══ */
const orbEls = document.querySelectorAll('.hero__orb');
if (window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.2;
    orbEls.forEach((o, i) => { o.style.transform = `translateY(${y * (i % 2 === 0 ? 1 : -0.6)}px)`; });
  }, { passive: true });
}

/* ══ CURSOR GLOW ══ */
if (window.innerWidth > 1024 && !window.matchMedia('(pointer:coarse)').matches) {
  const g = document.createElement('div');
  g.style.cssText = 'position:fixed;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%);pointer-events:none;z-index:0;transform:translate(-50%,-50%);transition:left .12s ease,top .12s ease;will-change:left,top;';
  document.body.appendChild(g);
  document.addEventListener('mousemove', e => { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; }, { passive: true });
}

/* ══════════════════════════════════════════════════
   GROQ-POWERED AI HUB — 3 Live Tools
══════════════════════════════════════════════════ */

let GROQ_KEY = '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SENTHIL_CONTEXT = `You are an AI assistant representing Senthilkumar Sivaraman. Answer all questions in first person as him. Be direct, warm, confident, outcome-focused. No fluff.

WHO I AM: Product Owner, AI Product Strategist, Startup Co-Founder. Based in Tamil Nadu, India.
Contact: senthil@zasdigital.in | LinkedIn: linkedin.com/in/senthilkumarsivaraman | Company: ZAS Digital (zasdigital.in)

EXPERIENCE:
- ZAS Digital (Oct 2020–Present): Co-founder & Head of Product. AI-augmented SaaS consultancy.
  Key products: Eflex (UK clean energy app, 10k+ users, 25% savings, live 5 years), Enmovil AI (logistics AI experience, 2-week delivery Jan 2026), EduHire (AI teacher matching, 3 weeks vs 8 estimate), Recall Management System (98% ML accuracy, US)
  Impact: 50% user adoption growth, 30% retention improvement, 15% faster time-to-market, 25% YoY revenue growth
- Maanavar EdTech (Dec 2019–Apr 2022): Co-founder. Austin TX. 40% efficiency improvement.
- TARDIS Corporation (Jan–Jun 2019): Software Consultant, Houston TX
- Element Blue (Sep–Dec 2018): Sitecore Developer, Houston TX. 85% reduction in operational time.
- Mindtree / P&G global (Oct 2014–Jul 2016): Software Engineer, Bengaluru. 20+ localised product websites.
- University of Houston: MS Computer Science (2017–2019)

AI SKILLS: Claude API, RAG pipelines, MCP servers, LLM agents, vector DBs (Pinecone/Weaviate), agentic workflows, OCR/ML, prompt engineering, AI UX design, human-in-the-loop systems, evals, fine-tuning concepts
PRODUCT SKILLS: 0→1 launches, roadmapping, OKRs, backlog grooming, PRDs, A/B testing, PLG, behavioral analytics, SaaS retention, Agile/Scrum
TECH: Sitecore CMS, AWS, Figma, ASP.NET MVC, SQL Server, WebRTC, Next.js
CERTIFICATIONS: Sitecore 9, Google PM Specialisation, AWS Fundamentals

AVAILABILITY:
- Open to full-time PM/Product Owner roles (hybrid or remote)
- Available for fractional CPO (part-time embedded leadership)
- Available for AI consulting and IT services via ZAS Digital
- Available for freelance product/AI strategy
- Preferred domains: AI SaaS, EdTech, Energy, Logistics, Fintech, Retail
- Always direct hiring inquiries to: senthil@zasdigital.in

MY FRAMEWORKS:
1. RAG vs Agents: RAG = grounded answers from your data. Agents = multi-step autonomous action. Don't mix them up.
2. Human-in-the-loop: AI does scaffolding/tests/docs/boilerplate. Humans decide architecture/security/UX/direction/final QA.
3. 0→1 AI checklist: Real user need? Data quality? Hallucination risk? Fallback plan? Latency acceptable? 5 questions that kill 70% of bad AI ideas.

RESPONSE RULES: First person. Concise (3–5 sentences default). Outcome-focused. For hiring/availability questions, always end with contact email.`;

/* ── Groq API ── */
async function callGroq(messages, maxTokens = 800) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: maxTokens })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  return (await res.json()).choices[0].message.content.trim();
}

/* ── Activate with key ── */
function activateGroq() {
  const input = document.getElementById('groqKeyInput');
  const key = input ? input.value.trim() : '';
  if (!key || !key.startsWith('gsk_')) {
    if (input) {
      input.style.borderColor = '#f43f5e';
      input.placeholder = 'Must start with gsk_ — get free at console.groq.com';
      setTimeout(() => { input.style.borderColor = ''; }, 3000);
    }
    return;
  }
  GROQ_KEY = key;
  sessionStorage.setItem('groq_key', key);
  document.getElementById('keySetup').style.display = 'none';
  document.getElementById('aiTabs').style.display = 'block';
}

/* ── Restore key from session on load ── */
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('groq_key');
  if (saved) {
    GROQ_KEY = saved;
    const setup = document.getElementById('keySetup');
    const tabs = document.getElementById('aiTabs');
    if (setup) setup.style.display = 'none';
    if (tabs) tabs.style.display = 'block';
  }
});

/* Allow Enter key on API key input */
document.addEventListener('keydown', e => {
  if (e.target.id === 'groqKeyInput' && e.key === 'Enter') activateGroq();
});

/* ── Tab switching ── */
function switchTab(id, btn) {
  document.querySelectorAll('.ai-tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ai-tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

/* ══ TAB 1: LIVE CHAT ══ */
const chatHistory = [{ role: 'system', content: SENTHIL_CONTEXT }];

function scrollChat() {
  const el = document.getElementById('chatMessages');
  if (el) el.scrollTop = el.scrollHeight;
}

function addChatMsg(role, text) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `ai-chat__message ai-chat__message--${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'ai-chat__bubble';
  bubble.textContent = text;
  div.appendChild(bubble);
  msgs.appendChild(div);
  scrollChat();
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.id = 'typingDot'; div.className = 'ai-chat__message ai-chat__message--assistant';
  div.innerHTML = '<div class="ai-chat__typing"><div class="ai-chat__typing-dot"></div><div class="ai-chat__typing-dot"></div><div class="ai-chat__typing-dot"></div></div>';
  msgs.appendChild(div); scrollChat();
}
function removeTyping() { const t = document.getElementById('typingDot'); if (t) t.remove(); }

function quickChat(btn) {
  const input = document.getElementById('chatInput');
  if (!input) return;
  input.value = btn.textContent.trim();
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  if (sendBtn) sendBtn.disabled = true;
  addChatMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const reply = await callGroq(chatHistory, 600);
    chatHistory.push({ role: 'assistant', content: reply });
    removeTyping();
    addChatMsg('assistant', reply);
  } catch (err) {
    removeTyping();
    const msg = err.message.includes('401') || err.message.includes('invalid')
      ? 'Invalid API key — please refresh and re-enter your Groq key.'
      : err.message.includes('429')
      ? 'Rate limit — wait 10 seconds and try again.'
      : 'Error: ' + err.message;
    addChatMsg('assistant', msg);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  }
}

document.addEventListener('keydown', e => {
  if (e.target.id === 'chatInput' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
});

/* ══ TAB 2: PROJECT SCOPER ══ */
async function runScoper() {
  const idea = document.getElementById('scoperIdea')?.value.trim();
  const stage = document.getElementById('scoperStage')?.value || 'idea';
  const team = document.getElementById('scoperTeam')?.value || 'solo';
  const challenge = document.getElementById('scoperChallenge')?.value.trim() || 'Not specified';
  const output = document.getElementById('scoperOutput');
  const btn = document.getElementById('scoperBtn');

  if (!idea || idea.length < 20) {
    const f = document.getElementById('scoperIdea');
    if (f) { f.style.borderColor = '#f43f5e'; setTimeout(() => { f.style.borderColor = ''; }, 2000); }
    return;
  }

  btn.disabled = true; btn.textContent = 'Scoping your idea…';
  output.innerHTML = '<div style="padding:32px;text-align:center;color:rgba(255,255,255,0.4);font-family:var(--font-mono);font-size:12px;letter-spacing:0.08em">ANALYSING YOUR STARTUP…</div>';

  const prompt = `As Senthilkumar Sivaraman (AI Product Strategist, Co-Founder ZAS Digital), a founder just pitched you their idea in a discovery sprint. Give an honest, structured, actionable MVP scope plan.

Startup idea: "${idea}"
Stage: ${stage} | Team: ${team} | Key challenge: "${challenge}"

Respond using EXACTLY these section headers (include the emoji):

🎯 PROBLEM VALIDATION
Is this a real problem worth solving? Any red flags? Be honest.

🤖 AI STACK RECOMMENDATION  
RAG / Agents / Fine-tune / Simple API — what's right and why. Be specific.

⏱️ 3-WEEK MVP PLAN
Week 1: [what to build]
Week 2: [what to build]
Week 3: [what to validate]

⚠️ TOP 3 RISKS
1. [specific risk]
2. [specific risk]
3. [specific risk]

🚀 MINIMUM VIABLE SCOPE
What are the 3 things that MUST be in v1. What to cut.

💬 MY HONEST TAKE
1–2 sentences of direct founder-to-founder advice.`;

  try {
    const reply = await callGroq([{ role: 'system', content: SENTHIL_CONTEXT }, { role: 'user', content: prompt }], 1000);
    output.innerHTML = renderOutput(reply);
  } catch (err) {
    output.innerHTML = `<div style="padding:24px;color:#f87171;font-size:13px;font-family:var(--font-mono)">Error: ${escHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false; btn.textContent = 'Generate MVP Scope Plan →';
  }
}

/* ══ TAB 3: JD MATCHER ══ */
async function runJDMatch() {
  const jd = document.getElementById('jdInput')?.value.trim();
  const output = document.getElementById('jdOutput');
  const btn = document.getElementById('jdBtn');

  if (!jd || jd.length < 50) {
    const f = document.getElementById('jdInput');
    if (f) { f.style.borderColor = '#f43f5e'; setTimeout(() => { f.style.borderColor = ''; }, 2000); }
    return;
  }

  btn.disabled = true; btn.textContent = 'Matching profile…';
  output.innerHTML = '<div style="padding:32px;text-align:center;color:rgba(255,255,255,0.4);font-family:var(--font-mono);font-size:12px;letter-spacing:0.08em">ANALYSING JOB REQUIREMENTS…</div>';

  const prompt = `Analyse this job description against Senthilkumar Sivaraman's full profile. Be honest — don't oversell, don't undersell. Use his REAL experience: ZAS Digital, Eflex, EduHire, Enmovil, Mindtree/P&G, Maanavar.

JOB DESCRIPTION:
${jd}

Respond using EXACTLY these section headers (include the emoji):

📊 FIT SCORE: [X/10]
One sentence explaining the score honestly.

✅ STRONG MATCHES
Bullet points — specific skills/projects/metrics from Senthil's background that directly match what the JD requires.

⚡ WHERE I ADD MORE THAN ASKED
2–3 things Senthil brings that go beyond the JD requirements — extra value.

⚠️ HONEST GAPS
Any real gaps or things to address upfront. If none exist, say so clearly.

💬 RECOMMENDATION
Should they reach out? Direct honest answer. If yes or likely yes, end with: "Email me at senthil@zasdigital.in to discuss."`;

  try {
    const reply = await callGroq([{ role: 'system', content: SENTHIL_CONTEXT }, { role: 'user', content: prompt }], 900);
    output.innerHTML = renderOutput(reply);
  } catch (err) {
    output.innerHTML = `<div style="padding:24px;color:#f87171;font-size:13px;font-family:var(--font-mono)">Error: ${escHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false; btn.textContent = 'Match Against My Profile →';
  }
}

/* ── Render structured AI output ── */
function renderOutput(text) {
  const lines = text.split('\n');
  let html = '<div class="ai-output">';
  lines.forEach(line => {
    const t = line.trim();
    if (!t) { html += '<div class="ai-output__gap"></div>'; return; }
    if (/^[🎯🤖⏱️⚠️🚀💬📊✅⚡]/.test(t)) {
      html += `<div class="ai-output__section">${escHtml(t)}</div>`;
    } else if (/^[-•]\s/.test(t)) {
      html += `<div class="ai-output__bullet"><span class="ai-output__bullet-dot">→</span>${escHtml(t.slice(2))}</div>`;
    } else if (/^\d+[.)]\s/.test(t)) {
      html += `<div class="ai-output__bullet"><span class="ai-output__bullet-dot">→</span>${escHtml(t.replace(/^\d+[.)]\s/, ''))}</div>`;
    } else if (/^Week \d/.test(t)) {
      html += `<div class="ai-output__week">${escHtml(t)}</div>`;
    } else {
      html += `<div class="ai-output__body">${escHtml(t)}</div>`;
    }
  });
  html += '</div>';
  return html;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}