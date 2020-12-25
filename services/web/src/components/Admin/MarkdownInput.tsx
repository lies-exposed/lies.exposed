import * as React from "react"
import { InputProps, Labeled, useInput } from "react-admin"
import ReactQuill from "react-quill"

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
    input: { value },
    
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
  
  const body = content

  // console.log(value)
  // const htmlValue = renderHTML({ body: value })
  // console.log({ htmlValue })

  return (
    <Labeled label="body" fullWidth={true}>
      <ReactQuill
        onChange={(content) => {
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
