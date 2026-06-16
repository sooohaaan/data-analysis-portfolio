# KOKKOK EV Report — 발표 템플릿

NAVER 2024 통합보고서(NAVER Integrated Report 2024)의 디자인 시스템을 HTML/CSS/JS로 재현한
프레젠테이션 템플릿입니다. 이 템플릿 위에 KOKKOK EV 충전 사업 발표 자료를 제작합니다.

## 실행 방법
정적 파일이므로 서버만 있으면 됩니다.

```bash
cd /Users/masuhan/fintech4rh_presentation
python3 -m http.server 4599
# 브라우저에서 http://localhost:4599 열기
```

- 이동: `←` `→` `Space` / 화면 좌·우 클릭 / `Home` `End`
- 섹션 점프: 상단 내비게이션 탭 클릭
- 딥링크: `#s7` 처럼 해시로 특정 슬라이드 직접 열기

## 파일 구조
```
index.html                   # 빈 템플릿 — 모든 페이지 타입 데모 (디자인 레퍼런스)
kokkok-ev-presentation.html  # 실제 발표 덱 — 기존 PPTX 전체(58슬라이드)를 이식한 완성본
assets/css/style.css         # 디자인 시스템 (토큰 + 컴포넌트, 두 파일이 공유)
assets/js/deck.js            # 네비게이션 · 스케일링 · 탭 인터랙션
assets/img/                  # 발표 덱에 삽입된 NAVER 테마 차트·산출물 이미지
.claude/launch.json          # 미리보기 서버 설정
```

`kokkok-ev-presentation.html` 은 기존 `KOKKOK_EV_NAVER테마.pptx`(58슬라이드)의 모든 내용을
NAVER 스타일 템플릿으로 옮긴 발표 덱입니다 — 5개 챕터(시장분석·문제정의·데이터분석·기획설계·기대효과)
+ 부록(산출물·용어사전·데이터 인벤토리). 분석 차트는 `assets/img/*_nv.png`(NAVER 테마 버전)를 사용합니다.
> DB설계·시나리오·스토리보드·프로토타입 4개 부록 슬라이드는 원본과 동일하게 ‘화면 캡처 영역’ 자리표시이며,
> 해당 PNG를 `assets/img/`에 넣으면 자동 표시됩니다.

- `index.html` 은 컴포넌트 카탈로그 겸 기본 템플릿(보존용)입니다.
- 발표는 `kokkok-ev-presentation.html` 을 사용합니다 — `http://localhost:4599/kokkok-ev-presentation.html`

## 리브랜딩 (컬러 교체)
`assets/css/style.css` 상단 `:root` 변수만 바꾸면 전체가 즉시 리브랜딩됩니다.
현재는 NAVER 그린(`#03C75A`) 기준이며, KOKKOK 브랜드 컬러로 교체하려면:

```css
--brand:        #03C75A;   /* 메인 브랜드색  → KOKKOK 컬러로 */
--brand-strong: #02A94B;   /* 텍스트/강조용 진한 톤 */
--brand-bright: #6FE6A0;   /* 차트 막대·하이라이트 밝은 톤 */
--brand-soft:   #C9F4DA;   /* 옅은 배경 워시 */
--brand-mist:   #EAFBF1;   /* 가장 옅은 틴트 (표지/디바이더 그라데이션) */
```

## 페이지(슬라이드) 타입 — index.html에 예시 포함
| 클래스 | 용도 |
|--------|------|
| `.slide.cover` | 표지 / 마무리 (거대 타이틀 + 그라데이션) |
| `.slide.divider` | 섹션 표지 (그라데이션 + 중앙 대형 제목) |
| 일반 `.slide` | 내비/푸터 포함 콘텐츠 페이지 |

## 컴포넌트 클래스
- **헤더**: `.h-page`(대제목) `.h-eyebrow`(상단 라벨) `.h-sub`(녹색 소제목) `.h-col`(컬럼 헤더) `.rule`(라벨+라인)
- **레이아웃**: `.grid` + `.cols-2/3/4/5` `.cols-6040` `.cols-sidebar`
- **카드/지표**: `.card` `.card--fill` / `.stat .stat__num .stat__unit .stat__delta` / `.megastat`
  - 보조색 지표: `.stat--purple` `.stat--blue` `.stat--ink`
- **차트(순수 CSS)**: `.bars > .bar`(세로막대, 최신연도엔 `.is-hi`) / `.hbars > .hbar`(가로막대)
- **도넛**: 인라인 SVG (`stroke-dasharray`로 비중 조절) — index.html 슬라이드 7 참고
- **표**: `.tbl`(최신연도 열에 `.hi`) / `.matrix`(라운드 테두리 매트릭스, Goal & Progress 스타일)
- **타임라인**: `.timeline` (`.era__title` `.era__node` `.era__items`)
- **탭 전환**: `.tabs > .tab[data-panel]` + 본문 `[data-panelbody]` (JS 자동 연동)
- **이미지 자리**: `.imgbox` (실제 이미지로 교체) / `.profile`(인물 카드)

## 새 슬라이드 추가
`index.html`에서 기존 `<section class="slide" data-section="...">` 블록을 복사해
`data-section`(INTRO/BIZ/EV/APX)과 내용·푸터 페이지번호만 바꾸면 됩니다.
내비게이션·페이지 카운트·진행바는 자동으로 갱신됩니다.

## 출처/스타일 노트
- 폰트: Pretendard (CDN) — NAVER 커스텀 그로테스크의 대체
- 톤: 화이트 배경 + 블랙 헤드라인, 그린 단색 강조, 넓은 여백, 회색막대+최신연도 그린막대
- 모든 샘플 수치는 플레이스홀더입니다. 실제 데이터로 교체해 사용하세요.
