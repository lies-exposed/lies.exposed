import * as RenderHTML from "@utils/renderHTML"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { InputProps, Labeled, useInput } from "react-admin"
import ReactQuill from "react-quill"
// @ts-ignore
import * as remarkParse from "remark-parse"
// import footnotes from "remark-footnotes"
// @ts-ignore
// import remark2mdx from "remark-mdx"
// @ts-ignore
import unified from "unified"
// @ts-ignore
import remark2react from "remark-react"
// @ts-ignore
import MDX from "@mdx-js/runtime"
import { BaseProvider } from "baseui"
import theme from "@theme/CustomeTheme"

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"],
]

const MarkdownInput: React.FC<InputProps> = (props) => {
  const {
    input: { name, onChange, onBlur, onFocus, value, ...rest },
    meta: { touched, error },
    isRequired,
  } = useInput(props)

  // mdx.useMDXComponents(RenderHTML.shortcodes)
  // const inputRef = React.useRef(value)

  // const valueVFile: React.ReactElement = unified()
  //   .use(remarkParse)
  //   // .use(remark2mdx)
  //   .use(footnotes, { inlineNotes: true })
  //   .use(remark2react, { remarkReactComponents: RenderHTML.shortcodes })
  //   // .use(html)
  //   .processSync(value)

  // console.log({ valueVFile })
  // const content = String(valueVFile)
  const content = value
  console.log({ content })
  const body = content
  console.log({ value, body })

  // console.log(value)
  // const htmlValue = renderHTML({ body: value })
  // console.log({ htmlValue })

  return (
    <Labeled label="body" fullWidth={true}>
      <ReactQuill
        onChange={(content) => {
          console.log(content)
          // onChange({ value: content })
        }}
        modules={{
          toolbar: toolbarOptions,
        }}
        value={body}
        defaultValue={body}
      />
    </Labeled>
  )
}
export default MarkdownInput
