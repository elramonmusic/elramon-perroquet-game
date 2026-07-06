/**
 * El Ramon Music Club - Interactions Avancées (UI/UX)
 * Gère le 3D Tilt, l'effet Glow, les Particules et les Transitions.
 */

export function initInteractions() {
  // 1. Initialiser VanillaTilt sur les cartes
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".video-card, .pdf-card, .bonus-card"), {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1.02
    });
  }

  // 2. Effet Glow (Glassmorphism dynamique)
  const glowCards = document.querySelectorAll('.video-card, .pdf-card, .bonus-card, .yt-btn, .btn-primary');
  
  document.addEventListener('mousemove', (e) => {
    for (const card of glowCards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  });

  // 3. Particules dans le Hero (tsParticles)
  if (typeof tsParticles !== 'undefined' && document.getElementById('hero-particles-layer')) {
    tsParticles.load("hero-particles-layer", {
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          resize: true
        },
        modes: {
          repulse: { distance: 100, duration: 0.4 }
        }
      },
      particles: {
        color: { value: ["#FFD700", "#FF8C00", "#00CED1"] },
        links: { enable: false },
        move: {
          direction: "top",
          enable: true,
          outModes: { default: "out" },
          random: true,
          speed: 1,
          straight: false
        },
        number: { density: { enable: true, area: 800 }, value: 40 },
        opacity: {
          value: 0.6,
          random: true,
          animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
        },
        shape: { type: "circle" },
        size: {
          value: { min: 1, max: 4 },
          random: true,
          animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false }
        }
      },
      detectRetina: true
    });
  }

  // 4. Transitions de page fluides (View Transitions API)
  // Intercepter les clics sur les liens internes
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;
    
    // Si le navigateur supporte les View Transitions
    if (document.startViewTransition) {
      e.preventDefault();
      
      document.startViewTransition(async () => {
        const response = await fetch(href);
        const html = await response.text();
        
        // Extraire et remplacer le contenu
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        document.body.innerHTML = doc.body.innerHTML;
        document.title = doc.title;
        window.history.pushState({}, '', href);
        
        // Réinitialiser les scripts
        window.scrollTo(0, 0);
        if (window.ElRamon && typeof window.ElRamon.init === 'function') {
          window.ElRamon.init();
        }
        initInteractions(); // Relancer les interactions sur le nouveau DOM
      });
    }
  });
}

// Lancer au chargement
document.addEventListener('DOMContentLoaded', initInteractions);
