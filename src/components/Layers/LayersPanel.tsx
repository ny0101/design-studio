import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  LockKeyholeOpen,
  Trash2,
} from "lucide-react";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

export function LayersPanel() {
  const { elements, selectedId, select, update, remove, reorder } = useStudioStore();
  const { t } = useTranslation();
  return (
    <aside className="layers-panel">
      <div className="panel-heading">
        <p>{t("layers.title")}</p>
        <span>{elements.length}</span>
      </div>
      <div className="layer-list">
        {[...elements].reverse().map((element) => (
          <div
            key={element.id}
            role="button"
            tabIndex={0}
            className={selectedId === element.id ? "layer-row active" : "layer-row"}
            onClick={() => select(element.id)}
            onKeyDown={(event) => event.key === "Enter" && select(element.id)}
          >
            <span className="layer-name">
              <i className={`layer-kind ${element.kind}`} />
              {element.name}
            </span>
            <span className="layer-actions" onClick={(event) => event.stopPropagation()}>
              <button
                onClick={() => reorder(element.id, "up")}
                title={t("layers.bringForward")}
              >
                <ChevronUp size={13} />
              </button>
              <button
                onClick={() => reorder(element.id, "down")}
                title={t("layers.sendBackward")}
              >
                <ChevronDown size={13} />
              </button>
              <button
                onClick={() => update(element.id, { hidden: !element.hidden })}
                title={t("layers.toggleVisibility")}
              >
                {element.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={() => update(element.id, { locked: !element.locked })}
                title={t("layers.toggleLock")}
              >
                {element.locked ? <Lock size={13} /> : <LockKeyholeOpen size={13} />}
              </button>
              <button
                onClick={() => !element.locked && remove(element.id)}
                disabled={element.locked}
                title={t("layers.delete")}
              >
                <Trash2 size={13} />
              </button>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
