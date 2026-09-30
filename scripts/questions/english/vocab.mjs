// English vocabulary / phrase data for the English question generator.
// Rules (docs/CURRICULUM_ENGLISH.md): only unambiguous emoji; `group` marks words that must
// never appear together as choices (synonyms / same picture); `avoid` lists words whose Korean
// meaning would also be acceptable (e.g. Hello ↔ Bye both "안녕").

// ------------------------------------------------------------------ words ----
// { en, ko, emoji, cat, group?, plural?, an?, like?, koCan?, uncount? }
//   plural  : the emoji shows several → "They are …" / no "a"
//   an      : article "an"
//   like    : form used in "I like ___." (default: en + 's' unless uncount/plural)
const W = [
  // animals
  { en: 'dog', ko: '강아지', emoji: '🐶', cat: 'animal' },
  { en: 'cat', ko: '고양이', emoji: '🐱', cat: 'animal' },
  { en: 'pig', ko: '돼지', emoji: '🐷', cat: 'animal' },
  { en: 'cow', ko: '소', emoji: '🐮', cat: 'animal' },
  { en: 'lion', ko: '사자', emoji: '🦁', cat: 'animal' },
  { en: 'tiger', ko: '호랑이', emoji: '🐯', cat: 'animal' },
  { en: 'monkey', ko: '원숭이', emoji: '🐵', cat: 'animal' },
  { en: 'rabbit', ko: '토끼', emoji: '🐰', cat: 'animal' },
  { en: 'bird', ko: '새', emoji: '🐦', cat: 'animal' },
  { en: 'fish', ko: '물고기', emoji: '🐟', cat: 'animal' },
  { en: 'duck', ko: '오리', emoji: '🦆', cat: 'animal' },
  { en: 'bear', ko: '곰', emoji: '🐻', cat: 'animal' },
  { en: 'elephant', ko: '코끼리', emoji: '🐘', cat: 'animal', an: true },
  { en: 'frog', ko: '개구리', emoji: '🐸', cat: 'animal' },
  { en: 'horse', ko: '말', emoji: '🐴', cat: 'animal' },
  { en: 'mouse', ko: '쥐', emoji: '🐭', cat: 'animal', group: 'mouse' },
  { en: 'rat', ko: '쥐', emoji: '🐀', cat: 'animal', group: 'mouse' },
  { en: 'zebra', ko: '얼룩말', emoji: '🦓', cat: 'animal' },
  { en: 'fox', ko: '여우', emoji: '🦊', cat: 'animal' },
  { en: 'koala', ko: '코알라', emoji: '🐨', cat: 'animal' },
  { en: 'snake', ko: '뱀', emoji: '🐍', cat: 'animal' },
  { en: 'hen', ko: '암탉', emoji: '🐔', cat: 'animal', group: 'hen' },
  { en: 'sheep', ko: '양', emoji: '🐑', cat: 'animal', plural: false },
  { en: 'penguin', ko: '펭귄', emoji: '🐧', cat: 'animal' },
  { en: 'whale', ko: '고래', emoji: '🐳', cat: 'animal' },
  { en: 'octopus', ko: '문어', emoji: '🐙', cat: 'animal', an: true },
  { en: 'goat', ko: '염소', emoji: '🐐', cat: 'animal' },
  { en: 'ant', ko: '개미', emoji: '🐜', cat: 'animal', an: true },
  { en: 'bee', ko: '벌', emoji: '🐝', cat: 'animal' },
  { en: 'butterfly', ko: '나비', emoji: '🦋', cat: 'animal' },
  { en: 'turtle', ko: '거북', emoji: '🐢', cat: 'animal' },
  { en: 'giraffe', ko: '기린', emoji: '🦒', cat: 'animal' },
  { en: 'dolphin', ko: '돌고래', emoji: '🐬', cat: 'animal' },
  { en: 'bat', ko: '박쥐', emoji: '🦇', cat: 'animal' },
  { en: 'unicorn', ko: '유니콘', emoji: '🦄', cat: 'animal' },
  { en: 'wolf', ko: '늑대', emoji: '🐺', cat: 'animal' },
  { en: 'bug', ko: '벌레', emoji: '🐛', cat: 'animal', group: 'bug' },
  // fruit & vegetables
  { en: 'apple', ko: '사과', emoji: '🍎', cat: 'fruit', an: true },
  { en: 'banana', ko: '바나나', emoji: '🍌', cat: 'fruit' },
  { en: 'grapes', ko: '포도', emoji: '🍇', cat: 'fruit', plural: true, like: 'grapes' },
  { en: 'strawberry', ko: '딸기', emoji: '🍓', cat: 'fruit', like: 'strawberries' },
  { en: 'orange', ko: '오렌지', emoji: '🍊', cat: 'fruit', an: true, group: 'orange' },
  { en: 'watermelon', ko: '수박', emoji: '🍉', cat: 'fruit', like: 'watermelon' },
  { en: 'lemon', ko: '레몬', emoji: '🍋', cat: 'fruit' },
  { en: 'peach', ko: '복숭아', emoji: '🍑', cat: 'fruit', like: 'peaches' },
  { en: 'pear', ko: '배', emoji: '🍐', cat: 'fruit' },
  { en: 'cherry', ko: '체리', emoji: '🍒', cat: 'fruit', like: 'cherries' },
  { en: 'kiwi', ko: '키위', emoji: '🥝', cat: 'fruit' },
  { en: 'pineapple', ko: '파인애플', emoji: '🍍', cat: 'fruit', like: 'pineapple' },
  { en: 'corn', ko: '옥수수', emoji: '🌽', cat: 'fruit', uncount: true },
  { en: 'carrot', ko: '당근', emoji: '🥕', cat: 'fruit' },
  { en: 'tomato', ko: '토마토', emoji: '🍅', cat: 'fruit', like: 'tomatoes' },
  // food
  { en: 'milk', ko: '우유', emoji: '🥛', cat: 'food', uncount: true },
  { en: 'bread', ko: '빵', emoji: '🍞', cat: 'food', uncount: true },
  { en: 'egg', ko: '달걀', emoji: '🥚', cat: 'food', an: true },
  { en: 'pizza', ko: '피자', emoji: '🍕', cat: 'food', uncount: true },
  { en: 'cake', ko: '케이크', emoji: '🎂', cat: 'food', uncount: true },
  { en: 'rice', ko: '밥', emoji: '🍚', cat: 'food', uncount: true },
  { en: 'hamburger', ko: '햄버거', emoji: '🍔', cat: 'food' },
  { en: 'juice', ko: '주스', emoji: '🧃', cat: 'food', uncount: true },
  { en: 'cookie', ko: '쿠키', emoji: '🍪', cat: 'food' },
  { en: 'ice cream', ko: '아이스크림', emoji: '🍦', cat: 'food', uncount: true, noSentence: true },
  { en: 'candy', ko: '사탕', emoji: '🍬', cat: 'food', uncount: true },
  { en: 'cheese', ko: '치즈', emoji: '🧀', cat: 'food', uncount: true },
  { en: 'hot dog', ko: '핫도그', emoji: '🌭', cat: 'food', noSentence: true },
  { en: 'donut', ko: '도넛', emoji: '🍩', cat: 'food' },
  { en: 'popcorn', ko: '팝콘', emoji: '🍿', cat: 'food', uncount: true },
  { en: 'salad', ko: '샐러드', emoji: '🥗', cat: 'food', uncount: true },
  // body
  { en: 'eyes', ko: '눈', emoji: '👀', cat: 'body', plural: true },
  { en: 'nose', ko: '코', emoji: '👃', cat: 'body' },
  { en: 'mouth', ko: '입', emoji: '👄', cat: 'body' },
  { en: 'ear', ko: '귀', emoji: '👂', cat: 'body', an: true },
  { en: 'hand', ko: '손', emoji: '✋', cat: 'body' },
  { en: 'foot', ko: '발', emoji: '🦶', cat: 'body' },
  { en: 'arm', ko: '팔', emoji: '💪', cat: 'body', an: true },
  { en: 'leg', ko: '다리', emoji: '🦵', cat: 'body' },
  { en: 'tooth', ko: '이', emoji: '🦷', cat: 'body' },
  { en: 'tongue', ko: '혀', emoji: '👅', cat: 'body' },
  // family
  { en: 'mom', ko: '엄마', emoji: '👩', cat: 'family', group: 'woman' },
  { en: 'dad', ko: '아빠', emoji: '👨', cat: 'family', group: 'man' },
  { en: 'sister', ko: '언니·누나', emoji: '👧', cat: 'family', group: 'girl' },
  { en: 'brother', ko: '오빠·형', emoji: '👦', cat: 'family', group: 'boy' },
  { en: 'grandma', ko: '할머니', emoji: '👵', cat: 'family' },
  { en: 'grandpa', ko: '할아버지', emoji: '👴', cat: 'family' },
  { en: 'baby', ko: '아기', emoji: '👶', cat: 'family' },
  // classroom
  { en: 'book', ko: '책', emoji: '📕', cat: 'classroom' },
  { en: 'pencil', ko: '연필', emoji: '✏️', cat: 'classroom' },
  { en: 'bag', ko: '가방', emoji: '🎒', cat: 'classroom' },
  { en: 'chair', ko: '의자', emoji: '🪑', cat: 'classroom' },
  { en: 'ruler', ko: '자', emoji: '📏', cat: 'classroom' },
  { en: 'scissors', ko: '가위', emoji: '✂️', cat: 'classroom', plural: true, noSentence: true },
  { en: 'crayon', ko: '크레용', emoji: '🖍️', cat: 'classroom' },
  { en: 'clock', ko: '시계', emoji: '🕐', cat: 'classroom' },
  { en: 'door', ko: '문', emoji: '🚪', cat: 'classroom' },
  { en: 'pen', ko: '펜', emoji: '🖊️', cat: 'classroom' },
  { en: 'notebook', ko: '공책', emoji: '📓', cat: 'classroom' },
  { en: 'computer', ko: '컴퓨터', emoji: '💻', cat: 'classroom' },
  { en: 'paper', ko: '종이', emoji: '📄', cat: 'classroom', uncount: true },
  // clothes
  { en: 'hat', ko: '모자', emoji: '🎩', cat: 'clothes', group: 'hat' },
  { en: 'cap', ko: '야구 모자', emoji: '🧢', cat: 'clothes', group: 'hat' },
  { en: 'shirt', ko: '셔츠', emoji: '👕', cat: 'clothes' },
  { en: 'pants', ko: '바지', emoji: '👖', cat: 'clothes', plural: true },
  { en: 'shoes', ko: '신발', emoji: '👟', cat: 'clothes', plural: true },
  { en: 'socks', ko: '양말', emoji: '🧦', cat: 'clothes', plural: true },
  { en: 'dress', ko: '원피스', emoji: '👗', cat: 'clothes' },
  { en: 'coat', ko: '코트', emoji: '🧥', cat: 'clothes' },
  { en: 'gloves', ko: '장갑', emoji: '🧤', cat: 'clothes', plural: true },
  { en: 'scarf', ko: '목도리', emoji: '🧣', cat: 'clothes' },
  { en: 'boots', ko: '부츠', emoji: '👢', cat: 'clothes', plural: true },
  // things (phonics / letter sounds)
  { en: 'ball', ko: '공', emoji: '⚽', cat: 'thing' },
  { en: 'bus', ko: '버스', emoji: '🚌', cat: 'thing' },
  { en: 'car', ko: '자동차', emoji: '🚗', cat: 'thing' },
  { en: 'house', ko: '집', emoji: '🏠', cat: 'thing' },
  { en: 'flower', ko: '꽃', emoji: '🌸', cat: 'thing' },
  { en: 'gift', ko: '선물', emoji: '🎁', cat: 'thing' },
  { en: 'guitar', ko: '기타', emoji: '🎸', cat: 'thing' },
  { en: 'kite', ko: '연', emoji: '🪁', cat: 'thing' },
  { en: 'key', ko: '열쇠', emoji: '🔑', cat: 'thing' },
  { en: 'king', ko: '왕', emoji: '🤴', cat: 'thing' },
  { en: 'queen', ko: '여왕', emoji: '👸', cat: 'thing' },
  { en: 'leaf', ko: '나뭇잎', emoji: '🍃', cat: 'thing' },
  { en: 'moon', ko: '달', emoji: '🌙', cat: 'thing' },
  { en: 'map', ko: '지도', emoji: '🗺️', cat: 'thing' },
  { en: 'robot', ko: '로봇', emoji: '🤖', cat: 'thing' },
  { en: 'ring', ko: '반지', emoji: '💍', cat: 'thing' },
  { en: 'rainbow', ko: '무지개', emoji: '🌈', cat: 'thing' },
  { en: 'sun', ko: '해', emoji: '☀️', cat: 'thing', group: 'sun' },
  { en: 'star', ko: '별', emoji: '⭐', cat: 'thing' },
  { en: 'train', ko: '기차', emoji: '🚂', cat: 'thing' },
  { en: 'umbrella', ko: '우산', emoji: '☂️', cat: 'thing', an: true },
  { en: 'van', ko: '승합차', emoji: '🚐', cat: 'thing' },
  { en: 'violin', ko: '바이올린', emoji: '🎻', cat: 'thing' },
  { en: 'volcano', ko: '화산', emoji: '🌋', cat: 'thing' },
  { en: 'watch', ko: '손목시계', emoji: '⌚', cat: 'thing' },
  { en: 'box', ko: '상자', emoji: '📦', cat: 'thing' },
  { en: 'yo-yo', ko: '요요', emoji: '🪀', cat: 'thing' },
  { en: 'bed', ko: '침대', emoji: '🛏️', cat: 'thing' },
  { en: 'web', ko: '거미줄', emoji: '🕸️', cat: 'thing' },
  { en: 'pin', ko: '핀', emoji: '📌', cat: 'thing' },
  { en: 'ship', ko: '배(선박)', emoji: '🚢', cat: 'thing' },
  { en: 'lock', ko: '자물쇠', emoji: '🔒', cat: 'thing' },
  { en: 'cup', ko: '컵', emoji: '🥤', cat: 'thing' },
  { en: 'drum', ko: '북', emoji: '🥁', cat: 'thing' },
  { en: 'truck', ko: '트럭', emoji: '🚚', cat: 'thing' },
  { en: 'six', ko: '6', emoji: '6️⃣', cat: 'thing', noSentence: true },
  { en: 'ten', ko: '10', emoji: '🔟', cat: 'thing', noSentence: true },
  { en: 'red', ko: '빨간색', emoji: '🟥', cat: 'thing', noSentence: true },
  { en: 'yellow', ko: '노란색', emoji: '🟨', cat: 'thing', noSentence: true },
  // actions (verbs) — ko = dictionary form, koCan = "…할 수 있어요"
  { en: 'run', ko: '달리다', emoji: '🏃', cat: 'action', koCan: '달릴 수 있어요' },
  { en: 'swim', ko: '수영하다', emoji: '🏊', cat: 'action', koCan: '수영할 수 있어요' },
  { en: 'dance', ko: '춤추다', emoji: '💃', cat: 'action', koCan: '춤출 수 있어요' },
  { en: 'sing', ko: '노래하다', emoji: '🎤', cat: 'action', koCan: '노래할 수 있어요' },
  { en: 'climb', ko: '오르다', emoji: '🧗', cat: 'action', koCan: '올라갈 수 있어요' },
  { en: 'ski', ko: '스키 타다', emoji: '⛷️', cat: 'action', koCan: '스키를 탈 수 있어요' },
  { en: 'skate', ko: '스케이트 타다', emoji: '⛸️', cat: 'action', koCan: '스케이트를 탈 수 있어요' },
  { en: 'walk', ko: '걷다', emoji: '🚶', cat: 'action', koCan: '걸을 수 있어요' },
  { en: 'ride a bike', ko: '자전거 타다', emoji: '🚴', cat: 'action', koCan: '자전거를 탈 수 있어요' },
  // feelings — ko is the "나는 ___" predicate
  { en: 'happy', ko: '행복해요', emoji: '😀', cat: 'feeling' },
  { en: 'sad', ko: '슬퍼요', emoji: '😢', cat: 'feeling' },
  { en: 'angry', ko: '화나요', emoji: '😠', cat: 'feeling' },
  { en: 'sleepy', ko: '졸려요', emoji: '😴', cat: 'feeling' },
  { en: 'scared', ko: '무서워요', emoji: '😱', cat: 'feeling' },
  { en: 'sick', ko: '아파요', emoji: '🤒', cat: 'feeling' },
  { en: 'surprised', ko: '놀랐어요', emoji: '😲', cat: 'feeling' },
  { en: 'hot', ko: '더워요', emoji: '🥵', cat: 'feeling' },
  { en: 'cold', ko: '추워요', emoji: '🥶', cat: 'feeling' },
  // weather — ko is the "날씨가 ___" predicate
  { en: 'sunny', ko: '맑아요', emoji: '☀️', cat: 'weather', group: 'sun' },
  { en: 'rainy', ko: '비가 와요', emoji: '🌧️', cat: 'weather' },
  { en: 'cloudy', ko: '흐려요', emoji: '☁️', cat: 'weather' },
  { en: 'snowy', ko: '눈이 와요', emoji: '❄️', cat: 'weather' },
];
export const WORDS = W;
export const byEn = Object.fromEntries(W.map((w) => [w.en, w]));
export const words = (...ens) => ens.map((e) => { const w = byEn[e]; if (!w) throw new Error(`unknown word ${e}`); return w; });
export const inCat = (cat) => W.filter((w) => w.cat === cat);

