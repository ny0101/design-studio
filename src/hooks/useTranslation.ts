import { useCallback } from "react";
import { translate } from "../utils/i18n";
import { useStudioStore } from "../store/studio-store";

export function useTranslation() {
  const language = useStudioStore((state) => state.language);
  const setLanguage = useStudioStore((state) => state.setLanguage);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );
  return { t, language, setLanguage };
}
