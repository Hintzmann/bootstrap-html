This project's Baseline target is Baseline Newly available.

Prefer native HTML and CSS over JavaScript. Fix layout issues with CSS. Do not use JavaScript to scroll, measure, or reposition elements to correct layout. The single exception is a `pe-*` behavior where the platform has no CSS path for the job: `src/behaviors/carousel.js` sets `inner.scrollLeft` while panning, and only behind `@supports not selector(::scroll-button(inline-start))`. Every such exception must be stated in the module's header comment, naming what the platform is missing. Do not add `bootstrap.js` or classList-driven UI state. Polyfills live in `src/polyfills/` and must be loaded only after feature-detecting the missing API (and only when the document uses it). Never load a polyfill unconditionally. Experimental platform features (for example `scroll-target-group` and `::scroll-button`) are in scope when a component is marked experimental in the docs.

Custom elements are prefixed `pe-`, never `pep-`: `pe-alert` (`src/behaviors/alert.js`), `pe-carousel` (`src/behaviors/carousel.js`), `pe-focus-group` (`src/behaviors/focus-group.js`), `pe-tabs` (`src/behaviors/tabs.js`), `pe-toast` (`src/behaviors/toast.js`).

`src/behaviors/count.js` is a module, not a custom element. Load it on pages that use `<output data-controls>`. `data-controls` is a container id, with no hash — the same shape as `commandfor`. The script listens to `change` and writes how many `input[type=checkbox]` inside that node are checked. Do not add `pe-count`. Do not watch the `checked` attribute with a MutationObserver (that misses clicks and `el.checked = true`). Visible checkboxes can use a CSS counter instead; a closed popover cannot.

`src/data/components.js` is the component inventory: the required or optional `pe-*` element, polyfills, Baseline status, the Bootstrap hooks each component replaces, and the markup that is not supported (`avoid`). `nav` is the docs sidebar group (`components`, `recipes`, or `forms`). Composed recipes are `recipes`, not a component. Read it before writing component markup, and update it when a component changes. The docs pages and `/components.json` are generated from it, so do not restate its contents in a page.

Docs `.astro` templates use `compressHTML: true` in `astro.config.mjs`. Astro 7’s default JSX compact would glue a wrapped `on <a>` into `onComposed`. Wrap prose onto `<code>`, `<a>`, `<em>`, or `<strong>` with the preceding word on its own line; the newline is the space. Do not switch `compressHTML` back to `"jsx"`.

For HTML, CSS, and client-side UI work, use the `modern-web-guidance` skill first: search and retrieve guides before inventing a pattern.

See https://developer.chrome.com/docs/modern-web-guidance
