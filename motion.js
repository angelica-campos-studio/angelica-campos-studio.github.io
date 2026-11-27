// Motion 27 nov 2026: aparición suave al hacer scroll y miniatura activa. Respeta "reducir movimiento".
(function () {
  var intro = document.querySelector('.intro');
  var reduce0 = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (intro) {
    var seen = false; try { seen = sessionStorage.getItem('introSeen'); sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    if (reduce0 || seen) { intro.remove(); document.documentElement.classList.remove('intro-hold'); }
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
      requestAnimationFrame(function () { requestAnimationFrame(place); });
      window.addEventListener('resize', place);
      var done = false;
      var end = function () {
        if (done) return; done = true;
        place();
        document.documentElement.classList.remove('intro-hold');
        intro.classList.add('out'); document.documentElement.classList.add('reveal');
        setTimeout(function () { document.documentElement.classList.remove('intro-on'); intro.remove(); }, 1150);
      };
      setTimeout(end, 3200); intro.addEventListener('click', function (e) { if (!e.target.closest('a')) end(); });
    }
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion');
    var items = document.querySelectorAll('.project .mid, .project .right > *');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); else io.observe(el); });
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
