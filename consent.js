/* Consent management for mmanufactory.eu: tracking is opt-in. */
(function () {
  'use strict';

  var storageKey = 'mm_cookie_consent_v2';
  var choice = null;
  var trackingLoaded = false;

  try {
    var stored = localStorage.getItem(storageKey);
    if (stored === 'accepted' || stored === 'declined') choice = stored;
  } catch (e) {
    // Browsers may restrict storage; the choice still works for this page.
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  var denied = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };
  var granted = {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  };

  window.gtag('consent', 'default', denied);

  function hasConsent() {
    return choice === 'accepted';
  }

  function startTracking() {
    if (trackingLoaded || !hasConsent()) return;
    trackingLoaded = true;

    window.gtag('consent', 'update', granted);
    window.gtag('js', new Date());
    window.gtag('config', 'G-BZXYH7S8QH');
    window.gtag('config', 'AW-18008605575');

    var googleScript = document.createElement('script');
    googleScript.async = true;
    googleScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-BZXYH7S8QH';
    document.head.appendChild(googleScript);

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', '787011006090664');
    window.fbq('track', 'PageView');
  }

  function clearAnalyticsCookies() {
    var names = document.cookie.split(';').map(function (c) {
      return c.split('=')[0].trim();
    }).filter(function (name) {
      return /^(_ga(?:_|$)|_gid$|_gcl_|_fbp$|_fbc$)/.test(name);
    });
    var host = window.location.hostname;
    var domains = ['', '; domain=' + host, '; domain=.' + host.replace(/^www\./, '')];
    names.forEach(function (name) {
      domains.forEach(function (domain) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + domain;
      });
    });
  }

  function banner(visible) {
    var el = document.getElementById('cookieConsent');
    if (el) el.style.display = visible ? 'block' : 'none';
  }

  function choose(nextChoice) {
    var wasLoaded = trackingLoaded;
    choice = nextChoice;
    try { localStorage.setItem(storageKey, nextChoice); } catch (e) {}

    if (nextChoice === 'accepted') {
      startTracking();
    } else if (wasLoaded) {
      window.gtag('consent', 'update', denied);
      clearAnalyticsCookies();
      window.location.reload();
      return;
    }
    banner(false);
  }

  window.acceptCookies = function () { choose('accepted'); };
  window.declineCookies = function () { choose('declined'); };
  window.openCookieSettings = function () { banner(true); };
  window.ManufactoryConsent = { hasConsent: hasConsent };

  if (hasConsent()) startTracking();

  function initBanner() {
    banner(choice !== 'accepted' && choice !== 'declined');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
