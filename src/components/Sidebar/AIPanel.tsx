import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  KeyRound,
  Sparkles,
  Type,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import type { ImageProvider, ReferenceMode } from "../../utils/ai";
import {
  describeAiError,
  describeAiErrorDetail,
  generateCopy,
  generateImageGemini,
  generateImageHuggingFace,
  generateImagePollinations,
  loadApiKey,
  loadGeminiKey,
  loadHuggingFaceKey,
  loadProxyUrl,
  measureImage,
  persistApiKey,
  persistGeminiKey,
  persistHuggingFaceKey,
  persistProxyUrl,
} from "../../utils/ai";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const IMAGE_PROVIDERS: ImageProvider[] = ["pollinations", "huggingface", "gemini"];
const REFERENCE_MODES: ReferenceMode[] = ["style", "edit", "composite"];
const MAX_PLACEMENT_DIMENSION = 700;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

export function AIPanel() {
  const { add, canvasSize, elements, selectedIds } = useStudioStore();
  const { t, language } = useTranslation();
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  const [provider, setProvider] = useState<ImageProvider>("pollinations");
  const [imagePrompt, setImagePrompt] = useState("");
  const [hfKey, setHfKey] = useState(loadHuggingFaceKey);
  const [proxyUrl, setProxyUrl] = useState(loadProxyUrl);
  const [geminiKey, setGeminiKey] = useState(loadGeminiKey);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [mode, setMode] = useState<ReferenceMode>("style");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<{ kind: string; detail: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [brief, setBrief] = useState("");
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [copyBusy, setCopyBusy] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const selectedElement =
    selectedIds.length === 1
      ? elements.find((element) => element.id === selectedIds[0])
      : undefined;
  const selectedImageSrc =
    selectedElement?.kind === "image" ? selectedElement.src : undefined;

  const setProviderAndReset = (next: ImageProvider) => {
    setProvider(next);
    if (next !== "gemini") setReferenceImage(null);
  };

  const placeGeneratedImage = async (src: string, name: string) => {
    const { width, height } = await measureImage(src);
    const scale = Math.min(1, MAX_PLACEMENT_DIMENSION / Math.max(width, height));
    const placedWidth = Math.round(width * scale);
    const placedHeight = Math.round(height * scale);
    add({
      id: crypto.randomUUID(),
      name: name.slice(0, 40),
      kind: "image",
      src,
      x: centerX - placedWidth / 2,
      y: centerY - placedHeight / 2,
      width: placedWidth,
      height: placedHeight,
      radius: 0,
      brightness: 100,
      rotation: 0,
      opacity: 1,
      hidden: false,
      locked: false,
    });
  };

  const makeImage = async () => {
    const prompt = imagePrompt.trim();
    if (!prompt || imageBusy) return;
    setImageBusy(true);
    setImageError(null);
    try {
      let image;
      if (provider === "pollinations") {
        image = await generateImagePollinations(prompt, 1024, 1024);
      } else if (provider === "huggingface") {
        const key = hfKey.trim();
        const proxy = proxyUrl.trim();
        if (!key || !proxy) return;
        persistHuggingFaceKey(key);
        persistProxyUrl(proxy);
        image = await generateImageHuggingFace(prompt, 1024, 1024, key, proxy);
      } else {
        const key = geminiKey.trim();
        if (!key) return;
        persistGeminiKey(key);
        image = await generateImageGemini(prompt, key, referenceImage, mode);
      }
      await placeGeneratedImage(image.src, prompt);
      setImagePrompt("");
    } catch (error) {
      setImageError({ kind: describeAiError(error), detail: describeAiErrorDetail(error) });
    } finally {
      setImageBusy(false);
    }
  };

  const providerKeyValid =
    provider === "pollinations" ||
    (provider === "huggingface" && hfKey.trim() && proxyUrl.trim()) ||
    (provider === "gemini" && geminiKey.trim());

  const onUploadReference = async (file: File) => {
    setReferenceImage(await readFileAsDataUrl(file));
  };

  const makeCopy = async () => {
    const trimmedBrief = brief.trim();
    const trimmedKey = apiKey.trim();
    if (!trimmedBrief || !trimmedKey || copyBusy) return;
    setCopyBusy(true);
    setCopyError(null);
    persistApiKey(trimmedKey);
    try {
      const copy = await generateCopy(trimmedBrief, trimmedKey, language);
      add(
        {
          id: crypto.randomUUID(),
          name: copy.subline.slice(0, 40),
          kind: "text",
          x: centerX - 400,
          y: centerY + 40,
          text: copy.subline,
          fontSize: 36,
          fontWeight: 400,
          fill: "#4A4E5A",
          width: 800,
          lineHeight: 1.3,
          align: "center",
          rotation: 0,
          opacity: 1,
          hidden: false,
          locked: false,
        },
        { select: false },
      );
      add({
        id: crypto.randomUUID(),
        name: copy.headline.slice(0, 40),
        kind: "text",
        x: centerX - 450,
        y: centerY - 160,
        text: copy.headline,
        fontSize: 96,
        fontWeight: 800,
        fill: "#16181D",
        width: 900,
        lineHeight: 1.05,
        align: "center",
        rotation: 0,
        opacity: 1,
        hidden: false,
        locked: false,
      });
      setBrief("");
    } catch (error) {
      setCopyError(describeAiError(error));
    } finally {
      setCopyBusy(false);
    }
  };

  return (
    <div className="shape-panel ai-panel">
      <p className="shape-panel-title">{t("ai.title")}</p>
      <section className="ai-section">
        <h4>
          <ImageIcon size={13} /> {t("ai.imageSection")}
        </h4>
        <div className="ai-provider-select">
          {IMAGE_PROVIDERS.map((option) => (
            <button
              key={option}
              className={provider === option ? "selected" : undefined}
              onClick={() => setProviderAndReset(option)}
            >
              {t(`ai.providers.${option}`)}
            </button>
          ))}
        </div>
        <p className="ai-hint">{t(`ai.providerHints.${provider}`)}</p>
        {provider === "huggingface" && (
          <>
            <label className="ai-key">
              <KeyRound size={13} />
              <input
                type="password"
                value={hfKey}
                placeholder={t("ai.hfKeyPlaceholder")}
                onChange={(event) => setHfKey(event.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="ai-key">
              <Sparkles size={13} />
              <input
                type="text"
                value={proxyUrl}
                placeholder={t("ai.proxyPlaceholder")}
                onChange={(event) => setProxyUrl(event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            {!proxyUrl.trim() && <p className="ai-hint">{t("ai.proxyRequired")}</p>}
          </>
        )}
        {provider === "gemini" && (
          <>
            <label className="ai-key">
              <KeyRound size={13} />
              <input
                type="password"
                value={geminiKey}
                placeholder={t("ai.geminiKeyPlaceholder")}
                onChange={(event) => setGeminiKey(event.target.value)}
                autoComplete="off"
              />
            </label>
            <div className="ai-reference">
              <input
                ref={fileInput}
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onUploadReference(file);
                  event.target.value = "";
                }}
              />
              {referenceImage ? (
                <div className="ai-reference-preview">
                  <img src={referenceImage} alt="" />
                  <button onClick={() => setReferenceImage(null)} title={t("ai.removeReference")}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="ai-reference-actions">
                  <button onClick={() => fileInput.current?.click()}>
                    <Upload size={13} />
                    {t("ai.uploadReference")}
                  </button>
                  {selectedImageSrc && (
                    <button onClick={() => setReferenceImage(selectedImageSrc)}>
                      <Sparkles size={13} />
                      {t("ai.useSelected")}
                    </button>
                  )}
                </div>
              )}
              {referenceImage && (
                <div className="ai-mode-select">
                  {REFERENCE_MODES.map((option) => (
                    <button
                      key={option}
                      className={mode === option ? "selected" : undefined}
                      onClick={() => setMode(option)}
                      title={t(`ai.modeHints.${option}`)}
                    >
                      {t(`ai.modes.${option}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <textarea
          value={imagePrompt}
          placeholder={t("ai.imagePlaceholder")}
          onChange={(event) => setImagePrompt(event.target.value)}
          rows={3}
        />
        <button
          className="ai-generate"
          onClick={makeImage}
          disabled={imageBusy || !imagePrompt.trim() || !providerKeyValid}
        >
          <Wand2 size={14} />
          {imageBusy ? t("ai.generating") : t("ai.generateImage")}
        </button>
        {imageError && (
          <p className="ai-error">
            {t(`ai.errors.${imageError.kind}`)}
            <span className="ai-error-detail">{imageError.detail}</span>
          </p>
        )}
      </section>
      <section className="ai-section">
        <h4>
          <Type size={13} /> {t("ai.copySection")}
        </h4>
        <textarea
          value={brief}
          placeholder={t("ai.copyPlaceholder")}
          onChange={(event) => setBrief(event.target.value)}
          rows={3}
        />
        <label className="ai-key">
          <KeyRound size={13} />
          <input
            type="password"
            value={apiKey}
            placeholder={t("ai.apiKeyPlaceholder")}
            onChange={(event) => setApiKey(event.target.value)}
            autoComplete="off"
          />
        </label>
        <p className="ai-hint">{t("ai.apiKeyHint")}</p>
        <button
          className="ai-generate"
          onClick={makeCopy}
          disabled={copyBusy || !brief.trim() || !apiKey.trim()}
        >
          <Wand2 size={14} />
          {copyBusy ? t("ai.generating") : t("ai.generateCopy")}
        </button>
        {copyError && <p className="ai-error">{t(`ai.errors.${copyError}`)}</p>}
      </section>
    </div>
  );
}
