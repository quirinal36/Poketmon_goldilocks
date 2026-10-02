# 교육과정 및 문제은행

구현 기준은 DESIGN.md와 GitHub E2/T06~T09입니다. 결정적 시드로 생성하며 수학 648문제와 영어 3,402문제, 총 4,050문제입니다. 영어는 저학년 입문 과정이며 정규 1~2학년 국가 영어 교육과정으로 주장하지 않습니다.

검증: `npm run data:questions` → `npm run check:questions`. 수학은 생성기의 정답 계산을 가져오지 않고 시각자료·식에서 전체 재계산합니다. 영어는 어휘 데이터만 공유하고 별도의 판정기로 정답 의미·중복 정답·음성 속성을 검사합니다. 표본 검토 목록은 [QUESTION_REVIEW.md](QUESTION_REVIEW.md)에 있습니다.

일반 레슨은 정답 8개, 단원 복습은 10개로 완료합니다. 체육관은 이미 완료한 레슨에서 출제합니다. 보호자가 시작 진도를 앞당긴 경우 사전 완료 표시도 복습 범위에 포함됩니다.

## 수학

학년별 수 세기·도형 과정 대신 아래 0~8단계의 연산만 순서대로 학습합니다. 숫자로 계산식을 보여 주며 과일·사물 개수 세기는 출제하지 않습니다.

| 단계 | 범위 | 예시 |
|---|---|---|
| 0 | 한 자리 덧셈: 합 < 10, 한 자리 뺄셈: 차 > 0 | 3 + 4, 8 - 5 |
| 1 | 한 자리 수 두 개의 덧셈: 합 > 10 | 7 + 8 |
| 2 | 10보다 큰 수에서 한 자리 수를 뺄 때: 0 < 차 < 10 | 13 - 6 |
| 3 | 구구단 2~3단 | 2 × 7, 3 × 8 |
| 4 | 구구단 4~5단 | 4 × 6, 5 × 9 |
| 5 | 구구단 6단 | 6 × 7 |
| 6 | 구구단 7단 | 7 × 8 |
| 7 | 구구단 8단 | 8 × 9 |
| 8 | 구구단 9단 | 9 × 9 |

각 단계는 기본·연습·복습 3레슨입니다. 0단계는 덧셈·뺄셈·혼합 복습, 3~4단계는 각 단·혼합 복습으로 나눕니다. 기본·연습은 정답 8개, 복습은 10개로 완료한 뒤 다음 단계로 갑니다. 하루 레슨 수는 기존 보호자 설정을 따릅니다. 이전 단계의 복습도 섞이며 아직 배우지 않은 단은 출제하지 않습니다.

레슨당 24문제이며 결과 입력·결과 선택·피연산자 빈칸 찾기를 사용합니다. 구구단은 각 단 ×1~×9까지입니다. 단계 번호 0~8과 레슨 내 문제 형식 난이도 1~3은 별개입니다.

이전 수학 레슨과 구분되는 새 ID를 사용하므로 기존 세기 레슨 완료 기록이 새 연산 레슨을 자동 완료하지 않습니다. 기존 저장·배지·도장과 영어 진도는 보존하며, 새 수학 과정은 0단계에서 시작합니다. 보호자 메뉴에서 시작 레슨을 바꿀 수 있습니다. 로그인 시에도 수학 교육과정·문제는 내장 데이터를 사용해 서버의 이전 세기 과정이 섞이지 않게 합니다. 영어의 서버 덮어쓰기는 유지합니다.

## 영어

