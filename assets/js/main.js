(function () {
  'use strict';

  // Menu mobilne
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
  }

  // Rok w stopce
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Filtry portfolio
  var filters = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('.pf-card');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(' ');
        card.hidden = cat !== 'all' && cats.indexOf(cat) === -1;
      });
    });
  });

  // Galeria (lightbox)
  var lb = document.getElementById('lightbox');
  if (!lb || !cards.length) return;

  var lbImg = lb.querySelector('.lb-stage img');
  var lbCount = lb.querySelector('.lb-count');
  var lbPrev = lb.querySelector('.lb-prev');
  var lbNext = lb.querySelector('.lb-next');
  var lbPlay = lb.querySelector('.lb-play');
  var lbInfo = lb.querySelector('.lb-info');
  var lbLink = lb.querySelector('.lb-link');
  var images = [];
  var index = 0;
  var lastFocus = null;

  function show(i) {
    index = (i + images.length) % images.length;
    lbImg.src = images[index];
    var multi = images.length > 1;
    lbPrev.hidden = lbNext.hidden = !multi;
    lbCount.textContent = multi ? (index + 1) + ' / ' + images.length : '';
  }

  function open(card) {
    lastFocus = document.activeElement;
    images = card.getAttribute('data-images').split(',');
    var title = card.querySelector('h2').textContent;
    lbImg.alt = card.querySelector('.pf-thumb img').alt;

    lbInfo.innerHTML = '';
    ['.pf-date', 'h2', '.pf-text', '.tags'].forEach(function (sel) {
      var el = card.querySelector(sel);
      if (el) lbInfo.appendChild(el.cloneNode(true));
    });

    var video = card.getAttribute('data-video');
    var fb = card.getAttribute('data-fb');
    lbPlay.hidden = !video;
    if (video) lbPlay.href = video;
    lbLink.href = video || fb;
    lbLink.querySelector('span').textContent = video ? 'Obejrzyj wideo na Facebooku' : 'Zobacz wpis na Facebooku';
    lb.setAttribute('aria-label', title);

    show(0);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }

  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }

  cards.forEach(function (card) {
    card.querySelectorAll('.pf-thumb, .pf-more').forEach(function (el) {
      el.addEventListener('click', function () { open(card); });
    });
  });

  lbPrev.addEventListener('click', function () { show(index - 1); });
  lbNext.addEventListener('click', function () { show(index + 1); });
  lb.querySelectorAll('.lb-close').forEach(function (b) { b.addEventListener('click', close); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && images.length > 1) show(index - 1);
    else if (e.key === 'ArrowRight' && images.length > 1) show(index + 1);
    else if (e.key === 'Tab') {
      // pułapka fokusu wewnątrz okna
      var f = Array.prototype.filter.call(
        lb.querySelectorAll('button, a[href]'),
        function (el) { return !el.hidden && el.offsetParent !== null; }
      );
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Przesuwanie palcem
  var startX = null;
  var stage = lb.querySelector('.lb-stage');
  stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (startX === null || images.length < 2) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
