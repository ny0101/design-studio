import { useEffect } from "react";
import { useStudioStore } from "../store/studio-store";

const NUDGE = 1;
const NUDGE_LARGE = 10;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
};

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const state = useStudioStore.getState();
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const selected = state.elements.find((item) => item.id === state.selectedId);

      if (mod && key === "z" && !event.shiftKey) {
        event.preventDefault();
        state.undo();
      } else if ((mod && key === "y") || (mod && event.shiftKey && key === "z")) {
        event.preventDefault();
        state.redo();
      } else if (mod && key === "c") {
        event.preventDefault();
        state.copy();
      } else if (mod && key === "v") {
        event.preventDefault();
        state.paste();
      } else if (mod && key === "d") {
        event.preventDefault();
        state.duplicate();
      } else if (key === "delete" || key === "backspace") {
        if (selected && !selected.locked) {
          event.preventDefault();
          state.remove(selected.id);
        }
      } else if (key === "escape") {
        state.select(null);
      } else if (key.startsWith("arrow") && selected && !selected.locked) {
        event.preventDefault();
        const step = event.shiftKey ? NUDGE_LARGE : NUDGE;
        const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
        const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
        state.update(selected.id, { x: selected.x + dx, y: selected.y + dy });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
