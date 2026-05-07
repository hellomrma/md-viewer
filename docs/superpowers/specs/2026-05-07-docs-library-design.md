# Docs Library — 폴더에 둔 마크다운을 메인 페이지에서 선택

- 작성일: 2026-05-07
- 대상 프로젝트: md-viewer (Vite + React + TS, 정적 SPA)
- 상태: Design — 구현 계획 작성 대기

## 1. 배경 / 목표

현재 md-viewer는 드래그앤드롭과 파일 선택 다이얼로그로만 마크다운을 연다. 같은 문서를 반복적으로 열거나 다른 사람과 공유하려면 매번 파일을 찾아 떨어뜨려야 한다.

**목표**: 프로젝트의 특정 폴더(`public/docs/`)에 `.md` 파일을 넣어두면, 메인 페이지에서 카드 형태로 보여주고 클릭만으로 열 수 있게 한다. 선택된 문서는 URL 쿼리스트링으로 공유 가능하다.

**비목표**:
- 서브폴더 재귀 스캔 (Phase 2 여지로 manifest schema에 `version` 필드만 둠)
- 사용자가 브라우저에서 파일을 추가/삭제 (서버리스 정적 SPA)
- 검색/필터/태그
- 마크다운 자체 편집

## 2. 사용자 흐름

1. 개발자/저자가 `public/docs/` 폴더에 `.md` 파일을 둔다 (`getting-started.md`, `api.md` 등)
2. `npm run dev`(개발) 또는 `npm run build`(배포)를 실행한다
3. 메인 페이지 Hero와 Features 사이에 **Library** 섹션이 나타나고, 각 문서가 카드로 표시된다
4. 카드 클릭 → 화면이 뷰어로 전환, URL이 `/?doc=getting-started.md`로 갱신
5. 새로고침/링크 공유 시 같은 문서가 다시 열림
6. 툴바의 "처음으로" 또는 브라우저 뒤로가기 → 메인 페이지 복귀, URL이 `/`로 정리

빈 폴더일 땐 Library 섹션 자체가 렌더되지 않아 기존 화면이 그대로 유지된다.

## 3. 아키텍처 개요

```
public/docs/*.md
       │ (vite build / dev start / file change)
       ▼
plugins/docs-manifest.ts  (새 Vite 플러그인 ~50줄)
       │ 생성
       ▼
public/docs/manifest.json  (gitignore)
       │ runtime fetch on app mount
       ▼
useDocsLibrary 훅 — 상태: idle | loading | ready | error
       │
       ├─▶ <Library /> 섹션 (Dropzone 안)
       │       │ 카드 클릭
       │       ▼
       │   loadFromUrl(file) — fetch + 기존 loadMarkdownFile 재사용
       │
       └─▶ useDocsDeepLink — URL ↔ 선택 문서 동기화
```

핵심 원칙:
- **Vite 플러그인이 빌드 타임에 manifest를 만든다** — 런타임 디렉토리 리스팅이 정적 호스팅에선 불가능하므로, 사전 생성한 manifest로 인덱스를 제공한다.
- **기존 파일 로딩 파이프라인을 그대로 재사용한다** — fetch한 텍스트를 동일한 검증/에러 코드(`BAD_ENCODING`, `TOO_LARGE`)를 통과시킨다. 새로운 에러 분기를 만들지 않는다.
- **딥링크는 manifest lookup으로만 해석한다** — `?doc=...` 값을 직접 fetch URL에 넣지 않고 manifest의 `file` 필드와 일치하는 항목만 로드한다 (path traversal 차단).

## 4. Vite 플러그인 — `vite-plugin-docs-manifest`

**위치**: `plugins/docs-manifest.ts`. `vite.config.ts`에서 import 후 `plugins` 배열에 추가.

### 4.1 책임
1. `public/docs/` 바로 아래의 `*.md`, `*.markdown` 파일 스캔 (평면, 서브폴더 무시)
2. 각 파일의 첫 H1을 제목으로 추출, 없으면 파일명 기반 fallback
3. 파일 크기를 KB로 계산 (드롭존과 동일한 표시 방식)
4. `public/docs/manifest.json` 작성

