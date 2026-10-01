# GitHub 에픽·이슈

> 기준: [PLAN.md](PLAN.md), 작성일: 2026-09-30. [GitHub Issues](https://github.com/quirinal36/Poketmon_goldilocks/issues). [마일스톤 문서](MILESTONES.md).

기존 E1~E7과 T01~T31은 GitHub 등록 당시 기록이다. 각 하위 이슈는 GitHub의 상위 에픽 및 해당 마일스톤에 연결되어 있다. 기존 이슈의 상태·진행률은 GitHub에서 관리한다.

**두 번째 장:** [E8~E10 및 T32~T43](#chapter2)의 에픽 3개와 하위 작업 12개는 [GitHub Issues](https://github.com/quirinal36/Poketmon_goldilocks/issues)에 등록되어 있다. [스토리](STORY_CHAPTER_2.md)와 [M7~M9](MILESTONES.md#chapter2)를 기준으로 구현하며, 최신 완료 상태는 GitHub에서 확인한다.

아래 E1~E7의 최초 시작 상태는 커밋 `bdceb57` 무렵의 기록이다. 현재의 미구현 목록으로 해석하지 않는다.

## 시작 상태 (최초 등록 당시)

- 기반 단계 0은 `1ea8ab0`에서 완료. 이미지·네트워크·포켓몬 데이터 생성은 PLAN상 완료이며, 데이터 검증은 T05에서 이어간다.
- GitHub 업로드 커밋: `70b60f1`. 부팅·전투·주요 화면은 미완성이므로 실행 가능한 게임의 완성과 구분한다.
- 업로드 전 타입 오류와 연속 학습일 초기화 오류를 수정해 빌드 및 단위 테스트 73개가 통과했다. 전체 E2E·문제은행 검증은 아직 완료되지 않았다.

## 에픽 목록

| 에픽 | 마일스톤 | 하위 이슈 수 |
|---|---|---|
| [E1 · 기초 런타임과 공통 모듈 완성](https://github.com/quirinal36/my_game/issues/1) | [M1 · 기초 모듈·문제은행 완성](https://github.com/quirinal36/my_game/milestone/1) | 6 |
| [E2 · 수학·영어 문제은행 완성 및 독립 검증](https://github.com/quirinal36/my_game/issues/2) | [M1 · 기초 모듈·문제은행 완성](https://github.com/quirinal36/my_game/milestone/1) | 4 |
| [E3 · 태초마을부터 첫 체육관까지 게임 기능 구현](https://github.com/quirinal36/my_game/issues/3) | [M2 · 첫 체육관까지 플레이 구현](https://github.com/quirinal36/my_game/milestone/2) | 6 |
| [E4 · 서비스 통합과 전체 플레이 검증](https://github.com/quirinal36/my_game/issues/4) | [M3 · 통합·E2E 통과](https://github.com/quirinal36/my_game/milestone/3) | 4 |
| [E5 · 다섯 관점 품질 검토와 반복 수정](https://github.com/quirinal36/my_game/issues/5) | [M4 · 품질 검토·수정 완료](https://github.com/quirinal36/my_game/milestone/4) | 4 |
| [E6 · 라운지 배포 패키지와 이용 안내 준비](https://github.com/quirinal36/my_game/issues/6) | [M5 · 배포 패키지·안내서 준비](https://github.com/quirinal36/my_game/milestone/5) | 3 |
| [E7 · Supabase 연결과 Vercel·라운지 서비스 배포](https://github.com/quirinal36/my_game/issues/7) | [M6 · 서비스 배포·라운지 등록](https://github.com/quirinal36/my_game/milestone/6) | 4 |

## 요구사항 대응

| 요구사항 | 추적 위치 |
|---|---|
| R1 아동 학습·라운지 배포 | [T21 · 아동 사용성과 한국어 검토](https://github.com/quirinal36/my_game/issues/28), [T31 · 라운지 등록·최종 ZIP·출시 완료 검증](https://github.com/quirinal36/my_game/issues/38) |
| R2 초등 1학년 | [T06 · 수학 1-1~2-2 커리큘럼·문제은행 완성](https://github.com/quirinal36/my_game/issues/13), [T07 · 영어 1-1~2-2 커리큘럼·문제은행 완성](https://github.com/quirinal36/my_game/issues/14), [T21 · 아동 사용성과 한국어 검토](https://github.com/quirinal36/my_game/issues/28), [T23 · 교육과정·난이도·체육관 출제 수준 검토](https://github.com/quirinal36/my_game/issues/30) |
| R3 수학·영어 | [E2 · 수학·영어 문제은행 완성 및 독립 검증](https://github.com/quirinal36/my_game/issues/2) |
| R4 문제 풀이·포획·도감 | [T15 · 학습 연동 전투·포획·성장·분기 진화 구현](https://github.com/quirinal36/my_game/issues/22), [T16 · 게임 메뉴·보호자·선택 화면 구현](https://github.com/quirinal36/my_game/issues/23), [T19 · 정상 플레이·오답 기절 복귀 E2E 구현](https://github.com/quirinal36/my_game/issues/26) |
| R5 위키 이미지 | [T05 · 251종 포켓몬 데이터·아틀라스 독립 검증](https://github.com/quirinal36/my_game/issues/12) |
| R6 별도 문제 데이터·Supabase | [E2 · 수학·영어 문제은행 완성 및 독립 검증](https://github.com/quirinal36/my_game/issues/2), [T29 · Supabase 스키마·시드·온라인 저장 검증](https://github.com/quirinal36/my_game/issues/36) |
| R7 웹·태블릿 | [T20 · 5개 해상도·10개 주요 화면 시각 검증](https://github.com/quirinal36/my_game/issues/27), [T30 · Vercel 운영 배포와 URL 검증](https://github.com/quirinal36/my_game/issues/37), [T31 · 라운지 등록·최종 ZIP·출시 완료 검증](https://github.com/quirinal36/my_game/issues/38) |
| R8 파트너·외형·이름 | [T02 · 절차적 픽셀아트 타일·건물·캐릭터 완성](https://github.com/quirinal36/my_game/issues/9), [T16 · 게임 메뉴·보호자·선택 화면 구현](https://github.com/quirinal36/my_game/issues/23) |
| R9 골드 방식 플레이 | [T01 · 엔진 부팅·저장·입력·맵 런타임 완성](https://github.com/quirinal36/my_game/issues/8), [T02 · 절차적 픽셀아트 타일·건물·캐릭터 완성](https://github.com/quirinal36/my_game/issues/9), [E3 · 태초마을부터 첫 체육관까지 게임 기능 구현](https://github.com/quirinal36/my_game/issues/3) |
| R10 매일 난이도 상승 | [T04 · 학습 진도·출제·문제 카드·미리보기 완성](https://github.com/quirinal36/my_game/issues/11), [E2 · 수학·영어 문제은행 완성 및 독립 검증](https://github.com/quirinal36/my_game/issues/2), [T23 · 교육과정·난이도·체육관 출제 수준 검토](https://github.com/quirinal36/my_game/issues/30) |
| R11 Codex 추가 이미지 — PLAN상 완료 | [T02 · 절차적 픽셀아트 타일·건물·캐릭터 완성](https://github.com/quirinal36/my_game/issues/9), [T17 · 모듈 Requests·저장 병합·진화·출현 정책 통합](https://github.com/quirinal36/my_game/issues/24) |
| R12 체육관·배지 | [T14 · 회색시티·웅·회색배지·3번도로 구현](https://github.com/quirinal36/my_game/issues/21), [T15 · 학습 연동 전투·포획·성장·분기 진화 구현](https://github.com/quirinal36/my_game/issues/22), [T19 · 정상 플레이·오답 기절 복귀 E2E 구현](https://github.com/quirinal36/my_game/issues/26) |
| R13 태초마을~첫 체육관 | [T12 · 태초마을·스타팅·라이벌·포획 안내 구현](https://github.com/quirinal36/my_game/issues/19), [T13 · 상록시티·학교·낚시·상록숲 구현](https://github.com/quirinal36/my_game/issues/20), [T14 · 회색시티·웅·회색배지·3번도로 구현](https://github.com/quirinal36/my_game/issues/21), [T19 · 정상 플레이·오답 기절 복귀 E2E 구현](https://github.com/quirinal36/my_game/issues/26) |

R5는 생성 완료 후 검증 잔여 작업을 추적한다. R11은 완료 산출물을 재사용·통합하는 위치이며 이미지 재생성 작업을 뜻하지 않는다.

<a id="e1"></a>

## E1 — 기초 런타임과 공통 모듈 완성

GitHub: [E1 · 기초 런타임과 공통 모듈 완성](https://github.com/quirinal36/my_game/issues/1) · 마일스톤: [M1 · 기초 모듈·문제은행 완성](https://github.com/quirinal36/my_game/milestone/1)

중단된 엔진·픽셀아트·오디오·학습 모듈을 현재 구현에서 이어 완성하고 데이터 검증 및 첫 체크포인트를 확보한다.

완료 조건:

- [ ] 완료로 기록된 이미지·네트워크는 재작성하지 않고 통합 시 기존 산출물을 사용한다.
- [ ] 모듈은 G 레지스트리와 types.ts 계약으로 연결된다.
- [ ] 모듈별 검증, 포켓몬 데이터 검증, 문제 생성, 빌드·테스트 및 체크포인트를 완료한다.

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t01"></a>[T01](https://github.com/quirinal36/my_game/issues/8) | 엔진 부팅·저장·입력·맵 런타임 완성 | 없음 |
| <a id="t02"></a>[T02](https://github.com/quirinal36/my_game/issues/9) | 절차적 픽셀아트 타일·건물·캐릭터 완성 | 없음 |
| <a id="t03"></a>[T03](https://github.com/quirinal36/my_game/issues/10) | 칩튠·효과음·울음소리·TTS 검증 완료 | 없음 |
| <a id="t04"></a>[T04](https://github.com/quirinal36/my_game/issues/11) | 학습 진도·출제·문제 카드·미리보기 완성 | 없음 |
| <a id="t05"></a>[T05](https://github.com/quirinal36/my_game/issues/12) | 251종 포켓몬 데이터·아틀라스 독립 검증 | 없음 |
| <a id="t10"></a>[T10](https://github.com/quirinal36/my_game/issues/17) | 기초 모듈·문제 JSON 통합 및 단계 1 체크포인트 | [T01](https://github.com/quirinal36/my_game/issues/8), [T02](https://github.com/quirinal36/my_game/issues/9), [T03](https://github.com/quirinal36/my_game/issues/10), [T04](https://github.com/quirinal36/my_game/issues/11), [T05](https://github.com/quirinal36/my_game/issues/12), [T06](https://github.com/quirinal36/my_game/issues/13), [T07](https://github.com/quirinal36/my_game/issues/14), [T08](https://github.com/quirinal36/my_game/issues/15), [T09](https://github.com/quirinal36/my_game/issues/16) |


<a id="e2"></a>

## E2 — 수학·영어 문제은행 완성 및 독립 검증

GitHub: [E2 · 수학·영어 문제은행 완성 및 독립 검증](https://github.com/quirinal36/my_game/issues/2) · 마일스톤: [M1 · 기초 모듈·문제은행 완성](https://github.com/quirinal36/my_game/milestone/1)

수학·영어 1-1→1-2→2-1→2-2 문제은행을 별도 데이터로 제공한다. 계획상 목표는 53단원·약 257레슨·약 5,700문제이며 예상치와 실제 집계는 구분한다.

완료 조건:

- [ ] 모든 레슨 20문제 이상 및 검증기 오류 0개
- [ ] 수학 정답 재계산·영어 의미/음성 검증을 생성기와 독립적으로 수행
- [ ] 수학·영어 각각 120문제 이상 직접 검토 및 결과 기록

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t06"></a>[T06](https://github.com/quirinal36/my_game/issues/13) | 수학 1-1~2-2 커리큘럼·문제은행 완성 | 없음 |
| <a id="t07"></a>[T07](https://github.com/quirinal36/my_game/issues/14) | 영어 1-1~2-2 커리큘럼·문제은행 완성 | 없음 |
| <a id="t08"></a>[T08](https://github.com/quirinal36/my_game/issues/15) | 수학 전체 정답 재계산·120문제 문장 검토 | [T06](https://github.com/quirinal36/my_game/issues/13) |
| <a id="t09"></a>[T09](https://github.com/quirinal36/my_game/issues/16) | 영어 의미·음성·120문제 독립 검토 | [T07](https://github.com/quirinal36/my_game/issues/14) |


<a id="e3"></a>

## E3 — 태초마을부터 첫 체육관까지 게임 기능 구현

GitHub: [E3 · 태초마을부터 첫 체육관까지 게임 기능 구현](https://github.com/quirinal36/my_game/issues/3) · 마일스톤: [M2 · 첫 체육관까지 플레이 구현](https://github.com/quirinal36/my_game/milestone/2)

지역 세 곳, 전투, 화면을 연결하여 스타팅 선택부터 회색배지까지 플레이할 수 있게 한다.

완료 조건:

- [ ] 지역별 담당 경로와 ExitDef 좌표표 일치
- [ ] 포획·도감·파트너·이름·외형·학습 리포트 등 요구 화면 구현
- [ ] 도장 4개 조건, 체육관 대결, 회색배지 및 3번도로 개방
- [ ] 기능 구현 후 빌드·테스트 통과 및 단계 3 체크포인트

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t11"></a>[T11](https://github.com/quirinal36/my_game/issues/18) | 지역 간 ExitDef 연결 좌표표 확정 | [T10](https://github.com/quirinal36/my_game/issues/17) |
| <a id="t12"></a>[T12](https://github.com/quirinal36/my_game/issues/19) | 태초마을·스타팅·라이벌·포획 안내 구현 | [T11](https://github.com/quirinal36/my_game/issues/18) |
| <a id="t13"></a>[T13](https://github.com/quirinal36/my_game/issues/20) | 상록시티·학교·낚시·상록숲 구현 | [T11](https://github.com/quirinal36/my_game/issues/18) |
| <a id="t14"></a>[T14](https://github.com/quirinal36/my_game/issues/21) | 회색시티·웅·회색배지·3번도로 구현 | [T11](https://github.com/quirinal36/my_game/issues/18) |
| <a id="t15"></a>[T15](https://github.com/quirinal36/my_game/issues/22) | 학습 연동 전투·포획·성장·분기 진화 구현 | [T10](https://github.com/quirinal36/my_game/issues/17) |
| <a id="t16"></a>[T16](https://github.com/quirinal36/my_game/issues/23) | 게임 메뉴·보호자·선택 화면 구현 | [T10](https://github.com/quirinal36/my_game/issues/17) |


<a id="e4"></a>

## E4 — 서비스 통합과 전체 플레이 검증

GitHub: [E4 · 서비스 통합과 전체 플레이 검증](https://github.com/quirinal36/my_game/issues/4) · 마일스톤: [M3 · 통합·E2E 통과](https://github.com/quirinal36/my_game/milestone/3)

독립 모듈을 실제 게임 흐름으로 통합하고 자동 검사·E2E·해상도 검증으로 연결 오류를 제거한다.

완료 조건:

- [ ] 통합 Requests와 저장 병합·진화 선택·야생 출현 정책 반영
- [ ] 맵 정적 검사와 정상/오답 플레이 E2E 통과
- [ ] 5개 해상도 × 10개 주요 화면 검증 및 단계 4 체크포인트

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t17"></a>[T17](https://github.com/quirinal36/my_game/issues/24) | 모듈 Requests·저장 병합·진화·출현 정책 통합 | [T12](https://github.com/quirinal36/my_game/issues/19), [T13](https://github.com/quirinal36/my_game/issues/20), [T14](https://github.com/quirinal36/my_game/issues/21), [T15](https://github.com/quirinal36/my_game/issues/22), [T16](https://github.com/quirinal36/my_game/issues/23) |
| <a id="t18"></a>[T18](https://github.com/quirinal36/my_game/issues/25) | 맵 정적 검사 스크립트 구현 | [T12](https://github.com/quirinal36/my_game/issues/19), [T13](https://github.com/quirinal36/my_game/issues/20), [T14](https://github.com/quirinal36/my_game/issues/21) |
| <a id="t19"></a>[T19](https://github.com/quirinal36/my_game/issues/26) | 정상 플레이·오답 기절 복귀 E2E 구현 | [T17](https://github.com/quirinal36/my_game/issues/24), [T18](https://github.com/quirinal36/my_game/issues/25) |
| <a id="t20"></a>[T20](https://github.com/quirinal36/my_game/issues/27) | 5개 해상도·10개 주요 화면 시각 검증 | [T17](https://github.com/quirinal36/my_game/issues/24) |


<a id="e5"></a>

## E5 — 다섯 관점 품질 검토와 반복 수정

GitHub: [E5 · 다섯 관점 품질 검토와 반복 수정](https://github.com/quirinal36/my_game/issues/5) · 마일스톤: [M4 · 품질 검토·수정 완료](https://github.com/quirinal36/my_game/milestone/4)

아동 사용성·정확성·교육 내용·성능·한국어를 서로 다른 관점에서 검토하고 발견 사항을 교차 확인한다.

완료 조건:

- [ ] 각 관점의 결과와 반박 검증 근거 기록
- [ ] 확인된 결함 수정 후 회귀 검증
- [ ] 새 문제가 두 번 연속 나오지 않을 때 종료 및 단계 5 체크포인트

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t21"></a>[T21](https://github.com/quirinal36/my_game/issues/28) | 아동 사용성과 한국어 검토 | [T19](https://github.com/quirinal36/my_game/issues/26), [T20](https://github.com/quirinal36/my_game/issues/27) |
| <a id="t22"></a>[T22](https://github.com/quirinal36/my_game/issues/29) | 저장·진도·성장 정확성과 성능 검토 | [T19](https://github.com/quirinal36/my_game/issues/26) |
| <a id="t23"></a>[T23](https://github.com/quirinal36/my_game/issues/30) | 교육과정·난이도·체육관 출제 수준 검토 | [T08](https://github.com/quirinal36/my_game/issues/15), [T09](https://github.com/quirinal36/my_game/issues/16), [T19](https://github.com/quirinal36/my_game/issues/26) |
| <a id="t24"></a>[T24](https://github.com/quirinal36/my_game/issues/31) | 검토 결과 교차 검증·수정·두 차례 재검토 | [T21](https://github.com/quirinal36/my_game/issues/28), [T22](https://github.com/quirinal36/my_game/issues/29), [T23](https://github.com/quirinal36/my_game/issues/30) |


<a id="e6"></a>

## E6 — 라운지 배포 패키지와 이용 안내 준비

GitHub: [E6 · 라운지 배포 패키지와 이용 안내 준비](https://github.com/quirinal36/my_game/issues/6) · 마일스톤: [M5 · 배포 패키지·안내서 준비](https://github.com/quirinal36/my_game/milestone/5)

오프라인 ZIP과 교사·학부모 안내서, 홈 화면 아이콘·메타데이터를 완성한다.

완료 조건:

- [ ] ZIP 파일·용량·경로·빈 config.js 제약 검증
- [ ] 안내서의 보호자 기능 및 이어하기 안내를 실제 화면과 대조
- [ ] manifest와 홈 화면 아이콘 확인

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t25"></a>[T25](https://github.com/quirinal36/my_game/issues/32) | 라운지 오프라인 ZIP 생성·제약 검사 구현 | [T24](https://github.com/quirinal36/my_game/issues/31) |
| <a id="t26"></a>[T26](https://github.com/quirinal36/my_game/issues/33) | 선생님·학부모 이용 안내서 작성 | [T24](https://github.com/quirinal36/my_game/issues/31) |
| <a id="t27"></a>[T27](https://github.com/quirinal36/my_game/issues/34) | PWA manifest·홈 화면 아이콘 연결 | [T24](https://github.com/quirinal36/my_game/issues/31) |


<a id="e7"></a>

## E7 — Supabase 연결과 Vercel·라운지 서비스 배포

상태: 완료. 하위 이슈 T28~T31과 M6도 2026-09-30 완료 처리했다.

GitHub: [E7 · Supabase 연결과 Vercel·라운지 서비스 배포](https://github.com/quirinal36/my_game/issues/7) · 마일스톤: [M6 · 서비스 배포·라운지 등록](https://github.com/quirinal36/my_game/milestone/6)

사용자 준비가 필요한 Supabase·라운지 계정을 구분해 관리하고 실제 서비스 URL과 최종 검증 증거를 남긴다.

완료 조건:

- [x] Supabase 스키마·익명 로그인·시드·연결 검증
- [x] Vercel URL 및 라운지 외부 링크 등록 확인
- [x] 클라우드용 외부 링크와 오프라인 ZIP의 동작 차이를 안내
- [x] PLAN §1.3 전체 완료 기준 충족 및 배포 체크포인트

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t28"></a>[T28](https://github.com/quirinal36/my_game/issues/35) | 사용자 조치: Supabase 프로젝트 준비 | 없음 |
| <a id="t29"></a>[T29](https://github.com/quirinal36/my_game/issues/36) | Supabase 스키마·시드·온라인 저장 검증 | [T28](https://github.com/quirinal36/my_game/issues/35), [T10](https://github.com/quirinal36/my_game/issues/17), [T17](https://github.com/quirinal36/my_game/issues/24) |
| <a id="t30"></a>[T30](https://github.com/quirinal36/my_game/issues/37) | Vercel 운영 배포와 URL 검증 | [T25](https://github.com/quirinal36/my_game/issues/32), [T26](https://github.com/quirinal36/my_game/issues/33), [T27](https://github.com/quirinal36/my_game/issues/34) |
| <a id="t31"></a>[T31](https://github.com/quirinal36/my_game/issues/38) | 라운지 등록·최종 ZIP·출시 완료 검증 | [T25](https://github.com/quirinal36/my_game/issues/32), [T30](https://github.com/quirinal36/my_game/issues/37) |

<a id="chapter2"></a>

## 다음 장 — GitHub 등록 이슈

M7~M9와 E8~E10·T32~T43을 GitHub에 등록했다. 각 작업은 해당 에픽의 하위 이슈와 마일스톤에 연결되어 있다. 아래 내용은 등록된 이슈의 기획 기준이다.

| 에픽 | 마일스톤 | 하위 작업 | 결과 |
|---|---|---|---|
| [E8 · 달맞이산 사건과 블루시티 진입 구현](#e8) | [M7](MILESTONES.md#m7) | T32~T36 | 기존 저장으로 산을 넘어 블루시티까지 이동 |
| [E9 · 이슬·두 번째 배지와 저장 호환 완성](#e9) | [M8](MILESTONES.md#m8) | T37~T39 | 두 번째 배지 획득 및 중단 후 재개 |
| [E10 · 다음 장 검증·안내·배포 완료](#e10) | [M9](MILESTONES.md#m9) | T40~T43 | 플레이 검증과 Vercel·라운지 링크 배포 |

### 공통 구현 기준

- 이야기·대사·보상 수치의 기준은 [STORY_CHAPTER_2.md](STORY_CHAPTER_2.md)다. 조정할 때는 이유와 최종 값을 그 문서에도 반영한다.
- 기존 `G` 서비스, 스토리 플래그, 트레이너 승리 기록, 학습·전투·저장 방식을 확장한다. 새 퀘스트 프레임워크나 새 문제은행을 전제로 하지 않는다.
- 기존 계정의 저장, 첫 체육관, 3번도로 학기 선물을 보존한다. Supabase 스키마·라운지 프로필 변경은 이번 장의 기본 작업 범위에 포함하지 않는다.
- 아래 파일은 수정 후보 경로다. 해당 작업을 해결하는 데 필요한 파일만 변경한다.
- 검증은 기존 Vitest·Playwright·검사 스크립트를 활용한다. 각 작업에서는 관련 검사만 실행하고, T40에서 통합 검사 결과를 모은다.

<a id="e8"></a>

## E8 — 달맞이산 사건과 블루시티 진입 구현

GitHub 이슈: [#39](https://github.com/quirinal36/Poketmon_goldilocks/issues/39)

마일스톤: [M7](MILESTONES.md#m7). 목적: 첫 배지를 가진 플레이어가 연구원을 돕고 블루시티까지 이동하도록 한다.

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| [T32](#t32) | 새 지역 연결·진행·저장 기준 정리 | 기존 구현 기준 확인 |
| [T33](#t33) | 3번도로·달맞이산·4번도로 맵과 아트 구현 | T32 |
| [T34](#t34) | 블루시티와 실내 맵·아트 구현 | T32 |
| [T35](#t35) | 새 지역 야생 출현과 트레이너 편성 추가 | T32 |
| [T36](#t36) | 달맞이산 수첩 사건과 회복·출구 구현 | T33, T34, T35 |

에픽 완료 조건: T32~T36 완료, 총 25개 맵의 정적 검사 통과, 기존 저장에서 동굴 사건 해결과 블루시티 왕복 확인.

<a id="t32"></a>

### T32 — 새 지역 연결·진행·저장 기준 정리

GitHub 이슈: [#42](https://github.com/quirinal36/Poketmon_goldilocks/issues/42)

목적: 맵·배지·진행 기록의 이름과 복귀 위치를 먼저 정해 지역 연결 및 기존 저장 복구 오류를 예방한다.

작업 범위: `src/core/types.ts`, `src/core/save.ts`, `docs/STORY_CHAPTER_2.md`. 새 맵 7개와 출현 지역·트레이너·배지·스토리 플래그의 ID, 양방향 출구·워프 좌표, 회복 지점 및 사건 완료 시점을 기록한다. 계약을 정하는 단계에서 미완성 맵을 실행 경로에 등록하지 않는다.

완료 조건:

- [ ] 기존 3번도로와 새 지역, 건물의 진입·귀환·기절 복귀 좌표가 정해져 있다.
- [ ] 연구원 부탁·로켓단 승리·수첩 반환·보상 완료·두 번째 배지의 기록을 구분한다.
- [ ] 새 필드가 없는 기존 저장을 정상 진입 상태로 읽는 기준과 새 맵 저장을 유효하게 읽는 기준이 있다.
- [ ] 현재 배틀의 도장 4개 고정 조건·배지 획득 시 `route3_open` 설정, 화면의 회색배지 고정 표시를 T37 수정 대상으로 명시한다.

검증: 연결표를 기존 `MapId`, `AreaId`, `MAP_IDS`, 전투·배지·저장 코드와 대조한다. 실행 코드가 바뀌면 타입 검사와 관련 저장 검사를 수행한다.

<a id="t33"></a>

### T33 — 3번도로·달맞이산·4번도로 맵과 아트 구현

GitHub 이슈: [#43](https://github.com/quirinal36/Poketmon_goldilocks/issues/43)

목적: 기존 3번도로에서 동굴을 통과해 도시 입구까지 걸을 수 있게 한다.

작업 범위: `src/maps/`, `src/art/`, `src/core/types.ts`, `src/core/save.ts`, `src/world/`, `scripts/check-maps.mjs`, 필요한 이미지 자산. 3번도로 확장과 달맞이산 2개 맵·4번도로를 만들고, 동굴 벽·바닥·표지판 및 연구원·로켓단·삐삐 표현을 준비한다. 야생 조우가 발생하는 동굴 바닥과 안전한 이동 구간을 구분한다.

완료 조건:

- [ ] 출구·워프·NPC가 걷는 길을 막거나 벽 안에 도착시키지 않는다.
- [ ] 진행 전·후의 동굴 출구 상태를 T36에서 연결할 수 있고, 개방 후에는 양방향 이동이 가능하다.
- [ ] 기존 3번도로 풀숲·등산객·학기 선물과 회색시티 복귀가 유지된다.
- [ ] 동굴 길·벽·출구와 삐삐를 작은 화면에서도 구분할 수 있고 누락 자산이 없다.

검증: 맵 검사와 개발 화면에서 이동·조사·회복 좌표를 확인한다. T34 지도와 합쳐지는 시점에 지역 간 실제 왕복을 확인한다.

<a id="t34"></a>

### T34 — 블루시티와 실내 맵·아트 구현

GitHub 이슈: [#44](https://github.com/quirinal36/Poketmon_goldilocks/issues/44)

목적: 동굴을 지난 플레이어에게 회복·쇼핑·학습·체육관을 이용할 도시를 제공한다.

작업 범위: `src/maps/`, `src/art/`, `src/core/types.ts`, `src/core/save.ts`, 필요한 이미지 자산. 블루시티·포켓몬센터·상점·체육관 4개 맵, 이슬·수련생의 표현과 대화·전투용 자산을 준비한다. 기존 간호사·PC·상점·공부 게시판을 연결한다.

완료 조건:

- [ ] 4번도로와 도시, 각 건물의 출입이 양방향으로 연결된다.
- [ ] 센터 회복·복귀 위치, PC, 오늘의 공부, 기존 아이템 구매가 동작한다.
- [ ] 체육관 통로가 고정된 길로 보이고 라이벌·수련생을 피해 지나갈 수 있다.
- [ ] 미구현 후속 지역에는 현재 모험의 끝을 알리는 안내가 있다.

검증: 맵 검사, 건물별 출입·상호작용, 새 회복 지점에서 기절 복귀를 확인한다. 새 아트의 경로·투명 배경·표시 크기를 확인한다.

<a id="t35"></a>

### T35 — 새 지역 야생 출현과 트레이너 편성 추가

GitHub 이슈: [#45](https://github.com/quirinal36/Poketmon_goldilocks/issues/45)

목적: 새 지도에서 현재 진도에 맞는 포켓몬을 만나고, 기획된 다섯 상대와 대결하도록 한다.

작업 범위: `src/world/encounters.ts`, `src/story/trainers.ts`, `src/core/types.ts`, 관련 단위 검사. 동굴·4번도로·물가의 출현 지역과 레벨 범위를 정하고, 캠프보이·로켓단·라이벌·수련생·이슬의 편성과 보상을 추가한다.

완료 조건:

- [ ] 기존 도장에 따른 출현 단계와 야생/이벤트 포켓몬 구분을 유지한다.
- [ ] 새 지역의 출현 후보가 비지 않고, 낚시와 일반 조우가 각각 알맞게 동작한다.
- [ ] 전투 편성과 보상이 스토리 표와 일치한다. 라이벌의 이름과 첫 포켓몬은 기존 선택을 따른다.
- [ ] 장소를 이유로 학습 진도를 건너뛰거나 비활성 과목을 강제하지 않는다.

검증: 출현 후보·단계 경계·레벨 범위 및 첫 포켓몬 선택별 라이벌 편성을 관련 단위 검사로 확인한다. 기존 포켓몬 데이터 검사를 통과한다.

<a id="t36"></a>

### T36 — 달맞이산 수첩 사건과 회복·출구 구현

GitHub 이슈: [#46](https://github.com/quirinal36/Poketmon_goldilocks/issues/46)

목적: 지도에 배치한 등장인물과 전투를 한 이야기로 연결한다.

작업 범위: `src/story/`, 해당 맵 이벤트. 오박사 안내, 연구원 부탁·회복, 삐삐 안내, 로켓단 전투, 수첩 반환, 상처약 보상과 출구 개방을 구현한다.

완료 조건:

- [ ] 이미 회색배지를 가진 저장에서도 새 길에서 안내를 한 번 받을 수 있다.
- [ ] 쉬기를 골랐다가 다시 부탁을 받고 진행할 수 있다. 도장 수로 동굴 진입을 막지 않는다.
- [ ] 패배·도망은 사건 승리로 처리하지 않는다. 승리 후 수첩 반환과 상처약 2개 지급으로 이어진다.
- [ ] 삐삐는 장면에만 등장하고 자동 포획되지 않는다. 연구원은 사건 후에도 입구에서 회복을 제공한다.
- [ ] 수첩 반환 후 출구를 열고 블루시티까지 진행할 수 있다.

검증: 대화 선택·패배 후 재도전·정상 해결·재방문 흐름을 확인한다. 중단 지점별 저장·보상 보장은 T38에서 함께 검증한다.

<a id="e9"></a>

## E9 — 이슬·두 번째 배지와 저장 호환 완성

GitHub 이슈: [#40](https://github.com/quirinal36/Poketmon_goldilocks/issues/40)

마일스톤: [M8](MILESTONES.md#m8). 목적: 두 번째 체육관까지 진행하고 기존 계정·기기 저장으로 안정적으로 이어간다.

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| [T37](#t37) | 블루시티 라이벌·이슬·두 번째 배지 구현 | T34, T35, T36 |
| [T38](#t38) | 사건·전투 보상 중복 방지와 중단 후 재개 | T36, T37 |
| [T39](#t39) | 기존 저장·계정 저장·로그인 회귀 확인 | T38 |

에픽 완료 조건: T37~T39 완료, 누적 도장 조건 및 두 배지 표시 확인, 기존 저장·중단 복구·계정 분리 검사 통과.

<a id="t37"></a>

### T37 — 블루시티 라이벌·이슬·두 번째 배지 구현

GitHub 이슈: [#47](https://github.com/quirinal36/Poketmon_goldilocks/issues/47)

목적: 블루시티 도착부터 두 번째 배지 획득까지 플레이할 수 있게 한다.

작업 범위: `src/story/`, `src/battle/index.ts`, `src/ui/screens/index.ts`, `src/core/types.ts`, 배지 이미지 자산. 라이벌 도착 대화와 선택 대결, 체육관 수련생, 이슬 대결·배지·오박사 마무리 대화를 연결한다.

완료 조건:

- [ ] 첫 도착 대화는 한 번만 나오며 라이벌·수련생 대결을 거절해도 이슬에게 갈 수 있다.
- [ ] 웅은 도장 4개, 이슬은 회색배지와 누적 도장 8개를 요구한다. 실제 전투 진입 경로에서도 조건을 확인한다.
- [ ] 한 과목 사용·보호자 시작 진도·이미 8개 이상 완료한 저장에서 같은 누적 기준을 사용한다.
- [ ] 승리 시 두 번째 배지와 ₩1,500을 지급하고, 배지 획득 화면·트레이너 카드에 올바른 이름·이미지를 표시한다.
- [ ] 회색배지에 따른 3번도로 개방을 유지하며, 두 번째 배지로 미구현 지역이 열리지 않는다.

검증: 도장 7/8개 및 회색배지 유무, 웅 대결 회귀, 선택 전투 생략, 두 배지 표시를 확인한다. 기존 학습·전투 검사에 필요한 경계 사례만 추가한다.

<a id="t38"></a>

### T38 — 사건·전투 보상 중복 방지와 중단 후 재개

GitHub 이슈: [#48](https://github.com/quirinal36/Poketmon_goldilocks/issues/48)

목적: 승리 직후나 대화 도중 게임을 닫아도 보상을 잃거나 여러 번 받지 않도록 한다.

작업 범위: `src/story/`, `src/battle/index.ts`, `src/core/save.ts`, 관련 검사. 승리 기록과 사건 마무리를 구분해 저장하고, 다음 접속에서 완료하지 않은 장면만 이어서 처리한다. 기존 저장 한 번에 보상과 지급 완료 기록을 함께 담는다.

완료 조건:

- [ ] 로켓단 승리 후 수첩 반환 전 종료하면 필수 재전투 없이 남은 처리를 이어간다.
- [ ] 상처약 지급 전후 및 이슬 승리·배지 연출 전후의 저장에서 보상 누락·중복이 없다.
- [ ] 완료한 사건 재방문과 이미 이긴 트레이너 재대화에서 보상을 재지급하지 않는다.
- [ ] 패배 저장에 승리·배지·출구 개방이 남지 않는다. 날짜 변경으로 사건 진행이 초기화되지 않는다.
- [ ] 기기 저장이나 계정 저장 실패 시 현재 저장 결과 안내·재시도 방식이 유지된다.

검증: 승리 직후·지급 직전·지급 직후 상태를 저장한 뒤 재로드하는 검사와 실제 대화 도중 재접속을 수행한다. 로컬 복구와 계정 저장 복구를 모두 확인한다.

<a id="t39"></a>

### T39 — 기존 저장·계정 저장·로그인 회귀 확인

GitHub 이슈: [#49](https://github.com/quirinal36/Poketmon_goldilocks/issues/49)

목적: 업데이트 전후와 기기를 옮긴 뒤에도 동일한 모험을 이어갈 수 있게 한다.

작업 범위: `src/core/save.ts`, 필요한 경우 `src/net/index.ts`, `tests/unit/game.test.ts`, `tests/unit/net.test.ts`, `tests/e2e/auth.spec.ts`. 새 맵·회복 위치·배지·플래그가 저장 정리 과정에서 사라지지 않는지 확인하고 발견된 문제를 수정한다.

완료 조건:

- [ ] 업데이트 전 회색배지 저장을 읽어 이름·포켓몬·가방·학습 기록을 유지한 채 다음 장으로 진입한다.
- [ ] 동굴·블루시티의 위치와 최근 회복 장소가 로컬 및 클라우드 복구 후 유지된다.
- [ ] 카카오·라운지 로그인, 라운지 이름 표시, 게스트/계정 및 서로 다른 계정의 저장 분리가 유지된다.
- [ ] 저장 후 다른 브라우저 환경에서 같은 계정의 두 번째 배지·진도·사건 기록을 복구한다.
- [ ] 통신 실패 중 진행한 저장이 기존 재시도 방식으로 전송되고, 실패를 성공으로 안내하지 않는다.

검증: 기존 인증 E2E의 모의 서버 검사와 새 지역 저장 사례를 실행한다. 실제 Supabase·OAuth와 운영 도메인의 동작은 T43에서 테스트 계정으로 별도 확인한다.

<a id="e10"></a>

## E10 — 다음 장 검증·안내·배포 완료

GitHub 이슈: [#41](https://github.com/quirinal36/Poketmon_goldilocks/issues/41)

마일스톤: [M9](MILESTONES.md#m9). 목적: 다음 장을 검증하고, 정확한 안내와 함께 기존 배포 경로로 제공한다.

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| [T40](#t40) | 다음 장 전체 진행 E2E와 기존 기능 회귀 검사 | T39 |
| [T41](#t41) | 전투 균형·아동 사용성·화면·음성 검토 | T39 |
| [T42](#t42) | 안내 문서와 라운지 링크 갱신 | T40, T41 |
| [T43](#t43) | GitHub 연동 배포와 운영 확인 | T42 |

에픽 완료 조건: T40~T43 완료, 검증 결과·미확인 범위·배포 커밋과 URL 기록.

<a id="t40"></a>

### T40 — 다음 장 전체 진행 E2E와 기존 기능 회귀 검사

GitHub 이슈: [#50](https://github.com/quirinal36/Poketmon_goldilocks/issues/50)

목적: 개별 기능이 연결된 상태에서 첫 배지부터 두 번째 배지까지 진행할 수 있음을 확인한다.

작업 범위: `tests/e2e/`, 필요한 관련 단위 검사와 맵 검사, `docs/VERIFICATION.md`.

완료 조건:

- [ ] 가로·세로 화면에서 회색배지 저장 → 연구원 → 로켓단 → 수첩 반환 → 블루시티 → 이슬 → 저장 복구를 검증한다.
- [ ] 새 게임부터 회색배지까지의 기존 E2E와 인증·설정 검사가 계속 통과한다.
- [ ] 도장 7/8개, 한 과목, 시작 진도 조정, 패배 후 재도전, 선택 전투 생략을 검사한다.
- [ ] 새 지역 사이의 경계·문·복귀는 실제 입력으로 확인하고, 핵심 사건·배지 완료를 플래그 직접 주입으로 대신하지 않는다.
- [ ] 발견된 결함을 수정하고 재현 검사로 확인한다. 콘솔 오류와 무한 대기가 없다.

검증 명령: `npm run build`, `npm test`, `npm run check:maps`, `npm run check:pokemon`, `npm run e2e`. 문제은행을 수정했다면 `npm run check:questions`도 실행한다. 준비용 저장·이동 가속·모의 서버 사용 범위를 결과에 명시한다.

<a id="t41"></a>

### T41 — 전투 균형·아동 사용성·화면·음성 검토

GitHub 이슈: [#51](https://github.com/quirinal36/Poketmon_goldilocks/issues/51)

목적: 초등 저학년이 새 지역의 길과 목표를 이해하고, 오답 후에도 다시 도전하도록 조정한다.

작업 범위: 새 지도·대사·전투 편성·필요한 스타일·음성 설정, `docs/STORY_CHAPTER_2.md`, `docs/VERIFICATION.md`.

완료 조건:

- [ ] 도장 8개 전후의 대표 파티로 로켓단·이슬 전투를 확인하고, 특정 스타터나 포켓몬 포획이 필수가 되지 않도록 레벨·보상을 조정한다.
- [ ] 회복 위치·다음 목적지·누적 도장 조건이 대화와 화면에 명확히 드러난다.
- [ ] 1024×768·768×1024·1280×800·820×1180·375×667에서 새 화면의 잘림·겹침을 확인한다.
- [ ] 방향키·키보드·터치, 버튼 초점, 대사·문제 읽어주기 및 소리 끄기가 동작한다.
- [ ] 실제 터치 기기에서 핵심 이동·대화·전투·음성을 확인하고 기기·브라우저를 기록한다.

검증: 실제 문제를 풀어 진행한 대표 사례와 화면·기기별 결과를 기록한다. 브라우저 크기 변경만 한 검증을 실기기 확인으로 표시하지 않는다.

<a id="t42"></a>

### T42 — 안내 문서와 라운지 링크 갱신

GitHub 이슈: [#52](https://github.com/quirinal36/Poketmon_goldilocks/issues/52)

목적: 웹과 라운지 사용자가 새 스토리 범위와 도장·저장 규칙을 정확히 알 수 있도록 한다.

작업 범위: `README.md`, `docs/TEACHER_GUIDE.md`, `docs/DESIGN.md`, `docs/DEPLOY.md`, `docs/VERIFICATION.md`, `docs/STORY_CHAPTER_2.md`, 라운지 작품 링크와 운영 도메인 안내.

완료 조건:

- [ ] 구현을 마친 시점에만 스토리 문서의 미구현 표기를 갱신하고 최종 레벨·보상·맵 수를 기록한다.
- [ ] 두 번째 배지까지의 경로, 누적 도장 8개, 사건 중단·재개, 다음 지역 준비 안내를 설명한다.
- [ ] 로그인 계정 저장과 게스트 기기 저장의 차이를 현재 서비스 설정에 맞게 안내한다.
- [ ] 라운지 작품 소개도 두 번째 배지까지의 경로와 누적 도장 8개 조건으로 갱신한다.
- [ ] 라운지 작품 페이지 `https://lounge.letscoding.kr/works/leco/poke`의 Play 버튼이 `https://poke.letscoding.kr/`로 이동하는 흐름을 안내한다.
- [ ] 운영 도메인에서 다음 장 진입·문제 풀이·저장 복구를 확인한다. 라운지에 ZIP을 업로드하지 않는다.

검증: 라운지 Play → 운영 도메인 이동과 운영 도메인에서 다음 장 실행 확인. 문서 링크·메뉴 이름·현재 구현 범위를 대조한다.

<a id="t43"></a>

### T43 — GitHub 연동 배포와 운영 확인

GitHub 이슈: [#53](https://github.com/quirinal36/Poketmon_goldilocks/issues/53)

목적: 검증한 변경을 기존 GitHub–Vercel 경로로 공개하고 운영 주소에서 이어하기를 확인한다.

작업 범위: 변경 커밋·PR, Vercel Preview/Production, `docs/DEPLOY.md`, `docs/VERIFICATION.md`. 기존 `poke-du` 프로젝트와 `poke.letscoding.kr`을 사용한다.

완료 조건:

- [ ] Preview에서 다음 장·저장·신규 자산을 확인한다. OAuth를 사용하는 경우 해당 환경의 허용된 복귀 주소로 확인한다.
- [ ] `main` 반영으로 생성된 배포의 커밋과 성공 상태를 확인하고 운영 도메인의 새 버전을 확인한다.
- [ ] 테스트 계정으로 라운지 로그인·이름 표시, 카카오 복귀, 새 지역 저장·새 브라우저 복구를 확인한다. 모의 서버 결과로 대체하지 않는다.
- [ ] 운영 데이터는 테스트 계정에서만 사용하고, 사용자 저장을 초기화하거나 공유 라운지 인증 설정을 임의 변경하지 않는다.
- [ ] 배포 커밋·운영 URL·라운지 작품 URL·검증 결과를 기록하고 실제 완료한 GitHub 이슈·마일스톤 상태를 갱신한다.

검증: Preview와 운영 URL의 자산·콘솔·네트워크 오류, 로그인 복귀, 계정 저장 결과 및 재접속 상태를 확인한다. 배포를 되돌릴 때 새 맵 저장의 호환성도 함께 검토하도록 운영 기록에 남긴다.

<a id="chapter3"></a>

## 세 번째 장 — 이수재·상트앙느호·세 번째 배지

기준: [스토리 기획](STORY_CHAPTER_3.md) · [M10~M12](MILESTONES.md#chapter3). 상태: M10·M11 구현·자동 검증 완료, M12 현장·운영 검증 진행 중. 에픽 3개, 하위 작업 12개. 실제 상태는 GitHub에서 관리한다.

| 에픽 | 마일스톤 | 하위 작업 |
|---|---|---|
| [E11 · 이수재의 부탁·승선권과 갈색시티 진입 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/55) | [M10](https://github.com/quirinal36/Poketmon_goldilocks/milestone/10) | T44~T48 |
| [E12 · 상트앙느호 사건·마티스·세 번째 배지와 저장 호환 완성](https://github.com/quirinal36/Poketmon_goldilocks/issues/56) | [M11](https://github.com/quirinal36/Poketmon_goldilocks/milestone/11) | T49~T52 |
| [E13 · 세 번째 장 전체 플레이 검증과 운영 출시](https://github.com/quirinal36/Poketmon_goldilocks/issues/57) | [M12](https://github.com/quirinal36/Poketmon_goldilocks/milestone/12) | T53~T55 |

<a id="e11"></a>

### E11 — 이수재의 부탁·승선권과 갈색시티 진입 구현

GitHub: [#55](https://github.com/quirinal36/Poketmon_goldilocks/issues/55) (E11)

목적: 기존 블루배지 저장에서 금빛다리·이수재의 집을 방문해 승선권을 받고 갈색시티까지 왕복한다.

마일스톤: [M10](MILESTONES.md#m10). 완료 조건: 해당 마일스톤 종료 조건 및 아래 하위 작업 모두 완료.

- [T44 세 번째 장 맵·진행·저장 계약 확정](https://github.com/quirinal36/Poketmon_goldilocks/issues/58)
- [T45 금빛다리·25번도로·이수재의 집 맵과 아트 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/59)
- [T46 남행 도로·갈색시티·상트앙느호 맵과 아트 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/60)
- [T47 새 지역 야생 출현·트레이너 편성·필수 자산 추가](https://github.com/quirinal36/Poketmon_goldilocks/issues/61)
- [T48 이수재 부탁·승선권·세 번째 장 진입 안내 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/62)

<a id="t44"></a>

### T44 세 번째 장 맵·진행·저장 계약 확정

GitHub: [#58](https://github.com/quirinal36/Poketmon_goldilocks/issues/58) (T44)

<!-- PLAN:T44 -->
상위 에픽: [#55](https://github.com/quirinal36/Poketmon_goldilocks/issues/55) (E11)

마일스톤: [M10](https://github.com/quirinal36/Poketmon_goldilocks/milestone/10)

선행 작업: 없음

목적: 지역 제작 전에 13개 새 맵과 사건·배지·저장 ID 및 왕복 좌표를 확정한다.

작업 범위: `docs/STORY_CHAPTER_3.md`, `src/core/types.ts`, `src/core/save.ts`, `src/maps/index.ts`의 기존 계약 검토.

완료 조건:

- [x] 13개 새 MapId와 총 38개 맵 목표, 출현 AreaId·트레이너·thunder 배지·플래그 ID를 기록한다.
- [x] 블루시티 북/남 출구, 집·지하통로·도시·선박·실내의 출발/도착/역방향 좌표와 회복·기절 복귀 위치를 표로 기록한다.
- [x] 블루배지 진입, 승선권, 선장 도움, 배지 2개·누적 도장 12개 조건 및 각 저장 시점을 확정한다.
- [x] 새 플래그 없는 저장의 기본값, chapter2_complete 없는 블루배지 저장, 새 MapId·MAP_IDS 등록 기준을 정한다.
- [x] 공용 battle.trainer의 도장/배지 분기와 showBadge·트레이너 카드 확장을 T50에 명시한다. 미구현 맵을 런타임에 먼저 등록하지 않는다.

검증: 계약을 실제 맵·저장 정규화·전투 진입·화면 코드와 대조한다. 실행 코드 변경 시 타입 및 관련 단위 검사를 수행한다.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="t45"></a>

### T45 금빛다리·25번도로·이수재의 집 맵과 아트 구현

GitHub: [#59](https://github.com/quirinal36/Poketmon_goldilocks/issues/59) (T45)

<!-- PLAN:T45 -->
상위 에픽: [#55](https://github.com/quirinal36/Poketmon_goldilocks/issues/55) (E11)

마일스톤: [M10](https://github.com/quirinal36/Poketmon_goldilocks/milestone/10)

선행 작업: [#58](https://github.com/quirinal36/Poketmon_goldilocks/issues/58) (T44)

목적: 블루시티 북쪽에서 이수재의 집까지 돌아올 수 있는 짧은 탐험 경로를 만든다.

작업 범위: `src/maps/cerulean.ts`, 새 `route24`·`route25`·`bill_house` 맵, 맵 레지스트리·타입·저장 허용 목록, 필요한 `src/art/` 및 자산.

완료 조건:

- [x] 북쪽 새 맵 3개와 금빛다리·집의 문·표지판·NPC·장치 상호작용 위치를 계약대로 만든다.
- [x] 블루배지 전에는 북쪽 출구를 안내 NPC로 막고 획득 후 연다. 기존 4번도로·도시 건물 연결을 유지한다.
- [x] 맵을 MapId·MAPS·MAP_IDS에 함께 등록해 새 위치 저장을 보존한다.
- [x] 이수재 회복 위치·왕복 통로·선택 트레이너를 피해서 지나갈 수 있는 길을 확보한다.
- [x] 기존 아트를 재사용하고 누락 이미지·충돌·진행을 막는 NPC가 없다.

검증: npm run build, npm run check:maps 및 북쪽 왕복·문·배지 전후 통행·저장 재개 확인. 스크립트 연결은 T48과 함께 최종 검증한다.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="t46"></a>

### T46 남행 도로·갈색시티·상트앙느호 맵과 아트 구현

GitHub: [#60](https://github.com/quirinal36/Poketmon_goldilocks/issues/60) (T46)

<!-- PLAN:T46 -->
상위 에픽: [#55](https://github.com/quirinal36/Poketmon_goldilocks/issues/55) (E11)

마일스톤: [M10](https://github.com/quirinal36/Poketmon_goldilocks/milestone/10)

선행 작업: [#58](https://github.com/quirinal36/Poketmon_goldilocks/issues/58) (T44)

목적: 블루시티에서 항구 도시와 선내까지 이어지는 지도를 완성한다.

작업 범위: 블루시티 남쪽 출구, 새 route5·underground_path·route6·vermilion 및 센터·상점·체육관·선박 3개 맵, 타입·맵/저장 등록·아트.

완료 조건:

- [x] 남쪽 지역 10개 맵을 추가한다. 북쪽 3개와 합쳐 새 13개이며 총 38개 맵이다.
- [x] 도시 안 선착장을 선내와 연결하고 선내↔갑판/선장실을 왕복한다. 독립 항구·노랑시티 맵은 추가하지 않는다.
- [x] 블루배지 없으면 남쪽 새 길을 막고, 승선권 없어도 갈색시티는 탐험할 수 있다.
- [x] 센터 회복·PC·공부 게시판·상점은 공용 스크립트를 연결한다. 체육관/선착장 문턱은 T49·T50 조건을 연결할 위치를 둔다.
- [x] 선내 회복과 선장실 lastHeal, 계단·문·기절 복귀의 보행 좌표를 확보한다. 배는 사건 후에도 남아 있다.

검증: npm run build, npm run check:maps, 도로·도시·배의 왕복과 문/회복/복귀 확인. 사건 조건은 T49·T50 통합 시 검증한다.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="t47"></a>

### T47 새 지역 야생 출현·트레이너 편성·필수 자산 추가

GitHub: [#61](https://github.com/quirinal36/Poketmon_goldilocks/issues/61) (T47)

<!-- PLAN:T47 -->
상위 에픽: [#55](https://github.com/quirinal36/Poketmon_goldilocks/issues/55) (E11)

마일스톤: [M10](https://github.com/quirinal36/Poketmon_goldilocks/milestone/10)

선행 작업: [#58](https://github.com/quirinal36/Poketmon_goldilocks/issues/58) (T44)

목적: 기존 포켓몬·전투·음악을 사용해 북쪽과 항구 지역의 만남을 구성한다.

작업 범위: `src/world/encounters.ts`, `src/story/trainers.ts`, `src/core/types.ts`, 필요한 초상·배지 자산. 새 지역 맵과의 연결은 T45·T46에 통합.

완료 조건:

- [x] 금빛다리·6번도로·선상 라이벌·수련생·마티스 5개 트레이너 ID와 기획의 초기 레벨·보상을 추가한다.
- [x] 북쪽 야생 12~16, 남쪽 14~18을 초기 목표로 기존 도장별 해금·obtainable=wild 필터·낚시 정책을 유지한다. 실내에 의도하지 않은 야생 출현이 없다.
- [x] 선상 라이벌은 기존 스타터 기록과 상대 종 선택 규칙을 따르고 스타터 기록 없는 저장의 기존 fallback을 유지한다.
- [x] 마티스·필요한 NPC 초상·오렌지배지와 선박에 필요한 자산만 추가하고 기존 스프라이트·음악을 재사용한다.
- [x] 전투 문제는 현재 학습 진도를 사용하고 새 문제은행·상성/기술 시스템을 추가하지 않는다.

검증: npm run build, npm run check:pokemon 및 출현 풀·레벨 범위·라이벌 선택·이미지 표시 관련 검사. 맵 연결 후 check:maps도 통과한다.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="t48"></a>

### T48 이수재 부탁·승선권·세 번째 장 진입 안내 구현

GitHub: [#62](https://github.com/quirinal36/Poketmon_goldilocks/issues/62) (T48)

<!-- PLAN:T48 -->
상위 에픽: [#55](https://github.com/quirinal36/Poketmon_goldilocks/issues/55) (E11)

마일스톤: [M10](https://github.com/quirinal36/Poketmon_goldilocks/milestone/10)

선행 작업: [#59](https://github.com/quirinal36/Poketmon_goldilocks/issues/59) (T45), [#61](https://github.com/quirinal36/Poketmon_goldilocks/issues/61) (T47)

목적: 블루배지 저장에서 다음 목적지를 안내하고 장치 확인 후 승선권을 받게 한다.

작업 범위: 새 `src/story/chapter3.ts`, `src/story/index.ts`, `src/story/chapter2.ts`, 블루시티·북쪽 맵 이벤트 및 단위 검사.

완료 조건:

- [x] 블루배지만 있으면 chapter2_complete 없는 저장도 새 장을 시작하고 새 안내는 한 번 표시한다.
- [x] 이슬 마무리 전화·블루시티 준비 중 표지판을 북쪽 이수재/남쪽 갈색시티 안내로 갱신한다.
- [x] 부탁 → 표시등 확인 → 연결 장치 확인 → 이수재에게 돌아오기 순서와 각 단계 대사를 구현한다. 순서가 이르면 다음 행동을 안내한다.
- [x] bill_helped·ss_ticket_received를 함께 저장하고 재대화·재접속으로 진행 권한이나 추가 보상을 중복 처리하지 않는다.
- [x] 이수재 회복은 반복 사용 가능하고 북쪽 선택 전투를 거절해도 승선권을 받을 수 있다.

검증: 부탁 수락 전/후·장치 순서·재대화·회복·새 장 안내 중단 및 기존 블루배지 저장 진입 단위 검사. 북쪽 실제 상호작용 확인.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="e12"></a>

### E12 — 상트앙느호 사건·마티스·세 번째 배지와 저장 호환 완성

GitHub: [#56](https://github.com/quirinal36/Poketmon_goldilocks/issues/56) (E12)

목적: 선장을 돕고 마티스에게 세 번째 배지를 받으며 사건 도중 종료해도 보상 중복 없이 이어 한다.

마일스톤: [M11](MILESTONES.md#m11). 완료 조건: 해당 마일스톤 종료 조건 및 아래 하위 작업 모두 완료.

- [T49 상트앙느호 승선·선장 사건·체육관 개방 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/63)
- [T50 마티스·도장 12개 조건·세 번째 배지 화면 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/64)
- [T51 세 번째 장 사건·보상 중단 복구와 중복 방지](https://github.com/quirinal36/Poketmon_goldilocks/issues/65)
- [T52 기존 저장·신규 맵·게스트·계정 전환 호환 검증](https://github.com/quirinal36/Poketmon_goldilocks/issues/66)

<a id="t49"></a>

### T49 상트앙느호 승선·선장 사건·체육관 개방 구현

GitHub: [#63](https://github.com/quirinal36/Poketmon_goldilocks/issues/63) (T49)

<!-- PLAN:T49 -->
상위 에픽: [#56](https://github.com/quirinal36/Poketmon_goldilocks/issues/56) (E12)

마일스톤: [M11](https://github.com/quirinal36/Poketmon_goldilocks/milestone/11)

선행 작업: [#60](https://github.com/quirinal36/Poketmon_goldilocks/issues/60) (T46), [#61](https://github.com/quirinal36/Poketmon_goldilocks/issues/61) (T47), [#62](https://github.com/quirinal36/Poketmon_goldilocks/issues/62) (T48)

목적: 승선권으로 배에 올라 선장을 돕고 갈색체육관을 개방한다.

작업 범위: `src/story/chapter3.ts`, 갈색시티·선박 맵, 공용 회복 및 스토리 단위 검사.

완료 조건:

- [x] 승선권 없으면 진입을 막고 이수재 위치를 안내한다. 보유 시 승선권을 소모하지 않고 반복 승선할 수 있다.
- [x] 갑판 선원 꾸러미 → 선장 전달 순서를 플래그로 기록한다. 꾸러미 없이 선장에게 가면 갑판을 안내한다.
- [x] captain_helped·vermilion_gym_open을 같은 저장 시점에 반영하고 반복 대화로 보상이 늘지 않는다.
- [x] 선내 회복은 사건 완료 전부터 가능하며 완료 후 선장도 회복·복귀 장소를 제공한다.
- [x] 선상 라이벌 대결은 선택이며 승리/거절/패배 후에도 사건을 이어 간다. 배는 사건 후에도 정박한다.

검증: 승선권 경계, 선장 먼저 방문, 꾸러미 수령·전달 중단, 라이벌 거절/패배, 반복 승선·기절 복귀를 단위 및 실제 플레이로 확인한다.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="t50"></a>

### T50 마티스·도장 12개 조건·세 번째 배지 화면 구현

GitHub: [#64](https://github.com/quirinal36/Poketmon_goldilocks/issues/64) (T50)

<!-- PLAN:T50 -->
상위 에픽: [#56](https://github.com/quirinal36/Poketmon_goldilocks/issues/56) (E12)

마일스톤: [M11](https://github.com/quirinal36/Poketmon_goldilocks/milestone/11)

선행 작업: [#61](https://github.com/quirinal36/Poketmon_goldilocks/issues/61) (T47), [#63](https://github.com/quirinal36/Poketmon_goldilocks/issues/63) (T49)

목적: 마티스에게 조건에 맞춰 도전하고 오렌지배지를 정확히 표시한다.

작업 범위: `src/story/chapter3.ts`, `src/battle/index.ts`, `src/ui/screens/index.ts`, 갈색체육관 맵·배지 자산 및 관련 검사.

완료 조건:

- [x] 체육관 개방과 마티스 대결을 구분한다. 관장 대결은 선장 도움 완료·회색/블루배지·누적 도장 12개를 모두 요구한다.
- [x] 스토리 안내와 공용 battle.trainer 양쪽을 갱신해 직접 전투 호출도 조건을 우회하지 못한다. 기존 웅 4개·이슬 8개 조건을 유지한다.
- [x] 도장 11개·12개·12개 초과, 선장 미완료, 이전 배지 부족을 구분해 다음 행동을 안내한다. 한 과목/보호자 시작 진도를 인정한다.
- [x] trainer-win에서 thunder 배지와 ₩2,000을 한 번 지급한다. showBadge·트레이너 카드에 오렌지배지 이름·이미지·대체 텍스트를 추가한다.
- [x] 수련생은 선택, 체육관 길은 고정 통로이며 풀베기·특정 포켓몬·스위치 퍼즐을 요구하지 않는다. 축하·다음 지역 준비 안내를 저장한다.

검증: 공용 배틀 직접 호출과 스토리 진입 조건 회귀, 3개 배지 표시, 승리 후 재방문·연출 재개 검사. npm run build 및 관련 단위 검사.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="t51"></a>

### T51 세 번째 장 사건·보상 중단 복구와 중복 방지

GitHub: [#65](https://github.com/quirinal36/Poketmon_goldilocks/issues/65) (T51)

<!-- PLAN:T51 -->
상위 에픽: [#56](https://github.com/quirinal36/Poketmon_goldilocks/issues/56) (E12)

마일스톤: [M11](https://github.com/quirinal36/Poketmon_goldilocks/milestone/11)

선행 작업: [#62](https://github.com/quirinal36/Poketmon_goldilocks/issues/62) (T48), [#63](https://github.com/quirinal36/Poketmon_goldilocks/issues/63) (T49), [#64](https://github.com/quirinal36/Poketmon_goldilocks/issues/64) (T50)

목적: 전투·대사·보상 도중 종료해도 필수 진행이 사라지거나 용돈·배지가 반복되지 않게 한다.

작업 범위: `src/story/chapter3.ts`, `src/battle/index.ts`, `src/core/save.ts`의 해당 경로와 새 장 단위 검사.

완료 조건:

- [x] 장치 확인, 승선권 지급, 꾸러미 수령, 선장 전달/개방, 마티스 승리, 배지 연출, 마무리 전화의 저장 경계를 표로 기록한다.
- [x] 각 경계 직전/직후 종료한 저장에서 다시 접속해 남은 단계로 진행하며 이미 끝난 전투·장치 확인을 강제하지 않는다.
- [x] 승리 기록·용돈·배지 상태를 연출 전에 함께 저장하고 재대화·재접속 시 지급량과 기록 개수가 늘지 않는다.
- [x] 패배/취소는 완료나 배지로 처리하지 않고 최근 회복 장소에서 재도전한다.
- [x] 날짜 변경·일일 학습 완료가 사건 기록을 지우지 않는다. 기존 chapter2 복구 검사는 계속 통과한다.

검증: 종료 시점을 재현하는 최소 단위 회귀 검사와 저장 전후 상태/아이템/용돈 비교. 관련 기존 테스트를 함께 실행한다.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="t52"></a>

### T52 기존 저장·신규 맵·게스트·계정 전환 호환 검증

GitHub: [#66](https://github.com/quirinal36/Poketmon_goldilocks/issues/66) (T52)

<!-- PLAN:T52 -->
상위 에픽: [#56](https://github.com/quirinal36/Poketmon_goldilocks/issues/56) (E12)

마일스톤: [M11](https://github.com/quirinal36/Poketmon_goldilocks/milestone/11)

선행 작업: [#59](https://github.com/quirinal36/Poketmon_goldilocks/issues/59) (T45), [#60](https://github.com/quirinal36/Poketmon_goldilocks/issues/60) (T46), [#65](https://github.com/quirinal36/Poketmon_goldilocks/issues/65) (T51)

목적: 새 장을 추가해도 기존 모험과 계정별 저장이 보존되도록 한다.

작업 범위: `src/core/save.ts`, 기존 `src/net/`·인증 경로, `tests/unit/`, `tests/e2e/auth.spec.ts` 및 새 장 저장 검사.

완료 조건:

- [x] 첫 배지 저장·블루배지 저장·chapter2_complete 없는 저장·새 플래그 없는 저장을 초기화 없이 읽는다.
- [x] 13개 신규 맵의 위치/방향 및 모든 회복 지점이 정규화 후 유지되고 저장·새로고침·기절 복귀에서 유효하다.
- [x] 파티·박스·도장·기존 배지·돈·사건 상태를 로컬/계정 저장 전후 비교한다.
- [x] 게스트→로그인·계정 전환·로그아웃 시 기존 분리 정책을 유지한다. 카카오/라운지 로그인 경로의 자동 회귀를 검사한다.
- [x] 모의 서버 검증과 운영 확인을 구분해 기록한다. 운영 계정 실제 저장·다른 브라우저 복구는 T55로 추적한다.

검증: 저장 정규화 단위 검사, 기존 auth E2E와 새 지역 저장 재개 E2E. 공용 인증이나 DB 구조를 불필요하게 변경하지 않는다.

상태: 구현·자동 검증 완료 ([PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70), [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)). 운영·실기기 확인은 M12에서 추적한다.

<a id="e13"></a>

### E13 — 세 번째 장 전체 플레이 검증과 운영 출시

GitHub: [#57](https://github.com/quirinal36/Poketmon_goldilocks/issues/57) (E13)

목적: 학습·화면·실기기·계정 저장을 확인한 세 번째 장을 기존 운영 주소와 라운지 Play로 제공한다.

마일스톤: [M12](MILESTONES.md#m12). 완료 조건: 해당 마일스톤 종료 조건 및 아래 하위 작업 모두 완료.

- [T53 세 번째 장 전체 진행 E2E와 기존 두 장 회귀](https://github.com/quirinal36/Poketmon_goldilocks/issues/67)
- [T54 전투 균형·아동 사용성·5개 해상도·실기기 확인](https://github.com/quirinal36/Poketmon_goldilocks/issues/68)
- [T55 세 번째 장 안내·라운지 소개·GitHub 연동 배포와 운영 검증](https://github.com/quirinal36/Poketmon_goldilocks/issues/69)

<a id="t53"></a>

### T53 세 번째 장 전체 진행 E2E와 기존 두 장 회귀

GitHub: [#67](https://github.com/quirinal36/Poketmon_goldilocks/issues/67) (T53)

<!-- PLAN:T53 -->
상위 에픽: [#57](https://github.com/quirinal36/Poketmon_goldilocks/issues/57) (E13)

마일스톤: [M12](https://github.com/quirinal36/Poketmon_goldilocks/milestone/12)

선행 작업: [#65](https://github.com/quirinal36/Poketmon_goldilocks/issues/65) (T51), [#66](https://github.com/quirinal36/Poketmon_goldilocks/issues/66) (T52)

목적: 기존 블루배지 저장에서 세 번째 배지까지의 실제 연결을 자동으로 검증한다.

작업 범위: 새 `tests/e2e/chapter3.spec.ts`, 관련 단위·맵 검사 및 `docs/VERIFICATION.md`.

완료 조건:

- [ ] 1024×768·768×1024에서 이수재→승선권→갈색시티→선장→마티스→저장 복구 경로를 검증한다.
- [ ] 새 사건 플래그나 세 번째 배지를 직접 넣어 성공 처리하지 않는다. 기존 장 완료 저장 등 테스트 준비와 debug 이동 사용 구간은 명시한다.
- [ ] 블루배지 없음, 승선권 없음, 선장 미완료, 도장 11/12/초과, 한 과목·시작 진도 조정, 선택 전투 생략을 검증한다.
- [ ] 패배·기절 복귀·재도전, 사건/연출 중단, 기존 지역 왕복과 기존 두 장·로그인 회귀를 실행한다.
- [ ] npm run build, npm test, npm run check:maps, npm run check:pokemon, npm run e2e가 통과한다. 문제은행을 수정했다면 npm run check:questions도 실행한다.

검증: 명령·검증 수·실패/수정 결과·스크린샷·콘솔 오류를 기록한다. 자동 검사 범위를 실기기 검사로 표현하지 않는다.

상태: 진행 중. [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)을 참고하며 미검증 완료 조건은 열어 둔다.

<a id="t54"></a>

### T54 전투 균형·아동 사용성·5개 해상도·실기기 확인

GitHub: [#68](https://github.com/quirinal36/Poketmon_goldilocks/issues/68) (T54)

<!-- PLAN:T54 -->
상위 에픽: [#57](https://github.com/quirinal36/Poketmon_goldilocks/issues/57) (E13)

마일스톤: [M12](https://github.com/quirinal36/Poketmon_goldilocks/milestone/12)

선행 작업: [#64](https://github.com/quirinal36/Poketmon_goldilocks/issues/64) (T50), [#65](https://github.com/quirinal36/Poketmon_goldilocks/issues/65) (T51)

목적: 저학년 사용자가 목적지를 이해하고 무리한 반복 전투 없이 세 번째 배지에 도전하도록 확인한다.

작업 범위: 새 장 지도·대사·편성·화면·음성의 필요한 조정, `docs/STORY_CHAPTER_3.md`, `docs/VERIFICATION.md`.

완료 조건:

- [ ] 도장 12개 전후·기존 스타터 7종의 대표 파티에서 실제 문제를 풀며 확인한다. 선택 전투 생략 경로와 오답 후 복귀도 포함한다.
- [ ] 전투는 기존 정답 공격 규칙으로 평가한다. 타입 상성이나 레벨 수치만으로 난이도를 추정하지 않고 필요시 편성·보상을 조정해 기록한다.
- [ ] 1024×768·768×1024·1280×800·820×1180·375×667에서 대화·문제·선박·배지·카드가 잘리거나 겹치지 않는다.
- [ ] 키보드·초점·56px 이상 터치 영역·방향키/A/B/START·TTS 재생/다시 듣기/음소거와 쉬운 한국어·다음 목적지 안내를 확인한다.
- [ ] 실제 터치 기기에서 이동·승선·대화·전투·음성을 확인하고 기기/브라우저/결과를 기록한다. 기존 T41 #51 미확인 사항도 추적한다.

검증: 실제 플레이·화면 크기별 결과와 실기기 결과를 구분해 기록한다. 코드 조정 시 영향 받는 검사와 E2E를 재실행한다.

상태: 진행 중. [검증 기록](VERIFICATION.md#세-번째-장-구현과-자동-검증)을 참고하며 미검증 완료 조건은 열어 둔다.

<a id="t55"></a>

### T55 세 번째 장 안내·라운지 소개·GitHub 연동 배포와 운영 검증

GitHub: [#69](https://github.com/quirinal36/Poketmon_goldilocks/issues/69) (T55)

<!-- PLAN:T55 -->
상위 에픽: [#57](https://github.com/quirinal36/Poketmon_goldilocks/issues/57) (E13)

마일스톤: [M12](https://github.com/quirinal36/Poketmon_goldilocks/milestone/12)

선행 작업: [#67](https://github.com/quirinal36/Poketmon_goldilocks/issues/67) (T53), [#68](https://github.com/quirinal36/Poketmon_goldilocks/issues/68) (T54)

목적: 검증된 세 번째 장을 기존 배포 경로로 공개하고 실제 계정 저장까지 확인한다.

작업 범위: `README.md`, `docs/TEACHER_GUIDE.md`, `docs/DESIGN.md`, `docs/STORY_CHAPTER_3.md`, `docs/DEPLOY.md`, `docs/VERIFICATION.md`, 기존 Vercel·운영 도메인·라운지 작품.

완료 조건:

- [ ] 문서에 최종 맵 수·경로·누적 도장 12개·승선/선장 조건·저장 안내·다음 지역 준비 상태를 실제 구현 기준으로 반영한다.
- [ ] Preview에서 새 자산·진행·저장을 확인한 뒤 main 반영으로 생성된 배포의 성공 상태·커밋·poke.letscoding.kr 버전을 기록한다.
- [ ] 테스트 계정으로 라운지 로그인·이름 표시·카카오 복귀·새 지역 저장·새 브라우저 복구를 확인한다. 모의 서버 결과로 대체하지 않는다.
- [ ] 라운지 https://lounge.letscoding.kr/works/leco/poke 소개를 세 번째 배지 범위로 갱신하고 Play→https://poke.letscoding.kr/ 이동을 확인한다. ZIP 업로드는 하지 않는다.
- [ ] 기존 #51·#52·#53 잔여 확인을 증거로 정리한 뒤 해당 이슈와 M9 상태를 갱신한다. 확인하지 못한 항목은 열린 상태로 남긴다.
- [ ] 배포 커밋·URL·계정/기기별 결과·남은 제한과 되돌리기 시 신규 MapId 저장 호환 대책을 기록한다. 사용자 저장 초기화·공유 인증 설정 변경은 하지 않는다.

검증: Preview/운영의 자산·콘솔·네트워크 오류, 실제 로그인/계정 저장/다른 브라우저 재개, 라운지 링크와 최신 안내를 확인한다.

상태: 진행 중. [PR #70](https://github.com/quirinal36/Poketmon_goldilocks/pull/70) 병합과 Production 배포는 확인했다. 계정·실기기·라운지 확인 전까지 열어 둔다.

<a id="chapter4"></a>

## 네 번째 장 — 돌산터널·무지개정원·네 번째 배지

기준: [스토리 기획](STORY_CHAPTER_4.md) · [M13~M15](MILESTONES.md#chapter4). 상태: 계획 / 미구현. 에픽 3개, 하위 작업 12개. 기존 M9·M12 미완료 검증은 유지한다.

| 에픽 | 마일스톤 | 하위 작업 |
|---|---|---|
| [E14 · 돌산터널·보라타운·무지개시티 연결](https://github.com/quirinal36/Poketmon_goldilocks/issues/71) | [M13](https://github.com/quirinal36/Poketmon_goldilocks/milestone/13) | T56~T60 |
| [E15 · 무지개정원 사건·민화·네 번째 배지 완성](https://github.com/quirinal36/Poketmon_goldilocks/issues/72) | [M14](https://github.com/quirinal36/Poketmon_goldilocks/milestone/14) | T61~T64 |
| [E16 · 네 번째 장 검증·안내·운영 출시](https://github.com/quirinal36/Poketmon_goldilocks/issues/73) | [M15](https://github.com/quirinal36/Poketmon_goldilocks/milestone/15) | T65~T67 |

<a id="e14"></a>

### E14 — 돌산터널·보라타운·무지개시티 연결

GitHub: [#71 (E14)](https://github.com/quirinal36/Poketmon_goldilocks/issues/71)

목적: 오렌지배지 저장에서 블루시티 동쪽 길을 열고 돌산터널을 거쳐 무지개시티까지 왕복한다.

마일스톤: [M13](MILESTONES.md#m13). 완료 조건: 해당 마일스톤 종료 조건과 하위 작업 전체 완료.

- [T56 네 번째 장 맵·진행·저장 계약 확정](https://github.com/quirinal36/Poketmon_goldilocks/issues/74)
- [T57 9·10번도로·돌산터널 맵과 회복 동선 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/75)
- [T58 보라타운·서쪽 지하통로·무지개시티 맵 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/76)
- [T59 새 지역 출현·트레이너 편성·민화와 배지 자산 추가](https://github.com/quirinal36/Poketmon_goldilocks/issues/77)
- [T60 오렌지배지 이후 안내·산길·보라타운 소개 편지 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/78)

<a id="t56"></a>

### T56 네 번째 장 맵·진행·저장 계약 확정

GitHub: [#74 (T56)](https://github.com/quirinal36/Poketmon_goldilocks/issues/74)

<!-- PLAN:T56 -->
상위 에픽: [#71 (E14)](https://github.com/quirinal36/Poketmon_goldilocks/issues/71)

마일스톤: [M13](https://github.com/quirinal36/Poketmon_goldilocks/milestone/13)

선행 작업: 없음

목적: 제작 전에 새 15개 맵과 기존 지역 연결, 사건·배지·저장 ID를 확정한다.

작업 범위: docs/STORY_CHAPTER_4.md, src/core/types.ts, src/core/save.ts, src/maps/index.ts 및 기존 3장 계약

완료 조건:

- [ ] 새 MapId 15개·총 53개, AreaId 8개, 트레이너 5개, rainbow 배지와 사건 플래그를 기록한다.
- [ ] 블루시티 동쪽 출구, 10번도로 북/남과 동굴 두 층, 실내 문·사다리·서쪽 지하통로의 양방향 좌표를 표로 확정한다.
- [ ] 10번도로 북쪽·동굴 쉼터·보라타운 센터·무지개시티 센터의 회복/기절 복귀 좌표가 보행 가능하다.
- [ ] 오렌지배지 진입·소개 편지·씨앗상자 반환·앞선 세 배지·도장 16개 조건과 저장 시점을 확정한다.
- [ ] 3장 플래그 없는 배지 저장과 신규 맵 정규화 정책을 정한다. 계약만으로 미구현 맵을 런타임에 등록하지 않는다.

검증: 좌표·ID를 실제 MapDef와 저장 정규화·공용 배틀·배지 화면 코드에 대조한다.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t57"></a>

### T57 9·10번도로·돌산터널 맵과 회복 동선 구현

GitHub: [#75 (T57)](https://github.com/quirinal36/Poketmon_goldilocks/issues/75)

<!-- PLAN:T57 -->
상위 에픽: [#71 (E14)](https://github.com/quirinal36/Poketmon_goldilocks/issues/71)

마일스톤: [M13](https://github.com/quirinal36/Poketmon_goldilocks/milestone/13)

선행 작업: [#74 (T56)](https://github.com/quirinal36/Poketmon_goldilocks/issues/74)

목적: 블루시티 동쪽에서 보라타운까지 이어지는 안전한 산길을 만든다.

작업 범위: src/maps/cerulean.ts, 새 src/maps/chapter4.ts의 route9·route10_north·rock_tunnel_1f·rock_tunnel_b1f·route10_south, 맵/저장 등록·아트

완료 조건:

- [ ] 북쪽 산길 5개 맵을 추가하고 동굴을 거치지 않고 남쪽으로 우회하는 연결이 없다.
- [ ] 오렌지배지 전에는 블루시티 동쪽 출구를 막고 획득 후 연다. 기존 서·북·남 출구는 유지한다.
- [ ] 문·사다리와 역방향 귀환, 동굴 밖/안의 회복 및 lastHeal 복귀를 계약대로 연결한다.
- [ ] 동굴은 밝게 표시하고 출구 표지와 고정 길을 제공한다. 플래시·풀베기·바위밀기·시간 제한을 요구하지 않는다.
- [ ] 선택 트레이너를 피할 수 있고 벽·NPC·출구 충돌로 막히지 않는다. 새 MapId·MAPS·MAP_IDS를 함께 등록한다.

검증: build, check:maps, 배지 전후 진입·사다리 왕복·회복·저장 재개 확인.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t58"></a>

### T58 보라타운·서쪽 지하통로·무지개시티 맵 구현

GitHub: [#76 (T58)](https://github.com/quirinal36/Poketmon_goldilocks/issues/76)

<!-- PLAN:T58 -->
상위 에픽: [#71 (E14)](https://github.com/quirinal36/Poketmon_goldilocks/issues/71)

마일스톤: [M13](https://github.com/quirinal36/Poketmon_goldilocks/milestone/13)

선행 작업: [#74 (T56)](https://github.com/quirinal36/Poketmon_goldilocks/issues/74)

목적: 산길 이후 쉼터와 네 번째 체육관까지의 도시 경로를 연결한다.

작업 범위: src/maps/chapter4.ts의 남은 10개 맵, 맵/저장 등록 및 기존 공용 스크립트

완료 조건:

- [ ] lavender·lavender_center·route8·underground_path_west·route7·celadon·celadon_center·celadon_mart·celadon_garden·celadon_gym을 추가해 총 53개 맵을 만든다.
- [ ] 보라타운↔8번도로↔서쪽 지하통로↔7번도로↔무지개시티의 왕복을 연결한다. 기존 남북 지하통로와 ID·출구를 혼동하지 않는다.
- [ ] 센터 회복·PC·공부 게시판·상점은 공용 스크립트를 사용하고 센터 lastHeal을 등록한다.
- [ ] 정원 사건 NPC·로켓단·반환 지점과 체육관 조건 안내 위치를 확보한다. 소개 편지 없이도 도시와 정원을 둘러볼 수 있다.
- [ ] 포켓몬타워·로켓단 아지트·게임코너·노랑시티로 잘못 연결되지 않는다. 무지개상점은 단층 공용 상점으로 만든다.

검증: build, check:maps, 모든 도시 문·귀환·회복·이전 지역 복귀 확인.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t59"></a>

### T59 새 지역 출현·트레이너 편성·민화와 배지 자산 추가

GitHub: [#77 (T59)](https://github.com/quirinal36/Poketmon_goldilocks/issues/77)

<!-- PLAN:T59 -->
상위 에픽: [#71 (E14)](https://github.com/quirinal36/Poketmon_goldilocks/issues/71)

마일스톤: [M13](https://github.com/quirinal36/Poketmon_goldilocks/milestone/13)

선행 작업: [#74 (T56)](https://github.com/quirinal36/Poketmon_goldilocks/issues/74)

목적: 기존 포켓몬과 전투 규칙으로 네 번째 장의 야생·대결을 구성한다.

작업 범위: src/world/encounters.ts, src/story/trainers.ts, src/core/types.ts, src/art/characters.ts, public/assets/img/manifest.json 및 필요한 자산

완료 조건:

- [ ] route9·route10·rock_tunnel·lavender·route8·route7·celadon·celadon_garden의 AreaId와 서식지를 등록한다. 10번도로 북/남은 AreaId를 공유한다.
- [ ] 산길·동굴 기준 레벨 18~21, 서쪽 도로 19~22를 초기값으로 정하고 기존 floor(stage/10) 가산·tier·obtainable=wild·낚시 필터를 유지한다.
- [ ] route9_camper·rock_tunnel_hiker·celadon_rocket·celadon_trainee·leader_erika 5개 트레이너를 기획 편성/보상으로 추가한다.
- [ ] 민화 초상·필드 스프라이트·무지개배지 rainbow 자산과 manifest를 추가한다. 기존 NPC·타일·음악을 우선 재사용한다.
- [ ] 현재 학습 진도로 출제한다. 신규 포켓몬·문제은행·기술·타입 상성 시스템을 도입하지 않는다.

검증: build, check:pokemon, 출현 풀·기준/실제 레벨·자산 누락 확인. 맵 연결 후 check:maps.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t60"></a>

### T60 오렌지배지 이후 안내·산길·보라타운 소개 편지 구현

GitHub: [#78 (T60)](https://github.com/quirinal36/Poketmon_goldilocks/issues/78)

<!-- PLAN:T60 -->
상위 에픽: [#71 (E14)](https://github.com/quirinal36/Poketmon_goldilocks/issues/71)

마일스톤: [M13](https://github.com/quirinal36/Poketmon_goldilocks/milestone/13)

선행 작업: [#75 (T57)](https://github.com/quirinal36/Poketmon_goldilocks/issues/75), [#76 (T58)](https://github.com/quirinal36/Poketmon_goldilocks/issues/76), [#77 (T59)](https://github.com/quirinal36/Poketmon_goldilocks/issues/77)

목적: 기존 세 번째 배지 저장에서 새 목적지를 이해하고 정원 사건을 시작하게 한다.

작업 범위: 새 src/story/chapter4.ts, src/story/index.ts, src/story/chapter3.ts, 블루시티·갈색시티·보라타운 안내

완료 조건:

- [ ] 오렌지배지만 있으면 chapter3_complete 없는 저장도 시작한다. 오래된 마티스 배지 연출 복구를 유지한다.
- [ ] 마티스 마무리 전화·갈색시티 준비 중 표지판·블루시티 동쪽 안내를 블루시티→돌산터널→보라타운 경로로 갱신한다.
- [ ] 새 장 안내는 완료 후 한 번만 기록한다. 안내 중 종료 시 다시 들을 수 있고 길 진입을 막지 않는다.
- [ ] 산길 회복 NPC와 동굴 방향 표지를 연결한다. 산길/동굴 트레이너는 선택이며 거절·패배 후에도 이동할 수 있다.
- [ ] 보라타운 정원사와 대화하면 garden_letter_received를 저장하고 무지개정원의 다음 행동을 안내한다. 소개 편지는 소모하거나 중복 지급하는 아이템이 아니다.

검증: 기존 배지 저장·플래그 누락·안내 중단·편지 전후 재대화·선택 전투 거절·회복 검사.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="e15"></a>

### E15 — 무지개정원 사건·민화·네 번째 배지 완성

GitHub: [#72 (E15)](https://github.com/quirinal36/Poketmon_goldilocks/issues/72)

목적: 소개 편지와 씨앗상자 회수 사건을 마친 뒤 누적 도장 16개로 민화에게 무지개배지를 받는다.

마일스톤: [M14](MILESTONES.md#m14). 완료 조건: 해당 마일스톤 종료 조건과 하위 작업 전체 완료.

- [T61 무지개정원 씨앗상자 회수·반환·체육관 개방 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/79)
- [T62 민화·도장 16개 조건·무지개배지 화면 구현](https://github.com/quirinal36/Poketmon_goldilocks/issues/80)
- [T63 네 번째 장 사건·전투·배지 중단 복구와 중복 방지](https://github.com/quirinal36/Poketmon_goldilocks/issues/81)
- [T64 기존 저장·15개 신규 맵·게스트와 계정 저장 호환 검증](https://github.com/quirinal36/Poketmon_goldilocks/issues/82)

<a id="t61"></a>

### T61 무지개정원 씨앗상자 회수·반환·체육관 개방 구현

GitHub: [#79 (T61)](https://github.com/quirinal36/Poketmon_goldilocks/issues/79)

<!-- PLAN:T61 -->
상위 에픽: [#72 (E15)](https://github.com/quirinal36/Poketmon_goldilocks/issues/72)

마일스톤: [M14](https://github.com/quirinal36/Poketmon_goldilocks/milestone/14)

선행 작업: [#76 (T58)](https://github.com/quirinal36/Poketmon_goldilocks/issues/76), [#77 (T59)](https://github.com/quirinal36/Poketmon_goldilocks/issues/77), [#78 (T60)](https://github.com/quirinal36/Poketmon_goldilocks/issues/78)

목적: 소개 편지를 받아 로켓단에게 씨앗상자를 되찾고 정원사에게 돌려준다.

작업 범위: src/story/chapter4.ts, 무지개정원/체육관 맵, 스토리 단위 검사

완료 조건:

- [ ] 소개 편지 없이 로켓단에게 말하면 보라타운 정원사를 안내한다. 편지 수령 후 필수 대결을 시작한다.
- [ ] 로켓단 승리 시 defeatedTrainers 기록을 근거로 씨앗상자를 회수한다. 승리 직후 종료해도 재대결 없이 회수 상태를 복구한다.
- [ ] 패배·취소는 회수 완료로 처리하지 않는다. 최근 회복 지점 복귀 후 재도전하며 승리 용돈 ₩500은 한 번만 지급한다.
- [ ] 정원사에게 반환하면 celadon_garden_helped·celadon_gym_open을 같은 저장 시점에 기록한다. 씨앗상자는 사건 플래그이며 추가 소모품 보상은 없다.
- [ ] 반환 전/후 체육관 입구 안내와 재방문 대사를 구분한다. 사건 완료 후에도 정원과 이전 지역을 왕복할 수 있다.

검증: 편지 없음·정원사 먼저 방문·전투 승패·회수/반환 중단·보상 중복·체육관 전후 경계 검사.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t62"></a>

### T62 민화·도장 16개 조건·무지개배지 화면 구현

GitHub: [#80 (T62)](https://github.com/quirinal36/Poketmon_goldilocks/issues/80)

<!-- PLAN:T62 -->
상위 에픽: [#72 (E15)](https://github.com/quirinal36/Poketmon_goldilocks/issues/72)

마일스톤: [M14](https://github.com/quirinal36/Poketmon_goldilocks/milestone/14)

선행 작업: [#77 (T59)](https://github.com/quirinal36/Poketmon_goldilocks/issues/77), [#79 (T61)](https://github.com/quirinal36/Poketmon_goldilocks/issues/79)

목적: 정원 도움과 학습 조건을 충족하면 네 번째 배지를 받게 한다.

작업 범위: src/story/chapter4.ts, src/battle/index.ts, src/ui/screens/index.ts, 민화/배지 자산

완료 조건:

- [ ] 민화 대결에 정원 도움 완료·boulder/cascade/thunder 배지·누적 도장 16개를 모두 요구한다.
- [ ] 스토리 안내와 공용 battle.trainer 직접 호출 모두 같은 조건을 검사하고 기존 관장 4/8/12개 조건을 유지한다.
- [ ] 도장 15/16/16 초과, 정원 미완료, 이전 배지 부족을 구분한다. 한 과목·보호자 시작 진도를 인정한다.
- [ ] leader_erika 승리 시 rainbow 배지와 ₩2,500을 연출 전에 한 번 저장한다. 배지 화면·트레이너 카드의 이름·이미지·대체 텍스트를 갱신한다.
- [ ] 수련생은 선택이며 풀베기나 특정 포켓몬을 요구하지 않는다. 축하·다음 지역 준비 안내의 중단/재개 상태를 저장한다.

검증: 직접 전투 호출·3장 관장 회귀·배지 네 개 표시·재방문/연출 중단 검사와 build.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t63"></a>

### T63 네 번째 장 사건·전투·배지 중단 복구와 중복 방지

GitHub: [#81 (T63)](https://github.com/quirinal36/Poketmon_goldilocks/issues/81)

<!-- PLAN:T63 -->
상위 에픽: [#72 (E15)](https://github.com/quirinal36/Poketmon_goldilocks/issues/72)

마일스톤: [M14](https://github.com/quirinal36/Poketmon_goldilocks/milestone/14)

선행 작업: [#78 (T60)](https://github.com/quirinal36/Poketmon_goldilocks/issues/78), [#79 (T61)](https://github.com/quirinal36/Poketmon_goldilocks/issues/79), [#80 (T62)](https://github.com/quirinal36/Poketmon_goldilocks/issues/80)

목적: 어느 저장 경계에서 종료해도 사건을 이어 가고 보상을 중복 지급하지 않는다.

작업 범위: src/story/chapter4.ts, 기존 전투·저장 경로, tests/unit/chapter4.test.ts

완료 조건:

- [ ] 소개 편지·로켓단 승리/회수·상자 반환/개방·민화 승리·배지 연출·마무리 전화의 저장 경계를 표로 기록한다.
- [ ] 각 경계 직전/직후 저장을 재개해 이미 끝난 대결을 강제하지 않고 남은 단계만 진행한다.
- [ ] 전투 승리 기록·용돈·배지를 저장한 뒤 연출한다. 반환·대화·재접속으로 권한·용돈·배지가 중복되지 않는다.
- [ ] 패배·취소 후 완료 플래그가 생기지 않고 최근 보행 가능한 회복 위치에서 재도전한다.
- [ ] 날짜 변경·하루 학습 완료·로그인 전환이 사건 기록을 지우지 않는다. 기존 2·3장 복구 검사도 유지한다.

검증: 최소 단위 회귀 검사와 저장 전후 flags·defeatedTrainers·money·badges 비교.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t64"></a>

### T64 기존 저장·15개 신규 맵·게스트와 계정 저장 호환 검증

GitHub: [#82 (T64)](https://github.com/quirinal36/Poketmon_goldilocks/issues/82)

<!-- PLAN:T64 -->
상위 에픽: [#72 (E15)](https://github.com/quirinal36/Poketmon_goldilocks/issues/72)

마일스톤: [M14](https://github.com/quirinal36/Poketmon_goldilocks/milestone/14)

선행 작업: [#75 (T57)](https://github.com/quirinal36/Poketmon_goldilocks/issues/75), [#76 (T58)](https://github.com/quirinal36/Poketmon_goldilocks/issues/76), [#81 (T63)](https://github.com/quirinal36/Poketmon_goldilocks/issues/81)

목적: 기존 모험과 계정별 저장이 네 번째 장에서도 보존되도록 한다.

작업 범위: src/core/save.ts, tests/unit/, tests/e2e/auth.spec.ts, 새 장 저장 E2E

완료 조건:

- [ ] 첫째~셋째 배지 저장·chapter3_complete 없는 오렌지배지 저장·새 플래그 없는 저장을 초기화 없이 읽는다.
- [ ] 신규 맵 15개의 위치·방향 및 각 lastHeal을 정규화·저장·새로고침·기절 복귀 후 보존한다.
- [ ] 파티·박스·도장·기존 배지·돈·사건 상태를 로컬/모의 계정 저장 전후 비교한다.
- [ ] 게스트→로그인·계정 전환·로그아웃과 카카오/라운지 로그인 자동 회귀를 기존 분리 정책대로 통과한다.
- [ ] 운영 계정 실제 저장·다른 브라우저 복구는 T67에서 추적한다. 신규 MapId 저장이 있는 버전의 롤백/순방향 수정 원칙을 기록한다.

검증: save 정규화 단위, auth E2E, 새 맵 저장 재개. 사용자 저장 초기화·인증/DB 구조 변경 금지.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="e16"></a>

### E16 — 네 번째 장 검증·안내·운영 출시

GitHub: [#73 (E16)](https://github.com/quirinal36/Poketmon_goldilocks/issues/73)

목적: 전체 진행·실기기·운영 계정 저장을 확인하고 네 번째 장을 기존 운영 주소와 라운지 Play로 제공한다.

마일스톤: [M15](MILESTONES.md#m15). 완료 조건: 해당 마일스톤 종료 조건과 하위 작업 전체 완료.

- [T65 네 번째 장 전체 진행 E2E와 기존 세 장 회귀](https://github.com/quirinal36/Poketmon_goldilocks/issues/83)
- [T66 동굴 길찾기·전투 균형·5개 해상도·실기기 확인](https://github.com/quirinal36/Poketmon_goldilocks/issues/84)
- [T67 네 번째 장 안내·라운지 소개·배포·운영 계정 검증](https://github.com/quirinal36/Poketmon_goldilocks/issues/85)

<a id="t65"></a>

### T65 네 번째 장 전체 진행 E2E와 기존 세 장 회귀

GitHub: [#83 (T65)](https://github.com/quirinal36/Poketmon_goldilocks/issues/83)

<!-- PLAN:T65 -->
상위 에픽: [#73 (E16)](https://github.com/quirinal36/Poketmon_goldilocks/issues/73)

마일스톤: [M15](https://github.com/quirinal36/Poketmon_goldilocks/milestone/15)

선행 작업: [#81 (T63)](https://github.com/quirinal36/Poketmon_goldilocks/issues/81), [#82 (T64)](https://github.com/quirinal36/Poketmon_goldilocks/issues/82)

목적: 오렌지배지 저장에서 무지개배지까지 실제 경로와 기존 세 장을 자동 검증한다.

작업 범위: tests/e2e/chapter4.spec.ts 및 관련 경계 검사, docs/VERIFICATION.md

완료 조건:

- [ ] 1024×768·768×1024에서 블루시티→돌산터널→보라타운→정원 사건→민화→저장 재개를 통과한다.
- [ ] 준비 저장·debug 이동 사용 구간을 명시한다. 새 사건 플래그와 rainbow 배지를 직접 주입해 성공 처리하지 않는다.
- [ ] 오렌지배지 없음·편지 없음·정원 미완료·이전 배지 부족·도장 15/16/초과·한 과목·선택 대결 생략을 검사한다.
- [ ] 로켓단/민화 패배·복귀·재도전·승리 직후와 배지 연출 중단·새/기존 지역 왕복을 확인한다.
- [ ] build·test·check:maps·check:pokemon·전체 e2e 및 기존 세 장/로그인 회귀가 통과한다. Playwright를 중복 실행해 공유 산출물을 지우지 않는다. 문제은행 변경 시 check:questions도 실행한다.

검증: 명령·검사 수·생략 이유·실패 재실행·스크린샷·콘솔 오류를 기록하며 M12 #67 잔여를 함께 정리한다.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t66"></a>

### T66 동굴 길찾기·전투 균형·5개 해상도·실기기 확인

GitHub: [#84 (T66)](https://github.com/quirinal36/Poketmon_goldilocks/issues/84)

<!-- PLAN:T66 -->
상위 에픽: [#73 (E16)](https://github.com/quirinal36/Poketmon_goldilocks/issues/73)

마일스톤: [M15](https://github.com/quirinal36/Poketmon_goldilocks/milestone/15)

선행 작업: [#80 (T62)](https://github.com/quirinal36/Poketmon_goldilocks/issues/80), [#81 (T63)](https://github.com/quirinal36/Poketmon_goldilocks/issues/81)

목적: 어린이가 동굴과 사건의 다음 행동을 이해하고 태블릿에서 진행할 수 있는지 확인한다.

작업 범위: 새 장 지도·대사·편성·화면·음성, docs/STORY_CHAPTER_4.md, docs/VERIFICATION.md

완료 조건:

- [ ] 대표 스타터 파티·도장 16개 전후·선택 대결 생략·오답 후 복귀를 실제 문제 풀이로 확인한다. 7종 스타터에 대해 검사한 표본과 미검사 범위를 명시한다.
- [ ] 기존 정답 공격 규칙으로 균형을 판단하며 타입 상성이나 레벨 숫자만으로 통과 처리하지 않는다. 필요시 편성/보상을 조정하고 재검사한다.
- [ ] 동굴 사다리·표지·쉼터와 정원 반환 지점의 안내가 명확하다. 어린이 길찾기 관찰과 자동 경로 검사를 구분한다.
- [ ] 1024×768·768×1024·1280×800·820×1180·375×667에서 대화·문제·배지·카드가 잘리거나 겹치지 않는다.
- [ ] 실제 터치 기기에서 방향키/A/B/START·키보드 초점·56px 터치 영역·TTS 재생/다시 듣기/음소거를 확인하고 기기·브라우저·결과를 기록한다.

검증: M9 #51·M12 #68과 중복 증거는 연결하되 미확인 실기기/아동 검사를 자동 완료하지 않는다.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.

<a id="t67"></a>

### T67 네 번째 장 안내·라운지 소개·배포·운영 계정 검증

GitHub: [#85 (T67)](https://github.com/quirinal36/Poketmon_goldilocks/issues/85)

<!-- PLAN:T67 -->
상위 에픽: [#73 (E16)](https://github.com/quirinal36/Poketmon_goldilocks/issues/73)

마일스톤: [M15](https://github.com/quirinal36/Poketmon_goldilocks/milestone/15)

선행 작업: [#83 (T65)](https://github.com/quirinal36/Poketmon_goldilocks/issues/83), [#84 (T66)](https://github.com/quirinal36/Poketmon_goldilocks/issues/84)

목적: 최신 안내와 실제 계정 저장을 확인한 네 번째 장을 운영에 반영한다.

작업 범위: README.md, docs/{TEACHER_GUIDE,DESIGN,STORY_CHAPTER_4,DEPLOY,VERIFICATION}.md, 기존 Vercel·운영 도메인·라운지 작품

완료 조건:

- [ ] 최종 53개 맵·경로·누적 도장 16개·정원 사건·저장·다음 지역 준비 상태를 실제 구현 기준으로 문서에 반영한다.
- [ ] 인증된 Preview에서 새 자산·진행·저장을 확인하고 main 병합으로 생성된 Production의 커밋·성공 상태·poke.letscoding.kr 버전을 기록한다. SSO 리디렉션/배포 성공만으로 게임 확인을 대신하지 않는다.
- [ ] 테스트 계정의 라운지 로그인·이름·카카오 복귀·새 맵 저장·다른 브라우저 복구를 확인한다. 모의 서버 검증과 별도로 기록한다.
- [ ] 라운지 작품 소개를 네 번째 배지 범위로 갱신하고 Play→운영 주소 이동을 확인한다. GitHub 연동 배포를 사용하며 ZIP 업로드는 하지 않는다.
- [ ] M9 #51~#53과 M12 #67~#69를 증거별로 대조한다. 완료한 항목만 닫고 미확인 항목은 열린 상태로 남긴다.
- [ ] 배포 URL·커밋·계정/기기 결과·제한·신규 MapId 저장을 보존하는 장애 복구 방안을 기록한다. 사용자 저장 초기화와 공유 인증 설정 변경은 하지 않는다.

검증: Preview/운영 실제 플레이·콘솔/네트워크·계정 복구·라운지 링크 및 문서/GitHub 상태 대조.

상태: 계획 / 미구현. [네 번째 장 스토리·맵·학습·저장 계약](STORY_CHAPTER_4.md)을 따른다.
