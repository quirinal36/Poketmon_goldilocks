# 마일스톤

> **2026-09-30 구현 체크포인트:** 로컬 게임 코드·문제은행·검사 도구·ZIP·안내서 구현을 마쳤습니다. 최신 실행 증거와 제한은 [VERIFICATION.md](VERIFICATION.md)를 참고하세요. 아래 계획의 과거 중단 상태와 예정 순서는 이 체크포인트 이전 기록입니다. Supabase 실제 온라인 검증·Vercel 운영 배포·라운지 등록과 실기기 확인을 하지 않았으므로 전체 출시 완료로 표시하지 않습니다.

> 기준: [PLAN.md](PLAN.md), 작성일: 2026-09-30. [GitHub 마일스톤](https://github.com/quirinal36/my_game/milestones).

단계 1과 단계 2는 기초 모듈과 문제은행을 함께 완성해야 하므로 M1에 묶었다. 단계 3~7은 M2~M6에 대응한다. 일정이 정해지지 않아 마감일과 담당자를 임의 지정하지 않았다.

| 마일스톤 | 계획 단계 | 포함 에픽 |
|---|---|---|
| [M1 · 기초 모듈·문제은행 완성](https://github.com/quirinal36/my_game/milestone/1) | 단계 1·2 | [E1 · 기초 런타임과 공통 모듈 완성](https://github.com/quirinal36/my_game/issues/1), [E2 · 수학·영어 문제은행 완성 및 독립 검증](https://github.com/quirinal36/my_game/issues/2) |
| [M2 · 첫 체육관까지 플레이 구현](https://github.com/quirinal36/my_game/milestone/2) | 단계 3 | [E3 · 태초마을부터 첫 체육관까지 게임 기능 구현](https://github.com/quirinal36/my_game/issues/3) |
| [M3 · 통합·E2E 통과](https://github.com/quirinal36/my_game/milestone/3) | 단계 4 | [E4 · 서비스 통합과 전체 플레이 검증](https://github.com/quirinal36/my_game/issues/4) |
| [M4 · 품질 검토·수정 완료](https://github.com/quirinal36/my_game/milestone/4) | 단계 5 | [E5 · 다섯 관점 품질 검토와 반복 수정](https://github.com/quirinal36/my_game/issues/5) |
| [M5 · 배포 패키지·안내서 준비](https://github.com/quirinal36/my_game/milestone/5) | 단계 6 | [E6 · 라운지 배포 패키지와 이용 안내 준비](https://github.com/quirinal36/my_game/issues/6) |
| [M6 · 서비스 배포·라운지 등록](https://github.com/quirinal36/my_game/milestone/6) | 단계 7 | [E7 · Supabase 연결과 Vercel·라운지 서비스 배포](https://github.com/quirinal36/my_game/issues/7) |

실행 순서: **M1 → M2 → M3 → M4 → M5 → M6**. Supabase 프로젝트 준비(T28)는 병행 가능하며, Vercel 배포(T30)는 Supabase 없이 진행 가능하다. 온라인 검증(T29)을 마치기 전에는 전체 출시 완료로 표시하지 않는다.

<a id="m1"></a>

## M1 — 기초 모듈·문제은행 완성

GitHub: [M1 · 기초 모듈·문제은행 완성](https://github.com/quirinal36/my_game/milestone/1)

기준: [PLAN.md](https://github.com/quirinal36/my_game/blob/70b60f1/docs/PLAN.md) 단계 1·2

### 목표

엔진·아트·학습·오디오를 완성하고 1-1~2-2 수학·영어 문제은행을 검증한다.

### 진입 조건

단계 0 완료(1ea8ab0). 기존 파일에서 이어서 작업한다.

### 포함 에픽

- [E1 · 기초 런타임과 공통 모듈 완성](https://github.com/quirinal36/my_game/issues/1)
- [E2 · 수학·영어 문제은행 완성 및 독립 검증](https://github.com/quirinal36/my_game/issues/2)

### 종료 조건

- [ ] E1·E2의 하위 이슈 완료 및 미해결 Requests 정리
- [ ] npm run build와 npm test 통과, npm run data:questions 성공
- [ ] 모든 레슨 20문제 이상, 생성 검증기 오류 0개, 수학·영어 독립 검증 통과
- [ ] 251종 데이터·스프라이트 검증 및 단계 1 체크포인트 커밋

기한: 미정. 계획서에 일정이 없어 임의 마감일을 설정하지 않는다.


<a id="m2"></a>

## M2 — 첫 체육관까지 플레이 구현

GitHub: [M2 · 첫 체육관까지 플레이 구현](https://github.com/quirinal36/my_game/milestone/2)

기준: [PLAN.md](https://github.com/quirinal36/my_game/blob/70b60f1/docs/PLAN.md) 단계 3

### 목표

태초마을에서 회색배지까지의 지역·스토리·전투·화면을 구현한다.

### 진입 조건

M1 완료 후 시작. 지역 작업 전에 출구 좌표표를 확정한다.

### 포함 에픽

- [E3 · 태초마을부터 첫 체육관까지 게임 기능 구현](https://github.com/quirinal36/my_game/issues/3)

### 종료 조건

- [ ] 세 지역 18개 맵과 양방향 연결, 공용 스크립트 구현
- [ ] 스타팅 7종 선택 → 라이벌 → 포획 → 도장 4개 → 웅 → 배지 → 3번도로 개방
- [ ] 문제 연동 전투·포획·기절·경험치·분기 진화 및 모든 계획 화면 구현
- [ ] npm run build와 npm test 통과, 단계 3 체크포인트 커밋

기한: 미정. 계획서에 일정이 없어 임의 마감일을 설정하지 않는다.


<a id="m3"></a>

## M3 — 통합·E2E 통과

GitHub: [M3 · 통합·E2E 통과](https://github.com/quirinal36/my_game/milestone/3)

기준: [PLAN.md](https://github.com/quirinal36/my_game/blob/70b60f1/docs/PLAN.md) 단계 4

### 목표

서비스와 데이터를 연결하고 실제 플레이 흐름·맵 무결성·화면 크기를 검증한다.

### 진입 조건

M2 기능 구현 완료.

### 포함 에픽

- [E4 · 서비스 통합과 전체 플레이 검증](https://github.com/quirinal36/my_game/issues/4)

### 종료 조건

- [ ] Requests, pullSave 병합, 분기 진화 선택, 야생 출현 필터, 아이콘 링크 통합
- [ ] scripts/check-maps.mjs의 8가지 정적 검사 통과
- [ ] 1024×768·768×1024에서 정상 진행과 오답·기절 복귀 E2E 통과
- [ ] 5개 해상도 × 주요 화면 10개에서 넘침·겹침 없음
- [ ] 오프라인 콘솔 오류 없음, 온라인 검증은 Supabase 준비 시 수행하고 미완료 시 M6에서 완료
- [ ] npm run build와 npm test 통과, 단계 4 체크포인트 커밋

기한: 미정. 계획서에 일정이 없어 임의 마감일을 설정하지 않는다.


<a id="m4"></a>

## M4 — 품질 검토·수정 완료

GitHub: [M4 · 품질 검토·수정 완료](https://github.com/quirinal36/my_game/milestone/4)

기준: [PLAN.md](https://github.com/quirinal36/my_game/blob/70b60f1/docs/PLAN.md) 단계 5

### 목표

아동 사용성·정확성·교육 내용·성능·한국어의 다섯 관점을 검토하고 교차 확인한다.

### 진입 조건

M3 통과. 검토 결과에는 재현 절차와 근거를 남긴다.

### 포함 에픽

- [E5 · 다섯 관점 품질 검토와 반복 수정](https://github.com/quirinal36/my_game/issues/5)

### 종료 조건

- [ ] 56px 이상 터치 영역, 읽기·음성·실패 복구 및 한국어 검토
- [ ] 저장·진도·날짜·경험치·진화·무한 대기, 60fps·로딩·메모리 검토
- [ ] 교육과정 순서·난이도 곡선·체육관 출제 수준 검토
- [ ] 발견 사항을 다른 검토자가 반박 검증하고 수정 후 재검증
- [ ] 새 문제가 두 번 연속 나오지 않고 기존 발견 사항 해결, 단계 5 체크포인트 커밋

기한: 미정. 계획서에 일정이 없어 임의 마감일을 설정하지 않는다.


<a id="m5"></a>

## M5 — 배포 패키지·안내서 준비

GitHub: [M5 · 배포 패키지·안내서 준비](https://github.com/quirinal36/my_game/milestone/5)

기준: [PLAN.md](https://github.com/quirinal36/my_game/blob/70b60f1/docs/PLAN.md) 단계 6

### 목표

라운지 ZIP, 교사·학부모 안내서, 홈 화면 메타데이터를 준비한다.

### 진입 조건

M4 완료.

### 포함 에픽

- [E6 · 라운지 배포 패키지와 이용 안내 준비](https://github.com/quirinal36/my_game/issues/6)

### 종료 조건

- [ ] npm run zip:lounge로 파일 500개 이하·30MB 이하 ZIP 생성
- [ ] ZIP은 상대경로만 사용하고 config.js를 비워 오프라인 동작
- [ ] docs/TEACHER_GUIDE.md에 보호자 메뉴·진도·문제 미리보기·이어하기 코드 안내
- [ ] manifest.webmanifest 및 홈 화면 아이콘 연결 확인

기한: 미정. 계획서에 일정이 없어 임의 마감일을 설정하지 않는다.


<a id="m6"></a>

## M6 — 서비스 배포·라운지 등록

GitHub: [M6 · 서비스 배포·라운지 등록](https://github.com/quirinal36/my_game/milestone/6)

기준: [PLAN.md](https://github.com/quirinal36/my_game/blob/70b60f1/docs/PLAN.md) 단계 7

### 목표

Vercel과 라운지에 게임을 배포하고 온라인·오프라인 최종 완료 기준을 확인한다.

### 진입 조건

M5 완료. Supabase 준비는 앞당길 수 있고, Vercel 배포는 Supabase 없이도 가능하다.

### 포함 에픽

- [E7 · Supabase 연결과 Vercel·라운지 서비스 배포](https://github.com/quirinal36/my_game/issues/7)

### 종료 조건

- [ ] 사용자가 Supabase 프로젝트를 준비한 뒤 스키마·RLS·RPC·익명 로그인·시드 적용
- [ ] 온라인과 오프라인 모두 콘솔 오류 없이 저장·문제 출제 동작
- [ ] letscoding's projects 팀의 Vercel 운영 URL 확인
- [ ] 라운지 외부 링크 등록, 오프라인 ZIP 생성 및 ZIP 실행 확인
- [ ] PLAN §1.3의 6개 DoD를 증거 링크와 함께 확인하고 배포 체크포인트 커밋

기한: 미정. 계획서에 일정이 없어 임의 마감일을 설정하지 않는다.


## 출시 완료 기준

- [ ] npm run build 타입 오류 0개, npm test 전부 통과
- [ ] 1024×768·768×1024에서 새 게임→스타팅→라이벌→1번도로 포획→회색배지 E2E 통과
- [ ] 설정 없는 오프라인과 Supabase 온라인 모두 콘솔 오류 없이 동작
- [ ] 모든 레슨 20문제 이상, 검증기 오류 0개, 독립 검증 통과
- [ ] 1024×768·768×1024·1280×800·820×1180·375×667에서 화면 넘침 없음
- [ ] Vercel URL 동작, 라운지 ZIP 생성(500개·30MB 이하), 라운지 등록
