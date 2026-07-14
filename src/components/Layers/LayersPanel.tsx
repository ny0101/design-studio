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

export function LayersPanel() {
  const { elements, selectedId, select, update, remove, reorder } = useStudioStore();
  return (
    <aside className="layers-panel">
      <div className="panel-heading">
        <p>Layers</p>
        <span>{elements.length}</span>
      </div>
      <div className="layer-list">
        {[...elements].reverse().map((element) => (
          <button
            key={element.id}
            className={selectedId === element.id ? "layer-row active" : "layer-row"}
            onClick={() => select(element.id)}
          >
            <span className="layer-name">
              <i className={`layer-kind ${element.kind}`} />
              {element.name}
            </span>
            <span className="layer-actions" onClick={(event) => event.stopPropagation()}>
              <button onClick={() => reorder(element.id, "up")} title="Bring forward">
                <ChevronUp size={13} />
              </button>
              <button onClick={() => reorder(element.id, "down")} title="Send backward">
                <ChevronDown size={13} />
              </button>
              <button
                onClick={() => update(element.id, { hidden: !element.hidden })}
                title="Toggle visibility"
              >
                {element.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={() => update(element.id, { locked: !element.locked })}
                title="Toggle lock"
              >
                {element.locked ? <Lock size={13} /> : <LockKeyholeOpen size={13} />}
              </button>
              <button
                onClick={() => !element.locked && remove(element.id)}
                disabled={element.locked}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
