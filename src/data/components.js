/**
 * The component inventory. One entry per documented component.
 *
 * This is the single source for the catalog and browser matrix on the home
 * page, the migration table under Getting started, the sidebar, the JS cost
 * table on each component page, and the /components.json endpoint. Adding a
 * component here puts it in the nav; it cannot be forgotten in one place.
 *
 * Text fields use Markdown backticks for inline code. Render them through
 * `inlineMarkup` in src/lib/markup.js, which escapes first.
 *
 * Fields
 * - nav        Sidebar group: `components`, `recipes`, or `forms`. Recipes
 *              are mixed composed-element examples, not a single widget.
 * - status     `native` needs no component script. `script` does.
 * - baseline   `newly` is Baseline Newly available. `experimental` is not
 *              interoperable yet and is labelled as such in the docs.
 * - behavior   The optional or required `pe-*` element, or null.
 * - cost       Rendered by JsCost.astro. `polyfill` holds ids from
 *              ./js-cost.js.
 * - support     The three columns of the browser matrix: what works with no
 *              script, what a polyfill covers, and what has no fallback.
 * - removed    Bootstrap JavaScript hooks this component replaces.
 * - avoid      Markup that looks right but is not supported here.
 * - a11y       Accessibility notes rendered after the examples.
 */

export const components = [
  {
    id: "accordion",
    route: "/components/accordion",
    name: "Accordion",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "Exclusive groups with details/summary and name.",
    behavior: {
      element: "pe-focus-group",
      module: "src/behaviors/focus-group.js",
      required: false,
      adds: "Arrow, Home, and End keys across the summaries. Tab works without it.",
    },
    cost: {
      bootstrap: "Collapse plugin. Accordion is that plugin; there is no accordion.js.",
      bootstrapJs: "5.6 KB gzip",
      native: "details and summary, with name for an exclusive group",
      nativeJs: "0 KB",
    },
    support: {
      noScript: "`details` / `summary`. Exclusive `name`: Chrome 120+, Firefox 130+, Safari 17.2+.",
      polyfill: "None",
      noFallback:
        "The height transition needs `interpolate-size: allow-keywords` to animate `block-size` from `0` to `auto`. That is Chromium-only (Chrome 129+), so Firefox and Safari snap the panel open. `::details-content` itself is Chrome 131+, Firefox 143+, Safari 18.4+, and only styles the panel.",
    },
    removed: [
      {
        from: "Accordion buttons",
        to: "`<details class=\"accordion-item\">` with `<summary class=\"accordion-button\">`",
      },
      { from: "`data-bs-parent`", to: "The same `name` on every `<details>` in the group" },
    ],
    avoid: [
      "`.accordion-button` has to be the `<summary>`, a direct child of the `<details>`.",
      "No `data-bs-toggle`. Opening state is the `open` attribute.",
      "Do not put `hidden` or `hidden=\"until-found\"` on `.accordion-body`. An open item would stay hidden. Accordion panels are `<details>`; `hidden=\"until-found\"` is for custom regions.",
    ],
    a11y: [
      "`<details>` / `<summary>` is a disclosure. The browser exposes expanded and collapsed; do not add `aria-expanded` on the summary.",
      "Do not put a heading inside `<summary>`. Screen-reader heading lists skip that text.",
      "Tab reaches every summary without script. Optional `<pe-focus-group>` adds Arrow, Home, and End. Enter and Space still open the item.",
      "Closed panels stay in the document. Find in page can match them. Do not add `display: none` on the body.",
    ],
  },
  {
    id: "alerts",
    route: "/components/alerts",
    name: "Alerts",
    nav: "components",
    status: "script",
    baseline: "newly",
    blurb: "Static alerts are HTML. Dismiss needs pe-alert.",
    behavior: {
      element: "pe-alert",
      module: "src/behaviors/alert.js",
      required: true,
      adds: "Removes the alert on `command=\"--dismiss\"`. A static alert does not use the element.",
    },
    cost: {
      bootstrap: "Alert plugin",
      bootstrapJs: "5.0 KB gzip",
      native: "pe-alert. command=--dismiss and commandfor. Required to remove the node.",
      nativeJs: "0.5 KB gzip",
      polyfill: ["invoker"],
    },
    support: {
      noScript: "A static `.alert` needs no script. Without `alert.js` a dismissible alert stays.",
      polyfill:
        "[`command` / `commandfor`](/polyfills#invoker-commands) when that API is missing. `pe-alert` is still required to remove the node.",
      noFallback: "No native dismiss for an inline alert.",
    },
    removed: [
      {
        from: "`data-bs-dismiss=\"alert\"`",
        to: "`<pe-alert class=\"alert\">` with `command=\"--dismiss\"` and `commandfor` set to the alert id. Load `src/behaviors/alert.js`.",
      },
    ],
    avoid: [
      "`commandfor` is the alert id with no `#`.",
      "The close button has to sit inside the `<pe-alert>`; the `command` event does not bubble.",
    ],
    a11y: [
      "Keep `role=\"alert\"` on an important message so assistive technology announces it. A static informational banner can be a `div` without that role.",
      "The close button needs an accessible name (`aria-label=\"Close\"` on `.btn-close`). Removing the node is the dismiss; there is no `aria-hidden` step.",
    ],
  },
  {
    id: "buttons",
    route: "/components/buttons",
    name: "Buttons",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "Toggle buttons are checkbox or radio plus .btn-check. No button plugin.",
    behavior: null,
    cost: {
      bootstrap: "Button plugin. It toggles .active and aria-pressed on a button.",
      bootstrapJs: "1.4 KB gzip",
      native: "checkbox or radio with .btn-check and a label.btn",
      nativeJs: "0 KB",
    },
    support: {
      noScript:
        "`.btn-check` is CSS on a native checkbox or radio. Chrome, Firefox, and Safari have shipped it with Bootstrap’s stylesheet.",
      polyfill: "None",
      noFallback:
        "None. Without this stylesheet the control is still a checkbox or radio. The label just looks like a button when `.btn-check` is present.",
    },
    removed: [
      {
        from: '`data-bs-toggle="button"` and `aria-pressed` set from script',
        to: '`<input type="checkbox" class="btn-check">` or `type="radio"` with a `<label class="btn">`',
      },
    ],
    avoid: [
      "Do not add `data-bs-toggle=\"button\"`. State is the input’s `checked` attribute.",
      "Do not set `aria-pressed` on the label. The checkbox or radio is the accessible control.",
      "A lone `<button>` is a command, not a toggle. Use an input when the choice submits or persists.",
    ],
    a11y: [
      "The input stays in the tree. `.btn-check` visually hides it; the label is the hit target. Do not add `display: none` on the input.",
      "Group radios with the same `name`. A checkbox group can sit in a `<fieldset>` with a `<legend>`.",
      "Do not put `role=\"button\"` on the label. It is already a label for the input.",
    ],
  },
  {
    id: "collapse",
    route: "/components/collapse",
    name: "Collapse",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "Single panel; trigger and content must be parent/child.",
    behavior: null,
    cost: {
      bootstrap: "Collapse plugin",
      bootstrapJs: "5.6 KB gzip",
      native: "details and summary",
      nativeJs: "0 KB",
    },
    support: {
      noScript: "`details` / `summary`. Trigger and panel must be parent/child.",
      polyfill: "None",
      noFallback:
        "Same `interpolate-size` limit as the accordion. `.collapse-horizontal` animates to `max-content` and depends on it too. The panel opens and closes everywhere.",
    },
    removed: [
      {
        from: "`data-bs-toggle=\"collapse\"`",
        to: "`<details>` / `<summary>`. The trigger must wrap the panel.",
      },
    ],
    avoid: [
      "No `data-bs-target` or `href` pointing at a distant id. A remote toggle needs your own script.",
      "Do not put padding on `.collapse` itself; keep it on an inner wrapper such as `.card-body`.",
      "Do not put `hidden` or `hidden=\"until-found\"` on the panel inside `<details>`. Collapse is the disclosure; `hidden=\"until-found\"` is for custom regions.",
    ],
    a11y: [
      "`<summary>` is the control. The browser maps it to a disclosure, including Enter and Space. A hidden checkbox plus label is a checkbox, not a disclosure; that pattern is documented under Checkbox hack and is not used here.",
      "Closed panels stay in the document. Find in page can match them. Do not add `display: none` on the inner wrapper.",
    ],
  },
  {
    id: "modal",
    route: "/components/modal",
    name: "Modal",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "dialog with command/commandfor. Polyfill if command or closedby is missing.",
    behavior: null,
    cost: {
      bootstrap: "Modal plugin (backdrop, focus trap, scrollbar)",
      bootstrapJs: "7.3 KB gzip",
      native: "dialog with command and commandfor",
      nativeJs: "0 KB",
      polyfill: ["invoker", "closedby"],
    },
    support: {
      noScript: "`dialog`",
      polyfill:
        "[`command` / `commandfor`](/polyfills#invoker-commands) (Chrome 135+, Firefox 144+, Safari 26.2+). [`closedby`](/polyfills#closedby) is missing in Safari.",
      noFallback: "None",
    },
    removed: [
      {
        from: "`data-bs-toggle=\"modal\"` and `data-bs-target`",
        to: "`command=\"show-modal\"` and `commandfor` on a button. The dialog uses `closedby`.",
      },
      { from: "`data-bs-dismiss=\"modal\"`", to: "`command=\"close\"` and the same `commandfor`" },
      {
        from: "A confirm or prompt plugin, or click listeners on footer buttons",
        to: "`<form method=\"dialog\">` inside the dialog. Submit buttons set `dialog.returnValue` to their `value` and close without script.",
      },
      { from: "`data-bs-backdrop=\"static\"`", to: "`closedby=\"closerequest\"` on the `<dialog>`" },
    ],
    avoid: [
      "`command` works on `<button>`, not `<a href>`.",
      "No `.modal-backdrop` element. The `<dialog>` has `::backdrop`.",
      "Do not mix `command=\"close\"` with `<form method=\"dialog\">` on the same control. A submit button’s `value` is the returnValue.",
    ],
    a11y: [
      "`showModal()` (from `command=\"show-modal\"`) puts the dialog in the top layer, traps focus, and handles Escape. Name it with `aria-labelledby` pointing at `.modal-title`.",
      "`closedby=\"any\"` also closes on a backdrop click. `closedby=\"none\"` keeps Escape and backdrop from closing; provide a close button.",
      "`<form method=\"dialog\">` submit buttons close the dialog and set `returnValue`. Backdrop or Escape leaves that string empty.",
    ],
  },
  {
    id: "offcanvas",
    route: "/components/offcanvas",
    name: "Offcanvas",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "dialog placements. Polyfill if command or closedby is missing.",
    behavior: null,
    cost: {
      bootstrap: "Offcanvas plugin (same helpers as Modal)",
      bootstrapJs: "6.9 KB gzip",
      native: "dialog with offcanvas placement",
      nativeJs: "0 KB",
      polyfill: ["invoker", "closedby"],
    },
    support: {
      noScript: "`dialog` with `.offcanvas-start`, `-end`, `-top`, or `-bottom`.",
      polyfill:
        "The same [`command`](/polyfills#invoker-commands) and [`closedby`](/polyfills#closedby) polyfills as the modal.",
      noFallback: "None",
    },
    removed: [
      {
        from: "`data-bs-toggle=\"offcanvas\"`",
        to: "The same commands on `<dialog class=\"offcanvas\">`",
      },
      { from: "`data-bs-scroll=\"true\"`", to: "`popover=\"manual\"` instead of a modal `<dialog>`" },
    ],
    avoid: [
      "`command` works on `<button>`, not `<a href>`.",
      "A responsive `.offcanvas-{sm,md,lg,xl,xxl}` stays in the flow above its breakpoint; do not also toggle it there.",
    ],
    a11y: [
      "A modal `<dialog class=\"offcanvas\">` traps focus like a modal. Name it with `aria-labelledby` on the title.",
      "`popover=\"manual\"` is not modal: the page still scrolls and focus is not trapped. Give that panel a close control. `popover=\"auto\"` light-dismisses and still does not trap focus.",
    ],
  },
  {
    id: "navbar",
    route: "/components/navbar",
    name: "Navbar",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "details/summary, or a dialog offcanvas. Polyfill on the dialog toggler.",
    behavior: null,
    cost: {
      bootstrap: "Collapse plugin. Navbar is that plugin plus the navbar CSS.",
      bootstrapJs: "5.6 KB gzip",
      native: "details and summary, or dialog for the offcanvas navbar",
      nativeJs: "0 KB",
      polyfill: ["invoker", "closedby"],
    },
    support: {
      noScript:
        "The same `details` menu. `.navbar-expand-*` shows it from that breakpoint. The offcanvas variant is a `dialog`.",
      polyfill:
        "The offcanvas toggler uses the same [`command` polyfill](/polyfills#invoker-commands) as the modal.",
      noFallback:
        "The hamburger cannot sit outside the `<details>`. Use the offcanvas navbar for that.",
    },
    removed: [
      {
        from: "`data-bs-toggle=\"collapse\"` on `.navbar-toggler`",
        to: "`<summary class=\"navbar-toggler\">` inside `<details class=\"navbar-collapse\">`",
      },
    ],
    avoid: [
      "The brand stays outside the `<details>`, not inside the collapsing panel.",
      "`.navbar-toggler` has to be the `<summary>`.",
      "Do not put `role=\"search\"` on the form inside `<search>`. The element is already that landmark.",
    ],
    a11y: [
      "The hamburger is a `<summary>`. The browser exposes expanded and collapsed on that disclosure; do not add `aria-expanded` there.",
      "Dropdowns in the bar are the same popover menus as elsewhere. Invoker Commands keep `aria-expanded` in sync on the toggle.",
      "The offcanvas navbar is a modal `<dialog>`. Name it with `aria-labelledby`.",
      "Wrap the search form in `<search>`. Name the input with `aria-label` or a visible label.",
    ],
  },
  {
    id: "dropdown",
    route: "/components/dropdown",
    name: "Dropdown",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "Popover API menus. Polyfill if command is missing.",
    behavior: {
      element: "pe-focus-group",
      module: "src/behaviors/focus-group.js",
      required: false,
      adds: "Arrow, Home, and End keys across `.dropdown-item`. Tab works without it.",
    },
    cost: {
      bootstrap: "Dropdown plugin, including Popper",
      bootstrapJs: "13.7 KB gzip",
      native: 'popover="auto" and CSS Anchor Positioning. No Popper.',
      nativeJs: "0 KB",
      polyfill: ["invoker"],
    },
    support: {
      noScript: "`popover=\"auto\"`: Chrome 114+, Firefox 125+, Safari 17+.",
      polyfill:
        "[`command`](/polyfills#invoker-commands) on the toggle, the same polyfill as the modal.",
      noFallback:
        "CSS Anchor Positioning: Chrome 125+, Safari 26+, Firefox 147+. Without it the menu is not attached to the button. There is no Popper fallback.",
    },
    removed: [
      {
        from: "`data-bs-toggle=\"dropdown\"`",
        to: "`command=\"toggle-popover\"` and `popover=\"auto\"` on `.dropdown-menu`",
      },
      { from: "`data-bs-offset` and `data-bs-reference`", to: "`anchor()` and `position-try-fallbacks` in CSS" },
      {
        from: "Submenus (Bootstrap 5 dropped them; Popper could not keep the parent open)",
        to: "`.dropdown-submenu` with a nested `popover=\"auto\"` inside the parent menu",
      },
    ],
    avoid: [
      "`command` works on `<button>`, not `<a href>`.",
      "Sibling `popover=\"auto\"` menus replace each other. Nest the submenu popover (or its invoker) inside the parent popover, or the parent closes.",
      "These are generic overlays, not ARIA `role=\"menu\"` widgets. Add that ARIA yourself if you need an application menu.",
    ],
    a11y: [
      "Bootstrap’s dropdowns are generic overlays, not ARIA `role=\"menu\"` widgets. The same applies here: add more specific ARIA yourself if you need an application menu.",
      "Native popovers close with Escape and move to the top layer. Invoker Commands keep `aria-expanded` in sync on the toggle. They do not move through `.dropdown-item` with arrow keys. Tab through items, or wrap the dropdown in optional `<pe-focus-group>`.",
      "A `.dropdown-submenu` toggle is a button with `.dropdown-item`. Nested `popover=\"auto\"` keeps the ancestor open; Escape closes the topmost menu first.",
    ],
  },
  {
    id: "popover",
    route: "/components/popover",
    name: "Popover",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "Titled bubbles, four directions. Polyfill if command is missing.",
    behavior: null,
    cost: {
      bootstrap: "Popover plugin, which includes Tooltip and Popper",
      bootstrapJs: "15.5 KB gzip",
      native: "Popover API and CSS Anchor Positioning. No Popper.",
      nativeJs: "0 KB",
      polyfill: ["invoker"],
    },
    support: {
      noScript: "`popover=\"auto\"`: Chrome 114+, Firefox 125+, Safari 17+.",
      polyfill:
        "[`command`](/polyfills#invoker-commands) on the trigger, the same polyfill as the modal.",
      noFallback:
        "CSS Anchor Positioning: Chrome 125+, Safari 26+, Firefox 147+. Without it the bubble is not attached to the trigger. `.bs-popover-auto` does not reorient; it matches `.bs-popover-end`.",
    },
    removed: [
      {
        from: "`data-bs-toggle=\"popover\"`",
        to: "`popover=\"auto\"` on the bubble, opened with `command=\"toggle-popover\"`",
      },
      {
        from: "`data-bs-content` and `data-bs-placement`",
        to: "Real markup inside `.popover-body`, and `.bs-popover-top` / `-end` / `-bottom` / `-start`",
      },
    ],
    avoid: [
      "`command` works on `<button>`, not `<a href>`.",
      "No `data-bs-html=\"true\"`. The bubble is markup already.",
    ],
    a11y: [
      "The bubble is a popover, not a dialog. Escape and a click outside close it. Invoker Commands keep `aria-expanded` in sync on the trigger.",
      "Put real heading text in `.popover-header`. Do not rely on `data-bs-title`.",
    ],
  },
  {
    id: "tooltip",
    route: "/components/tooltip",
    name: "Tooltip",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb:
      "Hover/focus tips. aria-description is the no-script fallback. popover=hint plus interestfor is experimental.",
    behavior: null,
    cost: {
      bootstrap: "Tooltip plugin, including Popper",
      bootstrapJs: "15.3 KB gzip",
      native: "aria-description and CSS generated content, or popover=hint. No Popper.",
      nativeJs: "0 KB",
      polyfill: ["interestfor"],
    },
    support: {
      noScript:
        "`aria-description` and `content: attr()`. Hover and focus. Plain text, not in the top layer.",
      polyfill:
        "[`interestfor`](/polyfills#interestfor) when `interestForElement` is missing and the page has `[interestfor]`. It does not polyfill `popover=\"hint\"`.",
      noFallback:
        "`popover=\"hint\"` is Chrome 151+, Firefox 153+, Safari preview. Without hint the polyfill cannot open the top-layer bubble. `.bs-tooltip-auto` on a hint popover flips with `position-try-fallbacks`. The arrow stays in the default (top) orientation after a flip.",
    },
    removed: [
      {
        from: "`title` / `data-bs-title`",
        to: "`aria-description` plus `.bs-tooltip-top` (or end, bottom, start), or a `.tooltip` with `popover=\"hint\"`",
      },
      {
        from: "`data-bs-html`",
        to: "Real markup in `.tooltip-inner` on a hint popover",
      },
      {
        from: "`data-bs-delay`",
    to: "`interest-delay-start` / `interest-delay-end` and `--interest-delay-start` / `--interest-delay-end` (or `--bs-tooltip-delay-start` / `--bs-tooltip-delay-end`) on the trigger",
      },
    ],
    avoid: [
      "Do not set `role=\"tooltip\"` or `aria-describedby` on an `interestfor` trigger. Native interestfor associates the target; the polyfill sets `aria-describedby` (plain hint) or `aria-details` (rich).",
      "`interestfor` is valid on `<a>`, `<button>`, and `<area>` only.",
      "Do not put `aria-description` and `interestfor` on the same control (Chromium would announce both).",
      "The CSS fallback is plain text. Markup needs a hint popover.",
    ],
    a11y: [
      "`aria-description` is a description, not the accessible name. Give icon-only controls a name (`aria-label` or visible text) and use the description for extra help.",
      "The CSS fallback bubble is generated content with empty alternative text, so assistive technology is not read a second copy. Hover and `:focus-within` show it. It is not in the top layer.",
      "Native `interestfor` gives a hint popover an implicit tooltip role. The polyfill sets `aria-describedby` on a plain hint. Escape dismisses interest. The pointer can move onto the bubble (WCAG 1.4.13). Do not add `role=\"tooltip\"` yourself on the native path.",
    ],
  },
  {
    id: "scrollspy",
    route: "/components/scrollspy",
    name: "Scrollspy",
    nav: "components",
    status: "native",
    baseline: "experimental",
    blurb: "scroll-target-group and :target-current. Polyfill when that CSS is missing.",
    behavior: null,
    cost: {
      bootstrap: "Scrollspy plugin",
      bootstrapJs: "5.7 KB gzip",
      native: "scroll-target-group and :target-current",
      nativeJs: "0 KB",
      polyfill: ["scrollspy"],
    },
    support: {
      noScript: "`scroll-target-group`: Chrome 140+.",
      polyfill:
        "[IntersectionObserver](/polyfills#scroll-target-group) when the CSS is missing. It does not set `aria-current`.",
      noFallback:
        "Marked experimental on the component page. The polyfill covers browsers without the CSS.",
    },
    removed: [
      {
        from: "`data-bs-spy=\"scroll\"` and `data-bs-target`",
        to: "`data-polyfill-scrollspy` on the link group, which applies `scroll-target-group: auto`. `:target-current` marks the current link.",
      },
    ],
    avoid: [
      "Links in a closed `[popover]` menu are not scroll markers. Keep a `.scroll-marker-alias` copy next to the toggle.",
      "The polyfill does not set `aria-current`. Add it yourself if you need it announced.",
    ],
    a11y: [
      "`:target-current` is visual only. Assistive technology still needs `aria-current=\"true\"` on the in-view link, which requires script. This demo does not set it. The links remain ordinary in-page links.",
    ],
  },
  {
    id: "tabs",
    route: "/components/tabs",
    name: "Tabs",
    nav: "components",
    status: "script",
    baseline: "newly",
    blurb: "pe-tabs is required. Panes do not switch without it.",
    behavior: {
      element: "pe-tabs",
      module: "src/behaviors/tabs.js",
      required: true,
      adds: "Keeps the selection, the roving `tabindex`, and the `.active` / `.show` panes in sync.",
    },
    cost: {
      bootstrap: "Tab plugin",
      bootstrapJs: "5.8 KB gzip",
      native: "pe-tabs. role=tab and aria-controls. Required behavior.",
      nativeJs: "1.3 KB gzip",
    },
    support: {
      noScript: "The `.active` pane stays visible. Other tabs do not switch.",
      polyfill: "None. `pe-tabs` is required to switch panes. It is not a polyfill.",
      noFallback: "No native tab control yet. Dropdowns inside a tab list are not supported.",
    },
    removed: [
      {
        from: "`data-bs-toggle=\"tab\"` and `data-bs-target`",
        to: "`<pe-tabs>` with `role=\"tab\"` and `aria-controls`. Load `src/behaviors/tabs.js`.",
      },
    ],
    avoid: [
      "Do not wrap the tabs in `<pe-focus-group>`. `<pe-tabs>` already owns the arrow keys.",
      "A `.nav-tabs` list of page links is a different thing and needs no tab roles.",
    ],
    a11y: [
      "This follows the WAI-ARIA tabs pattern: `role=\"tablist\"`, `role=\"tab\"`, `role=\"tabpanel\"`, `aria-controls`, and `aria-selected`. The selected tab is `tabindex=\"0\"`; the others are `-1`.",
      "Left and Right move in a horizontal list. `aria-orientation=\"vertical\"` uses Up and Down. Home and End jump to the ends. Choosing a tab also selects it.",
    ],
  },
  {
    id: "toasts",
    route: "/components/toasts",
    name: "Toasts",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "popover=manual. Optional pe-toast adds data-delay and stacking.",
    behavior: {
      element: "pe-toast",
      module: "src/behaviors/toast.js",
      required: false,
      adds: "`data-delay` autohide and corner stacking. Show and close work without it.",
    },
    cost: {
      bootstrap: "Toast plugin",
      bootstrapJs: "5.4 KB gzip",
      native: "popover=manual. Optional pe-toast for data-delay and stacking.",
      nativeJs: "0 KB. Optional behavior for autohide.",
    },
    support: {
      noScript: "`popover=\"manual\"` with `command` to show and close. No light-dismiss.",
      polyfill: "None for show and close. Optional `pe-toast` for `data-delay` and stacking.",
      noFallback: "Without `pe-toast`, open toasts share one corner.",
    },
    removed: [
      {
        from: "`data-bs-autohide` and `data-bs-delay`",
        to: "`data-delay` on `<pe-toast>`. Load `src/behaviors/toast.js`.",
      },
      { from: "`data-bs-dismiss=\"toast\"`", to: "`command=\"hide-popover\"` and `commandfor`" },
    ],
    avoid: [
      "`popover=\"manual\"` has no light-dismiss. Give every toast a close control.",
      "The toast does not take focus. Use `role=\"status\"` or `role=\"alert\"` so it is announced.",
    ],
    a11y: [
      "Use `role=\"status\"` with `aria-live=\"polite\"` and `aria-atomic=\"true\"` for an ordinary message. Use `role=\"alert\"` with `aria-live=\"assertive\"` for an important one. The toast does not take focus.",
      "`popover=\"manual\"` does not light-dismiss. Hover and focus pause optional `data-delay` autohide so a reader can finish the message.",
    ],
  },
  {
    id: "carousel",
    route: "/components/carousel",
    name: "Carousel",
    nav: "components",
    status: "native",
    baseline: "experimental",
    blurb: "CSS scroll snap and swipe. Buttons outside Chrome are an optional module.",
    behavior: {
      element: "pe-carousel",
      module: "src/behaviors/carousel.js",
      required: false,
      adds: "Prev, next, and pip controls where `::scroll-button` is missing. Inert where it is not.",
    },
    cost: {
      bootstrap: "Carousel plugin (slide, swipe, indicators, keyboard)",
      bootstrapJs: "6.7 KB gzip",
      native: "CSS scroll snap. Optional pe-carousel when ::scroll-button is missing.",
      nativeJs: "0 KB. Optional behavior is 1.4 KB gzip.",
      polyfill: ["invoker"],
    },
    support: {
      noScript: "`scroll-snap-type` is widely available. Swipe works.",
      polyfill: "None",
      noFallback:
        "`::scroll-button` and `::scroll-marker`: Chrome 135+ only. Optional `pe-carousel` covers buttons and pips elsewhere. No autoplay, fade, or wrap.",
    },
    removed: [
      {
        from: "`data-bs-ride` and `data-bs-slide`",
        to: "`::scroll-button()` and `::scroll-marker` in Chromium, or `command=\"--prev\"` / `--next` / `--slide` on `<pe-carousel>`",
      },
      { from: "`.carousel-control-prev-icon` markup", to: "`content` on `::scroll-button()`" },
    ],
    avoid: [
      "No autoplay, no `.carousel-fade` crossfade, and no wrap from the last slide to the first.",
      "`commandfor` is the `.carousel-inner` id with no `#`.",
    ],
    a11y: [
      "Put `data-label` on each `.carousel-item` so `::scroll-marker` has an accessible name. Native scroll buttons use `content: \"\" / \"Previous\"` and `\"Next\"`.",
      "On `<pe-carousel>`, the current pip is `aria-current=\"true\"`. Previous and next disable at the ends. `scroll-behavior: smooth` follows `prefers-reduced-motion`.",
    ],
  },
  {
    id: "progress",
    route: "/components/progress",
    name: "Progress",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "Native progress and meter. Omit value for the indeterminate stripe.",
    behavior: null,
    cost: {
      bootstrap: "No Progress plugin. Markup is div.progress > .progress-bar with ARIA.",
      bootstrapJs: "Not in bootstrap.min.js",
      native: "progress and meter",
      nativeJs: "0 KB",
    },
    support: {
      noScript:
        "`<progress>` is Baseline Widely available (2015). `<meter>` is too (2017). The fill follows `value` / `max` with no script.",
      polyfill: "None",
      noFallback:
        "Without this CSS the native control still works. Token colors, radius, and the striped animation need `appearance: none` and the vendor bar pseudos.",
    },
    removed: [
      {
        from: '`<div class="progress"><div class="progress-bar" style="width: 25%">`',
        to: '`<progress class="progress" value="25" max="100">25%</progress>`',
      },
      {
        from: '`role="progressbar"` and `aria-valuenow` / `min` / `max`',
        to: "The `value` and `max` attributes. Do not add a role.",
      },
      {
        from: "`.progress-bar.bg-success`",
        to: "`.text-success` on the `<progress>`. The fill is `currentcolor`.",
      },
    ],
    avoid: [
      "No inner `.progress-bar` and no `style=\"width: …%\"`. `value` and `max` are the fill.",
      "Stacked bars are several values in one track. A `<progress>` has one value.",
    ],
    a11y: [
      "Label with `<label for>` or wrap the control. Text between the tags is a fallback for old browsers, not the accessible name.",
      "Omit `value` only when the duration is unknown. Assistive technology then announces busy, not a percent. Do not add `role=\"progressbar\"`.",
    ],
  },
  {
    id: "spinner",
    route: "/components/spinner",
    name: "Spinner",
    nav: "components",
    status: "native",
    baseline: "newly",
    blurb: "aria-busy paints a spinner on the host. No extra spinner element.",
    behavior: null,
    cost: {
      bootstrap: "No Spinner plugin. Markup is .spinner-border plus visually-hidden text.",
      bootstrapJs: "Not in bootstrap.min.js",
      native: "`aria-busy=\"true\"` on the host. CSS paints the disc.",
      nativeJs: "0 KB",
    },
    support: {
      noScript:
        "`aria-busy` is a global ARIA state. The disc is CSS on `[aria-busy=\"true\"]`. Removing the attribute hides it.",
      polyfill: "None",
      noFallback:
        "Without this CSS the attribute still tells assistive technology. There is no disc. `.spinner-border` stays in the sheet as a standalone glyph.",
    },
    removed: [
      {
        from: '`<span class="spinner-border" role="status"><span class="visually-hidden">Loading…</span></span>`',
        to: '`aria-busy="true"` on the host that is loading',
      },
      {
        from: "A `.spinner-border` child inside a `disabled` button",
        to: '`aria-busy="true"` and `disabled` on the button. The name stays.',
      },
    ],
    avoid: [
      "Do not put a `.spinner-border` child inside a host that already has `aria-busy`. The disc is a pseudo-element.",
      "A known percent is a `<progress>`, not a spinner. See Progress.",
      "Do not set `aria-busy` on `body` for one widget. Put it on the host that is changing.",
    ],
    a11y: [
      "The attribute is the state. The disc is decorative (`::before` / `::after`). Do not add `role=\"status\"` on a spinner element.",
      "A nameless host needs a role that can take a name (`role=\"status\"`) and `aria-label` (or a more specific name) while it is busy. A generic `<div>` with only `aria-label` is ignored.",
      "A button keeps its accessible name. `disabled` blocks a second submit.",
      "On a live region, `aria-busy=\"true\"` tells assistive technology to wait until you set it to `false` (or remove it) before announcing the update.",
      "`prefers-reduced-motion` slows the turn. It does not freeze the disc, so the busy state stays visible.",
    ],
  },
  {
    id: "validation",
    route: "/forms/validation",
    name: "Validation",
    nav: "forms",
    status: "native",
    baseline: "newly",
    blurb: ":user-valid / :user-invalid after type, blur, or submit. No wrapper class.",
    behavior: null,
    cost: {
      bootstrap:
        "No validation plugin. The Bootstrap docs add .was-validated from a submit listener.",
      bootstrapJs: "Not in bootstrap.min.js",
      native: ":user-valid and :user-invalid",
      nativeJs: "0 KB",
    },
    support: {
      noScript: "`:user-valid` / `:user-invalid`: Chrome 119+, Firefox 88+, Safari 16.5+.",
      polyfill: "None",
      noFallback: "None",
    },
    removed: [
      { from: "`.was-validated`", to: "`:user-valid` / `:user-invalid`. No wrapper class." },
      {
        from: "The submit listener that adds it",
        to: "Nothing. The browser decides when the user has interacted.",
      },
    ],
    avoid: [
      "No `.was-validated` wrapper and no `novalidate` plus a hand-rolled check.",
      "`.is-valid` / `.is-invalid` stay, but only for state the server decided.",
      "Do not expect a non-required `.form-check-input` to turn green after a click. `:user-valid` success on checks is for `required` only.",
    ],
    a11y: [
      "Native constraints (`required`, `type`, `pattern`) are exposed by the control. Associate `.invalid-feedback` with the field through `aria-describedby`. Put that feedback after the control so `:user-invalid` can show it.",
      "Do not add `novalidate` unless you replace the browser’s submit check with your own. Empty required fields stay unstyled until the user interacts or submits.",
    ],
  },
  {
    id: "field-sizing",
    route: "/forms/field-sizing",
    name: "Field sizing",
    nav: "forms",
    status: "native",
    baseline: "newly",
    blurb: "Opt-in field-sizing: content. The control grows to its value.",
    behavior: null,
    cost: {
      bootstrap: "No equivalent. Autosize is a third-party script.",
      bootstrapJs: "Not in bootstrap.min.js",
      native: "`field-sizing: content` on `.field-sizing`",
      nativeJs: "0 KB",
    },
    support: {
      noScript:
        "`field-sizing: content`: Chrome 123+, Firefox 152+, Safari 26.2+.",
      polyfill: "None",
      noFallback:
        "None. Without `field-sizing` the control keeps Bootstrap’s fixed box.",
    },
    removed: [
      {
        from: "Autosize scripts that grow a textarea on `input`",
        to: "`.field-sizing` on `.form-control` or `.form-select`",
      },
    ],
    avoid: [
      "`.form-control` / `.form-select` alone stay `width: 100%`. Add `.field-sizing`.",
      "An explicit `width` or `height` overrides `field-sizing`. Do not set those on the same control.",
    ],
    a11y: [
      "Label with `<label for>` or wrap the control. Do not use `placeholder` as the only name.",
      "`max-inline-size` / `max-block-size` cap growth so the page does not jump without bound. The size change itself is not announced; do not rely on it as the only status.",
    ],
  },
  {
    id: "datalist",
    route: "/forms/datalist",
    name: "Datalist",
    nav: "forms",
    status: "native",
    baseline: "newly",
    blurb: "Native typeahead with input list and datalist. No dropdown script.",
    behavior: null,
    cost: {
      bootstrap: "No equivalent. Typeahead is a third-party script or a dropdown.",
      bootstrapJs: "Not in bootstrap.min.js",
      native: "`<input list>` and `<datalist>`",
      nativeJs: "0 KB",
    },
    support: {
      noScript:
        "`<datalist>`: Chrome 20+, Firefox 4+, Safari 12.1+. Firefox on Android does not show the suggestion menu.",
      polyfill: "None",
      noFallback:
        "None. Without a suggestion menu the input still accepts a typed value.",
    },
    removed: [
      {
        from: "A dropdown or typeahead plugin wired to an input",
        to: "`list` on the input pointing at a `<datalist>` id",
      },
    ],
    avoid: [
      "`list` is the datalist id with no `#`. The datalist is not a `.dropdown-menu`.",
      "Do not put `role=\"listbox\"` on the datalist. The browser exposes the suggestions.",
    ],
    a11y: [
      "Label with `<label for>` or wrap the control. Do not use `placeholder` as the only name.",
      "A datalist is a suggestion list, not a required choice. The user can submit a value that is not in the options.",
    ],
  },
  {
    id: "output",
    route: "/forms/output",
    name: "Output",
    nav: "forms",
    status: "native",
    baseline: "newly",
    blurb: "Native output for a calculated result. Optional count.js for checked boxes.",
    behavior: null,
    cost: {
      bootstrap: "No equivalent. A badge or span updated from a change listener.",
      bootstrapJs: "Not in bootstrap.min.js",
      native: "`<output>`. Optional `src/behaviors/count.js` for `data-controls`",
      nativeJs: "0 KB. Optional src/behaviors/count.js",
    },
    support: {
      noScript:
        "`<output>` is Baseline Widely available. Without `count.js` the text stays at whatever was in the markup.",
      polyfill: "None",
      noFallback:
        "A closed popover is `display: none`, so a CSS counter inside that menu stays 0. `count.js` is the exception for that case. Visible checkboxes can use `:has()` and `counter()` without it.",
    },
    removed: [
      {
        from: "A span or badge rewritten from a change listener you wrote",
        to: '`<output data-controls>` with the container id, no hash, and `src/behaviors/count.js`',
      },
    ],
    avoid: [
      "Do not add a `pe-count` or `pe-checked` element. The output is already a status live region.",
      "`data-controls` is a container id, with no `#` and no CSS selector. `:checked` does not belong in the attribute.",
      "Do not watch the `checked` attribute with a MutationObserver. Listen to `change`.",
      "Do not lift `.form-check-input` out of a closed popover to feed a CSS counter. Closed popovers are not in the tab order.",
      "Do not put the output inside a toggle button. The count would be announced twice.",
    ],
    a11y: [
      "`<output>` is a status live region. Keep it beside the control, not inside a button name.",
      "`for` lists the contributing control ids. `data-controls` is the live group `count.js` queries.",
      "On a dropdown toggle, `aria-describedby` points at the output so the button name stays the action.",
    ],
  },
  {
    id: "customizable-select",
    route: "/forms/customizable-select",
    name: "Customizable select",
    nav: "forms",
    status: "native",
    baseline: "experimental",
    blurb: "appearance: base-select on .form-select. Picker, icon, and checkmark take Bootstrap tokens.",
    behavior: null,
    cost: {
      bootstrap: "No equivalent. A dropdown or a third-party select plugin.",
      bootstrapJs: "Not in bootstrap.min.js",
      native: "`appearance: base-select` on `.form-select`",
      nativeJs: "0 KB",
    },
    support: {
      noScript:
        "`appearance: base-select`: Chrome 135+, Safari 27+. Firefox 149 behind `dom.select.customizable_select.enabled` and `layout.css.appearance-base.enabled`.",
      polyfill: "None",
      noFallback:
        "Marked experimental on the forms page. Without `base-select` the closed `.form-select` and the OS picker stay. Rich markup inside `<option>` is stripped to text. `<button>` / `<selectedcontent>` inside the select are ignored.",
    },
    removed: [
      {
        from: "A dropdown or Choices/Select2 widget used as a select",
        to: "`<select class=\"form-select\">`. `::picker(select)` is the menu.",
      },
    ],
    avoid: [
      "Do not rebuild a select with `.dropdown-menu`. That is a menu, not a form control.",
      "`<select multiple>` and `size` other than `1` stay on the OS listbox. This CSS does not opt those in.",
      "Do not put links or buttons inside `<option>`. The select’s button is inert.",
    ],
    a11y: [
      "Label with `<label for>` or wrap the control. Keep a `name` so the value submits.",
      "Decorative icons inside options take `aria-hidden=\"true\"`. If the mirrored rich content would read badly, set `aria-label` on the option.",
      "`::picker-icon` and `::checkmark` are not in the accessibility tree. Do not put the only meaning of the control in generated content.",
      "The checked option uses background and font-weight, not color alone. Arrow keys still move in one dimension even if the picker is laid out as a grid.",
    ],
  },
  {
    id: "composed",
    route: "/components/composed",
    name: "Composed examples",
    nav: "recipes",
    status: "native",
    baseline: "experimental",
    blurb: "Mixed examples that compose existing primitives. No new pe-* element.",
    behavior: null,
    cost: {
      bootstrap: "Not one plugin. These are recipes on Dropdown, Offcanvas, Toast, Tabs, Progress, Buttons, and Output.",
      bootstrapJs: "Varies by recipe",
      native: "Popover, dialog, details, progress, form checks, search, and btn-check. Optional pe-toast and pe-tabs as on those pages.",
      nativeJs: "0 KB. Optional pe-toast, pe-tabs, and src/behaviors/count.js for output[data-controls].",
    },
    support: {
      noScript:
        "Drawer, context menu, and the progress ring work without a component script. The multi-select menu opens without script. `<output data-controls>` needs `src/behaviors/count.js` to stay in sync, and a closed popover cannot increment a CSS counter. `command` still uses the invoker polyfill when missing.",
      polyfill: "The same [`command`](/polyfills#invoker-commands) polyfill as dropdown and offcanvas.",
      noFallback:
        "Context-menu `position-area` and the tab underline need CSS Anchor Positioning. The shrinking header and scroll bar need `animation-timeline: scroll()` (not in Firefox). The ring’s `attr()` into `--bs-progress-value` is Chrome 133+; set the custom property in markup elsewhere. No scroll-listener and no pointer-coordinate script. `src/behaviors/count.js` is the one optional script on this page that is not a `pe-*` behavior.",
    },
    removed: [
      {
        from: "A context-menu plugin that measures `clientX` / `clientY`",
        to: "`popover=\"auto\"` with `.dropdown-menu-context` and `position-area` on `.context-host`",
      },
      {
        from: "A JS drawer that scroll-snaps nested panels",
        to: "`<dialog class=\"offcanvas\">` with nested `<details>` in `.nav-tree`",
      },
      {
        from: "`<select multiple>` restyled as a dropdown",
        to: "`.dropdown-multiselect` with `.form-check-input` in the menu",
      },
    ],
    avoid: [
      "Do not add a `pe-*` element to place the menu at the pointer. There is no CSS path from last-pointer coordinates, and this package does not measure for layout.",
      "Do not put `role=\"menu\"` on these items unless you also implement that keyboard contract. They are buttons and links in a popover.",
      "Do not put `.header-shrink` or `.scroll-progress` on the docs or site chrome. They belong on a nested `.scroll-demo` (or your own scroller).",
      "Do not style every `details` in `.offcanvas-body`. Put the tree in `.nav-tree` so it can live in a drawer or on the page.",
      "Do not lift `.form-check-input` out of a closed `.dropdown-multiselect` popover to feed a CSS counter. Closed popovers are not in the tab order. Do not add a `pe-*` for the count: use `<output data-controls>` with the container id, no hash, and load `src/behaviors/count.js`.",
      "Do not add `.progress` on a `.progress-ring`. The linear class is a full-width bar.",
      "The command palette list is static. Do not filter it with script. `datalist` is the typeahead.",
      "Do not set `aria-pressed` on a price-toggle label. The radio is the control; `:has(:checked)` switches the price.",
    ],
    a11y: [
      "Context-menu items are buttons (or links), not `role=\"menuitem\"`. Escape and light-dismiss come from `popover=\"auto\"`. Right-click (and the `contextmenu` key) is the surface gesture. A visible Actions button is a separate left-click invoker; the menu must tether to that button, not the whole host.",
      "Nested `details` in `.nav-tree` are disclosures. Do not add `aria-expanded` on the summary. A catalog of links can sit in a `<nav>`.",
      "The toast countdown bar is decorative. `role=\"status\"` or `role=\"alert\"` on the toast is still the announcement. Hover and focus pause `data-delay` so the message can be read.",
      "The tab underline follows `aria-selected`. It is not a substitute for those roles.",
      "Label a `.progress-ring` with `<label for>` or `aria-label`. Center text is optional decoration.",
      "A purely visual `.scroll-progress` takes `aria-hidden=\"true\"`.",
      "The checked count is an `<output data-controls>` status live region, not a `pe-*` element. Keep it out of the toggle button so the count is not announced twice. On a dropdown, `aria-describedby` on the button points at that output. Keep menu checkboxes in the closed popover so they are not tab stops. The contract lives on Output.",
      "A lightbox image needs an `alt` that names the photo. The dialog title can repeat it.",
      "Confirm-then-toast: the dialog submit is the decision; the toast is the status. Do not announce the toast if the user cancelled.",
      "An interest preview is not a live region. `aria-description` on the trigger is the no-script name. The hint popover is extra, not a second announcement.",
    ],
  },
];

/** A–Z by name within a sidebar group (`components`, `recipes`, `forms`). */
export function listed(group) {
  return components
    .filter((item) => item.nav === group)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export const componentById = Object.fromEntries(components.map((item) => [item.id, item]));

/** Shape JsCost.astro expects, keyed by component id. */
export const costs = Object.fromEntries(components.map((item) => [item.id, item.cost]));

/** Migration rows that belong to no single component. */
export const sharedMigration = [
  {
    from: "`.show`",
    to: "`:open` on a `dialog`, `:popover-open` on a popover, `[open]` on `<details>`",
  },
  {
    from: "`bootstrap.bundle.min.js`",
    to: "Nothing for these components. `src/polyfills/index.js` loads a fallback only when an API is missing.",
  },
];
