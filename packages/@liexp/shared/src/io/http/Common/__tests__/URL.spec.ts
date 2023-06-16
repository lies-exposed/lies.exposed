import { fc } from "@liexp/test";
import { URL } from "../URL";

describe("URL codec", () => {
  const expectAll = (urls: string[]): void => {
    urls.forEach((u) => {
      expect(URL.decode(u)).toMatchObject({ _tag: 'Right', });
    });
  };

  test.skip("Should decode given input", () => {
    expectAll(fc.sample(fc.webUrl({ size: "small" }), 10));

    expectAll(fc.sample(fc.webUrl({ size: "medium" }), 10));

    expectAll(fc.sample(fc.webUrl({ size: "large" }), 10));
  });
});
