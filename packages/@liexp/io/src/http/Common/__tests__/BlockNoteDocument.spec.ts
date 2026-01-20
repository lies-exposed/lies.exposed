import { Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import type * as _E from "fp-ts/lib/Either.js";
import { describe, expect, test } from "vitest";
import { BlockNoteDocument } from "../BlockNoteDocument.js";
import { uuid } from "../UUID.js";

const expectDecodeResult = <E extends ParseError>(
  result: _E.Either<E, any>,
  r: "Right" | "Left" = "Right",
): void => {
  const isExpected = result._tag === r;

  if (!isExpected && r === "Right") {
    // eslint-disable-next-line no-console
    console.log(result);
  }
  expect(isExpected).toBe(true);
};

describe("BlockNoteDocument codec", () => {
  test("Should decode given input", () => {
    const blocks = [
      { type: "paragraph", content: "my content", id: uuid(), children: [] },
    ];

    expectDecodeResult(Schema.decodeUnknownEither(BlockNoteDocument)(blocks));
  });

  test("Should failed to decode given input", () => {
    const tags: any[] = [];

    expectDecodeResult(
      Schema.decodeUnknownEither(BlockNoteDocument)(tags),
      "Left",
    );
  });
});
