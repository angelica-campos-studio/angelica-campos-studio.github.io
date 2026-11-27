// Motion 27 nov 2026: aparición suave al hacer scroll y miniatura activa. Respeta "reducir movimiento".
(function () {
  var intro = document.querySelector('.intro');
  var reduce0 = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (intro) {
    if (reduce0) { intro.remove(); document.documentElement.classList.remove('intro-hold'); }
    else {
      document.documentElement.classList.add('intro-on');
      var dot = intro.querySelector('.i-dot');
      var place = function () {
        if (!dot) return;
        var r = dot.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        var W = window.innerWidth, H = window.innerHeight;
        var R = Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y))) + 2;
        intro.style.setProperty('--dx', x + 'px'); intro.style.setProperty('--dy', y + 'px');
        intro.style.setProperty('--dr', R + 'px'); intro.style.setProperty('--dd', '0px');
      };
      var done = false;
      var end = function () {
        if (done) return; done = true;
        intro.style.transition = 'none'; place(); void intro.offsetWidth; intro.style.transition = '';
        document.documentElement.classList.remove('intro-hold');
        intro.classList.add('out'); document.documentElement.classList.add('reveal');
        setTimeout(function () { document.documentElement.classList.remove('intro-on'); intro.remove(); }, 1150);
      };
      var started = false;
      var go = function () { if (started) return; started = true; intro.classList.add('go'); setTimeout(end, 3200); };
      var ready = function () {
        var start = function () { requestAnimationFrame(function () { requestAnimationFrame(go); }); };
        if (document.visibilityState === 'visible') start();
        else document.addEventListener('visibilitychange', function v() { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', v); start(); } });
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else ready();
      setTimeout(function () { if (document.visibilityState === 'visible') go(); }, 1500);
      intro.addEventListener('click', function (e) { if (!e.target.closest('a')) end(); });
    }
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion');
    var items = document.querySelectorAll('.project .mid, .project .right > *');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('in');
        else if (e.boundingClientRect.top > 0) e.target.classList.remove('in');
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); io.observe(el); });
  }
  var cards = {};
  document.querySelectorAll('.card').forEach(function (c) { cards[c.getAttribute('href').slice(1)] = c; });
  if (!('IntersectionObserver' in window) || !window.matchMedia('(min-width: 768px)').matches) return;
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(cards).forEach(function (k) { cards[k].classList.toggle('active', k === e.target.id); cards[k].toggleAttribute('aria-current', k === e.target.id); });
      var g = document.querySelector('.left .cards'); if (g) g.classList.add('has-active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.project').forEach(function (p) { spy.observe(p); });
})();