// "I like ___" form
export const likeForm = (w) => w.like || (w.uncount || w.plural ? w.en : /(s|x|sh|ch)$/.test(w.en) ? w.en + 'es' : /[^aeiou]y$/.test(w.en) ? w.en.slice(0, -1) + 'ies' : w.en + 's');
export const article = (w) => (w.plural || w.uncount ? '' : w.an ? 'an ' : 'a ');

// ---------------------------------------------------------------- phrases ----
// group: synonyms (never together). replies: groups that are acceptable replies (never used as distractors).
export const PHRASES = [
  { en: 'Hello!', ko: '안녕!', group: 'hello', emoji: '👋', replies: ['hello'], avoidKo: ['bye'] },
  { en: 'Hi!', ko: '안녕!', group: 'hello', emoji: '👋', replies: ['hello'], avoidKo: ['bye'] },
  { en: 'Bye!', ko: '잘 가!', group: 'bye', replies: ['bye'], avoidKo: ['hello'] },
  { en: 'Good-bye!', ko: '잘 가!', group: 'bye', replies: ['bye'], avoidKo: ['hello'] },
  { en: 'See you!', ko: '또 봐!', group: 'bye', replies: ['bye'], avoidKo: ['hello'] },
  { en: 'Good morning.', ko: '좋은 아침!', group: 'morning', emoji: '🌅', replies: ['morning', 'hello'] },
  { en: 'Good afternoon.', ko: '안녕! (낮 인사)', group: 'afternoon', replies: ['afternoon', 'hello'], avoidKo: ['hello'] },
  { en: 'Good night.', ko: '잘 자.', group: 'night', emoji: '🌙', replies: ['night'] },
  { en: 'Thank you.', ko: '고마워.', group: 'thanks', emoji: '🎁', replies: ['welcome'] },
  { en: "You're welcome.", ko: '천만에.', group: 'welcome', replies: [] },
  { en: 'Sorry.', ko: '미안해.', group: 'sorry', replies: ['ok'] },
  { en: "That's OK.", ko: '괜찮아.', group: 'ok', replies: [] },
  { en: 'Nice to meet you.', ko: '만나서 반가워.', group: 'nice', replies: ['nice'] },
  { en: 'Nice to meet you, too.', ko: '나도 만나서 반가워.', group: 'nice', replies: [] },
];
export const phrase = (en) => { const p = PHRASES.find((x) => x.en === en); if (!p) throw new Error(`unknown phrase ${en}`); return p; };
export const phrases = (...ens) => ens.map(phrase);

