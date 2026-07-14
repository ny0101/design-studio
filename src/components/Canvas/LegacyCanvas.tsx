import { ExternalLink, ShieldCheck } from "lucide-react";

export function LegacyCanvas() {
  return (
    <section className="canvas-area" aria-label="Design canvas">
      <div className="canvas-heading">
        <div>
          <p className="eyebrow">CANVAS</p>
          <h2>Design editor</h2>
        </div>
        <a
          className="legacy-link"
          href="./legacy/design-studio.html"
          target="_blank"
          rel="noreferrer"
        >
          Open full editor <ExternalLink size={14} />
        </a>
      </div>
      <div className="legacy-frame-wrap">
        <iframe
          title="Existing Design Studio editor"
          src="./legacy/design-studio.html"
          className="legacy-frame"
        />
      </div>
      <p className="canvas-status">
        <ShieldCheck size={14} /> Existing export, image analysis and vector-generation
        functions are retained.
      </p>
    </section>
  );
}
