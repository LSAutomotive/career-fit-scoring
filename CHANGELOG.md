# Changelog

## 1.4.0 (2026-05)

- 오프라인 자격증 목록(`data/certification-names.json`) — Q-Net/CareerNet 런타임 API 제거
- PDF AI 분석 시 `evaluations.requiredQual` 누락 보정 (프롬프트·파싱·재시도)
- 디버그 모드: AI 원문·파싱 JSON을 이력서 폴더 `debug/`에 저장
- 등급 기준 AI 생성 시 API 키 미설정 안내 개선

## 1.3.x

- Electron 데스크톱 앱 안정화, 자동 업데이트(Installer/Patcher), PDF 파싱(pdftotext)
- AI 기반 평가(등급·필수/우대/자격 만족도), 엑셀 내보내기, 채용 설정 저장/불러오기

## 1.0.0 (초기)

- Core 모듈: 자격증·경력·학력 점수 알고리즘, 커리어넷/Q-Net API 클라이언트
- 이후 Electron 앱으로 전환, DOCX/PDF 파싱·AI 평가 중심으로 재구성
