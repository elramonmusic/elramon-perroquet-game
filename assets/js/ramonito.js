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
          <div class="message assistant">Hola amigo ! Je suis Ramonito. Une question musicale ou besoin d'aide avec ton compte ? 🌴</div>
        </div>
        <div class="ramonito-input-area">
          <input type="text" id="ramonito-input" placeholder="Pose ta question..." autocomplete="off">
          <button id="ramonito-send">Envoyer</button>
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
      bottom: 120px;
      right: 20px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    }
    .ramonito-toggle-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--turquoise), var(--orange));
      border: 3px solid rgba(255, 255, 255, 0.2);
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
      background: rgba(26, 26, 46, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
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
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
      color: var(--yellow);
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
      background: rgba(46, 204, 113, 0.15);
      color: #E8F8F5;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .message.user {
      background: rgba(255, 215, 0, 0.15);
      color: #FFF9C4;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .message.error {
      background: rgba(229, 57, 53, 0.2);
      color: #FFCDD2;
      align-self: center;
      text-align: center;
      font-size: 0.85rem;
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
      padding: 0 15px;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .ramonito-input-area button:hover {
      background: #20b8a5;
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

  let freeQuestions = member.free_questions_remaining || 0;
  let bananas = member.bananas_balance || 0;

  function updateBalanceUI() {
    if (freeQuestions > 0) {
      freeBadge.classList.remove('hidden');
      freeBadge.textContent = `${freeQuestions} Gratuit${freeQuestions > 1 ? 's' : ''}`;
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

    if (freeQuestions <= 0 && bananas < 1) {
      addMessage("Tu n'as plus de bananes, amigo ! Joue au jeu pour en gagner d'autres ! 🍌", 'assistant');
      inputEl.value = '';
      return;
    }

    // Afficher message utilisateur
    addMessage(text, 'user');
    inputEl.value = '';
    
    // Désactiver l'input pendant le chargement
    inputEl.disabled = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '...';

    try {
      const { data: sessionData } = await window.supabaseClient.auth.getSession();
      
      const res = await fetch(`${window.supabaseClient.supabaseUrl}/functions/v1/smart-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({ question: text })
      });

      const result = await res.json();
      
      if (res.ok) {
        addMessage(result.answer, 'assistant');
        freeQuestions = result.free_questions_remaining;
        bananas = result.remaining_bananas;
        updateBalanceUI();
      } else {
        addMessage(result.message || "Erreur de connexion avec mon cerveau tropical !", 'assistant');
      }

    } catch (e) {
      addMessage("Erreur réseau, je ne t'ai pas entendu amigo !", 'assistant');
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      sendBtn.textContent = 'Envoyer';
      inputEl.focus();
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
