import cors from "cors"
import express from "express"
import * as A from "fp-ts/lib/Array"
// import * as TE from "fp-ts/lib/TaskEither"
import * as E from "fp-ts/lib/Either"
import * as IOE from "fp-ts/lib/IOEither"
import { pipe } from "fp-ts/lib/pipeable"
import * as R from "fp-ts/lib/Record"
import frontmatterToJS from "front-matter"
import fs from "fs"
import path from "path"
import remark from "remark"
// import frontmatter from "remark-frontmatter"
// import footnotes from "remark-footnotes"
// @ts-ignore
import remark2mdx from "remark-mdx"
// import { renderToString } from "react-dom/server"
// import { BaseProvider } from "baseui"
// import { renderHTML } from "../utils/renderHTML"

const replaceRelativePath = (value: string): string =>
  value.replace(new RegExp("../../static/", "g"), "http://localhost:4010/")

const normalizePaths = (attrs: Record<string, unknown>): any => {
  return pipe(
    attrs,
    R.mapWithIndex((key, value) => {
      if (["avatar", "featuredImage"].includes(key)) {
        return replaceRelativePath(value as any)
      }
      if (['color'].includes(key)) {
        return `#${value}`
      }
      return value
    })
  )
}

const processMD = (content: string): IOE.IOEither<Error, any> => {
  console.log("Processing file content")
  return pipe(
    IOE.tryCatch(() => frontmatterToJS(content), E.toError),
    // IOE.map((vfile) => {
    //   console.log(String(vfile))
    //   return String(vfile) as any
    // }),
    IOE.map(({ attributes, body }) => ({
      frontmatter: normalizePaths(attributes as any),
      body: pipe(
        remark()
        .use(remark2mdx)
        // .use(footnotes)
        // .use(remark2react)
        .processSync(replaceRelativePath(body)),
        (vFile) => {
          console.log(vFile)
          return String(vFile)
        }
      ),
      // body: renderToString(renderHTML({ body: content })),
    })),
    IOE.map((c) => ({ id: c.frontmatter.uuid, ...c }))
  )
}

const readDir = (dirPath: string): IOE.IOEither<Error, string[]> => {
  console.log(`Reading dir at ${dirPath}`)
  return pipe(
    IOE.tryCatch(() => fs.readdirSync(dirPath), E.toError),
    IOE.chain((filePaths) =>
      A.array.sequence(IOE.ioEither)(
        filePaths.map((fp) => readFile(`${dirPath}/${fp}`))
      )
    )
  )
}

const readFile = (filePath: string): IOE.IOEither<Error, string> => {
  console.log(`Reading file content at ${filePath}`)
  return pipe(
    IOE.tryCatch(
      () => fs.readFileSync(filePath, { encoding: "utf-8" }),
      E.toError
    ),
    IOE.map((data) => data.toString()),
    IOE.chain(processMD)
  )
}

// var whitelist = ["http://localhost:8002"]
var corsOptions: cors.CorsOptions = {
  origin: true,
}
const app = express()

app.use(cors(corsOptions) as any)

app.use(express.static("static"))
app.get("*", (req, res) => {
  console.log(req.params)
  console.log(req.url)

  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count")

  const paths = req.params[0].split("/").filter((s) => s !== "")
  return pipe(
    paths,
    (paths): IOE.IOEither<Error, any> => {
      console.log(paths)
      const contentPath = path.join(process.cwd(), "content", ...paths)
      if (paths.length === 1) {
        res.setHeader("X-Total-Count", 20)
        return readDir(contentPath)
      }
      if (paths.length === 2) {
        return pipe(
          readFile(`${contentPath}.md`),
          IOE.map((content) => content)
        )
      }
      return IOE.left<Error, string[]>(new Error(`Invalid path: ${req.url}`))
    },
    IOE.fold(
      (e) => () => res.status(500).send(e),
      (response) => () => res.status(200).send(response)
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
