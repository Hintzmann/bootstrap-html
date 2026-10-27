# Changelog

## Unreleased

- **Contract v2** — `components.json` has `contractVersion: 2`. Each component lists `scripts`: every module the markup loads, with its `pe-*` element or `null`, the package import, and whether it is required. Replaces `element`, which could not describe `step.js`, `count.js`, or `range-group.js`. Spin button now says that `step.js` is required for the buttons.
- `src/polyfills/index.js` exports `loadPolyfills(root)`. A client-side router calls it after each render; the first import only sees the markup that was there. Same feature checks, and a fallback is not fetched twice.
- `.gitattributes` keeps text files LF on every platform.
- **Breaking: tabs** — `<pe-tabs>` no longer reads or writes `.active` / `.show`. State is `aria-selected` on the tab and `hidden="until-found"` on every other panel, so Find in page reaches hidden text and selects its tab. The stylesheet maps `aria-selected="true"` to Bootstrap’s active look for `.nav-tabs`, `.nav-pills`, and `.nav-underline`. New `select(tabOrId)` and a bubbling `pe-tab-change` event with `{ tab, panel }`. A `.fade` pane fades in; the previous pane goes at once. Disabled means `disabled` or `aria-disabled="true"`; the `.disabled` class alone no longer skips a tab. Migration: remove `active` from `.nav-link` and `active show` from `.tab-pane`, then add `hidden="until-found"` to every pane except the selected one.
- **Breaking: alert** — `<pe-alert>` dismiss sets `hidden` and removes the node when its finite animations settle, with a timer as a failsafe. It no longer removes `.show` or reads `transition-duration`. Before that it fires a bubbling, cancelable `pe-dismiss`; a second dismiss while closing does nothing. `pe-alert.fade` fades opacity and display with `allow-discrete`. Migration: drop `show` from `class="alert … fade show"`.
- **Range group** writes `--pe-range-lower` / `--pe-range-upper`, and `data-pe="range-group"` works like `.form-range-group` for a group without Bootstrap classes.
- **Neutral patterns** — `src/patterns/<id>.html` and `.css` for 17 components: markup with no classes, hooked by `data-pe="<id>"`, and only the mechanics CSS (state selectors, top-layer transitions, anchors, fallbacks, reduced motion). `components.json` ships each as `pattern: { markup, css, hooks, files }` with a `patternUsage` note; the other seven say why in `patternless`. `llms-full.txt` shows the pattern before the Bootstrap example and adds rules for asset loading per stack and for who owns state. `/patterns/<id>` renders each pattern without Bootstrap CSS. The package ships `src/patterns` (export `bootstrap-html/patterns/*`).
- `count.js` keeps the output’s first element child after the number, whatever its class. It used to look for `.visually-hidden`.

- **Dropdown** — without CSS Anchor Positioning a `.dropdown-menu[popover]` opens centered in the viewport instead of at its top-left corner. Direction classes (`.dropup`, `.dropend`, `.dropstart`) have no effect there. There is still no Popper fallback.
- **Customizable select** — `selectedcontent` and `::field-content` are separate rules. Grouped, Chrome dropped the whole rule because it does not know `::field-content`, so `selectedcontent` lost its flex layout.
- **Range group** — two native `<input type="range">` stacked on one track in `<fieldset class="form-range-group">`. Optional `src/behaviors/range-group.js` clamps thumbs and writes `--pe-range-lower` / `--pe-range-upper` for the fill. `data-range-group="off"` skips the module. Not a `pe-*` element.
- **Spin button** — plus and minus buttons use `command="--step-up"` / `--step-down` with `commandfor` set to a native input id. `src/behaviors/step.js` calls `stepUp()` / `stepDown()` and fires `input` and `change`. Works on `number`, `range`, `date`, `month`, `week`, `time`, and `datetime-local`. Not a `pe-*` element. Optional `<output for>` announces the new value.
- The package ships `dist/components.json` (export `bootstrap-html/components.json`), the same contract served at `/components.json`. Each component now has an `example`: one canonical markup sample from `src/data/examples.js`, rendered on its docs page.
- `prepare` replaces `prepublishOnly`, so `npm install github:Hintzmann/bootstrap-html` builds `dist/css` and `dist/components.json`.
- Docs serve `/llms.txt`: markup rules and an absolute link to every component page and to `/components.json`, generated from the inventory.
- `/llms-full.txt` puts every example in an `html` code block next to its avoid list, so an agent reading text gets copyable markup instead of an escaped JSON string. The package ships it as `dist/llms-full.txt` with links to `homepage`.
- Docs `sitePath` always inserts a slash between GitHub Pages `base` and the route, so sidebar links are `/bootstrap-html/components/…` rather than `/bootstrap-htmlcomponents/…`.
- **Spinner** — `aria-busy="true"` on the host paints a loading disc with Bootstrap’s spinner tokens. No extra `.spinner-border` child and no spinner plugin. Buttons keep their name and use the small disc (`.spinner-border-sm` size). A block host hides its children visually. `prefers-reduced-motion` slows the turn. The docs page can toggle the attribute on each example; that script is not part of the package.
- Docs sidebar lists composed recipes under **Recipes** after Components, not as a component. One mixed-examples page for now.
- Docs README lists every inventory route (A–Z, then forms). Getting started names `interestForElement` next to the other polyfill checks. `AGENTS.md` documents `src/behaviors/count.js` as a module, not a `pe-*` element.
- Docs templates use `compressHTML: true` so a newline before `<code>` or `<a>` stays a space (Astro 7’s JSX compact would glue `onComposed`).
- **Output** — `<output data-controls>` and `count.js` live on `/forms/output`. The fieldset demo moved there; Composed examples keep recipes that use the same contract.
- **Buttons** — toggle state is checkbox or radio plus `.btn-check`. Replaces `data-bs-toggle="button"`. No script sets `aria-pressed`.
- **Composed examples** — filter drawer with count, lightbox, confirm-then-toast, command palette (`dialog` + `search` + static links), price toggle (`:has(:checked)`), and an experimental `interestfor` preview card.

