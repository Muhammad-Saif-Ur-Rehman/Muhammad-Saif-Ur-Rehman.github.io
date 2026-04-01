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
   CONTACT FORM — Web3Forms
   ================================ */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const submitBtn = contactForm.querySelector('.fsend');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.textContent = '';
    status.style.color = '';

    try {
      const formData = new FormData(contactForm);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        status.textContent = '// Message sent successfully! I\'ll get back to you shortly.';
        status.style.color = 'var(--green)';
        contactForm.reset();
      } else {
        status.textContent = '// Something went wrong. Please try again.';
        status.style.color = 'var(--red)';
      }
    } catch (err) {
      status.textContent = '// Network error. Please try again or email directly.';
      status.style.color = 'var(--red)';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message →';
  });
}

/* ================================
   SKILL TABS
   ================================ */
document.querySelectorAll('.skill-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    // Remove active from all tabs and panels
    document.querySelectorAll('.skill-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.skill-panel').forEach((p) => p.classList.remove('active'));

    // Activate clicked tab and its panel
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

/* ================================
   NAV HIRE — Glow on Scroll
   ================================ */
const navHire = document.querySelector('.nav-hire');
window.addEventListener('scroll', () => {
  if (navHire) {
    navHire.classList.toggle('glow', window.scrollY > 300);
  }
});
