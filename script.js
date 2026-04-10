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
     SUPABASE — Fetch projects
  ───────────────────────────────────── */
  const SUPABASE_URL = 'https://dflkepqmjjjrafxcebew.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_NkMnn8llVfH4mH6nMR7BVw_c-9YTzHw';

  async function loadProjects() {
    const track = document.querySelector('.real-track');
    if (!track) return;

    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/projects?visible=eq.true&order=display_order.asc,created_at.asc',
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }
      );
      if (!res.ok) return;
      const projects = await res.json();
      if (!projects.length) return;

      // Vider le carousel statique
      track.innerHTML = '';

      // Generer les cartes dynamiques
      projects.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'rcard rv';
        card.dataset.project = p.slug;
        if (i > 0 && i < 6) card.classList.add('d' + i);

        const isCoral = p.is_coral;
        if (isCoral) card.dataset.coral = 'true';
        if (p.is_wide) card.style.width = '560px';

        card.innerHTML = `
          <span class="rcard-num">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="rcard-name">${p.name}</h3>
          <span class="rcard-cta">Voir le projet →</span>
        `;
        track.appendChild(card);
      });

      // Appliquer les styles coral dynamiquement
      track.querySelectorAll('[data-coral="true"]').forEach(card => {
        card.style.background = 'var(--coral)';
        card.querySelector('.rcard-num').style.color = 'rgba(255,255,255,.1)';
        card.querySelector('.rcard-name').style.color = 'white';
        card.querySelector('.rcard-cta').style.color = 'white';
      });

      // Relancer le reveal sur les nouvelles cartes
      const revealObs = new IntersectionObserver(
        (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); revealObs.unobserve(e.target); } }),
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      track.querySelectorAll('.rv').forEach(el => revealObs.observe(el));

      // Stocker les projets pour le modal
      window._projects = {};
      projects.forEach((p, i) => {
        window._projects[p.slug] = {
          num: String(i + 1).padStart(2, '0'),
          name: p.name,
          desc: p.description || '',
          tags: p.tags || [],
          image: p.image_url || ''
        };
      });

      // Init modal click handlers
      initModal();

    } catch (e) {
      // En cas d'erreur, le carousel statique reste en place
    }
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
    const imageEl = modal.querySelector('.modal-image-placeholder');

    function openModal(projectId) {
      const data = window._projects && window._projects[projectId];
      if (!data) return;

      numEl.textContent = data.num;
      titleEl.textContent = data.name;
      descEl.textContent = data.desc;
      tagsEl.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');

      if (data.image && imageEl) {
        imageEl.style.backgroundImage = `url(${data.image})`;
        imageEl.style.backgroundSize = 'cover';
        imageEl.style.backgroundPosition = 'center';
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.rcard[data-project]').forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.project));
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

/* ─────────────────────────────────────
     BRICK PARALLAX
  ───────────────────────────────────── */
  function initBrickParallax() {
    const hero = document.querySelector('.hero');
    const nav = document.getElementById('nav');
    const brick = document.querySelector('.hero-brick');
    if (!hero || !brick) return;

    const MAX_ROT = 18;
    const MAX_TRANSLATE = 30;
    let inside = false;

    function handleMove(e) {
      const rect = hero.getBoundingClientRect();
      // Only apply parallax if cursor is within hero bounds vertically
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotY = x * MAX_ROT;
      const rotX = -y * MAX_ROT;
      const tx = x * MAX_TRANSLATE;
      const ty = y * MAX_TRANSLATE;

      brick.style.transform = `perspective(1000px) translate(${tx}px, ${ty}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      inside = true;
    }

    function handleLeave(e) {
      // Reset only if truly leaving hero area (not when moving to nav overlap)
      const rect = hero.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) {
        brick.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        inside = false;
      }
    }

    hero.addEventListener('mousemove', handleMove, { passive: true });
    if (nav) nav.addEventListener('mousemove', handleMove, { passive: true });

    document.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      if (inside && (e.clientY < rect.top || e.clientY > rect.bottom)) {
        brick.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        inside = false;
      }
    }, { passive: true });
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
      time += 0.006;

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
    loadProjects();
    initBrickParallax();
    initWaves();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
