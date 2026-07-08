/**
 * El Ramon Music Club — app.js
 * Global JS: navigation, auth (localStorage V1), scroll reveal, utils
 * Version 1.0
 */

// ============================================================
// CONFIG
// ============================================================
window.ElRamon = window.ElRamon || {};

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
  },

  /**
   * Protection automatique des pages membres.
   * À appeler via <body data-protect> — app.js détecte l'attribut au DOMContentLoaded.
   */
  protectPage(redirectUrl) {
    const target = redirectUrl || (isSubPage() ? './inscription.html' : '/pages/inscription.html');
    if (!this.isLoggedIn()) {
      window.location.href = target;
    }
  }
};

// ============================================================
// NAVIGATION
// ============================================================
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');

  // Scroll effect (throttled via requestAnimationFrame)
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
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
  _el: null,  // cache DOM

  show(message, type = 'info', duration = 4000) {
    let toast = this._el || document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    this._el = toast;  // mémorise pour les appels suivants

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

  // Anti double-soumission
  if (btn.dataset.submitting === '1') return;
  btn.dataset.submitting = '1';

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

    // Afficher le message de succès chaleureux et les confettis
    const successEl = form.querySelector('.form-success');
    if (successEl) {
      form.style.display = 'none';
      successEl.classList.add('visible');
      if (typeof fireConfetti === 'function') fireConfetti();
    }

    // Redirection vers page merci après délai
    setTimeout(() => {
      const isSubPage = window.location.pathname.includes('/pages/');
      const merciUrl = isSubPage ? 'merci.html' : 'pages/merci.html';
      window.location.href = merciUrl + '?email=' + encodeURIComponent(email);
    }, 3500);

  } catch (err) {
    console.error('Inscription error:', err);
    Toast.show('Une erreur est survenue. Réessaie dans un instant.', 'error');
    Form.setLoading(btn, false);
    btn.dataset.submitting = '0';
  }
}

// ============================================================
// CONTACT FORM
// ============================================================
async function handleContact(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('[type="submit"]');

  // Anti double-soumission
  if (btn.dataset.submitting === '1') return;
  btn.dataset.submitting = '1';

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
    btn.dataset.submitting = '0';
  }
}

