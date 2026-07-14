import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CopyPlus,
  Eye,
  EyeOff,
  Group,
  Lock,
  LockKeyholeOpen,
  Trash2,
  Ungroup,
} from "lucide-react";
import { useStudioStore } from "../../store/studio-store";
import { useTranslation } from "../../hooks/useTranslation";

const groupColor = (groupId: string) => {
  let hash = 0;
  for (const char of groupId) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return `hsl(${hash}, 65%, 60%)`;
};

export function LayersPanel() {
  const {
    elements,
    selectedIds,
    select,
    toggleSelect,
    update,
    rename,
    remove,
    reorder,
    duplicate,
    group,
    ungroup,
  } = useStudioStore();
  const { t } = useTranslation();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const canGroup = selectedIds.length >= 2;
  const canUngroup = elements.some(
    (element) => selectedIds.includes(element.id) && element.groupId,
  );
  const commitRename = (id: string, name: string) => {
    const trimmed = name.trim();
    if (trimmed) rename(id, trimmed);
    setRenamingId(null);
  };
  return (
    <aside className="layers-panel">
      <div className="panel-heading">
        <p>{t("layers.title")}</p>
        <span className="panel-heading-actions">
          {canGroup && (
            <button onClick={group} title={t("layers.group")}>
              <Group size={14} />
            </button>
          )}
          {canUngroup && (
            <button onClick={ungroup} title={t("layers.ungroup")}>
              <Ungroup size={14} />
            </button>
          )}
          <span>{elements.length}</span>
        </span>
      </div>
      <div className="layer-list">
        {[...elements].reverse().map((element) => (
          <div
            key={element.id}
            role="button"
            tabIndex={0}
            className={
              selectedIds.includes(element.id) ? "layer-row active" : "layer-row"
            }
            style={
              element.groupId
                ? { boxShadow: `inset 2px 0 0 ${groupColor(element.groupId)}` }
                : undefined
            }
            onClick={(event) =>
              event.shiftKey ? toggleSelect(element.id) : select(element.id)
            }
            onKeyDown={(event) => event.key === "Enter" && select(element.id)}
            onDoubleClick={() => setRenamingId(element.id)}
          >
            <span className="layer-name">
              <i className={`layer-kind ${element.kind}`} />
              {renamingId === element.id ? (
                <input
                  className="layer-rename"
                  autoFocus
                  defaultValue={element.name}
                  onClick={(event) => event.stopPropagation()}
                  onBlur={(event) => commitRename(element.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter")
                      commitRename(element.id, event.currentTarget.value);
                    if (event.key === "Escape") setRenamingId(null);
                  }}
                />
              ) : (
                element.name
              )}
            </span>
            <span className="layer-actions" onClick={(event) => event.stopPropagation()}>
              <button onClick={() => reorder(element.id, "up")} title={t("layers.bringForward")}>
                <ChevronUp size={13} />
              </button>
              <button onClick={() => reorder(element.id, "down")} title={t("layers.sendBackward")}>
                <ChevronDown size={13} />
              </button>
              <button onClick={() => duplicate(element.id)} title={t("layers.duplicate")}>
                <CopyPlus size={13} />
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
