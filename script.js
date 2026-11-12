const MENU = [
  {
    name: "Western Platter Combo",
    price: 499,
    tags: ["filling", "big", "huge", "hungry", "starving", "bestseller", "popular", "meat", "grilled", "fries", "sauces", "western", "combo", "platter", "heavy", "large", "feast", "party", "share", "non-veg", "non veg", "chicken", "beef", "appetite"],
    desc: "Grilled meats, fries, sauces. Bestseller. Great for big appetite.",
    why: {
      filling: "It's our most filling dish — perfect when you're really hungry! 🍖",
      cheap:   "It's our premium pick at ₹499, but worth every bite for the portion size.",
      premium: "Loaded with grilled meats and gourmet sauces — a true feast! 🥩",
      mood:    "Bestseller pick — guaranteed to satisfy that big craving! 🍔"
    }
  },
  {
    name: "Gourmet Meal Delight",
    price: 349,
    tags: ["balanced", "premium", "gourmet", "healthy", "chef", "seasoning", "top rated", "rated", "medium", "moderate", "mid", "quality", "elegant", "fancy", "special", "delight", "classy", "refined", "tasteful", "veg", "vegetarian", "light", "wholesome"],
    desc: "Premium ingredients, chef seasoning. Top rated. Balanced meal.",
    why: {
      filling: "A perfectly balanced meal — satisfying without being too heavy. 🍲",
      cheap:   "Mid-priced at ₹349 — premium taste without breaking the bank.",
      premium: "Chef's seasoning and top-rated quality — pure indulgence! ✨",
      mood:    "Top-rated and balanced — the smart choice for any mood! 🥗"
    }
  },
  {
    name: "Chef's Special Bowl",
    price: 299,
    tags: ["cheap", "affordable", "budget", "low", "inexpensive", "less", "cost", "money", "save", "tight", "small", "light", "quick", "snack", "handcrafted", "unique", "fresh", "special", "bowl", "chef", "creative", "innovative", "minimal", "basic", "value"],
    desc: "Handcrafted, unique, fresh. Most affordable. Chef's pick.",
    why: {
      filling: "A lighter handcrafted bowl — fresh and just-right portion. 🥣",
      cheap:   "Our most affordable dish at just ₹299 — best value pick! 💰",
      premium: "Don't let the price fool you — handcrafted with fresh ingredients! 🌿",
      mood:    "Chef's special pick — unique, fresh, and totally worth it! 🍜"
    }
  }
];

