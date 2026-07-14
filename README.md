# Design Studio

Modern browser-based design tool for social media and e-commerce.

## Run locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run format:check
npm run build
```

## Project structure

```
public/legacy/        Preserved source editor (compatibility layer)
src/components/       UI components by workspace responsibility
src/config/app.ts     Single source of project metadata
src/store/            Zustand application state
src/types/            Shared TypeScript models
src/styles/           Global workspace styles
```

## Incremental migration policy

The original standalone editor remains intact in `public/legacy/design-studio.html` and is hosted inside the React workspace. This prevents regressions while its canvas, export, image analysis and configuration controls are progressively moved into native React/Konva components.

The current delivery establishes the Phase 1 application workspace:

- Modern toolbar with undo/redo, zoom, grid, guides, preview and PNG export
- Konva canvas with centered artboard, checkerboard workspace, selectable draggable text/shapes/images, and image upload
- Icon sidebar, live Layers panel (reorder, visibility, lock, delete), and contextual Properties panel
- Responsive layout, About view, footer, metadata centralization, ESLint and Prettier
- The preserved original editor remains available from **기존 편집기**, retaining SVG/PNG/JPG export, automatic generation, reference analysis and image-vectorisation features during the native migration

## Deployment

`vite.config.ts` uses a relative base (`./`) so the build can be served from GitHub Pages, including project pages.

## Copyright and license

Created by Nayoon Kim. Copyright © 2026 Nayoon Kim. See [LICENSE](LICENSE).
