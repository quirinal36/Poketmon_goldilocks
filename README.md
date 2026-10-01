# 포켓몬 공부 대모험

플레이: https://poke.letscoding.kr

초등 저학년 수학·영어 문제를 풀며 태초마을에서 갈색시티의 세 번째 배지까지 모험하는 웹 게임입니다. 38개 맵, 251종 데이터, 266레슨·6,906문제를 내장합니다.

세 번째 장은 현재 구현 브랜치에서 검증 중입니다. 운영 주소의 반영 상태는 [검증 기록](docs/VERIFICATION.md#세-번째-장-구현과-자동-검증)을 참고하세요.

```sh
npm install
npm run dev
```

브라우저에서 표시된 로컬 주소를 엽니다. `.env.local`에 `SUPABASE_PROJECT_URL`, `SUPABASE_ANON_KEY`가 있으면 시작 화면에서 카카오 로그인 또는 라운지 계정 로그인(기존 라운지 이메일·비밀번호)을 사용할 수 있습니다. 게임 데이터는 `pokedu` 스키마를 사용하며, 계정별 저장과 게스트 저장은 분리됩니다. 설정은 [배포 안내](docs/DEPLOY.md#카카오-로그인--pokedu-현재-구성)를 참고하세요. 방향키로 이동, Enter/Z로 대화, Escape/X로 취소, M으로 메뉴를 엽니다. 터치 방향키·A·B·START도 제공합니다. **메뉴 → 저장하기**로 현재 모험을 저장하고, 다음 접속 때 **이어서 하기**로 재개합니다. 20초 자동 저장도 지원하며, 로그인 시 계정 저장 결과를 확인할 수 있습니다.

```sh
npm run build
npm test
npm run check:questions
npm run check:maps
npm run check:pokemon
npm run e2e
```

웹 빌드는 `dist/`에 생성됩니다. GitHub `main`에 push하면 연결된 Vercel 프로젝트가 배포하며, [라운지의 Play 버튼](https://lounge.letscoding.kr/works/leco/poke)은 운영 주소로 이동합니다. 외부 API 설정이 없어도 내장 문제와 브라우저 저장으로 실행됩니다. Playwright 브라우저가 없다면 `npx playwright install chromium`을 먼저 실행하세요.

- [선생님·학부모 안내](docs/TEACHER_GUIDE.md)
- [구현·검증 결과와 남은 서비스 배포](docs/VERIFICATION.md)
- [교육과정](docs/CURRICULUM.md) · [240문제 검토 기록](docs/QUESTION_REVIEW.md)
- [서비스 배포](docs/DEPLOY.md) · [설계](docs/DESIGN.md)
- [두 번째 장: 달맞이산~블루시티](docs/STORY_CHAPTER_2.md)
- [두 번째 장 마일스톤](docs/MILESTONES.md#chapter2) · [GitHub 이슈](docs/GITHUB_ISSUES.md#chapter2)
- [세 번째 장: 이수재~갈색시티·마티스](docs/STORY_CHAPTER_3.md) · [마일스톤](docs/MILESTONES.md#chapter3) · [GitHub 이슈](docs/GITHUB_ISSUES.md#chapter3) — 기능 구현, 검증 중
- [네 번째 장: 돌산터널~무지개시티·민화](docs/STORY_CHAPTER_4.md) · [마일스톤](docs/MILESTONES.md#chapter4) · [GitHub 이슈](docs/GITHUB_ISSUES.md#chapter4) — 계획 / 미구현
- [배경음악 제작·적용 기록](docs/AUDIO.md)

개발용 검사: `/dev/art.html`, `/dev/audio.html`, `/dev/visuals.html`. `?debug=1`에서는 `window.__G`와 E2E 가속 도구가 활성화됩니다. 일반 실행에서는 노출하지 않습니다.
