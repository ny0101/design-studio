import { useState } from "react";
import { Image as ImageIcon, KeyRound, Type, Wand2 } from "lucide-react";
import {
  describeAiError,
  generateCopy,
  generateImage,
  loadApiKey,
  persistApiKey,
} from "../../utils/ai";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

export function AIPanel() {
  const { add, canvasSize } = useStudioStore();
  const { t, language } = useTranslation();
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [brief, setBrief] = useState("");
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [copyBusy, setCopyBusy] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  const makeImage = async () => {
    const prompt = imagePrompt.trim();
    if (!prompt || imageBusy) return;
    setImageBusy(true);
    setImageError(false);
    try {
      const image = await generateImage(prompt, 1024, 1024);
      add({
        id: crypto.randomUUID(),
        name: prompt.slice(0, 40),
        kind: "image",
        src: image.src,
        x: centerX - 320,
        y: centerY - 320,
        width: 640,
        height: 640,
        radius: 0,
        brightness: 100,
        rotation: 0,
        opacity: 1,
        hidden: false,
        locked: false,
      });
      setImagePrompt("");
    } catch {
      setImageError(true);
    } finally {
      setImageBusy(false);
    }
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
        <textarea
          value={imagePrompt}
          placeholder={t("ai.imagePlaceholder")}
          onChange={(event) => setImagePrompt(event.target.value)}
          rows={3}
        />
        <button
          className="ai-generate"
          onClick={makeImage}
          disabled={imageBusy || !imagePrompt.trim()}
        >
          <Wand2 size={14} />
          {imageBusy ? t("ai.generating") : t("ai.generateImage")}
        </button>
        {imageError && <p className="ai-error">{t("ai.imageError")}</p>}
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