// ═══════════════════════════════════════════════
//  LOCAL AI ENGINE (no API, runs in browser)
// ═══════════════════════════════════════════════
const AI = {
  // Tokenize and clean text
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  },

  // Detect intent from user query
  detectIntent(text) {
    const t = text.toLowerCase();
    const intents = {
      cheap:    /\b(cheap|cheapest|budget|affordable|low|less|inexpensive|save|tight|under|below|economic|value)\b/,
      premium:  /\b(premium|fancy|gourmet|expensive|best|top|high.?end|luxury|special|deluxe)\b/,
      filling:  /\b(filling|big|huge|hungry|starving|heavy|large|feast|fill|stomach|appetite|hearty)\b/,
      light:    /\b(light|small|snack|quick|little|less|small)\b/,
      veg:      /\b(veg|vegetarian|plant|salad|no.?meat)\b/,
      meat:     /\b(meat|chicken|beef|grilled|non.?veg|protein|carnivore)\b/,
      healthy:  /\b(healthy|balanced|nutritious|fit|diet|wholesome|fresh)\b/,
      popular:  /\b(popular|best.?seller|bestseller|trending|recommended|top.?rated|favorite)\b/,
      chef:     /\b(chef|special|unique|creative|handcrafted|signature)\b/,
      help:     /\b(help|hi|hello|hey|hola|what|how|menu|show|tell)\b/,
      delivery: /\b(deliver|delivery|fast|time|when|arrive|long)\b/,
      offer:    /\b(offer|discount|promo|coupon|code|deal|sale|off)\b/,
      payment:  /\b(pay|payment|cash|card|upi|cod)\b/,
      thanks:   /\b(thanks|thank|thx|ty|appreciate)\b/,
      bye:      /\b(bye|goodbye|see.?you|later)\b/
    };
    const found = [];
    for (const [name, regex] of Object.entries(intents)) {
      if (regex.test(t)) found.push(name);
    }
    return found;
  },

  // Score each dish based on keyword overlap with query
  scoreDishes(text) {
    const tokens = this.tokenize(text);
    return MENU.map(dish => {
      let score = 0;
      const matched = [];
      tokens.forEach(tok => {
        dish.tags.forEach(tag => {
          if (tag === tok || tag.includes(tok) || tok.includes(tag)) {
            score += tag === tok ? 3 : 1;
            if (!matched.includes(tag)) matched.push(tag);
          }
        });
      });
      return { dish, score, matched };
    }).sort((a, b) => b.score - a.score);
  },

  // Pick best dish based on intent + keyword score
  recommend(query) {
    const intents = this.detectIntent(query);
    const scored  = this.scoreDishes(query);

    // Intent override: explicit budget/premium/filling beats keyword score
    let pick;
    let reasonKey = 'mood';
    if (intents.includes('cheap') || intents.includes('light')) {
      pick = MENU[2]; reasonKey = 'cheap';
    } else if (intents.includes('premium') || intents.includes('chef')) {
      pick = MENU[1]; reasonKey = 'premium';
    } else if (intents.includes('filling') || intents.includes('meat')) {
      pick = MENU[0]; reasonKey = 'filling';
    } else if (intents.includes('healthy') || intents.includes('veg')) {
      pick = MENU[1]; reasonKey = 'premium';
    } else if (intents.includes('popular')) {
      pick = MENU[0]; reasonKey = 'mood';
    } else if (scored[0].score > 0) {
      pick = scored[0].dish;
    } else {
      pick = MENU[1]; // safe default — balanced choice
    }

    const intro = [
      "Great choice to ask! 😋",
      "Oh, I've got just the thing! 🍽️",
      "Based on what you said,",
      "Here's my pick for you —",
      "I think you'll love this one!"
    ][Math.floor(Math.random() * 5)];

    return `${intro} I recommend the <strong>${pick.name}</strong> at ₹${pick.price}. ${pick.why[reasonKey]} ${pick.desc}`;
  },

  // Semantic-style search (matches synonyms via tags)
  search(query) {
    const scored = this.scoreDishes(query);
    const matches = scored.filter(s => s.score > 0).map(s => s.dish.name);

    if (matches.length === 0) {
      return {
        matches: [],
        explanation: `No dishes match "${query}". Try words like "cheap", "filling", "premium", "chef", or a dish name.`
      };
    }

    const intents = this.detectIntent(query);
    let explanation = `Found ${matches.length} match${matches.length > 1 ? 'es' : ''} for "${query}".`;
    if (intents.includes('cheap'))    explanation = `Showing affordable options matching "${query}".`;
    if (intents.includes('premium'))  explanation = `Showing premium options matching "${query}".`;
    if (intents.includes('filling'))  explanation = `Showing filling dishes matching "${query}".`;
    if (intents.includes('healthy'))  explanation = `Showing balanced & healthy options matching "${query}".`;

    return { matches, explanation };
  },

  // Sentiment + keyword analysis for review summary
  summarizeReviews(reviews) {
    if (reviews.length === 0) return "No reviews yet to analyze.";

    // Extract star ratings
    const stars = reviews.map(r => (r.match(/★/g) || []).length).filter(n => n > 0);
    const avg   = stars.length ? (stars.reduce((a, b) => a + b, 0) / stars.length) : 0;

    // Word frequency for highlights
    const POS = /\b(love|loved|amazing|delicious|tasty|great|excellent|wonderful|fantastic|best|awesome|fresh|perfect|yummy|good)\b/gi;
    const NEG = /\b(bad|cold|late|slow|stale|poor|worst|terrible|awful|disappointing|small)\b/gi;

    let posCount = 0, negCount = 0;
    const themes = {};
    reviews.forEach(r => {
      posCount += (r.match(POS) || []).length;
      negCount += (r.match(NEG) || []).length;
      ['delivery', 'taste', 'portion', 'price', 'fresh', 'spicy', 'service'].forEach(theme => {
        if (new RegExp('\\b' + theme + '\\b', 'i').test(r)) themes[theme] = (themes[theme] || 0) + 1;
      });
    });

    const ratingBar = '⭐'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    const sentiment = posCount > negCount * 2 ? "overwhelmingly positive"
                    : posCount > negCount ? "mostly positive"
                    : negCount > posCount ? "mixed with concerns"
                    : "balanced";

    const topTheme = Object.entries(themes).sort((a, b) => b[1] - a[1])[0]?.[0] || "taste";

    const suggestion = negCount > 0
      ? "Consider improving consistency in delivery time and portion sizes."
      : "Keep up the excellent quality — customers are loving it!";

    return `${ratingBar} <strong>${avg.toFixed(1)}/5</strong> from ${reviews.length} review${reviews.length > 1 ? 's' : ''}.<br>
            • Overall sentiment: <strong>${sentiment}</strong>.<br>
            • Customers love the <strong>${topTheme}</strong> the most.<br>
            • Suggestion: ${suggestion}`;
  },

  // Smart chatbot reply
  chat(text, history) {
    const intents = this.detectIntent(text);
    const t = text.toLowerCase();

    // Greetings
    if (/^(hi|hello|hey|hola|yo)\b/.test(t)) {
      return "Hey there! 👋 I'm FoodBot. I can help you pick a dish, check delivery time, or apply offers. What are you craving today? 🍽️";
    }
    if (intents.includes('thanks')) {
      return "You're welcome! 😊 Enjoy your meal!";
    }
    if (intents.includes('bye')) {
      return "Goodbye! 👋 Come back hungry! 🍽️";
    }
    if (intents.includes('delivery')) {
      return "We deliver in <strong>30 minutes or less</strong>! ⚡ Order anytime — fresh and fast. 🛵";
    }
    if (intents.includes('offer')) {
      return "🎉 Get <strong>20% OFF</strong> your first order with code <strong>FOODSHOP20</strong>! Apply it at checkout. 💰";
    }
    if (intents.includes('payment')) {
      return "We accept <strong>Cash on Delivery, UPI, and Cards</strong>. 💳 Pick whatever's easiest at checkout!";
    }
    if (/menu|what.*have|show.*dish|all.*food/i.test(t)) {
      return `Here's our menu: 🍽️<br>
              • <strong>Western Platter Combo</strong> — ₹499 (filling, bestseller)<br>
              • <strong>Gourmet Meal Delight</strong> — ₹349 (balanced, top-rated)<br>
              • <strong>Chef's Special Bowl</strong> — ₹299 (affordable, chef's pick)<br><br>
              Which one sounds good? 😋`;
    }
    if (/price|cost|how much/i.test(t)) {
      return "Our dishes range from <strong>₹299 to ₹499</strong>. 💰 The Chef's Special Bowl is the most affordable at ₹299!";
    }
    if (/recommend|suggest|pick|best/i.test(t)) {
      return this.recommend(text);
    }

    // Keyword score fallback — recommend best matching dish
    const scored = this.scoreDishes(text);
    if (scored[0].score > 0) {
      return this.recommend(text);
    }

    // Generic friendly fallback
    const fallbacks = [
      "I can help with: 🍽️ menu, 💰 prices, ⚡ delivery, 🎉 offers, or recommendations. What do you need?",
      "Hmm, tell me more! Are you looking for something <strong>cheap</strong>, <strong>filling</strong>, or <strong>premium</strong>? 😋",
      "I'm here to help you find the perfect dish! Try asking 'what's filling?' or 'something cheap'. 🍴"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};


// ═══════════════════════════════════════════════
//  ORDER FORM POPUP
// ═══════════════════════════════════════════════
let currentPrice = 0;
let currentQty   = 1;
let discount     = 0;

function openOrder(dishName, price) {
  document.getElementById('order-dish-label').textContent = dishName;
  document.getElementById('order-dish-name').textContent  = dishName;
  document.getElementById('order-dish-price').textContent = price;

  currentPrice = parseInt(price.replace(/[^0-9]/g, ''));
  currentQty   = 1;
  discount     = 0;

  document.getElementById('order-name').value    = '';
  document.getElementById('order-phone').value   = '';
  document.getElementById('order-address').value = '';
  document.getElementById('order-time').value    = '';
  document.getElementById('order-payment').value = '';
  document.getElementById('order-notes').value   = '';
  document.getElementById('order-promo').value   = '';
  document.getElementById('order-promo-msg').textContent = '';
  document.getElementById('order-promo-msg').className   = 'order-promo-msg';

  updateOrderTotal();

  document.getElementById('order-overlay').classList.add('open');
  document.getElementById('order-popup').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrder() {
  document.getElementById('order-overlay').classList.remove('open');
  document.getElementById('order-popup').classList.remove('open');
  document.body.style.overflow = '';
}

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('qty-value').textContent = currentQty;
  updateOrderTotal();
}

function updateOrderTotal() {
  const subtotal = currentPrice * currentQty;
  const final    = Math.max(0, subtotal - discount);
  document.getElementById('order-total').textContent       = `Total: ₹${subtotal}`;
  document.getElementById('order-final-total').textContent = `Total Payable: ₹${final}`;
}

function applyPromo() {
  const code = document.getElementById('order-promo').value.trim().toUpperCase();
  const msg  = document.getElementById('order-promo-msg');

  if (code === 'FOODSHOP20') {
    discount = Math.round(currentPrice * currentQty * 0.20);
    msg.textContent = `✅ Promo applied! You saved ₹${discount} (20% off)`;
    msg.className   = 'order-promo-msg success';
  } else if (code === '') {
    msg.textContent = '⚠️ Please enter a promo code.';
    msg.className   = 'order-promo-msg error';
    discount = 0;
  } else {
    msg.textContent = '❌ Invalid promo code. Try FOODSHOP20';
    msg.className   = 'order-promo-msg error';
    discount = 0;
  }
  updateOrderTotal();
}

function submitOrder() {
  const name    = document.getElementById('order-name').value.trim();
  const phone   = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const time    = document.getElementById('order-time').value;
  const payment = document.getElementById('order-payment').value;
  const dish    = document.getElementById('order-dish-name').textContent;

  if (!name)    { alert('Please enter your full name!');        return; }
  if (!phone)   { alert('Please enter your phone number!');     return; }
  if (!address) { alert('Please enter your delivery address!'); return; }
  if (!time)    { alert('Please select a delivery time!');      return; }
  if (!payment) { alert('Please select a payment method!');     return; }

  const final = Math.max(0, currentPrice * currentQty - discount);

  closeOrder();
  document.getElementById('order-success-msg').innerHTML =
    `<strong>${dish} x${currentQty}</strong> has been ordered successfully!<br><br>
     📍 Delivering to: ${address}<br>
     🕐 ${time}<br>
     💳 ${payment}<br>
     💰 Amount: ₹${final}`;
  document.getElementById('order-success').style.display = 'block';
  document.getElementById('order-overlay').classList.add('open');
}

function closeSuccess() {
  document.getElementById('order-success').style.display = 'none';
  document.getElementById('order-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
// ── Quick-card "See Deals" handler ─────────────
function showDeals() {
  const products = document.getElementById('products');
  if (products) products.scrollIntoView({ behavior: 'smooth' });

  let banner = document.getElementById('deal-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'deal-banner';
    banner.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #fff; padding: 16px 28px; border-radius: 12px;
      font-weight: 600; font-size: 15px; z-index: 9999;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      animation: fadeIn 0.4s ease; max-width: 90%; text-align: center;`;
    document.body.appendChild(banner);
  }
  banner.innerHTML = `🎉 <strong>20% OFF</strong> your first order! Use code <strong>FOODSHOP20</strong> at checkout 💰`;
  banner.style.display = 'block';
  clearTimeout(window.__dealTimer);
  window.__dealTimer = setTimeout(() => { banner.style.display = 'none'; }, 5000);
}


// ═══════════════════════════════════════════════
//  1. MOBILE MENU TOGGLE
// ═══════════════════════════════════════════════
const menuToggle = document.getElementById('menu-toggle');
const navMenu    = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon   = menuToggle.querySelector('.toggle-icon');
    const isOpen = navMenu.classList.contains('open');
    icon.textContent = isOpen ? '✕' : '☰';
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.querySelector('.toggle-icon').textContent = '☰';
    });
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove('open');
      menuToggle.querySelector('.toggle-icon').textContent = '☰';
    }
  });
}


// ═══════════════════════════════════════════════
//  2. AI FOOD RECOMMENDER (LOCAL)
// ═══════════════════════════════════════════════
function setMood(text) {
  const input = document.getElementById('recommender-input');
  if (input) {
    input.value = text;
    document.querySelectorAll('.mood-tag').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('onclick').includes(text.substring(0, 15)));
    });
  }
}

async function getRecommendation() {
  const input      = document.getElementById('recommender-input');
  const result     = document.getElementById('recommender-result');
  const resultText = document.getElementById('recommender-result-text');
  const loading    = document.getElementById('recommender-loading');
  const btn        = document.getElementById('recommender-btn');

  const query = input?.value.trim();
  if (!query) { input.placeholder = 'Please describe your mood or craving first!'; return; }

  if (result)  result.style.display  = 'none';
  if (loading) loading.style.display = 'flex';
  if (btn)     btn.disabled = true;

  // Small artificial delay for "thinking" feel
  await new Promise(r => setTimeout(r, 400));

  try {
    const reply = AI.recommend(query);
    if (resultText) resultText.innerHTML = reply;
    if (result)     result.style.display = 'block';
  } catch (err) {
    if (resultText) resultText.innerHTML = '❌ Something went wrong. Please try again!';
    if (result)     result.style.display = 'block';
  } finally {
    if (loading) loading.style.display = 'none';
    if (btn)     btn.disabled = false;
  }
}

const recInput = document.getElementById('recommender-input');
if (recInput) {
  recInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') getRecommendation(); });
}


// ═══════════════════════════════════════════════
//  3. SMART SEARCH (Normal + AI-local modes)
// ═══════════════════════════════════════════════
let searchMode = 'normal';

function setSearchMode(mode) {
  searchMode = mode;
  document.getElementById('mode-normal').classList.toggle('active', mode === 'normal');
  document.getElementById('mode-ai').classList.toggle('active', mode === 'ai');

  const searchInput = document.getElementById('search-input');
  const aiResult    = document.getElementById('ai-search-result');
  if (searchInput) {
    searchInput.placeholder = mode === 'ai'
      ? "Try: 'something cheap', 'filling meal', 'chef recommended'…"
      : "Search by dish name…";
  }
  if (aiResult) aiResult.style.display = 'none';
  document.querySelectorAll('.product-card').forEach(c => c.style.display = '');
  document.getElementById('no-results').style.display = 'none';
}

function normalSearch(query) {
  const cards = document.querySelectorAll('.product-card');
  let count = 0;
  cards.forEach(card => {
    const name  = card.dataset.name || '';
    const desc  = card.dataset.desc || '';
    const match = name.includes(query) || desc.includes(query);
    card.style.display = match ? '' : 'none';
    if (match) count++;
  });
  document.getElementById('no-results').style.display = count === 0 ? 'block' : 'none';
}

async function aiSearch() {
  const searchInput = document.getElementById('search-input');
  const aiResult    = document.getElementById('ai-search-result');
  const query = searchInput?.value.trim();
  if (!query) return;

  if (searchMode === 'normal') {
    normalSearch(query.toLowerCase());
    return;
  }

  aiResult.style.display = 'block';
  aiResult.innerHTML = '<span style="color:var(--gray)">🤖 AI is searching…</span>';
  document.querySelectorAll('.product-card').forEach(c => c.style.display = 'none');

  // Small delay for "thinking" feel
  await new Promise(r => setTimeout(r, 300));

  const parsed  = AI.search(query);
  const matches = parsed.matches || [];
  let count = 0;

  document.querySelectorAll('.product-card').forEach(card => {
    const name    = card.querySelector('.product-name')?.textContent || '';
    const isMatch = matches.some(m => name.toLowerCase().includes(m.toLowerCase()));
    card.style.display = isMatch ? '' : 'none';
    if (isMatch) { card.style.animation = 'fadeIn 0.3s ease'; count++; }
  });

  aiResult.innerHTML = matches.length > 0
    ? `🤖 <strong>AI found ${count} result(s):</strong> ${parsed.explanation}`
    : `🤖 ${parsed.explanation}`;

  document.getElementById('no-results').style.display = count === 0 ? 'block' : 'none';
}

const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const clearBtn = document.getElementById('search-clear');
    const q = searchInput.value.trim();
    if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
    if (searchMode === 'normal') normalSearch(q.toLowerCase());
  });
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') aiSearch(); });
}

const clearBtn = document.getElementById('search-clear');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    document.querySelectorAll('.product-card').forEach(c => c.style.display = '');
    document.getElementById('no-results').style.display = 'none';
    const aiResult = document.getElementById('ai-search-result');
    if (aiResult) aiResult.style.display = 'none';
    searchInput.focus();
  });
}


// ═══════════════════════════════════════════════
//  4. REVIEWS + AI SUMMARY (LOCAL)
// ═══════════════════════════════════════════════
let selectedStars = 0;

document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('mouseover', () => highlightStars(+star.dataset.val));
  star.addEventListener('mouseout',  () => highlightStars(selectedStars));
  star.addEventListener('click',     () => { selectedStars = +star.dataset.val; highlightStars(selectedStars); });
});

function highlightStars(count) {
  document.querySelectorAll('.star').forEach(s => {
    s.classList.toggle('active', +s.dataset.val <= count);
  });
}

function addReview(dishName) {
  const select = document.getElementById('review-dish');
  if (select) {
    for (let opt of select.options) {
      if (opt.value === dishName) { select.value = dishName; break; }
    }
  }
  document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('review-name')?.focus();
}

function submitReview() {
  const name = document.getElementById('review-name')?.value.trim();
  const dish = document.getElementById('review-dish')?.value;
  const text = document.getElementById('review-text')?.value.trim();

  if (!name || !dish || !text || selectedStars === 0) {
    alert('Please fill in all fields and select a star rating!');
    return;
  }

  const starStr = '★'.repeat(selectedStars) + '☆'.repeat(5 - selectedStars);

  const card = document.createElement('div');
  card.classList.add('review-card');
  card.innerHTML = `
    <div class="review-header">
      <div class="review-avatar">${name[0].toUpperCase()}</div>
      <div>
        <div class="review-name">${name}</div>
        <div class="review-dish">${dish}</div>
      </div>
      <div class="review-stars">${starStr}</div>
    </div>
    <p class="review-text">${text}</p>`;

  document.getElementById('reviews-grid').prepend(card);

  document.getElementById('review-name').value = '';
  document.getElementById('review-dish').value = '';
  document.getElementById('review-text').value = '';
  selectedStars = 0;
  highlightStars(0);

  alert('✅ Thank you for your review!');
}

async function summarizeReviews() {
  const btn     = document.getElementById('summarize-btn');
  const result  = document.getElementById('ai-summary-result');
  const loading = document.getElementById('summary-loading');

  const reviews = [...document.querySelectorAll('.review-card')].map(card => {
    const name  = card.querySelector('.review-name')?.textContent  || '';
    const dish  = card.querySelector('.review-dish')?.textContent  || '';
    const stars = card.querySelector('.review-stars')?.textContent || '';
    const text  = card.querySelector('.review-text')?.textContent  || '';
    return `${name} (${dish}) ${stars}: "${text}"`;
  });

  if (reviews.length === 0) { alert('No reviews to summarize yet!'); return; }

  result.style.display  = 'none';
  loading.style.display = 'flex';
  btn.disabled = true;

  // Small delay for "thinking" feel
  await new Promise(r => setTimeout(r, 500));

  try {
    const reply = AI.summarizeReviews(reviews);
    result.innerHTML     = reply;
    result.style.display = 'block';
  } catch (err) {
    result.innerHTML     = '❌ Could not summarize. Please try again!';
    result.style.display = 'block';
  } finally {
    loading.style.display = 'none';
    btn.disabled = false;
  }
}


// ═══════════════════════════════════════════════
//  5. AI CHATBOT (LOCAL)
// ═══════════════════════════════════════════════
let chatHistory = [];

const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatClose  = document.getElementById('chat-close');
const chatInput  = document.getElementById('chat-input');
const chatSend   = document.getElementById('chat-send');
const chatMsgs   = document.getElementById('chat-messages');
const toggleIcon = document.getElementById('chat-toggle-icon');
const apiNotice  = document.getElementById('chat-api-notice');

// Hide API notice — no API needed anymore
if (apiNotice) apiNotice.style.display = 'none';

if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    toggleIcon.textContent = chatWindow.classList.contains('open') ? '✕' : '🤖';
    if (chatWindow.classList.contains('open')) chatInput?.focus();
  });
}

if (chatClose) {
  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('open');
    toggleIcon.textContent = '🤖';
  });
}

if (chatSend)  chatSend.addEventListener('click', sendChatMessage);
if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });

function sendSuggestion(text) {
  chatInput.value = text;
  const suggestions = document.getElementById('chat-suggestions');
  if (suggestions) suggestions.style.display = 'none';
  sendChatMessage();
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';

  appendChatMsg(text, 'user');

  const typingId = showTyping();

  // Small delay for natural feel
  await new Promise(r => setTimeout(r, 500 + Math.random() * 400));

  try {
    const reply = AI.chat(text, chatHistory);
    removeTyping(typingId);
    appendChatMsg(reply, 'bot');
    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (err) {
    removeTyping(typingId);
    appendChatMsg('❌ Something went wrong. Please try again!', 'bot');
  }
}

function appendChatMsg(text, sender) {
  const div    = document.createElement('div');
  div.classList.add('chat-msg', sender);
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble');
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  div.appendChild(bubble);
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function showTyping() {
  const id  = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.classList.add('chat-msg', 'bot', 'chat-typing');
  div.id = id;
  div.innerHTML = `<div class="chat-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}