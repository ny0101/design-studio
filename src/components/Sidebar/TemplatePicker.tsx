import { useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import type { CanvasElement } from "../../types/studio";
import {
  BUILTIN_TEMPLATES,
  deleteUserTemplate,
  loadUserTemplates,
  saveUserTemplate,
} from "../../utils/templates";
import { buildSvg } from "../../utils/svg-export";
import { CANVAS_SIZE } from "../Canvas/DesignCanvas";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const previewUri = (elements: CanvasElement[]) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(buildSvg(elements, CANVAS_SIZE))}`;

export function TemplatePicker() {
  const { applyTemplate, setTool } = useStudioStore();
  const { t } = useTranslation();
  const [userTemplates, setUserTemplates] = useState(loadUserTemplates);
  const [name, setName] = useState("");
  const builtinPreviews = useMemo(
    () =>
      BUILTIN_TEMPLATES.map((template) => ({
        ...template,
        preview: previewUri(template.elements),
      })),
    [],
  );
  const apply = (elements: CanvasElement[]) => {
    applyTemplate(elements);
    setTool("select");
  };
  const saveCurrent = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { elements } = useStudioStore.getState();
    setUserTemplates(saveUserTemplate(trimmed, elements));
    setName("");
  };
  return (
    <div className="shape-panel template-panel">
      <p className="shape-panel-title">{t("templates.title")}</p>
      <div className="template-grid">
        {builtinPreviews.map((template) => (
          <button
            key={template.key}
            onClick={() => apply(template.elements)}
            title={t(`templates.${template.key}`)}
          >
            <img src={template.preview} alt={t(`templates.${template.key}`)} />
            <span>{t(`templates.${template.key}`)}</span>
          </button>
        ))}
      </div>
      {userTemplates.length > 0 && (
        <>
          <p className="shape-panel-title template-section">
            {t("templates.mine")}
          </p>
          <div className="template-grid">
            {userTemplates.map((template) => (
              <div className="template-user" key={template.id}>
                <button onClick={() => apply(template.elements)} title={template.name}>
                  <img src={previewUri(template.elements)} alt={template.name} />
                  <span>{template.name}</span>
                </button>
                <button
                  className="template-delete"
                  onClick={() => setUserTemplates(deleteUserTemplate(template.id))}
                  title={t("templates.delete")}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="template-save">
        <input
          type="text"
          value={name}
          placeholder={t("templates.namePlaceholder")}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && saveCurrent()}
        />
        <button onClick={saveCurrent} disabled={!name.trim()} title={t("templates.saveCurrent")}>
          <Save size={14} />
        </button>
      </div>
    </div>
  );
}
