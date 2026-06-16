# Sustainability Report Template (HTML/CSS)

`hmc-sr-kor-2025.pdf`(현대자동차 *Road to Sustainability* 2025)의 레이아웃·스타일을
HTML/CSS로 템플릿화한 것. 16:9 와이드스크린 캔버스, 인쇄 시 가로 A4 1장 = 1페이지.

## 파일
- `css/report.css` — 디자인 토큰 + 전 페이지 유형 스타일 (단일 스타일시트)
- `index.html` — 5개 페이지 유형을 각각 1장씩 보여주는 데모 덱
- `assets/`
  - `Pretendard-*.woff2` — 본문/제목 웹폰트 4종 (로컬 임베드, 오프라인 동작)
  - `paper-texture.jpg` — 원본 PDF 표지에서 추출한 종이 질감 배경
  - 디바이더 사진 등 추가 이미지 (없으면 그라데이션 폴백)

## 기본 골격
모든 페이지는 `<section class="page ...">` (1280×720). `.deck`로 세로로 쌓음.

```html
<section class="page page--content theme-env">
  <div class="topbar"> … 아이콘 / 챕터 내비 / 페이지번호 … </div>
  <div class="page__body"> … 콘텐츠 … </div>
</section>
```

## 페이지 유형 (class)
| class | 용도 |
|---|---|
| `page--cover` | 표지 — 화이트 패널 헤드라인 + 우하단 로고 |
| `page--contents` | 목차 — `.toc-cols` 5단 그리드 |
| `page--divider` | 챕터 표지 — 좌측 텍스트 + 우측 풀블리드 이미지(`--section-img`) |
| `page--content` | 일반 본문 — `.page-head`(국문 H1 + `.en-sub` 영문) + body |
| (factbook) | `page--content` + `.data-table` 데이터 테이블 |

## 챕터 색상 테마 (page에 함께 부여)
`theme-intro`(네이비) · `theme-env`(틸) · `theme-social`(그린) · `theme-gov`(골드) · `theme-fact`
→ `--c-accent` 변수가 바뀌어 제목·카드 상단선·내비 활성색 등에 자동 반영.

## 재사용 컴포넌트
- `.cols-2` / `.cols-3` — 다단 본문
- `.grid .grid-2|grid-3` — 그리드 배치
- `.card` (`.card-eyebrow`/`.card-title`) — 3분할 전략 카드
- `.kpi` (`.kpi-num`/`.kpi-unit`/`.kpi-label`) — 수치 강조
- `.barchart > .bar-row` — 순수 CSS 가로 막대(`.bar-fill` 너비 %, `.is-prev`=전년 흐린색)
- `.data-table` (`<caption>`, `.group-row`, `th[scope=row]`, `.label`) — Factbook 테이블
- `.footnote` — 각주

## 색상 토큰 (`:root`)
크림 `#fbf7f5` · 베이지 `#f0e9e1` · 네이비 `#002c5f` · 미드블루 `#264c77` ·
토프 `#8e7f6c` · 본문 `#4c4948` · 보더 `#e4dcd3` · 테이블헤더 `#efedea`

## 폰트
원본 전용 **Hyundai Sans**(비공개)의 가장 가까운 무료 대체로 **Pretendard**를 사용.
`assets/`에 woff2 4종(400/500/600/700)을 **로컬 임베드**해 CDN 없이도 동일하게 렌더링됨.
폰트 스택: `Pretendard → Apple SD Gothic Neo → Malgun Gothic → system-ui`.

## 로고
표지 우하단 `.cover-logo`는 **교체용 플레이스홀더**(타원 엠블럼 SVG + `BRAND` 워드마크).
실제 브랜드 로고 SVG/이미지로 바꿔 사용.

## 표지 배경
원본 표지의 종이 질감을 추출해 `paper-texture.jpg`로 사용 (`--tex` 토큰).
표지·디바이더에 적용, 일반 본문은 평면 크림(`--c-cream`) 유지 — 원본과 동일.

## 미리보기 / 출력
- 브라우저로 `index.html` 열기
- PDF: 브라우저 인쇄 → 가로 A4, 여백 없음 (`@page size: A4 landscape` 적용됨)
