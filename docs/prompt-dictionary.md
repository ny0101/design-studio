# Design Studio Prompt Dictionary

Design Studio의 AI 이미지 생성 기능(Pollinations / Hugging Face·FLUX·SDXL / Gemini)을 위한 내부 Prompt Library입니다. 사용자는 한글 버튼/라벨을 선택하지만, 실제로는 이 문서에 정의된 영어 키워드가 조합되어 프롬프트로 전송되는 구조를 전제로 작성했습니다.

## 사용 목적

- **버튼형 프롬프트 조합 UI**의 데이터 소스: 스타일/재질/조명/색감/구도/배경/품질/오브젝트 버튼을 사용자가 조합하면, 내부적으로 각 항목의 "영어 키워드"가 이어붙여져 최종 프롬프트 문자열이 만들어집니다.
- 이후 이 문서는 그대로 **JSON 데이터베이스로 변환**되어 앱 코드(`src/utils/ai.ts`, `src/components/Sidebar/AIPanel.tsx` 등)에서 소비될 예정입니다.

## 문서 구조

| Part | 내용 | 항목 수 |
|---|---|---|
| 01 | 프롬프트 기초 개념 | - |
| 02 | 스타일 (3D / Design / Illustration / Trend) | 35 |
| 03 | 재질 (Plastic / Jelly / Glass / Metal / Clay / Rubber / Balloon / Ceramic / Fabric / Natural) | 39 |
| 04 | 조명 | 15 |
| 05 | 렌더 | 11 |
| 06 | 색감 | 15 |
| 07 | 구도 | 14 |
| 08 | 배경 | 9 |
| 09 | 품질 키워드 | 13 |
| 10 | 오브젝트 라이브러리 (Shopping / Office / Decoration / Nature / Food / UI / Travel / Weather / Celebration) | 100 |
| 11 | 스타일 프리셋 (완성형 조합) | 23 |
| 12 | 프롬프트 레시피 (조합 공식) | 5 |
| 13 | 한글 → 영어 빠른 조회 인덱스 | 251 |
| 14 | 네거티브 프롬프트 사전 | 18 |
| 15 | 프롬프트 템플릿 (마케팅 시나리오별) | 14 |

## JSON 변환 가이드

Part 2~11의 모든 항목은 아래 필드를 고정 구조로 사용합니다. 그대로 JSON 키로 매핑하면 됩니다.

```json
{
  "id": "gift-box",
  "category": "object",
  "subcategory": "shopping",
  "ko": "선물 상자",
  "en": "gift box",
  "description": "이벤트, 시즌 프로모션, 사은품 증정 배너에서 가장 널리 쓰이는 대표적인 축하 오브젝트다.",
  "recommendedKeywords": ["wrapped in ribbon", "bow on top", "glossy wrapping paper", "layered lid", "sparkle accents"],
  "pairsWellWith": ["pastel pink background", "confetti scatter", "floating composition", "warm color palette"],
  "avoidKeywords": ["torn wrapping paper", "dark horror tone", "messy background"],
  "recommendedMaterial": ["glossy wrapping paper", "satin ribbon", "matte cardboard"],
  "recommendedLighting": ["soft studio lighting", "warm rim light"],
  "recommendedStyle": ["3D icon", "cute chibi style", "isometric"],
  "examplePrompt": "3D icon of a gift box wrapped in glossy pink wrapping paper with a satin bow on top, sparkle accents around it, soft studio lighting with warm rim light, floating on pastel gradient background, cute rounded style, high quality, 4k",
  "exampleNote": "리본 매듭이 달린 반짝이는 핑크색 선물상자가 파스텔 배경 위에서 은은한 광택을 내는 귀여운 3D 아이콘이 생성된다."
}
```

- `recommendedMaterial` / `recommendedLighting` / `recommendedStyle`은 Part 10 (오브젝트) 항목에만 존재합니다. 나머지 카테고리는 `recommendedKeywords` / `pairsWellWith` / `avoidKeywords` / `examplePrompt` / `exampleNote` 5개 필드만 사용합니다.
- Part 14(네거티브)는 `avoidScenario`(주로 함께 쓰는 상황), `exampleNegativePrompt` 필드를 사용합니다.
- Part 11(스타일 프리셋)은 `composedKeywords`(구성 키워드 문자열), `pairsWellWithObjects` 필드를 사용합니다.

---

## PART 01. Prompt Basics

Pollinations(FLUX 기반)와 Hugging Face 서빙 FLUX/SDXL 계열 모델은 자연어 문장보다 **쉼표로 구분된 키워드 나열**에 더 안정적으로 반응합니다. 아래 원칙은 이 문서의 모든 항목을 조합할 때 공통으로 적용됩니다.

### Prompt Structure (프롬프트 구조)
가장 안정적으로 작동하는 순서는 **오브젝트 → 재질 → 스타일 → 조명/렌더 → 색감 → 구도 → 배경 → 품질** 입니다. 오브젝트를 가장 먼저 명시해야 모델이 주제를 놓치지 않습니다.

### Prompt Order (키워드 순서)
앞쪽에 배치된 키워드일수록 가중치가 높게 반영되는 경향이 있습니다. 꼭 반영되어야 하는 특징(오브젝트, 핵심 재질)은 앞에, 부가적인 무드 키워드는 뒤로 보냅니다.

### Positive Prompt (포지티브 프롬프트)
"만들고 싶은 것"을 나열하는 본문 프롬프트입니다. 이 문서의 스타일/재질/조명/색감/구도/배경/품질/오브젝트 키워드가 모두 포지티브 프롬프트에 해당합니다.

### Negative Prompt (네거티브 프롬프트)
"피하고 싶은 결함"을 나열하는 보조 프롬프트입니다. Pollinations의 무료 텍스트-투-이미지 엔드포인트는 별도 negative 파라미터를 지원하지 않으므로, 필요 시 Part 14의 키워드를 본문 뒤에 `avoid: ...` 형태 대신 결과 재생성 판단 기준으로 활용하거나, negative 파라미터를 지원하는 프로바이더(HF Inference API의 일부 모델)에서만 별도 필드로 전달하세요.

### Prompt Weight (키워드 가중치)
FLUX/SDXL 계열은 `(keyword:1.3)` 같은 Automatic1111식 가중치 문법을 공식 지원하지 않는 경우가 많습니다. 대신 **키워드를 앞쪽에 배치**하거나 **동의어를 2회 반복**하는 방식으로 강조하는 것이 더 안정적입니다.

### Style Mixing (스타일 혼합)
스타일 키워드는 1~2개만 조합하는 것을 권장합니다. 서로 다른 스타일(예: `photorealistic` + `cartoon style`)을 동시에 넣으면 결과가 불안정해집니다. Part 02의 "피해야 할 키워드"를 참고해 상충하는 조합을 피하세요.

### Composition (구도 기본 원칙)
구도 키워드(Part 07)는 배경/조명보다 뒤, 품질 키워드보다 앞에 배치합니다. 아이콘/에셋 목적이라면 `centered composition`, `isolated object`를 기본값으로 두는 것이 안전합니다.

### Commercial Asset Tips (상업용 에셋 제작 팁)
- 아이콘/스티커 용도는 항상 `no text, no watermark, clean edge`를 포함하세요.
- 배경을 나중에 합성할 계획이라면 `transparent background` 또는 `isolated on white background`를 명시해 배경 제거가 쉽도록 유도하세요 (Design Studio는 AI 이미지 생성 후 자동 배경 제거 기능을 제공합니다).
- 동일한 시드/프롬프트라도 모델마다 결과가 크게 다르므로, Part 11의 스타일 프리셋을 기본 출발점으로 삼고 오브젝트만 교체하는 방식이 가장 일관된 톤을 유지합니다.

---

## PART 02. Style

### 3D

#### 3D 아이콘 (3D Icon)
- **영어 키워드**: `3d icon`
- **설명**: 앱/웹 UI에서 쓰이는 작고 귀여운 3D 아이콘 스타일로, 버튼, 앱 아이콘, 온보딩 일러스트에 잘 어울린다.
- **추천 키워드**: 3d icon set, glossy 3d icon, app icon style, cute 3d icon, mobile app icon
- **함께 쓰면 좋은 키워드**: soft studio lighting, pastel color palette, glossy plastic material, rounded edges, clay texture
- **피해야 할 키워드**: photorealistic, gritty texture, dark moody lighting, hyper detailed
- **예시 프롬프트**: `3d icon of a rocket ship, glossy plastic material, soft studio lighting, pastel color palette, rounded edges, white background, octane render, high quality`
- **생성 예시 설명**: 파스텔톤의 매끈한 플라스틱 재질 로켓 아이콘이 흰 배경 위에 부드러운 조명을 받으며 렌더링된 이미지가 생성됩니다.

#### 3D 일러스트 (3D Illustration)
- **영어 키워드**: `3d illustration`
- **설명**: 스토리텔링이 있는 장면형 3D 일러스트로, 랜딩페이지 히어로 이미지나 온보딩 스토리 연출에 적합하다.
- **추천 키워드**: 3d render illustration, stylized 3d scene, 3d cartoon render, blender style illustration
- **함께 쓰면 좋은 키워드**: soft global illumination, cinematic lighting, vibrant color palette, depth of field
- **피해야 할 키워드**: photorealistic skin texture, flat 2d, harsh noise, grainy film
- **예시 프롬프트**: `3d illustration of a person working at a desk with a laptop, stylized 3d scene, soft global illumination, vibrant color palette, cinematic lighting, octane render`
- **생성 예시 설명**: 밝고 생동감 있는 색감의 스타일화된 3D 캐릭터가 책상에서 노트북으로 작업하는 장면이 생성됩니다.

#### 3D 제품 렌더 (3D Product Render)
- **영어 키워드**: `3d product render`
- **설명**: 실제 제품처럼 보이는 정밀한 3D 렌더링 스타일로, 이커머스 상세페이지나 광고용 목업 제작에 적합하다.
- **추천 키워드**: product visualization, cgi render, studio product render, hyperrealistic 3d render
- **함께 쓰면 좋은 키워드**: studio lighting, softbox lighting, reflective surface, seamless background, ray tracing
- **피해야 할 키워드**: cartoonish, low poly, hand drawn, flat illustration
- **예시 프롬프트**: `3d product render of a minimalist perfume bottle, studio lighting, reflective glass material, seamless white background, ray tracing, hyperrealistic, 8k`
- **생성 예시 설명**: 스튜디오 조명 아래 유리 재질의 향수병이 반사광과 함께 사실적으로 렌더링된 제품 이미지가 생성됩니다.

#### 커머셜 일러스트 (Commercial Illustration)
- **영어 키워드**: `commercial illustration`
- **설명**: 광고, 브로슈어, 마케팅 자료에 쓰이는 세련되고 상업적인 톤의 일러스트 스타일이다.
- **추천 키워드**: advertising illustration, marketing illustration, editorial illustration, brand illustration
- **함께 쓰면 좋은 키워드**: bold color palette, clean composition, professional lighting, vector-style shading
- **피해야 할 키워드**: gritty texture, sketchy lines, dark horror tone, low detail
- **예시 프롬프트**: `commercial illustration of a family enjoying breakfast, bold color palette, clean composition, professional lighting, vector-style shading, high quality`
- **생성 예시 설명**: 밝고 선명한 색감으로 정돈된 구도의 가족 아침식사 장면이 광고에 어울리는 일러스트로 생성됩니다.

#### 제품 사진 (Product Photography)
- **영어 키워드**: `product photography`
- **설명**: 실제 카메라로 촬영한 듯한 사실적인 제품 사진 스타일로, 쇼핑몰 썸네일이나 카탈로그 이미지에 적합하다.
- **추천 키워드**: studio product shot, commercial product photo, e-commerce photography, macro product shot
- **함께 쓰면 좋은 키워드**: softbox lighting, shallow depth of field, seamless backdrop, natural shadow
- **피해야 할 키워드**: illustration, cartoon, painterly, low poly
- **예시 프롬프트**: `product photography of a ceramic coffee mug, softbox lighting, shallow depth of field, seamless white backdrop, natural shadow, high resolution`
- **생성 예시 설명**: 부드러운 조명과 얕은 심도로 촬영된 세라믹 머그컵의 실사 제품 사진이 생성됩니다.

#### UI 에셋 (UI Asset)
- **영어 키워드**: `ui asset`
- **설명**: 앱/웹 인터페이스에 바로 삽입 가능한 아이콘, 배지, 일러스트 등 UI 구성 요소 스타일이다.
- **추천 키워드**: app ui element, interface icon, ui illustration asset, flat ui graphic
- **함께 쓰면 좋은 키워드**: flat lighting, solid color background, vector shading, minimal shadow
- **피해야 할 키워드**: complex background, photorealistic, heavy texture, cluttered composition
- **예시 프롬프트**: `ui asset of a notification bell icon, flat lighting, solid pastel background, vector shading, minimal shadow, clean edges`
- **생성 예시 설명**: 단색 배경 위에 그림자가 거의 없는 깔끔한 벡터 스타일의 알림 벨 아이콘이 생성됩니다.

#### 플로팅 오브젝트 (Floating Object)
- **영어 키워드**: `floating object`
- **설명**: 중력을 벗어나 공중에 떠 있는 듯한 연출로 제품이나 오브젝트를 강조하는 스타일로, 히어로 배너에 적합하다.
- **추천 키워드**: levitating object, floating composition, zero gravity object, suspended object render
- **함께 쓰면 좋은 키워드**: soft shadow below, studio lighting, gradient background, dynamic angle
- **피해야 할 키워드**: grounded composition, cluttered background, harsh direct flash, busy texture
- **예시 프롬프트**: `floating object of a sneaker levitating in mid air, soft shadow below, studio lighting, gradient background, dynamic angle, 3d render`
- **생성 예시 설명**: 그라데이션 배경 위에 부드러운 그림자와 함께 공중에 떠 있는 운동화가 강조되어 보이는 이미지가 생성됩니다.

### Design

#### 미니멀 (Minimal)
- **영어 키워드**: `minimalist design`
- **설명**: 불필요한 요소를 제거하고 여백과 단순한 형태를 강조하는 스타일로, 브랜드 로고나 심플한 아이콘에 적합하다.
- **추천 키워드**: minimal style, simple design, negative space, clean minimalism, reductive design
- **함께 쓰면 좋은 키워드**: solid color background, generous negative space, thin line, monochrome palette
- **피해야 할 키워드**: cluttered composition, ornate detail, busy texture, maximalist pattern
- **예시 프롬프트**: `minimalist design of a coffee cup icon, solid color background, generous negative space, thin line art, monochrome palette, clean`
- **생성 예시 설명**: 단색 배경 위에 얇은 선으로 표현된 여백이 넉넉한 미니멀한 커피컵 아이콘이 생성됩니다.

#### 프리미엄 (Premium)
- **영어 키워드**: `premium design`
- **설명**: 고급스럽고 신뢰감 있는 느낌을 주는 세련된 스타일로, 프리미엄 브랜드나 하이엔드 제품 이미지에 적합하다.
- **추천 키워드**: high-end design, upscale style, sophisticated design, refined aesthetic
- **함께 쓰면 좋은 키워드**: matte finish, subtle gradient, soft studio lighting, muted color palette
- **피해야 할 키워드**: cheap plastic look, garish color, cartoonish, cluttered layout
- **예시 프롬프트**: `premium design of a wireless earbuds case, matte finish, subtle gradient, soft studio lighting, muted color palette, high quality render`
- **생성 예시 설명**: 무광 마감과 은은한 그라데이션으로 고급스러운 분위기의 무선 이어버드 케이스가 생성됩니다.

#### 럭셔리 (Luxury)
- **영어 키워드**: `luxury style`
- **설명**: 값비싸고 화려한 소재와 디테일을 강조하는 스타일로, 명품, 주얼리, 고급 패키징 이미지에 적합하다.
- **추천 키워드**: opulent style, high-end luxury, elegant luxury design, gold accent luxury
- **함께 쓰면 좋은 키워드**: gold accents, marble texture, dramatic lighting, deep jewel tones, velvet material
- **피해야 할 키워드**: cheap material, flat lighting, plastic texture, playful cartoon style
- **예시 프롬프트**: `luxury style of a perfume bottle, gold accents, marble texture background, dramatic lighting, deep jewel tone, high quality render`
- **생성 예시 설명**: 금색 디테일과 대리석 배경, 극적인 조명이 어우러진 화려한 향수병 이미지가 생성됩니다.

#### 큐트 (Cute)
- **영어 키워드**: `cute style`
- **설명**: 둥글고 귀엽고 사랑스러운 느낌을 주는 스타일로, 캐릭터 굿즈나 아이용 콘텐츠에 적합하다.
- **추천 키워드**: adorable style, charming design, chibi style, playful cute design
- **함께 쓰면 좋은 키워드**: pastel color palette, rounded shapes, soft lighting, big eyes character
- **피해야 할 키워드**: sharp edges, dark tone, realistic gore, harsh shadow
- **예시 프롬프트**: `cute style illustration of a baby panda character, pastel color palette, rounded shapes, soft lighting, big sparkly eyes, simple background`
- **생성 예시 설명**: 파스텔톤과 둥근 형태로 표현된 큰 눈망울의 귀여운 판다 캐릭터 일러스트가 생성됩니다.

#### 카와이 (Kawaii)
- **영어 키워드**: `kawaii style`
- **설명**: 일본식 귀여움 미학으로 동글동글한 형태와 파스텔 색감이 특징인 스타일이며, 스티커나 캐릭터 굿즈에 적합하다.
- **추천 키워드**: japanese cute style, chibi kawaii, kawaii aesthetic, pastel kawaii character
- **함께 쓰면 좋은 키워드**: pastel color palette, soft blush cheeks, rounded chibi proportions, sparkle accent
- **피해야 할 키워드**: realistic proportions, dark gothic tone, sharp aggressive lines, muted grayscale
- **예시 프롬프트**: `kawaii style illustration of a smiling cat character, pastel color palette, soft blush cheeks, chibi proportions, sparkle accents, white background`
- **생성 예시 설명**: 발그레한 볼과 파스텔 색감으로 표현된 짧고 통통한 비율의 웃는 고양이 캐릭터가 생성됩니다.

#### 모던 (Modern)
- **영어 키워드**: `modern design`
- **설명**: 현재 트렌드를 반영한 세련되고 동시대적인 스타일로, 스타트업 브랜딩이나 앱 UI에 적합하다.
- **추천 키워드**: contemporary style, sleek modern design, current trend design, modern aesthetic
- **함께 쓰면 좋은 키워드**: geometric shapes, bold contrast, gradient background, clean lines
- **피해야 할 키워드**: vintage texture, ornate baroque detail, dated color palette, cluttered layout
- **예시 프롬프트**: `modern design of a smartphone app icon, geometric shapes, gradient background, clean lines, bold contrast, vector style`
- **생성 예시 설명**: 기하학적 형태와 그라데이션이 어우러진 깔끔하고 현대적인 스마트폰 앱 아이콘이 생성됩니다.

#### 클린 (Clean)
- **영어 키워드**: `clean design`
- **설명**: 군더더기 없이 정돈되고 명료한 스타일로, 인포그래픽이나 기업용 자료에 적합하다.
- **추천 키워드**: tidy design, crisp design, uncluttered layout, polished clean style
- **함께 쓰면 좋은 키워드**: white background, even lighting, simple geometric shapes, ample whitespace
- **피해야 할 키워드**: noisy texture, grunge overlay, chaotic composition, heavy shadow
- **예시 프롬프트**: `clean design of a chart icon, white background, even lighting, simple geometric shapes, ample whitespace, vector illustration`
- **생성 예시 설명**: 흰 배경과 균일한 조명으로 군더더기 없이 정돈된 차트 아이콘이 생성됩니다.

#### 엘레강스 (Elegant)
- **영어 키워드**: `elegant style`
- **설명**: 우아하고 세련된 곡선과 절제된 디테일이 특징인 스타일로, 뷰티나 패션 브랜드 이미지에 적합하다.
- **추천 키워드**: graceful design, refined elegance, sophisticated elegant style, chic design
- **함께 쓰면 좋은 키워드**: soft lighting, flowing curves, muted pastel palette, delicate line work
- **피해야 할 키워드**: bold garish color, chunky shapes, cartoonish proportions, harsh contrast
- **예시 프롬프트**: `elegant style illustration of a perfume bottle with flowing ribbon, soft lighting, delicate line work, muted pastel palette, refined composition`
- **생성 예시 설명**: 흐르는 리본 장식과 부드러운 조명으로 우아하게 표현된 향수병 일러스트가 생성됩니다.

#### 프로페셔널 (Professional)
- **영어 키워드**: `professional design`
- **설명**: 신뢰감 있고 격식 있는 비즈니스 톤의 스타일로, 기업 프레젠테이션이나 B2B 자료에 적합하다.
- **추천 키워드**: corporate style, business-appropriate design, formal professional look, polished corporate design
- **함께 쓰면 좋은 키워드**: neutral color palette, structured composition, soft even lighting, sharp clean lines
- **피해야 할 키워드**: playful cartoon, neon color, chaotic layout, childish illustration
- **예시 프롬프트**: `professional design of a briefcase icon, neutral color palette, structured composition, soft even lighting, sharp clean lines, vector style`
- **생성 예시 설명**: 중립적인 색감과 정돈된 구도로 신뢰감을 주는 서류가방 아이콘이 생성됩니다.

### Illustration

#### 카툰 (Cartoon)
- **영어 키워드**: `cartoon style`
- **설명**: 과장된 형태와 선명한 윤곽선이 특징인 만화풍 스타일로, 캐릭터나 아동 콘텐츠에 적합하다.
- **추천 키워드**: cartoonish illustration, animated cartoon style, comic character style, toon shading
- **함께 쓰면 좋은 키워드**: bold outline, flat cel shading, bright saturated colors, exaggerated expression
- **피해야 할 키워드**: photorealistic texture, muted desaturated tone, hyper detailed rendering, soft blur
- **예시 프롬프트**: `cartoon style illustration of a happy dog character, bold outline, flat cel shading, bright saturated colors, exaggerated expression, simple background`
- **생성 예시 설명**: 굵은 윤곽선과 밝은 색감으로 표현된 신난 표정의 강아지 캐릭터 만화 일러스트가 생성됩니다.

#### 픽사 스타일 (Pixar Style)
- **영어 키워드**: `pixar style`
- **설명**: 픽사 애니메이션 특유의 부드러운 3D 렌더링과 따뜻한 표정 연출이 특징인 스타일로, 스토리텔링 캐릭터에 적합하다.
- **추천 키워드**: pixar-inspired 3d, animated movie style, disney pixar render, cinematic 3d character
- **함께 쓰면 좋은 키워드**: soft subsurface scattering, warm cinematic lighting, expressive eyes, rounded character design
- **피해야 할 키워드**: flat 2d illustration, harsh lighting, gritty realistic texture, low poly
- **예시 프롬프트**: `pixar style 3d character of a young explorer, soft subsurface scattering, warm cinematic lighting, expressive eyes, rounded character design, octane render`
- **생성 예시 설명**: 따뜻한 조명과 부드러운 피부 표현으로 픽사 애니메이션 캐릭터 같은 어린 탐험가가 생성됩니다.

#### 클레이 스타일 (Clay Style)
- **영어 키워드**: `clay style`
- **설명**: 점토로 빚은 듯한 부드럽고 매트한 질감의 스타일로, 귀엽고 촉감이 느껴지는 아이콘에 적합하다.
- **추천 키워드**: claymation style, plasticine texture, clay render, stop motion clay look
- **함께 쓰면 좋은 키워드**: matte clay texture, soft studio lighting, pastel color palette, subtle fingerprint texture
- **피해야 할 키워드**: glossy reflective material, sharp hard edges, photorealistic skin, metallic finish
- **예시 프롬프트**: `clay style icon of a smiling sun character, matte clay texture, soft studio lighting, pastel color palette, subtle fingerprint texture, white background`
- **생성 예시 설명**: 매트한 점토 질감과 은은한 지문 텍스처가 느껴지는 파스텔톤 웃는 태양 캐릭터 아이콘이 생성됩니다.

#### 글래스 스타일 (Glass Style)
- **영어 키워드**: `glass style`
- **설명**: 투명하거나 반투명한 유리 재질로 표현된 스타일로, 세련되고 미래지향적인 UI 아이콘에 적합하다.
- **추천 키워드**: glassmorphism, translucent glass render, frosted glass style, crystal clear material
- **함께 쓰면 좋은 키워드**: refractive glass material, soft rim lighting, blurred background, subtle caustics
- **피해야 할 키워드**: matte opaque material, rough texture, dark heavy shadow, wood grain texture
- **예시 프롬프트**: `glass style icon of a heart shape, refractive glass material, soft rim lighting, blurred pastel background, subtle caustics, 3d render`
- **생성 예시 설명**: 투명한 유리 재질에 은은한 림 라이팅과 굴절 효과가 더해진 하트 모양 아이콘이 생성됩니다.

#### 페이퍼 컷 (Paper Cut)
- **영어 키워드**: `paper cut style`
- **설명**: 종이를 겹겹이 오려 붙인 듯한 레이어드 스타일로, 동화 같은 일러스트나 그림자 연출에 적합하다.
- **추천 키워드**: layered paper craft, papercraft illustration, cut paper art, paper diorama style
- **함께 쓰면 좋은 키워드**: layered depth shadow, soft directional lighting, textured paper grain, pastel palette
- **피해야 할 키워드**: photorealistic texture, smooth gradient shading, glossy material, flat single layer
- **예시 프롬프트**: `paper cut style illustration of a forest scene, layered paper craft, soft directional lighting, textured paper grain, pastel palette, layered depth shadow`
- **생성 예시 설명**: 여러 겹의 종이 레이어가 그림자를 드리우며 입체감을 주는 파스텔톤 숲 장면 종이공예 일러스트가 생성됩니다.

#### 로우 폴리 (Low Poly)
- **영어 키워드**: `low poly style`
- **설명**: 각진 다각형으로 단순화된 기하학적 3D 스타일로, 게임 에셋이나 모던 아이콘에 적합하다.
- **추천 키워드**: polygonal art, faceted 3d style, geometric low poly render, flat shaded polygon art
- **함께 쓰면 좋은 키워드**: faceted geometric shapes, flat shading, vibrant gradient palette, angular silhouette
- **피해야 할 키워드**: smooth organic curves, photorealistic texture, high poly detail, soft blur
- **예시 프롬프트**: `low poly style illustration of a mountain landscape, faceted geometric shapes, flat shading, vibrant gradient palette, angular silhouette, 3d render`
- **생성 예시 설명**: 각진 다각형 면들로 단순화된 산악 풍경이 선명한 그라데이션 색감과 함께 생성됩니다.

#### 플랫 일러스트 (Flat Illustration)
- **영어 키워드**: `flat illustration`
- **설명**: 그림자나 입체감 없이 단순한 색면으로 구성된 벡터 스타일로, 웹사이트 히어로 이미지에 적합하다.
- **추천 키워드**: flat design illustration, vector flat art, flat 2d style, minimal flat graphic
- **함께 쓰면 좋은 키워드**: solid color blocks, geometric composition, limited color palette, no gradient shading
- **피해야 할 키워드**: photorealistic rendering, 3d depth, heavy texture, dramatic shadow
- **예시 프롬프트**: `flat illustration of a person reading a book, solid color blocks, geometric composition, limited color palette, no gradient shading, vector style`
- **생성 예시 설명**: 그림자 없이 단색 면으로만 구성된 책 읽는 사람의 벡터 스타일 플랫 일러스트가 생성됩니다.

#### 아이소메트릭 (Isometric)
- **영어 키워드**: `isometric illustration`
- **설명**: 등각 투영법으로 표현되어 입체감과 정돈된 각도를 동시에 주는 스타일로, 인포그래픽이나 앱 소개 이미지에 적합하다.
- **추천 키워드**: isometric art, isometric 3d illustration, axonometric style, isometric infographic style
- **함께 쓰면 좋은 키워드**: 30-degree angle projection, flat vector shading, vibrant color palette, geometric precision
- **피해야 할 키워드**: perspective distortion, photorealistic camera angle, organic freeform shape, harsh realistic shadow
- **예시 프롬프트**: `isometric illustration of a modern office desk setup, 30-degree angle projection, flat vector shading, vibrant color palette, geometric precision, clean background`
- **생성 예시 설명**: 30도 등각 투영으로 정돈된 각도의 벡터 스타일 사무실 데스크 셋업 일러스트가 생성됩니다.

#### 핸드 드로잉 (Hand Drawn)
- **영어 키워드**: `hand drawn style`
- **설명**: 손으로 직접 그린 듯한 자연스러운 선과 질감이 느껴지는 스타일로, 다이어리나 감성적인 콘텐츠에 적합하다.
- **추천 키워드**: sketchy illustration, hand drawn line art, doodle style, organic freehand drawing
- **함께 쓰면 좋은 키워드**: rough pencil texture, imperfect line weight, warm paper background, subtle cross hatching
- **피해야 할 키워드**: perfectly smooth vector line, digital glossy finish, symmetrical precision, 3d render
- **예시 프롬프트**: `hand drawn style illustration of a potted plant, rough pencil texture, imperfect line weight, warm paper background, subtle cross hatching`
- **생성 예시 설명**: 손으로 스케치한 듯한 불규칙한 선과 종이 질감이 느껴지는 화분 일러스트가 생성됩니다.

#### 수채화 (Watercolor)
- **영어 키워드**: `watercolor style`
- **설명**: 물감이 번지고 스며든 듯한 부드럽고 투명한 수채화 질감의 스타일로, 감성적이고 따뜻한 콘텐츠에 적합하다.
- **추천 키워드**: watercolor painting, aquarelle style, soft watercolor wash, painterly watercolor texture
- **함께 쓰면 좋은 키워드**: soft color bleed, paper texture background, translucent layered wash, muted pastel tone
- **피해야 할 키워드**: sharp vector line, flat solid color, glossy digital finish, hard edge shading
- **예시 프롬프트**: `watercolor style illustration of a bouquet of flowers, soft color bleed, paper texture background, translucent layered wash, muted pastel tone`
- **생성 예시 설명**: 색이 자연스럽게 번지고 종이 질감이 느껴지는 투명한 수채화풍 꽃다발 일러스트가 생성됩니다.

#### 연필 스케치 (Pencil Sketch)
- **영어 키워드**: `pencil sketch style`
- **설명**: 연필로 그린 듯한 흑백 또는 단색 톤의 스케치 스타일로, 컨셉 아트나 감성적 초안 이미지에 적합하다.
- **추천 키워드**: graphite sketch, pencil drawing style, monochrome sketch art, charcoal sketch style
- **함께 쓰면 좋은 키워드**: soft graphite shading, cross hatching texture, paper grain background, subtle smudge shadow
- **피해야 할 키워드**: vibrant color palette, glossy digital finish, flat vector color, 3d render
- **예시 프롬프트**: `pencil sketch style illustration of a city skyline, soft graphite shading, cross hatching texture, paper grain background, monochrome tone`
- **생성 예시 설명**: 연필로 명암을 표현한 듯한 흑백 톤의 도시 스카이라인 스케치가 생성됩니다.

#### 유화 (Oil Painting)
- **영어 키워드**: `oil painting style`
- **설명**: 유화 특유의 두꺼운 붓터치와 질감이 느껴지는 클래식한 회화 스타일로, 고급스럽고 예술적인 콘텐츠에 적합하다.
- **추천 키워드**: classical oil painting, impasto brushwork, painterly oil texture, fine art painting style
- **함께 쓰면 좋은 키워드**: visible brushstroke texture, rich warm color palette, canvas texture background, dramatic chiaroscuro lighting
- **피해야 할 키워드**: flat vector shading, smooth digital gradient, sharp clean vector line, minimal flat color
- **예시 프롬프트**: `oil painting style of a still life with fruit, visible brushstroke texture, rich warm color palette, canvas texture background, dramatic chiaroscuro lighting`
- **생성 예시 설명**: 두꺼운 붓터치와 따뜻한 색감이 캔버스 질감 위에 표현된 클래식한 정물화 스타일 이미지가 생성됩니다.

### Trend

#### Y2K (Y2K)
- **영어 키워드**: `y2k style`
- **설명**: 2000년대 초반의 미래지향적이고 반짝이는 메탈릭 감성을 재현한 트렌디한 스타일로, Z세대 감성 콘텐츠에 적합하다.
- **추천 키워드**: y2k aesthetic, 2000s retro futurism, cyber y2k style, chrome y2k design
- **함께 쓰면 좋은 키워드**: chrome metallic texture, holographic gradient, glossy bubble shapes, iridescent color palette
- **피해야 할 키워드**: matte muted tone, vintage sepia texture, rustic wood material, hand drawn sketch
- **예시 프롬프트**: `y2k style illustration of a futuristic mp3 player, chrome metallic texture, holographic gradient, glossy bubble shapes, iridescent color palette`
- **생성 예시 설명**: 크롬 메탈릭 질감과 홀로그램 그라데이션이 반짝이는 Y2K 감성의 미래형 MP3 플레이어 이미지가 생성됩니다.

#### 레트로 (Retro)
- **영어 키워드**: `retro style`
- **설명**: 과거 특정 시대(70~90년대)의 색감과 그래픽 감성을 재현한 복고풍 스타일로, 빈티지 브랜딩에 적합하다.
- **추천 키워드**: vintage style, old school retro design, nostalgic retro graphic, 80s retro aesthetic
- **함께 쓰면 좋은 키워드**: warm faded color palette, grainy film texture, muted sunset gradient, bold flat shapes
- **피해야 할 키워드**: futuristic neon glow, glossy modern material, ultra clean minimal look, high tech texture
- **예시 프롬프트**: `retro style illustration of a road trip van, warm faded color palette, grainy film texture, muted sunset gradient, bold flat shapes`
- **생성 예시 설명**: 바랜 색감과 필름 그레인 질감이 노을빛 그라데이션과 어우러진 복고풍 여행용 밴 일러스트가 생성됩니다.

#### 사이버펑크 (Cyberpunk)
- **영어 키워드**: `cyberpunk style`
- **설명**: 네온과 하이테크, 어두운 도시 미래상을 표현한 디스토피아적 스타일로, 게임이나 테크 브랜딩에 적합하다.
- **추천 키워드**: neon cyberpunk aesthetic, futuristic dystopia style, tech noir design, blade runner style
- **함께 쓰면 좋은 키워드**: neon glow lighting, dark moody background, rain-slicked reflective surface, holographic accent
- **피해야 할 키워드**: pastel soft palette, bright daylight lighting, cute rounded shapes, rustic natural texture
- **예시 프롬프트**: `cyberpunk style illustration of a futuristic city street, neon glow lighting, dark moody background, rain-slicked reflective surface, holographic accent`
- **생성 예시 설명**: 네온 조명과 젖은 반사 바닥이 어우러진 어둡고 미래적인 사이버펑크 도시 거리 이미지가 생성됩니다.

#### 베이퍼웨이브 (Vaporwave)
- **영어 키워드**: `vaporwave style`
- **설명**: 80~90년대 레트로 컴퓨터 그래픽과 파스텔 네온을 결합한 몽환적인 스타일로, 감성적 아트워크에 적합하다.
- **추천 키워드**: vaporwave aesthetic, retro synthwave style, pastel neon grid design, 90s digital nostalgia style
- **함께 쓰면 좋은 키워드**: pastel neon gradient, grid floor background, glowing sunset, chrome statue element
- **피해야 할 키워드**: muted earthy tone, realistic natural lighting, rustic wood texture, matte flat color
- **예시 프롬프트**: `vaporwave style illustration of a classical statue with sunglasses, pastel neon gradient, grid floor background, glowing sunset, chrome accent`
- **생성 예시 설명**: 파스텔 네온 그라데이션과 격자무늬 바닥, 석양이 어우러진 몽환적인 베이퍼웨이브 스타일 조각상 이미지가 생성됩니다.

#### 멤피스 (Memphis)
- **영어 키워드**: `memphis design style`
- **설명**: 1980년대 멤피스 그룹에서 유래한 기하학적 도형과 대담한 원색이 특징인 스타일로, 포스트모던하고 발랄한 디자인에 적합하다.
- **추천 키워드**: memphis pattern style, postmodern geometric design, 80s memphis aesthetic, bold geometric pop art
- **함께 쓰면 좋은 키워드**: bold primary color palette, squiggle and confetti shapes, geometric pattern background, playful asymmetric composition
- **피해야 할 키워드**: muted monochrome palette, realistic photographic texture, minimalist plain background, somber dark tone
- **예시 프롬프트**: `memphis design style illustration of an abstract shape composition, bold primary color palette, squiggle and confetti shapes, geometric pattern background, playful asymmetric composition`
- **생성 예시 설명**: 원색의 지그재그와 도형들이 자유분방하게 배치된 멤피스 스타일의 추상적인 패턴 이미지가 생성됩니다.

#### 스칸디나비안 (Scandinavian)
- **영어 키워드**: `scandinavian design style`
- **설명**: 북유럽 특유의 단순하고 따뜻하며 자연 친화적인 미니멀 스타일로, 인테리어나 라이프스타일 콘텐츠에 적합하다.
- **추천 키워드**: nordic design style, hygge aesthetic, scandi minimalism, nordic natural design
- **함께 쓰면 좋은 키워드**: muted earthy palette, natural wood texture, soft natural lighting, simple geometric form
- **피해야 할 키워드**: neon bright color, cluttered maximalist pattern, glossy futuristic material, harsh artificial lighting
- **예시 프롬프트**: `scandinavian design style illustration of a cozy living room chair, muted earthy palette, natural wood texture, soft natural lighting, simple geometric form`
- **생성 예시 설명**: 자연 목재 질감과 차분한 색감의 부드러운 조명이 어우러진 북유럽풍 안락의자 일러스트가 생성됩니다.

