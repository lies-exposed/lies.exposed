import { Schema } from "effect";
import { describe, expect, test } from "vitest";
import { getArg, parseArgsFromSchema } from "../args.js";

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
    expect(
      getArg(["--end=10", "--sort=createdAt", "--order=DESC"], "sort"),
    ).toBe("createdAt");
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

describe("parseArgsFromSchema() array fields", () => {
  const MemberSchema = Schema.Struct({
    actor: Schema.String,
    startDate: Schema.String,
  });
  const S = Schema.Struct({
    members: Schema.UndefinedOr(Schema.Array(Schema.String)),
    details: Schema.UndefinedOr(Schema.Array(MemberSchema)),
  });

  test("comma-splits a plain string array value", () => {
    const r = parseArgsFromSchema(S, ["--members=aaa,bbb"]);
    expect(r.members).toEqual(["aaa", "bbb"]);
  });

  test("leaves an optional array undefined when no arg is given", () => {
    const r = parseArgsFromSchema(S, []);
    expect(r.members).toBeUndefined();
  });

  test("decodes a JSON-array value into objects instead of comma-splitting it", () => {
    const raw = JSON.stringify([
      {
        actor: "ec038b1a-6a41-4d24-baeb-df63a888ce62",
        startDate: "1886-05-08",
      },
    ]);
    const r = parseArgsFromSchema(S, [`--details=${raw}`]);
    expect(r.details).toEqual([
      {
        actor: "ec038b1a-6a41-4d24-baeb-df63a888ce62",
        startDate: "1886-05-08",
      },
    ]);
  });

  test("does not shatter a JSON-looking string array element into fragments", () => {
    // A member object serialized as one element must survive round-trip, not be
    // split at its internal comma (the double-encoded-body bug).
    const raw = '[{"actor":"a","startDate":"1886-05-08"}]';
    const r = parseArgsFromSchema(S, [`--details=${raw}`]);
    expect(r.details).toEqual([{ actor: "a", startDate: "1886-05-08" }]);
  });
});
