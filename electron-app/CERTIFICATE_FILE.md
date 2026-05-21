# 자격증 목록 (정적 데이터)

앱은 Q-Net/CareerNet API를 런타임에 호출하지 않습니다. 아래 JSON을 사용합니다.

## certification-names.json

- **저장소 경로**: `career-fit-scoring/data/certification-names.json`
- **빌드 시 복사**: `electron-app/scripts/copy-scripts-for-build.js` → `electron-app/build-env/certification-names.json` (asar 포함)
- **내용**: Q-Net 국가자격 + `certificate_official.txt`(공인민간) + `src/certificateParser.ts`의 추가 국가자격

## 목록 갱신 (개발자)

```bash
# 프로젝트 루트 — .env에 QNET_API_KEY 필요 (1회 fetch)
npm run generate-cert-names

# Q-Net fetch 없이 official/additional만 재병합
node scripts/generate-certification-names.js --skip-fetch
```

`certificate_official.txt`는 Git에 포함하지 않을 수 있습니다. 로컬에 두면 generate 시 자동 병합됩니다.
