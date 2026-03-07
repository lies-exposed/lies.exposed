import { describe, expect, test } from "vitest";
import { getArg } from "../args.js";

describe("getArg()", () => {
  test("returns value for a simple key=value pair", () => {
    expect(getArg(["--foo=bar"], "foo")).toBe("bar");
  });

  test("returns undefined when key is absent", () => {
    expect(getArg(["--other=value"], "foo")).toBeUndefined();
  });

  test("returns empty string for --key= (empty value)", () => {
    expect(getArg(["--foo="], "foo")).toBe("");
  });

  test("returns the full value when it contains '=' (e.g. URLs)", () => {
    expect(getArg(["--url=https://example.com/path?a=1&b=2"], "url")).toBe(
      "https://example.com/path?a=1&b=2",
    );
  });

  test("returns the correct value when multiple args are present", () => {
    expect(getArg(["--end=10", "--sort=createdAt", "--order=DESC"], "sort")).toBe(
      "createdAt",
    );
  });

  test("returns undefined for an empty args array", () => {
    expect(getArg([], "foo")).toBeUndefined();
  });

  test("does not match a partial key prefix", () => {
    // --foobar=baz should NOT match key "foo"
    expect(getArg(["--foobar=baz"], "foo")).toBeUndefined();
  });

  test("returns numeric string value unchanged", () => {
    expect(getArg(["--end=3"], "end")).toBe("3");
  });
});
