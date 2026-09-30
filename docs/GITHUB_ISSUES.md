# GitHub 에픽·이슈

> 기준: [PLAN.md](PLAN.md), 작성일: 2026-09-30. [GitHub Issues](https://github.com/quirinal36/my_game/issues). [마일스톤 문서](MILESTONES.md).

기존 E1~E7과 T01~T31은 GitHub 등록 당시 기록이다. 각 하위 이슈는 GitHub의 상위 에픽 및 해당 마일스톤에 연결되어 있다. 기존 이슈의 상태·진행률은 GitHub에서 관리한다.

**다음 장의 등록용 초안:** [E8~E10 및 T32~T43](#chapter2), 에픽 3개와 하위 작업 12개를 추가했다. [스토리 기획](STORY_CHAPTER_2.md)과 [M7~M9](MILESTONES.md#chapter2)를 기준으로 하며, **신규 이슈·마일스톤은 아직 GitHub에 등록하지 않았다.** 문서의 E/T/M 식별자는 실제 GitHub 번호가 아니다. 신규 작업은 모두 미착수이며 담당자·마감일은 미정이다.

현재 구현 기준은 커밋 `bdceb57`의 첫 체육관·계정 로그인·저장 기능이다. 아래 최초 시작 상태를 현재의 미구현 목록으로 해석하지 않는다.

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

GitHub: [E7 · Supabase 연결과 Vercel·라운지 서비스 배포](https://github.com/quirinal36/my_game/issues/7) · 마일스톤: [M6 · 서비스 배포·라운지 등록](https://github.com/quirinal36/my_game/milestone/6)

사용자 준비가 필요한 Supabase·라운지 계정을 구분해 관리하고 실제 서비스 URL과 최종 검증 증거를 남긴다.

완료 조건:

- [ ] Supabase 스키마·익명 로그인·시드·연결 검증
- [ ] Vercel URL 및 라운지 외부 링크 등록 확인
- [ ] 클라우드용 외부 링크와 오프라인 ZIP의 동작 차이를 안내
- [ ] PLAN §1.3 전체 완료 기준 충족 및 배포 체크포인트

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| <a id="t28"></a>[T28](https://github.com/quirinal36/my_game/issues/35) | 사용자 조치: Supabase 프로젝트 준비 | 없음 |
| <a id="t29"></a>[T29](https://github.com/quirinal36/my_game/issues/36) | Supabase 스키마·시드·온라인 저장 검증 | [T28](https://github.com/quirinal36/my_game/issues/35), [T10](https://github.com/quirinal36/my_game/issues/17), [T17](https://github.com/quirinal36/my_game/issues/24) |
| <a id="t30"></a>[T30](https://github.com/quirinal36/my_game/issues/37) | Vercel 운영 배포와 URL 검증 | [T25](https://github.com/quirinal36/my_game/issues/32), [T26](https://github.com/quirinal36/my_game/issues/33), [T27](https://github.com/quirinal36/my_game/issues/34) |
| <a id="t31"></a>[T31](https://github.com/quirinal36/my_game/issues/38) | 라운지 등록·최종 ZIP·출시 완료 검증 | [T25](https://github.com/quirinal36/my_game/issues/32), [T30](https://github.com/quirinal36/my_game/issues/37) |

<a id="chapter2"></a>

## 다음 장 — GitHub 등록용 이슈 초안

각 제목은 GitHub 등록 시 그대로 사용하고, 아래 목적·작업 범위·완료 조건·검증을 본문으로 옮긴다. 등록 순서는 M7~M9 → E8~E10 → T32~T43이다. 하위 작업을 해당 에픽·마일스톤에 연결한 뒤 실제 번호와 URL을 이 문서에 기록한다.

| 에픽 | 마일스톤 | 하위 작업 | 결과 |
|---|---|---|---|
| [E8 · 달맞이산 사건과 블루시티 진입 구현](#e8) | [M7](MILESTONES.md#m7) | T32~T36 | 기존 저장으로 산을 넘어 블루시티까지 이동 |
| [E9 · 이슬·두 번째 배지와 저장 호환 완성](#e9) | [M8](MILESTONES.md#m8) | T37~T39 | 두 번째 배지 획득 및 중단 후 재개 |
| [E10 · 다음 장 검증·안내·배포 완료](#e10) | [M9](MILESTONES.md#m9) | T40~T43 | 플레이 검증과 웹·ZIP 배포 |

### 공통 구현 기준

- 이야기·대사·보상 수치의 기준은 [STORY_CHAPTER_2.md](STORY_CHAPTER_2.md)다. 조정할 때는 이유와 최종 값을 그 문서에도 반영한다.
- 기존 `G` 서비스, 스토리 플래그, 트레이너 승리 기록, 학습·전투·저장 방식을 확장한다. 새 퀘스트 프레임워크나 새 문제은행을 전제로 하지 않는다.
- 기존 계정의 저장, 첫 체육관, 3번도로 학기 선물을 보존한다. Supabase 스키마·라운지 프로필 변경은 이번 장의 기본 작업 범위에 포함하지 않는다.
- 아래 파일은 수정 후보 경로다. 해당 작업을 해결하는 데 필요한 파일만 변경한다.
- 검증은 기존 Vitest·Playwright·검사 스크립트를 활용한다. 각 작업에서는 관련 검사만 실행하고, T40에서 통합 검사 결과를 모은다.

<a id="e8"></a>

## E8 — 달맞이산 사건과 블루시티 진입 구현

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

마일스톤: [M8](MILESTONES.md#m8). 목적: 두 번째 체육관까지 진행하고 기존 계정·기기 저장으로 안정적으로 이어간다.

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| [T37](#t37) | 블루시티 라이벌·이슬·두 번째 배지 구현 | T34, T35, T36 |
| [T38](#t38) | 사건·전투 보상 중복 방지와 중단 후 재개 | T36, T37 |
| [T39](#t39) | 기존 저장·계정 저장·로그인 회귀 확인 | T38 |

에픽 완료 조건: T37~T39 완료, 누적 도장 조건 및 두 배지 표시 확인, 기존 저장·중단 복구·계정 분리 검사 통과.

<a id="t37"></a>

### T37 — 블루시티 라이벌·이슬·두 번째 배지 구현

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

마일스톤: [M9](MILESTONES.md#m9). 목적: 다음 장을 검증하고, 정확한 안내와 함께 기존 배포 경로로 제공한다.

| 작업 | 제목 | 선행 작업 |
|---|---|---|
| [T40](#t40) | 다음 장 전체 진행 E2E와 기존 기능 회귀 검사 | T39 |
| [T41](#t41) | 전투 균형·아동 사용성·화면·음성 검토 | T39 |
| [T42](#t42) | 안내 문서와 라운지 ZIP 갱신 | T40, T41 |
| [T43](#t43) | GitHub 연동 배포와 운영 확인 | T42 |

에픽 완료 조건: T40~T43 완료, 검증 결과·미확인 범위·패키지·배포 커밋과 URL 기록.

<a id="t40"></a>

### T40 — 다음 장 전체 진행 E2E와 기존 기능 회귀 검사

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

### T42 — 안내 문서와 라운지 ZIP 갱신

목적: 웹과 라운지 사용자가 새 스토리 범위와 도장·저장 규칙을 정확히 알 수 있도록 한다.

작업 범위: `README.md`, `docs/TEACHER_GUIDE.md`, `docs/DESIGN.md`, `docs/VERIFICATION.md`, `docs/STORY_CHAPTER_2.md`, 패키지 산출물.

완료 조건:

- [ ] 구현을 마친 시점에만 스토리 문서의 미구현 표기를 갱신하고 최종 레벨·보상·맵 수를 기록한다.
- [ ] 두 번째 배지까지의 경로, 누적 도장 8개, 사건 중단·재개, 다음 지역 준비 안내를 설명한다.
- [ ] 로그인 계정 저장과 게스트 기기 저장, 오프라인 ZIP의 차이를 현재 서비스 설정에 맞게 안내한다.
- [ ] 새 지역·아트를 포함한 ZIP이 기존 500개 파일·30MB 제한, 상대경로, 외부 API 없는 실행 조건을 만족한다.
- [ ] 압축을 푼 패키지에서 다음 장 진입·문제 풀이·저장 복구를 확인한다.

검증: `npm run zip:lounge`, `npm run check:lounge`와 패키지의 다음 장 실행 확인. 문서 링크·메뉴 이름·현재 구현 범위를 대조한다.

<a id="t43"></a>

### T43 — GitHub 연동 배포와 운영 확인

목적: 검증한 변경을 기존 GitHub–Vercel 경로로 공개하고 운영 주소에서 이어하기를 확인한다.

작업 범위: 변경 커밋·PR, Vercel Preview/Production, `docs/DEPLOY.md`, `docs/VERIFICATION.md`. 기존 `poke-du` 프로젝트와 `poke.letscoding.kr`을 사용한다.

완료 조건:

- [ ] Preview에서 다음 장·저장·신규 자산을 확인한다. OAuth를 사용하는 경우 해당 환경의 허용된 복귀 주소로 확인한다.
- [ ] `main` 반영으로 생성된 배포의 커밋과 성공 상태를 확인하고 운영 도메인의 새 버전을 확인한다.
- [ ] 테스트 계정으로 라운지 로그인·이름 표시, 카카오 복귀, 새 지역 저장·새 브라우저 복구를 확인한다. 모의 서버 결과로 대체하지 않는다.
- [ ] 운영 데이터는 테스트 계정에서만 사용하고, 사용자 저장을 초기화하거나 공유 라운지 인증 설정을 임의 변경하지 않는다.
- [ ] 배포 커밋·URL·검증 결과·ZIP 위치를 기록하고 실제 완료한 GitHub 이슈·마일스톤 상태를 갱신한다.

검증: Preview와 운영 URL의 자산·콘솔·네트워크 오류, 로그인 복귀, 계정 저장 결과 및 재접속 상태를 확인한다. 배포를 되돌릴 때 새 맵 저장의 호환성도 함께 검토하도록 운영 기록에 남긴다.
