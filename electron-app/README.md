# Career Fit Scoring Electron App

Electron 데스크톱 앱입니다. DOCX·PDF 이력서를 파싱한 뒤 **Azure OpenAI**로 적합도·등급·근거를 평가합니다. 직종·자격 목록은 **커리어넷·Q-Net** API로 조회하며, 실패 시 로컬 백업 데이터를 사용할 수 있습니다.

**버전**은 이 디렉터리의 `package.json`의 `version`을 따릅니다(루트 Core 패키지와 맞춤).

## 사전 요구사항

- Node.js 18+
- 루트에서 Core 빌드 가능한 환경 (`npm install` / `npm run build` at repo root)
- 로컬 개발 시 **Python 3** 및 루트 `.venv` — `npm run dev`가 `scripts/setup-python-env.js`로 `python-docx` 등을 확인합니다
- PDF 모드: 시스템에 **pdftotext(poppler)** 가 있거나, Windows 배포본처럼 **poppler-windows**가 리소스에 포함된 경우

## 설치

```bash
# 저장소 루트에서 Core 빌드
cd ..
npm install
npm run build

# Electron 앱
cd electron-app
npm install
```

## 개발 모드 (`npm run dev`)

한 번에 다음을 수행합니다.

1. 루트 **Python 가상환경** 점검·생성 및 `python-docx`·`requests` 확인 (`../scripts/setup-python-env.js`)
2. **Core 모듈** `tsc` 빌드 후 `dist` → 루트 `src`로 JS 복사 (`build:career-fit-scoring`)
3. **메인/프리로드** TypeScript 컴파일 (`build:electron:dev`) → `electron/main.js`, `electron/preload.js`
4. **Vite** 개발 서버 `http://localhost:5173` (strict port)
5. **스플래시** 창 (`scripts/show-splash.js`)과 **Electron** 실행 (`wait-on`으로 Vite 준비 대기)

### API 키·인증서

- **패키지/실사용**: 기동 시 저장된 `.enc` 경로를 읽거나, **인증서 선택 창**에서 회사 발급 `.enc`를 지정합니다. 복호화·서명 검증은 **메인 프로세스**(`electron/main.ts`)에서만 수행되며, 키는 **렌더러 번들에 넣지 않습니다**.
- **개발**: `userData`의 `cert-config-dev.json`에 마지막으로 선택한 `.enc` 경로가 저장됩니다. 또는 터미널에서 `AZURE_OPENAI_*` 등을 export한 뒤 `npm run dev` (팀 정책에 따름).

## 프로덕션 빌드

```bash
# 프론트(Vite) + 메인 빌드 후 electron-builder (플랫폼별 설정은 electron-builder*.yml)
npm run build

# 플랫폼 예시
npm run build:win:installer   # Windows 설치 프로그램 (icon.ico, poppler 검증 스크립트 포함)
npm run build:win:patcher     # 자동 업데이트용 패처
npm run build:mac
npm run build:linux
```

Windows 설치본·패처는 **Poppler** 포함 여부를 빌드 스크립트로 검증합니다. 자세한 절차는 루트 [README.md](../README.md)의 PDF/Poppler 절을 참고하세요.

## 주요 구현 포인트

| 영역 | 설명 |
|------|------|
| **메인 프로세스** | `electron/main.ts` — IPC, 파싱(`process-resume`), Azure OpenAI, 캐시, 커리어넷/Q-Net, `.enc` 로드 |
| **프리로드** | `electron/preload.ts` — `contextBridge`로 `window.electron` API 노출 |
| **렌더러** | `src/` — React 18, `JobConfigForm`, `ResultView`, `ResumeFileList` 등 |
| **종합 점수** | `ResultView`에서 AI `evaluations`·등급·채용 설정 **가중치**로 계산. 필수 요구사항 **X** → **0**. `result.totalScore` 필드는 이 값과 무관(파싱 직후 0 고정) |
| **엑셀보내기** | 선택 후보 → `export-candidates-excel` IPC → 메인에서 `xlsx`로 저장. 컬럼은 루트 README 「결과 확인」 참고 |
| **캐시** | 선택 폴더에 `.career-fit-cache.json` (파싱·AI 결과 등) |

## 기술 스택

- Electron 28, React 18, TypeScript, Vite 5
- `career-fit-scoring` (로컬 `file:..` 패키지 / 개발 시 Vite alias로 루트 `src` 참조)
- `xlsx`, `lucide-react`, `electron-updater`

## 문제 해결

### `package.json has a valid 'main' entry`

메인 프로세스가 빌드되지 않은 경우입니다.

```bash
npm run build:electron:dev
```

### Core 모듈을 찾을 수 없음

```bash
cd ..
npm run build
cd electron-app
```

### Electron이 뜨지 않거나 Vite 연결 실패

- 5173 포트 점유 여부 확인 (`vite.config.ts`에서 `strictPort: true`)
- `node_modules` 재설치

```bash
rm -rf node_modules package-lock.json
npm install
```

### PDF 파싱 실패

- `pdftotext` 설치 및 PATH 확인, 또는 Windows 빌드 시 poppler-windows 번들 포함 여부 확인
