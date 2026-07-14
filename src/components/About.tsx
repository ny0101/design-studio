import { APP_INFO } from "../config/app";

export function About() {
  const rows = [
    ["Project name", APP_INFO.name],
    ["Version", APP_INFO.version],
    ["Creator", APP_INFO.author],
    ["License", APP_INFO.license],
    ["GitHub", APP_INFO.github || "Not configured"],
    ["Homepage", APP_INFO.website || "Not configured"],
  ];
  return (
    <section className="about">
      <p className="eyebrow">ABOUT</p>
      <h1>{APP_INFO.name}</h1>
      <p>{APP_INFO.description}</p>
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