#### 퓨처리스틱 (Futuristic)
- **영어 키워드**: `futuristic style`
- **설명**: 첨단 기술과 앞으로의 시대를 상상한 하이테크하고 세련된 스타일로, 테크 제품이나 SF 콘셉트 이미지에 적합하다.
- **추천 키워드**: sci-fi futuristic design, high tech aesthetic, next-gen futuristic style, advanced tech design
- **함께 쓰면 좋은 키워드**: sleek metallic surface, glowing light accents, dark ambient background, holographic interface element
- **피해야 할 키워드**: rustic vintage texture, hand drawn sketch line, warm cozy palette, matte cardboard material
- **예시 프롬프트**: `futuristic style illustration of a sleek flying vehicle, sleek metallic surface, glowing light accents, dark ambient background, holographic interface element`
- **생성 예시 설명**: 매끈한 금속 표면과 빛나는 조명 효과가 어우러진 어두운 배경 속 미래형 비행체 이미지가 생성됩니다.

---

## PART 03. Material

### Plastic

#### 글로시 플라스틱 (Glossy Plastic)
- **영어 키워드**: `glossy plastic material`
- **설명**: 표면에 강한 하이라이트가 반사되는 광택 플라스틱 재질로, 장난감, 앱 아이콘, 캔디컬러 3D 오브젝트처럼 발랄하고 팝한 무드에 적합합니다.
- **추천 키워드**: shiny plastic, high gloss plastic, polished plastic, glossy toy material, glossy PVC
- **함께 쓰면 좋은 키워드**: 3D render, studio lighting, vibrant colors, soft shadow, clay render style
- **피해야 할 키워드**: matte finish, rough texture, weathered, rusty
- **예시 프롬프트**: `cute rounded 3D icon of a rocket, glossy plastic material, vibrant colors, studio lighting, soft shadow, white background, high quality render`
- **생성 예시 설명**: 반짝이는 하이라이트가 도드라지는 알록달록한 3D 로켓 아이콘 이미지가 생성됩니다.

#### 매트 플라스틱 (Matte Plastic)
- **영어 키워드**: `matte plastic material`
- **설명**: 반사가 거의 없는 부드러운 무광 플라스틱 재질로, 차분하고 미니멀한 UI 아이콘이나 모던한 제품 목업에 적합합니다.
- **추천 키워드**: matte finish plastic, non-reflective plastic, satin plastic, flat matte surface
- **함께 쓰면 좋은 키워드**: minimal style, soft studio lighting, pastel color palette, clean background
- **피해야 할 키워드**: glossy, mirror finish, high specular highlight, wet look
- **예시 프롬프트**: `minimal 3D icon of a headphone, matte plastic material, pastel color palette, soft studio lighting, clean white background, high quality render`
- **생성 예시 설명**: 은은한 파스텔톤에 반사광이 억제된 차분한 무광 헤드폰 아이콘이 생성됩니다.

#### 소프트터치 플라스틱 (Soft Touch Plastic)
- **영어 키워드**: `soft touch plastic material`
- **설명**: 벨벳처럼 은은한 촉감을 시각적으로 표현하는 고급 러버코팅 플라스틱 느낌으로, 프리미엄 전자기기나 코스메틱 케이스 표현에 적합합니다.
- **추천 키워드**: soft touch coating, rubberized plastic finish, velvety plastic surface, silky matte plastic
- **함께 쓰면 좋은 키워드**: premium product shot, soft diffused lighting, muted color tone, minimalist composition
- **피해야 할 키워드**: high gloss, chrome reflection, hard plastic shine, sharp specular
- **예시 프롬프트**: `premium wireless earbuds case, soft touch plastic material, muted sage green tone, soft diffused lighting, minimalist composition, product photography style`
- **생성 예시 설명**: 은은한 벨벳 질감이 도는 세이지그린 색상의 고급스러운 이어버드 케이스 이미지가 생성됩니다.

#### 프리미엄 플라스틱 (Premium Plastic)
- **영어 키워드**: `premium plastic material`
- **설명**: 정교한 마감과 고급스러운 컬러감을 지닌 플라스틱 표현으로, 애플 스타일 제품군이나 하이엔드 가전제품 렌더링에 적합합니다.
- **추천 키워드**: high-end plastic finish, luxury plastic material, precision molded plastic, refined plastic surface
- **함께 쓰면 좋은 키워드**: studio product photography, clean minimalist background, soft rim light, subtle gradient
- **피해야 할 키워드**: cheap plastic look, rough texture, scratched surface, cracked material
- **예시 프롬프트**: `sleek smart speaker, premium plastic material, subtle gradient from white to gray, soft rim light, clean minimalist background, studio product photography`
- **생성 예시 설명**: 고급스러운 화이트-그레이 그라데이션의 매끈한 스마트 스피커 제품샷이 생성됩니다.

### Jelly

#### 젤리 재질 (Jelly Material)
- **영어 키워드**: `jelly material`
- **설명**: 탱글탱글하고 말랑한 젤리 질감을 표현하는 재질로, 귀엽고 발랄한 3D 캐릭터나 푸드 아이콘에 잘 어울립니다.
- **추천 키워드**: jelly texture, wobbly jelly surface, bouncy jelly material, sweet jelly finish
- **함께 쓰면 좋은 키워드**: pastel colors, playful 3D style, soft studio lighting, glossy highlight
- **피해야 할 키워드**: matte dry surface, rough texture, metallic finish, dusty
- **예시 프롬프트**: `cute 3D bear character, jelly material, pastel pink color, playful pose, soft studio lighting, glossy highlight, white background`
- **생성 예시 설명**: 탱글탱글한 핑크빛 젤리 질감의 귀여운 곰 캐릭터 3D 이미지가 생성됩니다.

#### 반투명 젤리 (Translucent Jelly)
- **영어 키워드**: `translucent jelly material`
- **설명**: 빛이 은은하게 투과되는 반투명 젤리 질감으로, 내부에 기포나 빛 산란이 보이는 감성적인 오브젝트 표현에 적합합니다.
- **추천 키워드**: semi-transparent jelly, light-through jelly texture, subsurface scattering jelly, glassy jelly surface
- **함께 쓰면 좋은 키워드**: backlighting, soft glow, pastel gradient, macro shot style
- **피해야 할 키워드**: fully opaque, matte solid color, metallic surface, dry cracked texture
- **예시 프롬프트**: `translucent jelly cube, translucent jelly material, soft backlighting, pastel gradient colors, subsurface scattering, macro shot style, clean background`
- **생성 예시 설명**: 빛이 은은하게 투과되며 내부가 살짝 비치는 파스텔톤 젤리 큐브 이미지가 생성됩니다.

#### 구미 텍스처 (Gummy Texture)
- **영어 키워드**: `gummy texture`
- **설명**: 젤리곰이나 구미캔디처럼 쫀득하고 반투명한 표면 질감으로, 달콤하고 유쾌한 식품형 아이콘 디자인에 적합합니다.
- **추천 키워드**: gummy candy surface, chewy gummy finish, sticky gummy texture, sugary gummy shine
- **함께 쓰면 좋은 키워드**: vibrant candy colors, soft top light, playful composition, glossy sugar coating
- **피해야 할 키워드**: dry powdery surface, matte stone texture, hard metallic edge, dusty finish
- **예시 프롬프트**: `gummy bear icon set, gummy texture, vibrant candy colors, glossy sugar coating, soft top light, playful composition, white background`
- **생성 예시 설명**: 알록달록한 색상에 쫀득한 광택이 도는 구미베어 아이콘 세트 이미지가 생성됩니다.

#### 겔 재질 (Gel Material)
- **영어 키워드**: `gel material`
- **설명**: 액체와 고체 중간의 부드러운 겔 상태를 표현하는 재질로, 흐르는 듯한 형태나 스킨케어 제품 비주얼에 적합합니다.
- **추천 키워드**: soft gel texture, viscous gel surface, smooth gel finish, gel-like consistency
- **함께 쓰면 좋은 키워드**: soft studio lighting, minimalist product shot, cool color palette, subtle reflection
- **피해야 할 키워드**: dry solid surface, rough matte texture, hard metallic look, cracked material
- **예시 프롬프트**: `abstract flowing blob shape, gel material, cool blue color palette, subtle reflection, soft studio lighting, minimalist product shot, white background`
- **생성 예시 설명**: 부드럽게 흐르는 듯한 형태의 시원한 블루톤 겔 오브젝트 이미지가 생성됩니다.

### Glass

#### 유리 (Glass)
- **영어 키워드**: `glass material`
- **설명**: 투명하고 빛을 반사·굴절시키는 기본 유리 재질로, 깔끔하고 세련된 3D 아이콘이나 제품 오브젝트 표현에 널리 쓰입니다.
- **추천 키워드**: clear glass surface, glassy finish, refractive glass material, polished glass
- **함께 쓰면 좋은 키워드**: studio lighting, soft reflection, clean background, 3D render style
- **피해야 할 키워드**: matte opaque surface, rough texture, cloudy finish, cracked glass
- **예시 프롬프트**: `3D icon of a perfume bottle, glass material, clear refractive surface, soft studio lighting, clean white background, high quality render`
- **생성 예시 설명**: 투명하게 빛을 굴절시키는 유리 향수병 3D 아이콘 이미지가 생성됩니다.

#### 크리스탈 유리 (Crystal Glass)
- **영어 키워드**: `crystal glass material`
- **설명**: 정교하게 커팅된 크리스탈처럼 빛을 다각도로 분산시키는 고급 유리 재질로, 보석이나 트로피 같은 럭셔리 오브젝트에 적합합니다.
- **추천 키워드**: faceted crystal surface, cut crystal glass, prismatic glass material, sparkling crystal finish
- **함께 쓰면 좋은 키워드**: dramatic lighting, light dispersion, luxury product shot, dark background
- **피해야 할 키워드**: plastic look, matte finish, dull surface, cheap material
- **예시 프롬프트**: `luxury crystal glass award trophy, crystal glass material, faceted surface, dramatic lighting, light dispersion, dark background, high quality render`
- **생성 예시 설명**: 다각도로 빛이 분산되며 반짝이는 크리스탈 트로피 이미지가 생성됩니다.

#### 서리 유리 (Frosted Glass)
- **영어 키워드**: `frosted glass material`
- **설명**: 표면이 은은하게 뿌옇게 처리되어 빛을 부드럽게 확산시키는 유리 재질로, 차분하고 은은한 조명 오브젝트나 코스메틱 병 표현에 적합합니다.
- **추천 키워드**: matte frosted surface, sandblasted glass, translucent frosted finish, diffused frosted glass
- **함께 쓰면 좋은 키워드**: soft ambient light, minimalist composition, muted color palette, subtle glow
- **피해야 할 키워드**: clear transparent glass, high gloss reflection, sharp specular highlight, mirror finish
- **예시 프롬프트**: `frosted glass skincare bottle, frosted glass material, soft ambient light, muted beige color palette, minimalist composition, subtle glow, white background`
- **생성 예시 설명**: 은은하게 빛이 확산되는 뿌연 질감의 베이지톤 스킨케어 병 이미지가 생성됩니다.

#### 투명 유리 (Transparent Glass)
- **영어 키워드**: `transparent glass material`
- **설명**: 완전히 맑고 투명하여 내부와 배경이 그대로 비치는 유리 재질로, 깨끗하고 미니멀한 용기나 오브젝트 표현에 적합합니다.
- **추천 키워드**: fully clear glass, see-through glass surface, crystal clear transparency, pristine glass finish
- **함께 쓰면 좋은 키워드**: clean studio lighting, soft shadow, minimal background, high clarity render
- **피해야 할 키워드**: frosted texture, opaque surface, colored tint, cloudy finish
- **예시 프롬프트**: `transparent glass water bottle, transparent glass material, crystal clear transparency, clean studio lighting, soft shadow, minimal white background, high quality render`
- **생성 예시 설명**: 안이 훤히 비치는 맑고 투명한 유리 물병 이미지가 생성됩니다.

### Metal

#### 골드 (Gold)
- **영어 키워드**: `gold metal material`
- **설명**: 따뜻한 황금빛 광택을 지닌 금속 재질로, 럭셔리하고 프리미엄한 무드의 오브젝트나 장식품 표현에 적합합니다.
- **추천 키워드**: polished gold surface, shiny gold metal, gold foil finish, luxurious gold texture
- **함께 쓰면 좋은 키워드**: warm dramatic lighting, luxury product shot, dark background, elegant composition
- **피해야 할 키워드**: rusty finish, matte gray tone, plastic look, cheap material
- **예시 프롬프트**: `elegant 3D icon of a crown, gold metal material, polished surface, warm dramatic lighting, dark background, luxury product shot`
- **생성 예시 설명**: 따뜻한 조명 아래 반짝이는 황금빛 왕관 3D 아이콘 이미지가 생성됩니다.

#### 실버 (Silver)
- **영어 키워드**: `silver metal material`
- **설명**: 은백색의 차갑고 세련된 광택을 지닌 금속 재질로, 모던하고 미니멀한 테크 제품이나 액세서리 표현에 적합합니다.
- **추천 키워드**: polished silver surface, brushed silver finish, shiny silver metal, sleek silver texture
- **함께 쓰면 좋은 키워드**: cool studio lighting, minimalist background, clean composition, subtle reflection
- **피해야 할 키워드**: rusty texture, warm gold tone, matte plastic look, tarnished finish
- **예시 프롬프트**: `sleek 3D icon of a modern watch, silver metal material, polished surface, cool studio lighting, minimalist white background, clean composition`
- **생성 예시 설명**: 차갑고 매끈한 은빛 광택의 모던한 시계 3D 아이콘 이미지가 생성됩니다.

#### 크롬 (Chrome)
- **영어 키워드**: `chrome metal material`
- **설명**: 거울처럼 주변을 강하게 반사하는 초광택 금속 재질로, 미래적이고 강렬한 임팩트의 오브젝트 표현에 적합합니다.
- **추천 키워드**: mirror chrome finish, reflective chrome surface, high polished chrome, liquid chrome look
- **함께 쓰면 좋은 키워드**: studio environment reflection, dramatic lighting, futuristic style, dark glossy background
- **피해야 할 키워드**: matte finish, rough texture, dull surface, rusty look
- **예시 프롬프트**: `futuristic 3D icon of a sphere, chrome metal material, mirror finish, dramatic studio lighting, environment reflection, dark glossy background`
- **생성 예시 설명**: 주변 환경이 거울처럼 강하게 반사되는 미래적인 크롬 구체 이미지가 생성됩니다.

#### 브러시드 메탈 (Brushed Metal)
- **영어 키워드**: `brushed metal material`
- **설명**: 미세한 결이 살아있는 무광에 가까운 금속 재질로, 산업적이고 견고한 느낌의 제품 디자인에 적합합니다.
- **추천 키워드**: brushed aluminum surface, satin metal finish, fine linear texture metal, industrial brushed steel
- **함께 쓰면 좋은 키워드**: soft directional lighting, minimalist product shot, neutral gray background, subtle highlight
- **피해야 할 키워드**: mirror polish, glossy chrome, plastic look, colorful glossy tint
- **예시 프롬프트**: `modern laptop body, brushed metal material, satin aluminum finish, soft directional lighting, neutral gray background, minimalist product shot`
- **생성 예시 설명**: 미세한 결이 살아있는 무광 알루미늄 질감의 노트북 바디 이미지가 생성됩니다.

#### 로즈골드 (Rose Gold)
- **영어 키워드**: `rose gold metal material`
- **설명**: 은은한 핑크빛이 도는 우아한 금속 재질로, 여성스럽고 트렌디한 뷰티·액세서리 제품 표현에 적합합니다.
- **추천 키워드**: polished rose gold surface, pink gold finish, shiny rose gold metal, elegant rose gold texture
- **함께 쓰면 좋은 키워드**: soft warm lighting, pastel background, luxury composition, subtle reflection
- **피해야 할 키워드**: cold blue tone, rusty texture, matte gray finish, plastic look
- **예시 프롬프트**: `elegant 3D icon of a lipstick case, rose gold metal material, polished surface, soft warm lighting, pastel pink background, luxury composition`
- **생성 예시 설명**: 은은한 핑크빛 광택이 도는 우아한 로즈골드 립스틱 케이스 이미지가 생성됩니다.

### Clay

#### 점토 (Clay)
- **영어 키워드**: `clay material`
- **설명**: 손으로 빚은 듯한 매트하고 부드러운 질감의 점토 재질로, 귀엽고 아기자기한 클레이 애니메이션 스타일 오브젝트에 적합합니다.
- **추천 키워드**: matte clay texture, handmade clay surface, claymation style material, soft clay finish
- **함께 쓰면 좋은 키워드**: clay render style, soft studio lighting, pastel color palette, rounded shapes
- **피해야 할 키워드**: glossy plastic finish, metallic surface, sharp hard edges, transparent material
- **예시 프롬프트**: `cute 3D character of a cat, clay material, claymation style, pastel color palette, soft studio lighting, rounded shapes, white background`
- **생성 예시 설명**: 손으로 빚은 듯한 부드러운 질감의 파스텔톤 클레이 고양이 캐릭터 이미지가 생성됩니다.

#### 소프트 클레이 (Soft Clay)
- **영어 키워드**: `soft clay material`
- **설명**: 표면이 더욱 부드럽고 매끈하게 다듬어진 점토 재질로, 몰랑하고 따뜻한 느낌의 미니멀 3D 아이콘에 적합합니다.
- **추천 키워드**: smooth soft clay surface, plush clay texture, gentle matte clay finish, rounded soft clay
- **함께 쓰면 좋은 키워드**: minimal 3D style, soft ambient lighting, muted pastel tone, simple background
- **피해야 할 키워드**: sharp rough texture, glossy shine, metallic reflection, hard plastic look
- **예시 프롬프트**: `minimal 3D icon of a heart, soft clay material, smooth surface, soft ambient lighting, muted pastel tone, simple white background`
- **생성 예시 설명**: 몰랑하고 매끈한 표면의 파스텔톤 하트 클레이 아이콘 이미지가 생성됩니다.

#### 폴리머 클레이 (Polymer Clay)
- **영어 키워드**: `polymer clay material`
- **설명**: 살짝 광택이 도는 정교한 수공예 폴리머 클레이 질감으로, 아기자기한 미니어처 소품이나 참(charm) 디자인에 적합합니다.
- **추천 키워드**: handcrafted polymer clay texture, semi-gloss clay finish, miniature craft clay surface, sculpted clay detail
- **함께 쓰면 좋은 키워드**: macro product shot, soft top lighting, colorful palette, craft style composition
- **피해야 할 키워드**: rough unfinished texture, metallic surface, glossy plastic shine, transparent material
- **예시 프롬프트**: `miniature fruit charm set, polymer clay material, semi-gloss finish, macro product shot, soft top lighting, colorful palette, white background`
- **생성 예시 설명**: 정교하게 빚어진 미니어처 과일 참 소품이 담긴 폴리머 클레이 이미지가 생성됩니다.

### Rubber

#### 고무 (Rubber)
- **영어 키워드**: `rubber material`
- **설명**: 탄성이 느껴지는 두툼하고 매트한 고무 재질로, 스포츠용품이나 튼튼한 느낌의 아이콘 표현에 적합합니다.
- **추천 키워드**: matte rubber surface, textured rubber finish, elastic rubber material, rubberized texture
- **함께 쓰면 좋은 키워드**: bold color palette, soft studio lighting, simple background, 3D render style
- **피해야 할 키워드**: glossy glass finish, metallic shine, transparent surface, fragile look
- **예시 프롬프트**: `3D icon of a bouncy ball, rubber material, matte textured surface, bold color palette, soft studio lighting, simple white background`
- **생성 예시 설명**: 탄성이 느껴지는 두툼한 매트 질감의 컬러풀한 고무공 아이콘 이미지가 생성됩니다.

#### 소프트 러버 (Soft Rubber)
- **영어 키워드**: `soft rubber material`
- **설명**: 조금 더 부드럽고 유연한 느낌의 고무 재질로, 그립감이 느껴지는 제품이나 유아용품 표현에 적합합니다.
- **추천 키워드**: flexible soft rubber surface, pliable rubber texture, gentle matte rubber finish, soft grip rubber
- **함께 쓰면 좋은 키워드**: soft pastel color, gentle studio lighting, rounded friendly shapes, clean background
- **피해야 할 키워드**: hard rigid material, glossy metallic shine, sharp glass texture, brittle surface
- **예시 프롬프트**: `soft rubber baby teether toy, soft rubber material, pastel color, gentle studio lighting, rounded friendly shapes, clean white background`
- **생성 예시 설명**: 부드럽고 유연한 촉감의 파스텔톤 유아용 치발기 이미지가 생성됩니다.

#### 실리콘 (Silicone)
- **영어 키워드**: `silicone material`
- **설명**: 매끈하고 유연하며 살짝 반투명한 느낌도 표현 가능한 실리콘 재질로, 주방용품이나 웨어러블 디바이스 밴드 표현에 적합합니다.
- **추천 키워드**: smooth silicone surface, flexible silicone finish, soft matte silicone, food-grade silicone texture
- **함께 쓰면 좋은 키워드**: clean product photography, soft diffused lighting, minimalist background, pastel color tone
- **피해야 할 키워드**: hard metallic surface, glossy glass finish, rough stone texture, sharp edges
- **예시 프롬프트**: `smartwatch silicone band, silicone material, smooth flexible surface, soft diffused lighting, minimalist background, pastel color tone, product photography`
- **생성 예시 설명**: 매끈하고 유연한 파스텔톤 실리콘 스마트워치 밴드 이미지가 생성됩니다.

### Balloon

#### 인플레터블 (Inflatable)
- **영어 키워드**: `inflatable material`
- **설명**: 공기를 넣어 부풀린 듯한 통통하고 둥근 형태의 재질로, 귀엽고 볼륨감 있는 3D 오브젝트나 캐릭터 표현에 적합합니다.
- **추천 키워드**: inflated puffy surface, air-filled material, rounded inflatable shape, plump inflatable texture
- **함께 쓰면 좋은 키워드**: 3D render style, vibrant color palette, soft studio lighting, playful composition
- **피해야 할 키워드**: flat texture, sharp angular shape, matte stone finish, rigid hard material
- **예시 프롬프트**: `puffy 3D icon of a star shape, inflatable material, rounded plump form, vibrant color palette, soft studio lighting, playful composition, white background`
- **생성 예시 설명**: 공기를 넣어 부풀린 듯 통통하고 볼륨감 있는 컬러풀한 별 모양 3D 아이콘이 생성됩니다.

#### 풍선 재질 (Balloon Material)
- **영어 키워드**: `balloon material`
- **설명**: 얇고 탄력 있는 표면에 은은한 반사가 도는 전형적인 풍선 질감으로, 파티나 축하 무드의 오브젝트 표현에 적합합니다.
- **추천 키워드**: thin stretched balloon surface, latex balloon texture, taut balloon finish, festive balloon material
- **함께 쓰면 좋은 키워드**: bright festive color palette, soft studio lighting, celebratory composition, clean background
- **피해야 할 키워드**: matte fabric texture, rough stone surface, rigid metal look, dull color tone
- **예시 프롬프트**: `birthday number balloon, balloon material, thin stretched latex surface, bright festive color palette, soft studio lighting, clean white background`
- **생성 예시 설명**: 팽팽하게 늘어난 얇은 표면의 화사한 색상 생일 숫자 풍선 이미지가 생성됩니다.

#### 광택 풍선 (Glossy Balloon)
- **영어 키워드**: `glossy balloon material`
- **설명**: 강한 하이라이트와 반사가 도는 광택 풍선 재질로, 화려하고 축제 분위기의 3D 렌더 오브젝트에 적합합니다.
- **추천 키워드**: shiny balloon surface, reflective latex finish, high gloss balloon texture, polished balloon shine
- **함께 쓰면 좋은 키워드**: dramatic studio lighting, vivid color palette, festive background, 3D render style
- **피해야 할 키워드**: matte dull surface, rough fabric texture, dusty finish, flat color
- **예시 프롬프트**: `heart-shaped party balloon, glossy balloon material, shiny reflective surface, vivid red color, dramatic studio lighting, festive background`
- **생성 예시 설명**: 강렬한 하이라이트가 반짝이는 광택 있는 레드 하트 풍선 이미지가 생성됩니다.

### Ceramic

#### 세라믹 (Ceramic)
- **영어 키워드**: `ceramic material`
- **설명**: 매끈하면서도 살짝 무광에 가까운 견고한 세라믹 질감으로, 그릇이나 화분 같은 리빙 소품 표현에 적합합니다.
- **추천 키워드**: smooth ceramic surface, glazed ceramic finish, matte ceramic texture, solid ceramic material
- **함께 쓰면 좋은 키워드**: soft natural lighting, minimalist composition, earthy color palette, clean background
- **피해야 할 키워드**: transparent glass look, metallic shine, plastic texture, rough unglazed surface
- **예시 프롬프트**: `minimalist ceramic vase, ceramic material, smooth glazed surface, earthy color palette, soft natural lighting, clean white background`
- **생성 예시 설명**: 매끈하고 은은한 광택의 어스톤 세라믹 화병 이미지가 생성됩니다.

#### 포슬린 (Porcelain)
- **영어 키워드**: `porcelain material`
- **설명**: 얇고 정교하며 순백에 가까운 광택을 지닌 고급 도자기 재질로, 우아하고 클래식한 오브젝트 표현에 적합합니다.
- **추천 키워드**: fine porcelain surface, delicate china finish, glossy white porcelain, elegant porcelain texture
- **함께 쓰면 좋은 키워드**: soft elegant lighting, classic composition, pastel or white palette, subtle reflection
- **피해야 할 키워드**: rough stone texture, matte clay finish, industrial metal look, cracked surface
- **예시 프롬프트**: `elegant porcelain teacup, porcelain material, glossy white delicate surface, soft elegant lighting, classic composition, subtle reflection, white background`
- **생성 예시 설명**: 얇고 정교한 순백 광택의 우아한 도자기 찻잔 이미지가 생성됩니다.

### Fabric

#### 면 (Cotton)
- **영어 키워드**: `cotton fabric material`
- **설명**: 부드럽고 자연스러운 질감의 면직물 재질로, 포근하고 편안한 무드의 오브젝트나 의류 표현에 적합합니다.
- **추천 키워드**: soft cotton texture, natural cotton weave, cozy cotton fabric, matte cotton surface
- **함께 쓰면 좋은 키워드**: warm natural lighting, neutral color palette, cozy composition, soft shadow
- **피해야 할 키워드**: glossy synthetic finish, metallic shine, transparent material, plastic texture
- **예시 프롬프트**: `folded cotton t-shirt, cotton fabric material, soft natural weave texture, neutral beige tone, warm natural lighting, cozy composition`
- **생성 예시 설명**: 부드러운 자연 질감이 느껴지는 베이지톤 면 티셔츠 이미지가 생성됩니다.

#### 리넨 (Linen)
- **영어 키워드**: `linen fabric material`
- **설명**: 자연스러운 결과 살짝 거친 텍스처를 지닌 리넨 재질로, 내추럴하고 편안한 홈데코 무드 표현에 적합합니다.
- **추천 키워드**: textured linen weave, natural linen surface, rustic linen fabric, breathable linen texture
- **함께 쓰면 좋은 키워드**: soft natural lighting, muted earthy tone, minimalist home decor style, gentle shadow
- **피해야 할 키워드**: glossy silk finish, synthetic shine, smooth plastic surface, vibrant neon color
- **예시 프롬프트**: `linen throw pillow, linen fabric material, natural textured weave, muted earthy tone, soft natural lighting, minimalist home decor style`
- **생성 예시 설명**: 자연스러운 결이 느껴지는 어스톤 리넨 쿠션 이미지가 생성됩니다.

#### 벨벳 (Velvet)
- **영어 키워드**: `velvet fabric material`
- **설명**: 부드럽고 깊이감 있는 광택이 도는 고급스러운 벨벳 재질로, 럭셔리하고 로맨틱한 무드의 소품에 적합합니다.
- **추천 키워드**: soft velvet texture, plush velvet surface, luxurious velvet sheen, rich velvet fabric
- **함께 쓰면 좋은 키워드**: dramatic warm lighting, deep jewel tone color, luxury composition, soft shadow
- **피해야 할 키워드**: rough burlap texture, matte dry surface, cheap synthetic look, flat lighting
- **예시 프롬프트**: `luxurious velvet armchair, velvet fabric material, plush deep emerald tone, dramatic warm lighting, luxury composition, soft shadow`
- **생성 예시 설명**: 깊이감 있는 광택의 에메랄드빛 벨벳 암체어 이미지가 생성됩니다.

#### 가죽 (Leather)
- **영어 키워드**: `leather material`
- **설명**: 은은한 결과 자연스러운 광택이 도는 가죽 재질로, 클래식하고 견고한 무드의 가방이나 액세서리 표현에 적합합니다.
- **추천 키워드**: textured leather surface, genuine leather finish, smooth leather grain, rich leather material
- **함께 쓰면 좋은 키워드**: warm studio lighting, classic composition, earthy brown tone, subtle reflection
- **피해야 할 키워드**: glossy plastic shine, transparent glass look, synthetic vinyl texture, bright neon color
- **예시 프롬프트**: `classic leather handbag, leather material, smooth grain texture, rich brown tone, warm studio lighting, classic composition`
- **생성 예시 설명**: 자연스러운 결과 은은한 광택이 도는 브라운톤 가죽 핸드백 이미지가 생성됩니다.

#### 펠트 (Felt)
- **영어 키워드**: `felt fabric material`
- **설명**: 촘촘하고 부드러운 무광 질감의 펠트 재질로, 아기자기하고 수공예적인 무드의 오브젝트나 캐릭터 표현에 적합합니다.
- **추천 키워드**: soft felt texture, matte felt surface, dense felt fabric, cozy felt material
- **함께 쓰면 좋은 키워드**: playful craft style, soft top lighting, pastel color palette, simple background
- **피해야 할 키워드**: glossy shiny finish, transparent material, metallic surface, sharp hard edges
- **예시 프롬프트**: `handmade felt flower brooch, felt fabric material, soft matte texture, pastel color palette, soft top lighting, playful craft style, white background`
- **생성 예시 설명**: 촘촘하고 부드러운 무광 질감의 파스텔톤 펠트 꽃 브로치 이미지가 생성됩니다.

### Natural

#### 나무 (Wood)
- **영어 키워드**: `wood material`
- **설명**: 자연스러운 나이테와 결이 살아있는 목재 재질로, 따뜻하고 내추럴한 무드의 가구나 장난감 표현에 적합합니다.
- **추천 키워드**: natural wood grain, polished wood surface, warm timber texture, rustic wood finish
- **함께 쓰면 좋은 키워드**: warm natural lighting, earthy color palette, minimalist composition, soft shadow
- **피해야 할 키워드**: glossy plastic shine, metallic surface, transparent glass look, synthetic finish
- **예시 프롬프트**: `handcrafted wooden toy car, wood material, natural grain texture, warm honey brown tone, warm natural lighting, minimalist composition`
- **생성 예시 설명**: 자연스러운 나뭇결이 살아있는 허니브라운톤 목재 장난감 자동차 이미지가 생성됩니다.

#### 돌 (Stone)
- **영어 키워드**: `stone material`
- **설명**: 거칠고 단단한 질감을 지닌 자연석 재질로, 견고하고 원시적인 무드의 오브젝트나 조형물 표현에 적합합니다.
- **추천 키워드**: rough stone texture, natural rock surface, weathered stone finish, solid granite texture
- **함께 쓰면 좋은 키워드**: dramatic natural lighting, muted gray palette, minimalist composition, soft shadow
- **피해야 할 키워드**: glossy plastic shine, transparent glass look, soft fabric texture, bright neon color
- **예시 프롬프트**: `abstract stone sculpture, stone material, rough natural rock texture, muted gray tone, dramatic natural lighting, minimalist composition`
- **생성 예시 설명**: 거칠고 단단한 질감의 회색빛 추상 돌 조형물 이미지가 생성됩니다.

#### 대리석 (Marble)
- **영어 키워드**: `marble material`
- **설명**: 매끈한 표면에 자연스러운 베인 무늬가 흐르는 고급스러운 대리석 재질로, 럭셔리한 인테리어 소품 표현에 적합합니다.
- **추천 키워드**: polished marble surface, veined marble texture, glossy marble finish, elegant marble stone
- **함께 쓰면 좋은 키워드**: soft studio lighting, luxury composition, neutral white-gray palette, subtle reflection
- **피해야 할 키워드**: rough unpolished texture, matte concrete look, plastic shine, bright saturated color
- **예시 프롬프트**: `elegant marble bathroom sink, marble material, polished surface with veined texture, neutral white-gray palette, soft studio lighting, luxury composition`
- **생성 예시 설명**: 자연스러운 베인 무늬가 흐르는 매끈한 화이트-그레이 대리석 세면대 이미지가 생성됩니다.

#### 얼음 (Ice)
- **영어 키워드**: `ice material`
- **설명**: 투명하면서도 내부에 균열과 기포가 비치는 차가운 얼음 재질로, 시원하고 신선한 무드의 오브젝트 표현에 적합합니다.
- **추천 키워드**: transparent ice texture, frozen ice surface, crystal clear ice, icy refractive material
- **함께 쓰면 좋은 키워드**: cool blue lighting, frosty atmosphere, minimalist background, subtle glow
- **피해야 할 키워드**: warm color tone, matte dry surface, wooden texture, dusty finish
- **예시 프롬프트**: `ice sculpture of a swan, ice material, transparent crystal clear surface, cool blue lighting, frosty atmosphere, minimalist dark background`
- **생성 예시 설명**: 투명하고 차가운 푸른빛이 도는 백조 모양 얼음 조각 이미지가 생성됩니다.

#### 물 (Water)
- **영어 키워드**: `water material`
- **설명**: 투명하게 흐르거나 물방울로 맺히는 유동적인 물의 질감으로, 청량하고 생동감 있는 무드 표현에 적합합니다.
- **추천 키워드**: flowing water texture, transparent water droplet, splashing water surface, liquid water material
- **함께 쓰면 좋은 키워드**: cool refreshing lighting, blue color palette, dynamic motion composition, soft glow
- **피해야 할 키워드**: dry matte surface, solid metallic texture, dusty finish, warm orange tone
- **예시 프롬프트**: `splashing water droplet in mid-air, water material, transparent flowing texture, cool blue color palette, dynamic motion composition, soft studio lighting`
- **생성 예시 설명**: 투명하게 튀어오르는 청량한 블루톤 물방울 이미지가 생성됩니다.

#### 액체 (Liquid)
- **영어 키워드**: `liquid material`
- **설명**: 부드럽게 흐르거나 방울지는 다양한 색의 액체 질감으로, 추상적이고 유동적인 아트 오브젝트 표현에 적합합니다.
- **추천 키워드**: flowing liquid texture, viscous liquid surface, glossy liquid finish, smooth liquid form
- **함께 쓰면 좋은 키워드**: vibrant gradient color, dynamic fluid composition, soft studio lighting, abstract style
- **피해야 할 키워드**: dry solid texture, matte stone surface, rough fabric look, static rigid shape
- **예시 프롬프트**: `abstract flowing liquid shape, liquid material, glossy viscous texture, vibrant purple-pink gradient, dynamic fluid composition, soft studio lighting`
- **생성 예시 설명**: 부드럽게 흐르는 광택의 보라-핑크 그라데이션 추상 액체 형태 이미지가 생성됩니다.

---

## PART 04. Lighting

### 소프트 스튜디오 라이팅 (Soft Studio Lighting)
- **영어 키워드**: `soft studio lighting`
- **설명**: 확산광으로 그림자 경계를 부드럽게 만드는 조명 방식으로, 아이콘·제품 목업처럼 깔끔하고 부드러운 무드가 필요한 디자인 에셋에 적합합니다.
- **추천 키워드**: diffused lighting, softbox lighting, gentle studio light, even soft light, low contrast lighting
- **함께 쓰면 좋은 키워드**: matte finish, pastel color palette, minimalist background, clean product shot, rounded 3d icon
- **피해야 할 키워드**: hard shadow, harsh spotlight, dramatic contrast, neon glow
- **예시 프롬프트**: `minimalist 3D app icon, matte plastic material, soft studio lighting, pastel background, clean product render, high quality`
- **생성 예시 설명**: 부드러운 그림자와 은은한 하이라이트가 있는, 광고성 톤이 강하지 않은 깔끔한 파스텔톤 3D 아이콘 이미지가 생성됩니다.

### 스튜디오 라이팅 (Studio Lighting)
- **영어 키워드**: `studio lighting`
- **설명**: 전문 촬영 스튜디오에서 쓰는 균형 잡힌 다방향 조명 세팅으로, 피사체를 또렷하고 신뢰감 있게 보여주는 범용 디자인 조명입니다.
- **추천 키워드**: professional studio lighting, three point lighting, controlled lighting setup, even key light
- **함께 쓰면 좋은 키워드**: product photography, glass material, brushed metal, white seamless background, sharp focus
- **피해야 할 키워드**: messy ambient light, colored gel lighting, silhouette lighting, low key darkness
- **예시 프롬프트**: `wireless earbuds product icon, brushed metal and glass material, studio lighting, white background, sharp focus, high detail render`
- **생성 예시 설명**: 흰 배경 위에 또렷하고 균일하게 조명된, 카탈로그용 제품 아이콘 같은 이미지가 생성됩니다.

