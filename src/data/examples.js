/**
 * One canonical markup example per component, keyed by the inventory id in
 * ./components.js. The component page renders it as one of its examples, and
 * components.json ships it as `example`, so an agent copies the same markup a
 * reader sees. Pick the markup that works in every browser the docs support.
 *
 * Script URLs point at the installed package, like the docs code samples.
 */

export const behaviorScript = (name) =>
  `<script type="module" src="./node_modules/bootstrap-html/src/behaviors/${name}.js"></script>

`;

export const navbarLinks = `<ul class="navbar-nav me-auto mb-2 mb-lg-0">
      <li class="nav-item">
        <a class="nav-link active" aria-current="page" href="#">Home</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Link</a>
      </li>
      <li class="nav-item dropdown">
        <button class="nav-link dropdown-toggle" type="button" command="toggle-popover" commandfor="navbarDropdown">
          Dropdown
        </button>
        <ul class="dropdown-menu" popover="auto" id="navbarDropdown">
          <li><a class="dropdown-item" href="#">Action</a></li>
          <li><a class="dropdown-item" href="#">Another action</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#">Something else here</a></li>
        </ul>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" aria-disabled="true">Disabled</a>
      </li>
    </ul>
    <search>
      <form class="d-flex">
        <input class="form-control me-2" type="search" name="q" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </search>`;

export const dropdownMenuLinks = `    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
    <li><a class="dropdown-item" href="#">Something else here</a></li>`;

export const scrollspyCopy = `This is some placeholder content for the scrollspy page. As the area scrolls, the matching navigation link is highlighted. The same paragraph is repeated so the scroller is long enough to move the highlight from heading to heading.`;

export const carouselSlide = (label, bg) =>
  `<div class="d-flex w-100 align-items-center justify-content-center ${bg}" style="min-height: 16rem">${label}</div>`;

export const carouselSlides = (prefix) =>
  `<div class="carousel-item" data-label="Slide 1">
    ${carouselSlide(`${prefix} first slide`, "bg-secondary text-white")}
  </div>
  <div class="carousel-item" data-label="Slide 2">
    ${carouselSlide(`${prefix} second slide`, "bg-dark text-white")}
  </div>
  <div class="carousel-item" data-label="Slide 3">
    ${carouselSlide(`${prefix} third slide`, "bg-secondary text-white")}
  </div>`;