// situation prompts (Korean, ≤ 40 chars) → phrase group
export const SITUATIONS = [
  { prompt: '만날 때 하는 "안녕!"을 골라 보세요.', group: 'hello' },
  { prompt: '헤어질 때 하는 "잘 가!"를 골라 보세요.', group: 'bye' },
  { prompt: '"좋은 아침이야."를 영어로 골라 보세요.', group: 'morning' },
  { prompt: '"잘 자."를 영어로 골라 보세요.', group: 'night' },
  { prompt: '선물을 받았어요. 뭐라고 말할까요?', group: 'thanks' },
  { prompt: '친구와 부딪혔어요. 뭐라고 말할까요?', group: 'sorry' },
  { prompt: '친구가 고맙다고 해요. 뭐라고 대답할까요?', group: 'welcome' },
  { prompt: '친구가 미안하다고 해요. 뭐라고 대답할까요?', group: 'ok' },
  { prompt: '"만나서 반가워."를 영어로 골라 보세요.', group: 'nice' },
];

// ---------------------------------------------------------------- letters ----
export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
/** Look-alike letters (for harder distractors). */
export const CONFUSE_UPPER = {
  A: ['V', 'H', 'R'], B: ['D', 'P', 'R', 'E'], C: ['G', 'O', 'Q'], D: ['B', 'O', 'P'], E: ['F', 'B', 'L'], F: ['E', 'P', 'T'],
  G: ['C', 'O', 'Q'], H: ['N', 'M', 'A'], I: ['L', 'T', 'J'], J: ['I', 'L', 'U'], K: ['X', 'R', 'H'], L: ['I', 'E', 'J'],
  M: ['N', 'W', 'H'], N: ['M', 'H', 'Z'], O: ['Q', 'C', 'D'], P: ['B', 'R', 'D'], Q: ['O', 'G', 'C'], R: ['P', 'B', 'K'],
  S: ['Z', 'C', 'G'], T: ['I', 'F', 'Y'], U: ['V', 'J', 'W'], V: ['U', 'W', 'Y'], W: ['M', 'V', 'N'], X: ['K', 'Y', 'Z'],
  Y: ['V', 'X', 'T'], Z: ['N', 'S', 'X'],
};
export const CONFUSE_LOWER = {
  a: ['o', 'e', 'd'], b: ['d', 'p', 'q'], c: ['e', 'o', 'a'], d: ['b', 'p', 'q'], e: ['c', 'a', 'o'], f: ['t', 'r', 'l'],
  g: ['q', 'p', 'y'], h: ['n', 'b', 'k'], i: ['j', 'l', 't'], j: ['i', 'g', 'y'], k: ['h', 'x', 'b'], l: ['i', 't', 'j'],
  m: ['n', 'w', 'h'], n: ['m', 'h', 'u'], o: ['a', 'c', 'e'], p: ['q', 'b', 'd'], q: ['p', 'g', 'd'], r: ['n', 'f', 'v'],
  s: ['z', 'c', 'e'], t: ['f', 'l', 'i'], u: ['n', 'v', 'a'], v: ['u', 'w', 'y'], w: ['m', 'v', 'u'], x: ['k', 'y', 'z'],
  y: ['v', 'g', 'j'], z: ['s', 'x', 'n'],
};

