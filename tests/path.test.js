import { describe, expect, test } from "vitest";
import { isCurrent, sitePath } from "../src/lib/path.js";

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
