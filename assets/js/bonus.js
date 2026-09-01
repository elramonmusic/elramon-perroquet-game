(() => {
  'use strict';

  const state = { bonuses: [], activeFilter: 'all', token: null };
  const fallbackImage = '../assets/images/playlist.webp';
  const logoImage = '../assets/images/logo.webp';

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filterChips')?.addEventListener('click', handleFilterClick);
    waitForAuth();
  });

  async function waitForAuth() {
    if (!window.ElRamon?.Auth) {
      window.setTimeout(waitForAuth, 100);
      return;
    }
    await window.ElRamon.Auth.init();
    const session = await window.ElRamon.Auth.getSession();
    if (!session) {
      window.location.href = '/pages/login.html';
      return;
    }
    state.token = session.access_token;
    loadBonusContent();
  }

  async function loadBonusContent() {
    const content = document.getElementById('libraryContent');
    try {
      const response = await fetch('/api/bonus/list', { headers: { Authorization: `Bearer ${state.token}` } });
      if (!response.ok) throw new Error('Impossible de charger la bibliothèque');
      const data = await response.json();
      state.bonuses = Array.isArray(data) ? data.filter((item) => item.category !== 'Prompt IA' && item.category !== 'Pass') : [];
      renderLibrary();
    } catch (error) {
      console.error(error);
      content?.replaceChildren(createMessage('La bibliothèque ne peut pas être chargée pour le moment.', true));
      document.getElementById('resultsCount').textContent = 'Chargement impossible';
    }
  }

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function getContentType(item) {
    if (item.is_premium) return 'premium';
    const value = normalize(`${item.category} ${item.title} ${item.description}`);
    if (value.includes('short')) return 'shorts';
    if (value.includes('instrumental')) return 'instrumental';
    if (value.includes('single')) return 'single';
    if (value.includes('album') || value.includes(' ep')) return 'album';
    if (value.includes('cover') || value.includes('reimagine')) return 'cover';
    return 'playlist';
  }

  function getTypeLabel(type) {
    return { playlist: 'Playlist', shorts: 'Shorts', instrumental: 'Instrumentales', single: 'Single', album: 'Album / EP', cover: 'Covers', premium: 'Premium' }[type] || 'Sélection';
  }

  function handleFilterClick(event) {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((chip) => {
      const active = chip === button;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    renderLibrary();
  }

  function renderLibrary() {
    const content = document.getElementById('libraryContent');
    content.replaceChildren();
    const visible = state.bonuses.filter((item) => state.activeFilter === 'all' || getContentType(item) === state.activeFilter);
    document.getElementById('resultsCount').textContent = `${visible.length} contenu${visible.length > 1 ? 's' : ''}`;
    if (!visible.length) {
      content.append(createMessage('Aucun contenu dans cette catégorie pour le moment.'));
      return;
    }
    const free = visible.filter((item) => !item.is_premium);
    const premium = visible.filter((item) => item.is_premium);
    if (free.length) content.append(createShelf(state.activeFilter === 'all' ? 'Les nouveautés du Club' : getTypeLabel(state.activeFilter), state.activeFilter === 'all' ? 'Clips, albums et sélections à découvrir' : 'La sélection correspondant à ton filtre', free));
    if (premium.length) content.append(createShelf('⭐ Exclusivités membres', 'Des contenus réservés à débloquer avec tes bananes', premium, true));
  }

  function createShelf(title, subtitle, items, premium = false) {
    const section = document.createElement('section');
    section.className = `content-shelf${premium ? ' premium-shelf' : ''}`;
    const heading = document.createElement('div');
    heading.className = 'shelf-heading';
    const copy = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = title;
    const p = document.createElement('p');
    p.textContent = subtitle;
    copy.append(h2, p);
    heading.append(copy);
    const grid = document.createElement('div');
    grid.className = 'video-grid';
    items.forEach((item) => grid.append(createVideoCard(item)));
    section.append(heading, grid);
    return section;
  }

  function createVideoCard(item) {
    const type = getContentType(item);
    const locked = Boolean(item.is_premium && !item.is_unlocked);
    const safeUrl = !locked && item.url ? String(item.url) : '';
    const article = document.createElement('article');
    article.className = 'video-card';
    article.dataset.type = type;

    const mediaLink = document.createElement(safeUrl ? 'a' : 'div');
    mediaLink.className = 'video-thumbnail-link';
    if (safeUrl) {
      mediaLink.href = safeUrl;
      mediaLink.target = '_blank';
      mediaLink.rel = 'noopener';
      mediaLink.setAttribute('aria-label', `Ouvrir ${item.title || 'le contenu'}`);
    }

    const imageUrl = item.image_url ? String(item.image_url) : fallbackImage;
    let media;
    if (/\.(mp4|webm)(\?|$)/i.test(imageUrl)) {
      media = document.createElement('video');
      Object.assign(media, { autoplay: true, loop: true, muted: true, playsInline: true, preload: 'metadata', src: imageUrl });
    } else {
      media = document.createElement('img');
      Object.assign(media, { src: imageUrl, alt: `Miniature — ${item.title || 'sélection El Ramon'}`, loading: 'lazy', decoding: 'async' });
      media.addEventListener('error', () => { media.src = fallbackImage; }, { once: true });
    }
    media.className = 'video-thumbnail';
    const badge = document.createElement('span');
    badge.className = `thumbnail-badge${item.is_premium ? ' premium' : ''}`;
    badge.textContent = item.is_premium ? (locked ? '🔒 Premium' : '✓ Débloqué') : getTypeLabel(type);
    mediaLink.append(media, badge);

    const body = document.createElement('div');
    body.className = 'video-card-body';
    const avatar = document.createElement('span');
    avatar.className = 'video-avatar';
    const avatarImage = document.createElement('img');
    avatarImage.src = logoImage;
    avatarImage.alt = '';
    avatar.append(avatarImage);
    const copy = document.createElement('div');
    const title = document.createElement(safeUrl ? 'a' : 'span');
    title.className = 'video-title-link';
    title.textContent = String(item.title || 'Sélection El Ramon');
    if (safeUrl) Object.assign(title, { href: safeUrl, target: '_blank', rel: 'noopener' });
    const meta = document.createElement('p');
    meta.className = 'video-meta';
    meta.textContent = `El Ramon Music · ${item.category || getTypeLabel(type)}`;
    const description = document.createElement('p');
    description.className = 'video-description';
    description.textContent = String(item.description || 'Une sélection musicale du Club.');
    copy.append(title, meta, description);

    let action;
    if (locked) {
      action = document.createElement('button');
      action.type = 'button';
      action.className = 'video-action premium';
      action.textContent = `🔒 Débloquer · ${Number(item.banana_cost) || 0} 🍌`;
      action.addEventListener('click', () => unlockBonus(item.id, Number(item.banana_cost) || 0));
    } else {
      action = document.createElement('a');
      action.className = 'video-action';
      action.href = safeUrl || '#';
      action.target = '_blank';
      action.rel = 'noopener';
      action.textContent = '▶ Ouvrir';
    }
    copy.append(action);
    body.append(avatar, copy);
    article.append(mediaLink, body);
    return article;
  }

  function createMessage(text, retry = false) {
    const message = document.createElement('div');
    message.className = 'library-message';
    const inner = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = text;
    inner.append(p);
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'retry-button';
      button.textContent = 'Réessayer';
      button.addEventListener('click', () => { showSkeletons(); loadBonusContent(); });
      inner.append(button);
    }
    message.append(inner);
    return message;
  }

  function showSkeletons() {
    const cards = '<div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>';
    document.getElementById('libraryContent').innerHTML = `<div class="loading-grid" aria-busy="true">${cards.repeat(4)}</div>`;
    document.getElementById('resultsCount').textContent = 'Chargement des contenus…';
  }

  async function unlockBonus(id, cost) {
    if (!window.confirm(`Veux-tu dépenser ${cost} bananes 🍌 pour débloquer ce contenu premium ?`)) return;
    window.ElRamon?.Toast?.show('Déblocage en cours… 🍌', 'info');
    try {
      const response = await fetch('/api/bonus/unlock', { method: 'POST', headers: { Authorization: `Bearer ${state.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ bonusId: id }) });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === 'Fonds insuffisants') {
          const message = 'Il te manque quelques bananes 🍌 Joue au mini-jeu pour en gagner !';
          if (window.ElRamon?.Toast) window.ElRamon.Toast.show(message, 'error'); else window.alert(message);
          return;
        }
        throw new Error(data.error || 'Le déblocage a échoué');
      }
      window.ElRamon?.Toast?.show('Contenu débloqué ! 🎉', 'success');
      await loadBonusContent();
    } catch (error) {
      console.error(error);
      window.alert(`Erreur : ${error.message}`);
    }
  }
})();