/** Letter → words that START with it (used for initial-sound / letter-picture). */
export const INITIAL_WORDS = {
  a: ['apple', 'ant'], b: ['bear', 'banana', 'bird', 'bus', 'book', 'ball'], c: ['cat', 'cow', 'car', 'cake', 'corn'],
  d: ['dog', 'duck', 'door', 'dress'], e: ['egg', 'elephant'], f: ['fish', 'fox', 'frog', 'flower'],
  g: ['goat', 'grapes', 'gift', 'guitar'], h: ['hat', 'horse', 'house', 'hamburger'], i: ['ice cream'], j: ['juice'],
  k: ['kite', 'key', 'king', 'koala'], l: ['lion', 'lemon', 'leaf'], m: ['moon', 'milk', 'monkey', 'mouse', 'map'],
  n: ['nose', 'notebook'], o: ['octopus', 'orange'], p: ['pig', 'pen', 'pizza', 'penguin', 'peach'], q: ['queen'],
  r: ['rabbit', 'ruler', 'robot', 'ring', 'rainbow'], s: ['sun', 'socks', 'star', 'snake', 'strawberry'],
  t: ['tiger', 'tomato', 'train', 'tooth', 'turtle'], u: ['umbrella', 'unicorn'], v: ['van', 'violin', 'volcano'],
  w: ['watch', 'whale', 'watermelon', 'wolf'], x: [], y: ['yo-yo', 'yellow'], z: ['zebra'],
};
/** Words that END with x (the letter x is taught by its final sound). */
export const FINAL_X_WORDS = ['fox', 'box', 'six'];

