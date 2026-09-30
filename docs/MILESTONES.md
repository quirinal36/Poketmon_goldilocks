# 마일스톤

> **기존 장 기록:** 첫 체육관까지의 게임과 로그인·계정 저장은 커밋 `bdceb57`까지 구현되었습니다. 배포 설정은 [DEPLOY.md](DEPLOY.md), 기존 게임 검증 기록은 [VERIFICATION.md](VERIFICATION.md)를 참고하세요. 아래 M1~M6의 체크리스트는 최초 제작 계획을 보존한 것으로, 현재 GitHub 완료 상태를 나타내지 않습니다.

> **두 번째 장:** [STORY_CHAPTER_2.md](STORY_CHAPTER_2.md)를 기준으로 [M7~M9](#chapter2)를 GitHub에 등록했습니다. 완료 상태는 [GitHub 마일스톤](https://github.com/quirinal36/Poketmon_goldilocks/milestones)에서 확인합니다.

> 기준: [PLAN.md](PLAN.md), 작성일: 2026-09-30. [GitHub 마일스톤](https://github.com/quirinal36/Poketmon_goldilocks/milestones).

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

상태: 완료. E7과 T28~T31을 2026-09-30 완료 처리했다.

GitHub: [M6 · 서비스 배포·라운지 등록](https://github.com/quirinal36/my_game/milestone/6)

기준: [PLAN.md](https://github.com/quirinal36/my_game/blob/70b60f1/docs/PLAN.md) 단계 7

### 목표

Vercel과 라운지에 게임을 배포하고 온라인·오프라인 최종 완료 기준을 확인한다.

### 진입 조건

M5 완료. Supabase 준비는 앞당길 수 있고, Vercel 배포는 Supabase 없이도 가능하다.

### 포함 에픽

- [E7 · Supabase 연결과 Vercel·라운지 서비스 배포](https://github.com/quirinal36/my_game/issues/7)

### 종료 조건

- [x] 사용자가 Supabase 프로젝트를 준비한 뒤 스키마·RLS·RPC·익명 로그인·시드 적용
- [x] 온라인과 오프라인 모두 콘솔 오류 없이 저장·문제 출제 동작
- [x] letscoding's projects 팀의 Vercel 운영 URL 확인
- [x] 라운지 외부 링크 등록, 오프라인 ZIP 생성 및 ZIP 실행 확인
- [x] PLAN §1.3의 6개 DoD를 증거 링크와 함께 확인하고 배포 체크포인트 커밋

기한: 미정. 계획서에 일정이 없어 임의 마감일을 설정하지 않는다.


## 기존 출시 완료 기준 (M1~M6)

- [x] npm run build 타입 오류 0개, npm test 전부 통과
- [x] 1024×768·768×1024에서 새 게임→스타팅→라이벌→1번도로 포획→회색배지 E2E 통과
- [x] 설정 없는 오프라인과 Supabase 온라인 모두 콘솔 오류 없이 동작
- [x] 모든 레슨 20문제 이상, 검증기 오류 0개, 독립 검증 통과
- [x] 1024×768·768×1024·1280×800·820×1180·375×667에서 화면 넘침 없음
- [x] Vercel URL 동작, 라운지 ZIP 생성(500개·30MB 이하), 라운지 등록

<a id="chapter2"></a>

## 다음 장 제작 계획 — 달맞이산부터 두 번째 배지까지

범위: 기존 3번도로 확장, 새 맵 7개, 달맞이산 수첩 사건, 블루시티·이슬, 기존 저장으로 이어하기. 상세 이야기는 [스토리 기획](STORY_CHAPTER_2.md), 등록할 이슈 본문은 [E8~E10](GITHUB_ISSUES.md#chapter2)을 따른다.

| 마일스톤 | 플레이 가능한 결과 | 에픽·작업 | 상태 |
|---|---|---|---|
| [M7 · 달맞이산 사건과 블루시티 연결](#m7) | 기존 저장에서 산을 넘어 블루시티까지 이동 | [E8](GITHUB_ISSUES.md#e8), T32~T36 (5개) | 구현·자동 검증 완료 |
| [M8 · 두 번째 배지와 저장·재개 완성](#m8) | 이슬에게 배지를 받고, 중단 후에도 진행 유지 | [E9](GITHUB_ISSUES.md#e9), T37~T39 (3개) | 구현·자동 검증 완료 |
| [M9 · 다음 장 검증과 배포](#m9) | 검증된 다음 장을 운영 도메인과 라운지 Play 링크로 제공 | [E10](GITHUB_ISSUES.md#e10), T40~T43 (4개) | 검증 중 |

실행 순서: **M7 → M8 → M9**. T32에서 연결·저장 기준을 정한 뒤 T33·T34·T35는 병행할 수 있다. 구현 중에는 각 작업의 검증을 함께 수행하며, M9에서 전체 흐름을 확인한다. 담당자와 마감일은 미정이다.

<a id="m7"></a>

## M7 — 달맞이산 사건과 블루시티 연결

GitHub 마일스톤: [#7](https://github.com/quirinal36/Poketmon_goldilocks/milestone/7)

목표: 회색배지 저장에서 달맞이산 사건을 해결하고 블루시티까지 왕복할 수 있게 한다.

진입 조건: 기존 회색배지·3번도로 저장을 준비하고 [스토리 기획](STORY_CHAPTER_2.md)의 범위를 기준으로 작업한다. 기존 M6의 미확인 항목은 별도로 추적하며, 새 장의 지도·이야기 제작을 막는 조건으로 사용하지 않는다.

포함 이슈:

- [T32 · 새 지역 연결·진행·저장 기준 정리](GITHUB_ISSUES.md#t32)
- [T33 · 3번도로·달맞이산·4번도로 맵과 아트 구현](GITHUB_ISSUES.md#t33)
- [T34 · 블루시티와 실내 맵·아트 구현](GITHUB_ISSUES.md#t34)
- [T35 · 새 지역 야생 출현과 트레이너 편성 추가](GITHUB_ISSUES.md#t35)
- [T36 · 달맞이산 수첩 사건과 회복·출구 구현](GITHUB_ISSUES.md#t36)

종료 조건:

- [x] 기존 18개 맵에 7개 맵을 더한 총 25개 맵의 출구·문·복귀 좌표 검증 통과.
- [x] 새 게임 없이 회색배지 저장에서 3번도로 → 달맞이산 → 4번도로 → 블루시티 이동 및 귀환 가능.
- [x] 연구원 부탁 → 삐삐 안내 → 로켓단 승리 → 수첩 반환 → 출구 개방 순서가 동작.
- [x] 연구원 회복과 기절 복귀가 동작하고, 3번도로의 기존 학기 선물 유지.
- [x] 새 맵·NPC·포켓몬의 누락 이미지가 없고, 변경된 코드의 빌드·단위 검사·맵 검사 통과.

산출물: 지역·사건 구현, 새 아트, 출구 좌표와 진행 기록, 관련 검증 결과. 저장 중단 시점의 최종 보상 검증은 M8에서 완료한다.

<a id="m8"></a>

## M8 — 두 번째 배지와 저장·재개 완성

GitHub 마일스톤: [#8](https://github.com/quirinal36/Poketmon_goldilocks/milestone/8)

목표: 라이벌 재대결과 이슬 체육관을 완성하고, 기존 저장 및 사건 중단 후 이어하기를 보장한다.

진입 조건: M7의 지도·사건 흐름을 플레이할 수 있고, 두 번째 배지와 트레이너 ID가 정해져 있다.

포함 이슈:

- [T37 · 블루시티 라이벌·이슬·두 번째 배지 구현](GITHUB_ISSUES.md#t37)
- [T38 · 사건·전투 보상 중복 방지와 중단 후 재개](GITHUB_ISSUES.md#t38)
- [T39 · 기존 저장·계정 저장·로그인 회귀 확인](GITHUB_ISSUES.md#t39)

종료 조건:

- [x] 회색배지와 누적 도장 8개로 이슬에게 도전 가능. 도장 7개에서는 정확한 안내 표시.
- [x] 한 과목만 사용하거나 보호자가 시작 진도를 설정한 경우에도 기존 학습 규칙대로 진행.
- [x] 라이벌·수련생 등 선택 전투를 건너뛰어도 두 번째 배지 획득 가능.
- [x] 트레이너 카드와 배지 획득 화면에서 두 배지의 이름·이미지가 올바르게 표시.
- [x] 전투 승리·수첩 반환·배지 연출 중 종료해도 필수 전투 재수행이나 보상 중복 없이 재개.
- [x] 게스트·카카오·라운지 계정에서 지역·회복 장소·도장·배지·보상 기록이 복구되고 계정별 저장이 분리됨(계정 경로는 모의 서버 검사, 운영 계정은 M9).
- [x] 웅의 도장 4개 조건과 회색배지·3번도로 개방이 계속 동작.

산출물: 다음 장 전체 기능, 기존 저장 호환 검증, 보상·중단 복구 검사 결과. 새 퀘스트 시스템이나 별도 로그인 시스템은 추가하지 않는다.

<a id="m9"></a>

## M9 — 다음 장 검증과 배포

GitHub 마일스톤: [#9](https://github.com/quirinal36/Poketmon_goldilocks/milestone/9)

목표: 다음 장의 실제 플레이, 학습 난이도, 화면·음성, 배포 결과를 확인하고 이용 안내를 갱신한다.

진입 조건: M8 기능 완료와 저장·보상 검사 통과.

포함 이슈:

- [T40 · 다음 장 전체 진행 E2E와 기존 기능 회귀 검사](GITHUB_ISSUES.md#t40)
- [T41 · 전투 균형·아동 사용성·화면·음성 검토](GITHUB_ISSUES.md#t41)
- [T42 · 안내 문서와 라운지 링크 갱신](GITHUB_ISSUES.md#t42)
- [T43 · GitHub 연동 배포와 운영 확인](GITHUB_ISSUES.md#t43)

종료 조건:

- [ ] 빌드·단위 검사·맵·포켓몬 검사 및 기존/신규 E2E 통과. 문제은행을 변경했다면 문제 검사도 통과.
- [ ] 1024×768·768×1024에서 회색배지 저장 → 동굴 사건 → 이슬 → 두 번째 배지 → 저장 복구 검증.
- [ ] 5개 해상도에서 새 대화·전투·배지 화면을 확인하고, 실제 터치 기기에서 이동·대화·음성을 확인.
- [ ] 도장 7/8개, 한 과목 사용, 시작 진도 조정, 패배 후 재도전, 사건 중단 후 재개 사례 확인.
- [ ] 안내서의 스토리 범위·도장 조건·저장 안내가 실제 게임과 일치하고 라운지 Play 버튼에서 운영 도메인으로 이동.
- [ ] Preview 확인 후 `main` 반영으로 생성된 Vercel 배포와 `poke.letscoding.kr` 확인.
- [ ] 테스트 계정으로 운영 저장·재접속 확인. 배포 커밋·URL·검증 결과·남은 제한을 기록.

산출물: 플레이 검증 기록, 최신 안내서, 운영 도메인·라운지 링크 배포 결과. 자동 테스트·수동 확인·실기기 확인은 각각 수행한 범위를 적고, 확인하지 못한 항목을 완료로 표시하지 않는다.
