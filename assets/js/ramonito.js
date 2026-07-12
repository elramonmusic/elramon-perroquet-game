/**
 * Ramonito Chat Widget Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Le widget Ramonito ne s'affiche que sur l'espace membre (ou si l'utilisateur est connecté)
  const isMemberPage = document.body.dataset.protect !== undefined || window.location.pathname.includes('espace-membre');
  
  if (!isMemberPage) return; // On ne l'affiche que dans les pages membres pour le moment
  
  const member = window.ElRamon && window.ElRamon.Auth ? await window.ElRamon.Auth.getMember() : null;
  if (!member) return;

  // Création du widget HTML (Glassmorphism)
  const widgetHTML = `
    <div id="ramonito-widget" class="ramonito-widget-container">
      <div id="ramonito-chatbox" class="ramonito-chatbox hidden">
        <div class="ramonito-header">
          <div class="ramonito-title">🦜 Ramonito</div>
          <div class="ramonito-balance">
            <span id="ramonito-free-badge" class="badge-free hidden">Gratuit</span>
            <span id="ramonito-bananas-count">🍌 ${member.bananas_balance || 0}</span>
          </div>
          <button id="ramonito-close" class="ramonito-close-btn">&times;</button>
        </div>
        <div id="ramonito-messages" class="ramonito-messages">
          <div class="message assistant">Salut, moi c’est Ramonito 🦜 Je suis la mascotte du El Ramon Music Club. Tu as 3 questions gratuites, puis tu pourras utiliser tes bananes gagnées dans le jeu pour continuer à discuter avec moi 🍌☀️</div>
        </div>
        <div class="ramonito-input-area">
          <input type="text" id="ramonito-input" placeholder="Pose ta question..." autocomplete="off">
          <button id="ramonito-send" title="Envoyer">💋</button>
        </div>
      </div>
      <button id="ramonito-toggle" class="ramonito-toggle-btn">
        🦜
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Styles (Glassmorphism)
  const style = document.createElement('style');
  style.textContent = `
    .ramonito-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }
    .ramonito-toggle-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--turquoise), var(--orange-tropical, #FF8C00));
      border: 3px solid var(--yellow-sun, #FFD700);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      font-size: 1.8rem;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-left: auto;
    }
    .ramonito-toggle-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    }
    .ramonito-chatbox {
      width: 320px;
      height: 400px;
      background: rgba(26, 15, 43, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 206, 209, 0.25);
      border-radius: 16px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      transform-origin: bottom right;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .ramonito-chatbox.hidden {
      opacity: 0;
      transform: scale(0.8);
      pointer-events: none;
    }
    .ramonito-header {
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(0, 206, 209, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
    }
    .ramonito-title {
      font-weight: 700;
      color: #FFF;
      font-size: 1.1rem;
    }
    .ramonito-balance {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-free {
      background: #2ECC71;
      color: #FFF;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 12px;
      font-weight: 600;
    }
    .badge-free.hidden {
      display: none;
    }
    #ramonito-bananas-count {
      color: var(--yellow-sun, #FFD700);
      font-weight: 700;
      font-size: 0.9rem;
    }
    .ramonito-close-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.6);
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    .ramonito-close-btn:hover {
      color: #FFF;
    }
    .ramonito-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ramonito-messages::-webkit-scrollbar {
      width: 6px;
    }
    .ramonito-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
    }
    .message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.9rem;
      line-height: 1.4;
      animation: message-appear 0.3s ease forwards;
    }
    .message.assistant {
      background: rgba(0, 206, 209, 0.1);
      color: #E8F8F5;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
      border-left: 3px solid var(--turquoise);
    }
    .message.user {
      background: rgba(255, 215, 0, 0.1);
      color: #FFF9C4;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
      border-right: 3px solid var(--yellow-sun);
    }
    .message.error {
      background: rgba(229, 57, 53, 0.2);
      color: #FFCDD2;
      align-self: center;
      text-align: center;
      font-size: 0.85rem;
    }
    .ramonito-play-btn {
      display: block;
      background: var(--yellow-sun, #FFD700);
      color: #0f172a;
      text-align: center;
      padding: 10px;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      margin-top: 10px;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
      align-self: center;
      width: 90%;
    }
    .ramonito-play-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
    }
    @keyframes message-appear {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ramonito-input-area {
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 10px;
    }
    .ramonito-input-area input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      border-radius: 20px;
      padding: 10px 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    .ramonito-input-area input:focus {
      border-color: var(--turquoise);
    }
    .ramonito-input-area button {
      background: var(--turquoise);
      color: #0f172a;
      border: none;
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 50%;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.1s;
    }
    .ramonito-input-area button:hover {
      background: var(--yellow-sun, #FFD700);
      transform: scale(1.05);
    }
    .ramonito-input-area button:disabled {
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.5);
      cursor: not-allowed;
    }
    
    @media (max-width: 480px) {
      .ramonito-chatbox {
        width: calc(100vw - 40px);
        height: 60vh;
      }
    }
    
    .ramonito-product-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 206, 209, 0.2);
      border-radius: 12px;
      padding: 12px;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      animation: message-appear 0.3s ease forwards;
    }
    .ramonito-product-img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .ramonito-product-title {
      font-weight: 700;
      color: #FFF;
      font-size: 0.88rem;
    }
    .ramonito-product-desc {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.3;
    }
    .ramonito-product-disclosure {
      font-size: 0.68rem;
      color: rgba(255, 255, 255, 0.4);
      line-height: 1.2;
      font-style: italic;
    }
    .ramonito-product-btn {
      background: var(--turquoise);
      color: #0f172a;
      border: none;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      transition: background 0.2s, transform 0.1s;
    }
    .ramonito-product-btn:hover {
      background: var(--yellow-sun, #FFD700);
      transform: scale(1.02);
    }
    .ramonito-product-btn:disabled {
      background: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.4);
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Initialisation UI
  const toggleBtn = document.getElementById('ramonito-toggle');
  const closeBtn = document.getElementById('ramonito-close');
  const chatbox = document.getElementById('ramonito-chatbox');
  const messagesEl = document.getElementById('ramonito-messages');
  const inputEl = document.getElementById('ramonito-input');
  const sendBtn = document.getElementById('ramonito-send');
  const freeBadge = document.getElementById('ramonito-free-badge');
  const bananasCount = document.getElementById('ramonito-bananas-count');

  let freeQuestionsUsed = member.free_questions_used || 0;
  let bananas = member.bananas_balance || 0;

  function updateBalanceUI() {
    let freeQuestionsLeft = Math.max(0, 3 - freeQuestionsUsed);
    if (freeQuestionsLeft > 0) {
      freeBadge.classList.remove('hidden');
      freeBadge.textContent = `${freeQuestionsLeft} Gratuit${freeQuestionsLeft > 1 ? 's' : ''}`;
    } else {
      freeBadge.classList.add('hidden');
    }
    bananasCount.textContent = `🍌 ${bananas}`;
    
    // Mettre à jour l'espace membre en background si on est dessus
    const memberBananasEl = document.getElementById('member-bananas');
    if (memberBananasEl) memberBananasEl.textContent = bananas;
  }

  updateBalanceUI();

  toggleBtn.addEventListener('click', () => {
    chatbox.classList.toggle('hidden');
    if (!chatbox.classList.contains('hidden')) {
      inputEl.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatbox.classList.add('hidden');
  });

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    let freeQuestionsLeft = Math.max(0, 3 - freeQuestionsUsed);
    if (freeQuestionsLeft <= 0 && bananas < 1) {
      addMessage("Ton panier de bananes est vide 🍌 Va jouer au Perroquet Tropical pour en gagner, puis reviens me poser ta question 🦜☀️", 'assistant');
      inputEl.value = '';
      return;
    }

    // Afficher message utilisateur
    addMessage(text, 'user');
    inputEl.value = '';
    
    // Désactiver l'input pendant le chargement
    inputEl.disabled = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '💬';

    try {
      const { data: sessionData } = await window.supabaseClient.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        throw new Error("Session expirée");
      }
      
      const res = await fetch('/smart-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: text })
      });

      const result = await res.json();
      if (res.ok) {
        await addAssistantResponse(result);
        freeQuestionsUsed = result.free_questions_used;
        bananas = result.remaining_bananas;
        updateBalanceUI();
      } else {
        addMessage(result.error || result.message || "Erreur de connexion avec mon cerveau tropical !", 'assistant');
      }

    } catch (e) {
      addMessage("Erreur réseau, je ne t'ai pas entendu amigo !", 'assistant');
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      sendBtn.textContent = '💋';
      inputEl.focus();
    }
  }

  async function addAssistantResponse(result) {
    let text = result.answer;
    const matchedProducts = result.matched_products || [];
    
    // Rechercher les balises [PRODUCT:uuid] de façon ultra-robuste (tolère espaces/retours à la ligne)
    const productTagRegex = /\[PRODUCT:\s*([^\]\s]+)\s*\]/gi;
    const matches = [...text.matchAll(productTagRegex)];
    
    // Nettoyer toutes les balises du texte de réponse
    text = text.replace(productTagRegex, '').trim();
    
    // Afficher la bulle de texte épurée
    addMessage(text, 'assistant');
    
    // Si des produits ont été recommandés et sont présents dans matched_products
    for (const match of matches) {
      const productId = match[1].trim();
      const product = matchedProducts.find(p => p.id === productId);
      if (product) {
        // Créer la carte produit
        const card = document.createElement('div');
        card.className = 'ramonito-product-card';
        
        if (product.image_url) {
          const img = document.createElement('img');
          img.className = 'ramonito-product-img';
          img.src = product.image_url;
          img.alt = product.name;
          card.appendChild(img);
        }
        
        const title = document.createElement('div');
        title.className = 'ramonito-product-title';
        title.textContent = product.name;
        card.appendChild(title);
        
        if (product.description) {
          const desc = document.createElement('div');
          desc.className = 'ramonito-product-desc';
          desc.textContent = product.description;
          card.appendChild(desc);
        }
        
        if (product.disclosure) {
          const disc = document.createElement('div');
          disc.className = 'ramonito-product-disclosure';
          disc.textContent = product.disclosure;
          card.appendChild(disc);
        }
        
        const btn = document.createElement('a');
        btn.className = 'ramonito-product-btn';
        btn.style.display = 'block';
        
        if (product.is_premium && product.banana_cost > 0) {
          // Vérifier si déjà débloqué
          let isUnlocked = false;
          try {
            const { data: unlocks, error } = await window.supabaseClient
              .from('affiliate_unlocks')
              .select('id')
              .eq('product_id', product.id)
              .eq('user_id', member.id);
            if (!error && unlocks && unlocks.length > 0) {
              isUnlocked = true;
            }
          } catch (e) {
            console.error("Erreur de vérification des déblocages", e);
          }
          
          if (isUnlocked) {
            setupBuyButton(btn, product.url);
          } else {
            btn.setAttribute('href', '#');
            btn.textContent = `Débloquer pour ${product.banana_cost} bananes 🍌`;
            btn.style.cursor = 'pointer';
            
            const handleUnlock = async (e) => {
              e.preventDefault();
              if (window.ElRamon && window.ElRamon.Toast) {
                window.ElRamon.Toast.show("Déblocage demandé... 🍌", "info");
              }
              if (btn.classList.contains('disabled')) return;
              
              if (bananas < product.banana_cost) {
                if (window.ElRamon && window.ElRamon.Toast) {
                  window.ElRamon.Toast.show("Il te manque quelques bananes 🍌 Joue au jeu !", "error");
                } else {
                  alert("Il te manque quelques bananes 🍌");
                }
                return;
              }
              
              btn.classList.add('disabled');
              btn.style.pointerEvents = 'none';
              btn.style.background = 'rgba(255,255,255,0.15)';
              btn.style.color = 'rgba(255,255,255,0.4)';
              btn.textContent = 'Déblocage...';
              
              try {
                const { data: sessionData } = await window.supabaseClient.auth.getSession();
                const token = sessionData?.session?.access_token;
                if (!token) {
                  throw new Error("Session expirée. Reconnecte-toi amigo !");
                }

                const unlockResp = await fetch('/unlock-affiliate-product', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ productId: product.id })
                });
                
                const responseText = await unlockResp.text();
                let unlockResult = {};
                if (responseText) {
                  try {
                    unlockResult = JSON.parse(responseText);
                  } catch (jsonErr) {
                    console.error("Erreur de parsing JSON serveur :", responseText);
                  }
                }
                
                if (unlockResp.ok && unlockResult.success) {
                  if (window.ElRamon && window.ElRamon.Toast) {
                    window.ElRamon.Toast.show("Produit débloqué ! 🍌", "success");
                  }
                  
                  // Déduire localement et mettre à jour l'affichage
                  bananas = unlockResult.bananasBalance !== undefined ? unlockResult.bananasBalance : (bananas - product.banana_cost);
                  updateBalanceUI();
                  
                  // Ajouter un libellé visuel de succès au-dessus du bouton
                  const successDiv = document.createElement('div');
                  successDiv.className = 'ramonito-product-disclosure';
                  successDiv.style.color = '#2ECC71';
                  successDiv.style.fontWeight = '700';
                  successDiv.style.textAlign = 'center';
                  successDiv.style.marginTop = '4px';
                  successDiv.textContent = '✅ Recommandation débloquée !';
                  if (btn.parentNode) {
                    btn.parentNode.insertBefore(successDiv, btn);
                  }

                  // Transformer le bouton vers le lien d'achat
                  setupBuyButton(btn, unlockResult.url);
                } else {
                  const errMsg = unlockResult.error || unlockResult.message || "Impossible de débloquer ce lien pour l'instant 🦜 Réessaie dans un moment.";
                  if (window.ElRamon && window.ElRamon.Toast) {
                    window.ElRamon.Toast.show(errMsg, "error");
                  }
                  addMessage(`🦜 Ramonito : ${errMsg}`, 'assistant');

                  btn.textContent = `Débloquer pour ${product.banana_cost} bananes 🍌`;
                  btn.classList.remove('disabled');
                  btn.style.pointerEvents = 'auto';
                  btn.style.background = 'var(--turquoise)';
                  btn.style.color = '#0f172a';
                }
              } catch (err) {
                console.error("Erreur d'exécution de handleUnlock :", err);
                const errMsg = err.message || "Erreur réseau, impossible de débloquer ce lien.";
                if (window.ElRamon && window.ElRamon.Toast) {
                  window.ElRamon.Toast.show(errMsg, "error");
                }
                addMessage(`🦜 Ramonito : ${errMsg}`, 'assistant');

                btn.textContent = `Débloquer pour ${product.banana_cost} bananes 🍌`;
                btn.classList.remove('disabled');
                btn.style.pointerEvents = 'auto';
                btn.style.background = 'var(--turquoise)';
                btn.style.color = '#0f172a';
              }
            };
            btn.onclick = handleUnlock;
          }
        } else {
          setupBuyButton(btn, product.url);
        }
        
        card.appendChild(btn);
        messagesEl.appendChild(card);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    }
  }

  function setupBuyButton(btnElement, url) {
    btnElement.textContent = 'Voir le produit 🦜';
    btnElement.style.background = 'var(--turquoise)';
    btnElement.style.color = '#0f172a';
    btnElement.style.pointerEvents = 'auto';
    btnElement.setAttribute('href', url);
    btnElement.setAttribute('target', '_blank');
    btnElement.setAttribute('rel', 'noopener sponsored nofollow');
    
    // Remplacer par un clone pour désactiver proprement tout click event d'unlock
    const newBtn = btnElement.cloneNode(true);
    newBtn.onclick = null;
    if (btnElement.parentNode) {
      btnElement.parentNode.replaceChild(newBtn, btnElement);
    }
  }

  // Drag logic
  const container = document.getElementById('ramonito-widget');
  const header = document.querySelector('.ramonito-header');
  
  let isDragging = false;
  let offsetX, offsetY;

  function onDragStart(e) {
    if (e.target === document.getElementById('ramonito-close')) return;
    isDragging = true;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const rect = container.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    
    document.addEventListener('mousemove', onDragMove, { passive: false });
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const newLeft = clientX - offsetX;
    const newTop = clientY - offsetY;
    
    const maxX = window.innerWidth - container.offsetWidth;
    const maxY = window.innerHeight - container.offsetHeight;
    
    container.style.right = 'auto';
    container.style.bottom = 'auto';
    container.style.left = Math.min(Math.max(0, newLeft), maxX) + 'px';
    container.style.top = Math.min(Math.max(0, newTop), maxY) + 'px';
  }

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  header.addEventListener('mousedown', onDragStart);
  header.addEventListener('touchstart', onDragStart, { passive: true });
  toggleBtn.addEventListener('mousedown', onDragStart);
  toggleBtn.addEventListener('touchstart', onDragStart, { passive: true });

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