// ------------------------------------------------------- short-vowel words ----
// CVC-ish words for 2-1 phonics. pattern: '_' marks the tested slot when the vowel is missing.
export const SHORT_VOWEL = {
  a: ['cat', 'hat', 'bat', 'map', 'cap', 'bag', 'ant', 'van', 'rat'],
  e: ['bed', 'pen', 'hen', 'red', 'ten', 'leg', 'egg', 'web'],
  i: ['pig', 'six', 'pin', 'fish', 'milk', 'ship', 'ring', 'king', 'gift'],
  o: ['dog', 'box', 'fox', 'frog', 'clock', 'lock', 'octopus', 'mom'],
  u: ['sun', 'bus', 'cup', 'bug', 'duck', 'drum', 'truck', 'run', 'umbrella'],
};
/** Words short enough for missing-letter (single vowel, ≤ 5 letters). */
export const MISSING_OK = (en) => en.length <= 5 && (en.match(/[aeiou]/g) || []).length === 1;

// ----------------------------------------------------------------- colors ----
export const COLORS = [
  { en: 'red', ko: '빨간색', hex: '#e53935' },
  { en: 'blue', ko: '파란색', hex: '#1e88e5' },
  { en: 'yellow', ko: '노란색', hex: '#fdd835' },
  { en: 'green', ko: '초록색', hex: '#43a047' },
  { en: 'orange', ko: '주황색', hex: '#fb8c00' },
  { en: 'pink', ko: '분홍색', hex: '#ff80ab' },
  { en: 'purple', ko: '보라색', hex: '#8e24aa' },
  { en: 'black', ko: '검은색', hex: '#212121' },
  { en: 'white', ko: '하얀색', hex: '#ffffff' },
  { en: 'brown', ko: '갈색', hex: '#6d4c41' },
];
export const color = (en) => { const c = COLORS.find((x) => x.en === en); if (!c) throw new Error(`unknown color ${en}`); return c; };
export const colors = (...ens) => ens.map(color);
export const COLOR_SHAPES = ['circle', 'square', 'star', 'heart', 'triangle'];

