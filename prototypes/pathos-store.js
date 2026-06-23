/* PATHOS — shared storefront settings store (plain JS).
   Drives admin-controlled features on the public site via localStorage,
   so changes saved in the admin panel show up on the storefront (same origin). */
(function () {
  const KEYS = { menu: 'pathos.menu', popup: 'pathos.popup', ann: 'pathos.announcement', messages: 'pathos.messages', subscribers: 'pathos.subscribers', products: 'pathos.products', orders: 'pathos.orders', campaigns: 'pathos.campaigns', season: 'pathos.season' };

  // Seasonal themes — shared by admin (picker) and storefront (application). Minimal: one accent + a small motif.
  const SEASONS = {
    none:      { label: 'Year-round', occasion: 'Signature gold',     hex: '#b1894e', rgb: '177 137 78',  motif: 'diamond', greeting: '' },
    christmas: { label: 'Christmas',  occasion: 'Festive evergreen',   hex: '#2e6249', rgb: '46 98 73',    motif: 'star',    greeting: 'Season\u2019s greetings \u2014 free gift wrapping on every order' },
    easter:    { label: 'Easter',     occasion: 'Soft spring lilac',   hex: '#8a6f9e', rgb: '138 111 158', motif: 'egg',     greeting: 'Happy Easter \u2014 new spring pieces have landed' },
    halloween: { label: 'Halloween',  occasion: 'Autumn amber',        hex: '#b5652f', rgb: '181 101 47',  motif: 'moon',    greeting: 'Autumn at the atelier \u2014 handmade in warm tones' },
    summer:    { label: 'Summer',     occasion: 'Aegean blue',         hex: '#2f86a3', rgb: '47 134 163',  motif: 'sun',     greeting: 'Summer by the Aegean \u2014 free EU shipping over 100\u20ac' },
  };
  const MOTIF = {
    diamond: '<path d="M12 3 19 12 12 21 5 12Z"/>',
    star:    '<path d="M12 2.5 13.7 9.4 20.5 11 13.7 12.6 12 21.5 10.3 12.6 3.5 11 10.3 9.4Z"/>',
    egg:     '<path d="M12 3c3.6 2.6 5 8 5 10.4a5 5 0 0 1-10 0C7 11 8.4 5.6 12 3Z"/>',
    moon:    '<path d="M17 3.5a7.2 7.2 0 1 0 3.4 11.8A8 8 0 0 1 17 3.5Z"/>',
    sun:     '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"/>',
  };
  function seasonMotif(key, size, color) {
    return '<svg width="' + (size || 14) + '" height="' + (size || 14) + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || 'currentColor') + '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + (MOTIF[key] || MOTIF.diamond) + '</svg>';
  }
  // Date windows for auto-switching (month*100 + day, inclusive). First match wins.
  const SEASON_WINDOWS = [
    { key: 'christmas', from: 1201, to: 1231, when: '1 \u2013 31 December' },
    { key: 'halloween', from: 1008, to: 1101, when: '8 Oct \u2013 1 Nov' },
    { key: 'easter',    from: 325,  to: 415,  when: '25 Mar \u2013 15 Apr' },
    { key: 'summer',    from: 601,  to: 831,  when: '1 Jun \u2013 31 Aug' },
  ];
  function seasonForDate(d) {
    d = d || new Date();
    const md = (d.getMonth() + 1) * 100 + d.getDate();
    for (let i = 0; i < SEASON_WINDOWS.length; i++) {
      const w = SEASON_WINDOWS[i];
      if (md >= w.from && md <= w.to) return w.key;
    }
    return 'none';
  }
  // Resolve the season actually in effect (honors the auto-by-date toggle).
  function effectiveSeason(s) {
    s = s || load('season');
    return (s && s.auto) ? seasonForDate() : ((s && s.key) || 'none');
  }

  const defaults = {
    menu: [
      { id: 'about',       label: 'About',                 type: 'page',        enabled: true,  system: true },
      { id: 'collections', label: 'Collections',           type: 'collections', enabled: true,  system: true },
      { id: 'jewelry',     label: 'Jewelry & Accessories', type: 'page',        enabled: true,  system: true },
    ],
    popup: {
      enabled: true,
      heading: 'The Summer Edit is here',
      message: 'Enjoy 15% off your first order — handmade Aegean pieces, made to last.',
      code: 'AEGEAN15',
      button: 'Shop the offer',
      delay: 1.2,            // seconds before it appears
      frequency: 'session',  // 'session' | 'every'
    },
    announcement: {
      enabled: true,
      text: 'FREE SHIPPING ACROSS GREECE & THE EU FOR ORDERS ABOVE 100€',
    },
    messages: [
      { id: 'm-seed-2', name: 'Marco Bianchi', email: 'marco.b@example.it', topic: 'Order', message: 'Hi! Is the Hematite Pendant available in a longer 50cm chain? Would love to order if so.', ts: Date.now() - 1000 * 60 * 60 * 5, read: false },
      { id: 'm-seed-1', name: 'Chloé Dubois', email: 'chloe.d@example.fr', topic: 'Sizing', message: 'Bonjour, do the Moonstone stacking rings run true to size? I usually wear a 52 (EU).', ts: Date.now() - 1000 * 60 * 60 * 28, read: true },
    ],
    subscribers: [
      { id: 's-seed-4', email: 'eleni.m@example.com',   source: 'Welcome popup', ts: Date.now() - 1000 * 60 * 60 * 9 },
      { id: 's-seed-3', email: 's.andersen@example.de', source: 'Footer',        ts: Date.now() - 1000 * 60 * 60 * 30 },
      { id: 's-seed-2', email: 'yara.h@example.nl',     source: 'Footer',        ts: Date.now() - 1000 * 60 * 60 * 52 },
      { id: 's-seed-1', email: 'niamh.ob@example.ie',   source: 'Checkout',      ts: Date.now() - 1000 * 60 * 60 * 96 },
    ],
    // Shared product catalog — read by BOTH the admin (Products view) and the storefront.
    // `art` is one of the line-art keys both files define: bracelet, necklace, earrings, ring, shell, drop.
    products: [
      { id: 'PB-014', name: 'Aegean Beaded Bracelet',    art: 'bracelet', collection: 'Aegean',         price: 52, stock: 38, status: 'Active', sold: 214, material: 'Hematite · 24K plate',  swatches: ['#141414', '#5b5b5b', '#b8946b'], desc: 'Smooth hematite beads strung by hand on a 24K-gold-plated thread — a weighty, everyday talisman from the Aegean shore.' },
      { id: 'PN-031', name: 'Hematite Pendant Necklace', art: 'necklace', collection: 'Hematite',       price: 80, stock: 12, status: 'Active', sold: 168, material: 'Hematite · Silver 925', swatches: ['#4a4742', '#a9824a', '#cdb78f'], desc: 'A faceted hematite drop on a fine sterling chain that catches the light with every movement.' },
      { id: 'PE-022', name: 'Coral Drop Earrings',       art: 'earrings', collection: 'Shells & Corals', price: 45, stock: 4,  status: 'Active', sold: 142, material: 'Coral · Gold fill',    swatches: ['#9b5a4a', '#a9824a', '#e6d6b8'], desc: 'Mediterranean coral drops on gold-filled hooks — light as air, warm in tone.' },
      { id: 'PR-009', name: 'Chalcedony Signet Ring',    art: 'ring',     collection: 'Gemstones',       price: 60, stock: 0,  status: 'Active', sold: 97,  material: 'Chalcedony · Silver 925', swatches: ['#7d9b94', '#a9824a', '#4a4742'], desc: 'A soft blue chalcedony set flush in a hand-finished sterling signet.' },
      { id: 'PS-046', name: 'Spiral Shell Pendant',      art: 'shell',    collection: 'Shells & Corals', price: 36, stock: 56, status: 'Active', sold: 203, material: 'Shell · Gold fill',    swatches: ['#e6d6b8', '#a9824a', '#9b5a4a'], desc: 'A tiny spiral shell cast in gold-fill, strung on an adjustable cord.' },
      { id: 'PD-017', name: 'Paua Teardrop Pendant',     art: 'drop',     collection: 'Minerals',        price: 42, stock: 21, status: 'Active', sold: 88,  material: 'Paua · 24K plate',     swatches: ['#5a6f6a', '#a9824a', '#4a4742'], desc: 'Iridescent paua shell framed in 24K plate — no two are exactly alike.' },
      { id: 'PB-051', name: 'Lava Stone Wrap',           art: 'bracelet', collection: 'Minerals',        price: 34, stock: 9,  status: 'Active', sold: 76,  material: 'Lava · Leather',       swatches: ['#141414', '#6f6f6f', '#a98c66'], desc: 'Matte volcanic lava beads on a soft leather wrap — grounding and unisex.' },
      { id: 'PR-028', name: 'Moonstone Stacking Ring',   art: 'ring',     collection: 'Bridal',          price: 48, stock: 0,  status: 'Draft',  sold: 0,   material: 'Moonstone · Gold 14K', swatches: ['#dfe6ea', '#a9824a', '#cdb78f'], desc: 'A milky moonstone on a slim 14K band, made to stack or stand alone.' },
      { id: 'PN-040', name: 'Olive Branch Choker',       art: 'necklace', collection: 'Aegean',          price: 58, stock: 31, status: 'Active', sold: 119, material: 'Brass · 24K plate',    swatches: ['#a9824a', '#5b5b5b', '#cdb78f'], desc: 'An olive-branch motif in gold-plated brass — a nod to Athenian summers.' },
    ],
    orders: [],
    campaigns: [
      { id: 'c-seed-1', subject: 'Summer arrivals — Thálassa', name: 'Thálassa', launch: 'Fri · 22 May', recipients: 4, ts: Date.now() - 1000 * 60 * 60 * 24 * 13, status: 'Sent' },
    ],
    season: { key: 'none', useGreeting: false, auto: false },
  };

  // Bank-transfer (deposit) details shown at checkout when the customer chooses to pay by bank.
  const BANK = {
    beneficiary: 'PATHOS by Yeralis — Y. Yeralis',
    bank: 'Piraeus Bank',
    iban: 'GR16 0110 1250 0000 0001 2345 678',
    bic: 'PIRBGRAA',
    note: 'Use your order number as the payment reference. We ship as soon as the deposit clears (usually 1\u20132 business days).',
  };

  // Discount codes. The active welcome-popup code is honored automatically (percentage read from its message),
  // plus any codes listed here. checkDiscount() returns { code, pct, label } or null.
  const DISCOUNTS = {
    WELCOME10:  { pct: 0.10, label: '10% off' },
    ATELIER20:  { pct: 0.20, label: '20% off' },
    FREESHIP:   { pct: 0,    label: 'Free shipping', freeShip: true },
  };
  function checkDiscount(code) {
    code = (code || '').trim().toUpperCase();
    if (!code) return null;
    try {
      const p = load('popup');
      if (p && p.code && p.code.toUpperCase() === code) {
        const m = (p.message || '').match(/(\d{1,2})\s*%/);
        const pct = m ? Number(m[1]) / 100 : 0.15;
        return { code: code, pct: pct, label: Math.round(pct * 100) + '% off' };
      }
    } catch (e) {}
    if (DISCOUNTS[code]) return Object.assign({ code: code }, DISCOUNTS[code]);
    return null;
  }

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function load(key) {
    try {
      const raw = localStorage.getItem(KEYS[key]);
      if (!raw) return clone(defaults[key]);
      const val = JSON.parse(raw);
      // shallow-merge object defaults so new fields appear
      if (!Array.isArray(defaults[key]) && val && typeof val === 'object') {
        return Object.assign(clone(defaults[key]), val);
      }
      return val;
    } catch (e) {
      return clone(defaults[key]);
    }
  }

  function save(key, val) {
    try {
      localStorage.setItem(KEYS[key], JSON.stringify(val));
      window.dispatchEvent(new CustomEvent('pathos-store', { detail: { key } }));
    } catch (e) {}
  }

  function reset(key) {
    try { localStorage.removeItem(KEYS[key]); window.dispatchEvent(new CustomEvent('pathos-store', { detail: { key } })); } catch (e) {}
  }

  function pushMessage(item) {
    const list = load('messages');
    const msg = Object.assign({ id: 'm-' + Date.now().toString(36), ts: Date.now(), read: false }, item);
    list.unshift(msg);
    save('messages', list);
    return msg;
  }

  function pushSubscriber(item) {
    const list = load('subscribers');
    const email = (item.email || '').trim().toLowerCase();
    if (!email) return null;
    if (list.some((s) => s.email.toLowerCase() === email)) return null; // dedupe
    const sub = Object.assign({ id: 's-' + Date.now().toString(36), ts: Date.now(), source: 'Footer' }, item, { email });
    list.unshift(sub);
    save('subscribers', list);
    return sub;
  }

  function pushOrder(item) {
    const list = load('orders');
    const order = Object.assign({ id: '#PA-' + Math.floor(2842 + Math.random() * 900), ts: Date.now(), payment: 'Paid', fulfillment: 'Unfulfilled', online: true }, item);
    list.unshift(order);
    save('orders', list);
    return order;
  }

  function pushCampaign(item) {
    const list = load('campaigns');
    const c = Object.assign({ id: 'c-' + Date.now().toString(36), ts: Date.now(), status: 'Sent' }, item);
    list.unshift(c);
    save('campaigns', list);
    return c;
  }

  window.PathosStore = { KEYS, SEASONS, SEASON_WINDOWS, BANK, DISCOUNTS, defaults, load, save, reset, clone, seasonMotif, seasonForDate, effectiveSeason, checkDiscount, pushMessage, pushSubscriber, pushOrder, pushCampaign };
})();
