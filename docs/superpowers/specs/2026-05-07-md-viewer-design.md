# MD Viewer — 기능 정의서 및 설계 문서

- **작성일**: 2026-05-07
- **작성자**: GwangSeub Ma (사용자) + Claude (브레인스토밍 보조)
- **상태**: Draft (사용자 검토 대기)

---

## 1. 개요

### 1.1 한 줄 정의

사용자가 `.md` 파일을 드래그하거나 선택해서 올리면, 가독성 있게 렌더링해 보여주는 정적 웹 서비스.

### 1.2 핵심 가치

- **즉시성**: 가입/로그인/설치 없이 브라우저에서 바로 본다.
- **프라이버시**: 파일은 브라우저 메모리에만 존재. 서버로 전송되지 않으며 디스크에도 저장되지 않는다.
- **가독성**: Notion/Linear 풍의 차분한 타이포그래피. 다크/라이트, 폭/폰트 조절.

### 1.3 비목표 (Out of scope, v1)

- 편집 / 저장 기능
- 다중 파일 / 폴더 / 탭
- 회원가입 / 로그인 / 내 문서함
- 공유 링크 / 임베드
- Mermaid 다이어그램, KaTeX 수식
- 본문 내 검색(Ctrl+K), 자동 새로고침, 최근 파일 목록
- GitHub URL / Gist URL 입력
- 다국어(i18n) — UI 한국어 1세트로 시작

---

## 2. 사용자 시나리오

### 2.1 주요 시나리오 (Happy Path)

1. 사용자가 `https://<도메인>` 방문.
2. 화면 중앙에 카드형 드롭존: "여기에 .md 파일을 끌어다 놓거나, 파일을 선택하세요".
3. 사용자가 `.md` 파일을 드롭(또는 버튼 클릭으로 선택).
4. 파일이 즉시 렌더링됨. 좌측에 자동 목차(TOC), 우측 상단에 툴바(다크모드 / 폭 / 폰트 / 인쇄 / 새 파일 열기).
5. 사용자가 TOC 항목을 클릭 → 해당 섹션으로 부드럽게 스크롤.
6. 사용자가 다크모드 토글 → 본문/코드 하이라이트가 다크 톤으로 즉시 전환.
7. 사용자가 "새 파일 열기" 클릭 → 드롭존 화면으로 복귀.

### 2.2 부수 시나리오

- 사용자가 인쇄(Ctrl+P) → TOC/툴바가 숨겨진 인쇄 친화 레이아웃으로 PDF 저장 가능.
- 사용자가 코드블록의 "복사" 버튼 클릭 → 클립보드에 복사 + Toast 안내.
- 사용자가 헤딩의 앵커 아이콘 클릭 → URL 해시 갱신 + 클립보드 복사.

---

## 3. 기능 정의

### 3.1 기능 목록

| ID  | 기능                                                      | 우선순위 | 비고                                              |
| --- | --------------------------------------------------------- | -------- | ------------------------------------------------- |
| F01 | 드래그앤드롭으로 .md 파일 열기                            | 必       | 단일 파일만                                       |
| F02 | 파일 선택 다이얼로그로 .md 파일 열기                      | 必       | `<input type="file" accept=".md,.markdown">`      |
| F03 | CommonMark + GFM 렌더링                                   | 必       | 표/체크박스/취소선/자동링크                       |
| F04 | 코드블록 신택스 하이라이트                                | 必       | Shiki, 라이트/다크 듀얼 테마                      |
| F05 | 다크/라이트 모드 토글                                     | 必       | 시스템 설정 따름 + 사용자 토글, localStorage 영속 |
| F06 | 자동 목차(TOC) 사이드바                                   | 必       | H1~H3, 현재 섹션 하이라이트                       |
| F07 | 본문 폭/폰트 크기 토글                                    | 必       | 좁게/보통/넓게, S/M/L                             |
| F08 | 헤딩 앵커 + 슬러그                                        | 必       | `rehype-slug` + `rehype-autolink-headings`        |
| F09 | 코드블록 복사 버튼                                        | 必       | 데스크톱: hover 시 노출 / 모바일(터치): 항상 노출 |
| F10 | 인쇄 친화 스타일                                          | 必       | TOC/툴바 숨김, 본문만                             |
| F11 | "새 파일 열기" → 드롭존 복귀                              | 必       | 메모리 초기화                                     |
| F12 | 외부 링크 자동 `target="_blank" rel=noopener noreferrer"` | 必       | 보안                                              |
| F13 | XSS 방지 sanitize                                         | 必       | `rehype-sanitize` 커스텀 스키마                   |
| F14 | 모바일 레이아웃 (TOC 숨김, 툴바 축소)                     | 必       | < 768px                                           |

