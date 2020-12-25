import fs from "fs"
import path from "path"
import { Common } from "@econnessione/io"
import cors from "cors"
import express from "express"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as IOE from "fp-ts/lib/IOEither"
import * as O from "fp-ts/lib/Option"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import grayMatter from "gray-matter"
import { renderMDX } from "./mdx/renderMDX"

const contentRoot = path.join(process.cwd(), "content")

const rewireData = <F extends { [key: string]: any }>(
  data: F
): TE.TaskEither<Error, F> => {
  switch (data.type) {
    case "GroupFrontmatter": {
      const group = (data as any) as Common.BaseFrontmatter & {
        members: string[] | undefined
      }
      return pipe(
        sequenceS(TE.taskEither)({
          members: A.array.sequence(TE.taskEither)(
            (group.members ?? []).map((g: string) =>
              readFile(path.join(contentRoot, `/actors/${g}.md`))
            )
          ),
        }),
        TE.map(({ members }) => ({
          ...data,
          members: members.map((g: any) => g.frontmatter),
        }))
      )
    }
    // case 'ActorFrontmatter': {
    //   const topic = (data as any) as Common.BaseFrontmatter & {
    //     members: string[]
    //   }
    //   return pipe(
    //     sequenceS(TE.taskEither)({
    //       members: A.array.sequence(TE.taskEither)(
    //         topic.members.map((g: string) => readFile(path.join(contentRoot, `/actors/${g}.md`)))
    //       ),
    //     }),
    //     TE.map(({ members }) => ({
    //       ...data,
    //       members: members.map((g: any) => g.frontmatter),
    //     }))
    //   )
    // }
    case "AreaFrontmatter": {
      const area = (data as any) as Common.BaseFrontmatter & {
        groups: string[] | undefined
        topics: string[] | undefined
      }
      return pipe(
        sequenceS(TE.taskEither)({
          groups: A.array.sequence(TE.taskEither)(
            (area.groups ?? []).map((g: string) =>
              readFile(path.join(contentRoot, `/groups/${g}.md`))
            )
          ),
          topics: A.array.sequence(TE.taskEither)(
            (area.topics ?? []).map((g: string) =>
              readFile(path.join(contentRoot, `/topics/${g}.md`))
            )
          ),
        }),
        TE.map(({ groups, topics }) => ({
          ...data,
          topics: topics.map((a: any) => a.frontmatter),
          groups: groups.map((g: any) => g.frontmatter),
        }))
      )
    }
    default:
      return TE.right(data)
  }
}

const replaceRelativePath = (value: string): string =>
  value.replace(new RegExp("../../static/", "g"), "http://localhost:4010/")

const processMD = (content: string): TE.TaskEither<Error, any> => {
  // const options = {}
  return pipe(
    IOE.tryCatch(() => grayMatter(replaceRelativePath(content)), E.toError),
    TE.fromIOEither,
    TE.chain(({ content, data }) =>
      sequenceS(TE.taskEitherSeq)({
        frontmatter: rewireData(data),
        body: TE.tryCatch(() => renderMDX(content, data), E.toError),
      })
    ),
    TE.map((c) => ({
      ...c,
      id: c.frontmatter.uuid,
      frontmatter: { ...c.frontmatter, id: c.frontmatter.uuid },
    }))
  )
}

const readDir = (dirPath: string): TE.TaskEither<Error, string[]> => {
  console.log(`Reading dir at ${dirPath}`)
  return pipe(
    IOE.tryCatch(() => fs.readdirSync(dirPath), E.toError),
    TE.fromIOEither,
    TE.map((files) =>
      files.filter((f) =>
        pipe(
          A.last(f.split(".")),
          O.exists((ext) => ext === "md")
        )
      )
    )
  )
}

const readFile = (filePath: string): TE.TaskEither<Error, string> => {
  console.log(`Reading file content at ${filePath}`)
  return pipe(
    IOE.tryCatch(
      () => fs.readFileSync(filePath, { encoding: "utf-8" }),
      E.toError
    ),
    TE.fromIOEither,
    TE.map((data) => data.toString())
  )
}

// var whitelist = ["http://localhost:8002"]
var corsOptions: cors.CorsOptions = {
  origin: true,
}
const app = express()

app.use(cors(corsOptions) as any)

app.use(express.static("static"))
app.get("/data/*", (req, res) => {
  const paths = req.params[0].split("/").filter((s) => s !== "")
  console.log('paths', paths)
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  pipe(
    paths,
    (paths): TE.TaskEither<Error, any> => {
      console.log(paths)
      const contentPath = path.join(process.cwd(), "data", ...paths)
      if (paths.length === 1) {
        res.setHeader("X-Total-Count", 20)
        return pipe(
          readFile(`${contentPath}.json`),
          TE.map((results) => ({ data: JSON.parse(results), total: 20 }))
        )
      }
      if (paths.length === 2) {
        const extension = "json"
        return pipe(
          readFile(`${contentPath}.${extension}`),
          TE.map((content) => ({ data: content }))
        )
      }
      return TE.left<Error, string[]>(new Error(`Invalid path: ${req.url}`))
    },
    TE.fold(
      (e) => {
        console.error(e)
       return  () => Promise.resolve(res.status(500).send(e))
      },
      (response) => () => Promise.resolve(res.status(200).send(response))
    )
  )()
})
app.get("*", (req, res) => {
  console.log(req.params)
  console.log(req.url)

  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count")

  const paths = req.params[0].split("/").filter((s) => s !== "")
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  pipe(
    paths,
    (paths): TE.TaskEither<Error, any> => {
      console.log(paths)
      const contentPath = path.join(process.cwd(), "content", ...paths)
      if (paths.length === 1) {
        res.setHeader("X-Total-Count", 20)
        return pipe(
          readDir(contentPath),
          TE.chain((filePaths) =>
            A.array.sequence(TE.taskEitherSeq)(
              filePaths.map((fp) => readFile(`${contentPath}/${fp}`))
            )
          ),
          TE.map((results) => ({ data: results, total: 20 }))
        )
      }
      if (paths.length === 2) {
        const extension = paths[0] === "data" ? "json" : "md"
        return pipe(
          readFile(`${contentPath}.${extension}`),
          TE.chain(processMD),
          TE.map((content) => ({ data: content }))
        )
      }
      return TE.left<Error, string[]>(new Error(`Invalid path: ${req.url}`))
    },
    TE.fold(
      (e) => () => Promise.resolve(res.status(500).send(e)),
      (response) => () => Promise.resolve(res.status(200).send(response))
    )
  )()
})

const server = app.listen("4010", () =>
  console.log("Server is listening at 4010")
)

process.on("disconnect", () => {
  console.log("closing server...")
  server.close()
})
