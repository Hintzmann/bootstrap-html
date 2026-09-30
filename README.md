# Bootstrap HTML

Bootstrap 5.3.8 look and tokens on native HTML.

0.3 is a preview, not a drop-in for `bootstrap.js`. CSS-only Bootstrap behavior tracks 5.3.8. The native widgets are versioned on their own and do not promise every Bootstrap JavaScript option.

## Works with HTML and CSS

- **Accordion** — `<details>` / `<summary>` with `name` for an exclusive group. Find in page can match a closed panel.
- **Alert** — a static `.alert` is markup. Dismissing one needs `pe-alert`
- **Buttons** — a toggle is a checkbox or radio with `.btn-check`. No button plugin.
- **Collapse** — `<details>` / `<summary>` (trigger and content must be parent/child). Find in page can match a closed panel.
- **Modal** — `<dialog>` opened with `command` / `commandfor`. Confirm without script: `<form method="dialog">` and `dialog.returnValue`.
- **Offcanvas** — `<dialog>` with placement modifiers, opened with `command` / `commandfor`
- **Navbar** — `<details>` / `<summary>` menu, or a `<dialog class="offcanvas">`. Wrap the search form in `<search>`.
- **Dropdown** — `popover="auto"` and CSS Anchor Positioning (no Popper). Nested `.dropdown-submenu` menus stay open with the parent.
- **Popover** — `popover="auto"` titled bubbles and CSS Anchor Positioning (no Popper)
- **Tooltip** — `aria-description` and CSS generated content (plain text, no-script fallback). `popover="hint"` plus `interestfor` for a top-layer bubble; the `interestfor` polyfill loads when that API is missing.
- **Validation** — `:user-valid` / `:user-invalid` (no `.was-validated`)
- **Field sizing** — `.field-sizing` on `.form-control` / `.form-select`. The control grows to its contents.
- **Datalist** — `list` on an input pointing at a `<datalist>` id. Native typeahead.
- **Output** — `<output data-controls>` plus optional `count.js` for checked boxes.
- **Customizable select** — `.form-select` opts into `appearance: base-select` where supported. The picker, caret, and checkmark use Bootstrap tokens.
- **Toast** — `popover="manual"` and `command` / `commandfor`. Optional `pe-toast` for `data-delay` and stacking
- **Progress** — `<progress class="progress">`. Omit `value` for the indeterminate stripe. `<meter class="meter">` has no Bootstrap equivalent
- **Spinner** — `aria-busy="true"` on the host. CSS paints the disc. No extra spinner element.
- **Composed examples** — mixed recipes on those primitives: context menu, offcanvas drill-down, toast countdown, sliding tab underline, progress ring, shrinking header plus scroll progress, multi-select dropdown, filter drawer, lightbox, confirm-then-toast, command palette, price toggle, interest preview

Class names stay Bootstrap’s (`.accordion`, `.modal`, `.dropdown`, `.bs-tooltip-*`, …). Grid, forms, cards, and the other CSS-only pieces come along in the same stylesheet.

Tabs are not in that list. Switching panes needs `<pe-tabs>` and `src/behaviors/tabs.js`, described under Install.

## Limits

- **Experimental** — [scrollspy](src/pages/components/scrollspy.astro) (`scroll-target-group`) and [carousel](src/pages/components/carousel.astro) (`::scroll-button`, `::scroll-marker`) are Chromium-only. Both degrade rather than break: the nav still links, and the carousel still snaps and swipes. [Customizable select](src/pages/forms/customizable-select.astro) (`appearance: base-select`) is Chrome 135+ and Safari 27+; Firefox 149 needs a flag. Without it, `.form-select` keeps the OS menu. Tooltip `interestfor` is Chrome 142+; `popover="hint"` is Chrome 151+ and Firefox 153+. The `interestfor` polyfill covers hover/focus where that API is missing. The `aria-description` fallback still works without hint. [Composed examples](src/pages/components/composed.astro) recipes that need `animation-timeline: scroll()` or CSS Anchor Positioning drop the extra motion when those features are missing.
- **Accordion and collapse animation** — the panel opens everywhere, but the height transition needs `interpolate-size: allow-keywords`, which is Chromium-only. Firefox and Safari snap the panel open.
- **Anchor positioning** — dropdown, popover, hint tooltips, and the carousel controls have no fallback. Firefox before 147 and Safari before 26 open the menu without tethering it to the button. There is no Popper substitute.

See the [browser matrix](src/pages/index.astro) on the docs homepage.

## Install

CSS, after `npm install bootstrap-html`:

```html
<link rel="stylesheet" href="./node_modules/bootstrap-html/dist/css/bootstrap-html.min.css">
<script type="module" src="./node_modules/bootstrap-html/src/polyfills/index.js"></script>
```

Load that module URL directly. The loader feature-detects each API and fetches a polyfill only when the page uses markup that needs it.

Arrow keys are optional. Load the behavior and wrap the group in `<pe-focus-group>` when you want Arrow, Home, and End. Dropdown items and accordion summaries are the documented cases. Tab still works if that script is absent. A nested group owns its own items.

```html
<script type="module" src="./node_modules/bootstrap-html/src/behaviors/focus-group.js"></script>
```

Tabs need their behavior. Wrap the list and the panes in `<pe-tabs>` and load `src/behaviors/tabs.js`. Without that module the `.active` pane stays visible and nothing switches. Use `role="tab"` and `aria-controls`. Do not add `data-bs-toggle` or `data-bs-target`.

```html
<script type="module" src="./node_modules/bootstrap-html/src/behaviors/tabs.js"></script>
```