### 3.2 입력 검증

| 항목      | 규칙                   | 실패 시                                                |
| --------- | ---------------------- | ------------------------------------------------------ |
| 확장자    | `.md` 또는 `.markdown` | Toast: "마크다운 파일만 열 수 있어요 (.md, .markdown)" |
| 파일 크기 | 5MB 이하               | Toast: "5MB 이하 파일만 지원해요"                      |
| 인코딩    | UTF-8                  | Toast: "UTF-8 마크다운 파일이어야 해요"                |
| 드롭 개수 | 1개                    | Toast: "한 번에 하나의 파일만 열 수 있어요"            |
| 폴더 드롭 | 거부                   | Toast: "단일 .md 파일을 드롭해주세요"                  |

### 3.3 환경설정 (영속, localStorage)

| 키          | 값                           | 기본     |
| ----------- | ---------------------------- | -------- |
| `mdv:theme` | `light` / `dark` / `system`  | `system` |
| `mdv:width` | `narrow` / `normal` / `wide` | `normal` |
| `mdv:font`  | `s` / `m` / `l`              | `m`      |

파일 내용은 절대 영속화하지 않는다.

---

## 4. 시스템 아키텍처

### 4.1 배포 형태

- **유형**: 단일 페이지 정적 사이트 (SPA).
- **호스팅**: Vercel. 백엔드 / API 라우트 / 데이터베이스 없음.
- **빌드**: Vite 정적 빌드 산출물.

### 4.2 기술 스택

| 레이어          | 선택                                       | 이유                                   |
| --------------- | ------------------------------------------ | -------------------------------------- |
| 빌드 도구       | Vite                                       | 가벼움, HMR 빠름                       |
| 프레임워크      | React 18 + TypeScript                      | 컴포넌트 격리/타입 안전성              |
| 스타일링        | Tailwind CSS                               | 유틸리티 기반, 다크모드 토큰 관리 용이 |
| 마크다운 렌더   | `react-markdown`                           | React 트리에 자연스럽게 결합           |
| 마크다운 파싱   | `remark-parse` + `remark-gfm`              | GFM 표준                               |
| HTML 변환       | `remark-rehype`                            | AST 변환 표준 파이프라인               |
| 코드 하이라이트 | `rehype-shiki` (듀얼 테마)                 | 빌드타임 처리, 런타임 비용 0           |
| 슬러그/앵커     | `rehype-slug` + `rehype-autolink-headings` | 헤딩 ID + 클릭 가능 앵커               |
| Sanitize        | `rehype-sanitize`                          | XSS 방지, 화이트리스트 기반            |
| 테스트          | Vitest + Testing Library + Playwright      | 표준 조합                              |

### 4.3 페이지 구성

- 라우트: `/` 한 개.
- 빈 상태(파일 미선택): 드롭존 화면.
- 채워진 상태: 좌(TOC) / 중(본문) / 상(툴바) 3분할.

---

## 5. 컴포넌트 분해

