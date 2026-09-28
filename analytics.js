(() => {
  const config = window.MEMENTO_ANALYTICS || {};
  const id = config.measurementId;
  const enabled = /^G-[A-Z0-9]+$/.test(id || '') && (config.allowedHosts || []).includes(location.hostname);
  const key = 'memento:analytics-consent:v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const panel = document.querySelector('#analytics-consent');
  const settings = document.querySelector('#analytics-settings');
  const status = document.querySelector('#analytics-status');
  let consent = null;
  let started = false;
  let expiresAt = 0;
  const debug = new URLSearchParams(location.search).get('analytics_debug') === '1';

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && ['granted', 'denied'].includes(saved.value) && saved.expiresAt > Date.now() && saved.expiresAt <= Date.now() + lifetime) {
        expiresAt = saved.expiresAt;
        return saved.value;
      }
    } catch { /* Stockage bloqué : choix conservé uniquement sur cette page. */ }
    return null;
  }

  function clearCookies() {
    const domains = ['', location.hostname, ...location.hostname.split('.').slice(1).map((_, i) => location.hostname.split('.').slice(i + 1).join('.'))];
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.trim().split('=')[0];
      if (name !== '_ga' && !name.startsWith('_ga_')) return;
      domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      });
    });
  }

  function start() {
    if (!enabled || consent !== 'granted' || started) return;
    started = true;
    window[`ga-disable-${id}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // Consent Mode basique : aucun script Google, ping ou cookie avant accord.
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: lifetime / 1000,
      ...(debug ? { debug_mode: true } : {})
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    // Un bloqueur ou une panne Analytics n'affecte jamais le catalogue.
    script.onerror = () => { window[`ga-disable-${id}`] = true; };
    document.head.append(script);
  }

  function updateUI() {
    if (!panel || !settings) return;
    settings.hidden = !enabled;
    panel.hidden = !enabled || consent !== null;
    status.textContent = consent === 'granted' ? 'Mesure d’audience autorisée.' : consent === 'denied' ? 'Mesure d’audience refusée.' : '';
  }

  function choose(value) {
    const wasStarted = started;
    consent = value;
    expiresAt = Date.now() + lifetime;
    try { localStorage.setItem(key, JSON.stringify({ value, expiresAt })); } catch { /* Choix en mémoire. */ }
    updateUI();
    settings?.focus();
    if (value === 'granted') start();
    else {
      window[`ga-disable-${id}`] = true;
      clearCookies();
      // Le rechargement retire aussi les écouteurs automatiques de Google.
      if (wasStarted) location.reload();
    }
  }

  window.addEventListener('memento:analytics', ({ detail }) => {
    if (!enabled || consent !== 'granted' || !started || Date.now() >= expiresAt || window[`ga-disable-${id}`] || typeof window.gtag !== 'function') return;
    // page_view appartient exclusivement à la commande config de Google.
    if (!['amazon_click', 'book_view', 'format_selected', 'category_selected'].includes(detail?.event)) return;
    try {
      window.gtag('event', detail.event, {
        ...detail.parameters,
        send_to: id,
        ...(debug ? { debug_mode: true } : {})
      });
    } catch { /* Une erreur de mesure ne doit pas bloquer un achat. */ }
  });

  document.querySelector('#analytics-accept')?.addEventListener('click', () => choose('granted'));
  document.querySelector('#analytics-reject')?.addEventListener('click', () => choose('denied'));
  settings?.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) document.querySelector('#analytics-reject')?.focus();
  });
  // Synchroniser un retrait effectué depuis un autre onglet.
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    consent = readChoice();
    if (started && consent !== 'granted') {
      window[`ga-disable-${id}`] = true;
      clearCookies();
      location.reload();
    } else { updateUI(); start(); }
  });
  function checkExpiry() {
    if (consent === null || Date.now() < expiresAt) return;
    consent = null;
    window[`ga-disable-${id}`] = true;
    clearCookies();
    if (started) location.reload();
    else updateUI();
  }
  if (enabled) {
    setInterval(checkExpiry, 60000);
    document.addEventListener('visibilitychange', checkExpiry);
  }
  consent = readChoice();
  if (enabled && consent !== 'granted') clearCookies();
  updateUI();
  start();
})();
