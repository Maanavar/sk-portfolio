'use strict';

const nav = document.getElementById('nav');
const html = document.documentElement;
const darkToggle = document.getElementById('darkToggle');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const themeColorMeta = document.getElementById('themeColorMeta');

function syncThemeColor(theme) {
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#0f1720' : '#f6f1e7');
  }
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('sk-theme', theme);
  syncThemeColor(theme);
}

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const nextTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  if (!localStorage.getItem('sk-theme')) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

window.addEventListener(
  'scroll',
  () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
  },
  { passive: true }
);

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const offset = nav ? nav.offsetHeight + 12 : 88;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});

const sectionLinks = document.querySelectorAll('.nav__link[data-section]');
const sections = Array.from(sectionLinks)
  .map(link => {
    const id = link.dataset.section;
    const element = document.getElementById(id);
    return element ? { id, element, link } : null;
  })
  .filter(Boolean);

function updateActiveNav() {
  const scrollPosition = window.scrollY + (nav ? nav.offsetHeight + 48 : 120);
  let activeId = '';

  sections.forEach(section => {
    if (section.element.offsetTop <= scrollPosition) {
      activeId = section.id;
    }
  });

  sectionLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === activeId);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroFlow = document.querySelector('.hero-flow');
if (heroFlow && !prefersReducedMotion) {
  window.setTimeout(() => heroFlow.classList.add('hero-flow--live'), 900);
}

// Cycling headline — rotates phrases every 3.4 s with a slide-fade crossfade
const cycleEl = document.getElementById('heroCycle');
const cyclePhrases = [
  'usable products people trust.',
  'AI systems that actually ship.',
  'products with real traction.',
  'RAG and agents that work.',
];
let cycleIdx = 0;

function cycleHeroPhrase() {
  if (!cycleEl) return;
  cycleEl.classList.add('is-exit');
  window.setTimeout(() => {
    cycleIdx = (cycleIdx + 1) % cyclePhrases.length;
    cycleEl.textContent = cyclePhrases[cycleIdx];
    cycleEl.classList.remove('is-exit');
    cycleEl.classList.add('is-enter');
    void cycleEl.offsetHeight; // force reflow so transition fires on next frame
    cycleEl.classList.remove('is-enter');
  }, 390);
}

if (cycleEl && !prefersReducedMotion) {
  window.setInterval(cycleHeroPhrase, 3400);
}

// Mouse parallax — shifts dot grid on hero hover for depth
const heroEl = document.querySelector('.hero');
if (heroEl && !prefersReducedMotion) {
  heroEl.addEventListener('mousemove', e => {
    const rect = heroEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3);
    const y = ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3);
    heroEl.style.setProperty('--mouse-x', x);
    heroEl.style.setProperty('--mouse-y', y);
  }, { passive: true });

  heroEl.addEventListener('mouseleave', () => {
    heroEl.style.setProperty('--mouse-x', '0');
    heroEl.style.setProperty('--mouse-y', '0');
  }, { passive: true });
}

function animateCount(element) {
  const target = Number(element.dataset.count || 0);
  const suffix = element.dataset.suffix || '';
  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-count]').forEach(element => statObserver.observe(element));

function openToolTab(id) {
  const tabs = document.getElementById('aiTabs');
  const setup = document.getElementById('keySetup');
  if (tabs && sessionStorage.getItem('groq_key')) {
    tabs.style.display = 'block';
    if (setup) setup.style.display = 'none';
  }

  const button = document.querySelector(`.ai-tab-btn[data-tab="${id}"]`);
  switchTab(id, button || null);
}

document.querySelectorAll('[data-open-tab]').forEach(element => {
  element.addEventListener('click', () => {
    const tabId = element.getAttribute('data-open-tab');
    if (tabId) {
      openToolTab(tabId);
    }
  });
});

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

function markInvalid(id) {
  const field = document.getElementById(id);
  if (!field) return;
  field.style.borderColor = '#d24b38';
  field.style.boxShadow = '0 0 0 4px rgba(210, 75, 56, 0.16)';
  setTimeout(() => {
    field.style.borderColor = '';
    field.style.boxShadow = '';
  }, 2400);
}

