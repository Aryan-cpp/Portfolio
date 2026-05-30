
/**
 * ARYAN CHAUDHARI — PORTFOLIO  |  main.js
 * ──────────────────────────────────────────────────────────────
 *  Features:
 *  1. Sticky header + scroll detection
 *  2. Mobile navigation toggle
 *  3. Active nav-link highlighting (IntersectionObserver)
 *  4. Scroll-reveal animations
 *  5. Skill-bar progress animation (triggered on scroll)
 *  6. Contact form validation & submit handler
 *  7. Back-to-top button
 *  8. Dynamic footer year
 *  9. Custom cursor glow (desktop)
 * ──────────────────────────────────────────────────────────────
 */

"use strict";

/* ─────────────────────────────────────────────────────────────
   1. DOM HELPERS
───────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────────────────────
   2. STICKY HEADER
───────────────────────────────────────────────────────────── */
function initStickyHeader() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ─────────────────────────────────────────────────────────────
   3. MOBILE NAVIGATION TOGGLE
───────────────────────────────────────────────────────────── */
function initMobileNav() {
  const toggle = $('#nav-toggle');
  const links  = $('#nav-links');
  if (!toggle || !links) return;

  /* Open / close drawer */
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close on link click (mobile) */
  $$('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!links.contains(e.target) && !toggle.contains(e.target)) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   4. ACTIVE NAV-LINK HIGHLIGHTING
───────────────────────────────────────────────────────────── */
function initActiveNavLinks() {
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => observer.observe(s));
}

/* ─────────────────────────────────────────────────────────────
   5. SCROLL REVEAL ANIMATIONS
───────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        /* Stagger siblings in the same parent */
        const siblings = $$('.reveal', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.07}s`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  els.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   6. SKILL BAR ANIMATION
───────────────────────────────────────────────────────────── */
function initSkillBars() {
  const bars = $$('.skill-bar__fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar   = entry.target;
        const width = bar.getAttribute('data-width') || '0';
        /* Slight delay for visual polish */
        requestAnimationFrame(() => {
          setTimeout(() => { bar.style.width = `${width}%`; }, 200);
        });
        observer.unobserve(bar);
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach(bar => observer.observe(bar));
}

/* ─────────────────────────────────────────────────────────────
   7. CONTACT FORM VALIDATION & SUBMIT
───────────────────────────────────────────────────────────── */
function initContactForm() {
  const form       = $('#contact-form');
  const statusEl   = $('#form-status');
  const submitBtn  = $('#submit-btn');
  const btnText    = $('#btn-text');
  if (!form) return;

  /* ── Field validators ── */
  const validators = {
    name:    v => v.trim().length >= 2   ? ''  : 'Please enter your full name (at least 2 characters).',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    subject: v => v.trim().length >= 3   ? ''  : 'Please enter a subject (at least 3 characters).',
    message: v => v.trim().length >= 10  ? ''  : 'Please write a message (at least 10 characters).'
  };

  /* ── Live validation on blur ── */
  Object.keys(validators).forEach(name => {
    const input  = form.elements[name];
    const errEl  = $(`#${name}-error`);
    if (!input || !errEl) return;

    input.addEventListener('blur', () => {
      const msg = validators[name](input.value);
      errEl.textContent = msg;
      input.classList.toggle('is-invalid', !!msg);
    });

    input.addEventListener('input', () => {
      if (!input.classList.contains('is-invalid')) return;
      const msg = validators[name](input.value);
      errEl.textContent = msg;
      input.classList.toggle('is-invalid', !!msg);
    });
  });

  /* ── Submit handler ── */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* Validate all fields */
    let hasErrors = false;
    Object.keys(validators).forEach(name => {
      const input = form.elements[name];
      const errEl = $(`#${name}-error`);
      if (!input || !errEl) return;
      const msg = validators[name](input.value);
      errEl.textContent = msg;
      input.classList.toggle('is-invalid', !!msg);
      if (msg) hasErrors = true;
    });

    if (hasErrors) return;

    /* Disable button + show loading */
    submitBtn.disabled  = true;
    btnText.textContent = 'Sending…';
    statusEl.className  = 'form-status';
    statusEl.style.display = 'none';

    /*
     * 🔧 DEVELOPER NOTE:
     * Replace the setTimeout below with your actual form submission logic.
     * Options:
     *   - Formspree:   fetch('https://formspree.io/f/YOUR_ID', {...})
     *   - EmailJS:     emailjs.sendForm(...)
     *   - Your API:    fetch('/api/contact', {...})
     */
    await new Promise(resolve => setTimeout(resolve, 1400)); // simulate network

    /* Mock success (replace with real response handling) */
    const success = true;

    if (success) {
      statusEl.textContent = '🎉 Message sent! Ill get back to you soon.';
      statusEl.className   = 'form-status is-success';
      statusEl.style.display = 'block';
      form.reset();
      /* Clear error states */
      $$('.form-input, .form-textarea').forEach(el => el.classList.remove('is-invalid'));
      $$('.form-error').forEach(el => { el.textContent = ''; });
    } else {
      statusEl.textContent = '❌ Something went wrong. Please try again.';
      statusEl.className   = 'form-status is-error';
      statusEl.style.display = 'block';
    }

    submitBtn.disabled  = false;
    btnText.textContent = 'Send Message';

    /* Auto-hide status after 6s */
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 6000);
  });
}

/* ─────────────────────────────────────────────────────────────
   8. BACK TO TOP BUTTON
───────────────────────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────────────────────
   9. DYNAMIC FOOTER YEAR
───────────────────────────────────────────────────────────── */
function initFooterYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────────────────────
  10. CURSOR GLOW (desktop only)
───────────────────────────────────────────────────────────── */
function initCursorGlow() {
  /* Skip on touch devices or if prefers-reduced-motion */
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Create glow element */
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(circle, rgba(59,130,246,.07) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
    will-change: left, top;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top  = `${e.clientY}px`;
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────────────
  11. SMOOTH ANCHOR SCROLLING (fallback for older browsers)
───────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─────────────────────────────────────────────────────────────
  12. INIT
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initActiveNavLinks();
  initScrollReveal();
  initSkillBars();
  initContactForm();
  initBackToTop();
  initFooterYear();
  initCursorGlow();
  initSmoothScroll();

  console.log('%c👋 Aryan Chaudhari — Portfolio loaded!', 'color:#3b82f6;font-weight:700;font-size:14px;');
});