### 제품 사진 조명 (Product Photography Lighting)
- **영어 키워드**: `product photography lighting`
- **설명**: 커머스 상세페이지나 아이콘용 목업에서 제품의 재질과 형태를 뚜렷하게 강조하기 위한 상업 촬영용 조명 스타일입니다.
- **추천 키워드**: commercial product lighting, catalog lighting, e-commerce lighting, clean highlight lighting
- **함께 쓰면 좋은 키워드**: reflective surface, glossy finish, seamless studio background, macro detail, isometric icon
- **피해야 할 키워드**: moody lighting, heavy fog, low light scene, colored neon light
- **예시 프롬프트**: `perfume bottle icon, glass and gold cap material, product photography lighting, seamless white background, isometric view, ultra detailed`
- **생성 예시 설명**: 유리 표면의 반사와 하이라이트가 선명하게 살아있는, 커머스용 목업에 바로 쓸 수 있는 제품 아이콘이 생성됩니다.

### 앰비언트 라이팅 (Ambient Lighting)
- **영어 키워드**: `ambient lighting`
- **설명**: 특정 광원 없이 공간 전체에 은은하게 퍼진 배경광으로, 분위기 있는 일러스트나 배경이 있는 아이콘 세트에 잘 어울립니다.
- **추천 키워드**: soft ambient light, environmental lighting, diffuse background light, atmospheric glow
- **함께 쓰면 좋은 키워드**: warm color palette, cozy scene, blurred background, flat illustration, muted tones
- **피해야 할 키워드**: hard direct spotlight, harsh rim light, high contrast studio light
- **예시 프롬프트**: `cozy reading lamp icon illustration, wooden and fabric material, ambient lighting, warm muted color palette, flat design style`
- **생성 예시 설명**: 특정 광원이 두드러지지 않고 전체적으로 따뜻하게 은은한 분위기의 일러스트형 아이콘이 생성됩니다.

### 자연광/일광 (Natural Daylight)
- **영어 키워드**: `natural daylight`
- **설명**: 흐린 낮 창가 빛처럼 색온도가 중립적이고 부드러운 자연 채광으로, 신뢰감 있고 사실적인 톤이 필요한 이미지에 적합합니다.
- **추천 키워드**: soft daylight, overcast light, window light, neutral natural light, diffused sunlight
- **함께 쓰면 좋은 키워드**: realistic material, indoor scene, plant and wood texture, natural color grading, photorealistic
- **피해야 할 키워드**: neon lighting, artificial colored light, dramatic sunset tone
- **예시 프롬프트**: `ceramic coffee mug product icon, matte ceramic material, natural daylight, window light background, photorealistic, high quality`
- **생성 예시 설명**: 창가에서 찍은 듯 자연스럽고 중립적인 색감의, 과장되지 않은 사실적인 제품 이미지가 생성됩니다.

### 골든아워 (Golden Hour)
- **영어 키워드**: `golden hour lighting`
- **설명**: 해질 무렵의 따뜻한 주황빛 저각도 광원으로, 감성적이고 프리미엄한 무드의 마케팅 비주얼에 자주 사용됩니다.
- **추천 키워드**: warm golden light, low angle sunlight, honey-toned lighting, late afternoon light
- **함께 쓰면 좋은 키워드**: lens flare, warm color grading, long shadows, outdoor scene, cinematic composition
- **피해야 할 키워드**: cool blue lighting, flat overcast light, neon lighting, harsh white studio light
- **예시 프롬프트**: `leather travel bag icon, tan leather material, golden hour lighting, warm long shadows, cinematic outdoor background, high detail`
- **생성 예시 설명**: 따뜻한 주황빛과 길게 늘어진 그림자가 만드는, 감성적이고 프리미엄한 느낌의 제품 비주얼이 생성됩니다.

### 선셋 라이트 (Sunset Light)
- **영어 키워드**: `sunset light`
- **설명**: 노을빛의 붉고 보라빛이 도는 극적인 색조 조명으로, 감정적이고 드라마틱한 배경 연출이 필요한 디자인에 적합합니다.
- **추천 키워드**: dusk lighting, warm orange-purple light, twilight glow, dramatic sunset tone
- **함께 쓰면 좋은 키워드**: gradient sky background, silhouette shape, saturated color palette, cinematic scene
- **피해야 할 키워드**: cool daylight, flat studio lighting, neutral white balance
- **예시 프롬프트**: `mountain travel app icon illustration, flat vector style, sunset light, orange to purple gradient sky, silhouette mountains`
- **생성 예시 설명**: 주황에서 보라로 이어지는 노을빛 그라데이션 배경 위에 실루엣이 강조된 감성적인 앱 아이콘이 생성됩니다.

### 림 라이트 (Rim Light)
- **영어 키워드**: `rim light`
- **설명**: 피사체 뒤쪽 가장자리를 따라 얇은 빛의 테두리를 만들어 배경과 분리시키는 조명 기법으로, 입체감과 고급스러움을 더할 때 씁니다.
- **추천 키워드**: edge light, silhouette rim lighting, backlight edge glow, contour highlight
- **함께 쓰면 좋은 키워드**: dark background, glossy material, dramatic contrast, 3d character icon
- **피해야 할 키워드**: flat ambient lighting, overexposed front light, low contrast lighting
- **예시 프롬프트**: `futuristic helmet icon, matte black and chrome material, rim light, dark gradient background, dramatic contrast, high detail 3D render`
- **생성 예시 설명**: 어두운 배경 위 물체 가장자리를 따라 밝은 윤곽선이 도드라져 실루엣이 또렷하게 부각되는 이미지가 생성됩니다.

### 백라이트 (Back Light)
- **영어 키워드**: `back light`
- **설명**: 피사체 뒤에서 정면을 향해 비추는 광원으로, 실루엣이나 은은한 후광 효과를 만들어 신비롭고 몽환적인 분위기를 연출합니다.
- **추천 키워드**: backlighting, halo light effect, light from behind, glowing outline
- **함께 쓰면 좋은 키워드**: translucent material, soft glow, misty background, silhouette illustration
- **피해야 할 키워드**: strong front fill light, flat studio lighting, hard shadow on subject
- **예시 프롬프트**: `frosted glass perfume bottle icon, translucent glass material, back light, soft halo glow, misty gradient background`
- **생성 예시 설명**: 반투명한 재질을 뒤에서 비춘 빛이 통과하며 은은한 후광이 감도는 몽환적인 이미지가 생성됩니다.

### 사이드 라이트 (Side Light)
- **영어 키워드**: `side light`
- **설명**: 피사체의 한쪽 측면에서 비추는 조명으로 표면의 질감과 굴곡을 뚜렷하게 드러내, 재질감을 강조하고 싶은 아이콘에 적합합니다.
- **추천 키워드**: side lighting, directional side light, raking light, textured side illumination
- **함께 쓰면 좋은 키워드**: brushed metal texture, embossed detail, high contrast shadow, macro texture
- **피해야 할 키워드**: flat frontal lighting, shadowless ambient light, overexposed even light
- **예시 프롬프트**: `embossed metal badge icon, brushed steel material, side light, raking texture highlight, dark studio background, macro detail`
- **생성 예시 설명**: 옆에서 들어온 빛에 표면의 질감과 음영이 도드라져 재질감이 강조된 배지 아이콘이 생성됩니다.

### 탑 라이트 (Top Light)
- **영어 키워드**: `top light`
- **설명**: 정수리 위에서 수직으로 내리쬐는 조명으로, 물체 하단에 짧은 그림자를 만들어 안정적이고 깔끔한 제품 배치 이미지에 사용합니다.
- **추천 키워드**: overhead lighting, top-down light, vertical key light, downlight
- **함께 쓰면 좋은 키워드**: flat lay composition, symmetrical layout, minimalist background, clean product shot
- **피해야 할 키워드**: side rim light, low angle backlight, dramatic golden hour light
- **예시 프롬프트**: `flat lay skincare bottle icon set, glass material, top light, short soft shadows, minimalist pastel background`
- **생성 예시 설명**: 위에서 곧게 떨어지는 빛으로 물체 아래에 짧고 균일한 그림자가 생기는 정돈된 플랫레이 스타일 이미지가 생성됩니다.

### 소프트 섀도우 (Soft Shadow)
- **영어 키워드**: `soft shadow`
- **설명**: 경계가 흐릿하고 옅은 그림자로, 부드럽고 가벼운 느낌의 미니멀한 아이콘·일러스트에 자주 쓰입니다.
- **추천 키워드**: diffused shadow, gentle drop shadow, blurred soft shadow, subtle shadow
- **함께 쓰면 좋은 키워드**: minimalist design, pastel palette, rounded shapes, clean flat background
- **피해야 할 키워드**: hard shadow, sharp cast shadow, high contrast lighting, dramatic spotlight
- **예시 프롬프트**: `rounded 3D alarm clock icon, matte pastel plastic material, soft shadow, minimalist white background, clean render`
- **생성 예시 설명**: 물체 아래 경계가 흐릿하게 퍼진 옅은 그림자만 남아 가볍고 부드러운 인상을 주는 미니멀 아이콘이 생성됩니다.

### 하드 섀도우 (Hard Shadow)
- **영어 키워드**: `hard shadow`
- **설명**: 경계가 뚜렷하고 진한 그림자로, 강한 직사광 아래 있는 듯한 대비감을 만들어 그래픽적이고 강렬한 무드에 적합합니다.
- **추천 키워드**: sharp cast shadow, high contrast shadow, crisp drop shadow, defined dark shadow
- **함께 쓰면 좋은 키워드**: bold color block background, geometric shapes, direct sunlight, graphic design style
- **피해야 할 키워드**: soft shadow, diffused ambient light, low contrast lighting
- **예시 프롬프트**: `bold geometric sneaker icon, glossy plastic material, hard shadow, direct sunlight, bright color block background, graphic design style`
- **생성 예시 설명**: 물체 아래 선명한 경계의 진한 그림자가 드리워, 대비가 강하고 그래픽적인 인상의 이미지가 생성됩니다.

### 볼류메트릭 라이팅 (Volumetric Lighting)
- **영어 키워드**: `volumetric lighting`
- **설명**: 안개나 먼지 입자 사이로 빛줄기가 보이는 조명 효과로, 웅장하고 극적인 무드의 배경 연출에 사용됩니다.
- **추천 키워드**: god rays, light shafts, atmospheric fog light, hazy light beams
- **함께 쓰면 좋은 키워드**: dark moody background, dust particles, cinematic composition, dramatic scale
- **피해야 할 키워드**: flat even lighting, clean white studio background, bright daylight
- **예시 프롬프트**: `mystical potion bottle icon, glass and glowing liquid material, volumetric lighting, god rays through fog, dark cinematic background`
- **생성 예시 설명**: 안개 속을 가르는 빛줄기가 극적인 분위기를 만드는, 신비로운 무드의 배경이 있는 이미지가 생성됩니다.

### 네온 라이팅 (Neon Lighting)
- **영어 키워드**: `neon lighting`
- **설명**: 형광빛의 강렬한 원색 광원으로, 사이버펑크나 나이트라이프 테마의 강렬하고 화려한 아이콘 디자인에 적합합니다.
- **추천 키워드**: neon glow, cyberpunk neon light, vibrant fluorescent light, electric neon color
- **함께 쓰면 좋은 키워드**: glossy black background, cyberpunk style, glowing outline, saturated pink and cyan palette
- **피해야 할 키워드**: soft natural daylight, muted pastel palette, matte finish, ambient warm light
- **예시 프롬프트**: `futuristic game controller icon, glossy black plastic material, neon lighting, pink and cyan glow, dark cyberpunk background`
- **생성 예시 설명**: 핑크와 시안 네온빛이 어두운 배경 위에서 강렬하게 발광하는, 사이버펑크 스타일의 아이콘이 생성됩니다.

## PART 05. Render

### 옥테인 렌더 (Octane Render)
- **영어 키워드**: `octane render`
- **설명**: GPU 기반 실시간 렌더링 엔진 특유의 강한 광택 반사와 선명한 하이라이트가 특징이며, 매끈한 3D 제품 아이콘에 자주 쓰입니다.
- **추천 키워드**: octane 3D render, GPU render look, glossy octane shading, unbiased render
- **함께 쓰면 좋은 키워드**: glass material, chrome finish, studio lighting, vibrant color grading
- **피해야 할 키워드**: flat vector illustration, hand-drawn sketch style, low poly style
- **예시 프롬프트**: `abstract geometric sculpture icon, glossy chrome material, octane render, studio lighting, vibrant gradient background, ultra detailed`
- **생성 예시 설명**: 강한 반사광과 매끈한 표면 질감이 두드러지는, 광고용 3D 렌더링에 가까운 고품질 이미지가 생성됩니다.

### 블렌더 사이클스 (Blender Cycles)
- **영어 키워드**: `blender cycles render`
- **설명**: 오픈소스 3D 툴 블렌더의 물리 기반 경로 추적 렌더러 스타일로, 사실적이면서도 약간의 수제 느낌이 남는 3D 룩을 만듭니다.
- **추천 키워드**: cycles path tracing render, blender 3D render, physically based render, ray traced shading
- **함께 쓰면 좋은 키워드**: soft global illumination, matte and glass mixed material, natural daylight, procedural texture
- **피해야 할 키워드**: flat 2D illustration, cel shading, low poly stylized look
- **예시 프롬프트**: `wooden desk organizer icon, wood and matte plastic material, blender cycles render, soft global illumination, natural daylight, high detail`
- **생성 예시 설명**: 재질별 반사와 그림자가 물리적으로 자연스럽게 표현된, 사실적이면서 부드러운 3D 오브젝트 이미지가 생성됩니다.

### 시네마4D (Cinema4D)
- **영어 키워드**: `cinema4D render`
- **설명**: 모션그래픽·모던 3D 디자인 트렌드에서 자주 보이는 깔끔하고 매끈한 형태감이 특징으로, 트렌디한 앱 아이콘이나 키비주얼에 적합합니다.
- **추천 키워드**: C4D style render, clean 3D motion graphic look, smooth geometric render, modern 3D icon style
- **함께 쓰면 좋은 키워드**: pastel gradient background, matte plastic material, soft studio lighting, rounded geometric shapes
- **피해야 할 키워드**: gritty realistic texture, hand-painted style, low poly retro look
- **예시 프롬프트**: `abstract wallet and coin icon, matte pastel plastic material, cinema4D render, soft studio lighting, pastel gradient background`
- **생성 예시 설명**: 매끈하고 둥근 형태에 파스텔톤 색감이 어우러진, 트렌디한 핀테크 앱 스타일의 3D 아이콘이 생성됩니다.

### 레드시프트 (Redshift)
- **영어 키워드**: `redshift render`
- **설명**: GPU 기반 프로덕션 렌더러로 복잡한 재질과 조명을 빠르게 사실적으로 표현하며, 디테일이 풍부한 하이엔드 제품 비주얼에 어울립니다.
- **추천 키워드**: redshift GPU render, high-end production render, detailed material shading, realistic render engine
- **함께 쓰면 좋은 키워드**: metallic material, subsurface scattering skin, studio lighting, product photography lighting
- **피해야 할 키워드**: flat cartoon style, low detail simple shapes, 2D vector illustration
- **예시 프롬프트**: `luxury watch product icon, brushed gold and leather material, redshift render, product photography lighting, dark studio background, ultra detailed`
- **생성 예시 설명**: 금속과 가죽의 미세한 질감까지 세밀하게 표현된, 하이엔드 광고 비주얼 수준의 제품 이미지가 생성됩니다.

### 언리얼 엔진 (Unreal Engine)
- **영어 키워드**: `unreal engine render`
- **설명**: 실시간 게임 엔진 렌더링 특유의 생생한 라이팅과 반사 효과가 특징이며, 다이나믹한 게임/앱 아이콘 비주얼에 적합합니다.
- **추천 키워드**: unreal engine 5 render, real-time render look, game engine lighting, nanite detail render
- **함께 쓰면 좋은 키워드**: dynamic lighting, volumetric lighting, metallic and glass material, cinematic composition
- **피해야 할 키워드**: flat matte illustration, hand-drawn sketch, minimalist line art
- **예시 프롬프트**: `sci-fi energy core icon, glowing glass and metal material, unreal engine render, dynamic volumetric lighting, dark cinematic background`
- **생성 예시 설명**: 실시간 게임 그래픽처럼 생생한 반사광과 발광 효과가 어우러진 다이나믹한 아이콘 이미지가 생성됩니다.

### CGI
- **영어 키워드**: `CGI render`
- **설명**: 컴퓨터로 생성된 그래픽 전반을 가리키는 넓은 범주의 키워드로, 실사에 가까운 합성 이미지 톤을 지정할 때 범용적으로 사용합니다.
- **추천 키워드**: computer generated imagery, digital 3D render, CGI product visualization, synthetic render look
- **함께 쓰면 좋은 키워드**: photorealistic material, studio lighting, clean background, high resolution render
- **피해야 할 키워드**: hand-drawn illustration, watercolor style, flat 2D vector art
- **예시 프롬프트**: `modern speaker product icon, matte fabric and aluminum material, CGI render, studio lighting, clean white background, high resolution`
- **생성 예시 설명**: 실제 촬영과 구분하기 어려울 정도로 매끈하고 정교한 합성 제품 이미지가 생성됩니다.

### PBR (Physically Based Rendering)
- **영어 키워드**: `PBR material render`
- **설명**: 물리 기반 재질 셰이딩으로 금속·거칠기·반사율을 사실적으로 계산해, 재질 구분이 명확한 신뢰감 있는 3D 에셋에 적합합니다.
- **추천 키워드**: physically based rendering, PBR texture shading, realistic roughness and metalness, accurate material render
- **함께 쓰면 좋은 키워드**: global illumination, metallic and matte mixed material, studio lighting, high poly model
- **피해야 할 키워드**: flat shading, toon shading, low detail cartoon style
- **예시 프롬프트**: `industrial toolbox icon, painted metal and rubber material, PBR material render, global illumination, studio lighting, high detail`
- **생성 예시 설명**: 금속과 고무 등 서로 다른 재질의 질감과 반사율이 사실적으로 구분되어 표현된 정교한 3D 아이콘이 생성됩니다.

### 하이 폴리 (High Poly)
- **영어 키워드**: `high poly render`
- **설명**: 폴리곤 수가 많아 곡면과 디테일이 매끄럽게 표현되는 모델링 방식으로, 부드러운 곡선과 정교한 디테일이 필요한 에셋에 사용합니다.
- **추천 키워드**: high polygon count, smooth subdivision surface, detailed 3D mesh, high resolution model
- **함께 쓰면 좋은 키워드**: subsurface scattering, smooth rounded shapes, studio lighting, photorealistic material
- **피해야 할 키워드**: low poly style, blocky geometric shapes, faceted flat surfaces
- **예시 프롬프트**: `elegant perfume bottle icon, smooth glass material, high poly render, subtle subsurface scattering, soft studio lighting, ultra detailed`
- **생성 예시 설명**: 곡면이 매끄럽고 각진 부분 없이 부드럽게 이어지는 고해상도 디테일의 유리 제품 이미지가 생성됩니다.

### 스타일라이즈드 렌더 (Stylized Render)
- **영어 키워드**: `stylized render`
- **설명**: 사실적 재현보다 캐릭터성과 형태 과장을 우선하는 3D 렌더 스타일로, 친근하고 개성 있는 브랜드 아이콘·마스코트에 적합합니다.
- **추천 키워드**: cartoon-style 3D render, playful stylized shading, exaggerated proportions render, toy-like render look
- **함께 쓰면 좋은 키워드**: vibrant color palette, rounded shapes, soft studio lighting, matte plastic material
- **피해야 할 키워드**: photorealistic detail, PBR realistic material, high poly realistic mesh
- **예시 프롬프트**: `cute mascot robot icon, glossy toy plastic material, stylized render, vibrant color palette, soft studio lighting, playful design`
- **생성 예시 설명**: 형태가 단순하고 둥글게 과장되어 장난감처럼 친근한 느낌을 주는 마스코트 스타일의 아이콘이 생성됩니다.

### 포토리얼리스틱 (Photorealistic)
- **영어 키워드**: `photorealistic render`
- **설명**: 실제 사진과 구분이 어려울 정도로 정교한 사실적 렌더링을 지정하는 키워드로, 신뢰감이 중요한 제품 목업에 주로 사용합니다.
- **추천 키워드**: hyperrealistic render, true-to-life render, photo-realistic 3D visualization, lifelike detail render
- **함께 쓰면 좋은 키워드**: PBR material, studio lighting, product photography lighting, high resolution detail
- **피해야 할 키워드**: stylized cartoon look, flat vector illustration, toy-like exaggerated shape
- **예시 프롬프트**: `stainless steel water bottle product icon, brushed metal material, photorealistic render, product photography lighting, white seamless background`
- **생성 예시 설명**: 실제 사진처럼 재질 질감과 반사가 정밀하게 표현된 사실적인 제품 이미지가 생성됩니다.

### 글로벌 일루미네이션 (Global Illumination)
- **영어 키워드**: `global illumination`
- **설명**: 빛이 표면에 반사되며 주변까지 자연스럽게 물드는 간접광 계산 방식으로, 공간감과 재질 간 색번짐이 사실적인 장면에 적합합니다.
- **추천 키워드**: GI lighting, indirect light bounce, radiosity lighting, realistic light bounce render
- **함께 쓰면 좋은 키워드**: PBR material, soft ambient lighting, natural daylight, high poly model
- **피해야 할 키워드**: flat shading, hard direct spotlight only, toon shading
- **예시 프롬프트**: `ceramic vase and plant icon scene, matte ceramic and leaf material, global illumination, soft natural daylight, PBR material, high detail`
- **생성 예시 설명**: 주변 표면에서 반사된 빛이 서로 자연스럽게 물들어, 실내 공간처럼 입체감과 깊이가 느껴지는 이미지가 생성됩니다.

---

## PART 06. Color

### 파스텔 (Pastel)
- **영어 키워드**: `pastel color palette`
- **설명**: 채도를 낮추고 흰색을 섞은 듯한 부드럽고 은은한 색감으로, 귀엽고 온화한 무드의 아이콘이나 여성/키즈 타겟 UI에 적합하다.
- **추천 키워드**: soft pastel, muted pastel tones, baby pink and mint, powdery colors, dreamy pastel palette
- **함께 쓰면 좋은 키워드**: soft lighting, matte finish, rounded shapes, cute character design, cloud texture
- **피해야 할 키워드**: high contrast, neon, deep shadows, harsh lighting
- **예시 프롬프트**: `cute rounded cloud icon, matte clay material, pastel color palette, soft pink and mint tones, soft diffused lighting, white background, minimal clean design, high quality render`
- **생성 예시 설명**: 부드러운 분홍과 민트 톤의 매트한 점토 질감 구름 아이콘이 은은한 조명 아래 하얀 배경에 놓인 이미지가 생성된다.

### 비비드 (Vibrant)
- **영어 키워드**: `vibrant saturated colors`
- **설명**: 채도와 명도가 높은 강렬하고 생동감 있는 색감으로, 눈에 띄는 광고 배너나 앱 런처 아이콘처럼 임팩트가 필요한 디자인에 적합하다.
- **추천 키워드**: bold vibrant colors, high saturation, punchy color palette, electric colors, energetic color scheme
- **함께 쓰면 좋은 키워드**: glossy finish, bold outline style, dynamic angle, studio lighting, 3D render
- **피해야 할 키워드**: desaturated, muted tones, grayscale, dull colors
- **예시 프롬프트**: `glossy 3D rocket icon, bold outline style, vibrant saturated colors, red orange and blue, studio lighting, dynamic angle, plain background, ultra sharp render`
- **생성 예시 설명**: 빨강, 주황, 파랑이 강렬하게 대비되는 광택 있는 3D 로켓 아이콘이 역동적인 각도로 표현된 이미지가 생성된다.

### 뉴트럴 (Neutral)
- **영어 키워드**: `neutral color palette`
- **설명**: 베이지, 그레이, 오프화이트 등 자극 없는 절제된 색조로, 프리미엄 브랜딩이나 차분한 대시보드 UI 아이콘에 어울린다.
- **추천 키워드**: muted neutral tones, beige and gray palette, calm neutral colors, off-white shades, subdued color scheme
- **함께 쓰면 좋은 키워드**: matte texture, soft shadow, minimalist design, linen material, flat design
- **피해야 할 키워드**: neon colors, rainbow, high saturation, glitter
- **예시 프롬프트**: `minimalist folder icon, matte linen texture, neutral color palette, beige and warm gray tones, soft shadow, flat design, clean background, high resolution`
- **생성 예시 설명**: 베이지와 웜그레이 톤의 매트한 리넨 질감 폴더 아이콘이 은은한 그림자와 함께 플랫하게 표현된 이미지가 생성된다.

### 웜 톤 (Warm Tone)
- **영어 키워드**: `warm color tone`
- **설명**: 빨강, 주황, 노랑 계열의 따뜻한 색감으로, 친근하고 활기찬 느낌을 주는 음식·라이프스타일 앱 아이콘에 적합하다.
- **추천 키워드**: warm color palette, amber and terracotta tones, sunset colors, cozy warm hues, warm golden light
- **함께 쓰면 좋은 키워드**: wooden texture, soft glow, morning light, ceramic material, cozy atmosphere
- **피해야 할 키워드**: cool blue tones, icy colors, cold lighting, monochrome gray
- **예시 프롬프트**: `ceramic coffee cup icon, warm color tone, amber and terracotta hues, soft golden glow, wooden coaster texture, cozy background, high quality 3D render`
- **생성 예시 설명**: 호박색과 테라코타 톤이 어우러진 도자기 커피잔 아이콘이 따뜻한 금빛 조명 아래 표현된 이미지가 생성된다.

### 쿨 톤 (Cool Tone)
- **영어 키워드**: `cool color tone`
- **설명**: 파랑, 청록, 보라 계열의 차분하고 시원한 색감으로, 테크·핀테크·헬스케어 앱의 신뢰감 있는 아이콘에 적합하다.
- **추천 키워드**: cool blue palette, icy cyan tones, cool color scheme, blue-violet hues, frosty cool colors
- **함께 쓰면 좋은 키워드**: glass material, metallic finish, soft blue lighting, futuristic style, glossy surface
- **피해야 할 키워드**: warm orange tones, sunset colors, fire imagery, amber glow
- **예시 프롬프트**: `glossy shield icon, glass and metallic material, cool color tone, blue and cyan gradient, soft blue lighting, futuristic style, dark background, ultra detailed render`
- **생성 예시 설명**: 파랑과 청록이 그라데이션된 유리질 금속 방패 아이콘이 어두운 배경에서 차가운 조명을 받는 이미지가 생성된다.

### 모노크롬 (Monochrome)
- **영어 키워드**: `monochrome color scheme`
- **설명**: 하나의 색상 계열을 명도 차이로만 표현하는 단색 톤으로, 세련되고 미니멀한 프로페셔널 브랜드 아이콘에 어울린다.
- **추천 키워드**: single hue palette, grayscale tones, monotone color scheme, black and white shading, one-color gradient
- **함께 쓰면 좋은 키워드**: flat design, subtle gradient, minimal line art, matte surface, clean typography
- **피해야 할 키워드**: multicolor, rainbow palette, colorful gradient, busy pattern
- **예시 프롬프트**: `flat line art camera icon, monochrome color scheme, single blue hue shading, subtle gradient, minimal clean design, white background, vector style render`
- **생성 예시 설명**: 하나의 파란색 계열 명암만으로 음영을 표현한 미니멀한 플랫 카메라 아이콘이 흰 배경에 놓인 이미지가 생성된다.

### 마카롱 컬러 (Macaron Color)
- **영어 키워드**: `macaron color palette`
- **설명**: 프랑스 마카롱처럼 파스텔보다 살짝 채도가 높은 달콤하고 부드러운 다채색 조합으로, 디저트·뷰티 브랜드 아이콘에 잘 어울린다.
- **추천 키워드**: soft macaron tones, sweet pastel palette, candy pastel hues, dessert color scheme, soft multicolor pastel
- **함께 쓰면 좋은 키워드**: glossy icing texture, soft studio lighting, rounded shapes, cream material, cute style
- **피해야 할 키워드**: dark moody tones, industrial colors, harsh contrast, neon colors
- **예시 프롬프트**: `glossy macaron-shaped icon set, macaron color palette, soft pink lavender and mint hues, cream icing texture, soft studio lighting, white background, high quality 3D render`
- **생성 예시 설명**: 분홍, 라벤더, 민트 색상이 달콤하게 조화된 광택 마카롱 모양 아이콘 세트가 흰 배경에 놓인 이미지가 생성된다.

### 캔디 컬러 (Candy Color)
- **영어 키워드**: `candy color palette`
- **설명**: 사탕처럼 밝고 광택 있는 원색 계열의 색감으로, 게임·키즈·엔터테인먼트 앱의 발랄한 아이콘에 적합하다.
- **추천 키워드**: glossy candy colors, bright candy hues, sweet saturated palette, bubblegum colors, playful candy tones
- **함께 쓰면 좋은 키워드**: glossy plastic material, glass reflection, bold outline, playful shapes, studio lighting
- **피해야 할 키워드**: matte muted tones, dark palette, desaturated colors, gritty texture
- **예시 프롬프트**: `glossy candy jar icon, glossy plastic material, candy color palette, bright pink yellow and blue, studio lighting, playful rounded shapes, white background, ultra sharp 3D render`
- **생성 예시 설명**: 분홍, 노랑, 파랑이 반짝이는 유리질 플라스틱 캔디 항아리 아이콘이 밝은 조명 아래 표현된 이미지가 생성된다.

### 어스 톤 (Earth Tone)
- **영어 키워드**: `earth tone palette`
- **설명**: 흙, 나무, 돌과 같은 자연에서 온 브라운·카키·올리브 계열의 색감으로, 친환경·유기농·아웃도어 브랜드 아이콘에 어울린다.
- **추천 키워드**: natural earthy hues, terracotta and olive tones, organic brown palette, sandstone colors, forest earth tones
- **함께 쓰면 좋은 키워드**: wood texture, matte clay material, natural sunlight, rustic style, stone surface
- **피해야 할 키워드**: neon colors, artificial glow, bright pastel, glossy metallic
- **예시 프롬프트**: `matte clay plant pot icon, earth tone palette, terracotta and olive green tones, wood texture base, natural soft sunlight, rustic style, plain background, high quality render`
- **생성 예시 설명**: 테라코타와 올리브 그린 톤의 매트한 점토 화분 아이콘이 나무 질감 받침 위에서 자연광을 받는 이미지가 생성된다.

### 오로라 (Aurora)
- **영어 키워드**: `aurora color gradient`
- **설명**: 초록, 보라, 파랑이 신비롭게 섞여 흐르는 오로라빛 그라데이션으로, 판타지·뮤직·크리에이티브 앱의 몽환적인 비주얼에 적합하다.
- **추천 키워드**: aurora borealis colors, iridescent gradient, holographic aurora tones, northern lights palette, dreamy aurora glow
- **함께 쓰면 좋은 키워드**: glass material, glowing light effect, night sky background, holographic texture, soft bloom lighting
- **피해야 할 키워드**: flat matte colors, daytime lighting, earthy tones, single solid color
- **예시 프롬프트**: `translucent glass orb icon, aurora color gradient, iridescent green purple and blue glow, holographic texture, soft bloom lighting, dark night background, ultra detailed 3D render`
- **생성 예시 설명**: 초록, 보라, 파랑이 신비롭게 빛나는 반투명 유리 구슬 아이콘이 어두운 배경에서 은은하게 발광하는 이미지가 생성된다.

### 그라데이션 (Gradient)
- **영어 키워드**: `smooth color gradient`
- **설명**: 두 가지 이상의 색이 자연스럽게 이어지며 변화하는 표현으로, 현대적이고 트렌디한 앱 아이콘이나 배경에 폭넓게 활용된다.
- **추천 키워드**: duotone gradient, smooth color blend, multi-color gradient fill, gradient mesh, diagonal gradient background
- **함께 쓰면 좋은 키워드**: glossy finish, soft shadow, flat vector design, modern UI style, subtle glow
- **피해야 할 키워드**: flat single color, harsh color banding, grayscale, textured noise
- **예시 프롬프트**: `flat vector chat bubble icon, smooth color gradient, purple to blue diagonal blend, glossy finish, soft shadow, modern UI style, white background, clean vector render`
- **생성 예시 설명**: 보라에서 파랑으로 부드럽게 이어지는 대각선 그라데이션의 광택 있는 채팅 말풍선 아이콘이 흰 배경에 놓인 이미지가 생성된다.

### 레인보우 (Rainbow)
- **영어 키워드**: `rainbow color spectrum`
- **설명**: 무지개처럼 다양한 색상이 순차적으로 배열된 화려한 색감으로, 창의성·다양성·축제 테마 아이콘에 어울린다.
- **추천 키워드**: full spectrum colors, multicolor rainbow palette, prism color gradient, vivid rainbow hues, colorful spectrum stripes
- **함께 쓰면 좋은 키워드**: glossy plastic material, glass prism effect, playful rounded shapes, bright studio lighting, bold outline style
- **피해야 할 키워드**: monochrome, muted tones, single color scheme, dark palette
- **예시 프롬프트**: `glossy prism icon, rainbow color spectrum, vivid full spectrum stripes, glass material, bright studio lighting, bold outline style, white background, high quality 3D render`
- **생성 예시 설명**: 무지개색 스펙트럼이 선명하게 표현된 유리 프리즘 아이콘이 밝은 조명 아래 흰 배경에 놓인 이미지가 생성된다.

### 럭셔리 골드 (Luxury Gold)
- **영어 키워드**: `luxury gold accent`
- **설명**: 금색 메탈릭 포인트가 강조된 고급스러운 색감으로, 프리미엄 브랜드, 뷰티, VIP 멤버십 아이콘에 적합하다.
- **추천 키워드**: metallic gold accent, polished gold finish, gold and black palette, opulent gold tone, brushed gold texture
- **함께 쓰면 좋은 키워드**: black marble background, glossy metallic material, dramatic studio lighting, elegant serif typography, velvet texture
- **피해야 할 키워드**: cheap plastic look, neon colors, cartoonish style, matte flat colors
- **예시 프롬프트**: `polished metallic gold crown icon, luxury gold accent, black marble background, dramatic studio lighting, glossy metallic material, elegant minimal composition, ultra detailed render`
- **생성 예시 설명**: 반짝이는 금속 금색 왕관 아이콘이 검은 대리석 배경 위에서 극적인 조명을 받아 고급스럽게 표현된 이미지가 생성된다.

### 미니멀 화이트 (Minimal White)
- **영어 키워드**: `minimal white palette`
- **설명**: 순백색 또는 오프화이트를 기반으로 한 극도로 절제된 색감으로, 클린한 UX/UI, 애플 스타일 제품 아이콘에 적합하다.
- **추천 키워드**: clean white palette, off-white minimal tones, soft white and gray, pure white background, subtle white shading
- **함께 쓰면 좋은 키워드**: soft studio lighting, matte ceramic material, minimal flat design, subtle drop shadow, negative space composition
- **피해야 할 키워드**: bold saturated colors, busy background, neon accents, heavy texture
- **예시 프롬프트**: `minimal ceramic vase icon, minimal white palette, pure white and soft gray shading, matte ceramic material, soft studio lighting, negative space composition, high resolution render`
- **생성 예시 설명**: 순백과 부드러운 회색 음영만으로 표현된 매트한 도자기 화병 아이콘이 여백이 넓은 구도로 표현된 이미지가 생성된다.

### 블랙 에디션 (Black Edition)
- **영어 키워드**: `black edition color scheme`
- **설명**: 블랙을 메인 컬러로 하고 포인트 색을 절제해서 사용하는 색감으로, 프리미엄 테크 제품이나 다크 모드 앱 아이콘에 적합하다.
- **추천 키워드**: matte black palette, deep black tones, black and silver accent, onyx black scheme, glossy black finish
- **함께 쓰면 좋은 키워드**: metallic accent, subtle rim lighting, dark studio background, glass material, minimal geometric shape
- **피해야 할 키워드**: bright pastel colors, high-key white background, candy colors, flat cartoon style
- **예시 프롬프트**: `glossy black smartphone icon, black edition color scheme, matte black body with silver accent, subtle rim lighting, dark studio background, minimal geometric composition, ultra detailed render`
- **생성 예시 설명**: 매트한 검정 바디에 은색 포인트가 들어간 스마트폰 아이콘이 어두운 스튜디오 배경에서 은은한 림 라이트를 받는 이미지가 생성된다.

## PART 07. Composition

### 플로팅 (Floating)
- **영어 키워드**: `floating object composition`
- **설명**: 오브젝트가 배경 위에 마치 중력 없이 떠 있는 듯한 구도로, 가볍고 역동적인 느낌을 주는 앱 아이콘이나 프로모션 이미지에 적합하다.
- **추천 키워드**: levitating object, weightless composition, hovering in air, suspended object, zero gravity effect
- **함께 쓰면 좋은 키워드**: soft drop shadow, glossy material, plain gradient background, soft studio lighting, subtle motion blur
- **피해야 할 키워드**: grounded object, heavy shadow, flat lying position, cluttered background
- **예시 프롬프트**: `glossy 3D headphone icon, floating object composition, hovering above soft gradient background, subtle soft shadow beneath, studio lighting, ultra detailed render`
- **생성 예시 설명**: 광택 있는 3D 헤드폰 아이콘이 부드러운 그라데이션 배경 위에 살짝 떠 있는 듯한 그림자와 함께 표현된 이미지가 생성된다.

