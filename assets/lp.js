/* ============================================================
   세종에듀 검색광고 랜딩 — 시즌 D-day · 업종별 자가진단 · 과정 탭
   (공통 동작은 script.js — 프로그레스 바, 헤더 음영, 스무스 스크롤)
   견적·카톡·전화 링크는 HTML에 직접 들어 있어 JS 없이도 동작합니다.
============================================================ */

(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  document.addEventListener('DOMContentLoaded', () => {

    /* -------- 1. 올해 이수 마감 D-day (12/31 기준) -------- */
    const dday = $('#lpDday');
    if (dday) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), 11, 31);
      const days = Math.round((end - today) / 86400000);
      dday.textContent = days > 0 ? `D-${days}` : 'D-day';
    }

    /* -------- 2. 업종별 자가진단 -------- */
    const quiz = $('#lpQuiz');
    if (quiz) {
      const render = () => {
        const industry = quiz.industry.value;
        const small = quiz.size.value === 'small';
        const privacy = quiz.privacy.value === 'yes';
        const show = {
          harassment: true,
          bullying: true,
          disability: true,
          privacy,
          violence: industry === '공공·비영리·기타',
        };
        let count = 0;
        $$('#lpQuizList li').forEach(li => {
          li.hidden = !show[li.dataset.course];
          if (!li.hidden) count++;
        });
        $('#lpQuizCount').textContent = count;
        $('#lpQuizLabel').textContent = `${industry} · ${small ? '5인 미만' : '5인 이상'}`;
        $('#lpQuizNote').hidden = !small;
      };
      quiz.addEventListener('change', render);
      render();
    }

    /* -------- 3. 과정 탭 (광고그룹별 #앵커로 바로 열기) -------- */
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
