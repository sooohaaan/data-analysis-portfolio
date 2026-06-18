/* =============================================================
   KOKKOK Report Template — Deck engine
   - 16:9 슬라이드를 뷰포트에 맞춰 스케일
   - 키보드(←/→/Space/Home/End), 클릭, 네비 탭 점프
   - 진행 바 + 페이지/섹션 동기화
   ============================================================= */
(function () {
  const deck   = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progress = document.getElementById("progress");
  let idx = 0;

  /* ---- Chapter title counts (from each divider's content list) ---- */
  const chapterCounts = {};
  slides.forEach((s) => {
    if (s.classList.contains("divider")) {
      const n = s.querySelectorAll(".dv45__list li").length;
      if (s.dataset.section && n) chapterCounts[s.dataset.section] = n;
    }
  });

  /* ---- 챕터의 콘텐츠 슬라이드(간지·표지 제외) 배열 ---- */
  function sectionContent(section) {
    return slides.filter((s) =>
      s.dataset.section === section &&
      !s.classList.contains("divider") && !s.classList.contains("cover"));
  }

  /* ---- 한 탭(nav)에 챕터 페이지 인디케이터 도트 렌더 ----
     도트 1개 = 챕터 내 콘텐츠 슬라이드 1장 · 클릭 시 해당 슬라이드로 이동 */
  function renderInd(tab, section, dotIndex) {
    const old = tab.querySelector(".tab__ind, .tab__count");
    if (old) old.remove();
    const sec = sectionContent(section);
    const N = sec.length;
    if (!N) return;
    const ind = document.createElement("span");
    ind.className = "tab__ind";
    for (let k = 0; k < N; k++) {
      const dot = document.createElement("i");
      if (k === dotIndex) dot.className = "on";
      dot.title = (k + 1) + " / " + N;
      dot.addEventListener("click", (e) => {
        e.preventDefault();   // 상위 탭 앵커(href)·#stage 이동 방지
        e.stopPropagation();
        const target = slides.indexOf(sec[k]);
        if (target >= 0) show(target);
      });
      ind.appendChild(dot);
    }
    tab.appendChild(ind);
  }

  /* ---- 슬라이드의 챕터 내 위치 → 도트 인덱스 (1:1) ---- */
  function dotIndexOf(slide, section) {
    return sectionContent(section).indexOf(slide);
  }

  /* ---- PRINT 모드(?print): 각 슬라이드 nav를 '자기 챕터'로 고정 → PDF용 ---- */
  if (/[?&#]print/.test(location.href)) {
    document.documentElement.classList.add("print-mode");
    slides.forEach((sl) => {
      const sec = sl.dataset.section;
      const di = dotIndexOf(sl, sec);
      const nav = sl.querySelector(".nav");
      if (!nav) return;
      nav.querySelectorAll(".nav__tab").forEach((t) => {
        const on = t.dataset.section === sec;
        t.classList.toggle("is-active", on);
        if (on) renderInd(t, sec, di);
      });
    });
    return; // 화면 내비/스케일 바인딩 생략 (인쇄 레이아웃은 CSS가 담당)
  }

  /* ---- Fit 1280x720 stage into viewport ---- */
  function fit() {
    const sw = 1280, sh = 720;
    const scale = Math.min(window.innerWidth / sw, window.innerHeight / sh);
    deck.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  window.addEventListener("resize", fit);
  fit();

  /* ---- Show a slide ---- */
  function show(n) {
    idx = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    const pct = slides.length > 1 ? (idx / (slides.length - 1)) * 100 : 100;
    if (progress) progress.style.width = pct + "%";
    syncNav();
    location.hash = "s" + (idx + 1);
  }

  /* ---- Sync top-nav active tab + page indicator with current slide ---- */
  function syncNav() {
    const section = slides[idx].dataset.section;
    const dotIndex = sectionContent(section).indexOf(slides[idx]); // 간지/표지면 -1

    document.querySelectorAll(".nav").forEach((nav) => {
      nav.querySelectorAll(".nav__tab").forEach((t) => {
        const on = t.dataset.section === section;
        t.classList.toggle("is-active", on);
        if (on) { renderInd(t, section, dotIndex); }
        else { const old = t.querySelector(".tab__ind, .tab__count"); if (old) old.remove(); }
      });
    });
  }

  function next() { show(idx + 1); }
  function prev() { show(idx - 1); }

  /* ---- Keyboard ---- */
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":         e.preventDefault(); next(); break;
      case "ArrowLeft":
      case "PageUp":     prev(); break;
      case "Home":       show(0); break;
      case "End":        show(slides.length - 1); break;
    }
  });

  /* ---- Click halves to navigate ---- */
  document.getElementById("stage").addEventListener("click", (e) => {
    if (e.target.closest(".nav, .tag-link, .tabs, a, [data-goto]")) return;
    if (e.clientX > window.innerWidth * 0.5) next(); else prev();
  });

  /* ---- CONTENTS(목차) 항목 클릭 → 해당 슬라이드로 이동 ---- */
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", (e) => {
      e.preventDefault();   // 앵커(href=#sN)의 기본 점프 방지 — JS로 슬라이드 전환
      e.stopPropagation();
      const n = parseInt(el.dataset.goto, 10);
      if (!isNaN(n)) show(n);
    });
  });

  /* ---- Nav tab jump: go to first slide of that section ----
     (앵커 <a href="#sN">로 PDF 내부 링크도 생성 · 웹은 JS로 전환) */
  document.querySelectorAll(".nav__tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();   // 앵커 기본 점프 방지
      e.stopPropagation();
      const sec = tab.dataset.section;
      const target = slides.findIndex((s) => s.dataset.section === sec);
      if (target >= 0) show(target);
    });
  });

  /* ---- 새로고침 버튼 → 페이지 리로드(딥링크로 현재 슬라이드 유지) ----
     ※ 로고(data-goto=0)·메뉴(data-goto=1)는 위 [data-goto] 핸들러가 처리.
     ※ PDF에선 JS 없이도 각 앵커 href(#s1·#s2·섹션)로 내부 링크가 동작. */
  document.querySelectorAll(".nav__refresh").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      location.reload();
    });
  });

  /* ---- Tab components (환경/사회/지배구조 등) ---- */
  document.querySelectorAll(".tabs").forEach((group) => {
    group.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      e.stopPropagation();
      const panelId = tab.dataset.panel;
      group.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const scope = group.closest(".slide");
      scope.querySelectorAll("[data-panelbody]").forEach((p) => {
        p.style.display = p.dataset.panelbody === panelId ? "" : "none";
      });
    });
  });

  /* ---- deep link ---- */
  const m = location.hash.match(/^#s(\d+)$/);
  show(m ? parseInt(m[1], 10) - 1 : 0);
})();