export const examples = {
  accordion: `<div class="accordion">
  <details class="accordion-item" name="accordionExample" open>
    <summary class="accordion-button">Accordion Item #1</summary>
    <div class="accordion-body">
      <strong>This is the first item’s accordion body.</strong> It is shown by default. You can modify any of this with custom CSS or overriding our default variables. It’s also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
    </div>
  </details>
  <details class="accordion-item" name="accordionExample">
    <summary class="accordion-button">Accordion Item #2</summary>
    <div class="accordion-body">
      <strong>This is the second item’s accordion body.</strong> It is hidden by default. Find in page can still match this panel: the token is <strong>quetzalcoatlus</strong>.
    </div>
  </details>
  <details class="accordion-item" name="accordionExample">
    <summary class="accordion-button">Accordion Item #3</summary>
    <div class="accordion-body">
      <strong>This is the third item’s accordion body.</strong> It is hidden by default. You can modify any of this with custom CSS or overriding our default variables. It’s also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
    </div>
  </details>
</div>`,
  alerts: `<script type="module" src="./node_modules/bootstrap-html/src/behaviors/alert.js"></script>

<pe-alert class="alert alert-warning alert-dismissible fade show" id="dismiss-alert" role="alert">
  <div><strong>Holy guacamole!</strong> You should check in on some of those fields below.</div>
  <button type="button" class="btn-close" command="--dismiss" commandfor="dismiss-alert" aria-label="Close"></button>
</pe-alert>`,
  buttons: `<fieldset>
  <legend class="visually-hidden">Notifications</legend>
  <input type="checkbox" class="btn-check" id="buttons-email" autocomplete="off" checked>
  <label class="btn btn-outline-primary" for="buttons-email">Email</label>
  <input type="checkbox" class="btn-check" id="buttons-sms" autocomplete="off">
  <label class="btn btn-outline-primary" for="buttons-sms">SMS</label>
</fieldset>`,
  collapse: `<details class="collapse">
  <summary class="btn btn-primary mb-2">Toggle collapse</summary>
  <div class="card card-body">
    Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger. Find in page can still match it: the token is <strong>archaeopteryx</strong>.
  </div>
</details>`,
  modal: `<button type="button" class="btn btn-primary" command="show-modal" commandfor="exampleModal">
  Launch demo modal
</button>

<dialog class="modal" closedby="any" id="exampleModal" aria-labelledby="exampleModalLabel">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
        <button type="button" class="btn-close" command="close" commandfor="exampleModal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Woohoo, you’re reading this text in a modal!
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" command="close" commandfor="exampleModal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</dialog>`,
  offcanvas: `<button type="button" class="btn btn-primary" command="show-modal" commandfor="offcanvasExample">
  Toggle offcanvas
</button>

<dialog class="offcanvas offcanvas-start" id="offcanvasExample" closedby="any" aria-labelledby="offcanvasExampleLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
    <button type="button" class="btn-close" command="close" commandfor="offcanvasExample" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
  </div>
</dialog>`,
  navbar: `<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <details class="navbar-collapse">
      <summary class="navbar-toggler" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </summary>
      ${navbarLinks}
    </details>
  </div>
</nav>`,
  dropdown: `<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button" command="toggle-popover" commandfor="dropdownMenuButton">
    Dropdown button
  </button>
  <ul class="dropdown-menu" popover="auto" id="dropdownMenuButton">
${dropdownMenuLinks}
  </ul>
</div>`,
  popover: `<span class="d-inline-block">
  <button type="button" class="btn btn-lg btn-danger" command="toggle-popover" commandfor="popoverLive">
    Click to toggle popover
  </button>
  <div class="popover bs-popover-end" popover="auto" id="popoverLive">
    <div class="popover-arrow"></div>
    <h3 class="popover-header">Popover title</h3>
    <div class="popover-body">And here’s some amazing content. It’s very engaging. Right?</div>
  </div>
</span>`,
  tooltip: `<div class="d-flex flex-wrap justify-content-center gap-2 py-4">
  <button type="button" class="btn btn-secondary bs-tooltip-top" aria-description="Tooltip on top">
    Tooltip on top
  </button>
  <button type="button" class="btn btn-secondary bs-tooltip-end" aria-description="Tooltip on right">
    Tooltip on right
  </button>
  <button type="button" class="btn btn-secondary bs-tooltip-bottom" aria-description="Tooltip on bottom">
    Tooltip on bottom
  </button>
  <button type="button" class="btn btn-secondary bs-tooltip-start" aria-description="Tooltip on left">
    Tooltip on left
  </button>
</div>`,
  scrollspy: `<nav id="navbar-example2" class="navbar bg-body-tertiary px-3 mb-3" data-polyfill-scrollspy>
  <a class="navbar-brand" href="#">Navbar</a>
  <ul class="nav nav-pills">
    <li class="nav-item">
      <a class="nav-link" href="#scrollspyHeading1">First</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#scrollspyHeading2">Second</a>
    </li>
    <li class="nav-item dropdown">
      <button class="nav-link dropdown-toggle" type="button" command="toggle-popover" commandfor="scrollspyDropdown">Dropdown</button>
      <ul class="dropdown-menu" popover="auto" id="scrollspyDropdown">
        <li><a class="dropdown-item" href="#scrollspyHeading3">Third</a></li>
        <li><a class="dropdown-item" href="#scrollspyHeading4">Fourth</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#scrollspyHeading5">Fifth</a></li>
      </ul>
      <span class="scroll-marker-alias" aria-hidden="true">
        <a href="#scrollspyHeading3" tabindex="-1">Third</a>
        <a href="#scrollspyHeading4" tabindex="-1">Fourth</a>
        <a href="#scrollspyHeading5" tabindex="-1">Fifth</a>
      </span>
    </li>
  </ul>
</nav>
<div class="scrollspy-example bg-body-tertiary p-3 rounded-2" tabindex="0">
  <h4 id="scrollspyHeading1">First heading</h4>
  <p>${scrollspyCopy}</p>
  <h4 id="scrollspyHeading2">Second heading</h4>
  <p>${scrollspyCopy}</p>
  <h4 id="scrollspyHeading3">Third heading</h4>
  <p>${scrollspyCopy}</p>
  <h4 id="scrollspyHeading4">Fourth heading</h4>
  <p>${scrollspyCopy}</p>
  <h4 id="scrollspyHeading5">Fifth heading</h4>
  <p>${scrollspyCopy}</p>
</div>`,
  tabs: `${behaviorScript("tabs")}<pe-tabs>
  <ul class="nav nav-tabs" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="home-tab" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Home</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="profile-tab" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false" tabindex="-1">Profile</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="contact-tab" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false" tabindex="-1">Contact</button>
    </li>
  </ul>
  <div class="tab-content">
    <div class="tab-pane active show" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
      <p class="mt-3 mb-0">This is the home pane. Arrow keys in the field below stay in the field.</p>
      <input class="form-control mt-3" type="text" value="Edit me" aria-label="Note">
    </div>
    <div class="tab-pane" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
      <p class="mt-3 mb-0">This is the profile pane.</p>
    </div>
    <div class="tab-pane" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
      <p class="mt-3 mb-0">This is the contact pane.</p>
    </div>
  </div>
</pe-tabs>`,
  toasts: `<button type="button" class="btn btn-primary" command="show-popover" commandfor="liveToast">
  Show live toast
</button>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div class="toast" id="liveToast" popover="manual" role="status" aria-live="polite" aria-atomic="true">
    <div class="toast-header">
      <strong class="me-auto">Bootstrap</strong>
      <small>11 mins ago</small>
      <button type="button" class="btn-close" command="hide-popover" commandfor="liveToast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      Hello, world! This is a toast message.
    </div>
  </div>
</div>`,
  carousel: `<script type="module" src="./node_modules/bootstrap-html/src/behaviors/carousel.js"></script>

<pe-carousel class="carousel slide">
  <button type="button" class="carousel-control-prev" command="--prev" commandfor="fallback-carousel">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <div class="carousel-inner" id="fallback-carousel">
    ${carouselSlides("Fallback")}
  </div>
  <button type="button" class="carousel-control-next" command="--next" commandfor="fallback-carousel">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
  <div class="carousel-indicators">
    <button type="button" command="--slide" commandfor="fallback-carousel" aria-label="Slide 1"></button>
    <button type="button" command="--slide" commandfor="fallback-carousel" aria-label="Slide 2"></button>
    <button type="button" command="--slide" commandfor="fallback-carousel" aria-label="Slide 3"></button>
  </div>
</pe-carousel>`,
  progress: `<label class="form-label" for="file">File progress</label>
<progress id="file" class="progress" value="70" max="100">70%</progress>`,
  spinner: `<div class="d-flex flex-wrap gap-2">
  <button type="button" class="btn btn-primary">Publish</button>
  <button type="button" class="btn btn-primary" aria-busy="true" disabled>Publish</button>
  <button type="button" class="btn btn-outline-secondary" aria-busy="true" disabled>Export CSS</button>
  <button type="button" class="btn btn-sm btn-primary" aria-busy="true" disabled>Publish</button>
</div>`,
  validation: `<form class="row g-3">
  <div class="col-md-4">
    <label for="validationCustom01" class="form-label">First name</label>
    <input type="text" class="form-control" id="validationCustom01" value="Mark" autocomplete="given-name" aria-describedby="validationCustom01Feedback" required>
    <div id="validationCustom01Feedback" class="valid-feedback">
      Looks good!
    </div>
  </div>
  <div class="col-md-4">
    <label for="validationCustom02" class="form-label">Last name</label>
    <input type="text" class="form-control" id="validationCustom02" value="Otto" autocomplete="family-name" aria-describedby="validationCustom02Feedback" required>
    <div id="validationCustom02Feedback" class="valid-feedback">
      Looks good!
    </div>
  </div>
  <div class="col-md-4">
    <label for="validationCustomUsername" class="form-label">Username</label>
    <div class="input-group has-validation">
      <span class="input-group-text" id="inputGroupPrepend">@</span>
      <input type="text" class="form-control" id="validationCustomUsername" aria-describedby="inputGroupPrepend validationCustomUsernameFeedback" required>
      <div id="validationCustomUsernameFeedback" class="invalid-feedback">
        Please choose a username.
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <label for="validationCustom03" class="form-label">City</label>
    <input type="text" class="form-control" id="validationCustom03" autocomplete="address-level2" aria-describedby="validationCustom03Feedback" required>
    <div id="validationCustom03Feedback" class="invalid-feedback">
      Please provide a valid city.
    </div>
  </div>
  <div class="col-md-3">
    <label for="validationCustom04" class="form-label">State</label>
    <select class="form-select" id="validationCustom04" aria-describedby="validationCustom04Feedback" required>
      <option selected disabled value="">Choose...</option>
      <option>California</option>
      <option>Texas</option>
    </select>
    <div id="validationCustom04Feedback" class="invalid-feedback">
      Please select a valid state.
    </div>
  </div>
  <div class="col-md-3">
    <label for="validationCustom05" class="form-label">Zip</label>
    <input type="text" class="form-control" id="validationCustom05" autocomplete="postal-code" aria-describedby="validationCustom05Feedback" required>
    <div id="validationCustom05Feedback" class="invalid-feedback">
      Please provide a valid zip.
    </div>
  </div>
  <div class="col-12">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="invalidCheck" aria-describedby="invalidCheckFeedback" required>
      <label class="form-check-label" for="invalidCheck">
        Agree to terms and conditions
      </label>
      <div id="invalidCheckFeedback" class="invalid-feedback">
        You must agree before submitting.
      </div>
    </div>
  </div>
  <div class="col-12">
    <button class="btn btn-primary" type="submit">Submit form</button>
  </div>
</form>`,
  "field-sizing": `<label class="form-label" for="note">Note</label>
<textarea class="form-control field-sizing" id="note" name="note">Type more lines to grow the box.</textarea>`,
  datalist: `<label class="form-label" for="ice-cream">Flavor</label>
<input class="form-control" list="ice-cream-flavors" id="ice-cream" name="ice-cream" placeholder="Type to filter">
<datalist id="ice-cream-flavors">
  <option value="Chocolate"></option>
  <option value="Coconut"></option>
  <option value="Mint"></option>
  <option value="Strawberry"></option>
  <option value="Vanilla"></option>
</datalist>`,
  output: `${behaviorScript("count")}<fieldset>
  <legend>
    Notify me
    <output id="output-notify-count" class="ms-1 badge rounded-pill text-bg-secondary" data-controls="output-notify" for="output-notify-email output-notify-sms">1<span class="visually-hidden"> selected</span></output>
  </legend>
  <div id="output-notify">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="email" id="output-notify-email" checked>
      <label class="form-check-label" for="output-notify-email">Email</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="sms" id="output-notify-sms">
      <label class="form-check-label" for="output-notify-sms">SMS</label>
    </div>
  </div>
</fieldset>`,
  "range-group": `${behaviorScript("range-group")}<fieldset class="form-range-group">
  <legend class="form-label">Price</legend>
  <label class="visually-hidden" for="price-min">Minimum price</label>
  <label class="visually-hidden" for="price-max">Maximum price</label>
  <div class="form-range-track">
    <input type="range" class="form-range" id="price-min" name="price-min" min="0" max="1000" step="10" value="200">
    <input type="range" class="form-range" id="price-max" name="price-max" min="0" max="1000" step="10" value="800">
  </div>
  <p class="form-text mb-0">
    <output for="price-min" aria-live="off">200</output> – <output for="price-max" aria-live="off">800</output>
  </p>
</fieldset>`,
  "spin-button": `${behaviorScript("step")}<label class="form-label" for="qty">Quantity</label>
<div class="input-group">
  <button type="button" class="btn btn-outline-secondary" command="--step-down" commandfor="qty" aria-label="Decrease quantity" tabindex="-1">
    <span aria-hidden="true">−</span>
  </button>
  <input type="number" class="form-control" id="qty" name="qty" value="1" min="1" max="8">
  <button type="button" class="btn btn-outline-secondary" command="--step-up" commandfor="qty" aria-label="Increase quantity" tabindex="-1">
    <span aria-hidden="true">+</span>
  </button>
</div>
<output class="visually-hidden" for="qty"></output>`,
  "customizable-select": `<label class="form-label" for="plan">Plan</label>
<select class="form-select" id="plan" name="plan">
  <option value="free">Free</option>
  <option value="pro" selected>Pro</option>
  <option value="team">Team</option>
</select>`,
  composed: `<div
  class="card context-host"
  oncontextmenu="event.preventDefault(); this.querySelector('[popover]').showPopover({source: event.target})"
>
  <div class="card-body">
    <p class="mb-2">Right-click this card. Actions is a separate left-click control.</p>
    <button type="button" class="btn btn-sm btn-secondary" command="toggle-popover" commandfor="composed-context-host">
      Actions
    </button>
  </div>
  <ul class="dropdown-menu dropdown-menu-context" popover="auto" id="composed-context-host">
    <li><button type="button" class="dropdown-item">Edit</button></li>
    <li><button type="button" class="dropdown-item">Duplicate</button></li>
    <li><hr class="dropdown-divider"></li>
    <li><button type="button" class="dropdown-item text-danger">Delete</button></li>
  </ul>
</div>`,
};
