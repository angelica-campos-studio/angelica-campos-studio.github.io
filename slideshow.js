// Carrusel igual que el de cargo (opciones leídas de su slick el 9 oct 2026):
// autoplay cada 2,5 s, deslizamiento horizontal de 0,5 s, infinito, flechas, sin puntos.
// Añadido por accesibilidad (WCAG 2.2.2): se pausa con el ratón encima, con foco de teclado, fuera de pantalla
// y con "reducir movimiento"; el lector de pantalla solo lee la diapositiva visible.
(function () {
  var AUTOPLAY = 2500, SPEED = 500;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.slideshow').forEach(function (show) {
    var track = show.querySelector('.track');
    var n = track.children.length;
    // clones a los dos lados para el bucle infinito
    var first = track.children[0].cloneNode(true), last = track.children[n - 1].cloneNode(true);
    [first, last].forEach(function (c) { c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; }); });
    track.appendChild(first);
    track.insertBefore(last, track.children[0]);

    var i = 1, busy = false, visible = false, focused = false, hovered = false, timer = null;
    var all = track.children;
    function place(anim) {
      track.style.transition = anim ? 'transform ' + SPEED + 'ms ease' : 'none';
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      for (var k = 0; k < all.length; k++) {
        var on = k === i;
        all[k].setAttribute('aria-hidden', on ? 'false' : 'true');
        all[k].querySelectorAll('img').forEach(function (im) { if (Math.abs(k - i) <= 1) im.loading = 'eager'; });
      }
    }
    function go(k) {
      if (busy) return;
      busy = true; i = k; place(!reduce);
      setTimeout(function () {
        if (i === 0) { i = n; place(false); }
        if (i === n + 1) { i = 1; place(false); }
        busy = false;
      }, reduce ? 0 : SPEED);
      restart();
    }
    function restart() {
      clearInterval(timer);
      if (!reduce && visible && !focused && !hovered && !document.hidden) timer = setInterval(function () { go(i + 1); }, AUTOPLAY);
    }
    place(false);

    show.querySelector('.prev').addEventListener('click', function () { go(i - 1); });
    show.querySelector('.next').addEventListener('click', function () { go(i + 1); });
    show.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    });
    show.addEventListener('focusin', function () { focused = true; restart(); });
    show.addEventListener('focusout', function () { focused = false; restart(); });
    show.addEventListener('mouseenter', function () { hovered = true; restart(); });
    show.addEventListener('mouseleave', function () { hovered = false; restart(); });
    document.addEventListener('visibilitychange', restart);

    var x0 = null;
    show.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    show.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });

    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting; restart();
    }, { threshold: 0.25 }).observe(show);
  });
})();