```
src/
├── App.tsx                  # 레이아웃 셸, 빈 상태/채워진 상태 분기
├── main.tsx                 # Vite 엔트리
├── index.css                # Tailwind 베이스 + 마크다운 스타일 토큰
│
├── components/
│   ├── Dropzone.tsx         # 드래그영역 + 파일 선택 버튼
│   ├── Toolbar.tsx          # 다크모드/폭/폰트/인쇄/새파일
│   ├── TocSidebar.tsx       # 헤딩 트리 + 활성 섹션 하이라이트
│   ├── MarkdownView.tsx     # react-markdown 렌더링 컨테이너
│   ├── CodeBlock.tsx        # 코드 블록 + 복사 버튼 래퍼
│   └── Toast.tsx            # 에러/안내 알림
│
├── hooks/
│   ├── useFileLoader.ts     # 드롭/선택 → 검증 → 텍스트 디코딩
│   ├── useHeadings.ts       # 본문 DOM에서 H1~H3 수집
│   ├── useActiveHeading.ts  # IntersectionObserver로 현재 섹션 추적
│   └── usePreferences.ts    # 환경설정 + localStorage 동기화
│
├── lib/
│   ├── markdown.ts          # remark/rehype 플러그인 체인 설정
│   └── sanitizeSchema.ts    # rehype-sanitize 스키마
│
└── types.ts                 # FileMeta, Preferences 등 공용 타입
```

**경계 규칙**

- 컴포넌트는 표시만 한다. 파일 입출력 / 파싱은 hooks·lib로 격리.
- `MarkdownView`는 텍스트(`string`)만 받는다. 파일 핸들링은 모름.
- 환경설정은 Context 1개로만 흐름. Prop drilling 금지.

---

## 6. 데이터 플로우

```
사용자 입력 (드롭 / 선택)
        ↓
   File 객체
        ↓
useFileLoader(file)
  ├─ 확장자 검증 (.md, .markdown)
  ├─ 크기 검증 (≤ 5MB)
  ├─ FileReader.readAsText / TextDecoder('utf-8', { fatal: true })
  └─ { name, content, sizeKB } 또는 에러
        ↓
React state: currentFile (App 컴포넌트)
        ↓
   ┌────┴────┐
   ↓         ↓
MarkdownView    useHeadings (DOM 스캔)
   │              ↓
plugin chain    TocSidebar
   │              ↓
   ↓         useActiveHeading
JSX 출력     (IntersectionObserver)
                  ↓
              활성 헤딩 ID 갱신
```

**핵심 규칙**

- 파일 콘텐츠는 React state에만 존재. "새 파일 열기" → state 초기화 → GC.
- TOC는 렌더 후 DOM에서 헤딩을 읽는다 (간단/정확). AST 직접 추출하지 않음.
- Shiki 듀얼 테마: 라이트/다크 스타일을 동시에 출력하고 CSS 변수로 토글.

---

## 7. 에러 & 엣지 케이스

| 케이스                                          | 처리                                                   |
| ----------------------------------------------- | ------------------------------------------------------ |
| 비-마크다운 확장자                              | 검증 실패 Toast, 상태 변경 없음                        |
| 5MB 초과                                        | 검증 실패 Toast                                        |
| 비-UTF-8 인코딩                                 | `TextDecoder` fatal 모드 실패 → Toast                  |
| 빈 파일 / 공백만                                | 정상 렌더 + 안내 문구 ("내용이 비어 있어요")           |
| 깨진 마크다운 문법                              | remark가 관대하게 파싱. 별도 처리 없음                 |
| 외부 이미지 URL                                 | 그대로 표시                                            |
| 상대 경로 이미지                                | 로드 불가 → 깨진 자리에 alt 텍스트 placeholder         |
| 외부 링크                                       | `target=_blank rel=noopener noreferrer` 자동 부여      |
| 위험 태그 (`<script>`, `<iframe>`, on\* 핸들러) | rehype-sanitize 제거                                   |
| 매우 긴 줄 / 큰 표                              | 컨테이너 `overflow-x-auto`, 표는 wrapper로 가로 스크롤 |
| 동일 헤딩 텍스트                                | rehype-slug 자동 `-1`, `-2` 접미                       |
| 좁은 화면 (< 768px)                             | TOC 숨김, 툴바 축소                                    |
| 폴더 / 다중 파일 드롭                           | 거부 + Toast                                           |

