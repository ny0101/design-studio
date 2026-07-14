import { APP_INFO } from "../config/app";
import { useTranslation } from "../hooks/useTranslation";

export function About() {
  const { t } = useTranslation();
  const rows = [
    [t("about.projectName"), APP_INFO.name],
    [t("about.version"), APP_INFO.version],
    [t("about.creator"), APP_INFO.author],
    [t("about.license"), APP_INFO.license],
    [t("about.github"), APP_INFO.github || t("about.notConfigured")],
    [t("about.homepage"), APP_INFO.website || t("about.notConfigured")],
  ];
  return (
    <section className="about">
      <p className="eyebrow">{t("about.eyebrow")}</p>
      <h1>{APP_INFO.name}</h1>
      <p>{t("app.description")}</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
