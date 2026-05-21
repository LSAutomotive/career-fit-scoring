# Career Fit Scoring — Electron App

DOCX·PDF 이력서를 파싱한 뒤 AI(OpenAI / Gemini / Claude)로 적합도·등급·근거를 평가하는 데스크톱 앱입니다.

**버전**: 이 디렉터리 `package.json`의 `version` (루트 Core와 동일)

## 빠른 시작

```bash
# 저장소 루트 — Core 빌드
npm install && npm run build

# Electron 앱
cd electron-app
npm install
npm run dev
```

`npm run dev`는 Python venv 점검 → Core 빌드 → 메인/프리로드 컴파일 → Vite(5173) → Electron 실행까지 한 번에 수행합니다.

## API 키

- **자격증 검색**: 오프라인 정적 목록 — API 키 불필요
- **AI 이력서 평가**: 앱 왼쪽 하단 **API 키 설정**에서 OpenAI / Gemini / Claude 키 등록

## 프로덕션 빌드 (Windows)

```bash
npm run build:win:installer   # 설치 프로그램
npm run build:win:patcher     # 자동 업데이트용 패처
npm run build:win:complete    # 빌드 + latest.yml 생성
```

상세: [BUILD.md](./BUILD.md), [BUILD_SCRIPTS.md](./BUILD_SCRIPTS.md)

## 릴리스·자동 업데이트

- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) — GitHub Release 절차
- [RELEASE_FILES.md](./RELEASE_FILES.md) — 업로드할 산출물
- [GENERATE_LATEST_YML.md](./GENERATE_LATEST_YML.md) — latest.yml 생성
- [AUTO_UPDATE_GUIDE.md](./AUTO_UPDATE_GUIDE.md) — electron-updater 동작

## 기타 문서

| 문서 | 내용 |
|------|------|
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 개발 모드(하얀 화면, 포트 충돌 등) |
| [CERTIFICATE_FILE.md](./CERTIFICATE_FILE.md) | 자격증 정적 목록(`certification-names.json`) |
| [../docs/PARSING_DOCX.md](../docs/PARSING_DOCX.md) | DOCX 파싱 파이프라인 |
| [../docs/PARSING_PDF.md](../docs/PARSING_PDF.md) | PDF 파싱 파이프라인 |
| [../RESUME_FORM_MAPPING_GUIDE.md](../RESUME_FORM_MAPPING_GUIDE.md) | DOCX 테이블 매핑 |

## 디렉터리

```
electron-app/
├── electron/       main.ts, preload.ts (IPC, 파싱, AI)
├── src/            React UI
├── scripts/        Poppler 복사·빌드 검증·스플래시
└── build-env/      빌드 시 asar에 포함되는 Python·JSON 등
```