if (contactForm) {
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();

    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const type = document.getElementById('type')?.value || 'Not specified';
    const message = document.getElementById('message')?.value.trim() || '';

    let isValid = true;
    if (!name) {
      markInvalid('name');
      isValid = false;
    }
    if (!email) {
      markInvalid('email');
      isValid = false;
    }
    if (!message) {
      markInvalid('message');
      isValid = false;
    }
    if (!isValid) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending message...';
    }

    try {
      await emailjs.send(
        'service_va6rir4',
        'template_ghazj8i',
        {
          from_name: name,
          from_email: email,
          inquiry_type: type,
          message
        },
        'VE15LJ5saRcOCqWKK'
      );

      contactForm.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
    } catch (error) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Try again';
      }
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.textContent = 'Send message';
        }
      }, 2500);
      console.error('EmailJS error:', error);
    }
  });
}

let GROQ_KEY = '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SENTHIL_CONTEXT = `You are an AI assistant representing Senthilkumar Sivaraman.
Answer in first person as Senthil. Keep replies direct, clear, useful, and grounded in real product work.

PROFILE
- Technical Product Manager and AI Product Strategist with 10+ years in tech (first ~3 years as a software developer at Mindtree and freelancing; 7+ years in founder, product owner, and product management roles)
- Based in Tiruppur, Tamil Nadu, India — lived and worked in the US (Houston + Austin TX) from 2017 to 2022
- Founder of ZAS Digital (AI-accelerated software agency, founded 2019; Dinesh joined as co-founder in Oct 2020)
- Founder of Vinaadi AI (Tamil Vedic astrology platform, Apr 2026 to present)
- Co-Founder of EduHire (Tamil Nadu teacher-school recruitment platform, 2024 to present)
- Founded Maanavar (EdTech LMS for Indian schools and colleges, Dec 2019–Apr 2022, built while living in Austin TX)
- Background: SaaS, AI, EdTech, clean energy, logistics, e-commerce, supply chain, health tech, enterprise CMS, retail

CAREER TIMELINE
- ZAS Digital — Founder & Head of Product (founded 2019; Co-Founder from Oct 2020 when Dinesh joined): AI-accelerated software agency; led product strategy across energy, logistics, retail, EdTech, and compliance engagements
- Maanavar — Founder & Product Manager (Dec 2019 to Apr 2022): Built from Austin TX while living in the US; EdTech LMS for Indian schools and colleges; shelved post-COVID as institutions lost interest in online learning
- TARDIS Corporation — Research Consultant (Jan 2019 to Jun 2019), Houston TX: Developed structured R&D frameworks companies could follow when doing research and development — reducing wasted investment and ensuring proper methodology steps; helped multiple organisations reduce R&D risk
- Element Blue — Sitecore Consultant (Sept 2018 to Dec 2018), Houston TX: CMS automation and enterprise content management strategies; reduced manual CMS workload by 85%
- Freelancer — Software Developer (Sep 2016 to May 2017), Tiruppur: Built billing software for a printing agency; developed inventory management system for a small stationery shop; saved 200+ work hours for clients
- Mindtree on P&G account — Software Engineer (Oct 2014 to Jul 2016), Bengaluru: Sitecore CMS deployments and enterprise digital ecosystem work for Procter & Gamble (Fortune 500) across 20+ global markets; trained clients, reducing support dependency

CURRENT AND RECENT PROJECTS (important — include even though not yet on formal resume)
- Vinaadi AI (Founder, Apr 2026–present): Tamil-first Vedic astrology platform with full AI implementation; AI layer predicts astrological outcomes, creates daily and life plans, issues cautions for unfavorable periods, and provides actionable instructions; built using AI coding agents throughout; Swiss Ephemeris, Dasha and Gochar rules; bilingual Tamil/English
- EduHire (Co-Founder, 2024–present): Tamil Nadu teacher-school hiring platform; deterministic scoring engine (subject 40%, location 20%, board 20%, salary 10%, experience 10%); AI agents handle full HR recruitment process and help teachers create optimized resumes and cover letters; Next.js, Supabase, Anthropic Claude