// ============================================================
// COLLABORATION FORM
// ============================================================
async function handleCollaboration(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('[type="submit"]');

  // Anti double-soumission
  if (btn.dataset.submitting === '1') return;
  btn.dataset.submitting = '1';

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
    btn.dataset.submitting = '0';
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
        const startTime = performance.now();

        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          el.textContent = Math.floor(target * progress).toLocaleString('fr-FR');
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
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
  // Protection des pages membres (data-protect sur <body>)
  if (document.body.dataset.protect !== undefined) {
    Auth.protectPage();
  }

  initNavigation();
  initScrollReveal();
  initParticles();
  initHomeFeatures();
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

// ============================================================
// NEW HOME FEATURES
// ============================================================
function initHomeFeatures() {
  // Mascot Interactivity
  const mascotArea = document.getElementById('mascot-interactive-area');
  const mascotBubble = document.getElementById('mascot-bubble');
  if (mascotArea && mascotBubble) {
    mascotArea.addEventListener('click', () => {
      mascotBubble.style.display = 'block';
      setTimeout(() => {
        mascotBubble.style.display = 'none';
      }, 3000);
    });
  }

  // --- Façade YouTube ---
  const youtubeFacade = document.querySelector('.youtube-facade');
  if (youtubeFacade) {
    youtubeFacade.addEventListener('click', function() {
      const videoId = this.getAttribute('data-video-id');
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
      iframe.setAttribute('title', 'El Ramon Music — Ça fait chanter le soleil');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '500');
      iframe.setAttribute('style', 'border-radius: var(--radius-xl); border: none;');
      
      this.parentNode.replaceChild(iframe, this);
    });
  }

  // --- Share API Buttons ---
  const shareBtns = document.querySelectorAll('.btn-share-product');
  shareBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-title');
      const url = btn.getAttribute('data-url');
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: title,
            url: url
          });
        } catch (err) {
          console.log('Partage annulé ou échoué', err);
        }
      } else {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(`${title} - ${url}`);
          const originalText = btn.innerHTML;
          btn.innerHTML = '✅ Lien copié !';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        } catch (err) {
          console.error('Erreur lors de la copie', err);
        }
      }
    });
  });

  // --- Quiz Tropical ---
  const quizContainer = document.getElementById('quiz-container');
  if (quizContainer) {
    const questions = [
      {
        q: "1. Ton ambiance préférée ?",
        options: [
          { text: "Plage et soleil", score: "mascotte" },
          { text: "Musique et fête", score: "musique" },
          { text: "Perroquet et humour", score: "mascotte" }
        ]
      },
      {
        q: "2. Tu veux surtout :",
        options: [
          { text: "Décorer ton coin tropical", score: "mascotte" },
          { text: "Découvrir une chanson", score: "musique" },
          { text: "Trouver un objet fun", score: "look" }
        ]
      },
      {
        q: "3. Ton style :",
        options: [
          { text: "Festif", score: "musique" },
          { text: "Relax", score: "mascotte" },
          { text: "Coloré", score: "look" }
        ]
      }
    ];

    let currentQuestion = 0;
    let scores = { mascotte: 0, musique: 0, look: 0 };

    const renderQuestion = () => {
      if (currentQuestion >= questions.length) {
        renderResult();
        return;
      }
      const q = questions[currentQuestion];
      let html = `<div class="quiz-question-container">
        <h3 style="color:var(--yellow-sun); margin-bottom:1rem; font-size:1.2rem;">${q.q}</h3>
      `;
      q.options.forEach((opt, idx) => {
        html += `<button class="quiz-option" data-score="${opt.score}">${opt.text}</button>`;
      });
      html += `</div>`;
      quizContainer.innerHTML = html;

      // Attach events
      document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const scoreKey = e.currentTarget.dataset.score;
          if (scores[scoreKey] !== undefined) {
            scores[scoreKey]++;
          }
          currentQuestion++;
          renderQuestion();
        });
      });
    };

    const renderResult = () => {
      // Find max score
      let topCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
      
      const resultsMap = {
        mascotte: {
          title: "🦜 Tu es fait pour la Mascotte Perroquet !",
          desc: "Soleil, bonne humeur et fun... Le perroquet est l'objet idéal pour toi.",
          btnText: "Voir la mascotte",
          url: "https://amzlink.to/az0WAg2bqcneI"
        },
        musique: {
          title: "🎸 Tu es l'âme de la fête musicale !",
          desc: "Tu aimes quand ça bouge. Lance une playlist El Ramon ou mets-toi au Ukulélé.",
          btnText: "Voir la musique",
          url: "pages/selection-tropicale.html"
        },
        look: {
          title: "🌴 Ton style est 100% Tropical !",
          desc: "Des couleurs qui flashent, une chemise à fleurs et un look qui sent l'été.",
          btnText: "Découvrir le look",
          url: "pages/selection-tropicale.html"
        }
      };

      const res = resultsMap[topCategory];
      quizContainer.innerHTML = `
        <div class="quiz-result-card">
          <h3 style="color:var(--yellow-sun); margin-bottom:0.5rem; font-size:1.4rem;">${res.title}</h3>
          <p style="margin-bottom:1.5rem; color:rgba(255,255,255,0.8);">${res.desc}</p>
          <a href="${res.url}" class="btn btn-primary" style="margin-bottom: 1rem;">${res.btnText}</a>
          <div style="margin-top: 1rem;">
            <button id="restart-quiz" style="background:none; border:none; color:rgba(255,255,255,0.6); text-decoration:underline; cursor:pointer;">Refaire le quiz</button>
          </div>
        </div>
      `;

      document.getElementById('restart-quiz').addEventListener('click', () => {
        currentQuestion = 0;
        scores = { mascotte: 0, musique: 0, look: 0 };
        renderQuestion();
      });
    };

    // Start
    renderQuestion();
  }

  // Sticky Mobile Button (IntersectionObserver)
  const stickyBtn = document.getElementById('mobile-sticky-btn');
  if (stickyBtn) {
    const sections = [
      { id: 'club', text: '✨ Rejoindre le Club', href: 'pages/inscription.html' },
      { id: 'mini-jeu', text: '🎮 Jouer', href: 'pages/jeu.html' },
      { id: 'selection-du-moment', text: '🛍️ Voir la sélection', href: 'pages/selection-tropicale.html' },
      { id: 'videos', text: '▶ Voir YouTube', href: '#videos' },
      { id: 'inscription', text: '✨ S\'inscrire', href: 'pages/inscription.html' },
      { id: 'hero', text: 'hide', href: '#' }
    ];

    const observer = new IntersectionObserver((entries) => {
      let mostVisible = null;
      let maxRatio = 0;
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          mostVisible = entry.target.id;
        }
      });

      if (mostVisible) {
        if (mostVisible === 'hero') {
          stickyBtn.style.display = 'none';
        } else {
          const config = sections.find(s => s.id === mostVisible);
          if (config) {
            stickyBtn.style.display = 'flex';
            stickyBtn.innerHTML = config.text;
            stickyBtn.href = config.href;
          } else {
            stickyBtn.style.display = 'flex';
            stickyBtn.innerHTML = '🛍️ Sélection';
            stickyBtn.href = 'pages/selection-tropicale.html';
          }
        }
      }
    }, { threshold: [0.1, 0.5, 0.9] });

    const heroEl = document.getElementById('hero');
    if (heroEl) observer.observe(heroEl);
    
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
  }

  // Locked Cards Toast
  const lockedCards = document.querySelectorAll('[data-locked="true"]');
  lockedCards.forEach(card => {
    card.addEventListener('click', () => {
      Toast.show('Entre ton email et débloque ce bonus gratuitement 🎁', 'info');
      setTimeout(() => {
        const isSubPage = window.location.pathname.includes('/pages/');
        window.location.href = isSubPage ? 'inscription.html' : 'pages/inscription.html';
      }, 1500);
    });
  });
}

function fireConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  const emojis = ['🎉', '🌴', '🥥', '🦜', '☀️'];
  for(let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.position = 'absolute';
    el.style.left = Math.random() * 100 + '%';
    el.style.top = '-20px';
    el.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
    el.style.transition = 'transform 2s ease-out, opacity 2s ease-out, top 2s ease-in';
    container.appendChild(el);
    
    setTimeout(() => {
      el.style.top = '100%';
      el.style.transform = `rotate(${Math.random() * 360}deg) translateX(${Math.random() * 100 - 50}px)`;
      el.style.opacity = '0';
    }, 50);
  }
}

Object.assign(window.ElRamon, { Auth, Toast, Form, CONFIG });
