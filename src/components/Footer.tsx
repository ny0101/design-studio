import { APP_INFO } from "../config/app";
import { useTranslation } from "../hooks/useTranslation";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer>
      {APP_INFO.name}
      <span>{t("footer.createdBy", { name: APP_INFO.author })}</span>
      <span>{APP_INFO.copyright}</span>
      <span>{t("footer.version", { version: APP_INFO.version })}</span>
    </footer>
  );
}
