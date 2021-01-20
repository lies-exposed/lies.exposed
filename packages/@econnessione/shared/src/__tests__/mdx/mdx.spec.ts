import * as fs from "fs";
import * as path from "path";
import * as E from "fp-ts/lib/Either";
// eslint-disable-next-line no-restricted-imports
import { HTMLToMDX, MDXToHTML } from "../../mdx";

describe("MDX", () => {
  test("Should parse simple MDX correctly to HTML", () => {
    const contentMDX = fs.readFileSync(
      path.resolve(__dirname, "./simple.mdx"),
      {
        encoding: "utf-8",
      }
    );
    const html = MDXToHTML(contentMDX)();

    const mdx = HTMLToMDX((html as E.Right<string>).right)();

    expect(mdx).toEqual(E.right(contentMDX.concat("\n")));
  });

  test("Should parse complex MDX correctly to HTML", () => {
    const contentMDX = fs.readFileSync(
      path.resolve(__dirname, "./complex.mdx"),
      {
        encoding: "utf-8",
      }
    );
    const html = MDXToHTML(contentMDX)();

    const mdx = HTMLToMDX((html as E.Right<string>).right)();

    expect(mdx).toEqual(E.right(contentMDX.concat("\n")));
  });
});
