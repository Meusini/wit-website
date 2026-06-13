/* ============================================================
   Wit — gedeelde site-scripts
   Mobiele navigatie: hamburger + schermvullend menu,
   opgebouwd uit de bestaande nav-links zodat elke pagina
   automatisch een werkend mobiel menu krijgt.
   ============================================================ */
(function () {
  function init() {
    var nav = document.querySelector('.nav');
    if (!nav || nav.dataset.mobileReady) return;
    nav.dataset.mobileReady = '1';

    var header = document.querySelector('.header');
    var left = nav.querySelector('.nav-left');
    var right = nav.querySelector('.nav-right');
    var brandImg = nav.querySelector('.brand img');

    /* ---- Hamburger-knop ---- */
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Menu openen');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span>';
    nav.insertBefore(toggle, nav.firstChild);

    /* ---- Linkgroepen verzamelen ----
       Loopt over de directe kinderen zodat een dropdown (.nav-dd)
       als één item met subcategorieën bewaard blijft i.p.v. dat de
       submenu-links als losse hoofditems verschijnen. ---- */
    function collect(scope) {
      var out = [];
      if (!scope) return out;
      Array.prototype.forEach.call(scope.children, function (node) {
        if (node.classList && node.classList.contains('nav-dd')) {
          var mainA = node.querySelector('a');
          if (!mainA) return;
          var subs = [];
          node.querySelectorAll('.nav-dd-menu a').forEach(function (a) {
            subs.push({ href: a.getAttribute('href') || '#', text: a.textContent.trim() });
          });
          out.push({
            href: mainA.getAttribute('href') || '#',
            text: mainA.textContent.trim(),
            active: mainA.style.color !== '' || mainA.style.fontWeight !== '',
            children: subs
          });
        } else if (node.tagName === 'A') {
          if (node.classList.contains('nav-cart')) return; /* tas niet als tekstlink */
          out.push({ href: node.getAttribute('href') || '#', text: node.textContent.trim(), active: node.style.color !== '' || node.style.fontWeight !== '', children: [] });
        }
      });
      return out;
    }
    var primary = collect(left);
    var secondary = collect(right);

    /* ---- Overlay-menu opbouwen ---- */
    var menu = document.createElement('div');
    menu.className = 'mobile-menu';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-hidden', 'true');

    var html = '<div class="mm-top">';
    if (brandImg) {
      var brandLink = brandImg.closest('a');
      var brandHref = brandLink ? brandLink.getAttribute('href') : 'index.html';
      html += '<a href="' + brandHref + '" class="mm-brand"><img src="' + brandImg.getAttribute('src') + '" alt="Wit" /></a>';
    }
    html += '<button type="button" class="mm-close" aria-label="Menu sluiten">Sluiten <span>&#215;</span></button>';
    html += '</div>';

    html += '<nav class="mm-primary">';
    primary.concat(secondary).forEach(function (l) {
      html += '<a href="' + l.href + '"' + (l.active ? ' class="is-active"' : '') + '>' + l.text + '</a>';
      if (l.children && l.children.length) {
        html += '<div class="mm-sub">';
        l.children.forEach(function (c) {
          html += '<a href="' + c.href + '">' + c.text + '</a>';
        });
        html += '</div>';
      }
    });
    html += '</nav>';

    html += '<div class="mm-foot">' +
      '<span>Serpentstraat 15, Gent</span>' +
      '<span>Leopoldstraat 8, Antwerpen</span>' +
      '<a href="mailto:hallo@witthelabel.be">hallo@witthelabel.be</a>' +
      '</div>';

    menu.innerHTML = html;
    document.body.appendChild(menu);

    /* ---- Openen / sluiten ---- */
    var closeBtn = menu.querySelector('.mm-close');
    function open() {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.classList.add('is-open');
      document.documentElement.classList.add('menu-open');
    }
    function close() {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('is-open');
      document.documentElement.classList.remove('menu-open');
    }
    toggle.addEventListener('click', function () {
      menu.classList.contains('open') ? close() : open();
    });
    closeBtn.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && menu.classList.contains('open')) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   Wit — winkelmandje (localStorage) + live nav-badge
   ============================================================ */
window.WitCart = (function () {
  var KEY = 'wit-cart-v1';
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('wit-cart-change'));
  }
  function same(a, b) { return a.id === b.id && (a.variant || '') === (b.variant || ''); }
  function get() { return read(); }
  function count() { return read().reduce(function (s, i) { return s + i.qty; }, 0); }
  function subtotal() { return read().reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
  function add(item) {
    var items = read();
    var found = null;
    for (var i = 0; i < items.length; i++) { if (same(items[i], item)) { found = items[i]; break; } }
    if (found) { found.qty += (item.qty || 1); }
    else {
      items.push({
        id: item.id, name: item.name, variant: item.variant || '',
        price: item.price, img: item.img || '', imgPos: item.imgPos || '50% 30%',
        qty: item.qty || 1
      });
    }
    write(items);
  }
  function setQty(id, variant, qty) {
    var items = read().map(function (i) {
      if (i.id === id && (i.variant || '') === (variant || '')) i.qty = qty;
      return i;
    }).filter(function (i) { return i.qty > 0; });
    write(items);
  }
  function remove(id, variant) {
    write(read().filter(function (i) { return !(i.id === id && (i.variant || '') === (variant || '')); }));
  }
  function clear() { write([]); }

  /* Eenmalig een demo-mandje vullen zodat de flow meteen zichtbaar is */
  if (localStorage.getItem(KEY) === null) {
    localStorage.setItem(KEY, JSON.stringify([
      { id: 'lou-set', name: 'Lou set', variant: 'S', price: 640, img: 'images/look-04.jpg', imgPos: '50% 30%', qty: 1 },
      { id: 'nora-knit', name: 'Nora knit', variant: '38', price: 180, img: 'images/look-02.jpg', imgPos: '50% 26%', qty: 1 }
    ]));
  }

  function refreshBadges() {
    var n = count();
    document.querySelectorAll('.nav-cart').forEach(function (c) {
      if (c.getAttribute('href') === '#' || !c.getAttribute('href')) c.setAttribute('href', 'mandje.html');
      c.setAttribute('data-count', n);
      c.setAttribute('aria-label', 'Mandje — ' + n + ' artikel' + (n === 1 ? '' : 'en'));
      var span = c.querySelector('.nav-cart-count');
      if (span) span.textContent = n;
    });
  }
  document.addEventListener('wit-cart-change', refreshBadges);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshBadges);
  } else { refreshBadges(); }

  return { get: get, count: count, subtotal: subtotal, add: add, setQty: setQty, remove: remove, clear: clear };
})();
