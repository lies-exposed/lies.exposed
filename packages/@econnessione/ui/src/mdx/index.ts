/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehype2react from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import html from "rehype-stringify";
import remarkGFM from "remark-gfm";
import remarkParse from "remark-parse";
import remark2rehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import remarkTOC from "remark-toc";
import unified from "unified";
// import { log } from "./plugins/log";
// const mdxJS = require("@mdx-js/mdx");
const rehypeFormat = require("rehype-format");
// const rehypeMinify = require("rehype-preset-minify");
const rehype2Remark = require("rehype-remark");
// const remark = require("remark");
const remarkBreaks = require("remark-breaks");
const footnotes = require("remark-footnotes");
const remarkImages = require("remark-images");
// import rehypeDoc from 'rehype-document'
const remarkLint = require("remark-lint");
const remarkMDX = require("remark-mdx");
// const mermaird = require("remark-mermaid");
const numberedFootnotesLabel = require("remark-numbered-footnote-labels");
const remarkLintPreset = require("remark-preset-lint-recommended");
// const vFileReporter = require("vfile-reporter");

const remarkPlugins = [
  remarkLintPreset,
  remarkGFM,
  remarkLint,
  remarkImages,
  remarkTOC,
  [footnotes, { inlineNotes: false }],
  numberedFootnotesLabel,
  // mermaird,
  // remarkSquuezeParagraphs,
  remarkBreaks,
  remarkMDX,
  [remarkStringify, { bullet: "-", emphasis: "_", listItemIndent: "one" }],
];

export const remarkCompiler = (pr: unified.Processor): unified.Processor =>
  pr.use(remarkParse).use(remarkPlugins);

export const MDXToHTML = (content: string): IOE.IOEither<Error, string> => {
  // console.log("MDXToHTML", content);
  return pipe(
    IOE.tryCatch(
      () =>
        remarkCompiler(unified())
          // .use(log("after remark stringify"))
          .use(remark2rehype, {
            allowDangerousHtml: true,
          })
          .use(rehypeFormat)
          .use(html)
          // .use(rehypeMinify)
          .processSync(content.trim()),
      E.toError
    ),
    IOE.map((r) => {
      if (r.messages) {
        // console.warn(vFileReporter(r));
      }
      // console.log("html result", r.contents);
      return String(r);
    })
  );
};

export const HTMLToMDX = (content: string): IOE.IOEither<Error, string> => {
  const html = content.trim();
  // console.log("HTML TO MDX", html);
  return pipe(
    IOE.tryCatch(() => {
      return unified()
        .use(rehypeParse, {
          allowDangerousHtml: true,
          newlines: true,
        } as any)
        .use(rehypeSanitize)
        .use(rehype2Remark)
        .use(remarkPlugins)
        .processSync(html);
    }, E.toError),
    IOE.map((r) => {
      if (r.messages) {
        // console.warn(vFileReporter(r));
      }
      return (
        String(r)
          // TODO: transform in plugins if needed
          // replace double backslashs for mdx components escaping
          .replace(/\\/g, "")
          // add a break between mdx components
          .replace(/<\/FullSizeSection> </g, "</FullSizeSection>\n\n<")
          .replace(/--> </g, "-->\n\n<")
          // always add a breakline at the eof
          .concat("\n")
      );
    })
  );
};

// export const MDXToReactV2 = (content: string): string => {
//   const result = mdxJS.sync(content, {
//     js: false,
//     remarkPlugins: [remarkTOC, footnotes, mermaird],
//   });
//   return result;
// };

export const MDX2React = (
  content: string,
  components: { [key: string]: rehype2react.ComponentLike<any> }
): string => {
  const result = remarkCompiler(unified())
    .use(remark2rehype, {
      allowDangerousHtml: true,
    })
    .use(rehypeRaw)
    .use(rehype2react, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components,
    })
    .processSync(content);
  // eslint-disable-next-line
  // console.log(result);

  return result.result as string;
};
