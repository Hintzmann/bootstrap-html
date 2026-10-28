import { describe, expect, test } from "vitest";
import { behaviorPath, isCurrent, polyfillLoaderPath, sitePath } from "../src/lib/path.js";

describe("sitePath", () => {
  test("joins a project base that has no trailing slash", () => {
    expect(sitePath("/components/buttons", "/bootstrap-html")).toBe(
      "/bootstrap-html/components/buttons",
    );
  });

  test("does not double a trailing slash on base", () => {
    expect(sitePath("/components/buttons", "/bootstrap-html/")).toBe(
      "/bootstrap-html/components/buttons",
    );
  });

  test("keeps a hash after the prefixed path", () => {
    expect(sitePath("/polyfills#interestfor", "/bootstrap-html")).toBe(
      "/bootstrap-html/polyfills#interestfor",
    );
  });

  test("root is the base with a trailing slash", () => {
    expect(sitePath("/", "/bootstrap-html")).toBe("/bootstrap-html/");
    expect(sitePath("/", "/")).toBe("/");
  });
});

describe("polyfillLoaderPath", () => {
  test("serves the source in dev and the minified copy in a build, under base", () => {
    expect(polyfillLoaderPath(true, "/bootstrap-html/")).toBe("/bootstrap-html/src/polyfills/index.js");
    expect(polyfillLoaderPath(false, "/bootstrap-html/")).toBe("/bootstrap-html/js/polyfills/index.js");
  });
});

describe("behaviorPath", () => {
  test("serves the source in dev and the minified copy in a build, under base", () => {
    expect(behaviorPath("tabs", true, "/bootstrap-html/")).toBe("/bootstrap-html/src/behaviors/tabs.js");
    expect(behaviorPath("tabs", false, "/")).toBe("/js/behaviors/tabs.js");
  });
});

describe("isCurrent", () => {
  test("matches a prefixed pathname with or without a trailing slash", () => {
    expect(
      isCurrent("/bootstrap-html/components/buttons", "/components/buttons", "/bootstrap-html"),
    ).toBe(true);
    expect(
      isCurrent("/bootstrap-html/components/buttons/", "/components/buttons", "/bootstrap-html"),
    ).toBe(true);
  });
});
