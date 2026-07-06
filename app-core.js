/**
 * El Ramon Music Club — app-core.js
 * Version légère pour les pages membres (jeu, bonus, guides, etc.)
 * Contient : Auth, Toast, Navigation basique
 * NE contient PAS : scroll reveal, particles, compteurs, formulaires
 */

// ============================================================
// CONFIG
// ============================================================
window.ElRamon = window.ElRamon || {};

const CORE_CONFIG = {
  STORAGE_KEY: 'elramon_member',
  SITE_NAME: 'El Ramon Music Club',
};

// ============================================================
// AUTH (localStorage V1)
// ============================================================
const Auth = {
  getMember() {
    try {
      const raw = localStorage.getItem(CORE_CONFIG.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  isLoggedIn() {
    return !!this.getMember();
  },

  logout() {
    localStorage.removeItem(CORE_CONFIG.STORAGE_KEY);
    window.location.href = '/';
  },

  requireAuth(redirectUrl = null) {
    if (!this.isLoggedIn()) {
      const target = redirectUrl || (window.location.pathname.includes('/pages/') ? './inscription.html' : '/pages/inscription.html');
      window.location.href = target;
      return false;
    }
    return true;
  },

  /**
   * Protection automatique des pages membres.
   */
  protectPage(redirectUrl) {
    const target = redirectUrl || (window.location.pathname.includes('/pages/') ? './inscription.html' : '/pages/inscription.html');
    if (!Auth.isLoggedIn()) {
      window.location.href = target;
    }
  },
};

// ============================================================
// TOAST (minimal)
// ============================================================
const Toast = {
  show(message, type = 'info', duration = 4000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    const icons = { success: '✅', error: '❌', info: '🎵', warning: '⚠️' };
    toast.innerHTML = '<span>' + (icons[type] || '🎵') + '</span> <span>' + message + '</span>';
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visible'), duration);
  }
};

// ============================================================
// NAVIGATION basique
// ============================================================
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      const isOpen = mobileNav.classList.contains('active');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileNav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
}

function initLogout() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Se déconnecter du Club ?')) Auth.logout();
    });
  });
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
  initLogout();
});

Object.assign(window.ElRamon, { Auth, Toast, CONFIG: CORE_CONFIG });
