/* ============================================================
   세종에듀 안내 페이지 — 2026 Modern Interactions
============================================================ */

(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {

    /* -------- 1. Hero 현재 월 자동 표시 -------- */
    const monthLine = $('#hero-month-line');
    if (monthLine) {
      const month = new Date().getMonth() + 1;
      monthLine.textContent = `${month}월 교육 시작 전`;
    }

    /* -------- 2. 스크롤 프로그레스 바 + 헤더 음영 -------- */
    const progress = $('#scrollProgress');
    const header = $('#siteHeader');
    const mobileCta = $('#mobileCtaBar');
    let ticking = false;

    const onScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progress) progress.style.width = `${Math.min(100, pct)}%`;
      if (header) header.classList.toggle('is-scrolled', scrollTop > 8);
      // 모바일 CTA bar: hero 지나면 표시, 페이지 끝 쯤 (footer 근처) 숨김
      if (mobileCta && window.innerWidth <= 900) {
        const show = scrollTop > 400 && pct < 95;
        mobileCta.classList.toggle('is-visible', show);
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
    onScroll();

    /* -------- 3. Reveal on scroll -------- */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      reveals.forEach(el => revealObserver.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('is-visible'));
    }

    /* -------- 4. 사이드 네비 스크롤스파이 -------- */
    const sections = $$('.section[id]');
    const navLinks = $$('.side-nav a[data-target]');
    const navByTarget = new Map();
    navLinks.forEach(a => navByTarget.set(a.dataset.target, a));

    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(a => a.classList.remove('is-active'));
            const active = navByTarget.get(id);
            if (active) active.classList.add('is-active');
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
      sections.forEach(s => spy.observe(s));
    }

    /* -------- 5. 아코디언 (그룹별 한 개만 열림) -------- */
    $$('.accordion').forEach(group => {
      const items = $$('.acc-item', group);
      items.forEach(item => {
        const head = $('.acc-head', item);
        if (!head) return;
        head.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          items.forEach(other => {
            other.classList.remove('is-open');
            const h = $('.acc-head', other);
            if (h) h.setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            item.classList.add('is-open');
            head.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });

    /* -------- 6. 모바일 메뉴 드로어 -------- */
    const menuToggle = $('.menu-toggle');
    if (menuToggle) {
      const drawer = document.createElement('div');
      drawer.className = 'mobile-drawer';
      const ul = document.createElement('ul');
      navLinks.forEach(a => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.innerHTML = a.innerHTML;
        link.addEventListener('click', () => {
          drawer.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
        li.appendChild(link);
        ul.appendChild(li);
      });
      drawer.appendChild(ul);
      document.body.appendChild(drawer);

      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const opened = drawer.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
      document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !menuToggle.contains(e.target)) {
          drawer.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* -------- 7. 스무스 스크롤 (헤더 오프셋 보정) -------- */
    const headerHeight = header?.offsetHeight || 72;
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });

    /* -------- 8. 카운터 애니메이션 -------- */
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.counter, 10) || 0;
            animateCounter(el, target);
            counterObserver.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      $$('[data-counter]').forEach(el => counterObserver.observe(el));
    } else {
      $$('[data-counter]').forEach(el => {
        const target = parseInt(el.dataset.counter, 10) || 0;
        const unit = $('.unit', el);
        el.textContent = target.toString();
        if (unit) el.appendChild(unit);
      });
    }

    function animateCounter(el, target) {
      const duration = 1400;
      const start = performance.now();
      const unit = $('.unit', el);
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = current.toString();
        if (unit) el.appendChild(unit);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    /* -------- 9. Mock window fill 애니메이션 트리거 -------- */
    if ('IntersectionObserver' in window) {
      const mockObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            mockObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      $$('.mock-window').forEach(el => mockObserver.observe(el));
    } else {
      $$('.mock-window').forEach(el => el.classList.add('is-visible'));
    }

    /* -------- 10. Hero 마우스 패럴렉스 (데스크톱만) -------- */
    const parallaxContainer = $('[data-parallax]');
    if (parallaxContainer && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
      const heroSection = $('.section--hero');
      const items = $$('[data-parallax-item]', heroSection);
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        items.forEach(item => {
          const depth = parseFloat(item.dataset.depth) || 0.3;
          const tx = x * 24 * depth;
          const ty = y * 24 * depth;
          const existingRotate = item.style.getPropertyValue('--base-rotate') || '0deg';
          item.style.transform = `translate(${tx}px, ${ty}px)`;
        });
      });
      heroSection.addEventListener('mouseleave', () => {
        items.forEach(item => { item.style.transform = ''; });
      });
    }
  });
})();