SELECTED PROJECT DEPTH
- Eflex (2020–present): FLAGSHIP — clean energy mobile product; 3000+ active US users; average 25% energy savings; 35% user retention increase via AI-driven analytics and behavioral segmentation; five-year ongoing US client partnership; React Native, AWS; AI layer now delivering predictive energy insights and personalized recommendations
- Chennai Silks (ZAS Digital): E-commerce website revamp for a major Indian apparel brand — resulted in 10x increase in page views and 40% higher engagement; covered product catalog, UX flows, and checkout optimization
- Enmovil AI (2026): Logistics AI interactive experience for enterprise prospects; built using AI coding agents; shipped in 2 weeks vs 8-week agency estimate; scroll-driven with 17 interactive hotspots
- Recall Management System (2024): Compliance OCR and ML classification pipeline; 98% classification accuracy; review time reduced from days to minutes
- Harbour Vessel Management (ZAS Digital): Supply chain and vessel management system — operational workflows, tracking, and automation
- Texas Children's Hospital (Element Blue period): Sitecore CMS and patient portal implementation for a major US children's hospital — regulated content management and patient-facing portal in a healthcare environment
- Oliver Brown (ZAS Digital): Restaurant POS system
- Maanavar LMS: Social media-inspired UX for Indian students; gamification mechanics boosted participation by 30%; student engagement up 25%; Ed-Fi & SIS data integrations reduced data errors by 40%; onboarding automation cut setup time by 30%

QUANTIFIED ACHIEVEMENTS
- 15+ products delivered total across careers — 5+ are full SaaS platforms; the rest are small-scale client sites, builds, and tools — all with a 95%+ delivery success rate
- Eflex: 3000+ active US users, 25% average energy savings, 35% retention increase via AI analytics
- Chennai Silks: 10x page views and 40% engagement lift from website revamp
- ZAS Digital: 30% faster time-to-market; 25% engagement boost (Amplitude/Mixpanel optimisation); 30% churn reduction; 25% time-to-value improvement; 18% checkout completion increase; 40% overall conversions
- Payment integrations (Stripe, Razorpay, PayPal): PCI-DSS compliant; 20% transaction reliability improvement
- Maanavar: 25% student engagement increase, 30% participation lift via gamification, 40% data error reduction, 30% setup time reduction
- Element Blue: 85% manual CMS workload reduction
- Freelancer: 200+ work hours saved for clients; 70% data retrieval speed improvement; 15% operational cost reduction
- Mindtree/P&G: Sitecore CMS deployments across 20+ global markets for a Fortune 500 company

AI EXPERIENCE (in order of depth)
- Anthropic Claude: deepest experience — used in EduHire (HR agents, resume/cover letter generation agents), Vinaadi AI (interpretation layer), and multiple client projects
- OpenAI APIs: significant experience across multiple client AI feature integrations
- Groq (llama-3.3-70b): used in portfolio live tools and demos
- Broader AI work: RAG workflows, LLM agents, human-in-the-loop design, prompt engineering, AI coding agents as delivery method, matching engines and scoring systems

AI AND PRODUCT STRENGTHS
- AI product strategy: use-case discovery, deterministic-first vs AI-first architecture decisions
- RAG workflows, LLM agents, human-in-the-loop system design
- Matching engines and scoring systems (EduHire, Vinaadi)
- MVP scoping and PRD writing
- Product-led growth and retention
- Tool calling and workflow automation
- A/B testing and behavioral analytics (Amplitude, Mixpanel, Google Optimize, Hotjar)
- Gamification design and student engagement mechanics

DOMAIN EXPERTISE
- E-commerce and retail: Chennai Silks website revamp (10x page views, 40% engagement); e-commerce UX, catalog, checkout flows; retail product and brand clients
- Clean energy: 5-year Eflex engagement — consumer energy products, behavioral change, AI-driven personalisation, US market
- Supply chain and logistics: Harbour Vessel Management system; Enmovil AI logistics platform; operational workflows and tracking
- Health tech: Texas Children's Hospital (via Element Blue) — Sitecore CMS and patient portal implementation in a major US children's hospital; regulated healthcare content management
- Enterprise CMS and multi-market digital: Sitecore at Mindtree (P&G, 20+ global markets) and Element Blue; enterprise content architecture and workflow automation
- EdTech: Maanavar LMS (India-facing, built in Austin TX); EduHire teacher recruitment platform; Ed-Fi API, SIS integrations, FERPA, SCORM
- Payments and fintech-adjacent: Stripe, Razorpay, and PayPal integrations across multiple products; PCI-DSS compliance experience; payment flow design, transaction reliability, subscription billing, and checkout optimisation — not a pure fintech background but strong applied payment product experience
- Restaurant / hospitality: Oliver Brown POS system
- R&D methodology: TARDIS — structured R&D frameworks for reducing investment risk across organisations

