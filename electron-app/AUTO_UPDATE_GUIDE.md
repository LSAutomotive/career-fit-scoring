# 자동 업데이트 가이드

이 문서는 이력서 적합도 평가 시스템의 자동 업데이트 기능 사용 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [작동 방식](#작동-방식)
3. [업데이트 배포 방법](#업데이트-배포-방법)
4. [사용자 측 동작](#사용자-측-동작)
5. [문제 해결](#문제-해결)

## 개요

이 애플리케이션은 `electron-updater`를 사용하여 GitHub Releases를 통해 자동으로 업데이트를 확인하고 다운로드합니다.

### 주요 특징

- ✅ 앱 시작 시 자동으로 업데이트 확인
- ✅ 5분마다 백그라운드에서 업데이트 확인
- ✅ 새 버전 발견 시 자동 다운로드
- ✅ 다운로드 완료 후 사용자에게 재시작 옵션 제공
- ✅ 개발 환경에서는 자동 업데이트 비활성화

## 작동 방식

### 업데이트 체크 프로세스

1. **앱 시작 시**: 자동으로 최신 버전 확인
2. **주기적 체크**: 5분마다 백그라운드에서 업데이트 확인
3. **업데이트 발견**: 새 버전이 있으면 자동 다운로드 시작
4. **다운로드 완료**: 사용자에게 재시작 옵션 제공
5. **재시작**: 사용자가 동의하면 앱 재시작 및 업데이트 적용

### 업데이트 서버

현재 설정은 **GitHub Releases**를 사용합니다.

- 저장소: `LSAutomotive/career-fit-scoring`
- 업데이트 파일 위치: GitHub Releases의 최신 릴리스

## 업데이트 배포 방법

### 1. 버전 번호 업데이트

먼저 `package.json`의 버전 번호를 업데이트합니다:

```json
{
  "version": "1.0.2"  // 새 버전으로 변경
}
```

**버전 형식**: `MAJOR.MINOR.PATCH` (예: 1.0.2, 1.1.0, 2.0.0)

### 2. 변경사항 커밋 및 푸시

```bash
cd /home/zuri/dev/app/main/ats-system/career-fit-scoring
git add -A
git commit -m "버전 1.0.2 업데이트: [변경사항 설명]"
git push
```

### 3. 애플리케이션 빌드

Windows용 빌드:

```bash
cd electron-app
npm run build:win
```

빌드가 완료되면 `dist-installer` 폴더에 설치 파일이 생성됩니다.

### 4. GitHub Release 생성

#### 방법 1: GitHub 웹 인터페이스 사용

1. GitHub 저장소 페이지로 이동: `https://github.com/LSAutomotive/career-fit-scoring`
2. **Releases** 섹션 클릭
3. **"Create a new release"** 또는 **"Draft a new release"** 클릭
4. 다음 정보 입력:
   - **Tag version**: `v1.0.2` (버전 앞에 `v` 추가)
   - **Release title**: `v1.0.2 - [변경사항 요약]`
   - **Description**: 변경사항 상세 설명
5. **"Attach binaries"** 섹션에서 다음 파일들을 업로드:
   - `dist-installer/이력서 적합도 평가 시스템 Setup 1.0.2.exe` (Windows 설치 파일)
   - `dist-installer/latest.yml` (업데이트 메타데이터 파일 - **반드시 필요**)
6. **"Publish release"** 클릭

#### 방법 2: GitHub CLI 사용

```bash
# GitHub CLI 설치 필요 (gh)
gh release create v1.0.2 \
  --title "v1.0.2 - [변경사항 요약]" \
  --notes "변경사항 상세 설명" \
  "dist-installer/이력서 적합도 평가 시스템 Setup 1.0.2.exe" \
  "dist-installer/latest.yml"
```

### 5. 업데이트 확인

릴리스가 생성되면:

1. 사용자들이 앱을 실행하면 자동으로 업데이트를 확인합니다
2. 새 버전이 있으면 자동으로 다운로드됩니다
3. 다운로드 완료 후 사용자에게 재시작 옵션이 표시됩니다

## 사용자 측 동작

### 자동 업데이트 프로세스

1. **앱 실행**: 사용자가 앱을 실행하면 자동으로 업데이트를 확인합니다
2. **업데이트 발견**: 새 버전이 있으면 백그라운드에서 다운로드를 시작합니다
3. **다운로드 진행**: 다운로드 진행률은 콘솔에 표시됩니다 (향후 UI에 표시 가능)
4. **다운로드 완료**: 다운로드가 완료되면 다음 대화상자가 표시됩니다:

   ```
   업데이트 준비 완료
   
   새 버전이 다운로드되었습니다.
   
   버전 1.0.2이 다운로드되었습니다. 
   지금 재시작하여 업데이트를 적용하시겠습니까?
   
   [지금 재시작]  [나중에]
   ```

5. **재시작 선택**: 
   - **"지금 재시작"** 클릭: 즉시 앱이 재시작되고 업데이트가 적용됩니다
   - **"나중에"** 클릭: 다음 앱 실행 시 업데이트가 적용됩니다

### 수동 업데이트 확인

현재는 자동으로만 확인하지만, 필요시 UI에 "업데이트 확인" 버튼을 추가할 수 있습니다.

## 문제 해결

### 업데이트가 감지되지 않는 경우

1. **버전 번호 확인**: `package.json`의 버전이 릴리스 태그와 일치하는지 확인
   - 릴리스 태그: `v1.0.2`
   - package.json: `"version": "1.0.2"`

2. **latest.yml 파일 확인**: GitHub Release에 `latest.yml` 파일이 업로드되었는지 확인
   - 이 파일은 `electron-builder`가 자동으로 생성합니다
   - 파일이 없으면 업데이트가 작동하지 않습니다

3. **GitHub 저장소 설정 확인**: `electron-builder.yml`의 `publish` 섹션 확인
   ```yaml
   publish:
     provider: github
     owner: LSAutomotive
     repo: career-fit-scoring
   ```

4. **인증 토큰 확인**: GitHub Releases에 접근할 수 있는지 확인
   - Public 저장소: 인증 불필요
   - Private 저장소: GitHub Personal Access Token 필요

### 업데이트 다운로드 실패

1. **네트워크 연결 확인**: 인터넷 연결 상태 확인
2. **방화벽 설정**: GitHub에 접근할 수 있는지 확인
3. **로그 확인**: 개발자 콘솔에서 에러 메시지 확인

### 개발 환경에서 업데이트 테스트

개발 환경에서는 자동 업데이트가 비활성화되어 있습니다. 테스트하려면:

1. 프로덕션 빌드 생성: `npm run build:win`
2. 빌드된 앱 실행하여 업데이트 확인

## 고급 설정

### 업데이트 체크 주기 변경

`electron/main.ts`의 `setupAutoUpdater()` 함수에서 주기를 변경할 수 있습니다:

```typescript
// 10분마다 체크하도록 변경
setInterval(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 10 * 60 * 1000); // 10분
```

### 자체 업데이트 서버 사용

GitHub 대신 자체 서버를 사용하려면 `electron-builder.yml`을 수정:

```yaml
publish:
  provider: generic
  url: https://your-update-server.com/updates
```

그리고 `main.ts`에서:

```typescript
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://your-update-server.com/updates'
});
```

## 참고 자료

- [electron-updater 공식 문서](https://www.electron.build/auto-update)
- [electron-builder 공식 문서](https://www.electron.build/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)

## FAQ

**Q: 업데이트를 강제로 적용할 수 있나요?**  
A: 현재는 사용자가 선택할 수 있지만, 필요시 강제 업데이트 로직을 추가할 수 있습니다.

**Q: 업데이트 중 데이터 손실이 있나요?**  
A: 아니요. 업데이트는 앱 파일만 교체하며 사용자 데이터는 유지됩니다.

**Q: 오프라인 환경에서는 어떻게 되나요?**  
A: 인터넷 연결이 없으면 업데이트를 확인하지 않으며, 기존 버전으로 계속 작동합니다.

**Q: 베타 버전을 배포할 수 있나요?**  
A: 네, 버전 번호에 `-beta.1` 같은 접미사를 추가하면 가능합니다 (예: `1.0.2-beta.1`).