### 센터 구도 (Center Composition)
- **영어 키워드**: `center composition`
- **설명**: 오브젝트를 프레임 정중앙에 배치하는 안정적이고 대칭적인 구도로, 로고나 앱 아이콘처럼 시선을 한곳에 집중시켜야 할 때 적합하다.
- **추천 키워드**: centered subject, symmetrical framing, middle alignment, balanced center layout, focal center composition
- **함께 쓰면 좋은 키워드**: plain background, soft even lighting, minimal negative space, flat design, subtle vignette
- **피해야 할 키워드**: off-center crop, cluttered composition, asymmetrical framing, busy background
- **예시 프롬프트**: `minimal leaf icon, center composition, centered subject with symmetrical framing, plain white background, soft even lighting, flat vector style, clean render`
- **생성 예시 설명**: 나뭇잎 아이콘이 프레임 정중앙에 대칭적으로 배치되어 여백이 넉넉한 흰 배경 위에 표현된 이미지가 생성된다.

### 정면 뷰 (Front View)
- **영어 키워드**: `front view angle`
- **설명**: 오브젝트를 정면에서 바라본 각도로, 형태와 디테일을 왜곡 없이 명확하게 전달해야 하는 제품 아이콘이나 UI 일러스트에 적합하다.
- **추천 키워드**: straight-on view, frontal angle, direct front perspective, head-on shot, flat frontal composition
- **함께 쓰면 좋은 키워드**: even studio lighting, plain background, symmetrical composition, flat design, subtle soft shadow
- **피해야 할 키워드**: side angle, dramatic perspective, tilted camera, extreme close-up
- **예시 프롬프트**: `3D alarm clock icon, front view angle, straight-on frontal composition, even studio lighting, plain background, subtle soft shadow, high quality render`
- **생성 예시 설명**: 알람 시계 아이콘이 정면에서 똑바로 바라본 각도로 균일한 조명 아래 표현된 이미지가 생성된다.

### 측면 뷰 (Side View)
- **영어 키워드**: `side view angle`
- **설명**: 오브젝트를 옆에서 바라본 프로필 구도로, 실루엣이나 단면 형태를 강조하고 싶은 제품 디자인 아이콘에 적합하다.
- **추천 키워드**: profile angle, lateral view, side profile shot, sideways perspective, silhouette side angle
- **함께 쓰면 좋은 키워드**: rim lighting, plain gradient background, glossy material, minimal composition, soft cast shadow
- **피해야 할 키워드**: front-facing view, top-down angle, symmetrical frontal composition, busy background
- **예시 프롬프트**: `glossy sneaker icon, side view angle, lateral profile composition, rim lighting, plain gradient background, soft cast shadow, ultra detailed 3D render`
- **생성 예시 설명**: 광택 있는 운동화 아이콘이 옆모습 실루엣이 뚜렷하게 드러나는 측면 구도로 표현된 이미지가 생성된다.

### 탑 뷰 (Top View)
- **영어 키워드**: `top view angle`
- **설명**: 오브젝트를 위에서 내려다보는 구도로, 배치나 레이아웃, 평면적 패턴을 강조해야 하는 플랫레이 스타일 아이콘에 적합하다.
- **추천 키워드**: bird's eye view, overhead shot, flat lay composition, top-down perspective, aerial angle
- **함께 쓰면 좋은 키워드**: soft even lighting, flat design, plain solid background, minimal shadow, symmetrical layout
- **피해야 할 키워드**: side angle, dramatic low angle, front view, deep perspective
- **예시 프롬프트**: `flat lay desk icon set, top view angle, overhead flat lay composition, soft even lighting, plain solid background, minimal shadow, clean vector render`
- **생성 예시 설명**: 책상 위 오브젝트들이 위에서 내려다본 플랫레이 구도로 배치되어 균일한 조명 아래 표현된 이미지가 생성된다.

### 원근 뷰 (Perspective View)
- **영어 키워드**: `perspective view angle`
- **설명**: 소실점을 활용해 입체감과 깊이감을 강조하는 각도로, 역동적이고 몰입감 있는 3D 아이콘이나 배너에 적합하다.
- **추천 키워드**: dramatic perspective, three-point perspective, deep depth composition, vanishing point angle, dynamic depth view
- **함께 쓰면 좋은 키워드**: dramatic studio lighting, glossy material, motion blur background, bold shadow, 3D render style
- **피해야 할 키워드**: flat orthographic view, straight-on front view, symmetrical top view, no depth composition
- **예시 프롬프트**: `3D rocket icon, perspective view angle, dramatic three-point perspective with deep depth, dynamic studio lighting, bold cast shadow, dark gradient background, ultra detailed render`
- **생성 예시 설명**: 로켓 아이콘이 소실점을 활용한 깊이감 있는 원근 구도로 극적인 조명을 받으며 표현된 이미지가 생성된다.

### 아이소메트릭 뷰 (Isometric View)
- **영어 키워드**: `isometric view illustration`
- **설명**: 왜곡 없이 3면을 동일한 각도로 보여주는 등각 투영 구도로, 인포그래픽이나 앱 온보딩 일러스트, 테크 아이콘에 널리 쓰인다.
- **추천 키워드**: isometric 3D illustration, axonometric projection, isometric grid style, technical isometric angle, 30 degree isometric view
- **함께 쓰면 좋은 키워드**: flat color palette, clean vector style, soft ambient lighting, geometric shapes, subtle gradient shading
- **피해야 할 키워드**: single-point perspective, front view, photorealistic depth of field, dramatic wide angle
- **예시 프롬프트**: `isometric office desk icon, isometric view illustration, clean vector style, flat color palette, soft ambient lighting, subtle gradient shading, plain background, sharp render`
- **생성 예시 설명**: 사무용 책상 오브젝트가 등각 투영 각도로 왜곡 없이 입체적으로 표현된 벡터 스타일 이미지가 생성된다.

### 히어로 샷 (Hero Shot)
- **영어 키워드**: `hero shot composition`
- **설명**: 주인공 오브젝트를 극적으로 강조해 시선을 압도적으로 집중시키는 구도로, 랜딩 페이지 메인 비주얼이나 광고 키비주얼에 적합하다.
- **추천 키워드**: dramatic hero composition, bold focal subject, spotlight hero shot, cinematic key visual, striking hero angle
- **함께 쓰면 좋은 키워드**: dramatic rim lighting, dark moody background, high contrast lighting, shallow depth of field, glossy material
- **피해야 할 키워드**: flat even lighting, cluttered background, small subject scale, plain daylight lighting
- **예시 프롬프트**: `glossy premium watch icon, hero shot composition, bold focal subject with dramatic rim lighting, dark moody background, high contrast cinematic lighting, ultra detailed render`
- **생성 예시 설명**: 광택 있는 프리미엄 시계가 어두운 배경 속에서 극적인 조명을 받으며 압도적으로 강조된 히어로 이미지가 생성된다.

### 프로덕트 샷 (Product Shot)
- **영어 키워드**: `product shot composition`
- **설명**: 상품의 형태와 질감을 정확하고 매력적으로 보여주는 카탈로그형 구도로, 이커머스 썸네일이나 상세페이지 이미지에 적합하다.
- **추천 키워드**: clean product photography, catalog style shot, studio product composition, e-commerce product angle, commercial product layout
- **함께 쓰면 좋은 키워드**: soft studio lighting, plain white background, subtle reflection, glossy material, sharp focus
- **피해야 할 키워드**: busy background, harsh shadow, motion blur, dramatic dark mood
- **예시 프롬프트**: `glossy perfume bottle icon, product shot composition, clean catalog style layout, soft studio lighting, plain white background, subtle reflection, sharp focus, high resolution render`
- **생성 예시 설명**: 향수병 오브젝트가 흰 배경 위에서 은은한 반사와 함께 깔끔한 카탈로그 스타일로 표현된 이미지가 생성된다.

### 클로즈업 (Close Up)
- **영어 키워드**: `close up shot`
- **설명**: 피사체의 특정 부분을 화면 가득 채워 디테일과 질감을 강조하는 구도로, 재질감이 중요한 프리미엄 제품 아이콘에 효과적이다.
- **추천 키워드**: tight close-up framing, detail shot, cropped close view, texture-focused close-up, zoomed-in composition
- **함께 쓰면 좋은 키워드**: shallow depth of field, soft directional lighting, glossy or matte texture detail, sharp focus, subtle bokeh background
- **피해야 할 키워드**: wide shot, full object view, distant framing, cluttered wide background
- **예시 프롬프트**: `close up shot of textured leather wallet corner, tight close-up framing, shallow depth of field, soft directional lighting, subtle bokeh background, ultra sharp detail render`
- **생성 예시 설명**: 가죽 지갑의 모서리 질감이 화면 가득 클로즈업되어 은은한 보케 배경과 함께 디테일하게 표현된 이미지가 생성된다.

### 매크로 (Macro)
- **영어 키워드**: `macro photography shot`
- **설명**: 아주 작은 피사체나 표면을 극도로 확대해 미세한 질감까지 드러내는 구도로, 재질/텍스처 강조나 자연물 아이콘에 적합하다.
- **추천 키워드**: extreme macro shot, micro detail photography, magnified texture view, super close macro lens, fine detail extreme close-up
- **함께 쓰면 좋은 키워드**: shallow depth of field, soft diffused lighting, high detail texture, natural material, subtle background blur
- **피해야 할 키워드**: wide angle shot, full scene view, flat vector style, low detail rendering
- **예시 프롬프트**: `macro photography shot of water droplet on leaf, extreme macro detail, shallow depth of field, soft diffused natural lighting, subtle background blur, ultra high detail render`
- **생성 예시 설명**: 나뭇잎 위 물방울이 극도로 확대되어 미세한 질감과 얕은 심도로 섬세하게 표현된 이미지가 생성된다.

### 다이나믹 앵글 (Dynamic Angle)
- **영어 키워드**: `dynamic angle composition`
- **설명**: 카메라를 기울이거나 극단적인 각도를 사용해 긴장감과 속도감을 부여하는 구도로, 스포츠, 게임, 액션 테마 아이콘에 적합하다.
- **추천 키워드**: tilted dutch angle, dramatic diagonal composition, dynamic low angle shot, energetic tilted framing, action-oriented angle
- **함께 쓰면 좋은 키워드**: motion blur, bold contrast lighting, dramatic shadow, glossy material, speed lines effect
- **피해야 할 키워드**: static symmetrical composition, flat front view, calm even lighting, centered still framing
- **예시 프롬프트**: `3D sports shoe icon, dynamic angle composition, tilted dutch angle with diagonal framing, motion blur effect, bold contrast lighting, dark background, high energy render`
- **생성 예시 설명**: 스포츠화 아이콘이 기울어진 다이나믹 앵글과 모션 블러 효과로 속도감 있게 표현된 이미지가 생성된다.

### 대칭 구도 (Symmetry)
- **영어 키워드**: `symmetrical composition`
- **설명**: 좌우 또는 상하가 거울처럼 균형을 이루는 구도로, 안정감과 신뢰감을 주는 로고, 엠블럼, 프레임형 아이콘에 적합하다.
- **추천 키워드**: mirrored symmetry, balanced symmetrical layout, axis symmetry composition, perfectly centered symmetry, bilateral symmetry
- **함께 쓰면 좋은 키워드**: even soft lighting, centered composition, minimal flat background, geometric shapes, clean line art
- **피해야 할 키워드**: asymmetrical layout, dynamic tilted angle, off-balance framing, chaotic composition
- **예시 프롬프트**: `flat emblem badge icon, symmetrical composition, mirrored bilateral symmetry, centered layout, even soft lighting, minimal flat background, clean vector render`
- **생성 예시 설명**: 좌우가 거울처럼 대칭을 이루는 엠블럼 배지 아이콘이 균일한 조명 아래 안정적으로 표현된 이미지가 생성된다.

### 삼분할 구도 (Rule of Thirds)
- **영어 키워드**: `rule of thirds composition`
- **설명**: 화면을 가로세로 3등분한 교차점에 피사체를 배치해 자연스러운 시각적 균형과 여백을 주는 구도로, 배너나 키비주얼 이미지에 적합하다.
- **추천 키워드**: off-center thirds placement, grid-based composition, asymmetrical balanced framing, thirds grid alignment, natural visual balance
- **함께 쓰면 좋은 키워드**: negative space background, soft directional lighting, shallow depth of field, minimal composition, subtle color contrast
- **피해야 할 키워드**: dead center composition, perfectly symmetrical framing, cluttered full-frame subject, busy background
- **예시 프롬프트**: `plant icon on windowsill, rule of thirds composition, subject placed at thirds grid intersection, soft directional lighting, negative space background, shallow depth of field, high quality render`
- **생성 예시 설명**: 창가의 식물 오브젝트가 삼분할 교차점에 배치되어 여백과 자연스러운 조명 속에서 균형 있게 표현된 이미지가 생성된다.

---

## PART 08. Background

### 화이트 배경 (White Background)
- **영어 키워드**: `white background`
- **설명**: 순백색 단색 배경으로, 제품 이미지나 이커머스 썸네일처럼 배경 노이즈 없이 오브젝트 자체를 강조하고 싶을 때 사용한다.
- **추천 키워드**: pure white background, plain white backdrop, seamless white background, white studio backdrop, clean white background
- **함께 쓰면 좋은 키워드**: Soft Shadow, Sharp Focus, Isolated Object, Commercial Asset
- **피해야 할 키워드**: Abstract Background, Gradient Background, dark background, cluttered background
- **예시 프롬프트**: `minimalist icon of a coffee cup, pure white background, soft shadow, sharp focus, commercial asset, 8k`
- **생성 예시 설명**: 순백 배경 위에 그림자만 은은하게 깔린, 깔끔한 커피컵 아이콘 이미지가 생성된다.

### 투명 배경 (Transparent Background)
- **영어 키워드**: `transparent background`
- **설명**: 배경이 없는 PNG 형태로 결과를 뽑아 아이콘, 로고, 스티커처럼 다른 레이어 위에 합성해야 하는 에셋에 적합하다.
- **추천 키워드**: transparent PNG, alpha channel background, cutout on transparent background, no background, isolated on transparent
- **함께 쓰면 좋은 키워드**: Clean Edge, Isolated Object, Sharp Focus, No Watermark
- **피해야 할 키워드**: Studio Background, Gradient Background, Reflection Floor, drop shadow on scene
- **예시 프롬프트**: `flat vector icon of a rocket, transparent background, clean edge, isolated object, no text, high resolution`
- **생성 예시 설명**: 배경 없이 로켓 아이콘만 깔끔하게 잘라낸 듯한 투명 PNG 스타일 이미지가 생성된다.

### 미니멀 배경 (Minimal Background)
- **영어 키워드**: `minimal background`
- **설명**: 불필요한 요소를 제거한 단순한 배경으로, 오브젝트에 시선이 집중되면서도 약간의 공간감이나 질감을 살리고 싶을 때 쓴다.
- **추천 키워드**: minimalist background, simple background, clean minimal backdrop, uncluttered background, negative space background
- **함께 쓰면 좋은 키워드**: Soft Shadow, Studio Background, Professional, High Quality
- **피해야 할 키워드**: Abstract Background, busy background, cluttered background, textured pattern background
- **예시 프롬프트**: `3D render of a wireless earbud case, minimal background, negative space, soft shadow, premium, ultra detailed`
- **생성 예시 설명**: 여백이 넉넉한 단순한 배경 위에 제품이 은은한 그림자와 함께 돋보이는 이미지가 생성된다.

### 스튜디오 배경 (Studio Background)
- **영어 키워드**: `studio background`
- **설명**: 사진 스튜디오에서 촬영한 듯한 균일한 조명과 배경으로, 제품 사진처럼 신뢰감 있는 프레젠테이션이 필요할 때 사용한다.
- **추천 키워드**: studio backdrop, photo studio background, seamless studio background, softbox lighting background, product photography background
- **함께 쓰면 좋은 키워드**: Soft Shadow, Reflection Floor, Sharp Focus, Commercial Asset
- **피해야 할 키워드**: Abstract Background, harsh outdoor lighting, cluttered background, noisy texture
- **예시 프롬프트**: `product shot of a smart watch, studio background, softbox lighting, reflection floor, sharp focus, professional, 8k`
- **생성 예시 설명**: 스튜디오 조명 아래 바닥에 살짝 반사되며 놓인 스마트워치 제품 컷 이미지가 생성된다.

### 그라디언트 배경 (Gradient Background)
- **영어 키워드**: `gradient background`
- **설명**: 두 가지 이상의 색이 부드럽게 이어지는 배경으로, 앱 아이콘이나 브랜드 비주얼처럼 생동감과 깊이감을 주고 싶을 때 사용한다.
- **추천 키워드**: smooth gradient background, duotone gradient backdrop, radial gradient background, soft color gradient, linear gradient background
- **함께 쓰면 좋은 키워드**: Clean Edge, High Quality, Premium, Sharp Focus
- **피해야 할 키워드**: White Background, Transparent Background, flat single color background, noisy texture
- **예시 프롬프트**: `app icon of a music note, purple to blue gradient background, smooth gradient, clean edge, premium, high resolution`
- **생성 예시 설명**: 보라에서 파랑으로 부드럽게 번지는 배경 위에 음표 아이콘이 놓인 앱 아이콘 스타일 이미지가 생성된다.

### 추상적 배경 (Abstract Background)
- **영어 키워드**: `abstract background`
- **설명**: 기하학적 도형이나 흐릿한 형태로 구성된 비구상적 배경으로, 배너나 히어로 이미지처럼 분위기와 무드를 강조할 때 적합하다.
- **추천 키워드**: abstract geometric background, blurred abstract shapes background, futuristic abstract background, fluid abstract background, bokeh abstract background
- **함께 쓰면 좋은 키워드**: Gradient Background, Soft Shadow, High Quality, Ultra Detailed
- **피해야 할 키워드**: White Background, Isolated Object, plain flat background, No Text (문구 배너인 경우 상충 가능)
- **예시 프롬프트**: `tech icon of a cloud server, abstract geometric background, futuristic gradient shapes, ultra detailed, 8k, sharp focus`
- **생성 예시 설명**: 기하학적 도형과 은은한 그라디언트가 어우러진 미래적인 배경 위에 클라우드 서버 아이콘이 배치된 이미지가 생성된다.

### 소프트 섀도우 (Soft Shadow)
- **영어 키워드**: `soft shadow`
- **설명**: 경계가 부드럽게 퍼지는 은은한 그림자로, 오브젝트가 배경에 자연스럽게 떠 있거나 놓여 있는 듯한 입체감을 줄 때 사용한다.
- **추천 키워드**: soft drop shadow, subtle diffused shadow, gentle ambient shadow, soft contact shadow, low opacity shadow
- **함께 쓰면 좋은 키워드**: White Background, Studio Background, Smooth Surface, Premium
- **피해야 할 키워드**: hard shadow, harsh dramatic shadow, no shadow, high contrast shadow
- **예시 프롬프트**: `minimalist icon of a perfume bottle, white background, soft shadow, smooth surface, premium, high quality`
- **생성 예시 설명**: 흰 배경 위에 향수병이 부드럽고 은은한 그림자와 함께 살짝 떠 있는 듯한 이미지가 생성된다.

### 반사 바닥 (Reflection Floor)
- **영어 키워드**: `reflection floor`
- **설명**: 오브젝트 아래 광택 있는 바닥에 흐릿하게 반사되는 이미지가 비치는 연출로, 프리미엄 제품 상세 이미지에 자주 쓰인다.
- **추천 키워드**: glossy reflection floor, mirror floor reflection, subtle reflection surface, polished floor reflection, reflective glass floor
- **함께 쓰면 좋은 키워드**: Studio Background, Soft Shadow, Premium, Sharp Focus
- **피해야 할 키워드**: matte flat background, Transparent Background, dry rough texture background, no shadow
- **예시 프롬프트**: `product render of a luxury perfume bottle, studio background, reflection floor, glossy surface, premium, ultra detailed, 8k`
- **생성 예시 설명**: 광택 있는 바닥에 은은하게 반사되어 비치는 고급스러운 향수병 제품 이미지가 생성된다.

### 플로팅 섀도우 (Floating Shadow)
- **영어 키워드**: `floating shadow`
- **설명**: 오브젝트가 바닥에 닿지 않고 공중에 떠 있는 것처럼 아래쪽에만 옅은 타원형 그림자를 배치하는 연출로, 앱 아이콘이나 3D 일러스트에 잘 어울린다.
- **추천 키워드**: floating drop shadow, hovering object shadow, levitating shadow effect, ellipse floating shadow, subtle floating shadow
- **함께 쓰면 좋은 키워드**: Transparent Background, Gradient Background, Isolated Object, Clean Edge
- **피해야 할 키워드**: Reflection Floor, hard contact shadow, grounded shadow, cluttered background
- **예시 프롬프트**: `3D icon of a gift box, transparent background, floating shadow, clean edge, isolated object, high resolution`
- **생성 예시 설명**: 배경 없이 선물 상자가 공중에 떠 있는 듯 옅은 타원형 그림자만 아래에 깔린 3D 아이콘 이미지가 생성된다.

## PART 09. Quality

### 고품질 (High Quality)
- **영어 키워드**: `high quality`
- **설명**: 결과물 전반의 완성도를 높여달라는 범용 품질 키워드로, 거의 모든 프롬프트에 기본적으로 넣는 것이 좋다.
- **추천 키워드**: high quality render, top quality, high fidelity, polished quality, refined quality
- **함께 쓰면 좋은 키워드**: Sharp Focus, Professional, Clean Edge, White Background
- **피해야 할 키워드**: Low Quality, Blurry, Noise, sketchy low effort style
- **예시 프롬프트**: `flat icon of a shopping cart, white background, high quality, sharp focus, clean edge, no text`
- **생성 예시 설명**: 선명하고 매끈하게 마감된 완성도 높은 쇼핑카트 아이콘 이미지가 생성된다.

### 초정밀 디테일 (Ultra Detailed)
- **영어 키워드**: `ultra detailed`
- **설명**: 표면 질감, 미세한 선, 재질감까지 촘촘하게 표현해달라는 키워드로, 복잡한 3D 오브젝트나 텍스처가 중요한 에셋에 적합하다.
- **추천 키워드**: highly detailed, intricate details, fine detail rendering, hyper detailed texture, elaborate detail
- **함께 쓰면 좋은 키워드**: 8K, Sharp Focus, Smooth Surface, Studio Background
- **피해야 할 키워드**: Minimal Background(과도한 디테일과 상충 가능), Blurry, Noise, flat simple style
- **예시 프롬프트**: `3D render of a mechanical watch gear, studio background, ultra detailed, sharp focus, 8k, smooth surface`
- **생성 예시 설명**: 톱니와 금속 질감까지 촘촘하게 표현된 정밀한 시계 부품 3D 렌더 이미지가 생성된다.

### 8K 해상도 (8K)
- **영어 키워드**: `8k`
- **설명**: 초고해상도 결과물을 유도하는 키워드로, 실제 8K 해상도를 만들어내진 않아도 디테일과 선명도를 끌어올리는 데 효과적이다.
- **추천 키워드**: 8k resolution, 8k uhd, ultra high resolution, 4k, high definition render
- **함께 쓰면 좋은 키워드**: Ultra Detailed, Sharp Focus, High Resolution, Professional
- **피해야 할 키워드**: Low Quality, Pixelated, Blurry, low resolution
- **예시 프롬프트**: `product render of a wireless headphone, studio background, 8k, ultra detailed, sharp focus, reflection floor`
- **생성 예시 설명**: 매우 선명하고 세밀하게 렌더링된 고해상도 헤드폰 제품 이미지가 생성된다.

### 고해상도 (High Resolution)
- **영어 키워드**: `high resolution`
- **설명**: 확대해도 뭉개지지 않는 선명한 결과물을 요청하는 키워드로, 인쇄물이나 대형 배너용 에셋에 특히 중요하다.
- **추천 키워드**: high res, crisp resolution, print quality resolution, high pixel density, ultra sharp resolution
- **함께 쓰면 좋은 키워드**: Sharp Focus, Clean Edge, Commercial Asset, 8K
- **피해야 할 키워드**: Pixelated, low resolution, Blurry, compressed artifact style
- **예시 프롬프트**: `logo icon of a mountain peak, white background, high resolution, clean edge, sharp focus, commercial asset`
- **생성 예시 설명**: 확대해도 선명함이 유지되는 고해상도의 산 모양 로고 아이콘 이미지가 생성된다.

### 선명한 초점 (Sharp Focus)
- **영어 키워드**: `sharp focus`
- **설명**: 오브젝트의 윤곽과 표면이 흐릿하지 않고 또렷하게 맺히도록 유도하는 키워드로, 제품 사진과 아이콘 모두에 기본으로 추천된다.
- **추천 키워드**: crisp focus, in focus, tack sharp, well-defined focus, precise focus
- **함께 쓰면 좋은 키워드**: High Quality, Clean Edge, Studio Background, High Resolution
- **피해야 할 키워드**: Blurry, soft focus blur, depth of field bokeh(의도치 않은 배경 흐림), Noise
- **예시 프롬프트**: `icon of a magnifying glass, transparent background, sharp focus, clean edge, high resolution, no watermark`
- **생성 예시 설명**: 윤곽선까지 또렷하게 맺힌 돋보기 아이콘이 투명 배경 위에 생성된다.

### 커머셜 에셋 (Commercial Asset)
- **영어 키워드**: `commercial asset`
- **설명**: 실제 서비스나 마케팅에 바로 사용할 수 있는 완성도와 라이선스 친화적인 톤을 요구하는 키워드로, 저작권 이슈가 있는 캐릭터나 스타일 모방을 피하도록 유도한다.
- **추천 키워드**: commercial use ready, brand-safe asset, marketing ready graphic, production ready asset, stock asset quality
- **함께 쓰면 좋은 키워드**: Professional, Clean Edge, No Watermark, High Quality
- **피해야 할 키워드**: Watermark, Signature, Logo(타사 로고 모방 위험), copyrighted character style
- **예시 프롬프트**: `flat icon set style illustration of a delivery box, white background, commercial asset, professional, no watermark, clean edge`
- **생성 예시 설명**: 워터마크나 저작권 이슈 없이 바로 서비스에 활용 가능한 깔끔한 배송 박스 아이콘 이미지가 생성된다.

### 프로페셔널 (Professional)
- **영어 키워드**: `professional`
- **설명**: 아마추어스럽지 않은 정돈되고 신뢰감 있는 톤을 요구하는 키워드로, 비즈니스용 아이콘이나 프레젠테이션 에셋에 적합하다.
- **추천 키워드**: professional quality, polished professional look, corporate style, business-grade graphic, refined professional finish
- **함께 쓰면 좋은 키워드**: Studio Background, Clean Edge, High Quality, Commercial Asset
- **피해야 할 키워드**: sketchy amateur style, messy composition, Noise, cartoonish childish style(용도에 따라 상충)
- **예시 프롬프트**: `icon of a handshake for business presentation, white background, professional, clean edge, high quality, sharp focus`
- **생성 예시 설명**: 비즈니스 프레젠테이션에 바로 쓸 수 있을 만큼 정돈되고 신뢰감 있는 악수 아이콘 이미지가 생성된다.

### 프리미엄 (Premium)
- **영어 키워드**: `premium`
- **설명**: 고급스럽고 값비싸 보이는 마감을 요구하는 키워드로, 명품 제품 컷이나 고급 브랜드 비주얼에 적합하다.
- **추천 키워드**: luxury finish, premium quality look, high-end aesthetic, elegant premium style, upscale finish
- **함께 쓰면 좋은 키워드**: Reflection Floor, Soft Shadow, Studio Background, Ultra Detailed
- **피해야 할 키워드**: cheap plastic look, low quality, cluttered background, cartoonish style
- **예시 프롬프트**: `product render of a gold wristwatch, studio background, reflection floor, premium, ultra detailed, soft shadow, 8k`
- **생성 예시 설명**: 반사 바닥과 은은한 그림자 위에서 고급스럽게 빛나는 금색 손목시계 제품 이미지가 생성된다.

### 깔끔한 외곽선 (Clean Edge)
- **영어 키워드**: `clean edge`
- **설명**: 오브젝트 경계선이 삐뚤거리거나 번지지 않고 매끈하게 정리되도록 유도하는 키워드로, 벡터 아이콘이나 로고 제작에 필수적이다.
- **추천 키워드**: crisp edges, clean outline, smooth vector edges, precise edge lines, well-defined outline
- **함께 쓰면 좋은 키워드**: Isolated Object, Transparent Background, Sharp Focus, No Text
- **피해야 할 키워드**: rough sketchy edges, Blurry, Noise, jagged edges
- **예시 프롬프트**: `flat vector icon of a paper airplane, transparent background, clean edge, isolated object, no text, high resolution`
- **생성 예시 설명**: 경계선이 매끈하고 정확하게 정리된 종이비행기 벡터 아이콘 이미지가 생성된다.

### 매끄러운 표면 (Smooth Surface)
- **영어 키워드**: `smooth surface`
- **설명**: 표면에 거친 질감이나 요철 없이 매끈하게 마감되도록 유도하는 키워드로, 3D 렌더 오브젝트나 유리·플라스틱 재질에 잘 맞는다.
- **추천 키워드**: glossy smooth finish, seamless smooth texture, polished smooth surface, matte smooth finish, silky smooth texture
- **함께 쓰면 좋은 키워드**: Soft Shadow, Premium, Ultra Detailed, Studio Background
- **피해야 할 키워드**: rough texture, grainy surface, Noise, cracked weathered surface
- **예시 프롬프트**: `3D render of a ceramic mug, studio background, smooth surface, soft shadow, premium, sharp focus`
- **생성 예시 설명**: 표면이 매끈하고 반질반질하게 마감된 도자기 머그컵 3D 렌더 이미지가 생성된다.

### 독립 오브젝트 (Isolated Object)
- **영어 키워드**: `isolated object`
- **설명**: 오브젝트 하나만 배경 요소 없이 화면 중앙에 독립적으로 배치되도록 유도하는 키워드로, 아이콘 세트나 카탈로그 이미지 제작에 유용하다.
- **추천 키워드**: single isolated subject, standalone object, centered isolated item, object cutout, subject only composition
- **함께 쓰면 좋은 키워드**: White Background, Transparent Background, Clean Edge, Sharp Focus
- **피해야 할 키워드**: Abstract Background, multiple objects scene, cluttered composition, busy background
- **예시 프롬프트**: `icon of a single sneaker, white background, isolated object, clean edge, sharp focus, high quality`
- **생성 예시 설명**: 다른 요소 없이 운동화 하나만 화면 중앙에 독립적으로 배치된 이미지가 생성된다.

### 텍스트 없음 (No Text)
- **영어 키워드**: `no text`
- **설명**: 이미지 안에 원치 않는 글자, 숫자, 문자가 생기지 않도록 억제하는 키워드로, 아이콘이나 로고처럼 순수 그래픽만 필요한 경우에 필수적이다.
- **추천 키워드**: without text, no typography, no lettering, no captions, text-free image
- **함께 쓰면 좋은 키워드**: Clean Edge, Isolated Object, No Watermark, Commercial Asset
- **피해야 할 키워드**: Text(네거티브 사전 항목, 프롬프트 본문에서는 상충), signage with words, label with writing
- **예시 프롬프트**: `flat icon of a calendar, transparent background, no text, clean edge, isolated object, high resolution`
- **생성 예시 설명**: 날짜 숫자나 요일 글자 없이 순수 그래픽 형태로만 표현된 달력 아이콘 이미지가 생성된다.

### 워터마크 없음 (No Watermark)
- **영어 키워드**: `no watermark`
- **설명**: 생성 플랫폼의 로고나 워터마크가 이미지에 섞여 들어가지 않도록 방지하는 키워드로, 상업적으로 활용할 에셋에는 거의 필수로 넣어야 한다.
- **추천 키워드**: without watermark, watermark-free, no stamp overlay, unbranded image, clean unmarked image
- **함께 쓰면 좋은 키워드**: Commercial Asset, No Text, Professional, Clean Edge
- **피해야 할 키워드**: Watermark(네거티브 사전 항목, 본문 상충), branded stamp, signature overlay
- **예시 프롬프트**: `icon set illustration of a folder, white background, no watermark, no text, professional, commercial asset`
- **생성 예시 설명**: 플랫폼 로고나 워터마크 없이 깨끗하게 상업적으로 바로 쓸 수 있는 폴더 아이콘 이미지가 생성된다.


---

## PART 10. Object Library

### Shopping

#### 쿠폰 (Coupon)
- **영어 키워드**: `coupon`
- **설명**: 할인 이벤트, 쿠폰팩 다운로드, 프로모션 배너 등에서 혜택을 상징하는 오브젝트로 자주 쓰인다.
- **추천 프롬프트**: perforated edge, dashed cut line, percentage discount stamp, folded paper texture, torn ticket stub
- **잘 어울리는 재질**: matte paper, glossy cardstock, thin foil
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, flat illustration, isometric
- **함께 쓰면 좋은 키워드**: pastel background, vibrant red and yellow palette, floating composition, drop shadow, minimal background
- **피해야 할 키워드**: photorealistic human hand, cluttered background, dark moody lighting
- **예시 완성 프롬프트**: `3D icon of a coupon with perforated edge and percentage discount stamp, matte paper texture, soft studio lighting, floating at center on pastel yellow background, vibrant red accent color, clean minimal composition, high quality render, 4k`
- **생성 예시 설명**: 노란색 배경 위에 둥둥 떠 있는 귀여운 3D 쿠폰 아이콘으로, 할인율 도장이 선명하게 찍힌 이벤트 배너용 이미지가 생성된다.

#### 쿠폰 티켓 (Coupon Ticket)
- **영어 키워드**: `coupon ticket`
- **설명**: 영화관람권, 상품권 스타일의 긴 직사각형 티켓으로 멤버십 혜택이나 적립 이벤트 디자인에 활용된다.
- **추천 프롬프트**: ticket stub with tear line, barcode strip, ribbon perforation, rounded corners, embossed border
- **잘 어울리는 재질**: glossy cardstock, holographic foil, matte paper
- **추천 조명**: soft studio lighting, rim light
- **추천 스타일**: 3D icon, isometric, flat illustration
- **함께 쓰면 좋은 키워드**: gradient background, gold accent, floating composition, subtle shadow
- **피해야 할 키워드**: crumpled texture, dark grungy background, blurry text
- **예시 완성 프롬프트**: `3D icon of a coupon ticket with tear line and barcode strip, glossy cardstock texture with gold embossed border, soft studio lighting, floating on gradient purple background, clean composition, high detail, 4k render`
- **생성 예시 설명**: 금색 테두리가 반짝이는 고급스러운 티켓형 쿠폰이 보라색 그라디언트 배경 위에 떠 있는 이미지가 만들어진다.

#### 선물 상자 (Gift Box)
- **영어 키워드**: `gift box`
- **설명**: 이벤트, 시즌 프로모션, 사은품 증정 배너에서 가장 널리 쓰이는 대표적인 축하 오브젝트다.
- **추천 프롬프트**: wrapped in ribbon, bow on top, glossy wrapping paper, layered lid, sparkle accents
- **잘 어울리는 재질**: glossy wrapping paper, satin ribbon, matte cardboard
- **추천 조명**: soft studio lighting, warm rim light
- **추천 스타일**: 3D icon, cute chibi style, isometric
- **함께 쓰면 좋은 키워드**: pastel pink background, confetti scatter, floating composition, warm color palette
- **피해야 할 키워드**: torn wrapping paper, dark horror tone, messy background
- **예시 완성 프롬프트**: `3D icon of a gift box wrapped in glossy pink wrapping paper with a satin bow on top, sparkle accents around it, soft studio lighting with warm rim light, floating on pastel gradient background, cute rounded style, high quality, 4k`
- **생성 예시 설명**: 리본 매듭이 달린 반짝이는 핑크색 선물상자가 파스텔 배경 위에서 은은한 광택을 내는 귀여운 3D 아이콘이 생성된다.

#### 쇼핑백 (Shopping Bag)
- **영어 키워드**: `shopping bag`
- **설명**: 온라인 쇼핑, 세일 프로모션, 장바구니 유도 배너에서 구매 행동을 상징하는 핵심 오브젝트다.
- **추천 프롬프트**: paper handle bag, folded top, glossy sheen, brand-blank label, tissue paper peeking out
- **잘 어울리는 재질**: matte kraft paper, glossy paper, canvas fabric
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, flat illustration, isometric
- **함께 쓰면 좋은 키워드**: vibrant background, floating composition, drop shadow, minimal clean background
- **피해야 할 키워드**: torn paper texture, cluttered street background, realistic logo branding
- **예시 완성 프롬프트**: `3D icon of a shopping bag with paper handles and tissue paper peeking out, glossy paper texture, soft studio lighting, floating on vibrant coral background, drop shadow beneath, clean minimal composition, 4k render`
- **생성 예시 설명**: 손잡이가 달린 광택 있는 쇼핑백이 코랄색 배경 위에 그림자와 함께 떠 있는 심플한 3D 아이콘이 만들어진다.

#### 배송 박스 (Delivery Box)
- **영어 키워드**: `delivery box`
- **설명**: 무료배송, 빠른 배송 이벤트 배너에서 물류와 배송 완료를 시각적으로 전달하는 오브젝트다.
- **추천 프롬프트**: cardboard texture, packing tape seal, fragile stamp, address label, rounded edges
- **잘 어울리는 재질**: corrugated cardboard, matte tape, kraft paper
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, isometric, cute rounded style
- **함께 쓰면 좋은 키워드**: light blue background, motion lines, floating composition, minimal shadow
- **피해야 할 키워드**: dirty damaged box, dark warehouse background, torn cardboard
- **예시 완성 프롬프트**: `3D icon of a delivery box with cardboard texture and packing tape seal, address label on side, soft studio lighting, floating on light blue background with subtle motion lines, clean isometric composition, high detail, 4k`
- **생성 예시 설명**: 테이프로 봉해진 골판지 배송 박스가 하늘색 배경 위에서 움직임을 암시하는 라인과 함께 떠 있는 이미지가 생성된다.

