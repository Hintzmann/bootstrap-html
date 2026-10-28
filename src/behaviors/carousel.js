/**
 * Entry for <pe-carousel>. Load it on pages that use the element.
 *
 * Where ::scroll-button exists, the browser draws the prev, next, and pip
 * controls, so this module fetches nothing more and <pe-carousel> stays
 * undefined. Elsewhere it imports carousel-controls.js from the same
 * folder, which defines the element. Copy both files.
 */

if (!CSS.supports("selector(::scroll-button(inline-start))")) import("./carousel-controls.js");