CORE SKILLS
- Product strategy and execution: Roadmap Planning, PRD Writing, Market Research, Competitive Analysis, Go-to-Market (GTM) Strategy, Monetization and Pricing, OKRs, RICE Framework, Stakeholder Management, Cross-Functional Collaboration, Agile/Scrum, Sprint Planning, Backlog Grooming, Feature Prioritisation
- Analytics and growth: Amplitude, Mixpanel, Google Analytics, Hotjar, Optimizely, A/B Testing, Behavioural Analytics, Customer Journey Mapping, Product-Led Growth (PLG), Funnel Optimisation, KPI Tracking (DAU, WAU, NPS), Retention and Monetisation Strategies
- UX and adoption: UX Optimisation, Conversion Rate Optimisation, Onboarding Flow Design, Gamification, User Engagement Design
- EdTech-specific: LMS, SIS Integration, Ed-Fi API, Adaptive Learning, Gamification, FERPA, SCORM
- Technical fluency: REST APIs, OpenAI APIs, Anthropic Claude API, Stripe/Razorpay/PayPal integrations, PCI-DSS compliance, Workflow Automation, Performance Optimisation, API design

TOOLS
- Product and collaboration: Jira, Confluence, Trello, Figma, Miro
- Analytics: Amplitude, Mixpanel, Google Analytics, Optimizely, Hotjar, Google Optimize
- Development and infrastructure: Postman, GitHub, Bitbucket, AWS Code Pipeline, Azure, SendGrid, Visual Studio
- Tech stack: C#, ASP.NET Core, React Native, Angular, SQL Server, REST APIs, OpenAI APIs, JSON, Elasticsearch, Apache Kafka

EDUCATION
- University of Houston, Houston Texas — Graduate-Level Coursework in Computer Science (Aug 2017–Dec 2018)
- Anna University, Government College of Engineering Erode — Bachelor of Engineering in Computer Science Engineering (Aug 2010–May 2014)

CERTIFICATIONS (all active)
- Google Project Management
- Sitecore Experience Solution 9 Developer
- Microsoft .NET Certified Developer

WORK PREFERENCES AND FLEXIBILITY
- Fully open to working in any country — no geographic restrictions
- Comfortable with any work mode: fully remote, hybrid, or on-site
- Open to international assignments and relocation
- Lived and worked in the US for 5 years (2017–2022); currently based in Tiruppur, Tamil Nadu, India

AVAILABILITY AND CONTACT
- Open to full-time Technical Product Manager and AI Product Manager roles
- Open to fractional product leadership and AI consulting
- Email: me@senthilsivaraman.com
- Phone: +919600577410
- LinkedIn: linkedin.com/in/senthilkumarsivaraman
- Portfolio: senthilsivaraman.com

