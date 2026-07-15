# AI 이미지 생성 프록시 배포 가이드

Design Studio의 **Hugging Face 이미지 생성**을 쓰려면 무료 프록시를 한 번만 배포하면 됩니다.

## 왜 필요한가요?

Design Studio는 서버가 없는 정적 사이트(GitHub Pages)입니다. Hugging Face 같은 좋은 무료 이미지 API는 브라우저에서 직접 부르면 **CORS 정책**으로 차단돼요 (이게 "Failed to fetch" 에러의 원인입니다).

그래서 중간에 아주 작은 **프록시** 하나를 두면, 프록시가 대신 요청을 보내고 CORS를 허용해서 응답을 돌려줍니다. **Cloudflare Workers**를 쓰면 카드 등록 없이 무료(하루 10만 건)로 배포할 수 있습니다.

> 프록시는 여러분의 Hugging Face 토큰을 **전달만** 하고, 저장하거나 들여다보지 않습니다.

---

## 배포 방법 (약 5분, 코딩 지식 불필요)

### 1. Cloudflare 무료 가입

1. https://dash.cloudflare.com/sign-up 에서 이메일로 가입 (**카드 등록 불필요**)
2. 이메일 인증까지 완료

### 2. Worker 만들기

1. 왼쪽 메뉴에서 **Compute (Workers)** → **Workers & Pages** 클릭
2. **Create application** → **Create Worker** 클릭
3. 이름은 아무거나 (예: `design-studio-proxy`) → **Deploy** 클릭
4. 배포되면 **Edit code** (코드 편집) 클릭

### 3. 코드 붙여넣기

1. 편집 화면의 기존 코드를 **전부 지우고**
2. 이 저장소의 [`worker/image-proxy.js`](./worker/image-proxy.js) 파일 내용을 **전부 복사해서 붙여넣기**
3. 오른쪽 위 **Deploy** 클릭

### 4. 프록시 URL 복사

배포되면 이런 주소가 생깁니다:

```
https://design-studio-proxy.<your-name>.workers.dev
```

이 주소를 복사하세요.

### 5. 앱에 붙여넣기

1. Design Studio → 왼쪽 **AI** 도구 → 이미지 프로바이더에서 **Hugging Face** 선택
2. **Hugging Face 토큰** 입력 (huggingface.co → Settings → Access Tokens에서 **Inference** 프리셋으로 발급한 `hf_...` 토큰)
3. **프록시 URL** 칸에 4번에서 복사한 주소 붙여넣기
4. 프롬프트 입력 후 **이미지 생성** 클릭 🎉

토큰과 프록시 URL은 이 브라우저에만 저장되니, 다음부터는 프롬프트만 입력하면 됩니다.

---

## 다른 모델 써보기

Hugging Face에는 무료로 쓸 수 있는 모델이 아주 많은데, "모델 ID" 칸에 원하는 모델 저장소 이름을 입력하면 바로 바꿔서 시도해볼 수 있습니다 (기본값: `black-forest-labs/FLUX.1-schnell`).

| 모델 ID | 특징 |
|---|---|
| `black-forest-labs/FLUX.1-schnell` | 기본값. 빠르고 안정적으로 응답 확인됨 |
| `black-forest-labs/FLUX.1-dev` | 더 높은 품질·프롬프트 반영력. 처음 한 번 huggingface.co에서 라이선스 동의 필요, 무료 크레딧을 더 빨리 소진할 수 있음 |
| `stabilityai/stable-diffusion-3.5-large-turbo` | 대안 플래그십 모델 |
| `rangwani-harsh/3d-icon-Flux-LoRA` | 글로시 3D 아이콘 스타일 특화 LoRA (실험적) |
| `thliang01/3d-icon-sdxl-dora-v0-8` | 글로시 3D 아이콘 스타일 특화 LoRA (실험적) |

> ⚠️ Hugging Face 무료 서버리스 API는 주로 FLUX/SD 계열 대표 모델을 상시 서빙하고, 커뮤니티가 올린 LoRA/파인튜닝 모델은 요청해도 응답하지 않을 수 있습니다(그럴 땐 "404" 오류가 납니다). 그런 경우 모델 ID를 기본값으로 되돌리면 바로 다시 동작합니다.

---

## 문제 해결

| 증상 | 원인 / 해결 |
|---|---|
| "네트워크 오류…" | 프록시 URL이 틀렸거나 아직 배포 안 됨. URL을 다시 확인하세요. |
| "API 키가 올바르지 않습니다" | Hugging Face 토큰이 틀렸거나 만료됨. `Inference` 권한으로 다시 발급하세요. |
| "요청이 너무 많습니다" | Hugging Face 무료 한도 초과. 잠시 후 다시 시도하세요. |
| 첫 요청이 오래 걸림 | Hugging Face가 모델을 처음 로딩 중(콜드 스타트). 20~30초 후 다시 시도하면 빨라집니다. |
| "isn't served by the free Inference API" / 404 | 입력한 모델 ID가 무료 API에서 서빙되지 않음. 모델 ID를 기본값(`black-forest-labs/FLUX.1-schnell`)으로 되돌리세요. |

프록시를 여러 사람이 공유해도 되지만, 무료 한도(하루 10만 건)를 함께 쓰게 됩니다.
