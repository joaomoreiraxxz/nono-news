// ==========================================
// Nono News — App Completo
// Projeto de Reportagem do 9º MA + MB
// ==========================================
import { getNews, getFeatured, submitRating } from './data.js';

document.addEventListener('DOMContentLoaded', () => {

  // ========== 1. LOADER ==========
  const loader = document.getElementById('loader');
  // A nova animação tem sequência até ~3.2s (scan line em 2.3s + duração 0.7s + margem)
  // Saída: translateY(-100%) leva 0.9s no CSS
  const dismissLoader = () => {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 1000);
  };
  window.addEventListener('load', () => {
    setTimeout(dismissLoader, 3400);
  });
  // Fallback absoluto caso a página demore muito
  setTimeout(dismissLoader, 6000);


  // ========== COUNTER ANIMADO (Rede Adventista) ==========
  function animateCounter(el, target, duration = 2000) {
    const isYear = target > 1800 && target < 2100;
    const start = isYear ? target - 50 : 0;
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * ease);
      if (target >= 1000000) {
        el.textContent = (current / 1000000).toFixed(1) + 'M+';
      } else if (target >= 1000 && !isYear) {
        el.textContent = (current / 1000).toFixed(0) + 'K+';
      } else {
        el.textContent = current + (isYear ? '' : '+');
      }
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.rede-stat-num[data-target]').forEach(el => counterObserver.observe(el));



  // ========== 2. NAVBAR SCROLL ==========
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 60));


  // ========== 3. MOBILE MENU ==========
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  }));


  // ========== CARROSSEL DA ESCOLA ==========
  const carouselTrack = document.getElementById('escola-track');
  if (carouselTrack) {
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('#escola-dots .carousel-dot');
    const counterEl = document.getElementById('escola-current');
    const prevBtn = document.getElementById('escola-prev');
    const nextBtn = document.getElementById('escola-next');
    let current = 0;
    let autoTimer = null;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      carouselTrack.style.transform = `translateX(-${current * 100}%)`;
      if (counterEl) counterEl.textContent = current + 1;
    }

    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Init
    slides[0].classList.add('active');
    startAuto();

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    dots.forEach(dot => dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      resetAuto();
    }));

    // Swipe touch
    let touchStartX = 0;
    carouselTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carouselTrack.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
    });
  }

  // ========== 4. TYPEWRITER ANIMATION ==========
  const phrases = [
    'Feito por alunos, para a comunidade escolar.',
    'Reportagens do 9º ano MA e MB.',
    'Eventos, esportes, projetos e muito mais.',
    'Escola Adventista Centro América — Araés, Cuiabá.',
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typewriterEl = document.getElementById('typewriter-text');

  function typewrite() {
    if (!typewriterEl) return;
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      typewriterEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(typewrite, 2000); // pausa no final
        return;
      }
      setTimeout(typewrite, 50);
    } else {
      typewriterEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typewrite, 400);
        return;
      }
      setTimeout(typewrite, 30);
    }
  }
  setTimeout(typewrite, 1800); // começa após animação do hero


  // ========== 5. PARTICLES ==========
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--dur', (6 + Math.random() * 12) + 's');
      p.style.setProperty('--delay', (Math.random() * 8) + 's');
      p.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
      p.style.width = p.style.height = (2 + Math.random() * 5) + 'px';
      particlesContainer.appendChild(p);
    }
  }


  // ========== 6. SCROLL REVEAL ==========
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));


  // ========== 7. FEED UNIFICADO (Destaques + Notícias) ==========
  const feedGrid = document.getElementById('feed-grid');
  const feedHeroCard = document.getElementById('feed-hero-card');
  const feedEmpty = document.getElementById('feed-empty');
  let allPosts = [];
  let currentFilter = 'all';

  // Carrega os dados da API (assíncrono)
  async function loadFeedData() {
    try {
      const [featured, news] = await Promise.all([getFeatured(), getNews()]);
      allPosts = [...featured.map(f => ({ ...f, isFeatured: true })), ...news];
      renderFeed('all');
    } catch (err) {
      console.error('Erro ao carregar feed:', err);
      feedEmpty.style.display = 'flex';
    }
  }

  function renderFeed(filter) {
    feedGrid.innerHTML = '';
    feedHeroCard.style.display = 'none';
    feedHeroCard.innerHTML = '';

    const filtered = filter === 'all' ? allPosts : allPosts.filter(p => p.category === filter);

    if (filtered.length === 0) {
      feedEmpty.style.display = 'flex';
      return;
    }
    feedEmpty.style.display = 'none';

    // Primeiro post vira hero card
    const hero = filtered[0];
    feedHeroCard.style.display = 'flex';
    feedHeroCard.style.backgroundImage = hero.image ? `url('${hero.image}')` : '';
    feedHeroCard.style.backgroundColor = !hero.image ? 'var(--primary)' : '';
    // Preview: max 200 chars do summary
    const heroPreview = (hero.summary || '').length > 200
      ? hero.summary.substring(0, 200) + '...'
      : (hero.summary || '');
    feedHeroCard.innerHTML = `
      <div class="feed-hero-overlay"></div>
      <div class="feed-hero-body">
        ${hero.isFeatured ? '<span class="tag">DESTAQUE</span>' : (hero.category ? `<span class="tag">${hero.category}</span>` : '')}
        <h2>${hero.title}</h2>
        ${heroPreview ? `<p>${heroPreview}</p>` : ''}
        <button class="news-card-read-more" style="color:var(--gold-light);margin-top:12px;" data-article-id="${hero.id}">
          Ler mais
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    `;
    // Tornar hero card clicável
    feedHeroCard.addEventListener('click', (e) => {
      if (!e.target.closest('.news-card-read-more')) return;
      openArticleModal(hero);
    });

    // Resto vira cards no grid
    filtered.slice(1).forEach((post, i) => {
      const card = document.createElement('article');
      card.className = 'news-card glass reveal delay-' + ((i % 5) + 1);
      // Preview: max 120 chars
      const preview = (post.summary || '').length > 120
        ? post.summary.substring(0, 120) + '...'
        : (post.summary || '');
      card.innerHTML = `
        <div class="news-card-img">
          ${post.image
            ? `<img src="${post.image}" alt="${post.title}" loading="lazy">`
            : `<div class="news-card-placeholder"></div>`}
          ${post.category ? `<span class="news-card-category">${post.category}</span>` : ''}
          ${post.isFeatured ? '<span class="news-card-category" style="background:var(--gold);color:var(--primary-dark);">DESTAQUE</span>' : ''}
        </div>
        <div class="news-card-body">
          <h3>${post.title}</h3>
          ${preview ? `<p class="news-card-preview">${preview}</p>` : ''}
          <div class="news-card-footer">
            <span class="news-date">${post.date || ''}</span>
            <button class="news-card-read-more" data-article-id="${post.id}">
              Ler mais
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      `;
      // Clique no card abre o artigo
      card.addEventListener('click', () => openArticleModal(post));
      feedGrid.appendChild(card);
    });

    document.querySelectorAll('.news-card.reveal').forEach(el => revealObserver.observe(el));
    setupAllRatings();
  }

  // Inicia o carregamento
  loadFeedData();
  loadTestimonials();

  async function loadTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    try {
      const res = await fetch('/api/ratings?is_site=true&limit=6');
      const ratings = await res.json();
      if (!ratings.length) {
        grid.innerHTML = '<div class="testim-empty">Ainda n\u00e3o h\u00e1 avalia\u00e7\u00f5es dispon\u00edveis.</div>';
        return;
      }
      grid.innerHTML = ratings.map(r => {
        const initial = (r.name || 'A')[0].toUpperCase();
        const starsStr = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
        return `
          <div class="testimonial-card">
            <div class="testim-header">
              <div class="testim-name-wrap">
                <div class="testim-avatar">${initial}</div>
                <div class="testim-name">${r.name}</div>
              </div>
              <span class="testim-stars">${starsStr}</span>
            </div>
            ${r.comment ? `<div class="testim-comment">&ldquo;${r.comment}&rdquo;</div>` : ''}
            <div class="testim-date">${r.date}</div>
          </div>
        `;
      }).join('');
    } catch (err) {
      grid.innerHTML = '<div class="testim-empty" style="color:#ff6b6b">Erro ao carregar avalia\u00e7\u00f5es.</div>';
    }
  }

  // ========== MODAL DE ARTIGO ==========
  const articleModal    = document.getElementById('article-modal');
  const articleModalClose = document.getElementById('article-modal-close');
  const articleModalBack  = document.getElementById('article-modal-backdrop');

  function openArticleModal(post) {
    if (!articleModal) return;
    // Preenche o conteúdo
    const img = document.getElementById('article-modal-img');
    if (post.image) {
      img.src = post.image;
      img.alt = post.title;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
    document.getElementById('article-modal-title').textContent = post.title || '';
    document.getElementById('article-modal-category').textContent = post.category || '';
    document.getElementById('article-modal-date').textContent = post.date || '';

    // Autor
    const authorEl = document.getElementById('article-modal-author');
    if (post.author) {
      const init = post.author[0].toUpperCase();
      authorEl.innerHTML = `
        <div class="article-modal-author-avatar">${init}</div>
        <span>Por <strong>${post.author}</strong></span>
      `;
      authorEl.style.display = 'flex';
    } else {
      authorEl.style.display = 'none';
    }

    // Conteúdo completo
    document.getElementById('article-modal-content').textContent = post.summary || 'Sem conteúdo disponível.';

    // Abre modal
    articleModal.setAttribute('aria-hidden', 'false');
    articleModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    articleModalClose.focus();
  }

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove('open');
    articleModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (articleModalClose) articleModalClose.addEventListener('click', closeArticleModal);
  if (articleModalBack)  articleModalBack.addEventListener('click', closeArticleModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && articleModal && articleModal.classList.contains('open')) closeArticleModal();
  });


  // Category filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFeed(btn.dataset.cat);
    });
  });


  // ========== 8. RATING SYSTEM ==========
  setupAllRatings();

  function setupAllRatings() {
    document.querySelectorAll('.stars-group, .rate-stars').forEach(group => {
      if (group.dataset.init) return;
      group.dataset.init = '1';
      const stars = group.querySelectorAll('.star-btn');
      const type = group.dataset.type;

      stars.forEach(star => {
        star.addEventListener('mouseenter', () => highlightStars(stars, star.dataset.value));
        star.addEventListener('click', () => {
          group.dataset.rating = star.dataset.value;
          highlightStars(stars, star.dataset.value);
        });
      });
      group.addEventListener('mouseleave', () => highlightStars(stars, group.dataset.rating || 0));
    });

    const submitBtn = document.getElementById('rate-submit');
    if (submitBtn && !submitBtn.dataset.init) {
      submitBtn.dataset.init = '1';
      submitBtn.addEventListener('click', async () => {
        const nameInput = document.getElementById('rate-name');
        const commentInput = document.getElementById('rate-textarea');
        const rateStars = document.querySelector('.rate-stars[data-type="site"]');
        const rating = rateStars ? rateStars.dataset.rating : null;
        const msg = document.getElementById('rate-msg');

        if (!nameInput || !nameInput.value.trim()) {
          msg.textContent = 'Por favor, digite seu nome.';
          msg.style.color = '#ff6b6b';
          nameInput.focus();
          return;
        }
        if (!rating) {
          msg.textContent = 'Por favor, selecione uma nota nas estrelas.';
          msg.style.color = '#ff6b6b';
          return;
        }

        try {
          // Envia avaliação para a API
          const result = await submitRating({
            name: nameInput.value.trim(),
            comment: commentInput ? commentInput.value.trim() : '',
            stars: parseInt(rating),
          });

          msg.style.color = 'var(--gold-light)';
          msg.textContent = result.message;
          nameInput.value = '';
          if (commentInput) commentInput.value = '';
          rateStars.dataset.rating = '';
          highlightStars(rateStars.querySelectorAll('.star-btn'), 0);
        } catch (err) {
          msg.style.color = '#ff6b6b';
          msg.textContent = 'Erro ao enviar avaliação. Tente novamente.';
          console.error(err);
        }
      });
    }
  }

  function highlightStars(stars, val) {
    stars.forEach(s => s.classList.toggle('filled', parseInt(s.dataset.value) <= parseInt(val)));
  }


  // ========== 9. SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });



  // ========== 10. ADMIN SECRETO (5 cliques no footer logo) ==========
  let adminClicks = 0;
  const footerLogo = document.getElementById('footer-logo');
  if (footerLogo) {
    footerLogo.style.cursor = 'pointer';
    footerLogo.addEventListener('click', () => {
      adminClicks++;
      if (adminClicks >= 5) { adminClicks = 0; window.location.href = 'https://admin.bytecrm.online/'; }
    });
  }


  // ========== 11. MODAL VÍDEO — CONHEÇA NOSSA ESCOLA ==========
  const VIDEO_ID = 'q_R-ZKMCUq4';
  const videoModal  = document.getElementById('video-modal');
  const vmodalCard  = document.getElementById('vmodal-card');
  const vmodalClose = document.getElementById('vmodal-close');
  const vmodalBack  = document.getElementById('vmodal-backdrop');
  const vmodalIframe = document.getElementById('vmodal-iframe');
  const btnOpenVideo = document.getElementById('btn-open-video');

  const buildYTUrl = () =>
    `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&color=white&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;

  function openVideoModal() {
    // Carrega o iframe apenas agora (lazy load)
    vmodalIframe.src = buildYTUrl();
    videoModal.setAttribute('aria-hidden', 'false');
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // trava scroll da página
    vmodalClose.focus();
  }

  function closeVideoModal() {
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Para o vídeo removendo o src após a animação de saída terminar
    setTimeout(() => {
      vmodalIframe.src = '';
    }, 500);
  }

  if (btnOpenVideo)  btnOpenVideo.addEventListener('click',  openVideoModal);
  if (vmodalClose)   vmodalClose.addEventListener('click',   closeVideoModal);
  if (vmodalBack)    vmodalBack.addEventListener('click',    closeVideoModal);

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('open')) closeVideoModal();
  });

});
