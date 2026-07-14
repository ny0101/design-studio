import { useMemo, useState } from "react";
import { ICON_LIBRARY } from "../../utils/icons";
import { CANVAS_SIZE } from "../Canvas/DesignCanvas";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

export function IconPicker() {
  const { add, setTool } = useStudioStore();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ICON_LIBRARY;
    return ICON_LIBRARY.filter((entry) => entry.name.toLowerCase().includes(needle));
  }, [query]);
  const pick = (name: string) => {
    add({
      id: crypto.randomUUID(),
      name,
      kind: "icon",
      icon: name,
      color: "#16181D",
      x: CANVAS_SIZE / 2 - 64,
      y: CANVAS_SIZE / 2 - 64,
      width: 128,
      height: 128,
      strokeWidth: 2,
      rotation: 0,
      opacity: 1,
      hidden: false,
      locked: false,
    });
    setTool("select");
  };
  return (
    <div className="shape-panel icon-panel">
      <p className="shape-panel-title">{t("icons.title")}</p>
      <input
        className="icon-search"
        type="search"
        placeholder={t("icons.search")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoFocus
      />
      <div className="icon-grid">
        {filtered.map(({ name, Component }) => (
          <button key={name} onClick={() => pick(name)} title={name}>
            <Component size={19} />
          </button>
        ))}
        {!filtered.length && <p className="icon-empty">{t("icons.empty")}</p>}
      </div>
    </div>
  );
}
