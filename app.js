/**
 * El Ramon Music Club — app.js
 * Global JS: navigation, auth (localStorage V1), scroll reveal, utils
 * Version 1.0
 */

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  STORAGE_KEY: 'elramon_member',
  SESSION_KEY: 'elramon_session',
  SITE_NAME: 'El Ramon Music Club',
  EMAIL_CONTACT: 'elramonmusic@gmail.com',
  YOUTUBE_URL: 'https://www.youtube.com/@El-Ramon-Music',
  TURNSTILE_SITEKEY: '0x4AAAAAADvpVNb0l4gq0dkE',
};

// ============================================================
// TURNSTILE — Callback anti-bot (Cloudflare)
// ============================================================
window._turnstileToken = undefined;

window.onTurnstileSuccess = function(token) {
  window._turnstileToken = token;
};

window.onTurnstileError = function() {
  window._turnstileToken = undefined;
};

// ============================================================
// AUTH UTILS (localStorage — session client uniquement)
// La base de données Supabase est gérée côté serveur (Cloudflare Functions).
// ============================================================
const Auth = {
  /**
   * Récupère les données du membre connecté
   * @returns {Object|null} données membre ou null
   */
  getMember() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Enregistre un nouveau membre
   */
  saveMember(data) {
    const member = {
      email: data.email,
      pseudo: data.pseudo,
      prenom: data.prenom || '',
      role: 'member',
      joined_at: new Date().toISOString(),
    };
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(member));
    return member;
  },

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn() {
    return !!this.getMember();
  },

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    window.location.href = '/';
  },

  /**
   * Protection de page — redirige si non connecté
   * @param {string} redirectUrl URL de redirection si non connecté
   */
  requireAuth(redirectUrl = null) {
    if (!this.isLoggedIn()) {
      const target = redirectUrl || (isSubPage() ? '../pages/inscription.html' : '/pages/inscription.html');
      window.location.href = target;
      return false;
    }
    return true;
  },

  /**
   * Injection login en V2 (Supabase Auth) — à venir
   */
  async loginWithEmail(email, password) {
    console.warn('Auth Supabase (V2) non encore implémentée.');
    return { error: 'Backend non configuré' };
  }
};

// ============================================================
// NAVIGATION
// ============================================================
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');

  // Scroll effect
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // Mobile toggle
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      const isOpen = mobileNav.classList.contains('active');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileNav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Update nav based on auth state
  updateNavAuth();
}

function updateNavAuth() {
  const member = Auth.getMember();
  const authLinks = document.querySelectorAll('[data-auth-show]');
  const guestLinks = document.querySelectorAll('[data-guest-show]');
  const memberNameEls = document.querySelectorAll('[data-member-name]');

  authLinks.forEach(el => {
    el.style.display = member ? '' : 'none';
  });

  guestLinks.forEach(el => {
    el.style.display = member ? 'none' : '';
  });

  if (member) {
    memberNameEls.forEach(el => {
      el.textContent = member.prenom || member.pseudo;
    });
  }
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ============================================================
// PARTICLES (hero décoration)
// ============================================================
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const colors = ['#FFD700', '#FF8C00', '#FF6B6B', '#00CED1', '#2ECC71'];
  const shapes = ['🌺', '🌴', '⭐', '🎵', '🎶', '✨'];

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (Math.random() * 4 + 6) + 's';
    p.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    container.appendChild(p);
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
const Toast = {
  show(message, type = 'info', duration = 4000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    const icons = {
      success: '✅',
      error: '❌',
      info: '🎵',
      warning: '⚠️'
    };

    toast.innerHTML = `<span>${icons[type] || '🎵'}</span> <span>${message}</span>`;
    toast.classList.add('visible');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }
};

// ============================================================
// COOKIE BANNER
// ============================================================
function initCookieBanner() {
  const COOKIE_KEY = 'elramon_cookies_accepted';
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  if (localStorage.getItem(COOKIE_KEY)) {
    banner.classList.add('hidden');
    return;
  }

  const acceptBtn = banner.querySelector('[data-cookie-accept]');
  const declineBtn = banner.querySelector('[data-cookie-decline]');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(COOKIE_KEY, '1');
      banner.classList.add('hidden');
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem(COOKIE_KEY, '0');
      banner.classList.add('hidden');
    });
  }
}