// ---------------------------------------------------------------- numbers ----
export const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const NUMBER_EMOJI = ['🍎', '⭐', '🐟', '🎈', '🍪', '🐤', '🌸', '⚽', '🍓', '🚗'];

// ------------------------------------------------------------------- days ----
export const DAYS = [
  { en: 'Monday', ko: '월요일' }, { en: 'Tuesday', ko: '화요일' }, { en: 'Wednesday', ko: '수요일' },
  { en: 'Thursday', ko: '목요일' }, { en: 'Friday', ko: '금요일' }, { en: 'Saturday', ko: '토요일' }, { en: 'Sunday', ko: '일요일' },
];

// ------------------------------------------------------------ sight words ----
export const SIGHT = [
  { en: 'I', ko: '나' }, { en: 'you', ko: '너' }, { en: 'a', ko: null }, { en: 'the', ko: null }, { en: 'is', ko: '~이에요' },
  { en: 'it', ko: '그것' }, { en: 'can', ko: '할 수 있어요' }, { en: 'see', ko: '보다' }, { en: 'like', ko: '좋아하다' }, { en: 'and', ko: '그리고' },
];
/** Fill-in sentences: text with ___ ; answer; distractors that are grammatically impossible in the slot; emoji visual. */
export const SIGHT_SENTENCES = [
  { text: 'I ___ apples.', full: 'I like apples.', ko: '나는 사과를 좋아해요.', answer: 'like', wrong: ['is', 'and', 'the', 'a'], emoji: ['👍', '🍎'] },
  { text: '___ like bananas.', full: 'I like bananas.', ko: '나는 바나나를 좋아해요.', answer: 'I', wrong: ['is', 'the', 'and', 'it'], emoji: ['👍', '🍌'] },
  { text: 'It ___ a dog.', full: 'It is a dog.', ko: '이것은 강아지예요.', answer: 'is', wrong: ['a', 'the', 'and', 'I'], emoji: ['🐶'] },
  { text: 'I ___ swim.', full: 'I can swim.', ko: '나는 수영할 수 있어요.', answer: 'can', wrong: ['is', 'the', 'a', 'and'], emoji: ['🏊'] },
  { text: 'I see ___ cat.', full: 'I see a cat.', ko: '고양이가 보여요.', answer: 'a', wrong: ['is', 'and', 'it', 'can'], emoji: ['👀', '🐱'] },
  { text: 'I like cats ___ dogs.', full: 'I like cats and dogs.', ko: '나는 고양이와 강아지를 좋아해요.', answer: 'and', wrong: ['is', 'the', 'a', 'it'], emoji: ['🐱', '🐶'] },
  { text: '___ is a pig.', full: 'It is a pig.', ko: '이것은 돼지예요.', answer: 'It', wrong: ['and', 'the', 'a', 'like'], emoji: ['🐷'] },
  { text: 'I ___ a bird.', full: 'I see a bird.', ko: '새가 보여요.', answer: 'see', wrong: ['is', 'and', 'the', 'a'], emoji: ['👀', '🐦'] },
  { text: 'Can ___ swim?', full: 'Can you swim?', ko: '너는 수영할 수 있니?', answer: 'you', wrong: ['is', 'the', 'and', 'a'], emoji: ['🏊', '❓'] },
  { text: 'I ___ run.', full: 'I can run.', ko: '나는 달릴 수 있어요.', answer: 'can', wrong: ['is', 'the', 'a', 'and'], emoji: ['🏃'] },
  { text: 'It ___ a fish.', full: 'It is a fish.', ko: '이것은 물고기예요.', answer: 'is', wrong: ['a', 'the', 'and', 'you'], emoji: ['🐟'] },
  { text: '___ like milk.', full: 'I like milk.', ko: '나는 우유를 좋아해요.', answer: 'I', wrong: ['is', 'the', 'and', 'a'], emoji: ['👍', '🥛'] },
  { text: 'I see ___ egg.', full: 'I see an egg.', ko: '달걀이 보여요.', answer: 'an', wrong: ['is', 'and', 'it', 'can'], emoji: ['👀', '🥚'] },
  { text: 'I see the ___.', full: 'I see the moon.', ko: '달이 보여요.', answer: 'moon', wrong: ['is', 'and', 'you', 'can'], emoji: ['👀', '🌙'] },
  { text: 'I like pizza ___ juice.', full: 'I like pizza and juice.', ko: '나는 피자와 주스를 좋아해요.', answer: 'and', wrong: ['is', 'the', 'a', 'it'], emoji: ['🍕', '🧃'] },
];