**보안 기본자세**

- rehype-sanitize 스키마: GitHub 화이트리스트 베이스 + Shiki 클래스/스타일 화이트리스트만 추가.
- `javascript:` URL, 이벤트 핸들러 속성, raw HTML 위험 태그 차단.
- 외부 fetch 없음(이번 v1 기준).

---

## 8. 디자인 톤 & 타이포그래피

- **톤**: Notion / Linear 계열. 여백 넉넉, 부드러운 회색 톤, 명료한 위계.
- **본문 폰트 (한글/영문 혼용)**: `system-ui, -apple-system, "Segoe UI", "Pretendard Variable", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`.
- **코드 폰트**: `"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace`.
- **본문 폭 토큰**: narrow `640px` / normal `760px` / wide `920px`.
- **폰트 크기 토큰**: S `15px` / M `16px` / L `18px`. 행간 `1.7`.
- **다크모드 색**: 배경 `#0f1115`, 본문 `#e6e7ea`, 코드블록 배경 `#161922`. (Shiki 다크 테마와 조화)
- **라이트모드 색**: 배경 `#ffffff`, 본문 `#1f2328`, 코드블록 배경 `#f6f7f9`.
- **인쇄 스타일**: TOC/툴바 숨김, 본문은 검정 텍스트 + 흰 배경 강제.

---

## 9. 테스트 전략

| 레이어   | 대상                                                       | 도구               |
| -------- | ---------------------------------------------------------- | ------------------ |
| 단위     | `lib/markdown.ts` 변환 결과 (GFM, sanitize)                | Vitest + 스냅샷    |
| 단위     | `useFileLoader` 검증 분기                                  | Vitest (File mock) |
| 단위     | `usePreferences` localStorage / 시스템 다크모드            | Vitest             |
| 단위     | `useHeadings` / `useActiveHeading` DOM/IO 모킹             | Vitest + jsdom     |
| 컴포넌트 | `Dropzone` 드래그 상태, 거부 케이스                        | Testing Library    |
| 컴포넌트 | `Toolbar` 토글 → Context 값 변경                           | Testing Library    |
| 컴포넌트 | `CodeBlock` 복사 → clipboard mock                          | Testing Library    |
| E2E      | 골든패스 1종: 드롭 → 헤딩 → TOC 클릭 → 다크 토글 → 새 파일 | Playwright         |

**커버리지 기준**: `lib/`, `hooks/` 100% 라인 커버 목표. 컴포넌트는 핵심 분기만.

**CI**: GitHub Actions — `pnpm install` → `typecheck` → `lint` → `test` → `build`. Vercel은 PR 프리뷰 자동.

---

## 10. 향후 확장 여지 (구조가 막지 않음)

- **Mermaid / KaTeX**: `lib/markdown.ts`에 플러그인만 추가.
- **자동 새로고침 (File System Access API)**: `useFileLoader`에 분기 추가.
- **다중 파일 모드**: TOC 사이드바 → 파일 트리 사이드바 분기.
- **공유 링크**: 백엔드 추가 시 작은 API + KV 스토리지로.
- **i18n**: UI 텍스트 분리만 하면 됨.

---

## 11. 성공 기준

- [ ] 모든 F01~F14 기능이 작동하고 골든패스 E2E가 그린.
- [ ] 5MB UTF-8 .md 파일 렌더링 시 First Contentful Paint < 1s (로컬 기준).
- [ ] 5MB .md 파일에 대해서도 스크롤 60fps 유지.
- [ ] Lighthouse Accessibility ≥ 95.
- [ ] 모바일(360px 폭)에서 본문 가독성 유지.
- [ ] XSS 페이로드(`<script>alert(1)</script>` 등) 입력 시 무력화.
- [ ] Vercel 프로덕션 배포 성공, 정적 자산만 서빙.
