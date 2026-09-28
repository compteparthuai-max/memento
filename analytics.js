(() => {
  const config = window.MEMENTO_ANALYTICS || {};
  const id = config.measurementId;
  const enabled = /^G-[A-Z0-9]+$/.test(id || '') && (config.allowedHosts || []).includes(location.hostname);
  if (!enabled || window.__mementoGA4Started) return;
  window.__mementoGA4Started = true;
  const debug = new URLSearchParams(location.search).get('analytics_debug') === '1';

  // Démarrage immédiat demandé par l'éditeur, sans interface de consentement.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
  });
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 180 * 24 * 60 * 60,
    ...(debug ? { debug_mode: true } : {})
  });

  window.addEventListener('memento:analytics', ({ detail }) => {
    if (window[`ga-disable-${id}`] || typeof window.gtag !== 'function') return;
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

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.onerror = () => { window[`ga-disable-${id}`] = true; };
  document.head.append(script);
})();