// ============================================================
// FORM UTILITIES
// ============================================================
const Form = {
  /**
   * Validation basique d'email
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Affiche une erreur sur un champ
   */
  showError(inputEl, message) {
    const errorEl = inputEl.closest('.form-group')?.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
      inputEl.style.borderColor = '#FF6B6B';
    }
  },

  /**
   * Efface les erreurs
   */
  clearErrors(formEl) {
    formEl.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
    formEl.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
      el.style.borderColor = '';
    });
  },

  /**
   * État loading d'un bouton
   */
  setLoading(btn, loading) {
    if (loading) {
      btn.disabled = true;
      btn._originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span> Envoi en cours...';
    } else {
      btn.disabled = false;
      btn.innerHTML = btn._originalText || 'Envoyer';
    }
  }
};

// ============================================================
// INSCRIPTION (formulaire principal)
// ============================================================
async function handleInscription(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('[type="submit"]');

  Form.clearErrors(form);

  // Récupération des champs
  const email = form.querySelector('#email')?.value?.trim();
  const pseudo = form.querySelector('#pseudo')?.value?.trim();
  const prenom = form.querySelector('#prenom')?.value?.trim();
  const newsletter = form.querySelector('#newsletter')?.checked;
  const abonne = form.querySelector('#abonne')?.checked;
  const rgpd = form.querySelector('#rgpd')?.checked;

  // Validation
  let hasError = false;

  if (!email || !Form.isValidEmail(email)) {
    Form.showError(form.querySelector('#email'), 'Adresse email invalide.');
    hasError = true;
  }

  if (!pseudo || pseudo.length < 2) {
    Form.showError(form.querySelector('#pseudo'), 'Pseudo requis (min. 2 caractères).');
    hasError = true;
  }

  if (!rgpd) {
    const rgpdEl = form.querySelector('#rgpd');
    if (rgpdEl) {
      const errorEl = rgpdEl.closest('.form-checkbox-group')?.nextElementSibling;
      if (errorEl) {
        errorEl.textContent = 'Vous devez accepter la politique de confidentialité.';
        errorEl.classList.add('visible');
      }
    }
    hasError = true;
  }

  if (hasError) return;

  Form.setLoading(btn, true);

  try {
    // Envoi vers Cloudflare Pages Function
    const payload = { email, pseudo, prenom, newsletter, abonne, rgpd, turnstile: window._turnstileToken || '' };

    // Tentative d'envoi vers le backend
    let serverSaved = false;
    try {
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        serverSaved = true;
      }
    } catch (fetchError) {
      console.warn('Backend unavailable, saving to localStorage only:', fetchError.message);
    }

    window._turnstileToken = undefined;

    // Toujours sauvegarder en localStorage (session)
    const member = Auth.saveMember({ email, pseudo, prenom });

    // Redirection vers page merci
    const isSubPage = window.location.pathname.includes('/pages/');
    const merciUrl = isSubPage ? 'merci.html' : 'pages/merci.html';
    window.location.href = merciUrl + '?email=' + encodeURIComponent(email);

  } catch (err) {
    console.error('Inscription error:', err);
    Toast.show('Une erreur est survenue. Réessaie dans un instant.', 'error');
    Form.setLoading(btn, false);
  }
}