RESPONSE STYLE
- 3 to 6 sentences by default
- Honest and constructive — when mentioning gaps, always pair with adjacent strength, transferable skill, or clear ability to grow quickly. Never state a gap as a flat negative.
- Product-oriented, not buzzword-heavy
- For hiring or outreach topics, share me@senthilsivaraman.com and +919600577410`;

async function callGroq(messages, maxTokens = 900) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function activateGroq() {
  const input = document.getElementById('groqKeyInput');
  const key = input ? input.value.trim() : '';
  if (!key || !key.startsWith('gsk_')) {
    if (input) {
      input.style.borderColor = '#d24b38';
      input.placeholder = 'Use a Groq key that starts with gsk_';
      setTimeout(() => {
        input.style.borderColor = '';
      }, 2400);
    }
    return;
  }

  GROQ_KEY = key;
  sessionStorage.setItem('groq_key', key);
  const setup = document.getElementById('keySetup');
  const tabs = document.getElementById('aiTabs');
  if (setup) setup.style.display = 'none';
  if (tabs) tabs.style.display = 'block';
}

window.addEventListener('DOMContentLoaded', () => {
  const savedKey = sessionStorage.getItem('groq_key');
  if (savedKey) {
    GROQ_KEY = savedKey;
    const setup = document.getElementById('keySetup');
    const tabs = document.getElementById('aiTabs');
    if (setup) setup.style.display = 'none';
    if (tabs) tabs.style.display = 'block';
  }
});

document.addEventListener('keydown', event => {
  if (event.target.id === 'groqKeyInput' && event.key === 'Enter') {
    activateGroq();
  }
});

function switchTab(id, button) {
  document.querySelectorAll('.ai-tab-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.ai-tab-btn').forEach(tabButton => tabButton.classList.remove('active'));

  const panel = document.getElementById(`tab-${id}`);
  if (panel) panel.classList.add('active');
  if (button) button.classList.add('active');
}

const chatHistory = [{ role: 'system', content: SENTHIL_CONTEXT }];

function scrollChat() {
  const container = document.getElementById('chatMessages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function addChatMsg(role, text) {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;

  const wrapper = document.createElement('div');
  wrapper.className = `ai-chat__message ai-chat__message--${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'ai-chat__bubble';
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  scrollChat();
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'ai-chat__message ai-chat__message--assistant';
  wrapper.id = 'typingDot';
  wrapper.innerHTML = '<div class="ai-chat__typing"><div class="ai-chat__typing-dot"></div><div class="ai-chat__typing-dot"></div><div class="ai-chat__typing-dot"></div></div>';
  messages.appendChild(wrapper);
  scrollChat();
}

function removeTyping() {
  const element = document.getElementById('typingDot');
  if (element) element.remove();
}

function quickChat(button) {
  const input = document.getElementById('chatInput');
  if (!input) return;
  input.value = button.textContent.trim();
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const sendButton = document.getElementById('chatSend');
  if (!input) return;

  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = '';
  if (sendButton) sendButton.disabled = true;
  addChatMsg('user', prompt);
  chatHistory.push({ role: 'user', content: prompt });
  showTyping();

  try {
    const reply = await callGroq(chatHistory, 700);
    chatHistory.push({ role: 'assistant', content: reply });
    removeTyping();
    addChatMsg('assistant', reply);
  } catch (error) {
    removeTyping();
    const message = error.message.includes('401')
      ? 'That Groq key did not authenticate. Please refresh and try again.'
      : error.message.includes('429')
      ? 'Rate limit reached. Please wait a few seconds and try again.'
      : `Error: ${error.message}`;
    addChatMsg('assistant', message);
  } finally {
    if (sendButton) sendButton.disabled = false;
    input.focus();
  }
}

document.addEventListener('keydown', event => {
  if (event.target.id === 'chatInput' && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChat();
  }
});

async function runScoper() {
  const idea = document.getElementById('scoperIdea')?.value.trim();
  const stage = document.getElementById('scoperStage')?.value || 'idea';
  const team = document.getElementById('scoperTeam')?.value || 'solo';
  const challenge = document.getElementById('scoperChallenge')?.value.trim() || 'Not specified';
  const output = document.getElementById('scoperOutput');
  const button = document.getElementById('scoperBtn');

  if (!idea || idea.length < 20) {
    const field = document.getElementById('scoperIdea');
    if (field) {
      field.style.borderColor = '#d24b38';
      setTimeout(() => {
        field.style.borderColor = '';
      }, 2200);
    }
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Scoping your MVP...';
  }
  if (output) {
    output.innerHTML = '<div class="ai-output"><div class="ai-output__section">Thinking</div><div class="ai-output__body">Analyzing the idea, constraints, and likely MVP path...</div></div>';
  }

  const prompt = `As Senthilkumar Sivaraman, give an honest MVP scope plan for this startup idea.

Idea: ${idea}
Stage: ${stage}
Team size: ${team}
Biggest challenge: ${challenge}

Respond using exactly these plain section headers:
PROBLEM VALIDATION
AI STACK RECOMMENDATION
3-WEEK MVP PLAN
TOP 3 RISKS
MINIMUM VIABLE SCOPE
MY HONEST TAKE

Use concise bullets where helpful.`;

  try {
    const reply = await callGroq(
      [
        { role: 'system', content: SENTHIL_CONTEXT },
        { role: 'user', content: prompt }
      ],
      1100
    );
    if (output) output.innerHTML = renderOutput(reply);
  } catch (error) {
    if (output) {
      output.innerHTML = `<div class="ai-output"><div class="ai-output__section">Error</div><div class="ai-output__body">${escHtml(error.message)}</div></div>`;
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Generate MVP Scope Plan';
    }
  }
}

