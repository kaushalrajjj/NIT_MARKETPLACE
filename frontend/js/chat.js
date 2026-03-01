/* Dark mode */
const html = document.documentElement;
let dark = localStorage.getItem('theme') === 'dark';
const tt = document.getElementById('themeToggle');
const ti = document.getElementById('themeIcon');

function applyTheme() {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (ti) ti.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}
applyTheme();
if (tt) tt.addEventListener('click', () => {
    dark = !dark;
    applyTheme();
});

/* Toast */
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (m) m.textContent = msg;
    if (t) {
        t.className = `toast ${type} show`;
        clearTimeout(t._t);
        t._t = setTimeout(() => t.classList.remove('show'), 3000);
    }
}

/* Select conversation */
function selectConv(el, name, initials, gradient, status, itemName, emoji, price, origPrice, itemStatus) {
    document.querySelectorAll('.conv-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    // Remove unread badge
    const badge = el.querySelector('.conv-unread');
    if (badge) badge.remove();
    const previewEl = el.querySelector('.conv-preview');
    if (previewEl) previewEl.classList.remove('unread');

    // Update chat header
    const av = document.getElementById('chatHdrAv');
    if (av) {
        av.style.background = `linear-gradient(135deg,${gradient})`;
        av.childNodes[0].textContent = initials;
        const dot = av.querySelector('.status-dot');
        if (dot) {
            dot.className = 'status-dot ' + status;
        }
    }

    const chatHdrName = document.getElementById('chatHdrName');
    if (chatHdrName) chatHdrName.textContent = name;
    const statusEl = document.getElementById('chatHdrStatus');
    if (statusEl) {
        if (status === 'online') {
            statusEl.className = 'chat-hdr-status';
            statusEl.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:var(--acc-green);display:inline-block"></span> Online now`;
        } else if (status === 'away') {
            statusEl.className = 'chat-hdr-status offline';
            statusEl.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:var(--acc);display:inline-block"></span> Away`;
        } else {
            statusEl.className = 'chat-hdr-status offline';
            statusEl.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:var(--text-3);display:inline-block"></span> Offline`;
        }
    }

    // Update item bar
    const ie = document.getElementById('itemEmoji');
    if (ie) ie.textContent = emoji;
    const iname = document.getElementById('itemName');
    if (iname) iname.textContent = itemName;
    const iprice = document.getElementById('itemPrice');
    if (iprice) iprice.innerHTML = price + (origPrice ? ` <del>${origPrice}</del>` : '');
    const isBadge = document.getElementById('itemStatus');
    if (isBadge) {
        if (itemStatus === 'available') {
            isBadge.className = 'item-bar-badge ibb-available';
            isBadge.textContent = '✔ Available';
        } else if (itemStatus === 'sold') {
            isBadge.className = 'item-bar-badge ibb-sold';
            isBadge.textContent = '✔ Sold';
        } else {
            isBadge.className = 'item-bar-badge ibb-pending';
            isBadge.textContent = '⏳ Pending';
        }
    }

    // Update info panel
    const ipav = document.getElementById('infoPanelAv');
    if (ipav) {
        ipav.style.background = `linear-gradient(135deg,${gradient})`;
        ipav.textContent = initials;
    }
    const ipname = document.getElementById('infoPanelName');
    if (ipname) ipname.textContent = name;

    // Offer modal item
    const oi = document.getElementById('offerItem');
    if (oi) oi.value = itemName;

    // On mobile: show chat
    if (window.innerWidth <= 700) {
        const cs = document.getElementById('convSidebar');
        if (cs) cs.classList.remove('open');
        const bb = document.getElementById('backBtn');
        if (bb) bb.style.display = 'flex';
    }

    // Load conversation
    loadConversation(name, initials, gradient, status);
}

/* Load conversation demo messages */
function loadConversation(name, initials, gradient, status) {
    const area = document.getElementById('messagesArea');
    if (!area) return;
    area.innerHTML = '';

    const itemName = document.getElementById('itemName') ? document.getElementById('itemName').textContent : 'this item';

    // Add date + system msg
    area.innerHTML = `<div class="date-divider">Today</div>
    <div class="sys-msg">🔒 This chat is private. Meet only on campus.</div>`;

    const msgs = [{
        out: false,
        text: `Hey! Is ${itemName} still available?`,
        time: '10:28 AM'
    },
    {
        out: true,
        text: `Yes, still available! Just listed it. Any questions?`,
        time: '10:30 AM',
        read: true
    },
    {
        out: false,
        text: `What's the condition? Any issues?`,
        time: '10:32 AM'
    },
    {
        out: true,
        text: `Excellent condition, barely used. Happy to meet on campus so you can check before buying!`,
        time: '10:34 AM',
        read: true
    },
    {
        out: false,
        text: `That sounds great. What's your best price?`,
        time: '10:35 AM'
    },
    ];

    msgs.forEach(m => {
        const av = m.out ? `<div class="msg-av-sm" style="background:linear-gradient(135deg,var(--pri),var(--acc))">RK</div>` :
            `<div class="msg-av-sm" style="background:linear-gradient(135deg,${gradient})">${initials}</div>`;
        const readHtml = m.read ? `<i class="fa-solid fa-check-double read-check" style="color:#a5b4fc"></i>` : '';
        area.innerHTML += `<div class="msg-row ${m.out ? 'out' : ''}">
        ${m.out ? '' : av}
        <div><div class="bubble ${m.out ? 'out' : 'in'}">${m.text}
          <div class="bubble-meta">${m.time} ${readHtml}</div>
        </div></div>
        ${m.out ? av : ''}
      </div>`;
    });

    // Add typing if online
    if (status === 'online') {
        area.innerHTML += `<div class="msg-row" id="typingRow">
        <div class="msg-av-sm" style="background:linear-gradient(135deg,${gradient})">${initials}</div>
        <div class="typing-indicator"><span></span><span></span><span></span></div>
      </div>`;
        // Remove typing after 3 seconds
        setTimeout(() => {
            const tr = document.getElementById('typingRow');
            if (tr) tr.remove();
            addIncomingMsg(initials, gradient, 'Sounds good! Are you flexible on the price? 😊', 'Just now');
        }, 3000);
    }
    area.scrollTop = area.scrollHeight;
}

function addIncomingMsg(initials, gradient, text, time) {
    const area = document.getElementById('messagesArea');
    if (!area) return;
    const el = document.createElement('div');
    el.className = 'msg-row';
    el.innerHTML = `<div class="msg-av-sm" style="background:linear-gradient(135deg,${gradient})">${initials}</div>
    <div><div class="bubble in">${text}<div class="bubble-meta">${time}</div></div></div>`;
    area.appendChild(el);
    area.scrollTop = area.scrollHeight;
}

/* Send message */
function sendMessage() {
    const inp = document.getElementById('msgInput');
    if (!inp) return;
    const txt = inp.value.trim();
    if (!txt) return;
    const area = document.getElementById('messagesArea');
    if (!area) return;
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    const el = document.createElement('div');
    el.className = 'msg-row out';
    el.style.animation = 'cIn .25s both';
    el.innerHTML = `<div><div class="bubble out">${escHtml(txt)}
      <div class="bubble-meta">${time} <i class="fa-solid fa-check read-check"></i></div>
    </div></div>
    <div class="msg-av-sm" style="background:linear-gradient(135deg,var(--pri),var(--acc))">RK</div>`;
    area.appendChild(el);
    inp.value = '';
    inp.style.height = '38px';
    closeReply();
    closeEmoji();
    area.scrollTop = area.scrollHeight;

    // Simulate double-tick after 1s
    setTimeout(() => {
        const check = el.querySelector('.read-check');
        if (check) check.className = 'fa-solid fa-check-double read-check';
    }, 1000);
    // Simulate reply after 2s (50% chance)
    if (Math.random() > .5) {
        const replies = ['Got it! 👍', 'Sounds good!', 'Let me think about it…', 'Can we meet tomorrow?', 'That works for me! 🤝', 'Do you have photos?', 'Is the price negotiable?'];
        setTimeout(() => {
            const activeConv = document.querySelector('.conv-item.active');
            if (!activeConv) return;
            const av = activeConv.querySelector('.conv-av');
            if (!av) return;
            const initials = av.childNodes[0].textContent.trim();
            const gradient = av.style.background.replace('linear-gradient(135deg,', '').replace(')', '');
            addIncomingMsg(initials, gradient, replies[Math.floor(Math.random() * replies.length)], 'Just now');
        }, 1800 + Math.random() * 1500);
    }
}

function escHtml(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function autoResize(el) {
    el.style.height = '38px';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/* Offer */
function sendOffer() {
    const price = document.getElementById('offerPrice').value;
    const note = document.getElementById('offerNote').value;
    if (!price) {
        showToast('Please enter an offer amount', 'error');
        return;
    }
    const modal = document.getElementById('offerModal');
    if (modal) modal.classList.remove('open');
    const area = document.getElementById('messagesArea');
    if (!area) return;
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    const id = 'ob_' + Date.now();
    const el = document.createElement('div');
    el.className = 'msg-row out';
    const itemEmoji = document.getElementById('itemEmoji') ? document.getElementById('itemEmoji').textContent : '📦';
    const offerItem = document.getElementById('offerItem') ? document.getElementById('offerItem').value : 'Item';

    el.innerHTML = `<div>
      <div class="offer-bubble out" id="${id}">
        <div class="ob-title">💰 Price Offer Sent</div>
        <div class="ob-item"><div class="ob-emoji">${itemEmoji}</div>
          <div><div class="ob-name">${offerItem}</div><div class="ob-orig">${note || 'Waiting for response…'}</div></div>
        </div>
        <div class="ob-price">₹${parseInt(price).toLocaleString('en-IN')} offered</div>
        <div style="font-size:.74rem;color:rgba(255,255,255,.6);margin-top:4px">⏳ Awaiting seller response</div>
      </div>
      <div class="bubble-meta" style="font-size:.62rem;color:var(--text-3);margin-top:4px;justify-content:flex-end;display:flex">${time}</div>
    </div>
    <div class="msg-av-sm" style="background:linear-gradient(135deg,var(--pri),var(--acc))">RK</div>`;
    area.appendChild(el);
    area.scrollTop = area.scrollHeight;
    document.getElementById('offerPrice').value = '';
    document.getElementById('offerNote').value = '';
    showToast('Offer sent successfully! 💰');
}

function closeOfferModal(e) {
    if (e.target === document.getElementById('offerModal')) document.getElementById('offerModal').classList.remove('open');
}

function acceptOffer(actionsId, price) {
    const el = document.getElementById(actionsId);
    if (el) el.innerHTML = `<div class="ob-accepted"><i class="fa-solid fa-circle-check" style="color:var(--acc-green)"></i> Offer accepted at ${price}! 🎉</div>`;
    showToast('Offer accepted! Schedule a meetup 🤝');
}

function declineOffer(actionsId) {
    const el = document.getElementById(actionsId);
    if (el) el.innerHTML = `<div class="ob-accepted" style="color:var(--acc-red)"><i class="fa-solid fa-circle-xmark"></i> Offer declined</div>`;
    showToast('Offer declined');
}

/* Reply */
function closeReply() {
    const rp = document.getElementById('replyPreview');
    if (rp) rp.classList.remove('show');
}
const messagesArea = document.getElementById('messagesArea');
if (messagesArea) {
    messagesArea.addEventListener('dblclick', e => {
        const bubble = e.target.closest('.bubble');
        if (!bubble) return;
        const txt = bubble.textContent.replace(/\d+:\d+ [AP]M.*/, '').trim().substring(0, 50);
        const rt = document.getElementById('replyText');
        if (rt) rt.textContent = txt;
        const rp = document.getElementById('replyPreview');
        if (rp) rp.classList.add('show');
        const mi = document.getElementById('msgInput');
        if (mi) mi.focus();
    });
}

/* Emoji */
function toggleEmoji() {
    const ep = document.getElementById('emojiPicker');
    if (ep) ep.classList.toggle('open');
}

function closeEmoji() {
    const ep = document.getElementById('emojiPicker');
    if (ep) ep.classList.remove('open');
}

function insertEmoji(e) {
    const inp = document.getElementById('msgInput');
    if (inp) {
        inp.value += e;
        inp.focus();
    }
    closeEmoji();
}
document.addEventListener('click', e => {
    const ew = document.querySelector('.emoji-wrap');
    if (ew && !ew.contains(e.target)) closeEmoji();
});

/* Info panel toggle */
let infoPanelVisible = true;

function toggleInfoPanel() {
    const p = document.getElementById('infoPanel');
    if (!p) return;
    infoPanelVisible = !infoPanelVisible;
    p.style.display = infoPanelVisible ? '' : 'none';
}

/* Conversation filter */
function filterConvs(btn, type) {
    document.querySelectorAll('.conv-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.conv-item').forEach(item => {
        item.style.display = (type === 'all' || item.dataset.type === type) ? '' : 'none';
    });
}

/* Search convs */
function searchConvs(q) {
    const query = q.toLowerCase();
    document.querySelectorAll('.conv-item').forEach(item => {
        const nameEl = item.querySelector('.conv-name');
        const previewEl = item.querySelector('.conv-preview');
        const name = nameEl ? nameEl.textContent.toLowerCase() : '';
        const preview = previewEl ? previewEl.textContent.toLowerCase() : '';
        item.style.display = (!query || name.includes(query) || preview.includes(query)) ? '' : 'none';
    });
}

function toggleProf() {
    const dm = document.getElementById('dropdownMenu');
    if (dm) dm.classList.toggle('open');
}

document.addEventListener('click', e => {
    if (!e.target.closest('.profile-dropdown')) {
        const dd = document.getElementById('dropdownMenu');
        if (dd) dd.classList.remove('open');
    }
});

/* Mobile */
function closeMobileConv() {
    const cs = document.getElementById('convSidebar');
    if (cs) cs.classList.add('open');
    const bb = document.getElementById('backBtn');
    if (bb) bb.style.display = 'none';
}

/* Animation keyframe */
const style = document.createElement('style');
style.textContent = '@keyframes cIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(style);

/* Initial load */
const firstConv = document.querySelector('.conv-item');
if (firstConv) firstConv.click();