#### 소포/패키지 (Package)
- **영어 키워드**: `package`
- **설명**: 배송 박스보다 넓은 의미로, 정기구독 상품이나 언박싱 콘텐츠 배너에 자주 쓰이는 포장 상자다.
- **추천 프롬프트**: wrapped brown paper, string tied bow, stamped postmark, layered box, ribbon accent
- **잘 어울리는 재질**: kraft paper, matte cardboard, twine string
- **추천 조명**: soft studio lighting, warm ambient light
- **추천 스타일**: 3D icon, flat illustration, isometric
- **함께 쓰면 좋은 키워드**: warm beige background, floating composition, soft shadow, cozy color palette
- **피해야 할 키워드**: dirty stained paper, cluttered background, harsh neon lighting
- **예시 완성 프롬프트**: `3D icon of a package wrapped in kraft paper tied with twine bow, stamped postmark on top, soft studio lighting with warm ambient glow, floating on cozy beige background, clean composition, high quality render, 4k`
- **생성 예시 설명**: 끈으로 묶인 크래프트지 소포가 따뜻한 베이지 배경 위에 떠 있는 아늑한 느낌의 3D 아이콘이 생성된다.

#### 할인 태그 (Discount Tag)
- **영어 키워드**: `discount tag`
- **설명**: 세일 퍼센트를 표시하는 걸이형 태그로 배너의 코너 장식이나 강조 요소로 많이 사용된다.
- **추천 프롬프트**: hanging string tag, percentage sign cutout, rounded corner, embossed border, small hole punch
- **잘 어울리는 재질**: matte cardstock, glossy paper, thin metal foil
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, flat illustration, isometric
- **함께 쓰면 좋은 키워드**: red and white palette, floating composition, drop shadow, minimal background
- **피해야 할 키워드**: crumpled texture, busy cluttered scene, dark gritty tone
- **예시 완성 프롬프트**: `3D icon of a discount tag hanging from a string with percentage sign cutout, matte cardstock texture with embossed border, soft studio lighting, floating on clean white background, subtle drop shadow, high detail, 4k render`
- **생성 예시 설명**: 끈에 매달린 퍼센트 표시 할인 태그가 흰 배경 위에서 그림자와 함께 깔끔하게 떠 있는 아이콘이 만들어진다.

#### 가격표 (Price Tag)
- **영어 키워드**: `price tag`
- **설명**: 상품 가격이나 정가/할인가 비교를 표시할 때 쓰이는 라벨형 오브젝트다.
- **추천 프롬프트**: attached string loop, small perforated hole, clean label surface, rounded rectangle shape, subtle fold crease
- **잘 어울리는 재질**: matte cardstock, glossy paper, thin cotton string
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, flat illustration, minimal style
- **함께 쓰면 좋은 키워드**: soft pastel background, floating composition, minimal shadow, clean layout
- **피해야 할 키워드**: distressed torn paper, cluttered busy background, heavy texture noise
- **예시 완성 프롬프트**: `3D icon of a price tag with string loop and clean label surface, matte cardstock texture, soft studio lighting, floating on soft mint pastel background, minimal shadow, clean simple composition, 4k render`
- **생성 예시 설명**: 끈으로 연결된 심플한 가격표가 민트색 배경 위에 깔끔하게 떠 있는 미니멀한 3D 아이콘이 생성된다.

#### 영수증 (Receipt)
- **영어 키워드**: `receipt`
- **설명**: 결제 완료, 구매 내역 확인 등 실용적인 결제 관련 화면에서 사용되는 오브젝트다.
- **추천 프롬프트**: curled paper edge, thermal paper texture, printed line pattern, zigzag torn bottom, rolled top
- **잘 어울리는 재질**: thin thermal paper, matte paper
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, flat illustration, isometric
- **함께 쓰면 좋은 키워드**: light gray background, floating composition, soft shadow, minimal clean look
- **피해야 할 키워드**: crumpled dirty paper, dark background, illegible blurry text
- **예시 완성 프롬프트**: `3D icon of a receipt with curled thermal paper texture and zigzag torn bottom edge, printed line pattern, soft studio lighting, floating on light gray background, subtle soft shadow, clean minimal composition, 4k`
- **생성 예시 설명**: 지그재그로 잘린 영수증이 살짝 말린 형태로 회색 배경 위에 떠 있는 깔끔한 3D 아이콘이 생성된다.

#### 지갑 (Wallet)
- **영어 키워드**: `wallet`
- **설명**: 결제 수단, 자산 관리, 포인트 적립 등 금융 관련 콘텐츠에서 자주 쓰이는 오브젝트다.
- **추천 프롬프트**: folded leather texture, stitched edge, card slot detail, snap button closure, slightly open flap
- **잘 어울리는 재질**: matte leather, stitched fabric, glossy synthetic leather
- **추천 조명**: soft studio lighting, warm rim light
- **추천 스타일**: 3D icon, isometric, realistic product render
- **함께 쓰면 좋은 키워드**: neutral background, floating composition, soft shadow, warm color palette
- **피해야 할 키워드**: worn scratched texture, cluttered dark background, cheap plastic look
- **예시 완성 프롬프트**: `3D icon of a folded wallet with stitched leather texture and card slot detail, soft studio lighting with warm rim light, floating on neutral beige background, subtle soft shadow, high quality product render, 4k`
- **생성 예시 설명**: 스티치 디테일이 살아있는 가죽 지갑이 베이지 배경 위에 은은하게 떠 있는 고급스러운 3D 아이콘이 만들어진다.

#### 신용카드 (Credit Card)
- **영어 키워드**: `credit card`
- **설명**: 결제, 간편결제, 멤버십 카드 등 핀테크 및 결제 UI 콘텐츠에 사용되는 오브젝트다.
- **추천 프롬프트**: glossy plastic surface, embossed number pattern, rounded corners, chip detail, slight tilt angle
- **잘 어울리는 재질**: glossy plastic, matte metal, holographic foil
- **추천 조명**: soft studio lighting, specular highlight
- **추천 스타일**: 3D icon, isometric, realistic product render
- **함께 쓰면 좋은 키워드**: gradient background, floating composition, soft shadow, futuristic color palette
- **피해야 할 키워드**: scratched worn surface, cluttered background, visible real card numbers
- **예시 완성 프롬프트**: `3D icon of a credit card with glossy plastic surface and embossed chip detail, tilted at a slight angle, soft studio lighting with specular highlight, floating on gradient blue-purple background, clean modern composition, 4k render`
- **생성 예시 설명**: 살짝 기울어진 채 반짝이는 신용카드가 블루-퍼플 그라디언트 배경 위에 떠 있는 세련된 3D 아이콘이 생성된다.

#### 동전 (Coin)
- **영어 키워드**: `coin`
- **설명**: 포인트, 적립금, 캐시백 이벤트에서 화폐 가치를 상징적으로 표현할 때 쓰이는 오브젝트다.
- **추천 프롬프트**: metallic gold surface, embossed emblem, stacked coins, shiny reflective edge, subtle engraving
- **잘 어울리는 재질**: polished gold metal, brushed silver metal, bronze metal
- **추천 조명**: studio lighting with specular highlight, warm rim light
- **추천 스타일**: 3D icon, isometric, realistic metallic render
- **함께 쓰면 좋은 키워드**: dark background for contrast, floating composition, glow effect, sparkle accents
- **피해야 할 키워드**: dull matte metal, tarnished rusty texture, flat lighting without highlights
- **예시 완성 프롬프트**: `3D icon of a stack of gold coins with polished metallic surface and embossed emblem, studio lighting with strong specular highlight and warm rim light, floating on dark navy background, subtle glow and sparkle accents, high detail, 4k render`
- **생성 예시 설명**: 반짝이는 금색 동전 더미가 짙은 네이비 배경 위에서 광채를 내며 떠 있는 프리미엄한 3D 아이콘이 생성된다.

#### 쇼핑카트 (Shopping Cart)
- **영어 키워드**: `shopping cart`
- **설명**: 장바구니 담기, 결제 유도 버튼 등 이커머스 UI에서 가장 대표적으로 쓰이는 오브젝트다.
- **추천 프롬프트**: metal wire basket, rubber wheels, glossy handle bar, items overflowing, rounded plastic frame
- **잘 어울리는 재질**: brushed metal, glossy plastic, rubber
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, isometric, cute rounded style
- **함께 쓰면 좋은 키워드**: vibrant background, floating composition, soft shadow, playful color palette
- **피해야 할 키워드**: rusty dirty metal, cluttered supermarket background, broken wheels
- **예시 완성 프롬프트**: `3D icon of a shopping cart with glossy plastic frame and metal wire basket, small gift boxes overflowing inside, soft studio lighting, floating on vibrant orange background, playful rounded style, subtle shadow, high quality, 4k`
- **생성 예시 설명**: 선물 상자가 넘칠 듯 담긴 귀여운 쇼핑카트가 주황색 배경 위에 떠 있는 발랄한 3D 아이콘이 생성된다.

### Office

#### 노트 (Notebook)
- **영어 키워드**: `notebook`
- **설명**: 필기, 학습, 업무 툴 소개 콘텐츠에서 기록과 정리를 상징하는 오브젝트다.
- **추천 프롬프트**: spiral binding, ruled paper edge, hardcover surface, bookmark ribbon, slightly open pages
- **잘 어울리는 재질**: matte cardboard cover, textured paper, cloth binding
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, flat illustration, isometric
- **함께 쓰면 좋은 키워드**: pastel background, floating composition, soft shadow, minimal clean look
- **피해야 할 키워드**: torn crumpled pages, cluttered messy desk background, dark gloomy tone
- **예시 완성 프롬프트**: `3D icon of a notebook with spiral binding and slightly open ruled pages, matte cardboard cover with bookmark ribbon, soft studio lighting, floating on pastel lavender background, clean minimal composition, high detail, 4k`
- **생성 예시 설명**: 스프링 제본된 노트가 살짝 펼쳐진 채 라벤더색 배경 위에 떠 있는 깔끔한 3D 아이콘이 생성된다.

#### 플래너 (Planner)
- **영어 키워드**: `planner`
- **설명**: 일정 관리, 목표 설정 앱이나 생산성 콘텐츠에서 계획성을 표현하는 오브젝트다.
- **추천 프롬프트**: monthly grid layout, tabbed page divider, elastic band closure, hardcover binding, pen loop detail
- **잘 어울리는 재질**: matte leather cover, textured paper, elastic fabric band
- **추천 조명**: soft studio lighting, warm ambient light
- **추천 스타일**: 3D icon, isometric, flat illustration
- **함께 쓰면 좋은 키워드**: warm neutral background, floating composition, soft shadow, cozy color palette
- **피해야 할 키워드**: cluttered chaotic layout, torn pages, dark harsh lighting
- **예시 완성 프롬프트**: `3D icon of a planner with monthly grid layout and elastic band closure, matte leather cover texture, soft studio lighting with warm ambient glow, floating on warm beige background, clean composition, high quality, 4k render`
- **생성 예시 설명**: 월간 달력이 보이는 플래너가 베이지 배경 위에 아늑한 조명과 함께 떠 있는 3D 아이콘이 만들어진다.

#### 다이어리 (Diary)
- **영어 키워드**: `diary`
- **설명**: 개인 기록, 감성적인 굿즈 소개 콘텐츠에서 아기자기한 느낌을 전달하는 오브젝트다.
- **추천 프롬프트**: lock clasp detail, floral embossed cover, ribbon bookmark, small key charm, soft rounded corners
- **잘 어울리는 재질**: matte fabric cover, embossed leather, soft velvet texture
- **추천 조명**: soft studio lighting, warm dreamy light
- **추천 스타일**: 3D icon, cute chibi style, flat illustration
- **함께 쓰면 좋은 키워드**: pastel pink background, floating composition, soft shadow, dreamy color palette
- **피해야 할 키워드**: dark gothic texture, cluttered background, harsh cold lighting
- **예시 완성 프롬프트**: `3D icon of a diary with lock clasp and floral embossed cover, soft velvet texture with ribbon bookmark, soft studio lighting with warm dreamy glow, floating on pastel pink background, cute rounded style, high detail, 4k`
- **생성 예시 설명**: 자물쇠 장식이 달린 벨벳 다이어리가 파스텔 핑크 배경 위에서 몽환적으로 떠 있는 귀여운 3D 아이콘이 생성된다.

#### 달력 (Calendar)
- **영어 키워드**: `calendar`
- **설명**: 일정 안내, 이벤트 기간 표시, 예약 관련 콘텐츠에서 날짜를 시각화하는 오브젝트다.
- **추천 프롬프트**: hanging wall calendar, spiral top binding, grid page layout, marked date circle, small hook detail
- **잘 어울리는 재질**: matte paper, thin cardboard, metal spiral wire
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, isometric, flat illustration
- **함께 쓰면 좋은 키워드**: clean background, floating composition, soft shadow, minimal color palette
- **피해야 할 키워드**: cluttered handwriting scribbles, dark moody background, torn pages
- **예시 완성 프롬프트**: `3D icon of a wall calendar with spiral top binding and marked date circle, matte paper texture, soft studio lighting, floating on clean white background, minimal shadow, high detail render, 4k`
- **생성 예시 설명**: 특정 날짜에 동그라미 표시가 된 벽걸이 달력이 흰 배경 위에 깔끔하게 떠 있는 3D 아이콘이 생성된다.

#### 메모 (Memo)
- **영어 키워드**: `memo`
- **설명**: 짧은 안내 문구, 공지사항, 알림 콘텐츠에서 간단한 메시지를 전달하는 오브젝트다.
- **추천 프롬프트**: folded paper note, pinned corner, handwritten line pattern, small paperclip, torn notepad edge
- **잘 어울리는 재질**: matte paper, thin cardstock
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, flat illustration, minimal style
- **함께 쓰면 좋은 키워드**: soft pastel background, floating composition, minimal shadow, clean layout
- **피해야 할 키워드**: crumpled dirty paper, cluttered background, illegible scribbles
- **예시 완성 프롬프트**: `3D icon of a folded memo note with pinned corner and small paperclip, matte paper texture, soft studio lighting, floating on soft yellow pastel background, minimal clean composition, high quality, 4k render`
- **생성 예시 설명**: 클립으로 고정된 메모지가 연노랑 배경 위에 깔끔하게 떠 있는 심플한 3D 아이콘이 생성된다.

#### 포스트잇 (Sticky Note)
- **영어 키워드**: `sticky note`
- **설명**: 할 일 목록, 알림, 팁 안내 등 짧고 캐주얼한 정보 전달에 자주 쓰이는 오브젝트다.
- **추천 프롬프트**: curled peeling corner, square pad shape, adhesive edge strip, stacked layers, soft pastel color block
- **잘 어울리는 재질**: matte paper, thin adhesive paper
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, cute rounded style, flat illustration
- **함께 쓰면 좋은 키워드**: colorful background, floating composition, soft shadow, playful color palette
- **피해야 할 키워드**: dirty crumpled texture, dark heavy background, cluttered messy stack
- **예시 완성 프롬프트**: `3D icon of a stack of sticky notes with curled peeling corner, pastel yellow and pink color blocks, soft studio lighting, floating on light gray background, playful cute style, subtle shadow, high detail, 4k`
- **생성 예시 설명**: 모서리가 살짝 말린 파스텔톤 포스트잇 뭉치가 연회색 배경 위에 귀엽게 떠 있는 3D 아이콘이 생성된다.

#### 클립보드 (Clipboard)
- **영어 키워드**: `clipboard`
- **설명**: 체크리스트, 설문, 업무 관리 콘텐츠에서 서류 작업을 상징하는 오브젝트다.
- **추천 프롬프트**: metal clip holder, attached checklist paper, checkmark icons, wood board texture, pen attached with string
- **잘 어울리는 재질**: matte wood, brushed metal clip, matte paper
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, isometric, flat illustration
- **함께 쓰면 좋은 키워드**: clean background, floating composition, soft shadow, minimal color palette
- **피해야 할 키워드**: cluttered handwriting mess, dark grungy texture, rusty metal clip
- **예시 완성 프롬프트**: `3D icon of a clipboard with metal clip holder and checklist paper showing checkmarks, matte wood board texture, soft studio lighting, floating on light blue background, clean minimal composition, high detail, 4k render`
- **생성 예시 설명**: 체크리스트가 끼워진 클립보드가 하늘색 배경 위에 깔끔하게 떠 있는 3D 아이콘이 생성된다.

#### 볼펜 (Pen)
- **영어 키워드**: `pen`
- **설명**: 서명, 필기, 계약 관련 콘텐츠에서 실용적인 문구류 오브젝트로 쓰인다.
- **추천 프롬프트**: glossy plastic body, metal clip detail, tapered tip, diagonal angle, subtle reflection highlight
- **잘 어울리는 재질**: glossy plastic, brushed metal, matte rubber grip
- **추천 조명**: soft studio lighting, specular highlight
- **추천 스타일**: 3D icon, isometric, realistic product render
- **함께 쓰면 좋은 키워드**: clean background, floating composition, soft shadow, minimal color palette
- **피해야 할 키워드**: ink stains and smudges, cluttered background, scratched worn texture
- **예시 완성 프롬프트**: `3D icon of a pen with glossy plastic body and metal clip detail, positioned at a diagonal angle, soft studio lighting with specular highlight, floating on clean white background, minimal shadow, high quality render, 4k`
- **생성 예시 설명**: 대각선으로 배치된 광택 있는 볼펜이 흰 배경 위에서 하이라이트와 함께 떠 있는 심플한 3D 아이콘이 생성된다.

#### 연필 (Pencil)
- **영어 키워드**: `pencil`
- **설명**: 학습, 스케치, 창작 관련 콘텐츠에서 캐주얼하고 친근한 느낌을 전달하는 오브젝트다.
- **추천 프롬프트**: wood grain texture, sharpened tip, eraser cap, hexagonal body, painted yellow surface
- **잘 어울리는 재질**: matte wood, painted lacquer surface, rubber eraser
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, cute rounded style, flat illustration
- **함께 쓰면 좋은 키워드**: pastel background, floating composition, soft shadow, playful color palette
- **피해야 할 키워드**: broken tip, cluttered background, dirty smudged texture
- **예시 완성 프롬프트**: `3D icon of a pencil with wood grain texture and sharpened tip, painted yellow hexagonal body with pink eraser cap, soft studio lighting, floating on pastel mint background, cute playful style, subtle shadow, 4k render`
- **생성 예시 설명**: 노란색 연필이 뾰족하게 깎인 채 민트색 배경 위에 귀엽게 떠 있는 3D 아이콘이 생성된다.

#### 마카/마커 (Marker)
- **영어 키워드**: `marker`
- **설명**: 강조, 색칠, 아이디어 노트 관련 콘텐츠에서 다채로운 색감을 표현하는 오브젝트다.
- **추천 프롬프트**: matte plastic barrel, chisel tip, cap slightly off, colorful ink cap, glossy highlight
- **잘 어울리는 재질**: matte plastic, glossy plastic cap
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, isometric, flat illustration
- **함께 쓰면 좋은 키워드**: colorful background, floating composition, soft shadow, vibrant color palette
- **피해야 할 키워드**: dried out cracked texture, cluttered messy background, dull grayscale tone
- **예시 완성 프롬프트**: `3D icon of a set of colorful markers with matte plastic barrels and chisel tips, one cap slightly off, soft studio lighting, floating on vibrant white background, playful bright colors, subtle shadow, high detail, 4k`
- **생성 예시 설명**: 여러 색깔의 마커가 나란히 놓인 채 흰 배경 위에 생동감 있게 떠 있는 3D 아이콘이 생성된다.

#### 지우개 (Eraser)
- **영어 키워드**: `eraser`
- **설명**: 수정, 삭제, 리셋 기능을 은유적으로 표현할 때 쓰이는 작고 친근한 문구류 오브젝트다.
- **추천 프롬프트**: rubber texture with rounded edges, worn corner detail, small brand-blank wrapper, soft matte surface, subtle eraser dust
- **잘 어울리는 재질**: matte rubber, soft vinyl
- **추천 조명**: soft studio lighting, flat even lighting
- **추천 스타일**: 3D icon, cute rounded style, flat illustration
- **함께 쓰면 좋은 키워드**: pastel background, floating composition, soft shadow, playful color palette
- **피해야 할 키워드**: dirty pencil smudges, cluttered background, cracked worn texture
- **예시 완성 프롬프트**: `3D icon of a pink eraser with soft matte rubber texture and rounded edges, subtle eraser dust nearby, soft studio lighting, floating on pastel blue background, cute playful style, subtle shadow, high quality, 4k render`
- **생성 예시 설명**: 둥근 모서리의 분홍색 지우개가 연한 지우개 가루와 함께 파란 배경 위에 귀엽게 떠 있는 3D 아이콘이 생성된다.

#### 집게 클립 (Binder Clip)
- **영어 키워드**: `binder clip`
- **설명**: 서류 정리, 자료 묶음 표현 등 사무 정돈을 상징하는 작은 문구류 오브젝트다.
- **추천 프롬프트**: metal wire handles, black clip body, spring tension detail, glossy metal surface, folded paper stack attached
- **잘 어울리는 재질**: matte black metal, brushed steel wire, matte paper stack
- **추천 조명**: soft studio lighting, specular highlight
- **추천 스타일**: 3D icon, isometric, realistic product render
- **함께 쓰면 좋은 키워드**: clean background, floating composition, soft shadow, minimal color palette
- **피해야 할 키워드**: rusty corroded metal, cluttered background, bent broken wire
- **예시 완성 프롬프트**: `3D icon of a binder clip with metal wire handles clipped onto a folded paper stack, matte black clip body with glossy metal highlights, soft studio lighting, floating on clean light gray background, minimal shadow, 4k render`
- **생성 예시 설명**: 서류 뭉치를 집은 검정 집게 클립이 회색 배경 위에 깔끔하게 떠 있는 3D 아이콘이 생성된다.

### Decoration

#### 리본 (Ribbon)
- **영어 키워드**: `ribbon`
- **설명**: 선물 포장, 이벤트 장식, 축하 배너에서 우아함과 축제 분위기를 더하는 장식 오브젝트다.
- **추천 프롬프트**: satin fabric texture, curled tail ends, glossy sheen, flowing wave shape, tied knot detail
- **잘 어울리는 재질**: satin fabric, silk, glossy foil ribbon
- **추천 조명**: soft studio lighting, warm rim light
- **추천 스타일**: 3D icon, flat illustration, isometric
- **함께 쓰면 좋은 키워드**: pastel background, floating composition, soft shadow, festive color palette
- **피해야 할 키워드**: frayed rough texture, dark dull background, wrinkled crumpled fabric
- **예시 완성 프롬프트**: `3D icon of a satin ribbon with curled tail ends and glossy sheen, flowing wave shape, soft studio lighting with warm rim light, floating on pastel pink background, festive elegant style, subtle shadow, high detail, 4k`
- **생성 예시 설명**: 부드럽게 흘러내리는 새틴 리본이 파스텔 핑크 배경 위에서 우아하게 떠 있는 3D 아이콘이 생성된다.

#### 리본 매듭 (Bow)
- **영어 키워드**: `bow`
- **설명**: 선물 상자 위 장식, 축하 배너 포인트 요소로 쓰이는 나비 모양 리본 매듭이다.
- **추천 프롬프트**: symmetrical loop shape, satin texture, glossy highlight, small knot center, trailing ribbon tails
- **잘 어울리는 재질**: satin fabric, glossy foil, velvet ribbon
- **추천 조명**: soft studio lighting, warm rim light
- **추천 스타일**: 3D icon, cute rounded style, isometric
- **함께 쓰면 좋은 키워드**: festive background, floating composition, soft shadow, warm color palette
- **피해야 할 키워드**: lopsided asymmetry, wrinkled fabric, dark gloomy background
- **예시 완성 프롬프트**: `3D icon of a symmetrical satin bow with glossy highlight and trailing ribbon tails, soft studio lighting with warm rim light, floating on festive red background, cute elegant style, subtle shadow, high quality, 4k render`
- **생성 예시 설명**: 좌우 대칭이 아름다운 새틴 리본 매듭이 붉은 배경 위에서 반짝이며 떠 있는 3D 아이콘이 생성된다.

#### 풍선 (Balloon)
- **영어 키워드**: `balloon`
- **설명**: 축하, 생일, 파티 프로모션 배너에서 경쾌하고 즐거운 분위기를 전달하는 오브젝트다.
- **추천 프롬프트**: glossy latex surface, round inflated shape, string tail, specular highlight spot, floating cluster
- **잘 어울리는 재질**: glossy latex, matte rubber
- **추천 조명**: soft studio lighting, specular highlight
- **추천 스타일**: 3D icon, cute rounded style, flat illustration
- **함께 쓰면 좋은 키워드**: pastel sky background, floating composition, soft shadow, playful festive palette
- **피해야 할 키워드**: deflated wrinkled surface, dark heavy background, popped torn balloon
- **예시 완성 프롬프트**: `3D icon of a cluster of glossy balloons with round inflated shapes and string tails, soft studio lighting with specular highlight spots, floating on pastel sky blue background, playful festive style, subtle shadow, high detail, 4k`
- **생성 예시 설명**: 여러 색의 반짝이는 풍선 다발이 하늘색 배경 위에서 둥실 떠 있는 경쾌한 3D 아이콘이 생성된다.

#### 색종이 조각 (Confetti)
- **영어 키워드**: `confetti`
- **설명**: 축하 이벤트, 당첨 화면, 이벤트 배경 장식으로 흩날리는 느낌을 표현할 때 쓰인다.
- **추천 프롬프트**: scattered paper pieces, glossy foil flecks, mixed shapes, falling motion, colorful confetti burst
- **잘 어울리는 재질**: glossy foil paper, matte paper, metallic flecks
- **추천 조명**: soft studio lighting, sparkle highlight
- **추천 스타일**: 3D icon, flat illustration, festive style
- **함께 쓰면 좋은 키워드**: vibrant background, floating composition, motion blur accents, celebratory color palette
- **피해야 할 키워드**: dull grayscale tone, dark somber background, cluttered messy pile
- **예시 완성 프롬프트**: `3D render of scattered confetti pieces with glossy foil flecks in mixed shapes, falling motion, soft studio lighting with sparkle highlights, floating on vibrant purple background, celebratory color palette, high detail, 4k`
- **생성 예시 설명**: 여러 색의 색종이 조각이 반짝이며 흩날리는 축제 분위기의 3D 이미지가 보라색 배경 위에 생성된다.

#### 반짝임 (Sparkle)
- **영어 키워드**: `sparkle`
- **설명**: 신제품, 특별함, 프리미엄 느낌을 강조할 때 포인트로 곁들이는 빛나는 장식 요소다.
- **추천 프롬프트**: four-point star shape, glossy shine, soft glow halo, small and large clusters, light trail accents
- **잘 어울리는 재질**: glossy glass-like surface, metallic foil
- **추천 조명**: bright glow lighting, specular highlight
- **추천 스타일**: 3D icon, flat illustration, minimal style
- **함께 쓰면 좋은 키워드**: dark background for contrast, floating composition, glow effect, premium color palette
- **피해야 할 키워드**: dull matte finish, cluttered busy background, flat lighting without glow
- **예시 완성 프롬프트**: `3D icon of sparkle shapes with glossy shine and soft glow halo, small and large clusters, bright glow lighting, floating on deep navy background, premium minimal style, high detail, 4k render`
- **생성 예시 설명**: 크고 작은 별빛 반짝임이 짙은 네이비 배경 위에서 은은하게 빛나는 프리미엄한 3D 이미지가 생성된다.

#### 별 (Star)
- **영어 키워드**: `star`
- **설명**: 리뷰 평점, 베스트 상품, 특별 이벤트 강조에 널리 쓰이는 상징적인 오브젝트다.
- **추천 프롬프트**: five-point star shape, glossy surface, rounded edge points, subtle glow, metallic finish
- **잘 어울리는 재질**: glossy metallic gold, matte pastel plastic
- **추천 조명**: soft studio lighting, specular highlight
- **추천 스타일**: 3D icon, cute rounded style, flat illustration
- **함께 쓰면 좋은 키워드**: bright background, floating composition, soft shadow, cheerful color palette
- **피해야 할 키워드**: dull scratched surface, dark gloomy background, jagged sharp edges
- **예시 완성 프롬프트**: `3D icon of a glossy golden star with rounded edge points and subtle glow, soft studio lighting with specular highlight, floating on bright yellow background, cheerful clean style, subtle shadow, high quality, 4k render`
- **생성 예시 설명**: 둥근 모서리의 금빛 별이 노란 배경 위에서 은은하게 빛나며 떠 있는 3D 아이콘이 생성된다.

#### 하트 (Heart)
- **영어 키워드**: `heart`
- **설명**: 좋아요, 찜하기, 팬심 이벤트 등 애정과 호감을 표현하는 대표적인 상징 오브젝트다.
- **추천 프롬프트**: glossy rounded shape, smooth surface, soft specular highlight, plump 3D volume, subtle blush gradient
- **잘 어울리는 재질**: glossy rubber, matte pastel plastic, glass-like surface
- **추천 조명**: soft studio lighting, specular highlight
- **추천 스타일**: 3D icon, cute rounded style, flat illustration
- **함께 쓰면 좋은 키워드**: pastel pink background, floating composition, soft shadow, romantic color palette
- **피해야 할 키워드**: sharp jagged edges, dark somber background, cracked surface
- **예시 완성 프롬프트**: `3D icon of a glossy plump heart with smooth rounded surface and subtle blush gradient, soft studio lighting with specular highlight, floating on pastel pink background, cute romantic style, subtle shadow, 4k render`
- **생성 예시 설명**: 통통하고 매끈한 하트가 은은한 하이라이트와 함께 파스텔 핑크 배경 위에 떠 있는 귀여운 3D 아이콘이 생성된다.

#### 왕관 (Crown)
- **영어 키워드**: `crown`
- **설명**: 1등, VIP, 프리미엄 등급 등 최상위 지위를 상징하는 화려한 장식 오브젝트다.
- **추천 프롬프트**: metallic gold surface, gemstone accents, pointed peaks, engraved pattern, glossy reflective finish
- **잘 어울리는 재질**: polished gold metal, faceted gemstone, velvet lining
- **추천 조명**: studio lighting with specular highlight, warm glow
- **추천 스타일**: 3D icon, isometric, realistic metallic render
- **함께 쓰면 좋은 키워드**: dark background for contrast, floating composition, glow effect, royal color palette
- **피해야 할 키워드**: dull tarnished metal, cluttered background, flat lighting without highlights
- **예시 완성 프롬프트**: `3D icon of a golden crown with gemstone accents and engraved pattern, pointed peaks, studio lighting with strong specular highlight and warm glow, floating on deep purple background, royal premium style, high detail, 4k render`
- **생성 예시 설명**: 보석이 박힌 화려한 금관이 짙은 보라색 배경 위에서 광채를 내며 떠 있는 고급스러운 3D 아이콘이 생성된다.

#### 다이아몬드 (Diamond)
- **영어 키워드**: `diamond`
- **설명**: 최고 등급, 프리미엄 멤버십, 희소성을 상징하는 보석형 장식 오브젝트다.
- **추천 프롬프트**: faceted cut surface, sharp geometric edges, prismatic light refraction, glossy transparent finish, subtle sparkle accents
- **잘 어울리는 재질**: cut crystal glass, faceted gemstone
- **추천 조명**: studio lighting with prismatic refraction, specular highlight
- **추천 스타일**: 3D icon, isometric, realistic gem render
- **함께 쓰면 좋은 키워드**: dark background for contrast, floating composition, glow effect, luxury color palette
- **피해야 할 키워드**: cloudy opaque surface, cluttered background, dull flat lighting
- **예시 완성 프롬프트**: `3D icon of a faceted diamond with sharp geometric edges and prismatic light refraction, studio lighting with strong specular highlight, floating on deep black background, luxury premium style, subtle sparkle accents, high detail, 4k`
- **생성 예시 설명**: 다각형으로 커팅된 투명한 다이아몬드가 검은 배경 위에서 프리즘처럼 빛을 반사하며 떠 있는 고급스러운 3D 아이콘이 생성된다.

#### 보석 (Gem)
- **영어 키워드**: `gem`
- **설명**: 게임 내 재화, 리워드 포인트, 희귀 아이템 등을 표현할 때 쓰이는 다채로운 보석 오브젝트다.
- **추천 프롬프트**: faceted cut surface, vivid saturated color, glossy transparent finish, rounded gem shape, subtle internal glow
- **잘 어울리는 재질**: cut crystal glass, polished gemstone
- **추천 조명**: studio lighting with specular highlight, internal glow lighting
- **추천 스타일**: 3D icon, isometric, vibrant render
- **함께 쓰면 좋은 키워드**: dark background for contrast, floating composition, glow effect, vibrant jewel tone palette
- **피해야 할 키워드**: dull cloudy surface, cluttered background, flat matte finish
- **예시 완성 프롬프트**: `3D icon of a faceted emerald green gem with glossy transparent finish and subtle internal glow, studio lighting with specular highlight, floating on dark background, vibrant jewel tone style, high detail, 4k render`
- **생성 예시 설명**: 에메랄드빛 보석이 내부에서 은은하게 빛나며 어두운 배경 위에 떠 있는 화려한 3D 아이콘이 생성된다.

#### 트로피 (Trophy)
- **영어 키워드**: `trophy`
- **설명**: 우승, 랭킹 1위, 이벤트 성과 발표 콘텐츠에서 성취와 승리를 상징하는 오브젝트다.
- **추천 프롬프트**: metallic gold surface, engraved base plate, twin handle design, polished reflective finish, laurel accent detail
- **잘 어울리는 재질**: polished gold metal, brushed metal base, marble base
- **추천 조명**: studio lighting with specular highlight, warm glow
- **추천 스타일**: 3D icon, isometric, realistic metallic render
- **함께 쓰면 좋은 키워드**: dark background for contrast, floating composition, glow effect, celebratory color palette
- **피해야 할 키워드**: dull tarnished metal, cluttered background, flat lighting without highlights
- **예시 완성 프롬프트**: `3D icon of a golden trophy with twin handles and engraved base plate, polished reflective metal surface, studio lighting with strong specular highlight and warm glow, floating on deep blue background, celebratory premium style, high detail, 4k`
- **생성 예시 설명**: 광택 나는 금빛 트로피가 짙은 블루 배경 위에서 빛나며 떠 있는 우승 느낌의 3D 아이콘이 생성된다.

#### 메달 (Medal)
- **영어 키워드**: `medal`
- **설명**: 순위 인증, 랭킹 배지, 참여 보상 등을 표현하는 목걸이형 상장 오브젝트다.
- **추천 프롬프트**: circular metal disc, ribbon strap attached, embossed star pattern, polished reflective surface, engraved rim detail
- **잘 어울리는 재질**: polished gold metal, brushed silver metal, satin ribbon
- **추천 조명**: studio lighting with specular highlight, warm glow
- **추천 스타일**: 3D icon, isometric, realistic metallic render
- **함께 쓰면 좋은 키워드**: clean background, floating composition, soft shadow, celebratory color palette
- **피해야 할 키워드**: rusty tarnished metal, cluttered background, frayed ribbon texture
- **예시 완성 프롬프트**: `3D icon of a gold medal with ribbon strap and embossed star pattern, polished reflective metal surface, studio lighting with specular highlight and warm glow, floating on clean light blue background, celebratory style, subtle shadow, 4k render`
- **생성 예시 설명**: 별 문양이 새겨진 금메달이 리본과 함께 하늘색 배경 위에서 반짝이며 떠 있는 3D 아이콘이 생성된다.

#### 폭죽 (Firework)
- **영어 키워드**: `firework`
- **설명**: 카운트다운, 대형 이벤트 오픈, 축하 무드 배너에서 폭발적인 흥분을 전달하는 오브젝트다.
- **추천 프롬프트**: radial burst pattern, glowing spark trails, vivid multicolor streaks, sparkling particle effect, night sky burst
- **잘 어울리는 재질**: glowing light particles, glossy spark trails
- **추천 조명**: bright glow lighting, radial light burst
- **추천 스타일**: 3D render, flat illustration, festive style
- **함께 쓰면 좋은 키워드**: dark night sky background, floating composition, glow effect, vibrant celebratory palette
- **피해야 할 키워드**: dull faded colors, cluttered daytime background, flat lighting without glow
- **예시 완성 프롬프트**: `3D render of a firework burst with radial spark trails and vivid multicolor streaks, bright glow lighting, floating on dark night sky background, vibrant celebratory style, sparkling particle effect, high detail, 4k`
- **생성 예시 설명**: 다채로운 색상의 폭죽이 밤하늘 배경 위에서 방사형으로 터지며 빛나는 축제 분위기의 3D 이미지가 생성된다.

### Nature

#### 꽃 (Flower)
- **영어 키워드**: `flower`
- **설명**: 장식, 배경 패턴, 계절 테마 디자인에 두루 쓰이는 기본 자연 오브젝트입니다. 단독 아이콘부터 화환 패턴까지 다양하게 활용됩니다.
- **추천 프롬프트**: blooming petals, soft gradient petals, dew drops, single stem, symmetrical bloom, pastel tones
- **잘 어울리는 재질**: glossy porcelain, soft matte plastic, translucent glass, satin fabric
- **추천 조명**: soft studio lighting, warm backlight, gentle rim light
- **추천 스타일**: 3D render, cute chibi icon, minimal flat illustration
- **함께 쓰면 좋은 키워드**: pastel color palette, centered composition, clean background, soft shadow, spring mood
- **피해야 할 키워드**: wilted, dark horror tone, cluttered background, photorealistic gore
- **예시 완성 프롬프트**: `3D render of a cute glossy porcelain flower icon, soft petals, warm backlight, centered composition, pastel gradient background, soft shadow, high quality, studio lighting`
- **생성 예시 설명**: 파스텔톤 배경 위에 도자기 질감의 귀여운 꽃 한 송이가 부드러운 그림자와 함께 중앙에 배치된 3D 아이콘 이미지가 생성됩니다.

