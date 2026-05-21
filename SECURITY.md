# 보안 관련 안내

## 1. API 키 저장

- **이력서 AI 평가**용 OpenAI / Gemini / Claude 키는 앱 **API 키 설정** UI에서 등록합니다.
- 키는 **Electron 메인 프로세스**에서만 사용하며, React(렌더러) 번들에는 주입하지 않습니다.
- 사용자 PC의 앱 데이터 폴더에 저장될 수 있으므로, 공용 PC에서는 사용 후 키 삭제를 권장합니다.

## 2. 자격증 목록

- 자격증 검색은 **정적 JSON**(`data/certification-names.json`)만 사용합니다. Q-Net/CareerNet API 키는 앱 실행에 필요하지 않습니다.
- 목록 재생성(`npm run generate-cert-names`)은 개발자 로컬에서만 `.env`의 `QNET_API_KEY`를 사용할 수 있습니다.

## 3. Electron app.asar

Electron 앱의 메인 프로세스 코드는 `app.asar` 안에 포함됩니다. asar를 풀면 JavaScript 소스가 노출될 수 있습니다.

- **클라이언트에 두는 비밀은 완전히 숨길 수 없습니다.** API 키는 사용자가 등록한 값이므로, PC 접근 권한이 있는 경우 키 파일을 읽을 수 있습니다.
- 배포 시 `.env`, `.enc` 등 민감 파일은 `electron-builder` 설정으로 asar/unpacked에 포함되지 않도록 제외합니다(`!**/*.enc` 등).

## 4. 이력서 데이터

- 이력서 파일·파싱 캐시·AI 분석 결과는 **로컬 폴더**에서 처리됩니다. 서버로 자동 업로드하지 않습니다(AI API 호출 시 해당 제공자로만 전송).
