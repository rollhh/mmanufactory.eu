/* Manufactory language choice is remembered locally; URL holds the language. */
(function () {
  var current = document.documentElement.lang.toLowerCase();
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('[data-switch-language]');
    if (link) {
      try { localStorage.setItem('mm_site_language', link.getAttribute('data-switch-language')); } catch (e) {}
    }
    document.querySelectorAll('details.language-picker[open]').forEach(function (picker) {
      if (!picker.contains(event.target)) picker.open = false;
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      document.querySelectorAll('details.language-picker[open]').forEach(function (picker) {
        picker.open = false;
        var summary = picker.querySelector('summary');
        if (summary) summary.focus();
      });
    }
  });
  if (location.pathname === '/' && current === 'lv') {
    try {
      var saved = localStorage.getItem('mm_site_language');
      if (saved === 'en' || saved === 'ru') location.replace('/' + saved + '/');
    } catch (e) {}
  }
})();