## 0.3.0

- **Progress** — `<progress class="progress">` with Bootstrap’s `--bs-progress-*` tokens. `value` / `max` replace an inner `.progress-bar`. Omit `value` for the indeterminate stripe. `<meter class="meter">` is a gauge with `low` / `high` / `optimum` bands; Bootstrap has no equivalent.
- **Field sizing** — opt-in `.field-sizing` on `.form-control` / `.form-select`. `field-sizing: content` grows the control to its value. Bootstrap has no equivalent.
- **Datalist** — `list` on an input pointing at a `<datalist>` id. Native typeahead; no dropdown script.
- **Customizable select** — opt-in `appearance: base-select` on single `.form-select`. `::picker(select)`, `::picker-icon`, and `::checkmark` use form-select and dropdown tokens. Experimental; without support the OS picker stays.
- **Composed** — seven recipes on existing primitives (context menu, offcanvas drill-down, toast countdown bar, sliding tab underline, progress ring, shrinking header plus scroll progress, multi-select dropdown). Nested details live in `.nav-tree` so the tree can sit in a drawer or on the page. Checked counts use `<output data-controls>` filled by `src/behaviors/count.js`; the control is a container id and is not tied to a dropdown. No new `pe-*` element. Parts need anchor positioning or `animation-timeline: scroll()`.
- **Validation** — `:user-valid` success styles on `.form-check-input` only apply when the control is `required`. A non-required checkbox is always valid, so a click no longer paints it green.
- Navbar search wraps the form in `<search>`. Do not also set `role="search"` on the form.
- Modal confirm uses `<form method="dialog">`. Submit buttons set `dialog.returnValue` and close without script.
- Bootstrap’s `[hidden] { display: none !important }` is overridden for `hidden="until-found"` so Find in page can reveal a custom hidden region. Accordion and collapse panels stay on `<details>`.
- **Dropdown submenus** — `.dropdown-submenu` with a nested `popover="auto"`. Bootstrap 5 dropped this because Popper could not keep the parent open. `position-try-fallbacks` includes `flip-inline`.
- **Tooltip** — `popover="hint"` in the top layer, opened with `interestfor`. `aria-description` stays the no-script fallback. The `interestfor` polyfill loads when that API is missing. It does not polyfill `popover="hint"`. `.bs-tooltip-auto` on a hint popover flips with `position-try-fallbacks`. `interest-delay-start` / `interest-delay-end` replace `data-bs-delay`.
- Validation docs live at `/forms/validation`, next to Field sizing, matching Bootstrap’s Forms section.
- Docs sidebar and home catalog list components A–Z. Form and Polyfills stay after that list. Section headings use the same Bootstrap Icons as getbootstrap.com. The page TOC uses a left border instead of an underline.

## 0.2.0

- **Navbar** — `<details>` / `<summary>` collapse, or a `<dialog class="offcanvas">`. The brand stays outside the panel.
- **`pe-focus-group`** — optional arrow, Home, and End keys (`src/behaviors/focus-group.js`). Not part of the polyfill loader. The dropdown and accordion still work with Tab when the script is absent.
- **`pe-toast`** — optional `data-delay` autohide and stacking (`src/behaviors/toast.js`). Show and close stay on `popover="manual"` and `command` / `commandfor`.
- **`pe-tabs`** — required behavior for tab panes (`src/behaviors/tabs.js`). `role="tab"` and `aria-controls` replace `data-bs-toggle` and `data-bs-target`.
- **`pe-alert`** — required behavior for dismissible alerts (`src/behaviors/alert.js`). `command="--dismiss"` and `commandfor` replace `data-bs-dismiss="alert"`.
- **`pe-carousel`** — optional prev, next, and pip controls for browsers without `::scroll-button` (`src/behaviors/carousel.js`). `command="--prev"`, `--next`, and `--slide` target the `.carousel-inner` id. The element is inert where the native scroll buttons exist, and scroll snap works without it.
- Toast stacking reads its gap from `--bs-toast-spacing` in CSS instead of measuring a probe element.
- Browser matrix separates `::details-content` from `interpolate-size`, so the accordion and collapse height transition is correctly listed as Chromium-only.
- Component contracts (required element, required script, polyfills, Baseline status, removed Bootstrap hooks) live in one data file and are served at `/components.json`.
- Docs pages share Accessibility and Browser support sections generated from that inventory. Example titles are `h3`, so the page TOC lists sections rather than demos.
- `stylelint` (Bootstrap’s config) and `vitest` tests for the `pe-*` behaviors run in CI.
- Docs site header can pin a light or dark theme. That toggle is docs-only.

## 0.1.0

Public preview of Bootstrap HTML. This is not a drop-in replacement for Bootstrap's JavaScript.

- Installable CSS and Sass entry, plus a feature-detected polyfill loader.
- Docs for the native widgets (accordion, collapse, modal, offcanvas, dropdown, popover, tooltip, validation), with experimental scrollspy and carousel called out separately.
- Tabs are not part of this release. Navbar, `pe-focus-group`, and toasts came after the tag.
- Browser matrix separates what works with no script, what a polyfill covers, and what has no fallback. CSS anchor positioning has no fallback.
