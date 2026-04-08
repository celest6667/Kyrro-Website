/* ═══════════════════════════════════════════════════════════════════
   KYRRO — STUDIO D'AUTOMATISATION & D'IA APPLIQUÉE
   Script v8
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     LOADER
  ───────────────────────────────────── */
  function initLoader() {
    const numEl = document.querySelector('.lp-num');
    const loader = document.getElementById('loader');
    let n = 0;

    const iv = setInterval(() => {
      n = Math.min(n + Math.random() * 4 + 1, 100);
      if (numEl) numEl.textContent = Math.floor(n) + '%';
      if (n >= 100) clearInterval(iv);
    }, 30);

    setTimeout(() => {
      if (loader) loader.classList.add('done');
      document.body.classList.remove('loading');
    }, 2400);
  }

  /* ─────────────────────────────────────
     CURSOR (single rAF loop)
  ───────────────────────────────────── */
  function initCursor() {
    const dot = document.querySelector('.cur-dot');
    const ring = document.querySelector('.cur-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0;
    let dx = 0, dy = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    function tick() {
      // Le dot suit la souris quasi instantanément
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;

      // Le ring suit avec un peu de retard
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // États hover
    const interactives = document.querySelectorAll(
      'a, button, .offre-card, .pilier-card, .rcard, .pstep, .tool-pill, .cta-btn, .m-stat'
    );
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('h'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('h'));
    });
  }

  /* ─────────────────────────────────────
     NAV — état scroll
  ───────────────────────────────────── */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ─────────────────────────────────────
     REVEAL au scroll
  ───────────────────────────────────── */
  function initReveal() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('on');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.rv').forEach((el) => obs.observe(el));
  }

  /* ─────────────────────────────────────
     HIGHLIGHT manifesto
  ───────────────────────────────────── */
  function initHighlights() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => {
              e.target.querySelectorAll('.highlight').forEach((h) => h.classList.add('on'));
            }, 400);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll('.manifesto-h1, .manifesto-h2').forEach((el) => obs.observe(el));
  }

  /* ─────────────────────────────────────
     COUNT UP (stats)
  ───────────────────────────────────── */
  function initCountUp() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = +el.dataset.target;
          const suf = el.dataset.suf || '';
          let v = 0;
          const dur = 1600;
          const step = 16;
          const inc = target / (dur / step);

          const t = setInterval(() => {
            v = Math.min(v + inc, target);
            el.textContent = Math.round(v) + suf;
            if (v >= target) clearInterval(t);
          }, step);

          obs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('[data-target]').forEach((el) => obs.observe(el));
  }

  /* ─────────────────────────────────────
     PROJECT MODAL
  ───────────────────────────────────── */
  function initModal() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    const titleEl = modal.querySelector('.modal-title');
    const numEl = modal.querySelector('.modal-num');
    const descEl = modal.querySelector('.modal-desc');
    const tagsEl = modal.querySelector('.modal-tags');

    // Contenu des projets (a completer)
    const projects = {
      'urbans':     { num: '01', desc: 'Accompagnement du groupe Urban\'s dans la structuration de leurs outils internes et l\'automatisation de leurs process opérationnels.', tags: ['Outils internes', 'Automatisation', 'CRM'] },
      'mushin':     { num: '02', desc: 'Mise en place de workflows automatisés et intégration d\'outils IA pour optimiser la gestion de contenu et la collaboration.', tags: ['Automatisation', 'IA appliquée', 'Workflows'] },
      'coallis':    { num: '03', desc: 'Conception d\'un outil sur-mesure pour centraliser la gestion de projets collaboratifs et automatiser le suivi client.', tags: ['Outil interne', 'Suivi client', 'Automatisation'] },
      'cite-biere': { num: '04', desc: 'Refonte des process digitaux et création d\'outils internes pour piloter l\'activité au quotidien.', tags: ['Process', 'Outils internes', 'Design'] },
      'agiras':     { num: '05', desc: 'Automatisation des tâches administratives et intégration d\'IA pour le traitement documentaire.', tags: ['IA appliquée', 'Documents', 'Automatisation'] },
      'ot-nord':    { num: '06', desc: 'Accompagnement dans la digitalisation des process et la mise en place d\'outils de pilotage.', tags: ['Audit', 'Outils internes', 'Process'] },
      'meelo':      { num: '07', desc: 'Développement d\'outils internes sur-mesure et automatisation des workflows métier.', tags: ['Outils internes', 'Workflows', 'Automatisation'] },
      'la-maizon':  { num: '08', desc: 'Création d\'un écosystème digital complet : site vitrine, outils internes et automatisations.', tags: ['Site vitrine', 'Outils internes', 'Automatisation'] },
      'optia':      { num: '09', desc: 'Intégration d\'IA dans les process existants pour automatiser l\'analyse et la génération de contenus.', tags: ['IA appliquée', 'Automatisation', 'Contenus'] }
    };

    function openModal(projectId) {
      const data = projects[projectId];
      if (!data) return;

      numEl.textContent = data.num;
      titleEl.textContent = document.querySelector(`[data-project="${projectId}"] .rcard-name`).textContent;
      descEl.textContent = data.desc;
      tagsEl.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Ouvrir au clic sur une carte
    document.querySelectorAll('.rcard[data-project]').forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.project));
    });

    // Fermer
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ─────────────────────────────────────
     WAVE ANIMATION
  ───────────────────────────────────── */
  function initWaves() {
    const paths = document.querySelectorAll('.manifesto-wave .wave');
    if (!paths.length) return;

    // Parse les coordonnées Y de chaque path
    const waveData = [];
    paths.forEach((path, i) => {
      const d = path.getAttribute('d');
      // Extraire tous les nombres Y (positions verticales des points)
      const points = [];
      const regex = /([CLM]?\s*[\d.]+)\s+([\d.]+)/g;
      let match;
      while ((match = regex.exec(d)) !== null) {
        points.push(parseFloat(match[2]));
      }
      waveData.push({
        el: path,
        originalD: d,
        speed: 0.6 + i * 0.2,       // vitesse differente par couche
        amplitude: 8 + i * 2,       // amplitude differente
        offset: i * 0.7             // decalage de phase
      });
    });

    let time = 0;

    function animateWaves() {
      time += 0.015;

      waveData.forEach((wave) => {
        let newD = wave.originalD;
        // Modifier les coordonnees Y dans le path
        let idx = 0;
        newD = newD.replace(/([\d.]+)\s+([\d.]+)/g, (match, x, y) => {
          const yNum = parseFloat(y);
          // Ne pas animer les points du bas (y >= 195) qui forment le rectangle
          if (yNum >= 195) return match;
          const offset = Math.sin(time * wave.speed + idx * 0.3 + wave.offset) * wave.amplitude;
          idx++;
          return `${x} ${(yNum + offset).toFixed(1)}`;
        });
        wave.el.setAttribute('d', newD);
      });

      requestAnimationFrame(animateWaves);
    }

    requestAnimationFrame(animateWaves);
  }

  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  function init() {
    initLoader();
    initCursor();
    initNav();
    initReveal();
    initHighlights();
    initCountUp();
    initModal();
    initWaves();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
