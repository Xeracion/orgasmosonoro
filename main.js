/* ==========================================================================
   Orgamo Sonoro: interacciones mínimas
   El scroll suave lo resuelve CSS (scroll-behavior). Aquí solo hay:
   1. Aparición suave de secciones al hacer scroll
   2. Acordeón de preguntas frecuentes
   3. Menú: despliegue en móvil y sección activa
   4. Formulario de lista de espera (placeholder hasta conectar el ESP)
   ========================================================================== */
(function () {
  'use strict';

  // Marca que hay JS: activa los estilos de aparición y el acordeón cerrado.
  // Sin JS, todo el contenido queda visible y desplegado.
  document.documentElement.classList.add('js');

  /* --- 1. Aparición de secciones con IntersectionObserver ---------------- */
  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* --- 2. Acordeón de preguntas frecuentes ------------------------------- */
  document.querySelectorAll('.faq__toggle').forEach(function (button) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));

    // Empieza cerrado cuando hay JS
    button.setAttribute('aria-expanded', 'false');
    panel.hidden = true;

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  });

  /* --- 3. Menú ---------------------------------------------------------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Al elegir una sección o pulsar Escape, el menú se cierra
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });
  }

  // Marca en el menú la sección que se está leyendo
  var navLinks = document.querySelectorAll('.nav__links a');

  if ('IntersectionObserver' in window && navLinks.length) {
    var linkFor = {};
    navLinks.forEach(function (link) {
      linkFor[link.getAttribute('href').slice(1)] = link;
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* --- 4. Formulario de lista de espera ----------------------------------
     El navegador valida el email (type="email" + required) antes de llegar aquí.
     Para conectar Brevo o Mailchimp: cambia el action del <form> en index.html
     por la URL del formulario de tu ESP y sustituye el alert por un fetch()
     a ese endpoint, o elimina este listener para usar el envío nativo. */
  var form = document.getElementById('waitlist-form');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      alert('¡Apuntado! Te avisamos pronto.');
      form.reset();
    });
  }
})();
