import { describe, expect, test } from "vitest";
import { GetListMediaQueryMonoid } from "../Media.js";

describe("GetListMediaQueryMonoid", () => {
  test("Should have a valid empty value", () => {
    const empty = GetListMediaQueryMonoid.empty;
    expect(empty._sort).toEqual(expect.objectContaining({ _tag: "Some" }));
    expect(empty._end).toEqual(expect.objectContaining({ _tag: "Some" }));
  });

  test("Should concat two GetListMediaQuery objects", () => {
    const x = GetListMediaQueryMonoid.empty;
    const y = { ...GetListMediaQueryMonoid.empty, q: { _tag: "Some", value: "test" } as any };
    const result = GetListMediaQueryMonoid.concat(x, y);
    expect(result.q).toEqual({ _tag: "Some", value: "test" });
  });
});
