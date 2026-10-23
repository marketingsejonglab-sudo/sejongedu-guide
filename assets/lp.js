/* ============================================================
   세종에듀 검색광고 랜딩 — 업종별 자가진단 · 과정 탭
   (공통 동작은 script.js — 프로그레스 바, 헤더 음영, 스무스 스크롤,
    모바일 하단 바 노출)
   견적·카톡·전화 링크는 HTML에 직접 들어 있어 JS 없이도 동작합니다.
============================================================ */

(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  document.addEventListener('DOMContentLoaded', () => {

    /* -------- 1. 업종별 자가진단 -------- */
    // 업종별로 함께 확인할 교육 (이 페이지 과정 외)
    const ALSO = {
      '제조업': '산업안전보건교육',
      '건설·부동산업': '산업안전보건교육',
      '의료·보건·복지업': '신고의무자교육 (아동·노인·장애인학대 등)',
      '교육·서비스업': '신고의무자교육 (아동학대 등)',
    };
    const quiz = $('#lpQuiz');
    if (quiz) {
      const render = () => {
        const industry = quiz.industry.value;
        const small = quiz.size.value === 'small';
        const privacy = quiz.privacy.value === 'yes';
        const show = {
          harassment: true,
          bullying: !small,            // 근로기준법 제76조의2는 상시 5인 이상 사업장 적용
          disability: true,
          privacy,
          violence: industry === '공공·비영리·기타',
        };
        let count = 0;
        $$('#lpQuizList li').forEach(li => {
          li.hidden = !show[li.dataset.course];
          if (!li.hidden) count++;
        });
        const recommended = show.bullying ? 1 : 0;
        $('#lpQuizCount').textContent = count;
        $('#lpQuizLabel').textContent = `${industry} · ${small ? '5인 미만' : '5인 이상'}`;
        $('#lpQuizNote').hidden = !small;
        const also = $('#lpQuizAlso');
        also.hidden = !ALSO[industry];
        if (ALSO[industry]) also.innerHTML = `함께 확인할 교육: <b>${ALSO[industry]}</b>`;
        $('#lpQuizLive').textContent =
          `결과: ${count}개 교육${recommended ? ` (권장 ${recommended}개 포함)` : ''} · 결과 보기 ↓`;
      };
      quiz.addEventListener('change', render);
      render();
    }

    /* -------- 2. 과정 탭 (광고그룹별 #앵커로 바로 열기) -------- */
    const tabs = $$('.lp-tab');
    const panels = $$('.lp-panel');
    const courseCta = $('#lpCourseCta');

    const activate = (tab, focus = false) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(p => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
      if (courseCta) courseCta.textContent = `${tab.dataset.name} 견적 요청`;
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
