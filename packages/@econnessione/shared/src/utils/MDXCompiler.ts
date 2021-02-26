/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import remarkParse from "remark-parse";
import { BlockQuote } from "../components/BlockQuote";
import { ListItem } from "../components/Common/ListItem";
import { CO2LeftBudgetCounter } from "../components/Counters/CO2LeftBudgetCounter";
import { WorldPopulationCounter } from "../components/Counters/WorldPopulationCount";
import { FullSizeSection } from "../components/FullSizeSection/FullSizeSection";
import { CO2LevelsGraph } from "../components/Graph/CO2LevelsGraph";
import { HumanPopulationGrowthGraph } from "../components/Graph/HumanPopulationGrowthGraph";
import { MainContent } from "../components/MainContent";
import { Video } from "../components/Video/Video";
import { ActorPageContentExample } from "../components/examples/ActorPageContentExample";
import BubbleGraphExample from "../components/examples/BubbleGraphExample";
import { EventPageContentExample } from "../components/examples/EventPageContentExample";
import { EventSliderExample } from "../components/examples/EventSliderExample";
import { GroupPageContentExample } from "../components/examples/GroupPageContentExample";
import NetworkExample from "../components/examples/NetworkExample";
import { ProjectPageContentExample } from "../components/examples/ProjectPageContentExample";
import { TopicPageContentExample } from "../components/examples/TopicPageContentExample";
// import { GQLVoyager } from "../components/GQLVoyager"
const mdxJS = require("@mdx-js/mdx");
// const rehypeComponents = require("rehype-components");
const rehypeParse = require("rehype-parse");
const rehypeRaw = require("rehype-raw");
const rehype2react = require("rehype-react");
const rehype2Remark = require("rehype-remark");
const html = require("rehype-stringify");
const footnotes = require("remark-footnotes");
const mdx = require("remark-mdx");
const mermaird = require("remark-mermaid");
const numberedFootnotesLabel = require("remark-numbered-footnote-labels");
const remark2rehype = require("remark-rehype");
const remarkStringify = require("remark-stringify");
const remarkTOC = require("remark-toc");
const unified = require("unified");

const components = {
  // layout
  MainContent,
  // counters
  CO2LeftBudgetCounter,
  WorldPopulationCounter,
  // graphs
  CO2LevelsGraph,
  HumanPopulationGrowthGraph,
  // graph examples
  NetworkExample,
  BubbleGraphExample,
  // page content examples
  ActorPageContentExample,
  GroupPageContentExample,
  ProjectPageContentExample,
  TopicPageContentExample,
  EventPageContentExample,
  EventSliderExample,
  // components
  FullSizeSection,
  Video,
  // GQLVoyager,
  // common tags
  li: ListItem,
  blockquote: BlockQuote,
};

const lowerCasedComponents = Object.keys(components).reduce(
  (acc, k) => ({
    ...acc,
    [k.toLowerCase()]: (components as any)[k],
  }),
  {}
);

const remarkCompiler = (): any =>
  unified()
    .use(remarkParse, { position: false })
    .use(mdx)
    .use(require("remark-images"))
    .use(remarkTOC)
    .use(footnotes)
    .use(numberedFootnotesLabel)
    .use(mermaird);
// .use(remarkRemoveEmptyParagraph)
// .use(require("remark-breaks"));
// .use(remarkStringify)

export const MDXToReactV2 = (content: string): string => {
  const result = mdxJS.sync(content, {
    js: false,
    remarkPlugins: [remarkTOC, footnotes, mermaird],
  });
  return result;
};

export const MDX2ReactSync = (content: string): string => {
  const result = remarkCompiler()
    .use(remark2rehype, {
      allowDangerousHtml: true,
    })
    .use(rehypeRaw)
    .use(rehype2react, {
      sanitize: true,
      createElement: React.createElement,
      fragment: React.Fragment,
      components: lowerCasedComponents,
    })
    .processSync(content);
  // eslint-disable-next-line
  console.log(result);

  return result.result;
};

export const MDXToHTML = (content: string): IOE.IOEither<Error, string> => {
  return pipe(
    IOE.tryCatch(
      () =>
        remarkCompiler()
          .use(remark2rehype, {
            allowDangerousHtml: true,
            passThrough: ["MainContent"],
          })
          // .use(rehypeRaw)
          // .use(rehype2react, {
          //   sanitize: true,
          //   createElement: React.createElement,
          //   fragment: React.Fragment,
          //   components: lowerCasedComponents,
          // })
          .use(html)
          .processSync(content),
      E.toError
    ),
    IOE.map((r) => {
      console.log(r);
      return r.contents;
    })
  );
};

export const HTMLToMD = (content: string): IOE.IOEither<Error, string> => {
  return pipe(
    IOE.tryCatch(
      () =>
        unified()
          .use(rehypeParse)
          .use(rehype2Remark)
          // .use(rehypeRaw)
          // .use(rehype2react, {
          //   sanitize: true,
          //   createElement: React.createElement,
          //   fragment: React.Fragment,
          //   components: lowerCasedComponents,
          // })
          .use(remarkStringify)
          .processSync(content),
      E.toError
    ),
    IOE.map((r) => {
      console.log(r);
      return r.contents;
    })
  );
};