async function runJDMatch() {
  const jd = document.getElementById('jdInput')?.value.trim();
  const output = document.getElementById('jdOutput');
  const button = document.getElementById('jdBtn');

  if (!jd || jd.length < 50) {
    const field = document.getElementById('jdInput');
    if (field) {
      field.style.borderColor = '#d24b38';
      setTimeout(() => {
        field.style.borderColor = '';
      }, 2200);
    }
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'Matching profile...';
  }
  if (output) {
    output.innerHTML = '<div class="ai-output"><div class="ai-output__section">Thinking</div><div class="ai-output__body">Reviewing the role requirements against Senthil\'s background...</div></div>';
  }

  const prompt = `Analyze this job description against Senthilkumar Sivaraman's actual background.
Be honest but always constructive. Do not oversell, but do not state gaps as hard negatives either.

JOB DESCRIPTION:
${jd}

Respond using exactly these plain section headers:
FIT SCORE
STRONG MATCHES
WHERE I ADD MORE THAN ASKED
HONEST GAPS
RECOMMENDATION

Under FIT SCORE, use the format X/10.
Under HONEST GAPS, frame any gaps diplomatically — acknowledge the area, then pivot to adjacent experience, transferable strength, or willingness and ability to grow quickly. Never state a gap as a flat negative without pairing it with a positive context. For example: instead of "I don't have X experience", say "While my direct X exposure is more limited, my work in [related area] gave me strong grounding in the underlying challenges — and I've consistently picked up new domain contexts quickly."
If the JD mentions work location, travel, or relocation — note that Senthil is fully open to any country, any work mode (remote, hybrid, on-site), and international assignments with no restrictions.`;

  try {
    const reply = await callGroq(
      [
        { role: 'system', content: SENTHIL_CONTEXT },
        { role: 'user', content: prompt }
      ],
      1000
    );
    if (output) output.innerHTML = renderOutput(reply);
  } catch (error) {
    if (output) {
      output.innerHTML = `<div class="ai-output"><div class="ai-output__section">Error</div><div class="ai-output__body">${escHtml(error.message)}</div></div>`;
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Match Against My Profile';
    }
  }
}

function renderOutput(text) {
  const knownHeadings = new Set([
    'PROBLEM VALIDATION',
    'AI STACK RECOMMENDATION',
    '3-WEEK MVP PLAN',
    'TOP 3 RISKS',
    'MINIMUM VIABLE SCOPE',
    'MY HONEST TAKE',
    'FIT SCORE',
    'STRONG MATCHES',
    'WHERE I ADD MORE THAN ASKED',
    'HONEST GAPS',
    'RECOMMENDATION'
  ]);

  const lines = text.split('\n');
  let markup = '<div class="ai-output">';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      markup += '<div class="ai-output__gap"></div>';
      return;
    }

    const sanitized = trimmed.replace(/:$/, '');
    if (knownHeadings.has(sanitized)) {
      markup += `<div class="ai-output__section">${escHtml(sanitized)}</div>`;
      return;
    }

    if (/^week\s+\d+/i.test(trimmed)) {
      markup += `<div class="ai-output__week">${escHtml(trimmed)}</div>`;
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      markup += `<div class="ai-output__bullet"><span class="ai-output__bullet-dot">+</span><span>${escHtml(trimmed.replace(/^[-*]\s+/, ''))}</span></div>`;
      return;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      markup += `<div class="ai-output__bullet"><span class="ai-output__bullet-dot">${escHtml(trimmed.match(/^\d+/)?.[0] || '')}</span><span>${escHtml(trimmed.replace(/^\d+[.)]\s+/, ''))}</span></div>`;
      return;
    }

    markup += `<div class="ai-output__body">${escHtml(trimmed)}</div>`;
  });

  markup += '</div>';
  return markup;
}

function escHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