#### 장미 (Rose)
- **영어 키워드**: `rose`
- **설명**: 사랑, 축하, 프리미엄 느낌을 표현할 때 자주 쓰이는 오브젝트로 발렌타인·기념일 테마 디자인에 적합합니다.
- **추천 프롬프트**: layered velvet petals, single red rose, thorny stem, dewy texture, elegant curve
- **잘 어울리는 재질**: velvet, glossy red glass, satin, metallic gold accent
- **추천 조명**: dramatic spotlight, soft romantic glow, warm rim light
- **추천 스타일**: 3D render, luxury product render, painterly illustration
- **함께 쓰면 좋은 키워드**: deep red tone, dark background, elegant composition, bokeh, luxury mood
- **피해야 할 키워드**: cartoonish, low poly, faded colors, messy stem
- **예시 완성 프롬프트**: `3D render of a single glossy velvet red rose, elegant curved stem, dramatic spotlight, dark luxury background, bokeh, high detail, ultra realistic quality`
- **생성 예시 설명**: 어두운 배경 위에 벨벳 질감의 붉은 장미 한 송이가 극적인 조명을 받아 고급스럽게 빛나는 이미지가 생성됩니다.

#### 튤립 (Tulip)
- **영어 키워드**: `tulip`
- **설명**: 봄 시즌 프로모션이나 밝고 경쾌한 무드의 디자인에 잘 어울리는 오브젝트입니다.
- **추천 프롬프트**: cup-shaped petals, single tulip, smooth stem, vivid color, minimal bloom
- **잘 어울리는 재질**: matte ceramic, glossy plastic, soft silicone
- **추천 조명**: bright natural light, soft daylight, clean studio light
- **추천 스타일**: 3D render, flat vector illustration, cute icon style
- **함께 쓰면 좋은 키워드**: vivid color palette, clean white background, spring theme, soft shadow, centered layout
- **피해야 할 키워드**: dull colors, wilted petals, cluttered scene, dark gothic tone
- **예시 완성 프롬프트**: `3D render of a glossy matte ceramic tulip icon, single vivid pink bloom, bright natural lighting, clean white background, soft shadow, centered composition, high quality`
- **생성 예시 설명**: 밝고 선명한 핑크색 튤립이 하얀 배경 위에 깔끔하게 놓인 봄 느낌의 3D 아이콘 이미지가 생성됩니다.

#### 나뭇잎 (Leaf)
- **영어 키워드**: `leaf`
- **설명**: 친환경, 자연, 웰니스 컨셉의 디자인에서 배경 요소나 포인트 아이콘으로 자주 사용됩니다.
- **추천 프롬프트**: single green leaf, visible veins, curved edge, dew droplet, glossy surface
- **잘 어울리는 재질**: glossy glass, matte rubber, translucent resin
- **추천 조명**: soft natural light, morning backlight, gentle top light
- **추천 스타일**: 3D render, flat minimal icon, botanical illustration
- **함께 쓰면 좋은 키워드**: fresh green tone, clean background, eco theme, soft shadow, organic shape
- **피해야 할 키워드**: dry brown texture, decayed, cluttered forest scene, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy green leaf icon with visible veins and dew droplet, soft morning backlight, clean pastel background, minimal composition, high quality`
- **생성 예시 설명**: 이슬이 맺힌 반짝이는 초록 나뭇잎이 파스텔 배경 위에 미니멀하게 배치된 친환경 느낌의 3D 아이콘이 생성됩니다.

#### 나무 (Tree)
- **영어 키워드**: `tree`
- **설명**: 성장, 지속가능성, 계절 변화를 표현하는 배경 오브젝트로 인포그래픽이나 환경 캠페인 디자인에 적합합니다.
- **추천 프롬프트**: rounded canopy, simple trunk, stylized foliage, single tree silhouette, soft texture
- **잘 어울리는 재질**: matte clay, soft felt texture, glossy toy-like plastic
- **추천 조명**: soft ambient light, warm sunset glow, even studio light
- **추천 스타일**: 3D render, low poly illustration, cute isometric icon
- **함께 쓰면 좋은 키워드**: green and brown palette, isometric composition, clean background, soft shadow, growth concept
- **피해야 할 키워드**: dead branches, dark horror forest, overly detailed bark texture, cluttered scene
- **예시 완성 프롬프트**: `3D isometric render of a cute matte clay tree with rounded green canopy, soft ambient lighting, clean pastel background, soft shadow, minimal style, high quality`
- **생성 예시 설명**: 동그란 초록 수관을 가진 귀여운 아이소메트릭 나무 아이콘이 파스텔 배경 위에 놓인 이미지가 생성됩니다.

#### 잔디 (Grass)
- **영어 키워드**: `grass`
- **설명**: 바닥이나 배경 요소로 자주 쓰이는 오브젝트로 자연·정원·환경 테마 디자인에 텍스처감을 더합니다.
- **추천 프롬프트**: small grass tuft, thin blades, fresh green color, soft rounded tips, patch of grass
- **잘 어울리는 재질**: matte clay, soft felt, glossy silicone
- **추천 조명**: soft natural daylight, even top light
- **추천 스타일**: 3D render, flat minimal icon, isometric illustration
- **함께 쓰면 좋은 키워드**: fresh green tone, clean ground base, minimal composition, soft shadow
- **피해야 할 키워드**: dry yellow patches, muddy texture, cluttered field scene
- **예시 완성 프롬프트**: `3D render of a small tuft of fresh green grass icon, soft matte clay texture, natural daylight, clean white background, soft shadow, minimal style, high quality`
- **생성 예시 설명**: 하얀 배경 위에 작고 귀여운 잔디 뭉치가 클레이 질감으로 표현된 심플한 3D 아이콘이 생성됩니다.

#### 구름 (Cloud)
- **영어 키워드**: `cloud`
- **설명**: 날씨 앱, 스토리지/클라우드 서비스, 몽환적인 배경 디자인에 널리 쓰이는 오브젝트입니다.
- **추천 프롬프트**: puffy rounded cloud, soft fluffy texture, smooth curves, floating shape, cotton-like surface
- **잘 어울리는 재질**: soft matte plastic, glossy inflatable texture, fluffy cotton
- **추천 조명**: soft diffused light, bright sky lighting, gentle backlight
- **추천 스타일**: 3D render, cute kawaii icon, flat minimal illustration
- **함께 쓰면 좋은 키워드**: sky blue background, pastel palette, floating composition, soft shadow, dreamy mood
- **피해야 할 키워드**: dark storm cloud, harsh contrast, jagged shape, gritty texture
- **예시 완성 프롬프트**: `3D render of a puffy soft matte white cloud icon, smooth rounded shape, diffused soft lighting, pastel sky blue background, floating composition, gentle shadow, high quality`
- **생성 예시 설명**: 하늘색 배경 위에 둥글둥글하고 폭신한 흰 구름이 부드럽게 떠 있는 귀여운 3D 아이콘 이미지가 생성됩니다.

#### 무지개 (Rainbow)
- **영어 키워드**: `rainbow`
- **설명**: 다양성, 희망, 어린이 콘텐츠 등 밝고 긍정적인 무드를 전달할 때 사용하는 포인트 오브젝트입니다.
- **추천 프롬프트**: smooth arc shape, vivid seven-color bands, glossy surface, rounded ends, soft glow
- **잘 어울리는 재질**: glossy glass, soft matte plastic, translucent candy-like material
- **추천 조명**: bright soft light, gentle glow, even studio lighting
- **추천 스타일**: 3D render, cute icon style, flat vector illustration
- **함께 쓰면 좋은 키워드**: vivid color palette, pastel sky background, cheerful mood, soft shadow, floating clouds
- **피해야 할 키워드**: muted grayscale, dark stormy background, broken arc, gritty texture
- **예시 완성 프롬프트**: `3D render of a glossy vivid rainbow arc icon, smooth rounded bands, soft glow, pastel sky background with fluffy clouds, cheerful composition, high quality`
- **생성 예시 설명**: 선명한 색상의 무지개 아치가 파스텔 하늘 배경과 뭉게구름 사이에서 밝게 빛나는 3D 아이콘이 생성됩니다.

#### 태양 (Sun)
- **영어 키워드**: `sun`
- **설명**: 날씨, 에너지, 여름 테마 디자인에서 밝고 활기찬 느낌을 주는 핵심 오브젝트입니다.
- **추천 프롬프트**: round glowing sun, radiant rays, warm gradient, soft glow halo, smiling minimal shape
- **잘 어울리는 재질**: glossy glass, matte plastic, soft glowing resin
- **추천 조명**: strong warm glow, radiant backlight, bright golden light
- **추천 스타일**: 3D render, cute kawaii icon, flat minimal illustration
- **함께 쓰면 좋은 키워드**: warm yellow orange palette, clear sky background, radiant glow, soft shadow, cheerful mood
- **피해야 할 키워드**: cold blue tone, eclipse darkness, harsh burnt texture, cluttered background
- **예시 완성 프롬프트**: `3D render of a glossy round sun icon with radiant warm glow, soft rays, bright golden lighting, clear pastel sky background, cheerful centered composition, high quality`
- **생성 예시 설명**: 따뜻한 노랑-주황 그라데이션의 둥근 태양이 은은한 빛과 함께 맑은 하늘 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 달 (Moon)
- **영어 키워드**: `moon`
- **설명**: 밤, 수면, 몽환적 테마 디자인에서 차분하고 신비로운 분위기를 만드는 오브젝트입니다.
- **추천 프롬프트**: crescent moon shape, soft craters texture, gentle glow, smooth surface, night halo
- **잘 어울리는 재질**: matte stone texture, glossy pearl surface, soft glowing resin
- **추천 조명**: cool soft glow, gentle moonlight, subtle rim light
- **추천 스타일**: 3D render, cute minimal icon, dreamy illustration
- **함께 쓰면 좋은 키워드**: night blue palette, starry background, soft glow halo, calm mood, soft shadow
- **피해야 할 키워드**: harsh daylight, bright warm tone, cluttered scene, cartoon horror face
- **예시 완성 프롬프트**: `3D render of a soft glossy crescent moon icon with gentle craters, cool moonlight glow, deep night blue starry background, calm centered composition, high quality`
- **생성 예시 설명**: 은은하게 빛나는 초승달이 별이 흩뿌려진 짙은 남색 밤하늘 배경 위에 차분하게 놓인 3D 아이콘이 생성됩니다.

#### 눈송이 (Snowflake)
- **영어 키워드**: `snowflake`
- **설명**: 겨울 시즌, 크리스마스 프로모션, 시원한 느낌의 디자인 요소로 자주 활용됩니다.
- **추천 프롬프트**: symmetrical crystal pattern, six-pointed shape, delicate ice texture, sparkling surface, intricate detail
- **잘 어울리는 재질**: translucent ice, glossy crystal glass, frosted acrylic
- **추천 조명**: cool sparkling light, soft blue backlight, crisp studio light
- **추천 스타일**: 3D render, delicate line illustration, cute minimal icon
- **함께 쓰면 좋은 키워드**: icy blue white palette, sparkle particles, clean cool background, soft shadow, winter mood
- **피해야 할 키워드**: warm orange tone, melted shape, cluttered background, muddy texture
- **예시 완성 프롬프트**: `3D render of a delicate translucent ice crystal snowflake icon, symmetrical six-pointed pattern, cool sparkling light, icy blue background, soft shadow, high detail, high quality`
- **생성 예시 설명**: 정교한 육각형 패턴의 반투명 얼음 눈송이가 차가운 파란빛 배경 위에서 반짝이는 3D 아이콘이 생성됩니다.

#### 물방울 (Water Drop)
- **영어 키워드**: `water drop`
- **설명**: 청결, 수분, 신선함을 강조하는 뷰티·헬스케어 디자인에서 자주 등장하는 오브젝트입니다.
- **추천 프롬프트**: teardrop shape, glossy transparent surface, highlight reflection, smooth curve, single droplet
- **잘 어울리는 재질**: transparent glass, glossy liquid, clear resin
- **추천 조명**: bright soft light, clean reflective highlight, studio softbox light
- **추천 스타일**: 3D render, minimal clean icon, glossy product render
- **함께 쓰면 좋은 키워드**: aqua blue palette, clean white background, fresh mood, soft shadow, minimal composition
- **피해야 할 키워드**: muddy color, cracked surface, cluttered splash, dark grimy tone
- **예시 완성 프롬프트**: `3D render of a glossy transparent water drop icon, clean highlight reflection, bright soft studio lighting, aqua blue gradient background, minimal composition, soft shadow, high quality`
- **생성 예시 설명**: 투명하고 반짝이는 물방울 하나가 하이라이트 반사와 함께 아쿠아 블루 배경 위에 깔끔하게 놓인 3D 아이콘이 생성됩니다.

### Food

#### 케이크 (Cake)
- **영어 키워드**: `cake`
- **설명**: 생일, 축하, 파티 테마 디자인의 핵심 오브젝트로 앱 배지나 이벤트 배너에 자주 쓰입니다.
- **추천 프롬프트**: layered slice, frosting swirl, sprinkles topping, cherry decoration, soft cream texture
- **잘 어울리는 재질**: glossy cream frosting, matte sponge texture, soft fondant
- **추천 조명**: warm soft studio light, gentle top light
- **추천 스타일**: 3D render, cute kawaii icon, pastel dessert illustration
- **함께 쓰면 좋은 키워드**: pastel pink palette, clean background, celebratory mood, soft shadow, sprinkles decoration
- **피해야 할 키워드**: melted frosting, dark moody tone, messy crumbs, photorealistic gore
- **예시 완성 프롬프트**: `3D render of a cute cake slice icon with glossy cream frosting and sprinkles, warm soft studio lighting, pastel pink background, soft shadow, high quality`
- **생성 예시 설명**: 크림 프로스팅과 스프링클로 장식된 케이크 조각이 파스텔 핑크 배경 위에 놓인 귀여운 3D 아이콘이 생성됩니다.

#### 도넛 (Donut)
- **영어 키워드**: `donut`
- **설명**: 캐주얼하고 발랄한 느낌의 카페·디저트 앱 디자인에서 자주 쓰이는 인기 오브젝트입니다.
- **추천 프롬프트**: glazed ring shape, colorful sprinkles, glossy icing drip, soft dough texture
- **잘 어울리는 재질**: glossy icing glaze, matte dough, sugary sprinkle texture
- **추천 조명**: bright warm light, soft studio light
- **추천 스타일**: 3D render, cute food icon, flat vector illustration
- **함께 쓰면 좋은 키워드**: pastel candy palette, clean background, playful mood, soft shadow, sprinkle decoration
- **피해야 할 키워드**: stale texture, dark greasy tone, burnt surface, cluttered plate
- **예시 완성 프롬프트**: `3D render of a glossy pink glazed donut icon with colorful sprinkles, bright warm studio lighting, clean pastel background, soft shadow, high quality`
- **생성 예시 설명**: 분홍 글레이즈와 화려한 스프링클이 올라간 도넛이 파스텔 배경 위에서 반짝이는 귀여운 3D 아이콘이 생성됩니다.

#### 쿠키 (Cookie)
- **영어 키워드**: `cookie`
- **설명**: 따뜻하고 아늑한 홈베이킹, 카페 브랜딩 디자인에 잘 어울리는 오브젝트입니다.
- **추천 프롬프트**: round baked cookie, chocolate chips, cracked surface texture, warm brown tone
- **잘 어울리는 재질**: matte baked dough, glossy chocolate chunks
- **추천 조명**: warm soft light, gentle top light
- **추천 스타일**: 3D render, cute food icon, cozy illustration
- **함께 쓰면 좋은 키워드**: warm brown palette, clean background, cozy mood, soft shadow, crumb texture
- **피해야 할 키워드**: burnt black texture, moldy surface, dark gritty tone, cluttered crumbs
- **예시 완성 프롬프트**: `3D render of a warm matte baked cookie icon with glossy chocolate chips, soft top lighting, clean cream background, soft shadow, high quality`
- **생성 예시 설명**: 초콜릿 칩이 콕콕 박힌 따뜻한 색감의 쿠키가 크림색 배경 위에 놓인 아늑한 3D 아이콘이 생성됩니다.

#### 사탕 (Candy)
- **영어 키워드**: `candy`
- **설명**: 달콤하고 발랄한 무드를 표현할 때 쓰이는 오브젝트로 어린이용·이벤트 디자인에 적합합니다.
- **추천 프롬프트**: twisted wrapper ends, glossy swirl pattern, vivid candy color, smooth round shape
- **잘 어울리는 재질**: glossy hard candy, translucent sugar glass, glossy cellophane wrapper
- **추천 조명**: bright playful light, soft studio light
- **추천 스타일**: 3D render, cute candy icon, pop illustration
- **함께 쓰면 좋은 키워드**: vivid rainbow palette, clean pastel background, playful mood, soft shadow, sparkle highlight
- **피해야 할 키워드**: dull matte color, dusty texture, dark background, melted shape
- **예시 완성 프롬프트**: `3D render of a glossy swirl candy icon with twisted cellophane wrapper, vivid rainbow colors, bright playful lighting, clean pastel background, soft shadow, high quality`
- **생성 예시 설명**: 소용돌이 무늬의 알록달록한 사탕이 반짝이는 포장지와 함께 파스텔 배경 위에 놓인 귀여운 3D 아이콘이 생성됩니다.

#### 초콜릿 (Chocolate)
- **영어 키워드**: `chocolate`
- **설명**: 프리미엄 디저트, 발렌타인 테마 디자인에서 진한 색감과 고급스러운 무드를 전달하는 오브젝트입니다.
- **추천 프롬프트**: glossy chocolate bar, broken square piece, smooth melted drip, rich dark surface
- **잘 어울리는 재질**: glossy melted chocolate, matte cocoa surface, silky ganache
- **추천 조명**: warm dramatic light, soft studio spotlight
- **추천 스타일**: 3D render, luxury food render, minimal icon style
- **함께 쓰면 좋은 키워드**: rich brown palette, dark elegant background, glossy highlight, soft shadow, premium mood
- **피해야 할 키워드**: pale gray tone, dusty matte surface, cluttered wrapper, cracked dry texture
- **예시 완성 프롬프트**: `3D render of a glossy rich dark chocolate bar icon with smooth melted drip, warm dramatic spotlight, dark elegant background, soft shadow, high quality`
- **생성 예시 설명**: 매끄럽게 녹아내리는 진한 다크 초콜릿 바가 어두운 배경 위에서 고급스러운 광택을 내는 3D 아이콘이 생성됩니다.

#### 커피 (Coffee)
- **영어 키워드**: `coffee cup`
- **설명**: 카페 브랜딩, 업무/모닝 루틴 콘텐츠에서 가장 많이 쓰이는 음료 오브젝트입니다.
- **추천 프롬프트**: steaming coffee cup, latte art foam, glossy ceramic mug, rising steam wisps
- **잘 어울리는 재질**: glossy ceramic, matte paper cup, warm wood coaster
- **추천 조명**: warm soft morning light, gentle top light
- **추천 스타일**: 3D render, cozy cafe icon, minimal flat illustration
- **함께 쓰면 좋은 키워드**: warm brown cream palette, clean background, cozy morning mood, soft shadow, steam effect
- **피해야 할 키워드**: cold spilled liquid, dark gritty stain, cluttered table mess
- **예시 완성 프롬프트**: `3D render of a glossy ceramic coffee cup icon with latte art foam and rising steam, warm morning lighting, clean cream background, soft shadow, high quality`
- **생성 예시 설명**: 라떼 아트가 그려진 도자기 커피잔에서 은은한 김이 피어오르는 따뜻한 아침 느낌의 3D 아이콘이 생성됩니다.

#### 차 (Tea)
- **영어 키워드**: `tea cup`
- **설명**: 힐링, 웰니스, 차분한 라이프스타일 콘텐츠에 잘 어울리는 음료 오브젝트입니다.
- **추천 프롬프트**: steaming tea cup, floating tea leaf, glossy porcelain, gentle steam curl
- **잘 어울리는 재질**: glossy porcelain, matte ceramic, soft linen coaster
- **추천 조명**: soft warm ambient light, gentle side light
- **추천 스타일**: 3D render, calm minimal icon, cozy illustration
- **함께 쓰면 좋은 키워드**: soft green pastel palette, clean background, calm mood, soft shadow, steam effect
- **피해야 할 키워드**: cold dark tone, spilled liquid, cluttered clutter, harsh light
- **예시 완성 프롬프트**: `3D render of a glossy porcelain tea cup icon with gentle rising steam, soft warm ambient lighting, clean pastel green background, soft shadow, high quality`
- **생성 예시 설명**: 은은한 김이 피어오르는 도자기 찻잔이 부드러운 연두빛 배경 위에 놓인 차분한 무드의 3D 아이콘이 생성됩니다.

#### 아이스크림 (Ice Cream)
- **영어 키워드**: `ice cream`
- **설명**: 여름, 디저트, 발랄한 브랜딩 디자인에서 밝고 시원한 무드를 표현하는 오브젝트입니다.
- **추천 프롬프트**: soft serve swirl, waffle cone texture, melting drip, glossy topping, pastel scoop color
- **잘 어울리는 재질**: glossy melting cream, matte waffle cone, sugary sprinkle topping
- **추천 조명**: bright summer light, soft studio light
- **추천 스타일**: 3D render, cute dessert icon, pastel illustration
- **함께 쓰면 좋은 키워드**: pastel candy palette, clean background, playful summer mood, soft shadow, sprinkle decoration
- **피해야 할 키워드**: completely melted puddle, dark muddy tone, cluttered background
- **예시 완성 프롬프트**: `3D render of a glossy pastel soft serve ice cream cone icon with sprinkles, bright summer lighting, clean pastel background, soft shadow, high quality`
- **생성 예시 설명**: 파스텔톤 소프트 아이스크림이 와플콘 위에 올라가 스프링클과 함께 밝은 배경에 놓인 여름 느낌의 3D 아이콘이 생성됩니다.

#### 딸기 (Strawberry)
- **영어 키워드**: `strawberry`
- **설명**: 상큼하고 사랑스러운 무드의 디저트·뷰티 디자인에서 포인트 색감으로 자주 쓰이는 과일 오브젝트입니다.
- **추천 프롬프트**: glossy red skin, visible seeds texture, green leafy top, dew droplet, smooth curve
- **잘 어울리는 재질**: glossy fruit skin, matte green leaf, translucent juice droplet
- **추천 조명**: bright fresh light, soft studio light
- **추천 스타일**: 3D render, cute fruit icon, pastel illustration
- **함께 쓰면 좋은 키워드**: fresh red green palette, clean background, juicy mood, soft shadow, dew highlight
- **피해야 할 키워드**: moldy spots, dull brown tone, bruised texture, cluttered background
- **예시 완성 프롬프트**: `3D render of a glossy red strawberry icon with green leafy top and dew droplet, bright fresh studio lighting, clean pastel background, soft shadow, high quality`
- **생성 예시 설명**: 이슬이 맺힌 반짝이는 빨간 딸기가 초록 잎과 함께 파스텔 배경 위에 상큼하게 놓인 3D 아이콘이 생성됩니다.

#### 레몬 (Lemon)
- **영어 키워드**: `lemon`
- **설명**: 상쾌함, 비타민, 여름 음료 테마 디자인에서 밝은 노란색 포인트로 자주 활용되는 과일 오브젝트입니다.
- **추천 프롬프트**: glossy yellow skin, textured pores, sliced cross-section, fresh green leaf, juicy droplet
- **잘 어울리는 재질**: glossy citrus skin, matte green leaf, translucent juicy flesh
- **추천 조명**: bright fresh light, crisp studio light
- **추천 스타일**: 3D render, cute fruit icon, minimal flat illustration
- **함께 쓰면 좋은 키워드**: fresh yellow green palette, clean background, zesty mood, soft shadow, citrus slice
- **피해야 할 키워드**: dull brown tone, dry wrinkled skin, cluttered background, moldy texture
- **예시 완성 프롬프트**: `3D render of a glossy yellow lemon icon with a fresh sliced cross-section, bright crisp studio lighting, clean pastel background, soft shadow, high quality`
- **생성 예시 설명**: 반으로 잘린 단면이 보이는 싱그러운 노란 레몬이 파스텔 배경 위에 상쾌하게 놓인 3D 아이콘이 생성됩니다.

### UI

#### 채팅 버블 (Chat Bubble)
- **영어 키워드**: `chat bubble`
- **설명**: 메신저, 커뮤니티, 고객 상담 UI에서 대화 기능을 나타내는 대표적인 인터페이스 아이콘입니다.
- **추천 프롬프트**: rounded rectangle bubble, small tail pointer, glossy surface, floating icon, three dots indicator
- **잘 어울리는 재질**: glossy plastic, soft matte silicone, translucent glass
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid brand color, clean gradient
- **피해야 할 키워드**: cluttered text, busy background, photorealistic texture, dark grunge tone
- **예시 완성 프롬프트**: `3D render of a glossy rounded chat bubble icon with soft tail pointer, subtle top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 둥근 모서리의 광택 있는 채팅 버블 아이콘이 투명 배경 위에 은은한 그림자와 함께 떠 있는 앱 아이콘 이미지가 생성됩니다.

#### 말풍선 (Speech Bubble)
- **영어 키워드**: `speech bubble`
- **설명**: 알림, 리뷰, 코멘트 기능을 표현하는 UI 오브젝트로 채팅 버블보다 더 뾰족한 클래식 형태를 강조할 때 사용합니다.
- **추천 프롬프트**: oval bubble shape, pointed tail, glossy rounded edge, minimal outline, floating icon
- **잘 어울리는 재질**: glossy plastic, soft matte rubber, translucent acrylic
- **추천 조명**: soft even studio light, gentle highlight
- **추천 스타일**: 3D render, minimal app icon, flat vector illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid pastel color, clean gradient
- **피해야 할 키워드**: cluttered text inside, busy pattern, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy oval speech bubble icon with pointed tail, soft highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 광택이 도는 타원형 말풍선 아이콘이 투명 배경 위에 부드러운 그림자와 함께 떠 있는 미니멀한 이미지가 생성됩니다.

#### 알림 (Notification)
- **영어 키워드**: `notification bell badge`
- **설명**: 새 소식, 경고, 업데이트 표시 등에 쓰이는 벨과 배지 결합형 UI 오브젝트입니다.
- **추천 프롬프트**: bell shape with red badge dot, glossy surface, small ring wave lines, floating icon
- **잘 어울리는 재질**: glossy plastic, matte metal, soft silicone
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid accent color, clean gradient
- **피해야 할 키워드**: cluttered numbers, busy background, dark grunge texture, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy bell notification icon with small red badge dot, subtle ring wave lines, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 작은 빨간 배지가 달린 광택 있는 벨 아이콘이 투명 배경 위에 떠 있는 알림용 3D 아이콘이 생성됩니다.

#### 좋아요 (Like)
- **영어 키워드**: `like heart thumbs up`
- **설명**: 소셜 미디어, 커머스 앱에서 호감·추천 표시로 사용되는 하트 또는 엄지척 아이콘입니다.
- **추천 프롬프트**: rounded heart shape, glossy surface, subtle glow outline, floating icon, smooth curve
- **잘 어울리는 재질**: glossy plastic, soft matte silicone, translucent glass
- **추천 조명**: soft even studio light, warm subtle glow
- **추천 스타일**: 3D render, minimal app icon, cute flat illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid red pink color, clean gradient
- **피해야 할 키워드**: cluttered background, dark grunge tone, cracked texture, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy vivid red heart like icon with subtle glow, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 반짝이는 빨간 하트 좋아요 아이콘이 투명 배경 위에 은은한 그림자와 함께 떠 있는 3D 아이콘이 생성됩니다.

#### 북마크 (Bookmark)
- **영어 키워드**: `bookmark`
- **설명**: 저장, 즐겨찾기 기능을 나타내는 리본 모양 UI 오브젝트로 콘텐츠 앱에서 자주 사용됩니다.
- **추천 프롬프트**: ribbon tag shape, notched bottom edge, glossy surface, floating icon, smooth fold
- **잘 어울리는 재질**: glossy plastic, matte paper-like material, soft silicone
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat vector illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid accent color, clean gradient
- **피해야 할 키워드**: cluttered pattern, torn paper texture, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy vivid yellow bookmark ribbon icon with notched bottom, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 리본 모양의 광택 있는 노란 북마크 아이콘이 투명 배경 위에 깔끔하게 떠 있는 3D 아이콘이 생성됩니다.

#### 벨 (Bell)
- **영어 키워드**: `bell`
- **설명**: 알림 설정, 벨소리 온오프 등 소리/알림 관련 기능을 나타내는 UI 오브젝트입니다.
- **추천 프롬프트**: rounded bell shape, small clapper, glossy metallic surface, subtle ring wave lines
- **잘 어울리는 재질**: glossy metal, matte plastic, soft brushed gold
- **추천 조명**: soft even studio light, subtle metallic highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid accent color, clean gradient
- **피해야 할 키워드**: rusty texture, cluttered background, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy metallic bell icon with subtle ring wave lines, soft metallic highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 매끄러운 금속 질감의 벨 아이콘이 은은한 하이라이트와 함께 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 카메라 (Camera)
- **영어 키워드**: `camera`
- **설명**: 사진, 촬영 기능을 나타내는 UI 오브젝트로 소셜 앱과 콘텐츠 제작 도구에서 자주 쓰입니다.
- **추천 프롬프트**: rounded compact body, glossy lens circle, small flash dot, minimal button, floating icon
- **잘 어울리는 재질**: glossy plastic, matte metal body, soft rubber grip
- **추천 조명**: soft even studio light, subtle lens reflection highlight
- **추천 스타일**: 3D render, minimal app icon, cute flat illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid pastel color, clean gradient
- **피해야 할 키워드**: cluttered buttons, scratched texture, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy rounded camera icon with reflective lens circle, soft studio lighting, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 둥글둥글한 형태의 광택 있는 카메라 아이콘이 렌즈에 은은한 반사광을 담고 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 전화기 (Phone)
- **영어 키워드**: `smartphone`
- **설명**: 모바일, 통화, 앱 다운로드 등 스마트폰 관련 기능을 나타내는 대표적인 UI 오브젝트입니다.
- **추천 프롬프트**: rounded rectangle body, glossy screen, thin bezel, minimal home indicator, floating icon
- **잘 어울리는 재질**: glossy glass screen, matte aluminum frame, soft silicone edge
- **추천 조명**: soft even studio light, subtle screen glow
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, clean gradient, vivid accent color
- **피해야 할 키워드**: cracked screen, cluttered app icons, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy minimal smartphone icon with subtle screen glow, thin aluminum frame, soft studio lighting, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 얇은 베젤과 은은하게 빛나는 화면을 가진 미니멀한 스마트폰 아이콘이 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 노트북 (Laptop)
- **영어 키워드**: `laptop`
- **설명**: 업무, 재택근무, 기술 콘텐츠를 나타내는 대표적인 디바이스 오브젝트입니다.
- **추천 프롬프트**: open clamshell shape, glossy screen, minimal keyboard deck, thin edges, floating icon
- **잘 어울리는 재질**: matte aluminum body, glossy glass screen, soft rubber trim
- **추천 조명**: soft even studio light, subtle screen glow
- **추천 스타일**: 3D render, minimal app icon, isometric illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, clean gradient, vivid accent color
- **피해야 할 키워드**: cluttered desk items, cracked screen, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D isometric render of a glossy minimal laptop icon with subtle screen glow, matte aluminum body, soft studio lighting, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 은은하게 빛나는 화면을 가진 미니멀한 알루미늄 노트북 아이콘이 아이소메트릭 구도로 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 태블릿 (Tablet)
- **영어 키워드**: `tablet`
- **설명**: 크리에이티브 작업, 학습, 미디어 소비를 나타내는 디바이스 오브젝트입니다.
- **추천 프롬프트**: slim rectangle body, glossy screen, thin bezel, rounded corners, floating icon
- **잘 어울리는 재질**: glossy glass screen, matte aluminum frame, soft rubber edge
- **추천 조명**: soft even studio light, subtle screen glow
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, clean gradient, vivid accent color
- **피해야 할 키워드**: cracked screen, cluttered icons, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy slim tablet icon with subtle screen glow, thin aluminum frame, soft studio lighting, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 얇은 프레임과 은은한 화면 광을 가진 미니멀한 태블릿 아이콘이 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 마우스 (Mouse)
- **영어 키워드**: `computer mouse`
- **설명**: PC 작업, 게이밍 관련 기능을 나타내는 주변기기 오브젝트입니다.
- **추천 프롬프트**: ergonomic rounded body, glossy scroll wheel, smooth curve, minimal button seams, floating icon
- **잘 어울리는 재질**: glossy plastic, matte rubber grip, soft silicone
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, clean gradient, vivid accent color
- **피해야 할 키워드**: cluttered cable mess, scratched texture, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy ergonomic computer mouse icon with smooth curves, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 매끈한 곡선의 광택 있는 마우스 아이콘이 은은한 하이라이트와 함께 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 키보드 (Keyboard)
- **영어 키워드**: `keyboard`
- **설명**: 타이핑, 입력, 코딩 등 작업 도구를 나타내는 주변기기 오브젝트입니다.
- **추천 프롬프트**: rectangular key layout, glossy keycaps, minimal spacing, thin base, floating icon
- **잘 어울리는 재질**: matte plastic keycaps, glossy aluminum base, soft rubber underside
- **추천 조명**: soft even studio light, subtle key highlight
- **추천 스타일**: 3D render, minimal app icon, isometric illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, clean gradient, vivid accent color
- **피해야 할 키워드**: cluttered wires, dusty keys, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D isometric render of a glossy minimal keyboard icon with clean keycap layout, subtle key highlight, soft studio lighting, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 깔끔하게 배열된 키캡을 가진 미니멀한 키보드 아이콘이 아이소메트릭 구도로 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 폴더 (Folder)
- **영어 키워드**: `folder`
- **설명**: 파일 관리, 문서 정리 기능을 나타내는 대표적인 UI 오브젝트입니다.
- **추천 프롬프트**: rounded tab shape, glossy surface, slightly open flap, minimal fold line, floating icon
- **잘 어울리는 재질**: glossy plastic, matte paper-like material, soft silicone
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid accent color, clean gradient
- **피해야 할 키워드**: torn paper texture, cluttered stacked files, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy rounded folder icon with slightly open flap, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 살짝 열린 형태의 광택 있는 폴더 아이콘이 투명 배경 위에 은은한 그림자와 함께 떠 있는 3D 아이콘이 생성됩니다.

#### 파일 (File)
- **영어 키워드**: `document file`
- **설명**: 문서, 첨부파일 기능을 나타내는 UI 오브젝트로 폴더와 짝을 이뤄 자주 사용됩니다.
- **추천 프롬프트**: rectangular page shape, folded top corner, glossy surface, minimal text lines, floating icon
- **잘 어울리는 재질**: glossy plastic, matte paper texture, soft acrylic
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid accent color, clean gradient
- **피해야 할 키워드**: crumpled paper texture, cluttered text, dark grunge tone, harsh shadow
- **예시 완성 프롬프트**: `3D render of a glossy document file icon with folded top corner and minimal text lines, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 모서리가 살짝 접힌 광택 있는 문서 파일 아이콘이 투명 배경 위에 깔끔하게 떠 있는 3D 아이콘이 생성됩니다.

#### 다운로드 (Download)
- **영어 키워드**: `download arrow`
- **설명**: 파일 저장, 다운로드 기능을 나타내는 화살표 기반 UI 오브젝트입니다.
- **추천 프롬프트**: downward arrow shape, tray base line, glossy surface, minimal rounded edges, floating icon
- **잘 어울리는 재질**: glossy plastic, matte metal, soft silicone
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid accent color, clean gradient
- **피해야 할 키워드**: cluttered progress bar, dark grunge tone, harsh shadow, busy background
- **예시 완성 프롬프트**: `3D render of a glossy download arrow icon with tray base, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 아래를 향한 화살표와 트레이 형태가 결합된 광택 있는 다운로드 아이콘이 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

#### 업로드 (Upload)
- **영어 키워드**: `upload arrow`
- **설명**: 파일 전송, 업로드 기능을 나타내는 화살표 기반 UI 오브젝트로 다운로드 아이콘과 대칭을 이룹니다.
- **추천 프롬프트**: upward arrow shape, tray base line, glossy surface, minimal rounded edges, floating icon
- **잘 어울리는 재질**: glossy plastic, matte metal, soft silicone
- **추천 조명**: soft even studio light, subtle top highlight
- **추천 스타일**: 3D render, minimal app icon, flat UI illustration
- **함께 쓰면 좋은 키워드**: transparent background, floating composition, soft drop shadow, vivid accent color, clean gradient
- **피해야 할 키워드**: cluttered progress bar, dark grunge tone, harsh shadow, busy background
- **예시 완성 프롬프트**: `3D render of a glossy upload arrow icon with tray base, soft top highlight, transparent background, floating composition, soft drop shadow, high quality`
- **생성 예시 설명**: 위를 향한 화살표와 트레이 형태가 결합된 광택 있는 업로드 아이콘이 투명 배경 위에 떠 있는 3D 아이콘이 생성됩니다.

### Travel