// ============================================================
// CONTACT FORM
// ============================================================
async function handleContact(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('[type="submit"]');

  Form.clearErrors(form);

  const nom = form.querySelector('#nom')?.value?.trim();
  const email = form.querySelector('#email')?.value?.trim();
  const sujet = form.querySelector('#sujet')?.value?.trim();
  const message = form.querySelector('#message')?.value?.trim();

  let hasError = false;

  if (!nom) { Form.showError(form.querySelector('#nom'), 'Nom requis.'); hasError = true; }
  if (!email || !Form.isValidEmail(email)) { Form.showError(form.querySelector('#email'), 'Email invalide.'); hasError = true; }
  if (!message || message.length < 20) { Form.showError(form.querySelector('#message'), 'Message trop court (min. 20 caractères).'); hasError = true; }

  if (hasError) return;

  Form.setLoading(btn, true);

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, sujet, message, turnstile: window._turnstileToken || '' }),
    });

    window._turnstileToken = undefined;

    const successEl = form.querySelector('.form-success');
    if (successEl) {
      form.reset();
      successEl.classList.add('visible');
    }
    Toast.show('Message envoyé ! On te répond très vite. 🎵', 'success');

  } catch (err) {
    Toast.show('Erreur d\'envoi. Écris-nous directement : ' + CONFIG.EMAIL_CONTACT, 'error', 6000);
  } finally {
    Form.setLoading(btn, false);
  }
}

// ============================================================
// COLLABORATION FORM
// ============================================================
async function handleCollaboration(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('[type="submit"]');

  Form.clearErrors(form);

  const data = {
    company: form.querySelector('#company')?.value?.trim(),
    contact: form.querySelector('#contact-name')?.value?.trim(),
    email: form.querySelector('#email')?.value?.trim(),
    website: form.querySelector('#website')?.value?.trim(),
    type: form.querySelector('#collab-type')?.value,
    product: form.querySelector('#product')?.value?.trim(),
    budget: form.querySelector('#budget')?.value?.trim(),
    message: form.querySelector('#collab-message')?.value?.trim(),
  };

  let hasError = false;

  if (!data.company) { Form.showError(form.querySelector('#company'), 'Nom d\'entreprise requis.'); hasError = true; }
  if (!data.email || !Form.isValidEmail(data.email)) { Form.showError(form.querySelector('#email'), 'Email invalide.'); hasError = true; }
  if (!data.message || data.message.length < 20) { Form.showError(form.querySelector('#collab-message'), 'Message trop court.'); hasError = true; }

  if (hasError) return;

  Form.setLoading(btn, true);

  try {
    await fetch('/collaboration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, turnstile: window._turnstileToken || '' }),
    });

    window._turnstileToken = undefined;

    const successEl = form.querySelector('.form-success');
    if (successEl) {
      form.reset();
      successEl.classList.add('visible');
    }
    Toast.show('Demande envoyée ! On reviendra vers toi rapidement. 🤝', 'success');

  } catch (err) {
    Toast.show('Erreur d\'envoi. Écris-nous directement : ' + CONFIG.EMAIL_CONTACT, 'error', 6000);
  } finally {
    Form.setLoading(btn, false);
  }
}

// ============================================================
// UTILS
// ============================================================
function isSubPage() {
  return window.location.pathname.includes('/pages/');
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ============================================================
// LOGOUT BUTTON
// ============================================================
function initLogout() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Se déconnecter du Club ?')) {
        Auth.logout();
      }
    });
  });
}

// ============================================================
// SMOOTH SCROLL
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // header height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current).toLocaleString('fr-FR');
        }, 16);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initParticles();
  initCookieBanner();
  initSmoothScroll();
  initLogout();
  animateCounters();

  // Formulaires
  const inscriptionForm = document.querySelector('#inscription-form');
  if (inscriptionForm) inscriptionForm.addEventListener('submit', handleInscription);

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) contactForm.addEventListener('submit', handleContact);

  const collabForm = document.querySelector('#collaboration-form');
  if (collabForm) collabForm.addEventListener('submit', handleCollaboration);
});

// Export pour usage dans d'autres scripts
window.ElRamon = { Auth, Toast, Form, CONFIG };
