/* ============================================================
   세종에듀 검색광고 랜딩 — 탭 · 견적 폼 연결 · 전환 클릭 수집
   (공통 동작은 script.js — 프로그레스 바, 모바일 CTA 바, 스무스 스크롤)
============================================================ */

(() => {
  /* 스모어 견적 폼 주소 — 폼을 만든 뒤 여기에 붙여 넣습니다.
     비어 있으면 견적 버튼은 카카오톡 상담으로 연결됩니다. */
  const SMORE_FORM_URL = '';
  const KAKAO_URL = 'http://pf.kakao.com/_FKvwn/chat';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* -------- 전환 클릭 수집 --------
     네이버 전환추적 스크립트를 받으면 이 함수 안에서 호출합니다. */
  function trackConversion(kind) {
    if (typeof window.sejongTrack === 'function') window.sejongTrack(kind);
  }

  document.addEventListener('DOMContentLoaded', () => {

    /* -------- 1. 견적 버튼 → 스모어 폼 (없으면 카톡) -------- */
    // 폼이 있으면 모든 견적 버튼이 폼을 바로 엽니다.
    // 폼이 없으면 위쪽 버튼은 문의 섹션으로 스크롤하고, 문의 섹션 버튼은 카톡으로 갑니다.
    $$('[data-quote]').forEach(a => {
      if (!SMORE_FORM_URL && !a.closest('#contact')) return;
      a.href = SMORE_FORM_URL || KAKAO_URL;
      a.target = '_blank';
      a.rel = 'noopener';
    });

    $$('[data-track]').forEach(a => {
      a.addEventListener('click', () => trackConversion(a.dataset.track));
    });

    /* -------- 2. 과정 탭 (광고그룹별 #앵커로 바로 열기) -------- */
    const tabs = $$('.lp-tab');
    const panels = $$('.lp-panel');

    const activate = (tab, focus = false) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(p => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        activate(tabs[(i + dir + tabs.length) % tabs.length], true);
      });
    });

    const fromHash = () => {
      const id = location.hash.slice(1);
      const tab = tabs.find(t => t.getAttribute('aria-controls') === id);
      if (!tab) return;
      activate(tab);
      const top = $('#courses').getBoundingClientRect().top + window.pageYOffset - 88;
      window.scrollTo({ top });
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  });
})();
