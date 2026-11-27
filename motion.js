// Portafolio · motion (27 nov 2026). Intro, aparición al hacer scroll y miniatura activa. Respeta "reducir movimiento".
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // 1. Intro
  var intro = document.querySelector('.intro');
  if (intro && reduce) { intro.remove(); root.classList.remove('intro-hold'); }
  else if (intro) {
    root.classList.add('intro-on'); window.scrollTo(0, 0);
    intro.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    var dot = intro.querySelector('.i-dot');
    var loaded = document.readyState === 'complete';
    window.addEventListener('load', function () { loaded = true; });
    var started = false, done = false, HOLD = 2300, MAX = 4500;

    var end = function () {
      if (done) return; done = true;
      var r = dot.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var W = innerWidth, H = innerHeight;
      var R = Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y))) + 2;
      var c = document.createElement('div'); c.className = 'i-circle';
      c.style.cssText = 'left:' + (x - R) + 'px;top:' + (y - R) + 'px;width:' + 2 * R + 'px;height:' + 2 * R + 'px';
      intro.insertBefore(c, intro.firstChild);
      intro.style.background = 'transparent';
      root.classList.remove('intro-hold');
      void c.offsetWidth;
      c.style.transform = 'scale(0)';
      intro.classList.add('out');
      setTimeout(function () { root.classList.remove('intro-on'); intro.remove(); }, 1000);
    };
    var go = function () {
      if (started) return; started = true;
      intro.classList.add('go');
      var t = performance.now();
      (function check() { var el = performance.now() - t; if ((el > HOLD && loaded) || el > MAX) end(); else setTimeout(check, 100); })();
    };
    var whenVisible = function (fn) {
      if (document.visibilityState === 'visible') return fn();
      document.addEventListener('visibilitychange', function v() { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', v); fn(); } });
    };
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 250); })]).then(function () {
      whenVisible(function () { requestAnimationFrame(function () { requestAnimationFrame(go); }); });
    });
    intro.addEventListener('click', function () { whenVisible(go); end(); });
  }

  // 2. Aparición al hacer scroll (una vez por carga, solo transform y opacity)
  if (!reduce && hasIO) {
    root.classList.add('motion');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.project .mid, .project .right > *').forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); else io.observe(el);
    });
  }

  // 3. Miniatura activa en el índice (solo escritorio)
  if (hasIO && window.matchMedia('(min-width: 768px)').matches) {
    var grid = document.querySelector('.left .cards'), cards = {};
    document.querySelectorAll('.card').forEach(function (c) { cards[c.getAttribute('href').slice(1)] = c; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        for (var k in cards) { cards[k].classList.toggle('active', k === e.target.id); cards[k].toggleAttribute('aria-current', k === e.target.id); }
        if (grid) grid.classList.add('has-active');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.project').forEach(function (p) { spy.observe(p); });
  }
})();