Dismissible alerts need their behavior. Use `<pe-alert class="alert">` and load `src/behaviors/alert.js`. The close button uses `command="--dismiss"` and `commandfor` set to the alert id, with no hash. Without that module the alert stays. A static alert does not use the element.

```html
<script type="module" src="./node_modules/bootstrap-html/src/behaviors/alert.js"></script>
```

Toast autohide is optional the same way. Use `<pe-toast class="toast" data-delay="5000">` and load `src/behaviors/toast.js`. Show and close still work with `command` if that script is absent.

```html
<script type="module" src="./node_modules/bootstrap-html/src/behaviors/toast.js"></script>
```

Carousel controls are optional. `::scroll-button` and `::scroll-marker` draw the prev, next, and pip controls in Chromium with no script. Elsewhere, wrap the carousel in `<pe-carousel class="carousel">`, write the buttons yourself with `command="--prev"`, `command="--next"`, or `command="--slide"` pointing at the `.carousel-inner` id, and load `src/behaviors/carousel.js`. The element does nothing when the browser has `::scroll-button`. Scroll snap and touch swipe work either way.

```html
<script type="module" src="./node_modules/bootstrap-html/src/behaviors/carousel.js"></script>
```

The checked-count is optional. Load `src/behaviors/count.js` on pages that use `<output data-controls>`. `data-controls` is a container id, with no hash. The script writes how many `input[type=checkbox]` inside that node are checked. It is not tied to a dropdown.

```html
<script type="module" src="./node_modules/bootstrap-html/src/behaviors/count.js"></script>
```

Sass. Set variables after Bootstrap’s functions and before this entry. Bootstrap’s variables are `!default`, so yours win. `bootstrap` stays a dependency.

```scss
@import "bootstrap/scss/functions";

$primary: #6610f2;

@import "bootstrap-html/scss/bootstrap-html";
```

On the compiled CSS, override tokens with `--bs-*` custom properties instead.

## Versioning

- Styles that Bootstrap already does in CSS track Bootstrap 5.3.8.
- Native widgets follow this package’s semver. A missing Bootstrap plugin option is not a break unless this package already shipped it.

## Docs site

Routes on the deployed site (GitHub Pages: `https://<owner>.github.io/<repo>/`):

| Route | Source (works in this repo on GitHub) |
| --- | --- |
| `/getting-started/` | [src/pages/getting-started.astro](src/pages/getting-started.astro) |
| `/` (browser matrix) | [src/pages/index.astro](src/pages/index.astro) |
| `/components/accordion/` | [src/pages/components/accordion.astro](src/pages/components/accordion.astro) |
| `/components/alerts/` | [src/pages/components/alerts.astro](src/pages/components/alerts.astro) |
| `/components/buttons/` | [src/pages/components/buttons.astro](src/pages/components/buttons.astro) |
| `/components/carousel/` | [src/pages/components/carousel.astro](src/pages/components/carousel.astro) |
| `/components/collapse/` | [src/pages/components/collapse.astro](src/pages/components/collapse.astro) |
| `/components/composed/` | [src/pages/components/composed.astro](src/pages/components/composed.astro) |
| `/components/dropdown/` | [src/pages/components/dropdown.astro](src/pages/components/dropdown.astro) |
| `/components/modal/` | [src/pages/components/modal.astro](src/pages/components/modal.astro) |
| `/components/navbar/` | [src/pages/components/navbar.astro](src/pages/components/navbar.astro) |
| `/components/offcanvas/` | [src/pages/components/offcanvas.astro](src/pages/components/offcanvas.astro) |
| `/components/popover/` | [src/pages/components/popover.astro](src/pages/components/popover.astro) |
| `/components/progress/` | [src/pages/components/progress.astro](src/pages/components/progress.astro) |
| `/components/scrollspy/` | [src/pages/components/scrollspy.astro](src/pages/components/scrollspy.astro) |
| `/components/spinner/` | [src/pages/components/spinner.astro](src/pages/components/spinner.astro) |
| `/components/tabs/` | [src/pages/components/tabs.astro](src/pages/components/tabs.astro) |
| `/components/toasts/` | [src/pages/components/toasts.astro](src/pages/components/toasts.astro) |
| `/components/tooltip/` | [src/pages/components/tooltip.astro](src/pages/components/tooltip.astro) |
| `/forms/customizable-select/` | [src/pages/forms/customizable-select.astro](src/pages/forms/customizable-select.astro) |
| `/forms/datalist/` | [src/pages/forms/datalist.astro](src/pages/forms/datalist.astro) |
| `/forms/field-sizing/` | [src/pages/forms/field-sizing.astro](src/pages/forms/field-sizing.astro) |
| `/forms/output/` | [src/pages/forms/output.astro](src/pages/forms/output.astro) |
| `/forms/validation/` | [src/pages/forms/validation.astro](src/pages/forms/validation.astro) |
| `/polyfills/` | [src/pages/polyfills.astro](src/pages/polyfills.astro) |
| `/components.json` | [src/data/components.js](src/data/components.js) |

## Component contracts

[src/data/components.js](src/data/components.js) is the inventory: per component, the required or optional `pe-*` element, the polyfills it may pull, its Baseline status, the Bootstrap JavaScript hooks it replaces, and the markup that is not supported. The catalog, the browser matrix, the migration table, the sidebar, and the JS cost table on each page all read it, so those cannot drift apart.

The same data is served as JSON at `/components.json` for tooling and agents:

```sh
curl https://<owner>.github.io/<repo>/components.json
```

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` writes the docs to `dist/` and the package CSS to `dist/css/`.

SCSS for the interactive widgets is adapted from Bootstrap 5.3.8, copyright The Bootstrap Authors, MIT. See [LICENSE](LICENSE).