// ------------------------------------------------------------- dialogs ----
// Simple Q → A pairs used by the dialog generator (2-2 units add their own).
export const DIALOGS = {
  whatsThis: { q: "What's this?", qKo: '이게 뭐야?', a: (w) => `It's ${article(w)}${w.en}.`, aKo: (w) => `이것은 ${w.ko}${iEyo(w.ko)}.` },
  howAreYou: { q: 'How are you?', qKo: '기분이 어때?', a: (w) => `I'm ${w.en}.`, aKo: (w) => `나는 ${w.ko}` },
  weather: { q: "How's the weather?", qKo: '날씨가 어때?', a: (w) => `It's ${w.en}.`, aKo: (w) => `날씨가 ${w.ko}` },
  canYou: { q: (w) => `Can you ${w.en}?`, qKo: (w) => `너는 ${w.koCan.replace('있어요', '있니')}?` },
  doYouLike: { q: (w) => `Do you like ${likeForm(w)}?`, qKo: (w) => `너는 ${w.ko}${eulReul(w.ko)} 좋아하니?` },
  whatDay: { q: 'What day is it today?', qKo: '오늘 무슨 요일이야?', a: (d) => `It's ${d.en}.`, aKo: (d) => `오늘은 ${d.ko}이에요.` },
};

// ------------------------------------------------------ Korean particles ----
export function hasBatchim(s) {
  const str = String(s).replace(/[^가-힣\d]/g, '');
  if (!str) return false;
  const ch = str[str.length - 1];
  if (/\d/.test(ch)) return '013678'.includes(ch); // 영·일·삼·육·칠·팔 → 받침 있음
  const code = ch.charCodeAt(0) - 0xac00;
  return code % 28 !== 0;
}
export const eunNeun = (s) => (hasBatchim(s) ? '은' : '는');
export const iGa = (s) => (hasBatchim(s) ? '이' : '가');
export const eulReul = (s) => (hasBatchim(s) ? '을' : '를');
export const iEyo = (s) => (hasBatchim(s) ? '이에요' : '예요');
