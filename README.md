# md-viewer

브라우저에서 마크다운(.md) 파일을 가독성 있게 보는 정적 뷰어. 파일은 서버로 전송되지 않습니다.

## 주요 기능
- 드래그앤드롭 / 파일 선택으로 단일 .md 열기
- CommonMark + GFM (표 / 체크박스 / 취소선 / 자동링크)
- Shiki 코드 신택스 하이라이트 (라이트/다크 듀얼 테마, 클라이언트 사이드)
- 자동 목차(TOC) + 현재 섹션 하이라이트
- 다크/라이트 토글, 본문 폭 / 글자 크기 조절
- 헤딩 앵커, 코드블록 복사 버튼, 인쇄 친화 스타일
- 파일 콘텐츠는 메모리에만 존재 (저장/전송 없음)

## 개발

```
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # vitest
pnpm e2e          # playwright
pnpm build        # 정적 산출물 → dist/
pnpm lint
pnpm typecheck
```

Node 20+, pnpm 9+ 권장.

## 배포 (Vercel)
1. 새 Vercel 프로젝트 생성, 이 저장소 연결.
2. Framework Preset: **Vite** (자동 감지됨).
3. Build Command: `pnpm build`, Output Directory: `dist`.
4. 환경변수 없음. 백엔드 없음.

## 라이선스
MIT (LICENSE 참조).
