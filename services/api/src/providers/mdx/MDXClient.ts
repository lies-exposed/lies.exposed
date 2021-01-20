import * as fs from "fs";
import * as path from "path";
import { ControllerError } from "@io/ControllerError";
import * as IOE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const genMDX = require("gatsby-plugin-mdx/utils/gen-mdx");

class MDXError extends ControllerError {}

const toMDXError = (e: unknown): MDXError => {
  if (e instanceof Error) {
    return {
      status: 500,
      name: "MDXError",
      message: e.message,
      details: {
        kind: "ServerError",
      },
    };
  }
  return {
    status: 500,
    name: "MDXError",
    message: "An error occured",
    details: {
      kind: "ServerError",
      meta: e,
    },
  };
};

// const replaceRelativePath = (value: string): string =>
//   value.replace(new RegExp("../../static/", "g"), "http://localhost:4010/");

// export const renderMDX = (mdxCode: string): TE.TaskEither<MDXError, string> => {
//   return pipe(
//     TE.tryCatch(
//       () =>
//         genMDX({
//           content: replaceRelativePath(mdxCode),
//           cache: { get: () => undefined, set: () => undefined },
//           isLoader: false,
//           node: { internal: { contentDigest: "fake" }, rawBody: mdxCode },
//           options: {
//             remarkPlugins: [
//               require("remark-footnotes"),
//               require("remark-numbered-footnote-labels"),
//               require("@remark-embedder/core"),
//               require("remark-images"),
//               require("remark-mermaid"),
//             ],
//             rehypePlugins: [],
//             gatsbyRemarkPlugins: [],
//           },
//           getNode: () => undefined,
//           getNodes: () => [],
//           getNodesByType: () => [],
//           pathPrefix: "./",
//         }),
//       toMDXError
//     ),
//     TE.map((b: any) => b.body)
//   );
// };

// const rewireData = <F extends { [key: string]: any }>(
//   data: F
// ): TE.TaskEither<Error, F> => {
//   switch (data.type) {
//     case "GroupFrontmatter": {
//       const group = (data as any)
//       return pipe(
//         sequenceS(TE.taskEither)({
//           members: A.array.sequence(TE.taskEither)(
//             (group.members ?? []).map((g: string) =>
//               readFile(path.join(contentRoot, `/actors/${g}.md`))
//             )
//           ),
//         }),
//         TE.map(({ members }) => ({
//           ...data,
//           members: members.map((g: any) => g.frontmatter),
//         }))
//       )
//     }
//     // case 'ActorFrontmatter': {
//     //   const topic = (data as any) as Common.BaseFrontmatter & {
//     //     members: string[]
//     //   }
//     //   return pipe(
//     //     sequenceS(TE.taskEither)({
//     //       members: A.array.sequence(TE.taskEither)(
//     //         topic.members.map((g: string) => readFile(path.join(contentRoot, `/actors/${g}.md`)))
//     //       ),
//     //     }),
//     //     TE.map(({ members }) => ({
//     //       ...data,
//     //       members: members.map((g: any) => g.frontmatter),
//     //     }))
//     //   )
//     // }
//     case "AreaFrontmatter": {
//       const area = (data as any)
//       return pipe(
//         sequenceS(TE.taskEither)({
//           groups: A.array.sequence(TE.taskEither)(
//             (area.groups ?? []).map((g: string) =>
//               readFile(path.join(contentRoot, `/groups/${g}.md`))
//             )
//           ),
//           topics: A.array.sequence(TE.taskEither)(
//             (area.topics ?? []).map((g: string) =>
//               readFile(path.join(contentRoot, `/topics/${g}.md`))
//             )
//           ),
//         }),
//         TE.map(({ groups, topics }) => ({
//           ...data,
//           topics: topics.map((a: any) => a.frontmatter),
//           groups: groups.map((g: any) => g.frontmatter),
//         }))
//       )
//     }
//     default:
//       return TE.right(data)
//   }
// }

// const processMD = (content: string): TE.TaskEither<Error, any> => {
//   // const options = {}
//   return pipe(
//     IOE.tryCatch(() => grayMatter(replaceRelativePath(content)), E.toError),
//     TE.fromIOEither,
//     TE.chain(({ content, data }) =>
//       sequenceS(TE.taskEitherSeq)({
//         frontmatter: rewireData(data),
//         body: TE.tryCatch(() => renderMDX(content, data), E.toError),
//       })
//     ),
//     TE.map((c) => ({
//       ...c,
//       id: c.frontmatter.uuid,
//       frontmatter: { ...c.frontmatter, id: c.frontmatter.uuid },
//     }))
//   )
// }

// const readFile = (filePath: string): TE.TaskEither<Error, string> => {
//   console.log(`Reading file content at ${filePath}`)
//   return pipe(
//     IOE.tryCatch(
//       () => fs.readFileSync(filePath, { encoding: "utf-8" }),
//       E.toError
//     ),
//     TE.fromIOEither,
//     TE.map((data) => data.toString())
//   )
// }

export interface MDXClient {
  writeFile: (filePath: string, data: string) => TE.TaskEither<any, string>;
  readFile: (filePath: string) => TE.TaskEither<any, string>;
}

interface MDXClientContext {
  contentBasePath: string;
}
export type GetMDXClient = (ctx: MDXClientContext) => MDXClient;

export const GetMDXClient = (ctx: MDXClientContext): MDXClient => {
  const readFile = (filePath: string): TE.TaskEither<any, string> => {
    const fullPath = path.join(ctx.contentBasePath, filePath);
    return pipe(
      IOE.tryCatch(
        () =>
          fs.readFileSync(fullPath, {
            encoding: "utf-8",
          }),
        toMDXError
      ),
      TE.fromIOEither,
      // TE.chain((content) => renderMDX(content)),
      // TE.map((data) => data.toString())
    );
  };

  return {
    writeFile: (filePath, data) => {
      const fullPath = path.join(ctx.contentBasePath, filePath);
      return pipe(
        IOE.tryCatch(
          () =>
            fs.writeFileSync(fullPath, data, {
              encoding: "utf-8",
            }),
          toMDXError
        ),
        TE.fromIOEither,
        TE.chain(() => readFile(filePath))
      );
    },
    readFile,
  };
};
