# GitHub 에픽·이슈

> 기준: [PLAN.md](PLAN.md), 작성일: 2026-09-30. [GitHub Issues](https://github.com/quirinal36/my_game/issues). [마일스톤 문서](MILESTONES.md).

에픽 7개와 하위 이슈 31개를 등록했다. 각 하위 이슈는 GitHub의 상위 에픽 및 해당 마일스톤에 연결되어 있다. 담당 경로·현재 상태·작업 범위·완료 조건·검증 방법은 각 GitHub 이슈 본문에서 확인한다. 상태·진행률은 GitHub에서 관리한다.

## 시작 상태

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
