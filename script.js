/* ================================
   CUSTOM CURSOR
   ================================ */
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
});

(function cursorLoop() {
  rx += (mx - rx - 17) * 0.13;
  ry += (my - ry - 17) * 0.13;
  ring.style.transform = `translate(${rx}px, ${ry}px)`;
  requestAnimationFrame(cursorLoop);
})();

document.querySelectorAll('a, button').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '46px';
    ring.style.height = '46px';
    ring.style.borderColor = 'rgba(0, 229, 255, .8)';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '34px';
    ring.style.height = '34px';
    ring.style.borderColor = 'rgba(0, 229, 255, .45)';
  });
});

/* ================================
   NAVIGATION — Scroll & Active Link
   ================================ */
const navbar = document.getElementById('navbar');
const navAs = document.querySelectorAll('.nav-links a');
const secs = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  let current = '';
  secs.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navAs.forEach((a) =>
    a.classList.toggle('active', a.getAttribute('href') === '#' + current)
  );
});

/* ================================
   NAVIGATION — Hamburger Toggle
   ================================ */
const navToggle = document.getElementById('navToggle');

navToggle.addEventListener('click', () => {
  navbar.classList.toggle('nav-open');
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navbar.classList.remove('nav-open');
  });
});

/* ================================
   SCROLL REVEAL (IntersectionObserver)
   ================================ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* ================================
   FLOATING CHAT — Toggle
   ================================ */
const chatFab = document.getElementById('chatFab');
const chatOverlay = document.getElementById('chatOverlay');

function toggleChat() {
  const isOpen = chatOverlay.classList.toggle('open');
  chatFab.classList.toggle('active', isOpen);
  if (isOpen) {
    document.getElementById('chatInput').focus();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatOverlay.classList.contains('open')) {
    toggleChat();
  }
});

/* ================================
   AI CHAT — State
   ================================
   Context is loaded from context.js
   API key is loaded from config.js
   ================================ */

let history = [];
const msgsEl = document.getElementById('chatMsgs');
const inputEl = document.getElementById('chatInput');
const sendBtn = document.getElementById('chatSend');

/* ================================
   AI CHAT — Helper Functions
   ================================ */
function appendMsg(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + (role === 'ai' ? 'ai' : 'user');
  div.innerHTML = `<div class="msg-lbl">${role === 'ai' ? 'SAIF.AI' : 'YOU'}</div>${text}`;
  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.id = 'typing';
  div.innerHTML = `<div class="msg-lbl">SAIF.AI</div><span class="td"></span><span class="td"></span><span class="td"></span>`;
  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}


async function sendMsg() {
  const q = inputEl.value.trim();
  if (!q) return;

  inputEl.value = '';
  sendBtn.disabled = true;
  document.getElementById('quickBtns').style.display = 'none';

  appendMsg('user', q);
  history.push({ role: 'user', content: q });
  showTyping();

  try {
    const res = await fetch('https://silent-bonus-6e94.saif010415.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 150,
        temperature: 0.5,
        messages: [
          { role: 'system', content: CHAT_CONTEXT },
          ...history,
        ],
      }),
    });

    const data = await res.json();
    document.getElementById('typing')?.remove();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Having trouble connecting. Reach out to Saif directly via the contact section!";

    history.push({ role: 'assistant', content: reply });
    appendMsg('ai', reply);

  } catch (e) {
    document.getElementById('typing')?.remove();
    appendMsg('ai', 'Having trouble connecting right now. Reach out to Saif directly via the contact section below!');
  }

  sendBtn.disabled = false;
  inputEl.focus();
}


function sendQuick(btn) {
  inputEl.value = btn.textContent;
  sendMsg();
}

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMsg();
});

/* ================================
   CONTACT FORM
   ================================ */
function sendContact() {
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const msg = document.getElementById('cf-msg').value.trim();
  const status = document.getElementById('form-status');

  if (!name || !email || !msg) {
    status.textContent = '// Please fill in required fields';
    status.style.color = 'var(--red)';
    return;
  }

  window.location.href = `mailto:saif010415@gmail.com?subject=${encodeURIComponent(
    subject || 'Portfolio Inquiry'
  )}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + msg)}`;

  status.textContent = '// Opening your email client...';
  status.style.color = 'var(--green)';
}
