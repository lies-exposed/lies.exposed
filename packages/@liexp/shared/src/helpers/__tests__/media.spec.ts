import { fp } from "@liexp/core/lib/fp";
import { fc } from "@liexp/test";
import { getPlatform } from "../media";

describe("@helpers/media", () => {
  describe("parse external media url", () => {
    test("succeeds with `dailymotion` urls", () => {
      const ids = fc.sample(fc.uuid(), 100);
      const urls = ids.map(
        (id, i) =>
          `https://dailymotion.com/${i % 2 === 0 ? "embed/" : ""}video/${id}`
      );

      expect(
        fp.A.sequence(fp.E.Applicative)(urls.map(getPlatform))
      ).toMatchObject(
        fp.E.right(ids.map((id) => ({ platform: "dailymotion", id })))
      );
    });
  });
});
