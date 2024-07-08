import type * as E from "fp-ts/lib/Either.js";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { BlockNoteDocument } from "../BlockNoteDocument.js";

const expectDecodeResult = (
  result: E.Either<any[], any>,
  r: "Right" | "Left" = "Right",
): void => {
  const isExpected = result._tag === r;

  if (!isExpected && r === "Right") {
    // eslint-disable-next-line no-console
    console.log(PathReporter.report(result));
  }
  expect(isExpected).toBe(true);
};

describe("BlockNoteDocument codec", () => {
  test("Should decode given input", () => {
    const blocks = [{ type: "paragraph", content: "my content" }];

    expectDecodeResult(BlockNoteDocument.decode(blocks));
  });

  test("Should failed to decode given input", () => {
    const tags: any[] = [];

    expectDecodeResult(BlockNoteDocument.decode(tags), "Left");
  });
});