| 학기 | 단원 | 레슨 순서 | 문제 수 |
|---|---|---|---|
| 1-1 | 안녕! Hello! | 만나고 헤어지기 Hello! Bye! → 아침과 밤 인사 Good morning! → 고마워, 미안해 Thank you! Sorry! → 안녕! 복습 | 112 |
| 1-1 | 알파벳 A~G | A B C D → E F G → A부터 G까지 순서대로 → 알파벳 복습 | 121 |
| 1-1 | 알파벳 H~N | H I J K → L M N → H부터 N까지 순서대로 → 알파벳 복습 | 118 |
| 1-1 | 알파벳 O~U | O P Q R → S T U → O부터 U까지 순서대로 → 알파벳 복습 | 118 |
| 1-1 | 알파벳 V~Z | V W X → Y Z → A부터 Z까지 알파벳 순서 → 알파벳 복습 | 110 |
| 1-1 | 색깔 Colors | red blue yellow green → orange pink purple → black white brown → 색깔 복습 | 118 |
| 1-1 | 숫자 1~10 Numbers | one two three four five → six seven eight nine ten → one부터 ten까지 섞어서 → 숫자 1~10 복습 | 105 |
| 1-2 | 소문자 a~m | a b c d → e f g h → i j k l m → 소문자 복습 | 120 |
| 1-2 | 소문자 n~z | n o p q → r s t u → v w x y z → 소문자 복습 | 122 |
| 1-2 | 대문자와 소문자 Big & Small | A~M 짝 찾기 → N~Z 짝 찾기 → 알파벳 순서 A~Z → 대문자와 소문자 복습 | 106 |
| 1-2 | 글자 소리 a~m | a b c d 소리 → e f g h 소리 → i j k l m 소리 → 글자 소리 복습 | 124 |
| 1-2 | 글자 소리 n~z | n o p q 소리 → r s t u 소리 → v w x y z 소리 → 글자 소리 복습 | 124 |
| 1-2 | 동물 Animals | dog cat pig cow rabbit duck → lion tiger monkey bear elephant zebra → bird fish frog horse + 섞어서 → 동물 복습 | 108 |
| 1-2 | 과일과 음식 Fruits & Food | apple banana grapes strawberry orange watermelon → milk bread egg pizza cake juice → lemon peach cookie rice + 섞어서 → 과일과 음식 복습 | 113 |
| 2-1 | 짧은 a 소리 Short a | a 소리 낱말 배우기 → 빈칸에 글자 넣기 → 낱말 읽어 보기 → 짧은 a 소리 복습 | 124 |
| 2-1 | 짧은 e 소리 Short e | e 소리 낱말 배우기 → 빈칸에 글자 넣기 → 낱말 읽어 보기 → 짧은 e 소리 복습 | 113 |
| 2-1 | 짧은 i 소리 Short i | i 소리 낱말 배우기 → 빈칸에 글자 넣기 → 낱말 읽어 보기 → 짧은 i 소리 복습 | 123 |
| 2-1 | 짧은 o 소리 Short o | o 소리 낱말 배우기 → 빈칸에 글자 넣기 → 낱말 읽어 보기 → 짧은 o 소리 복습 | 112 |
| 2-1 | 짧은 u 소리 Short u | u 소리 낱말 배우기 → 빈칸에 글자 넣기 → 낱말 읽어 보기 → 짧은 u 소리 복습 | 122 |
| 2-1 | 우리 몸 Body | eyes nose mouth ear tooth → hand foot arm leg tongue → Touch your nose! 문장 → 우리 몸 복습 | 115 |
| 2-1 | 우리 가족 Family | mom dad baby → sister brother grandma grandpa → This is my mom. 문장 → 우리 가족 복습 | 107 |
| 2-1 | 숫자 11~20 Numbers | eleven ~ fifteen → sixteen ~ twenty → one부터 twenty까지 섞어서 → 숫자 11~20 복습 | 110 |
| 2-2 | 우리 교실 My Classroom | book pencil bag ruler crayon → chair clock door scissors notebook → What's this? It's a book. → 우리 교실 복습 | 100 |
| 2-2 | 기분 Feelings | happy sad angry sleepy → scared sick surprised + I'm happy. → How are you? 대화 → 기분 복습 | 123 |
| 2-2 | 날씨 Weather | sunny rainy cloudy snowy → It's sunny. 문장 → How's the weather? 대화 → 날씨 복습 | 100 |
| 2-2 | 할 수 있어요 I can! | run swim dance sing → climb ski skate walk ride a bike + I can swim. → Can you swim? Yes, I can. → 할 수 있어요 복습 | 116 |
| 2-2 | 좋아해요 I like! | I like apples. 과일 → I like pizza. / I don't like pizza. → Do you like apples? Yes, I do. → 좋아해요 복습 | 93 |
| 2-2 | 요일 Days of the Week | Monday Tuesday Wednesday → Thursday Friday Saturday Sunday → 요일 순서와 What day is it? → 요일 복습 | 96 |
| 2-2 | 옷 Clothes | hat shirt pants shoes socks → dress coat gloves scarf boots → This is my hat. 문장 → 옷 복습 | 110 |
| 2-2 | 자주 보는 낱말 Sight Words | I a the is it → you can see like and → 문장 완성하기 → 자주 보는 낱말 복습 | 119 |
