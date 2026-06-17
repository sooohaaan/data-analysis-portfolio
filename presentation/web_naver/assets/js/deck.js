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
    const N = chapterCounts[section] || 0;
    // 현재 챕터의 콘텐츠 슬라이드(간지·표지 제외) 중 현재 위치 → 도트 인덱스
    const secContent = slides.filter((s) =>
      s.dataset.section === section &&
      !s.classList.contains("divider") && !s.classList.contains("cover"));
    const pos = secContent.indexOf(slides[idx]);
    let dotIndex = -1;
    if (N && pos >= 0 && secContent.length)
      dotIndex = Math.min(N - 1, Math.floor((pos / secContent.length) * N));

    document.querySelectorAll(".nav").forEach((nav) => {
      nav.querySelectorAll(".nav__tab").forEach((t) => {
        const on = t.dataset.section === section;
        t.classList.toggle("is-active", on);
        const old = t.querySelector(".tab__ind");
        if (old) old.remove();
        if (on && N) {
          const ind = document.createElement("span");
          ind.className = "tab__ind";
          for (let k = 0; k < N; k++) {
            const dot = document.createElement("i");
            if (k === dotIndex) dot.className = "on";
            ind.appendChild(dot);
          }
          t.appendChild(ind);
        }
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
    if (e.target.closest(".nav, .tag-link, .tabs, a")) return;
    if (e.clientX > window.innerWidth * 0.5) next(); else prev();
  });

  /* ---- Nav tab jump: go to first slide of that section ---- */
  document.querySelectorAll(".nav__tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      const sec = tab.dataset.section;
      const target = slides.findIndex((s) => s.dataset.section === sec);
      if (target >= 0) show(target);
    });
  });

  /* ---- Logo → page 1 (cover) · hamburger → contents ---- */
  document.querySelectorAll(".nav__logo").forEach((el) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", (e) => { e.stopPropagation(); show(0); });
  });
  document.querySelectorAll(".nav__icons").forEach((ic) => {
    const svgs = ic.querySelectorAll("svg");
    const burger = svgs[svgs.length - 1];
    if (burger) {
      burger.style.cursor = "pointer";
      burger.addEventListener("click", (e) => { e.stopPropagation(); show(1); });
    }
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