#### 비행기 (Airplane)
- **영어 키워드**: `airplane`
- **설명**: 여행, 휴가, 출장, 항공 서비스 등을 상징하는 아이콘으로, 여행 앱이나 항공권 예약 서비스의 대표 이미지로 자주 쓰인다.
- **추천 프롬프트**: side view, flying pose, jet engine, wings, clouds, propeller
- **잘 어울리는 재질**: glossy plastic, brushed metal, matte plastic
- **추천 조명**: soft studio lighting, rim light
- **추천 스타일**: 3d icon, isometric
- **함께 쓰면 좋은 키워드**: pastel blue background, fluffy clouds, dynamic angle, gradient sky, soft shadow
- **피해야 할 키워드**: photorealistic military, dark gritty, cluttered background
- **예시 완성 프롬프트**: `3D airplane icon, glossy white and blue plastic material, flying pose with clouds, soft studio lighting, isometric view, pastel blue gradient background, clean composition, high quality render, 4k`
- **생성 예시 설명**: 파란 하늘 배경 위에 통통하고 귀여운 형태의 흰색-파란색 비행기가 구름과 함께 떠 있는 깔끔한 3D 아이콘 이미지가 생성된다.

#### 여권 (Passport)
- **영어 키워드**: `passport`
- **설명**: 해외여행, 출입국, 신분증명을 상징하며 여행 예약 서비스나 출국 안내 콘텐츠에 활용된다.
- **추천 프롬프트**: closed book shape, stamped cover, travel stickers, boarding pass peeking out
- **잘 어울리는 재질**: leather texture, matte paper, embossed cover
- **추천 조명**: soft top light, warm light
- **추천 스타일**: 3d icon, flat design
- **함께 쓰면 좋은 키워드**: passport stamps, world map background, plane ticket beside, warm tone
- **피해야 할 키워드**: torn pages, dirty texture, harsh shadow
- **예시 완성 프롬프트**: `3D passport icon, navy blue leather texture cover with embossed gold emblem, small travel stamps and boarding pass peeking out, soft warm lighting, flat 3d style, pastel background, clean composition, high quality render`
- **생성 예시 설명**: 네이비색 가죽 질감의 여권 표지에 금색 엠블럼과 도장이 살짝 보이는 아기자기한 3D 아이콘이 생성된다.

#### 티켓 (Ticket)
- **영어 키워드**: `ticket`
- **설명**: 항공권, 기차표, 이벤트 입장권 등 예약과 이동을 나타내는 오브젝트로 여행/예매 서비스에 자주 쓰인다.
- **추천 프롬프트**: perforated edge, boarding pass shape, barcode, torn stub
- **잘 어울리는 재질**: glossy paper, matte cardstock
- **추천 조명**: soft studio lighting
- **추천 스타일**: 3d icon, flat design
- **함께 쓰면 좋은 키워드**: dotted cut line, small airplane icon print, pastel color palette, floating composition
- **피해야 할 키워드**: crumpled paper, faded print, blurry text
- **예시 완성 프롬프트**: `3D boarding pass ticket icon, glossy pastel yellow cardstock with perforated edge and small airplane print, soft studio lighting, floating at slight angle, flat 3d style, clean pastel background, high quality render`
- **생성 예시 설명**: 노란색 파스텔톤 카드지 질감의 탑승권이 살짝 기울어진 채 떠 있는 깔끔한 3D 아이콘 이미지가 나온다.

#### 나침반 (Compass)
- **영어 키워드**: `compass`
- **설명**: 방향, 탐험, 모험을 상징하며 여행 앱의 네비게이션이나 어드벤처 콘텐츠 아이콘으로 적합하다.
- **추천 프롬프트**: needle pointing north, round dial, engraved markings, brass casing
- **잘 어울리는 재질**: brushed brass, polished metal, glass cover
- **추천 조명**: warm rim light, studio lighting
- **추천 스타일**: 3d icon, vintage style
- **함께 쓰면 좋은 키워드**: map background, leather strap, warm golden tone, subtle reflection
- **피해야 할 키워드**: rusty texture, cracked glass, dark moody background
- **예시 완성 프롬프트**: `3D compass icon, brushed brass casing with glass cover and red needle, engraved directional markings, warm studio lighting, vintage 3d style, soft beige background, high quality render`
- **생성 예시 설명**: 황동 재질의 나침반이 붉은 바늘과 함께 따뜻한 조명 아래 놓여 있는 빈티지풍 3D 아이콘이 생성된다.

#### 여행가방 (Suitcase)
- **영어 키워드**: `suitcase`
- **설명**: 짐, 출장, 휴가 준비를 상징하는 오브젝트로 여행 플랫폼의 예약/패킹 관련 콘텐츠에 적합하다.
- **추천 프롬프트**: rolling wheels, extended handle, luggage tag, buckle straps
- **잘 어울리는 재질**: hard shell glossy plastic, matte plastic, leather trim
- **추천 조명**: soft studio lighting, rim light
- **추천 스타일**: 3d icon, cute rounded style
- **함께 쓰면 좋은 키워드**: pastel color palette, travel stickers, sunglasses beside, tropical background
- **피해야 할 키워드**: scratched surface, broken wheel, dark grungy texture
- **예시 완성 프롬프트**: `3D suitcase icon, glossy pastel coral hard shell with rounded corners, extended handle and luggage tag, soft studio lighting, cute rounded 3d style, tropical pastel background, high quality render`
- **생성 예시 설명**: 코랄색 광택 하드쉘 여행가방이 동그란 귀여운 형태로 표현된 트로피컬 배경의 3D 아이콘이 생성된다.

#### 지구본 (Globe)
- **영어 키워드**: `globe`
- **설명**: 세계여행, 글로벌 서비스, 목적지 탐색을 상징하며 여행 앱 메인 아이콘으로 널리 쓰인다.
- **추천 프롬프트**: rotating sphere, continents outline, wooden stand, meridian lines
- **잘 어울리는 재질**: glossy glass sphere, polished wood base, matte plastic continents
- **추천 조명**: soft studio lighting, subtle glow
- **추천 스타일**: 3d icon, isometric
- **함께 쓰면 좋은 키워드**: airplane orbiting, pastel ocean blue, floating pins, soft shadow
- **피해야 할 키워드**: overly detailed realistic terrain, dark background, harsh contrast
- **예시 완성 프롬프트**: `3D globe icon, glossy blue glass sphere with cute rounded continents and wooden stand, small airplane orbiting around it, soft studio lighting, isometric 3d style, pastel sky background, high quality render`
- **생성 예시 설명**: 파란 유리 재질의 지구본 주위로 작은 비행기가 도는 아이소메트릭 3D 아이콘 이미지가 생성된다.

#### 지도 (Map)
- **영어 키워드**: `map`
- **설명**: 여행 경로, 목적지 탐색, 길찾기를 상징하며 지도 서비스나 여행 계획 콘텐츠에 활용된다.
- **추천 프롬프트**: folded paper texture, dotted route line, location pin, compass rose corner
- **잘 어울리는 재질**: folded paper, matte cardstock
- **추천 조명**: soft top lighting
- **추천 스타일**: 3d icon, flat design
- **함께 쓰면 좋은 키워드**: pastel color palette, small pin marker, floating composition, warm tone
- **피해야 할 키워드**: overly complex realistic cartography, torn edges, dark grunge
- **예시 완성 프롬프트**: `3D folded paper map icon, cream matte cardstock with dotted travel route and red location pin, compass rose in corner, soft warm lighting, flat 3d style, pastel background, high quality render`
- **생성 예시 설명**: 크림색 종이 질감의 접힌 지도 위에 점선 경로와 빨간 핀이 표시된 아기자기한 3D 아이콘이 생성된다.

#### 호텔 (Hotel)
- **영어 키워드**: `hotel`
- **설명**: 숙박, 예약 서비스를 상징하며 여행 앱의 숙소 카테고리 아이콘으로 적합하다.
- **추천 프롬프트**: miniature building shape, rounded windows, bell icon on roof, small door
- **잘 어울리는 재질**: glossy plastic building, glass windows, matte rooftop
- **추천 조명**: soft studio lighting, warm ambient glow
- **추천 스타일**: 3d icon, miniature building style
- **함께 쓰면 좋은 키워드**: pastel color palette, small palm tree beside, soft shadow, welcoming mood
- **피해야 할 키워드**: photorealistic skyscraper, dark night scene, cluttered signage
- **예시 완성 프롬프트**: `3D hotel building icon, cute miniature glossy pastel pink building with rounded windows and small bell sign on roof, soft warm studio lighting, isometric 3d style, pastel sky background, high quality render`
- **생성 예시 설명**: 분홍빛 파스텔톤의 아담한 호텔 건물 미니어처가 벨 아이콘과 함께 놓인 귀여운 3D 아이콘이 생성된다.

#### 기차 (Train)
- **영어 키워드**: `train`
- **설명**: 기차여행, 철도 예약 서비스를 상징하며 교통수단 카테고리 아이콘으로 쓰인다.
- **추천 프롬프트**: rounded locomotive shape, small windows, front headlight, connected cars
- **잘 어울리는 재질**: glossy plastic body, matte metal wheels
- **추천 조명**: soft studio lighting
- **추천 스타일**: 3d icon, cute rounded style
- **함께 쓰면 좋은 키워드**: pastel color palette, railway track base, small smoke puff, side view
- **피해야 할 키워드**: photorealistic industrial train, rust texture, dark smoke
- **예시 완성 프롬프트**: `3D train icon, glossy pastel yellow rounded locomotive with small windows and front headlight, sitting on simple railway track, soft studio lighting, cute 3d style, pastel background, high quality render`
- **생성 예시 설명**: 노란색 광택 재질의 동글동글한 기차가 간단한 철로 위에 놓인 귀여운 3D 아이콘이 생성된다.

#### 자동차 (Car)
- **영어 키워드**: `car`
- **설명**: 자동차 여행, 렌터카 서비스, 로드트립을 상징하는 오브젝트로 이동수단 카테고리에 자주 쓰인다.
- **추천 프롬프트**: rounded car body, big headlights, small wheels, side view
- **잘 어울리는 재질**: glossy plastic body, chrome trim, matte tires
- **추천 조명**: soft studio lighting, rim light
- **추천 스타일**: 3d icon, cute rounded style
- **함께 쓰면 좋은 키워드**: pastel color palette, road base line, soft shadow, three-quarter angle
- **피해야 할 키워드**: photorealistic sports car, dark asphalt background, harsh reflection
- **예시 완성 프롬프트**: `3D car icon, glossy pastel mint rounded car body with chrome trim and big round headlights, three-quarter view, soft studio lighting, cute 3d style, pastel background, high quality render`
- **생성 예시 설명**: 민트색 광택 재질의 동글동글한 자동차가 살짝 측면 각도로 놓인 귀여운 3D 아이콘이 생성된다.

### Weather

#### 비 (Rain)
- **영어 키워드**: `rain`
- **설명**: 비 오는 날씨, 우울하거나 청량한 감성을 표현할 때 쓰이며 날씨 앱이나 계절 콘텐츠에 활용된다.
- **추천 프롬프트**: falling raindrops, fluffy cloud, glossy droplet shape, motion lines
- **잘 어울리는 재질**: glossy water droplets, translucent glass cloud
- **추천 조명**: soft cool lighting, subtle glow
- **추천 스타일**: 3d icon, semi-realistic
- **함께 쓰면 좋은 키워드**: pastel blue-grey background, small umbrella beside, soft reflection, gentle motion blur
- **피해야 할 키워드**: stormy dark scene, muddy ground, harsh lightning
- **예시 완성 프롬프트**: `3D rain cloud icon, glossy grey-blue fluffy cloud with translucent falling raindrops, soft cool studio lighting, semi-realistic 3d style, pastel sky background, high quality render`
- **생성 예시 설명**: 회청색의 통통한 구름에서 투명한 물방울이 떨어지는 청량한 느낌의 3D 아이콘이 생성된다.

#### 눈 (Snow)
- **영어 키워드**: `snow`
- **설명**: 겨울, 크리스마스 시즌, 차가운 계절감을 표현할 때 쓰이며 겨울 이벤트 콘텐츠에 적합하다.
- **추천 프롬프트**: snowflake shape, soft snowdrift, sparkle highlight, tiny ice crystals
- **잘 어울리는 재질**: frosted glass, glossy ice crystal, soft matte snow
- **추천 조명**: cool soft lighting, subtle sparkle highlight
- **추천 스타일**: 3d icon, cute style
- **함께 쓰면 좋은 키워드**: pastel icy blue background, glitter particles, soft shadow, winter mood
- **피해야 할 키워드**: dirty slush, dark grey sky, harsh cold tone overload
- **예시 완성 프롬프트**: `3D snowflake icon, frosted glass texture with sparkling ice crystal details, soft cool lighting with subtle sparkle highlights, cute 3d style, pastel icy blue background, high quality render`
- **생성 예시 설명**: 반투명한 서리 유리 질감의 눈 결정체가 은은하게 반짝이는 겨울 분위기의 3D 아이콘이 생성된다.

#### 번개 (Lightning)
- **영어 키워드**: `lightning`
- **설명**: 에너지, 속도, 강렬함을 상징하며 전력/스피드 관련 서비스나 임팩트 있는 UI 아이콘으로 쓰인다.
- **추천 프롬프트**: bolt shape, glowing edge, dynamic diagonal pose, spark particles
- **잘 어울리는 재질**: glossy yellow plastic, translucent glowing glass
- **추천 조명**: dramatic glow, backlight, neon rim light
- **추천 스타일**: 3d icon, bold cartoon style
- **함께 쓰면 좋은 키워드**: dark purple background for contrast, energy glow effect, motion streaks
- **피해야 할 키워드**: overly realistic storm scene, muddy colors, cluttered background
- **예시 완성 프롬프트**: `3D lightning bolt icon, glossy yellow plastic material with glowing translucent edges, dynamic diagonal pose with spark particles, dramatic neon rim lighting, bold cartoon 3d style, dark purple gradient background, high quality render`
- **생성 예시 설명**: 노란색 광택 번개 모양이 보라색 배경 위에서 강렬하게 빛나는 임팩트 있는 3D 아이콘이 생성된다.

#### 바람 (Wind)
- **영어 키워드**: `wind`
- **설명**: 상쾌함, 가벼움, 움직임을 상징하며 공기청정/환기 서비스나 계절 콘텐츠에 활용된다.
- **추천 프롬프트**: swirling curved lines, floating leaves, soft cloud puff, motion swirl shape
- **잘 어울리는 재질**: translucent glass swirl, soft matte cloud
- **추천 조명**: soft ambient lighting, subtle glow
- **추천 스타일**: 3d icon, minimal style
- **함께 쓰면 좋은 키워드**: pastel mint background, floating leaf accent, gentle curve composition
- **피해야 할 키워드**: chaotic storm debris, dark stormy sky, harsh sharp edges
- **예시 완성 프롬프트**: `3D wind swirl icon, translucent pale blue glass swirl shape with soft floating leaves, gentle ambient lighting, minimal 3d style, pastel mint background, high quality render`
- **생성 예시 설명**: 연한 하늘색의 투명한 소용돌이 모양과 나뭇잎이 함께 떠 있는 산뜻한 3D 아이콘이 생성된다.

#### 불 (Fire)
- **영어 키워드**: `fire`
- **설명**: 열정, 에너지, 따뜻함을 상징하며 요리/캠핑/트렌딩 콘텐츠 아이콘으로 자주 쓰인다.
- **추천 프롬프트**: flame shape, glowing core, layered gradient orange-yellow, small spark particles
- **잘 어울리는 재질**: glossy translucent flame, glowing glass core
- **추천 조명**: warm glow, dramatic backlight
- **추천 스타일**: 3d icon, cute cartoon style
- **함께 쓰면 좋은 키워드**: dark background for glow contrast, warm gradient, soft ember particles
- **피해야 할 키워드**: realistic wildfire scene, smoke heavy, ash and destruction imagery
- **예시 완성 프롬프트**: `3D flame icon, glossy translucent orange-yellow flame with glowing core and layered gradient, small ember particles, warm dramatic backlighting, cute cartoon 3d style, dark background for contrast, high quality render`
- **생성 예시 설명**: 주황빛으로 은은하게 빛나는 귀여운 불꽃 모양이 어두운 배경 위에서 도드라지는 3D 아이콘이 생성된다.

#### 얼음 (Ice)
- **영어 키워드**: `ice`
- **설명**: 차가움, 청량함, 시원한 이미지를 상징하며 음료/여름 콘텐츠에 자주 쓰인다.
- **추천 프롬프트**: ice cube shape, transparent glossy surface, sparkle highlight, subtle crack lines
- **잘 어울리는 재질**: transparent glossy ice, frosted glass texture
- **추천 조명**: cool soft lighting, sparkle highlight
- **추천 스타일**: 3d icon, semi-realistic
- **함께 쓰면 좋은 키워드**: pastel icy blue background, water droplet accent, cool tone reflection
- **피해야 할 키워드**: dirty melted puddle, warm color clash, cluttered composition
- **예시 완성 프롬프트**: `3D ice cube icon, transparent glossy ice texture with subtle crack lines and sparkle highlights, cool soft studio lighting, semi-realistic 3d style, pastel icy blue background, high quality render`
- **생성 예시 설명**: 투명하고 반짝이는 얼음 큐브가 차가운 파란 배경 위에 놓인 청량한 3D 아이콘이 생성된다.

#### 물보라 (Water Splash)
- **영어 키워드**: `water splash`
- **설명**: 상쾌함, 청결, 여름 액티비티를 상징하며 음료/스킨케어/여름 이벤트 콘텐츠에 쓰인다.
- **추천 프롬프트**: dynamic splash shape, droplets flying, translucent blue gradient, motion curve
- **잘 어울리는 재질**: translucent glossy water, soft droplet shapes
- **추천 조명**: soft studio lighting, subtle refraction glow
- **추천 스타일**: 3d icon, dynamic style
- **함께 쓰면 좋은 키워드**: pastel blue background, floating droplet accents, fresh clean composition
- **피해야 할 키워드**: murky dirty water, dark background, chaotic overcrowded splash
- **예시 완성 프롬프트**: `3D water splash icon, translucent glossy blue splash with dynamic flying droplets, soft studio lighting with subtle refraction glow, dynamic 3d style, clean pastel background, high quality render`
- **생성 예시 설명**: 투명한 파란빛 물보라가 역동적으로 튀어오르는 청량한 느낌의 3D 아이콘이 생성된다.

### Celebration

#### 크리스마스 (Christmas)
- **영어 키워드**: `christmas`
- **설명**: 크리스마스 시즌 프로모션, 연말 이벤트 배너에 쓰이는 테마로 트리, 선물, 오너먼트 등의 오브젝트로 표현된다.
- **추천 프롬프트**: mini christmas tree, gift boxes, ornament balls, string lights, snow dust
- **잘 어울리는 재질**: glossy ornament glass, matte tree texture, ribbon fabric
- **추천 조명**: warm fairy light glow, soft studio lighting
- **추천 스타일**: 3d icon, festive cute style
- **함께 쓰면 좋은 키워드**: red and green pastel palette, gold ribbon accent, soft snow particles, cozy warm tone
- **피해야 할 키워드**: dark gothic tone, cluttered messy composition, faded colors
- **예시 완성 프롬프트**: `3D Christmas tree icon with glossy ornament balls, wrapped gift boxes and gold ribbon underneath, warm fairy light glow, soft snow dust particles, festive cute 3d style, pastel red and green background, high quality render`
- **생성 예시 설명**: 반짝이는 오너먼트가 달린 미니 크리스마스 트리와 선물 상자가 따뜻한 조명 아래 놓인 아기자기한 3D 크리스마스 테마 아이콘이 생성된다.

#### 할로윈 (Halloween)
- **영어 키워드**: `halloween`
- **설명**: 할로윈 시즌 이벤트, 트릭오어트릿 프로모션에 쓰이는 테마로 호박, 유령 등의 오브젝트로 표현된다.
- **추천 프롬프트**: jack-o-lantern pumpkin, cute ghost shape, candy pieces, small bat accent
- **잘 어울리는 재질**: glossy pumpkin surface, matte fabric ghost, translucent glow
- **추천 조명**: warm orange glow, soft moody backlight
- **추천 스타일**: 3d icon, cute spooky style
- **함께 쓰면 좋은 키워드**: pastel purple-orange palette, soft glow accent, playful spooky mood
- **피해야 할 키워드**: gory horror imagery, dark realistic scene, disturbing content
- **예시 완성 프롬프트**: `3D jack-o-lantern pumpkin icon with glossy orange surface and carved cute face, small cute ghost floating beside, warm orange glow lighting, cute spooky 3d style, pastel purple background, high quality render`
- **생성 예시 설명**: 귀여운 표정의 호박 랜턴과 작은 유령 캐릭터가 함께 있는 사랑스러운 할로윈 테마 3D 아이콘이 생성된다.

#### 부활절 (Easter)
- **영어 키워드**: `easter`
- **설명**: 봄 시즌 이벤트, 부활절 프로모션에 쓰이는 테마로 계란, 토끼 등의 오브젝트로 표현된다.
- **추천 프롬프트**: decorated easter egg, cute bunny ears, small flower accents, grass basket
- **잘 어울리는 재질**: glossy painted egg shell, soft matte fabric bunny
- **추천 조명**: soft spring lighting, gentle pastel glow
- **추천 스타일**: 3d icon, cute style
- **함께 쓰면 좋은 키워드**: pastel spring color palette, floral accents, soft basket composition
- **피해야 할 키워드**: dark heavy tone, religious iconography, cluttered composition
- **예시 완성 프롬프트**: `3D decorated Easter egg icon, glossy pastel pink and mint painted pattern, sitting in a small grass basket with cute bunny ears peeking beside, soft spring lighting, cute 3d style, pastel yellow background, high quality render`
- **생성 예시 설명**: 파스텔톤으로 장식된 부활절 달걀이 작은 토끼 귀와 함께 바구니에 담긴 사랑스러운 봄 테마 3D 아이콘이 생성된다.

#### 발렌타인데이 (Valentine's Day)
- **영어 키워드**: `valentine's day`
- **설명**: 사랑, 로맨틱 프로모션에 쓰이는 테마로 하트, 초콜릿, 장미 등의 오브젝트로 표현된다.
- **추천 프롬프트**: heart shape, chocolate box, rose petals, ribbon bow
- **잘 어울리는 재질**: glossy chocolate, satin ribbon, soft velvet rose petal
- **추천 조명**: warm soft romantic lighting, subtle glow
- **추천 스타일**: 3d icon, cute romantic style
- **함께 쓰면 좋은 키워드**: pastel pink and red palette, soft glow accent, romantic warm tone
- **피해야 할 키워드**: dark somber tone, sharp aggressive shapes, cluttered background
- **예시 완성 프롬프트**: `3D glossy red heart icon with satin ribbon bow, small chocolate box and rose petals beside, warm romantic soft lighting, cute 3d style, pastel pink background, high quality render`
- **생성 예시 설명**: 광택 있는 빨간 하트와 리본, 초콜릿 상자가 함께 놓인 로맨틱한 발렌타인 테마 3D 아이콘이 생성된다.

#### 생일 (Birthday)
- **영어 키워드**: `birthday`
- **설명**: 생일 축하, 파티 프로모션에 쓰이는 테마로 케이크, 풍선, 폭죽 등의 오브젝트로 표현된다.
- **추천 프롬프트**: layered birthday cake, lit candle, confetti particles, small balloons
- **잘 어울리는 재질**: glossy frosting cake, matte balloon, glitter confetti
- **추천 조명**: warm festive lighting, soft glow
- **추천 스타일**: 3d icon, cute festive style
- **함께 쓰면 좋은 키워드**: pastel rainbow palette, confetti scatter, playful festive mood
- **피해야 할 키워드**: dark somber tone, melted messy cake, cluttered background
- **예시 완성 프롬프트**: `3D birthday cake icon, glossy pastel frosting layers with lit candle on top, colorful confetti particles and small balloons floating around, warm festive lighting, cute 3d style, pastel rainbow background, high quality render`
- **생성 예시 설명**: 촛불이 켜진 파스텔톤 케이크와 색색의 컨페티, 풍선이 어우러진 경쾌한 생일 테마 3D 아이콘이 생성된다.

#### 졸업 (Graduation)
- **영어 키워드**: `graduation`
- **설명**: 졸업 축하, 학사 관련 프로모션에 쓰이는 테마로 학사모, 졸업장 등의 오브젝트로 표현된다.
- **추천 프롬프트**: graduation cap shape, tassel detail, rolled diploma, ribbon tie
- **잘 어울리는 재질**: matte fabric cap, glossy tassel, paper diploma scroll
- **추천 조명**: soft warm studio lighting
- **추천 스타일**: 3d icon, cute formal style
- **함께 쓰면 좋은 키워드**: pastel navy and gold palette, confetti accent, celebratory mood
- **피해야 할 키워드**: dark academic gothic tone, cluttered background, faded colors
- **예시 완성 프롬프트**: `3D graduation cap icon, matte navy fabric texture with glossy gold tassel, small rolled diploma scroll tied with ribbon beside, soft warm studio lighting, cute formal 3d style, pastel gold background, high quality render`
- **생성 예시 설명**: 금색 술이 달린 남색 학사모와 리본으로 묶인 졸업장이 함께 놓인 산뜻한 졸업 테마 3D 아이콘이 생성된다.

#### 새해 (New Year)
- **영어 키워드**: `new year`
- **설명**: 새해맞이, 카운트다운 프로모션에 쓰이는 테마로 폭죽, 시계, 샴페인 등의 오브젝트로 표현된다.
- **추천 프롬프트**: firework burst shape, countdown clock, champagne glass, confetti sparkle
- **잘 어울리는 재질**: glossy firework glow, sparkling glass champagne, metallic clock
- **추천 조명**: dramatic festive glow, soft night sparkle
- **추천 스타일**: 3d icon, celebratory style
- **함께 쓰면 좋은 키워드**: pastel gold and navy palette, sparkle particles, festive night mood
- **피해야 할 키워드**: dark chaotic explosion imagery, realistic alcohol branding, cluttered scene
- **예시 완성 프롬프트**: `3D firework burst icon glowing gold and pink, small countdown clock and sparkling champagne glass beside, festive glow lighting, celebratory 3d style, pastel navy night background, high quality render`
- **생성 예시 설명**: 금빛과 분홍빛으로 터지는 폭죽과 시계, 샴페인 잔이 함께 있는 축제 분위기의 새해 테마 3D 아이콘이 생성된다.

---

## PART 11. Style Presets

### 프리미엄 플라스틱 (Premium Plastic)
- **구성 키워드**: glossy premium plastic material, smooth rounded surface, soft studio lighting, subtle reflection, clean gradient background, high quality 3d render, 4k
- **설명**: 고급스럽고 매끈한 광택 플라스틱 질감으로 프리미엄 브랜드 제품이나 고급 앱 아이콘에 어울리는 톤을 만든다.
- **잘 어울리는 오브젝트**: 자동차(car), 여행가방(suitcase)
- **피해야 할 키워드**: matte rough texture, cheap plastic look, dirty scratched surface
- **예시 프롬프트**: `3D suitcase icon, glossy premium plastic material with smooth rounded surface and subtle reflection, soft studio lighting, clean pastel gradient background, high quality 3d render, 4k`
- **생성 예시 설명**: 매끄럽고 광택이 도는 고급스러운 플라스틱 재질의 여행가방 아이콘이 깔끔한 배경 위에 생성된다.

### 매트 플라스틱 (Matte Plastic)
- **구성 키워드**: matte plastic material, soft non-reflective surface, even soft lighting, subtle shadow, clean pastel background, high quality 3d render
- **설명**: 반사가 거의 없는 부드러운 무광 질감으로 차분하고 모던한 무드의 아이콘에 적합하다.
- **잘 어울리는 오브젝트**: 나침반(compass), 지도(map)
- **피해야 할 키워드**: glossy shine, mirror reflection, chrome metallic look
- **예시 프롬프트**: `3D compass icon, matte plastic material with soft non-reflective surface, even soft studio lighting, subtle shadow, clean pastel beige background, high quality 3d render`
- **생성 예시 설명**: 반사 없이 차분한 무광 플라스틱 질감의 나침반 아이콘이 부드러운 그림자와 함께 생성된다.

### 소프트 플라스틱 (Soft Plastic)
- **구성 키워드**: soft matte plastic, rounded puffy shape, subtle silicone-like texture, gentle diffused lighting, pastel background, high quality 3d render
- **설명**: 실리콘처럼 부드럽고 통통한 질감으로 친근하고 아기자기한 캐릭터형 아이콘에 잘 어울린다.
- **잘 어울리는 오브젝트**: 생일 케이크(birthday), 풍선(balloon)
- **피해야 할 키워드**: hard glossy shine, sharp metallic edge, rigid industrial look
- **예시 프롬프트**: `3D birthday cake icon, soft matte plastic material with rounded puffy layers, gentle diffused lighting, cute 3d style, pastel rainbow background, high quality render`
- **생성 예시 설명**: 실리콘처럼 말랑해 보이는 부드러운 질감의 케이크 아이콘이 파스텔 배경 위에 생성된다.

