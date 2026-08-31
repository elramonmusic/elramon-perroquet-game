/**
 * El Ramon Music Club — app-core.js
 * Ancien bundle léger conservé pour compatibilité.
 * L'authentification réelle reste fournie par app.js/Supabase.
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
// AUTH
// ============================================================
const Auth = window.ElRamon.Auth || null;

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
    const icon = document.createElement('span');
    icon.textContent = icons[type] || '🎵';
    const text = document.createElement('span');
    text.textContent = String(message);
    toast.replaceChildren(icon, document.createTextNode(' '), text);
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
      if (confirm('Se déconnecter du Club ?') && window.ElRamon.Auth) window.ElRamon.Auth.logout();
    });
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Protection des pages membres (data-protect sur <body>)
  if (document.body.dataset.protect !== undefined) {
    if (window.ElRamon.Auth?.protectPage) {
      window.ElRamon.Auth.protectPage();
    } else {
      window.location.href = './login.html';
      return;
    }
  }
  initNavigation();
  initLogout();
});

Object.assign(window.ElRamon, { Toast, CONFIG: CORE_CONFIG });
