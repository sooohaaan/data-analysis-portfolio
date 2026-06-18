/* =============================================================
   D3 charts for KOKKOK EV deck
   - SVG 렌더(벡터) → transform:scale 덱에서도 선명
   - 색은 덱 토큰과 일치(--brand 등 하드코딩)
   - display:none 슬라이드에서도 viewBox 기반이라 정상 렌더
   - 모든 수치는 data_analysis_report.md / 재분류 정본 기준
   ============================================================= */
(function () {
  if (typeof d3 === "undefined") return;
  var C = { brand:"#00A75D", strong:"#017A45", bright:"#43CA70", teal:"#11A89E", line:"#dbdbdb",
            ink:"#111111", ink2:"#3a3a3a", ink3:"#767676", mist:"#EAFBF1",
            gray:"#b9bcc0", gray2:"#d4d7da", blue:"#4D9BFF", purple:"#8B7CF0",
            red:"#E5484D", redbg:"#FDEBEC" };

  /* axis/grid 스타일 헬퍼 */
  function styleAxis(g, vert) {
    g.select(".domain").attr("stroke", C.line);
    g.selectAll(".tick line").attr("stroke", C.line).attr("stroke-dasharray", "2 3");
    g.selectAll("text").attr("fill", C.ink3).attr("font-size", 10);
  }
  function newSvg(el, W, H) {
    return d3.select(el).append("svg")
      .attr("viewBox", "0 0 " + W + " " + H)
      .attr("width", "100%").attr("height", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("display", "block");
  }
  /* 그래프 박스 테두리 (좌측=Y축·하단=X축 프레임 겸함) */
  function frame(svg, m, W, H) {
    svg.append("rect").attr("x", m.l).attr("y", m.t)
      .attr("width", W - m.l - m.r).attr("height", H - m.t - m.b)
      .attr("fill", "none").attr("stroke", C.gray2).attr("stroke-width", 1).attr("rx", 2);
  }
  /* 점선 세로 grid (값 축이 가로인 차트용) */
  function gridX(svg, x, m, W, H, ticks) {
    ticks.forEach(function (t) {
      svg.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", m.t).attr("y2", H - m.b)
        .attr("stroke", C.line).attr("stroke-dasharray", "2 3");
    });
  }

  /* ---- p16 경쟁 포지셔닝 산점도 (별점 × 부정률 · 버블=리뷰수) ---- */
  function positioning() {
    var el = document.getElementById("chart-positioning");
    if (!el || el.__done) return; el.__done = true;

    var W = 560, H = 372, m = { t: 20, r: 26, b: 46, l: 52 };
    var apps = [
      { name: "LOCA EV",      rating: 5.0,  neg: 14.3, reviews: 7 },
      { name: "PTT blueplus+", rating: 3.11, neg: 47.6, reviews: 1518 },
      { name: "Green SM",     rating: 2.56, neg: 53.5, reviews: 26603 },
      { name: "PEA VOLTA",    rating: 2.28, neg: 67.9, reviews: 499 },
      { name: "EleXA",        rating: 2.41, neg: 62.4, reviews: 263 }
    ];
    var target = { name: "★ KOKKOK 목표", rating: 3.8, neg: 20 };

    var x = d3.scaleLinear().domain([2.0, 5.2]).range([m.l, W - m.r]);
    var y = d3.scaleLinear().domain([0, 75]).range([H - m.b, m.t]);
    var rOf = function (v) { return 9 + Math.sqrt(v) / Math.sqrt(26603) * 22; };

    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);

    svg.append("rect").attr("x", x(3.8)).attr("y", y(35))
      .attr("width", (W - m.r) - x(3.8)).attr("height", (H - m.b) - y(35))
      .attr("fill", C.mist);
    svg.append("text").attr("x", W - m.r - 6).attr("y", y(35) + 15)
      .attr("text-anchor", "end").attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", C.strong).text("목표 좌표 · 고별점 · 저불만");

    var xa = d3.axisBottom(x).tickValues([2.5, 3, 3.5, 4, 4.5, 5]).tickSize(-(H - m.t - m.b));
    svg.append("g").attr("transform", "translate(0," + (H - m.b) + ")").call(xa).call(styleAxis);
    var ya = d3.axisLeft(y).tickValues([0, 20, 40, 60]).tickSize(-(W - m.l - m.r)).tickFormat(function (d) { return d + "%"; });
    svg.append("g").attr("transform", "translate(" + m.l + ",0)").call(ya).call(styleAxis);

    svg.append("text").attr("x", W - m.r).attr("y", H - 10).attr("text-anchor", "end")
      .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink2).text("별점 →");
    svg.append("text").attr("x", m.l - 2).attr("y", m.t - 7).attr("text-anchor", "start")
      .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink2).text("↑ 부정률(Negative)");

    // 라벨 충돌 완화: 좌상단 밀집 3종은 위치별로 오프셋
    var off = { "PEA VOLTA": [-4, "end"], "EleXA": [4, "start"], "Green SM": [0, "middle"] };
    var g = svg.selectAll(".app").data(apps).enter().append("g");
    g.append("circle")
      .attr("cx", function (d) { return x(d.rating); })
      .attr("cy", function (d) { return y(d.neg); })
      .attr("r", function (d) { return rOf(d.reviews); })
      .attr("fill", C.gray).attr("fill-opacity", 0.42)
      .attr("stroke", C.ink3).attr("stroke-opacity", 0.5);
    g.append("text")
      .attr("x", function (d) { return x(d.rating) + (off[d.name] ? off[d.name][0] : 0); })
      .attr("y", function (d) { return y(d.neg) - rOf(d.reviews) - 5; })
      .attr("text-anchor", function (d) { return off[d.name] ? off[d.name][1] : "middle"; })
      .attr("font-size", 10).attr("font-weight", 700).attr("fill", C.ink2)
      .text(function (d) { return d.name + " " + d.rating.toFixed(2); });

    svg.append("path")
      .attr("transform", "translate(" + x(target.rating) + "," + y(target.neg) + ")")
      .attr("d", d3.symbol(d3.symbolStar, 320)())
      .attr("fill", C.brand).attr("stroke", "#fff").attr("stroke-width", 1.5);
    svg.append("text").attr("x", x(target.rating)).attr("y", y(target.neg) + 28)
      .attr("text-anchor", "middle").attr("font-size", 11).attr("font-weight", 800)
      .attr("fill", C.strong).text("★ KOKKOK 목표");
  }

  /* ---- p7 라오스 뉴스 점유율 (가로 막대 · 브랜드 언급 41건) ---- */
  function sov() {
    var el = document.getElementById("chart-sov");
    if (!el || el.__done) return; el.__done = true;
    var W = 560, H = 372, m = { t: 16, r: 64, b: 30, l: 132 };
    var rows = [
      { label: "VinFast·Xanh SM", v: 21, c: C.purple, tag: "놓쳤던 1위 경쟁자" },
      { label: "LOCA EV",          v: 17, c: C.blue,   tag: "검증된 벤치마크" },
      { label: "KOKKOK Move",      v: 3,  c: C.brand,  tag: "미디어 인지도 약세" },
      { label: "Grab",             v: 0,  c: C.gray,   tag: "라오스 미진출" }
    ];
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    svg.append("text").attr("x", m.l).attr("y", 11).attr("font-size", 11)
      .attr("font-weight", 700).attr("fill", C.ink3)
      .text("라오스 EV·모빌리티 뉴스 393건 · 브랜드 언급 41건");
    var x = d3.scaleLinear().domain([0, 24]).range([m.l, W - m.r]);
    gridX(svg, x, m, W, H, [0, 6, 12, 18, 24]);
    var y = d3.scaleBand().domain(rows.map(function (d) { return d.label; }))
      .range([m.t + 8, H - m.b]).padding(0.34);
    rows.forEach(function (d) {
      var cy = y(d.label), bh = y.bandwidth();
      svg.append("rect").attr("x", m.l).attr("y", cy).attr("height", bh)
        .attr("width", Math.max(2, x(d.v) - m.l)).attr("rx", 3).attr("fill", d.c)
        .attr("fill-opacity", d.v === 0 ? 0.25 : 0.92);
      svg.append("text").attr("x", m.l - 8).attr("y", cy + bh / 2 - 4).attr("dy", "0.35em")
        .attr("text-anchor", "end").attr("font-size", 11).attr("font-weight", 700)
        .attr("fill", C.ink).text(d.label);
      svg.append("text").attr("x", m.l - 8).attr("y", cy + bh / 2 + 9).attr("dy", "0.35em")
        .attr("text-anchor", "end").attr("font-size", 8.5).attr("fill", C.ink3).text(d.tag);
      svg.append("text").attr("x", (d.v === 0 ? m.l : x(d.v)) + 7).attr("y", cy + bh / 2)
        .attr("dy", "0.35em").attr("font-size", 12).attr("font-weight", 800)
        .attr("fill", d.v === 0 ? C.ink3 : d.c).text(d.v === 0 ? "0 (미진출)" : d.v + "건");
    });
  }

  /* ---- p14 앱별 부정 리뷰 비율 (가로 막대 + 평균선 53.5%) ---- */
  function sentiment() {
    var el = document.getElementById("chart-sentiment");
    if (!el || el.__done) return; el.__done = true;
    var W = 560, H = 372, m = { t: 22, r: 56, b: 34, l: 116 };
    var rows = [
      { label: "PEA VOLTA",     v: 67.9, n: 499 },
      { label: "EleXA",         v: 62.4, n: 263 },
      { label: "Green SM",      v: 53.5, n: 26603 },
      { label: "PTT blueplus+", v: 47.6, n: 1518, hi: true, tag: "평균 이하 → 벤치마크" },
      { label: "LOCA EV",       v: 14.3, n: 7, faint: true, tag: "표본 7건 · 참고" }
    ];
    var avg = 53.5;
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    var x = d3.scaleLinear().domain([0, 75]).range([m.l, W - m.r]);
    var y = d3.scaleBand().domain(rows.map(function (d) { return d.label; }))
      .range([m.t, H - m.b]).padding(0.32);
    // x축
    var xa = d3.axisBottom(x).tickValues([0, 20, 40, 60]).tickSize(-(H - m.t - m.b)).tickFormat(function (d) { return d + "%"; });
    svg.append("g").attr("transform", "translate(0," + (H - m.b) + ")").call(xa).call(styleAxis);
    // 평균선
    svg.append("line").attr("x1", x(avg)).attr("x2", x(avg)).attr("y1", m.t - 4).attr("y2", H - m.b)
      .attr("stroke", C.ink2).attr("stroke-width", 1.2).attr("stroke-dasharray", "4 3");
    svg.append("text").attr("x", x(avg)).attr("y", m.t - 8).attr("text-anchor", "middle")
      .attr("font-size", 10).attr("font-weight", 700).attr("fill", C.ink2).text("앱 리뷰 평균 53.5%");
    rows.forEach(function (d) {
      var cy = y(d.label), bh = y.bandwidth();
      var col = d.hi ? C.brand : (d.faint ? C.gray2 : C.gray);
      svg.append("rect").attr("x", m.l).attr("y", cy).attr("height", bh)
        .attr("width", Math.max(2, x(d.v) - m.l)).attr("rx", 3)
        .attr("fill", col).attr("fill-opacity", d.faint ? 0.7 : 0.92);
      svg.append("text").attr("x", m.l - 8).attr("y", cy + bh / 2).attr("dy", "0.35em")
        .attr("text-anchor", "end").attr("font-size", 11)
        .attr("font-weight", d.hi ? 800 : 700)
        .attr("fill", d.hi ? C.strong : C.ink).text(d.label);
      svg.append("text").attr("x", x(d.v) + 6).attr("y", cy + bh / 2).attr("dy", "0.35em")
        .attr("font-size", 11.5).attr("font-weight", 800)
        .attr("fill", d.hi ? C.strong : C.ink2).text(d.v + "%");
      if (d.tag)
        svg.append("text").attr("x", x(d.v) + 6).attr("y", cy + bh / 2 + 12).attr("dy", "0.35em")
          .attr("font-size", 8.5).attr("fill", d.hi ? C.strong : C.ink3).text(d.tag);
    });
  }

  /* ---- p15 불만 2계층 (앱 출처별 그룹 막대) ---- */
  function twolayer() {
    var el = document.getElementById("chart-twolayer");
    if (!el || el.__done) return; el.__done = true;
    var W = 560, H = 372, m = { l: 132, r: 52 };
    var groups = [
      { title: "라이드헤일링 앱 · Green SM", sub: "부정 14,234건 (92%) — 우리 도메인 아님",
        color: C.gray, rows: [["배차·호출실패", 21.4], ["드라이버", 12.0], ["목적지·경로", 6.1]] },
      { title: "충전앱 4개 · PTT·PEA·EleXA·LOCA", sub: "부정 1,227건 (8%) — 우리가 풀 문제",
        color: C.brand, rows: [["앱 불안정·작동불가", 27.6], ["계정·인증·KYC", 15.0], ["결제·환불·지갑", 11.0], ["충전소·위치", 2.4], ["외국인·다국어", 1.5]] }
    ];
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    var x = d3.scaleLinear().domain([0, 30]).range([m.l, W - m.r]);
    gridX(svg, x, m, W, H, [0, 10, 20, 30]);
    var nRows = 8, headH = 24, top = 6, gapG = 12, botPad = 40;
    var avail = H - top - groups.length * headH - groups.length * gapG - botPad;
    var rh = avail / nRows;
    var yc = top;
    groups.forEach(function (gp, gi) {
      svg.append("text").attr("x", 4).attr("y", yc + 11).attr("font-size", 11.5)
        .attr("font-weight", 800).attr("fill", gp.color === C.brand ? C.strong : C.ink2).text(gp.title);
      svg.append("text").attr("x", 4).attr("y", yc + 23).attr("font-size", 9).attr("fill", C.ink3).text(gp.sub);
      yc += headH;
      gp.rows.forEach(function (r, ri) {
        var bh = rh * 0.62, cy = yc + (rh - bh) / 2;
        svg.append("rect").attr("x", m.l).attr("y", cy).attr("height", bh)
          .attr("width", Math.max(2, x(r[1]) - m.l)).attr("rx", 3)
          .attr("fill", gp.color).attr("fill-opacity", (gi === 1 && ri === 0) ? 1 : (gp.color === C.brand ? 0.85 : 0.55));
        svg.append("text").attr("x", m.l - 8).attr("y", cy + bh / 2).attr("dy", "0.35em")
          .attr("text-anchor", "end").attr("font-size", 10)
          .attr("font-weight", (gi === 1 && ri === 0) ? 800 : 600)
          .attr("fill", (gi === 1 && ri === 0) ? C.strong : C.ink).text(r[0]);
        svg.append("text").attr("x", x(r[1]) + 6).attr("y", cy + bh / 2).attr("dy", "0.35em")
          .attr("font-size", 10.5).attr("font-weight", 800)
          .attr("fill", gp.color === C.brand ? C.strong : C.ink3).text(r[1] + "%");
        yc += rh;
      });
      yc += gapG;
    });
    // 충전앱 진짜 1위 강조
    svg.append("text").attr("x", W - m.r).attr("y", top + 11).attr("text-anchor", "end")
      .attr("font-size", 9.5).attr("font-weight", 700).attr("fill", C.ink3)
      .text("도메인 분리 → 충전앱 진짜 1위 '앱 불안정' 식별");
  }

  /* ---- p17 충전앱 레이어 우선순위 (3축 + 누적) ---- */
  function appaxes() {
    var el = document.getElementById("chart-appaxes");
    if (!el || el.__done) return; el.__done = true;
    var W = 560, H = 372, m = { t: 40, r: 110, b: 30, l: 124 };
    var rows = [
      { label: "앱 불안정·작동불가", v: 27.6, axis: "P0 · 세션 안정성", hi: true },
      { label: "계정·인증·KYC",      v: 15.0, axis: "P0 · 간편 온보딩", hi: true },
      { label: "결제·환불·지갑",      v: 11.0, axis: "P1 · 지갑결제",     hi: true },
      { label: "충전소·위치",         v: 2.4 },
      { label: "외국인·다국어",       v: 1.5 }
    ];
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    svg.append("text").attr("x", m.l).attr("y", 14).attr("font-size", 11).attr("font-weight", 700)
      .attr("fill", C.ink3).text("충전앱 부정 1,227건 · 카테고리별 비중");
    svg.append("text").attr("x", m.l).attr("y", 30).attr("font-size", 12).attr("font-weight", 800)
      .attr("fill", C.strong).text("상위 3축 = 53.6% → PRD P0~P1 직접 근거");
    var x = d3.scaleLinear().domain([0, 30]).range([m.l, W - m.r]);
    gridX(svg, x, m, W, H, [0, 10, 20, 30]);
    var y = d3.scaleBand().domain(rows.map(function (d) { return d.label; }))
      .range([m.t, H - m.b]).padding(0.34);
    rows.forEach(function (d) {
      var cy = y(d.label), bh = y.bandwidth();
      svg.append("rect").attr("x", m.l).attr("y", cy).attr("height", bh)
        .attr("width", Math.max(2, x(d.v) - m.l)).attr("rx", 3)
        .attr("fill", d.hi ? C.brand : C.gray).attr("fill-opacity", d.hi ? 0.92 : 0.5);
      svg.append("text").attr("x", m.l - 8).attr("y", cy + bh / 2).attr("dy", "0.35em")
        .attr("text-anchor", "end").attr("font-size", 10.5)
        .attr("font-weight", d.hi ? 800 : 600).attr("fill", d.hi ? C.ink : C.ink2).text(d.label);
      if (d.hi)
        svg.append("text").attr("x", x(d.v) - 8).attr("y", cy + bh / 2).attr("dy", "0.35em")
          .attr("text-anchor", "end").attr("font-size", 11).attr("font-weight", 800)
          .attr("fill", "#fff").text(d.v + "%");
      else
        svg.append("text").attr("x", x(d.v) + 6).attr("y", cy + bh / 2).attr("dy", "0.35em")
          .attr("font-size", 11).attr("font-weight", 800).attr("fill", C.ink3).text(d.v + "%");
      if (d.axis)
        svg.append("text").attr("x", W - 6).attr("y", cy + bh / 2).attr("dy", "0.35em")
          .attr("text-anchor", "end").attr("font-size", 8.5).attr("font-weight", 700)
          .attr("fill", C.strong).text(d.axis);
    });
  }

  /* ---- p19 하드웨어 이슈 맵 (언급수 × 심각도 산점도) ---- */
  function hwmap() {
    var el = document.getElementById("chart-hwmap");
    if (!el || el.__done) return; el.__done = true;
    var W = 560, H = 372, m = { t: 26, r: 30, b: 50, l: 50 };
    var items = [
      { name: "충전기결함",    freq: 75,  neg: 32.0, c: C.red,    note: "심각도 1위", below: true },
      { name: "시장·정책",     freq: 113, neg: 2.7,  c: C.gray },
      { name: "설치·인프라",   freq: 144, neg: 1.4,  c: C.gray },
      { name: "OCPP·호환문제", freq: 169, neg: 1.2,  c: C.strong, note: "언급 최다" },
      { name: "제조사동향",    freq: 94,  neg: 1.1,  c: C.gray }
    ];
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    var x = d3.scaleLinear().domain([55, 185]).range([m.l, W - m.r]);
    var y = d3.scaleLinear().domain([-5, 36]).range([H - m.b, m.t]);
    var rOf = function (v) { return 8 + Math.sqrt(v) / Math.sqrt(169) * 13; };

    var xa = d3.axisBottom(x).tickValues([75, 100, 125, 150, 175]).tickSize(-(H - m.t - m.b)).tickFormat(function (d) { return d + "건"; });
    svg.append("g").attr("transform", "translate(0," + (H - m.b) + ")").call(xa).call(styleAxis);
    var ya = d3.axisLeft(y).tickValues([0, 10, 20, 30]).tickSize(-(W - m.l - m.r)).tickFormat(function (d) { return d + "%"; });
    svg.append("g").attr("transform", "translate(" + m.l + ",0)").call(ya).call(styleAxis);

    svg.append("text").attr("x", W - m.r).attr("y", H - 12).attr("text-anchor", "end")
      .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink2).text("언급 건수 →");
    svg.append("text").attr("x", m.l - 2).attr("y", m.t - 9).attr("text-anchor", "start")
      .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink2).text("↑ 심각도(Negative %)");

    items.forEach(function (d) {
      var cx = x(d.freq), cy = y(d.neg), r = rOf(d.freq), key = d.note;
      svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", r)
        .attr("fill", d.c).attr("fill-opacity", key ? 0.82 : 0.38)
        .attr("stroke", d.c).attr("stroke-opacity", 0.6);
      var anchor = "middle", lx = cx;
      if (d.name === "제조사동향") { anchor = "end"; lx = cx + r - 2; }
      var baseY = d.below ? cy + r + 13 : cy - r - 17;
      var lbl = svg.append("text").attr("x", lx).attr("y", baseY).attr("text-anchor", anchor)
        .attr("font-size", 10).attr("font-weight", key ? 800 : 700)
        .attr("fill", d.c === C.red ? C.red : (d.c === C.strong ? C.strong : C.ink2));
      lbl.append("tspan").attr("x", lx).text(key ? d.name + " · " + key : d.name);
      lbl.append("tspan").attr("x", lx).attr("dy", "1.2em")
        .attr("font-size", 9.5).attr("font-weight", 600).attr("fill", C.ink3)
        .text(d.freq + "건 · Neg " + d.neg + "%");
    });
  }

  /* ---- p3 TAM–SAM–SOM 퍼널 (범위 좁히기) ---- */
  function funnel() {
    var el = document.getElementById("chart-funnel");
    if (!el || el.__done) return; el.__done = true;
    var W = 480, H = 300, cx = W / 2;
    var segs = [
      { acr: "TAM", name: "ASEAN-6 EV 생태계", val: "$100B–120B (약 130~160조 원)", cap: "2035 · EY-Parthenon",
        tw: 470, bw: 356, fill: C.mist,   tcol: C.ink,  vcol: C.strong, ccol: C.ink3 },
      { acr: "SAM", name: "동남아 EV 충전 서비스", val: "EV 신차 9% · 판매 +50%", cap: "IEA 2025",
        tw: 344, bw: 232, fill: C.bright, tcol: C.ink,  vcol: C.ink,    ccol: C.ink2 },
      { acr: "SOM", name: "라오스 충전 · 슈퍼앱", val: "라오스 EV 40% 커버", cap: "3년 · LOCA",
        tw: 220, bw: 110, fill: C.strong, tcol: "#fff", vcol: "#fff",   ccol: "#DFF7E9" }
    ];
    var svg = newSvg(el, W, H);
    var top = 4, segH = 88, gap = 9;
    segs.forEach(function (s, i) {
      var yT = top + i * (segH + gap), yB = yT + segH;
      svg.append("polygon").attr("points",
        (cx - s.tw / 2) + "," + yT + " " + (cx + s.tw / 2) + "," + yT + " " +
        (cx + s.bw / 2) + "," + yB + " " + (cx - s.bw / 2) + "," + yB)
        .attr("fill", s.fill);
      // 1행: TAM/SAM/SOM 약어(크게) — 내용과 분리
      svg.append("text").attr("x", cx).attr("y", yT + 25).attr("text-anchor", "middle")
        .attr("font-size", 20).attr("font-weight", 800).attr("letter-spacing", "0.5").attr("fill", s.tcol).text(s.acr);
      // 2행: 시장 정의
      svg.append("text").attr("x", cx).attr("y", yT + 44).attr("text-anchor", "middle")
        .attr("font-size", 11.5).attr("font-weight", 700).attr("fill", s.tcol).text(s.name);
      // 3행: 규모 값
      svg.append("text").attr("x", cx).attr("y", yT + 62).attr("text-anchor", "middle")
        .attr("font-size", 12.5).attr("font-weight", 800).attr("fill", s.vcol).text(s.val);
      // 4행: 출처
      svg.append("text").attr("x", cx).attr("y", yT + 78).attr("text-anchor", "middle")
        .attr("font-size", 9).attr("font-weight", 600).attr("fill", s.ccol).text(s.cap);
    });
    // 좁혀가는 방향 화살표
    svg.append("text").attr("x", cx).attr("y", H - 2).attr("text-anchor", "middle")
      .attr("font-size", 10).attr("font-weight", 700).attr("fill", C.ink3)
      .text("▼ 검증된 공식 자료로 범위를 좁힘");
  }

  /* ---- p12 채널별 수집 비중 도넛 ---- */
  function donut() {
    var el = document.getElementById("chart-donut");
    if (!el || el.__done) return; el.__done = true;
    var W = 130, R = W / 2, ir = R * 0.62, gap = 0.03;
    var data = [
      { v: 75, c: C.brand }, { v: 9, c: C.bright },
      { v: 8, c: C.blue },   { v: 8, c: C.purple }
    ];
    var svg = newSvg(el, W, W);
    var g = svg.append("g").attr("transform", "translate(" + R + "," + R + ")");
    var pie = d3.pie().value(function (d) { return d.v; }).sort(null).padAngle(gap);
    var arc = d3.arc().innerRadius(ir).outerRadius(R - 3).cornerRadius(2);
    g.selectAll("path").data(pie(data)).enter().append("path")
      .attr("d", arc).attr("fill", function (d) { return d.data.c; });
    g.append("text").attr("text-anchor", "middle").attr("dy", "-0.05em")
      .attr("font-size", 24).attr("font-weight", 800).attr("fill", C.strong).text("75%");
    g.append("text").attr("text-anchor", "middle").attr("dy", "1.25em")
      .attr("font-size", 9.5).attr("font-weight", 600).attr("fill", C.ink3).text("앱 리뷰");
  }

  /* ---- p26 사용자 여정 감정선 (As-Is vs To-Be) ---- */
  function journey() {
    var el = document.getElementById("chart-journey");
    if (!el || el.__done) return; el.__done = true;
    var W = 1040, H = 232, m = { t: 18, r: 20, b: 26, l: 48 };
    var stages = ["탐색·발견", "QR 스캔", "결제", "충전 진행", "완료·정산"];
    var asIs = [12, -18, -24, -30, -2];
    var toBe = [26, 16, 20, 22, 36];
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    var x = d3.scalePoint().domain(stages).range([m.l, W - m.r]).padding(0.5);
    var y = d3.scaleLinear().domain([-40, 45]).range([H - m.b, m.t]);

    // ── 배경 점선 그리드 (박스 테두리=frame이 X/Y축 담당) ──
    var yTicks = [40, 20, 0, -20, -40];
    // 가로 점선 그리드 (중립=0은 약간 강조)
    yTicks.forEach(function (t) {
      svg.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(t)).attr("y2", y(t))
        .attr("stroke", t === 0 ? C.gray : C.line).attr("stroke-dasharray", t === 0 ? "4 3" : "2 3");
    });
    // 세로 점선 그리드 (단계별)
    stages.forEach(function (s) {
      svg.append("line").attr("x1", x(s)).attr("x2", x(s)).attr("y1", m.t).attr("y2", H - m.b)
        .attr("stroke", C.line).attr("stroke-dasharray", "2 3");
    });
    // Y축 라벨 (감정 수준)
    svg.append("text").attr("x", m.l - 8).attr("y", y(40) + 4).attr("text-anchor", "end").attr("font-size", 10).attr("font-weight", 700).attr("fill", C.strong).text("만족");
    svg.append("text").attr("x", m.l - 8).attr("y", y(0) + 4).attr("text-anchor", "end").attr("font-size", 10).attr("fill", C.ink3).text("중립");
    svg.append("text").attr("x", m.l - 8).attr("y", y(-40) + 4).attr("text-anchor", "end").attr("font-size", 10).attr("font-weight", 700).attr("fill", C.red).text("불만");

    var line = d3.line().x(function (d, i) { return x(stages[i]); }).y(function (d) { return y(d); }).curve(d3.curveMonotoneX);
    // 감정 수준 → 색 (빨강 부정 · 주황 · 노랑 중립 · 연두 · 초록 긍정)
    var emoColor = d3.scaleLinear().domain([-30, -12, 2, 18, 40])
      .range(["#E5484D", "#F5883B", "#F5C84B", "#8FD96A", "#16B364"]).clamp(true);
    // As-Is 감정선: 높낮이에 따라 색이 변하는 그라데이션 스트로크
    var x0 = x(stages[0]), xN = x(stages[stages.length - 1]);
    var grad = svg.append("defs").append("linearGradient").attr("id", "jgrad")
      .attr("gradientUnits", "userSpaceOnUse").attr("x1", x0).attr("y1", 0).attr("x2", xN).attr("y2", 0);
    asIs.forEach(function (v, i) {
      grad.append("stop").attr("offset", ((x(stages[i]) - x0) / (xN - x0) * 100) + "%").attr("stop-color", emoColor(v));
    });
    svg.append("path").attr("d", line(asIs)).attr("fill", "none").attr("stroke", "url(#jgrad)")
      .attr("stroke-width", 3.4).attr("stroke-linejoin", "round").attr("stroke-linecap", "round");
    asIs.forEach(function (v, i) {
      svg.append("circle").attr("cx", x(stages[i])).attr("cy", y(v)).attr("r", 5.5)
        .attr("fill", emoColor(v)).attr("stroke", "#fff").attr("stroke-width", 2);
    });
    // To-Be(개선 목표): 비교용 초록 점선
    svg.append("path").attr("d", line(toBe)).attr("fill", "none").attr("stroke", C.brand)
      .attr("stroke-width", 2.2).attr("stroke-dasharray", "5 4").attr("stroke-linejoin", "round").attr("stroke-opacity", 0.85);
    toBe.forEach(function (v, i) {
      svg.append("circle").attr("cx", x(stages[i])).attr("cy", y(v)).attr("r", 3.6)
        .attr("fill", "#fff").attr("stroke", C.brand).attr("stroke-width", 2);
    });
    // 단계 라벨
    stages.forEach(function (s) {
      svg.append("text").attr("x", x(s)).attr("y", H - 8).attr("text-anchor", "middle")
        .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink2).text(s);
    });
  }

  /* ---- p24 제품 포지셔닝 사분면 (가격 × 품질·기능) ---- */
  function prodpos() {
    var el = document.getElementById("chart-prodpos");
    if (!el || el.__done) return; el.__done = true;
    var W = 560, H = 380, m = { t: 22, r: 22, b: 30, l: 30 };
    var apps = [
      { n: "★ KOKKOK EV", x: 26, y: 76, star: true },
      { n: "LOCA EV", x: 42, y: 60 }, { n: "PTT blueplus+", x: 73, y: 70 },
      { n: "Green SM", x: 50, y: 30 }, { n: "EleXA", x: 32, y: 26 }, { n: "PEA VOLTA", x: 70, y: 20 }
    ];
    var x = d3.scaleLinear().domain([0, 100]).range([m.l, W - m.r]);
    var y = d3.scaleLinear().domain([0, 100]).range([H - m.b, m.t]);
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    // 목표 사분면(저가·고기능 = 좌상단) 음영
    svg.append("rect").attr("x", x(0)).attr("y", y(100))
      .attr("width", x(50) - x(0)).attr("height", y(50) - y(100)).attr("fill", C.mist);
    svg.append("text").attr("x", x(2)).attr("y", y(96)).attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", C.strong).text("저가 · 고기능 (빈 사분면)");
    // 사분면 분할선
    svg.append("line").attr("x1", x(50)).attr("x2", x(50)).attr("y1", m.t).attr("y2", H - m.b)
      .attr("stroke", C.line).attr("stroke-dasharray", "3 3");
    svg.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(50)).attr("y2", y(50))
      .attr("stroke", C.line).attr("stroke-dasharray", "3 3");
    // 축 라벨
    svg.append("text").attr("x", W - m.r).attr("y", H - 8).attr("text-anchor", "end")
      .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink2).text("가격 비쌈 ▶");
    svg.append("text").attr("x", m.l - 2).attr("y", m.t - 8).attr("font-size", 11)
      .attr("font-weight", 700).attr("fill", C.ink2).text("▲ 품질 · 기능 높음");
    svg.append("text").attr("x", m.l).attr("y", H - 8).attr("font-size", 10).attr("fill", C.ink3).text("◀ 저렴");
    // 점
    apps.forEach(function (d) {
      if (d.star) {
        svg.append("path").attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")")
          .attr("d", d3.symbol(d3.symbolStar, 300)()).attr("fill", C.brand)
          .attr("stroke", "#fff").attr("stroke-width", 1.5);
        svg.append("text").attr("x", x(d.x)).attr("y", y(d.y) - 16).attr("text-anchor", "middle")
          .attr("font-size", 11).attr("font-weight", 800).attr("fill", C.strong).text(d.n);
      } else {
        svg.append("circle").attr("cx", x(d.x)).attr("cy", y(d.y)).attr("r", 7)
          .attr("fill", C.gray).attr("fill-opacity", 0.6).attr("stroke", C.ink3);
        svg.append("text").attr("x", x(d.x)).attr("y", y(d.y) - 12).attr("text-anchor", "middle")
          .attr("font-size", 10).attr("font-weight", 700).attr("fill", C.ink2).text(d.n);
      }
    });
  }

  /* ---- p31 사업성 회수 민감도 (가동률 → 연마진·회수기간) ---- */
  function payback() {
    var el = document.getElementById("chart-payback");
    if (!el || el.__done) return; el.__done = true;
    var W = 520, H = 300, m = { t: 26, r: 20, b: 52, l: 52 };
    var data = [
      { lab: "보수", sub: "40 kWh", margin: 49, yr: "~8년" },
      { lab: "기준", sub: "80 kWh", margin: 98, yr: "~4년" },
      { lab: "낙관", sub: "150 kWh", margin: 184, yr: "~2.2년", hi: true }
    ];
    var x = d3.scaleBand().domain(data.map(function (d) { return d.lab; })).range([m.l, W - m.r]).padding(0.4);
    var y = d3.scaleLinear().domain([0, 200]).range([H - m.b, m.t]);
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    var ya = d3.axisLeft(y).tickValues([0, 50, 100, 150, 200]).tickSize(-(W - m.l - m.r)).tickFormat(function (d) { return d + "M"; });
    svg.append("g").attr("transform", "translate(" + m.l + ",0)").call(ya).call(styleAxis);
    svg.append("text").attr("x", m.l - 2).attr("y", m.t - 10).attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", C.ink3).text("연 총마진 (M₭)");
    data.forEach(function (d) {
      var cx = x(d.lab), bw = x.bandwidth();
      svg.append("rect").attr("x", cx).attr("y", y(d.margin)).attr("width", bw)
        .attr("height", (H - m.b) - y(d.margin)).attr("rx", 3)
        .attr("fill", d.hi ? C.brand : C.gray).attr("fill-opacity", d.hi ? 0.92 : 0.5);
      svg.append("text").attr("x", cx + bw / 2).attr("y", y(d.margin) - 18).attr("text-anchor", "middle")
        .attr("font-size", 13).attr("font-weight", 800).attr("fill", d.hi ? C.strong : C.ink2).text(d.margin + "M₭");
      svg.append("text").attr("x", cx + bw / 2).attr("y", y(d.margin) - 4).attr("text-anchor", "middle")
        .attr("font-size", 10).attr("font-weight", 700).attr("fill", d.hi ? C.strong : C.ink3).text("회수 " + d.yr);
      svg.append("text").attr("x", cx + bw / 2).attr("y", H - m.b + 16).attr("text-anchor", "middle")
        .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink).text(d.lab);
      svg.append("text").attr("x", cx + bw / 2).attr("y", H - m.b + 30).attr("text-anchor", "middle")
        .attr("font-size", 9.5).attr("fill", C.ink3).text(d.sub);
    });
    svg.append("text").attr("x", W - m.r).attr("y", H - 6).attr("text-anchor", "end")
      .attr("font-size", 9.5).attr("fill", C.ink3).text("가동률↑ → 회수기간↓");
  }

  /* ---- p34 기대효과 KPI 덤벨 (현재 → 목표) ---- */
  function kpi() {
    var el = document.getElementById("chart-kpi");
    if (!el || el.__done) return; el.__done = true;
    var W = 560, H = 300, m = { t: 14, r: 70, b: 14, l: 150 };
    var rows = [
      { label: "평균 별점", from: 2.56, to: 3.8, dom: [2, 4], unit: "점", up: true },
      { label: "1~2점 저별점", from: 58, to: 25, dom: [0, 65], unit: "%" },
      { label: "충전앱 앱 불안정", from: 27.6, to: 14, dom: [0, 32], unit: "%" },
      { label: "계정·KYC 온보딩", from: 15, to: 7, dom: [0, 18], unit: "%" }
    ];
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    var yb = d3.scaleBand().domain(rows.map(function (d) { return d.label; })).range([m.t, H - m.b]).padding(0.5);
    rows.forEach(function (d) {
      var cy = yb(d.label) + yb.bandwidth() / 2;
      var xs = d3.scaleLinear().domain(d.dom).range([m.l, W - m.r]);
      svg.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", cy).attr("y2", cy)
        .attr("stroke", C.line).attr("stroke-width", 4).attr("stroke-linecap", "round");
      svg.append("line").attr("x1", xs(d.from)).attr("x2", xs(d.to)).attr("y1", cy).attr("y2", cy)
        .attr("stroke", C.brand).attr("stroke-width", 4).attr("stroke-linecap", "round");
      svg.append("circle").attr("cx", xs(d.from)).attr("cy", cy).attr("r", 6).attr("fill", "#fff").attr("stroke", C.gray).attr("stroke-width", 2.5);
      svg.append("circle").attr("cx", xs(d.to)).attr("cy", cy).attr("r", 6.5).attr("fill", C.brand).attr("stroke", "#fff").attr("stroke-width", 1.5);
      svg.append("text").attr("x", m.l - 12).attr("y", cy).attr("dy", "0.35em").attr("text-anchor", "end")
        .attr("font-size", 12).attr("font-weight", 700).attr("fill", C.ink).text(d.label);
      var fromRight = xs(d.from) > xs(d.to);
      svg.append("text").attr("x", xs(d.from) + (fromRight ? 11 : -11)).attr("y", cy).attr("dy", "0.35em")
        .attr("text-anchor", fromRight ? "start" : "end").attr("font-size", 10).attr("fill", C.ink3)
        .text(d.from + d.unit);
      svg.append("text").attr("x", xs(d.to) + (fromRight ? -11 : 11)).attr("y", cy).attr("dy", "0.35em")
        .attr("text-anchor", fromRight ? "end" : "start").attr("font-size", 11.5).attr("font-weight", 800)
        .attr("fill", C.strong).text(d.to + d.unit);
    });
    svg.append("circle").attr("cx", m.l + 6).attr("cy", H - 4).attr("r", 4).attr("fill", "#fff").attr("stroke", C.gray).attr("stroke-width", 2);
    svg.append("text").attr("x", m.l + 14).attr("y", H - 4).attr("dy", "0.35em").attr("font-size", 9.5).attr("fill", C.ink3).text("현재");
    svg.append("circle").attr("cx", m.l + 64).attr("cy", H - 4).attr("r", 4).attr("fill", C.brand);
    svg.append("text").attr("x", m.l + 72).attr("y", H - 4).attr("dy", "0.35em").attr("font-size", 9.5).attr("fill", C.strong).attr("font-weight", 700).text("목표");
  }

  /* ---- p12 충전앱 앱별 수집량 (가로 막대) ---- */
  function collectApps() {
    var el = document.getElementById("chart-collect-apps");
    if (!el || el.__done) return; el.__done = true;
    var W = 420, H = 150, m = { t: 6, r: 58, b: 6, l: 70 };
    var rows = [
      { l: "Green SM", v: 26603, hi: true }, { l: "PTT", v: 1518 },
      { l: "PEA", v: 499 }, { l: "EleXA", v: 263 }, { l: "LOCA EV", v: 7 }
    ];
    var x = d3.scaleLinear().domain([0, 26603]).range([m.l, W - m.r]);
    gridX(svg, x, m, W, H, [0, 8000, 16000, 24000]);
    var y = d3.scaleBand().domain(rows.map(function (d) { return d.l; })).range([m.t, H - m.b]).padding(0.34);
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    rows.forEach(function (d) {
      var cy = y(d.l), bh = y.bandwidth();
      svg.append("rect").attr("x", m.l).attr("y", cy).attr("height", bh)
        .attr("width", Math.max(2, x(d.v) - m.l)).attr("rx", 2)
        .attr("fill", d.hi ? C.brand : C.gray).attr("fill-opacity", d.hi ? 0.92 : 0.55);
      svg.append("text").attr("x", m.l - 6).attr("y", cy + bh / 2).attr("dy", "0.35em").attr("text-anchor", "end")
        .attr("font-size", 10).attr("font-weight", d.hi ? 800 : 600).attr("fill", C.ink).text(d.l);
      svg.append("text").attr("x", Math.max(x(d.v) + 5, m.l + 5)).attr("y", cy + bh / 2).attr("dy", "0.35em")
        .attr("font-size", 10).attr("font-weight", 800).attr("fill", d.hi ? C.strong : C.ink3)
        .text(d.v.toLocaleString());
    });
  }

  /* ---- p12 라오스 EV 뉴스량 추이 (2022 → 2026) ---- */
  function collectNews() {
    var el = document.getElementById("chart-collect-news");
    if (!el || el.__done) return; el.__done = true;
    var W = 420, H = 96, m = { t: 8, r: 48, b: 8, l: 44 };
    var rows = [{ l: "2022", v: 10 }, { l: "2026", v: 132, hi: true }];
    var x = d3.scaleLinear().domain([0, 132]).range([m.l, W - m.r]);
    gridX(svg, x, m, W, H, [0, 40, 80, 120]);
    var y = d3.scaleBand().domain(rows.map(function (d) { return d.l; })).range([m.t, H - m.b]).padding(0.4);
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    rows.forEach(function (d) {
      var cy = y(d.l), bh = y.bandwidth();
      svg.append("rect").attr("x", m.l).attr("y", cy).attr("height", bh)
        .attr("width", Math.max(2, x(d.v) - m.l)).attr("rx", 3)
        .attr("fill", d.hi ? C.brand : C.gray).attr("fill-opacity", d.hi ? 0.92 : 0.55);
      svg.append("text").attr("x", m.l - 6).attr("y", cy + bh / 2).attr("dy", "0.35em").attr("text-anchor", "end")
        .attr("font-size", 11).attr("font-weight", 700).attr("fill", C.ink).text(d.l);
      svg.append("text").attr("x", x(d.v) + 6).attr("y", cy + bh / 2).attr("dy", "0.35em")
        .attr("font-size", 11).attr("font-weight", 800).attr("fill", d.hi ? C.strong : C.ink3).text(d.v);
    });
  }

  /* ---- p35 실행 로드맵 타임라인 (0~36개월 · 게이트) ---- */
  function roadmap() {
    var el = document.getElementById("chart-roadmap");
    if (!el || el.__done) return; el.__done = true;
    var W = 1080, H = 300, m = { t: 26, r: 24, b: 30, l: 104 };
    var ph = [
      { k: "Phase 0", p: "0~3개월", t: "비엔티안 파일럿", s: 0, e: 3, gate: "가동률·크래시프리·온보딩 완료율", c: C.bright },
      { k: "Phase 1", p: "3~9개월", t: "비엔티안 네트워크", s: 3, e: 9, gate: "충전기당 회수 궤도·재방문율", c: C.brand },
      { k: "Phase 2", p: "9~18개월", t: "사반나켓 진출", s: 9, e: 18, gate: "단가 흑자 전환", c: C.strong },
      { k: "Phase 3", p: "18~36개월", t: "네트워크 규모화·로밍", s: 18, e: 36, gate: "네트워크 BEP", c: "#017a37" }
    ];
    var x = d3.scaleLinear().domain([0, 36]).range([m.l, W - m.r]);
    var yb = d3.scaleBand().domain(ph.map(function (d) { return d.k; })).range([m.t, H - m.b]).padding(0.45);
    var svg = newSvg(el, W, H);
    frame(svg, m, W, H);
    // 월 축
    var xa = d3.axisBottom(x).tickValues([0, 3, 9, 18, 36]).tickSize(-(H - m.t - m.b)).tickFormat(function (d) { return d + "M"; });
    svg.append("g").attr("transform", "translate(0," + (H - m.b) + ")").call(xa).call(styleAxis);
    ph.forEach(function (d) {
      var cy = yb(d.k), bh = yb.bandwidth(), x0 = x(d.s), x1 = x(d.e);
      svg.append("rect").attr("x", x0).attr("y", cy).attr("width", x1 - x0).attr("height", bh)
        .attr("rx", 5).attr("fill", d.c).attr("fill-opacity", 0.92);
      // 좌측 라벨
      svg.append("text").attr("x", m.l - 10).attr("y", cy + bh / 2 - 4).attr("text-anchor", "end")
        .attr("font-size", 12).attr("font-weight", 800).attr("fill", C.ink).text(d.k);
      svg.append("text").attr("x", m.l - 10).attr("y", cy + bh / 2 + 10).attr("text-anchor", "end")
        .attr("font-size", 9.5).attr("fill", C.ink3).text(d.p);
      // 막대 안 제목
      svg.append("text").attr("x", x0 + 8).attr("y", cy + bh / 2).attr("dy", "0.35em")
        .attr("font-size", 11).attr("font-weight", 800).attr("fill", "#fff").text(d.t);
      // 게이트 마커 + 텍스트
      svg.append("path").attr("transform", "translate(" + x1 + "," + (cy + bh / 2) + ")")
        .attr("d", d3.symbol(d3.symbolDiamond, 80)()).attr("fill", "#fff").attr("stroke", d.c).attr("stroke-width", 2);
      svg.append("text").attr("x", x1 + 12).attr("y", cy + bh / 2).attr("dy", "0.35em")
        .attr("font-size", 9.5).attr("font-weight", 700).attr("fill", C.ink3).text("▸ 게이트: " + d.gate);
    });
  }

  function run() {
    positioning(); sov(); sentiment(); twolayer(); appaxes(); hwmap(); funnel();
    donut(); journey(); prodpos(); payback(); kpi(); collectApps(); collectNews(); roadmap();
  }
  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run);
})();