### 젤리 (Jelly)
- **구성 키워드**: translucent jelly material, glossy wobbly surface, soft internal glow, bright soft lighting, colorful pastel background, high quality 3d render
- **설명**: 반투명하고 탱글탱글한 젤리 질감으로 발랄하고 재미있는 무드의 디자인 에셋에 적합하다.
- **잘 어울리는 오브젝트**: 하트(valentine's day), 얼음(ice)
- **피해야 할 키워드**: opaque matte surface, dry rough texture, dark heavy tone
- **예시 프롬프트**: `3D heart icon, translucent glossy jelly material with soft wobbly surface and internal glow, bright soft studio lighting, colorful pastel pink background, high quality 3d render`
- **생성 예시 설명**: 반투명하고 탱글탱글한 젤리 질감의 하트 아이콘이 은은한 광택과 함께 생성된다.

### 크리스탈 글라스 (Crystal Glass)
- **구성 키워드**: clear crystal glass material, sharp refractive facets, sparkling highlights, studio lighting with caustics, clean dark background, high quality 3d render
- **설명**: 투명하고 정교하게 커팅된 크리스탈 질감으로 고급스럽고 화려한 인상을 주는 프리미엄 에셋에 어울린다.
- **잘 어울리는 오브젝트**: 지구본(globe), 얼음(ice)
- **피해야 할 키워드**: opaque matte surface, cheap plastic look, dull flat lighting
- **예시 프롬프트**: `3D globe icon, clear crystal glass material with sharp refractive facets and sparkling highlights, studio lighting with subtle caustics, clean dark gradient background, high quality 3d render`
- **생성 예시 설명**: 투명하고 정교하게 빛나는 크리스탈 지구본이 은은한 반사광과 함께 고급스럽게 생성된다.

### 프로스티드 글라스 (Frosted Glass)
- **구성 키워드**: frosted translucent glass material, soft diffused surface, gentle soft lighting, subtle inner glow, clean minimal background, high quality 3d render
- **설명**: 반투명하고 부드럽게 흐려진 유리 질감으로 은은하고 세련된 무드를 표현하는데 적합하다.
- **잘 어울리는 오브젝트**: 눈(snow), 얼음(ice)
- **피해야 할 키워드**: sharp clear reflection, high gloss shine, harsh contrast lighting
- **예시 프롬프트**: `3D snowflake icon, frosted translucent glass material with soft diffused surface and subtle inner glow, gentle soft lighting, clean minimal icy blue background, high quality 3d render`
- **생성 예시 설명**: 뿌옇게 흐려진 반투명 유리 질감의 눈 결정체 아이콘이 은은한 조명 아래 생성된다.

### 클레이 (Clay)
- **구성 키워드**: matte clay material, soft rounded sculpted shape, subtle fingerprint texture, warm soft lighting, pastel background, high quality 3d render
- **설명**: 손으로 빚은 듯한 부드러운 점토 질감으로 따뜻하고 수공예적인 느낌의 캐주얼 일러스트에 어울린다.
- **잘 어울리는 오브젝트**: 호텔(hotel), 캐릭터형 오브젝트
- **피해야 할 키워드**: glossy shine, metallic reflection, sharp hard edges
- **예시 프롬프트**: `3D hotel building icon, matte clay material with soft rounded sculpted shape and subtle fingerprint texture, warm soft studio lighting, cute 3d style, pastel background, high quality render`
- **생성 예시 설명**: 손으로 빚은 듯한 따뜻한 점토 질감의 호텔 건물 아이콘이 부드러운 조명 아래 생성된다.

### 풍선 (Balloon)
- **구성 키워드**: glossy stretched balloon material, thin latex sheen, soft highlight reflection, bright soft lighting, festive pastel background, high quality 3d render
- **설명**: 팽팽하게 늘어난 얇은 풍선 재질 표현으로 경쾌하고 축제 같은 무드를 만든다.
- **잘 어울리는 오브젝트**: 생일(birthday), 새해(new year)
- **피해야 할 키워드**: matte rough surface, deflated wrinkled shape, dark somber tone
- **예시 프롬프트**: `3D number one icon shaped like a stretched balloon, glossy latex sheen with soft highlight reflection, bright festive lighting, pastel rainbow background, high quality 3d render`
- **생성 예시 설명**: 팽팽하게 부풀어 광택이 도는 풍선 재질의 숫자 오브젝트가 경쾌한 배경 위에 생성된다.

### 크롬 (Chrome)
- **구성 키워드**: polished chrome metal material, mirror-like reflective surface, sharp studio lighting with highlights, dark clean background, high quality 3d render
- **설명**: 거울처럼 반사되는 크롬 금속 질감으로 미래적이고 강렬한 인상을 주는 하이엔드 디자인에 어울린다.
- **잘 어울리는 오브젝트**: 번개(lightning), 자동차(car)
- **피해야 할 키워드**: matte flat surface, soft pastel tone, warm rustic texture
- **예시 프롬프트**: `3D lightning bolt icon, polished chrome metal material with mirror-like reflective surface, sharp dramatic studio lighting, dark clean gradient background, high quality 3d render`
- **생성 예시 설명**: 거울처럼 반짝이는 크롬 재질의 번개 아이콘이 어두운 배경 위에서 강렬하게 생성된다.

### 골드 (Gold)
- **구성 키워드**: polished gold metal material, warm metallic sheen, engraved fine details, warm dramatic lighting, dark luxurious background, high quality 3d render
- **설명**: 광택이 도는 금속 골드 질감으로 고급스럽고 특별한 느낌을 강조하는 프리미엄/기념 콘텐츠에 어울린다.
- **잘 어울리는 오브젝트**: 나침반(compass), 졸업(graduation)
- **피해야 할 키워드**: dull matte surface, cheap plastic look, pastel soft tone
- **예시 프롬프트**: `3D compass icon, polished gold metal material with warm metallic sheen and engraved fine details, warm dramatic studio lighting, dark luxurious gradient background, high quality 3d render`
- **생성 예시 설명**: 금빛으로 은은하게 빛나는 고급스러운 금속 나침반 아이콘이 어두운 배경 위에서 돋보이게 생성된다.

### 세라믹 (Ceramic)
- **구성 키워드**: smooth glossy ceramic material, subtle glaze reflection, soft porcelain texture, gentle studio lighting, clean minimal background, high quality 3d render
- **설명**: 매끈하고 은은한 광택의 도자기 질감으로 차분하고 정갈한 무드의 리빙/라이프스타일 콘텐츠에 어울린다.
- **잘 어울리는 오브젝트**: 화병, 컵/그릇 형태 오브젝트
- **피해야 할 키워드**: cracked rough texture, harsh neon color, industrial metal look
- **예시 프롬프트**: `3D small vase icon, smooth glossy ceramic material with subtle glaze reflection, gentle soft studio lighting, clean minimal beige background, high quality 3d render`
- **생성 예시 설명**: 매끈한 유광 도자기 질감의 화병 아이콘이 은은한 조명 아래 정갈하게 생성된다.

### 페이퍼 크래프트 (Paper Craft)
- **구성 키워드**: layered paper craft material, matte cardstock texture, soft drop shadow between layers, even soft lighting, clean flat pastel background, high quality render
- **설명**: 종이를 층층이 오려 붙인 듯한 질감으로 아기자기하고 수공예적인 카드/배너 디자인에 어울린다.
- **잘 어울리는 오브젝트**: 지도(map), 티켓(ticket)
- **피해야 할 키워드**: glossy shine, metallic reflection, photorealistic texture
- **예시 프롬프트**: `3D folded paper map icon, layered paper craft material with matte cardstock texture and soft drop shadow between layers, even soft lighting, clean flat pastel background, high quality render`
- **생성 예시 설명**: 종이를 오려 붙인 듯한 층층 질감의 지도 아이콘이 부드러운 그림자와 함께 생성된다.

### 럭셔리 (Luxury)
- **구성 키워드**: dark rich background, polished gold and black material accents, dramatic soft lighting, subtle reflection, elegant composition, high quality 3d render, 4k
- **설명**: 어두운 배경과 금색 포인트, 극적인 조명을 조합해 고급스럽고 프리미엄한 브랜드 무드를 만든다.
- **잘 어울리는 오브젝트**: 여권(passport), 시계류 오브젝트
- **피해야 할 키워드**: bright pastel tone, cartoonish cute style, cluttered busy background
- **예시 프롬프트**: `3D passport icon, dark navy leather material with polished gold embossed emblem, dramatic soft studio lighting with subtle reflection, elegant minimal dark background, high quality 3d render, 4k`
- **생성 예시 설명**: 짙은 남색 가죽 질감에 금색 엠블럼이 돋보이는 고급스러운 여권 아이콘이 극적인 조명 아래 생성된다.

### 미니멀 (Minimal)
- **구성 키워드**: simple clean shape, single flat color material, soft even lighting, minimal shadow, plain solid pastel background, high quality render
- **설명**: 불필요한 디테일을 덜어낸 단순한 형태와 깔끔한 배경으로 모던하고 절제된 UI/브랜드 무드에 어울린다.
- **잘 어울리는 오브젝트**: 나침반(compass), 단순 도형 오브젝트
- **피해야 할 키워드**: cluttered detail, busy texture, ornate decoration
- **예시 프롬프트**: `3D compass icon, simple clean shape with single flat pastel color material, soft even lighting, minimal shadow, plain solid beige background, high quality render`
- **생성 예시 설명**: 단순한 형태와 단색 재질로 표현된 절제된 무드의 나침반 아이콘이 생성된다.

### 큐트 (Cute)
- **구성 키워드**: rounded puffy shape, soft pastel color material, gentle diffused lighting, playful small accents, soft pastel background, high quality 3d render
- **설명**: 둥글둥글한 형태와 파스텔 색감으로 친근하고 사랑스러운 느낌의 캐릭터형 아이콘에 어울린다.
- **잘 어울리는 오브젝트**: 생일(birthday), 자동차(car)
- **피해야 할 키워드**: sharp aggressive shape, dark harsh tone, realistic gritty texture
- **예시 프롬프트**: `3D car icon, rounded puffy shape with soft pastel mint color material, gentle diffused lighting, playful small accents, soft pastel background, high quality 3d render`
- **생성 예시 설명**: 둥글둥글하고 사랑스러운 파스텔톤의 자동차 아이콘이 부드러운 조명 아래 생성된다.

### 카와이 (Kawaii)
- **구성 키워드**: chibi proportions, rounded soft shape, cute face details, pastel color material, soft bright lighting, playful pastel background, high quality render
- **설명**: 아기자기한 얼굴 표정과 통통한 비율을 더해 일본풍 카와이 캐릭터 무드를 표현하는데 적합하다.
- **잘 어울리는 오브젝트**: 유령(halloween), 케이크(birthday)
- **피해야 할 키워드**: realistic proportions, dark scary tone, sharp aggressive lines
- **예시 프롬프트**: `3D cute ghost icon, chibi rounded shape with cute smiling face details, soft pastel purple material, soft bright lighting, playful pastel background, high quality render`
- **생성 예시 설명**: 동글동글한 몸에 귀여운 표정을 가진 카와이 스타일의 유령 아이콘이 생성된다.

### 커머셜 (Commercial)
- **구성 키워드**: clean product-focused composition, glossy premium material, bright even studio lighting, subtle soft shadow, neutral gradient background, high quality 3d render, 4k
- **설명**: 제품을 또렷하게 강조하는 깔끔한 구도와 밝은 조명으로 상업적 용도의 카탈로그/광고 이미지에 적합하다.
- **잘 어울리는 오브젝트**: 여행가방(suitcase), 자동차(car)
- **피해야 할 키워드**: cluttered busy background, dark moody tone, distracting props
- **예시 프롬프트**: `3D suitcase icon, clean product-focused composition with glossy premium plastic material, bright even studio lighting and subtle soft shadow, neutral gradient background, high quality 3d render, 4k`
- **생성 예시 설명**: 제품이 또렷하게 강조된 깔끔한 구도의 여행가방 이미지가 상업용 카탈로그 스타일로 생성된다.

### 제품 광고 (Product Advertisement)
- **구성 키워드**: centered hero product shot, glossy premium material, dramatic studio lighting with highlight, floating composition, bold gradient background, high quality 3d render, 4k
- **설명**: 제품을 화면 중앙에 크게 배치하고 극적인 조명을 더해 시선을 사로잡는 광고 비주얼에 어울린다.
- **잘 어울리는 오브젝트**: 자동차(car), 여행가방(suitcase)
- **피해야 할 키워드**: flat dull lighting, cluttered background, off-center awkward crop
- **예시 프롬프트**: `3D car icon, centered hero product shot with glossy premium plastic material, dramatic studio lighting with strong highlight, floating composition, bold gradient background, high quality 3d render, 4k`
- **생성 예시 설명**: 화면 정중앙에 크게 배치된 자동차가 극적인 조명을 받으며 강렬한 광고 비주얼로 생성된다.

### 쇼핑몰 배너 (Shopping Mall Banner)
- **구성 키워드**: wide banner composition, bright cheerful lighting, glossy colorful material, bold sale-friendly background, extra copy space, high quality 3d render
- **설명**: 밝고 화사한 톤과 여백을 확보한 넓은 구도로 프로모션 문구를 얹기 좋은 쇼핑몰 배너 이미지에 적합하다.
- **잘 어울리는 오브젝트**: 생일(birthday), 새해(new year)
- **피해야 할 키워드**: dark somber tone, cluttered centered composition, low contrast dull colors
- **예시 프롬프트**: `3D gift box icon, wide banner composition with glossy colorful red and gold material, bright cheerful studio lighting, bold festive gradient background with extra copy space, high quality 3d render`
- **생성 예시 설명**: 밝고 화사한 톤의 선물 상자가 여백을 살린 넓은 구도로 배치된 쇼핑몰 배너용 이미지가 생성된다.

### SNS 썸네일 (SNS Thumbnail)
- **구성 키워드**: bold centered subject, high saturation glossy material, bright punchy lighting, simple contrasting background, square composition, high quality render
- **설명**: 작은 화면에서도 눈에 띄도록 대비가 강하고 채도 높은 컬러와 단순한 구도로 SNS 썸네일에 적합하다.
- **잘 어울리는 오브젝트**: 케이크(birthday), 하트(valentine's day)
- **피해야 할 키워드**: low contrast muted tone, busy detailed background, small subject scale
- **예시 프롬프트**: `3D heart icon, bold centered subject with high saturation glossy red material, bright punchy lighting, simple contrasting pastel pink background, square composition, high quality render`
- **생성 예시 설명**: 채도 높고 대비가 강한 하트 아이콘이 정사각형 구도로 SNS 썸네일에 적합하게 생성된다.

### UI 아이콘 (UI Icon)
- **구성 키워드**: simple flat-friendly 3d shape, single accent color material, soft even lighting, minimal shadow, transparent-friendly clean background, high quality render
- **설명**: 앱/웹 인터페이스에서 작게 표시되어도 형태가 명확하게 인식되도록 단순화된 아이콘 디자인에 어울린다.
- **잘 어울리는 오브젝트**: 지도(map), 티켓(ticket)
- **피해야 할 키워드**: overly detailed texture, complex background scene, tiny fine details
- **예시 프롬프트**: `3D map icon, simple flat-friendly shape with single pastel accent color material, soft even lighting, minimal shadow, clean transparent-friendly background, high quality render`
- **생성 예시 설명**: 형태가 명확하게 인식되는 단순화된 지도 아이콘이 UI에 바로 쓸 수 있는 형태로 생성된다.

### 앱 아이콘 (App Icon)
- **구성 키워드**: rounded square composition, bold single subject, glossy vibrant material, soft studio lighting, clean gradient background filling frame, high quality render
- **설명**: 홈 화면에서 눈에 띄도록 둥근 사각 프레임 안에 하나의 오브젝트를 크고 선명하게 배치하는 앱 아이콘 스타일이다.
- **잘 어울리는 오브젝트**: 지구본(globe), 비행기(airplane)
- **피해야 할 키워드**: multiple competing subjects, thin fine lines, empty excessive whitespace
- **예시 프롬프트**: `3D globe icon, rounded square app icon composition with bold single subject, glossy vibrant blue material, soft studio lighting, clean gradient background filling the frame, high quality render`
- **생성 예시 설명**: 둥근 사각 프레임을 꽉 채운 선명한 지구본 오브젝트가 앱 아이콘 형태로 생성된다.

### 3D 이모지 (3D Emoji)
- **구성 키워드**: chibi rounded shape, glossy soft plastic material, expressive cute face or symbol, bright soft lighting, plain simple background, high quality 3d render
- **설명**: 통통하고 단순화된 형태에 표정이나 상징을 강조해 메신저/SNS에서 쓰기 좋은 이모지 스타일 오브젝트를 만든다.
- **잘 어울리는 오브젝트**: 불(fire), 유령(halloween)
- **피해야 할 키워드**: realistic detailed texture, complex background, muted dull color
- **예시 프롬프트**: `3D flame emoji icon, chibi rounded glossy plastic material with expressive cute face, bright soft lighting, plain simple pastel background, high quality 3d render`
- **생성 예시 설명**: 표정이 있는 통통하고 귀여운 불꽃 모양의 3D 이모지 스타일 아이콘이 생성된다.

---

## PART 12. Prompt Recipe (조합 공식)

버튼 UI에서 사용자가 카테고리별로 하나씩 선택했을 때, 최종 프롬프트 문자열을 만드는 조합 순서입니다. `+`는 이어붙이는 순서(쉼표 구분)를 의미합니다.

### Basic Formula (기본형)
`Object + Material + Style + Lighting + Composition + Background + Quality`
- 예: `gift box + glossy wrapping paper + cute chibi style + soft studio lighting + floating composition + pastel gradient background + high quality, 4k`
- 범용 오브젝트 아이콘 생성에 기본으로 사용하는 조합입니다.

### Product Formula (제품 컷형)
`Object + Premium Material + Commercial Illustration + Product Photography Lighting + White Background + High Quality`
- 예: `perfume bottle + premium plastic material + commercial illustration + product photography lighting + white background + high quality, sharp focus`
- 이커머스 상세페이지, 카탈로그용 제품 이미지에 적합합니다.

### UI Formula (UI 아이콘형)
`Object + UI Asset + Minimal + Floating + Soft Shadow + Transparent Background`
- 예: `notification bell + ui asset + minimal style + floating composition + soft shadow + transparent background`
- 앱/웹 인터페이스에 바로 삽입할 아이콘 생성에 적합하며, 배경 제거 후 사용을 전제로 합니다.

### Banner Formula (배너형)
`Object + Premium + Product Render + Studio Lighting + White Background + Commercial Asset`
- 예: `credit card + premium design + 3d product render + studio lighting + white background + commercial asset, no watermark`
- 쇼핑몰 메인 배너, 광고 키비주얼에 적합한 고급스러운 톤을 만듭니다.

### SNS Formula (SNS 썸네일형)
`Object + Cute + Bright Color + Floating + Clean Background + High Quality`
- 예: `cake + cute style + vibrant saturated colors + floating composition + clean pastel background + high quality`
- 좁은 정사각형 썸네일에서도 눈에 띄는 발랄하고 채도 높은 조합입니다.

---

## PART 13. Korean → English Prompt Dictionary (빠른 조회 인덱스)

Part 2~10의 상세 항목(설명·추천 키워드·예시 프롬프트 등)을 요약한 빠른 조회용 색인입니다. 한글명으로 검색해 대응하는 영어 키워드만 빠르게 확인하거나, JSON 변환 시 `id`/`ko`/`en` 필드의 1차 소스로 사용하세요. 각 표의 상세 설명은 해당 Part 본문을 참고하세요.

### Style (→ PART 02 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 3D 아이콘 | `3D Icon` |
| 3D 일러스트 | `3D Illustration` |
| 3D 제품 렌더 | `3D Product Render` |
| 커머셜 일러스트 | `Commercial Illustration` |
| 제품 사진 | `Product Photography` |
| UI 에셋 | `UI Asset` |
| 플로팅 오브젝트 | `Floating Object` |
| 미니멀 | `Minimal` |
| 프리미엄 | `Premium` |
| 럭셔리 | `Luxury` |
| 큐트 | `Cute` |
| 카와이 | `Kawaii` |
| 모던 | `Modern` |
| 클린 | `Clean` |
| 엘레강스 | `Elegant` |
| 프로페셔널 | `Professional` |
| 카툰 | `Cartoon` |
| 픽사 스타일 | `Pixar Style` |
| 클레이 스타일 | `Clay Style` |
| 글래스 스타일 | `Glass Style` |
| 페이퍼 컷 | `Paper Cut` |
| 로우 폴리 | `Low Poly` |
| 플랫 일러스트 | `Flat Illustration` |
| 아이소메트릭 | `Isometric` |
| 핸드 드로잉 | `Hand Drawn` |
| 수채화 | `Watercolor` |
| 연필 스케치 | `Pencil Sketch` |
| 유화 | `Oil Painting` |
| Y2K | `Y2K` |
| 레트로 | `Retro` |
| 사이버펑크 | `Cyberpunk` |
| 베이퍼웨이브 | `Vaporwave` |
| 멤피스 | `Memphis` |
| 스칸디나비안 | `Scandinavian` |
| 퓨처리스틱 | `Futuristic` |

### Material (→ PART 03 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 글로시 플라스틱 | `Glossy Plastic` |
| 매트 플라스틱 | `Matte Plastic` |
| 소프트터치 플라스틱 | `Soft Touch Plastic` |
| 프리미엄 플라스틱 | `Premium Plastic` |
| 젤리 재질 | `Jelly Material` |
| 반투명 젤리 | `Translucent Jelly` |
| 구미 텍스처 | `Gummy Texture` |
| 겔 재질 | `Gel Material` |
| 유리 | `Glass` |
| 크리스탈 유리 | `Crystal Glass` |
| 서리 유리 | `Frosted Glass` |
| 투명 유리 | `Transparent Glass` |
| 골드 | `Gold` |
| 실버 | `Silver` |
| 크롬 | `Chrome` |
| 브러시드 메탈 | `Brushed Metal` |
| 로즈골드 | `Rose Gold` |
| 점토 | `Clay` |
| 소프트 클레이 | `Soft Clay` |
| 폴리머 클레이 | `Polymer Clay` |
| 고무 | `Rubber` |
| 소프트 러버 | `Soft Rubber` |
| 실리콘 | `Silicone` |
| 인플레터블 | `Inflatable` |
| 풍선 재질 | `Balloon Material` |
| 광택 풍선 | `Glossy Balloon` |
| 세라믹 | `Ceramic` |
| 포슬린 | `Porcelain` |
| 면 | `Cotton` |
| 리넨 | `Linen` |
| 벨벳 | `Velvet` |
| 가죽 | `Leather` |
| 펠트 | `Felt` |
| 나무 | `Wood` |
| 돌 | `Stone` |
| 대리석 | `Marble` |
| 얼음 | `Ice` |
| 물 | `Water` |
| 액체 | `Liquid` |

### Lighting (→ PART 04 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 소프트 스튜디오 라이팅 | `Soft Studio Lighting` |
| 스튜디오 라이팅 | `Studio Lighting` |
| 제품 사진 조명 | `Product Photography Lighting` |
| 앰비언트 라이팅 | `Ambient Lighting` |
| 자연광/일광 | `Natural Daylight` |
| 골든아워 | `Golden Hour` |
| 선셋 라이트 | `Sunset Light` |
| 림 라이트 | `Rim Light` |
| 백라이트 | `Back Light` |
| 사이드 라이트 | `Side Light` |
| 탑 라이트 | `Top Light` |
| 소프트 섀도우 | `Soft Shadow` |
| 하드 섀도우 | `Hard Shadow` |
| 볼류메트릭 라이팅 | `Volumetric Lighting` |
| 네온 라이팅 | `Neon Lighting` |

### Background (→ PART 08 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 화이트 배경 | `White Background` |
| 투명 배경 | `Transparent Background` |
| 미니멀 배경 | `Minimal Background` |
| 스튜디오 배경 | `Studio Background` |
| 그라디언트 배경 | `Gradient Background` |
| 추상적 배경 | `Abstract Background` |
| 소프트 섀도우 | `Soft Shadow` |
| 반사 바닥 | `Reflection Floor` |
| 플로팅 섀도우 | `Floating Shadow` |

### Composition (→ PART 07 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 플로팅 | `Floating` |
| 센터 구도 | `Center Composition` |
| 정면 뷰 | `Front View` |
| 측면 뷰 | `Side View` |
| 탑 뷰 | `Top View` |
| 원근 뷰 | `Perspective View` |
| 아이소메트릭 뷰 | `Isometric View` |
| 히어로 샷 | `Hero Shot` |
| 프로덕트 샷 | `Product Shot` |
| 클로즈업 | `Close Up` |
| 매크로 | `Macro` |
| 다이나믹 앵글 | `Dynamic Angle` |
| 대칭 구도 | `Symmetry` |
| 삼분할 구도 | `Rule of Thirds` |

### Color (→ PART 06 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 파스텔 | `Pastel` |
| 비비드 | `Vibrant` |
| 뉴트럴 | `Neutral` |
| 웜 톤 | `Warm Tone` |
| 쿨 톤 | `Cool Tone` |
| 모노크롬 | `Monochrome` |
| 마카롱 컬러 | `Macaron Color` |
| 캔디 컬러 | `Candy Color` |
| 어스 톤 | `Earth Tone` |
| 오로라 | `Aurora` |
| 그라데이션 | `Gradient` |
| 레인보우 | `Rainbow` |
| 럭셔리 골드 | `Luxury Gold` |
| 미니멀 화이트 | `Minimal White` |
| 블랙 에디션 | `Black Edition` |

### Object (→ PART 10 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 쿠폰 | `Coupon` |
| 쿠폰 티켓 | `Coupon Ticket` |
| 선물 상자 | `Gift Box` |
| 쇼핑백 | `Shopping Bag` |
| 배송 박스 | `Delivery Box` |
| 소포/패키지 | `Package` |
| 할인 태그 | `Discount Tag` |
| 가격표 | `Price Tag` |
| 영수증 | `Receipt` |
| 지갑 | `Wallet` |
| 신용카드 | `Credit Card` |
| 동전 | `Coin` |
| 쇼핑카트 | `Shopping Cart` |
| 노트 | `Notebook` |
| 플래너 | `Planner` |
| 다이어리 | `Diary` |
| 달력 | `Calendar` |
| 메모 | `Memo` |
| 포스트잇 | `Sticky Note` |
| 클립보드 | `Clipboard` |
| 볼펜 | `Pen` |
| 연필 | `Pencil` |
| 마카/마커 | `Marker` |
| 지우개 | `Eraser` |
| 집게 클립 | `Binder Clip` |
| 리본 | `Ribbon` |
| 리본 매듭 | `Bow` |
| 풍선 | `Balloon` |
| 색종이 조각 | `Confetti` |
| 반짝임 | `Sparkle` |
| 별 | `Star` |
| 하트 | `Heart` |
| 왕관 | `Crown` |
| 다이아몬드 | `Diamond` |
| 보석 | `Gem` |
| 트로피 | `Trophy` |
| 메달 | `Medal` |
| 폭죽 | `Firework` |
| 꽃 | `Flower` |
| 장미 | `Rose` |
| 튤립 | `Tulip` |
| 나뭇잎 | `Leaf` |
| 나무 | `Tree` |
| 잔디 | `Grass` |
| 구름 | `Cloud` |
| 무지개 | `Rainbow` |
| 태양 | `Sun` |
| 달 | `Moon` |
| 눈송이 | `Snowflake` |
| 물방울 | `Water Drop` |
| 케이크 | `Cake` |
| 도넛 | `Donut` |
| 쿠키 | `Cookie` |
| 사탕 | `Candy` |
| 초콜릿 | `Chocolate` |
| 커피 | `Coffee` |
| 차 | `Tea` |
| 아이스크림 | `Ice Cream` |
| 딸기 | `Strawberry` |
| 레몬 | `Lemon` |
| 채팅 버블 | `Chat Bubble` |
| 말풍선 | `Speech Bubble` |
| 알림 | `Notification` |
| 좋아요 | `Like` |
| 북마크 | `Bookmark` |
| 벨 | `Bell` |
| 카메라 | `Camera` |
| 전화기 | `Phone` |
| 노트북 | `Laptop` |
| 태블릿 | `Tablet` |
| 마우스 | `Mouse` |
| 키보드 | `Keyboard` |
| 폴더 | `Folder` |
| 파일 | `File` |
| 다운로드 | `Download` |
| 업로드 | `Upload` |
| 비행기 | `Airplane` |
| 여권 | `Passport` |
| 티켓 | `Ticket` |
| 나침반 | `Compass` |
| 여행가방 | `Suitcase` |
| 지구본 | `Globe` |
| 지도 | `Map` |
| 호텔 | `Hotel` |
| 기차 | `Train` |
| 자동차 | `Car` |
| 비 | `Rain` |
| 눈 | `Snow` |
| 번개 | `Lightning` |
| 바람 | `Wind` |
| 불 | `Fire` |
| 얼음 | `Ice` |
| 물보라 | `Water Splash` |
| 크리스마스 | `Christmas` |
| 할로윈 | `Halloween` |
| 부활절 | `Easter` |
| 발렌타인데이 | `Valentine's Day` |
| 생일 | `Birthday` |
| 졸업 | `Graduation` |
| 새해 | `New Year` |

### Quality (→ PART 09 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 고품질 | `High Quality` |
| 초정밀 디테일 | `Ultra Detailed` |
| 8K 해상도 | `8K` |
| 고해상도 | `High Resolution` |
| 선명한 초점 | `Sharp Focus` |
| 커머셜 에셋 | `Commercial Asset` |
| 프로페셔널 | `Professional` |
| 프리미엄 | `Premium` |
| 깔끔한 외곽선 | `Clean Edge` |
| 매끄러운 표면 | `Smooth Surface` |
| 독립 오브젝트 | `Isolated Object` |
| 텍스트 없음 | `No Text` |
| 워터마크 없음 | `No Watermark` |

### Render (→ PART 05 참고)

| 한글명 | 영어 키워드 |
|---|---|
| 옥테인 렌더 | `Octane Render` |
| 블렌더 사이클스 | `Blender Cycles` |
| 시네마4D | `Cinema4D` |
| 레드시프트 | `Redshift` |
| 언리얼 엔진 | `Unreal Engine` |
| CGI | `` |
| PBR | `Physically Based Rendering` |
| 하이 폴리 | `High Poly` |
| 스타일라이즈드 렌더 | `Stylized Render` |
| 포토리얼리스틱 | `Photorealistic` |
| 글로벌 일루미네이션 | `Global Illumination` |

---

## PART 14. Negative Prompt Dictionary

### 저품질 (Low Quality)
- **영어 키워드**: `low quality`
- **설명**: 전반적으로 완성도가 떨어지고 조잡하게 렌더링되는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 제품 렌더, 아이콘, 상업용 에셋 등 완성도가 중요한 모든 생성 상황
- **예시 네거티브 프롬프트**: `low quality, blurry, noise, pixelated, bad anatomy`

### 흐림 (Blurry)
- **영어 키워드**: `blurry`
- **설명**: 오브젝트나 배경의 윤곽이 흐릿하게 번져 초점이 맞지 않는 결함을 방지한다.
- **주로 함께 쓰는 상황**: Sharp Focus가 중요한 아이콘, 로고, 제품 클로즈업 렌더
- **예시 네거티브 프롬프트**: `blurry, out of focus, soft blur, low quality, noise`

### 노이즈 (Noise)
- **영어 키워드**: `noise`
- **설명**: 이미지 표면에 알갱이 같은 잡티나 그레인이 끼는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 매끈한 표면이 필요한 3D 렌더, 스튜디오 제품 사진 스타일
- **예시 네거티브 프롬프트**: `noise, grainy texture, blurry, low quality, artifacts`

### 픽셀화 (Pixelated)
- **영어 키워드**: `pixelated`
- **설명**: 이미지가 계단 현상이나 저해상도 블록처럼 깨져 보이는 결함을 방지한다.
- **주로 함께 쓰는 상황**: High Resolution·8K가 필요한 인쇄용 또는 대형 배너 에셋
- **예시 네거티브 프롬프트**: `pixelated, low resolution, jagged edges, blurry, compression artifacts`

### 워터마크 (Watermark)
- **영어 키워드**: `watermark`
- **설명**: 생성 플랫폼 로고나 반투명 스탬프가 이미지에 삽입되는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 상업적으로 바로 사용해야 하는 커머셜 에셋, 이커머스 상품 이미지
- **예시 네거티브 프롬프트**: `watermark, logo, signature, text overlay, stamp`

### 텍스트 (Text)
- **영어 키워드**: `text`
- **설명**: 의도하지 않은 알파벳, 숫자, 문자가 이미지 안에 생기는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 순수 그래픽만 필요한 아이콘, 일러스트, 심볼 디자인
- **예시 네거티브 프롬프트**: `text, watermark, signature, letters, captions`

### 로고 (Logo)
- **영어 키워드**: `logo`
- **설명**: 원치 않는 브랜드 로고나 심볼이 이미지에 잘못 삽입되는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 특정 브랜드와 무관해야 하는 범용 아이콘, 커머셜 에셋
- **예시 네거티브 프롬프트**: `logo, watermark, brand mark, text, signature`

### 서명 (Signature)
- **영어 키워드**: `signature`
- **설명**: 아티스트 사인이나 필기체 서명이 이미지 구석에 삽입되는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 일러스트 스타일 아이콘, 아트워크 느낌의 에셋 생성
- **예시 네거티브 프롬프트**: `signature, watermark, logo, text, artist stamp`

### 크롭 잘림 (Cropped)
- **영어 키워드**: `cropped`
- **설명**: 오브젝트의 일부가 프레임 밖으로 잘려나가 불완전하게 보이는 결함을 방지한다.
- **주로 함께 쓰는 상황**: Isolated Object처럼 오브젝트 전체가 온전히 보여야 하는 아이콘 생성
- **예시 네거티브 프롬프트**: `cropped, cut off, out of frame, partial object, bad composition`

### 형태 왜곡 (Deformed)
- **영어 키워드**: `deformed`
- **설명**: 오브젝트나 캐릭터의 형태가 비정상적으로 뒤틀리거나 뭉개지는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 캐릭터 아이콘, 사실적인 사물 렌더처럼 정확한 형태가 중요한 생성
- **예시 네거티브 프롬프트**: `deformed, distorted, bad anatomy, malformed, disfigured`

### 여분의 팔다리 (Extra Limbs)
- **영어 키워드**: `extra limbs`
- **설명**: 캐릭터나 동물 형태에 불필요한 팔, 다리, 손가락이 추가로 생기는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 캐릭터/마스코트 아이콘, 인물이나 동물이 포함된 일러스트 생성
- **예시 네거티브 프롬프트**: `extra limbs, extra fingers, deformed hands, bad anatomy, duplicate body parts`

### 중복 생성 (Duplicate)
- **영어 키워드**: `duplicate`
- **설명**: 하나만 있어야 할 오브젝트가 화면에 여러 개 겹치거나 반복 생성되는 결함을 방지한다.
- **주로 함께 쓰는 상황**: Isolated Object 단일 아이콘, 단일 제품 렌더 이미지
- **예시 네거티브 프롬프트**: `duplicate, multiple objects, cloned subject, repeated pattern, extra copies`

### 왜곡 (Distorted)
- **영어 키워드**: `distorted`
- **설명**: 오브젝트의 비율이나 형태가 부자연스럽게 늘어나거나 뒤틀리는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 정확한 비율이 중요한 제품 렌더, 로고, 기하학적 아이콘
- **예시 네거티브 프롬프트**: `distorted, warped proportions, deformed, bad perspective, asymmetrical error`

### 잘못된 해부구조 (Bad Anatomy)
- **영어 키워드**: `bad anatomy`
- **설명**: 인체나 동물의 신체 비율, 관절, 골격이 비정상적으로 표현되는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 인물·동물 캐릭터가 포함된 일러스트, 마스코트 디자인
- **예시 네거티브 프롬프트**: `bad anatomy, extra limbs, deformed, malformed hands, disfigured face`

### 잘못된 원근감 (Bad Perspective)
- **영어 키워드**: `bad perspective`
- **설명**: 소실점이나 각도가 어긋나 오브젝트의 원근이 부자연스럽게 왜곡되는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 아이소메트릭 아이콘, 건축·인테리어 3D 렌더, 제품 각도 샷
- **예시 네거티브 프롬프트**: `bad perspective, warped geometry, distorted proportions, tilted horizon, asymmetrical error`

### 과채도 (Oversaturated)
- **영어 키워드**: `oversaturated`
- **설명**: 색상이 과도하게 진해져 부자연스럽고 인공적으로 보이는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 자연스러운 톤이 필요한 제품 사진, 프리미엄 브랜드 비주얼
- **예시 네거티브 프롬프트**: `oversaturated, overexposed, harsh colors, neon artifact, unnatural tone`

### 과다노출 (Overexposed)
- **영어 키워드**: `overexposed`
- **설명**: 밝은 영역이 하얗게 날아가 디테일이 사라지는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 스튜디오 조명 제품 컷, Soft Shadow가 살아있어야 하는 렌더
- **예시 네거티브 프롬프트**: `overexposed, blown highlights, oversaturated, washed out, harsh lighting`

### 노출부족 (Underexposed)
- **영어 키워드**: `underexposed`
- **설명**: 어두운 영역이 뭉개져 디테일이 손실되고 전체적으로 칙칙해지는 결함을 방지한다.
- **주로 함께 쓰는 상황**: 밝고 선명한 톤이 필요한 아이콘, 화이트 배경 제품 이미지
- **예시 네거티브 프롬프트**: `underexposed, dark shadows, low contrast, dull tone, noise`

---

## PART 15. Prompt Templates (마케팅 시나리오별 템플릿)

실무에서 자주 만드는 배너/이벤트 시나리오별로 Part 2~11의 키워드를 미리 조합해둔 완성형 템플릿입니다. 오브젝트만 바꿔 끼우면 바로 사용할 수 있습니다.

### 상품 배너 (Product Banner)
- **추천 오브젝트**: 쇼핑백, 신용카드, 자동차 등 주력 상품/카테고리 오브젝트
- **추천 조합**: Premium Plastic 재질 + Product Photography 스타일 + Product Photography Lighting + White Background + Commercial Asset
- **예시 프롬프트**: `3D icon of a shopping bag, premium plastic material, product photography style, product photography lighting, white background, commercial asset, high quality, 4k, no text, no watermark`
- **생성 예시 설명**: 흰 배경 위에 고급스러운 광택의 쇼핑백이 또렷하게 강조된 범용 상품 배너 이미지가 생성된다.

### 쇼핑 이벤트 (Shopping Event)
- **추천 오브젝트**: 쇼핑카트, 쇼핑백, 가격표
- **추천 조합**: Vibrant Saturated Colors + Cute 스타일 + Soft Studio Lighting + Floating Composition + Gradient Background
- **예시 프롬프트**: `3D icon of a shopping cart overflowing with gift boxes, vibrant saturated colors, cute rounded style, soft studio lighting, floating composition, gradient orange background, high quality`
- **생성 예시 설명**: 선물 상자가 넘칠 듯 담긴 컬러풀한 쇼핑카트가 활기찬 분위기의 이벤트 배너 이미지로 생성된다.

### 할인 쿠폰 (Discount Coupon)
- **추천 오브젝트**: 쿠폰, 쿠폰 티켓, 할인 태그
- **추천 조합**: Vibrant/Candy Color + Flat Illustration 또는 3D Icon + Floating Composition + Pastel Background
- **예시 프롬프트**: `3D icon of a coupon ticket with tear line and percentage discount stamp, candy color palette, floating composition, pastel yellow background, clean minimal composition, high quality, 4k`
- **생성 예시 설명**: 할인율이 강조된 쿠폰 티켓이 파스텔 배경 위에 눈에 띄게 떠 있는 프로모션용 이미지가 생성된다.

### 무료배송 (Free Shipping)
- **추천 오브젝트**: 배송 박스, 비행기, 쇼핑백
- **추천 조합**: Cute Rounded Style + Light Blue/Sky Background + Soft Studio Lighting + Motion 느낌의 구도
- **예시 프롬프트**: `3D icon of a delivery box with small wing accents flying, cute rounded style, soft studio lighting, light blue gradient background, dynamic angle, high quality`
- **생성 예시 설명**: 날개가 달린 듯 가볍게 날아가는 배송 박스가 하늘색 배경 위에 표현된 무료배송 프로모션 이미지가 생성된다.

### 베스트 아이템 (Best Item)
- **추천 오브젝트**: 별, 트로피, 메달 + 주력 상품 오브젝트 조합
- **추천 조합**: Luxury Gold Color + Studio Lighting with Specular Highlight + Hero Shot Composition
- **예시 프롬프트**: `3D icon of a product box with a glossy gold star badge attached, luxury gold accent, hero shot composition, dramatic studio lighting, dark background for contrast, high quality, 4k`
- **생성 예시 설명**: 금색 별 배지가 부착된 상품이 어두운 배경 속에서 극적으로 강조된 베스트 아이템 배너 이미지가 생성된다.

### 신상품 (New Arrival)
- **추천 오브젝트**: 스파클, 주력 상품 오브젝트
- **추천 조합**: Futuristic/Modern 스타일 + Vibrant Color + Gradient Background + Dynamic Angle
- **예시 프롬프트**: `3D icon of a product with sparkle accents around it, modern design style, vibrant gradient background, dynamic angle, soft studio lighting, high quality`
- **생성 예시 설명**: 반짝이는 스파클 효과가 더해진 신상품이 그라데이션 배경 위에서 신선하게 강조된 이미지가 생성된다.

### 한정판 (Limited Edition)
- **추천 오브젝트**: 다이아몬드, 왕관 + 주력 상품 오브젝트
- **추천 조합**: Luxury 스타일 + Crystal Glass/Gold 재질 + Dramatic Lighting + Dark Background
- **예시 프롬프트**: `3D icon of a product box with a faceted crystal gem accent, luxury style, dramatic studio lighting, dark elegant background, high quality, ultra detailed, 4k`
- **생성 예시 설명**: 크리스탈 보석 장식이 더해진 제품이 어두운 배경 속에서 고급스럽게 빛나는 한정판 프로모션 이미지가 생성된다.

### 선물 이벤트 (Gift Event)
- **추천 오브젝트**: 선물 상자, 리본, 풍선
- **추천 조합**: Cute Chibi Style + Pastel/Candy Color + Confetti 배경 요소 + Warm Rim Light
- **예시 프롬프트**: `3D icon of a gift box wrapped in glossy ribbon, cute chibi style, pastel color palette, confetti scattered around, warm rim light, soft studio lighting, high quality`
- **생성 예시 설명**: 리본으로 장식된 선물 상자 주위로 색종이 조각이 흩날리는 축하 분위기의 이벤트 배너 이미지가 생성된다.

### 리뷰 이벤트 (Review Event)
- **추천 오브젝트**: 별, 말풍선, 좋아요(하트)
- **추천 조합**: Flat Illustration 또는 3D Icon + Vibrant Color + Center Composition + Clean Background
- **예시 프롬프트**: `3D icon of five glossy stars next to a speech bubble, vibrant saturated colors, center composition, clean white background, soft studio lighting, high quality`
- **생성 예시 설명**: 별점과 말풍선이 함께 배치된, 리뷰 작성을 유도하는 밝고 신뢰감 있는 이미지가 생성된다.

### 포인트 이벤트 (Point Event)
- **추천 오브젝트**: 동전, 코인, 보석
- **추천 조합**: Gold/Chrome 재질 + Studio Lighting with Specular Highlight + Dark Background for Contrast
- **예시 프롬프트**: `3D icon of a stack of gold coins with sparkle accents, polished gold metal material, studio lighting with specular highlight, dark navy background, high quality, 4k`
- **생성 예시 설명**: 반짝이는 금색 동전 더미가 짙은 배경 위에서 강조된 포인트/적립 이벤트 이미지가 생성된다.

### 멤버십 이벤트 (Membership Event)
- **추천 오브젝트**: 왕관, 신용카드, 다이아몬드
- **추천 조합**: Luxury 스타일 + Gold/Crystal Glass 재질 + Elegant Composition + Dark Premium Background
- **예시 프롬프트**: `3D icon of a membership card with a small gold crown emblem, luxury style, polished gold metal accent, elegant composition, dark premium gradient background, high quality`
- **생성 예시 설명**: 왕관 엠블럼이 새겨진 멤버십 카드가 고급스러운 어두운 배경 위에 표현된 VIP 이벤트 이미지가 생성된다.

### 홀리데이 이벤트 (Holiday Event)
- **추천 오브젝트**: 크리스마스, 눈송이, 선물 상자
- **추천 조합**: Festive Cute Style + Red/Green Pastel Color + Warm Fairy Light Glow
- **예시 프롬프트**: `3D Christmas tree icon with ornament balls and gift boxes underneath, festive cute style, red and green pastel palette, warm fairy light glow, soft snow dust particles, high quality`
- **생성 예시 설명**: 트리와 선물 상자가 어우러진 따뜻한 홀리데이 시즌 프로모션 이미지가 생성된다.

### 생일 이벤트 (Birthday Event)
- **추천 오브젝트**: 케이크, 풍선, 폭죽
- **추천 조합**: Cute Festive Style + Pastel Rainbow Color + Confetti + Warm Festive Lighting
- **예시 프롬프트**: `3D birthday cake icon with a lit candle, colorful confetti and small balloons floating around, cute festive style, pastel rainbow background, warm festive lighting, high quality`
- **생성 예시 설명**: 촛불이 켜진 케이크와 풍선, 컨페티가 어우러진 경쾌한 생일 이벤트 이미지가 생성된다.

### 시즌 프로모션 (Seasonal Promotion)
- **추천 오브젝트**: 계절별 오브젝트(튤립/눈송이/단풍 등) + 주력 상품
- **추천 조합**: 계절에 맞는 Color 카테고리(봄=Pastel, 여름=Vibrant, 가을=Earth Tone, 겨울=Cool Tone) + Natural Daylight 또는 Golden Hour
- **예시 프롬프트**: `3D icon of a product surrounded by fresh spring tulips, pastel color palette, natural daylight, clean soft background, high quality`
- **생성 예시 설명**: 계절감을 살린 소품(예: 튤립)과 함께 상품이 배치된 시즌 프로모션 이미지가 생성된다.