### 4.2 H1 추출 규칙
- 파일 시작부 최대 8KB만 읽는다 (대용량 파일에서 메모리 보호)
- 코드 펜스(``` 또는 ~~~) 안의 라인은 무시
- 정규식 `^# +(.+?)\s*$` 첫 매치를 제목으로 사용 (트림 후)
- 못 찾으면 fallback: 확장자 제거 → `[-_]+`을 공백으로 → 첫 글자 대문자

`sizeKB`는 H1 추출용 8KB 읽기와 무관하게 `fs.stat` 결과(`size`) 기반으로 별도 계산한다.

### 4.3 훅 포인트
- `buildStart`: 한 번 manifest 생성. 빌드 산출물에 정확한 manifest가 포함되도록 보장.
- `configureServer({ watcher })`:
  - 시작 시 1회 생성
  - `watcher.add(path.resolve('public/docs'))`
  - `add` / `change` / `unlink` 이벤트 → 디바운스(150ms) 후 재생성 → `server.ws.send({ type: 'full-reload' })`
- 자기 자신이 만든 `manifest.json`은 스캔에서 제외 (파일명 매칭)

### 4.4 manifest schema

```json
{
  "version": 1,
  "generatedAt": "2026-05-07T19:30:00.000Z",
  "docs": [
    { "file": "getting-started.md", "title": "시작하기", "sizeKB": 3 }
  ]
}
```

- `version`: 향후 그룹/태그 등 확장 시 마이그레이션 분기용
- `docs`는 파일명 알파벳 오름차순 정렬 (한국어 포함 `localeCompare('ko')`)
- `sizeKB`는 `Math.max(1, Math.round(bytes/1024))` — 드롭존 표시 규칙과 동일

### 4.5 단위 테스트 (`plugins/docs-manifest.test.ts`)

`fs/promises`로 임시 디렉토리를 만들어 검증:
- H1이 있는 파일 → title이 H1
- H1이 없는 파일 → fallback (`my_doc.md` → "My doc")
- 코드 펜스 안의 `#` → 제목으로 잡지 않음
- `.txt`나 다른 확장자 → 무시
- 정렬: `b.md`, `a.md`, `c.md` → `a, b, c`
- 빈 폴더 → `docs: []`
- 8KB를 넘는 큰 파일에서 H1이 8KB 안에 있으면 추출, 밖이면 fallback

## 5. 런타임 — 훅과 컴포넌트

### 5.1 `useDocsLibrary` (`src/hooks/useDocsLibrary.ts`)

```ts
type DocEntry = { file: string; title: string; sizeKB: number };
type LibraryState =
  | { status: "loading" }
  | { status: "ready"; docs: DocEntry[] }
  | { status: "error" };

export function useDocsLibrary(): LibraryState;
```

- 마운트 시 `fetch('/docs/manifest.json')` 1회
- 404 또는 JSON 파싱 실패 → `error`. UI는 빈 상태와 동일하게 처리(섹션 숨김) — 정적 배포에서 docs 폴더 자체가 없을 수도 있으므로 사용자에게 토스트로 알리지 않는다.
- 응답 검증: `version === 1` && `Array.isArray(docs)` && 각 항목에 `file`/`title`/`sizeKB` 존재. 실패 시 `error`.

### 5.2 `useDocsDeepLink` (`src/hooks/useDocsDeepLink.ts`)

```ts
export function useDocsDeepLink(args: {
  docs: DocEntry[] | null;          // null이면 아직 로딩 중, [] 이면 라이브러리 비어있음
  onSelect: (entry: DocEntry) => void;
  onClear: () => void;
}): {
  navigateToDoc: (entry: DocEntry) => void;
  navigateToHome: () => void;
};
```

책임:
- 마운트 시 `URLSearchParams`에서 `doc` 읽기 → docs 로딩 후 매칭되면 `onSelect`, 매칭 실패 시 `FETCH_FAILED` 토스트(App에서 처리) + URL `/`로 replace + `onClear`
- `popstate` 리스너로 뒤로가기 처리
- `navigateToDoc`: `pushState` + `onSelect`
- `navigateToHome`: `pushState('/')` + `onClear`

`docs`가 null인 동안엔 아무것도 하지 않고 대기 (manifest 로딩 끝날 때까지).

### 5.3 `loadFromUrl` 추가 (`src/hooks/useFileLoader.ts`)

```ts
loadFromUrl(file: string, sizeKB: number): Promise<void>
```

동작:
1. `fetch('/docs/' + encodeURIComponent(file))`
2. 응답 OK 아니면 `BAD_ENCODING`로 처리(드롭과 같은 코드로 통일하거나, 새 코드 `FETCH_FAILED` 추가는 보류 — 기존 토스트 텍스트 매핑 흐트림 최소화 위해 새 코드 도입)
3. 응답 본문을 `Blob` → `File`로 감싸 기존 `loadOne` 재사용

**결정**: 새 에러 코드 `FETCH_FAILED` 추가 + `App.tsx`의 `ERROR_TEXT` 매핑 확장. 사용자에게 "문서를 불러오지 못했어요" 같은 명시적 메시지를 주는 편이 인코딩 오류와 섞이는 것보다 낫다.

### 5.4 `<Library />` 컴포넌트 (`src/components/Library.tsx`)

Props:
```ts
{ docs: DocEntry[]; onSelect: (entry: DocEntry) => void }
```

레이아웃: Editorial Monochrome 디자인 시스템 클래스 재사용 (`kicker`, `ed-card`, `border-t border-ink-border` 등). 카드는 `<button>` 요소로 구현하여 키보드 접근성 보장.

```
<section class="border-t border-ink-border ...">
  <div class="mx-auto max-w-6xl px-6 py-20">
    <p class="kicker mb-6">Library</p>
    <h2 ...>라이브러리에서 바로 열기</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
      {docs.map((d, i) => (
        <button class="ed-card text-left" onClick={() => onSelect(d)}>
          <p class="... tabular-nums">{String(i+1).padStart(2,'0')}</p>
          <h3 class="...">{d.title}</h3>
          <p class="kicker mt-2">{d.file}</p>
          <p class="...">{d.sizeKB} KB</p>
        </button>
      ))}
    </div>
  </div>
</section>
```

호버 효과는 기존 `ed-card` 클래스의 hover 동작에 의존 (border 색상이 `ink-point`로 전환).

### 5.5 `Dropzone` 변경

Props 추가:
```ts
{ onFiles, library?: { docs: DocEntry[]; onSelect } }
```

- `library` 미정의 또는 `library.docs.length === 0` → 섹션 미렌더 (기존 화면과 동일)
- 그 외 → Hero 섹션 다음, Features 섹션 앞에 `<Library />` 삽입

### 5.6 `App.tsx` 변경

Shell 컴포넌트:
- `useDocsLibrary()` 호출
- `useDocsDeepLink({ docs, onSelect: handleSelect, onClear: reset })` 호출
- `handleSelect`는 내부에서 `loadFromUrl(entry.file, entry.sizeKB)` 호출
- 툴바 `onReset`은 `navigateToHome`으로 교체 (URL과 상태 동시 정리)
- `Dropzone`에 `library` prop 전달 (manifest가 ready일 때만, error/loading은 미전달 → 섹션 숨김)
- `ERROR_TEXT`에 `FETCH_FAILED: "문서를 불러오지 못했어요"` 추가

## 6. 빌드/개발 통합

### 6.1 `vite.config.ts`

```ts
import { docsManifest } from "./plugins/docs-manifest";
// ...
plugins: [react(), docsManifest()]
```

### 6.2 `.gitignore`

추가:
```
public/docs/manifest.json
```

생성물이지만 `dist/`와 달리 소스 트리 안에 들어가므로 명시적으로 제외.

### 6.3 시드 파일

`public/docs/.gitkeep` (빈 파일) — 폴더가 git에 보존되도록.
`public/docs/sample.md` — 라이브러리 동작 확인용 샘플 1개. 첫 줄에 `# 샘플 문서` 같은 H1 포함.

### 6.4 README 업데이트 (선택, Phase 1 범위)

`public/docs/`에 md 파일을 두면 메인 페이지에서 선택할 수 있다는 문장 1-2줄 추가. 본 spec에는 포함하되 우선순위 낮음.

## 7. 에러/엣지 케이스

| 상황 | 동작 |
|---|---|
| `manifest.json` 자체 없음(404) | useDocsLibrary → error → Library 섹션 숨김. 토스트 없음 |
| manifest JSON 파싱 실패 | 동일 (조용히 숨김) |
| manifest는 OK인데 특정 문서 fetch 실패 | 토스트(`FETCH_FAILED`), 메인 화면 유지, URL `/`로 정리 |
| `?doc=missing.md` (manifest에 없음) | 토스트(`FETCH_FAILED`), URL replace, 메인 |
| 5MB 초과 문서 | 기존 `TOO_LARGE` 토스트 그대로 |
| UTF-8이 아닌 문서 | 기존 `BAD_ENCODING` 토스트 그대로 |
| 빈 폴더 | 섹션 미렌더, 기존 화면 |
| 동시에 여러 카드 클릭(연타) | 마지막 클릭만 반영 (useFileLoader의 setState 직렬화에 의존, 별도 락 불필요) |

## 8. 보안 고려

- `?doc=` 값은 manifest lookup만으로 해석. fetch URL 구성에 직접 사용하지 않음.
- manifest의 `file` 자체가 빌드 타임에 우리 플러그인이 만들어낸 값이므로 신뢰 가능.
- 외부 URL은 허용하지 않음 (`http://`, `//`로 시작하면 lookup 실패로 자연스럽게 차단됨).

## 9. 테스트 계획

### 9.1 단위 테스트 (Vitest)
- `plugins/docs-manifest.test.ts` — 4.5 참조
- `useDocsLibrary.test.ts` — fetch 모킹: 정상/404/잘못된 JSON/스키마 위반
- `useDocsDeepLink.test.ts` — URL params 읽기, popstate, missing doc 처리, navigateToDoc/Home
- `useFileLoader.test.ts`에 `loadFromUrl` 케이스 추가 — fetch 모킹: 정상/404/UTF-8 디코딩 실패
- `Library.test.tsx` — 빈/정상 렌더, 클릭 시 onSelect 호출, 키보드 접근성(button role)
- `Dropzone.test.tsx` — `library` prop 없을 때 섹션 미렌더, 있을 때 카드 표시 (기존 테스트 호환 유지)
- `App.test.tsx` — manifest 로드 후 카드 클릭 → 뷰어 전환 + URL 변경 (jsdom + history mock)

### 9.2 수동 검증
1. `public/docs/`에 `sample.md` + 추가 md 2개 → `npm run dev` → 라이브러리 카드 3개 확인
2. 카드 클릭 → 뷰어 전환, URL `?doc=...` 확인
3. 새로고침 → 같은 문서 자동 로드
4. 잘못된 `?doc=zzz.md` 직접 입력 → 토스트, 메인 복귀
5. dev 중 `public/docs/`에 파일 추가/삭제 → 페이지 자동 reload, 카드 갱신
6. `public/docs/` 폴더 비움 → 라이브러리 섹션 사라짐
7. `npm run build && npm run preview` → 동일 시나리오 정상

### 9.3 회귀 검증
- 기존 드래그앤드롭/파일선택 플로우 변함 없는지
- 기존 토스트 메시지(`BAD_EXT`, `TOO_LARGE`, `BAD_ENCODING`, `MULTIPLE`) 그대로 동작

## 10. 변경/추가 파일 요약

**새 파일:**
- `plugins/docs-manifest.ts`
- `plugins/docs-manifest.test.ts`
- `src/hooks/useDocsLibrary.ts`
- `src/hooks/useDocsLibrary.test.ts`
- `src/hooks/useDocsDeepLink.ts`
- `src/hooks/useDocsDeepLink.test.ts`
- `src/components/Library.tsx`
- `src/components/Library.test.tsx`
- `public/docs/.gitkeep`
- `public/docs/sample.md`

**수정 파일:**
- `vite.config.ts` — 플러그인 등록
- `src/components/Dropzone.tsx` — `library` prop, 섹션 삽입
- `src/components/Dropzone.test.tsx` — prop 케이스 추가
- `src/App.tsx` — manifest 로드, 딥링크 훅, `loadFromUrl` 호출, `ERROR_TEXT.FETCH_FAILED`
- `src/App.test.tsx` — 통합 케이스
- `src/hooks/useFileLoader.ts` — `loadFromUrl` 추가, `FETCH_FAILED` 코드
- `src/hooks/useFileLoader.test.ts` — 케이스 추가
- `src/types.ts` — `DocEntry` 타입 추가 (필요 시)
- `.gitignore` — `public/docs/manifest.json`

## 11. Phase 2 후보 (이번 범위 제외)

- 서브폴더 재귀 + 그룹 표시 (`manifest.version` 올리고 schema 확장)
- manifest의 `order` 필드로 우선 정렬 / 핀 고정
- 검색/필터
- 외부 URL(GitHub raw 등) 라이브러리에 추가
- `<title>` 태그 동적 갱신 (열린 문서 제목 반영)
