import { MDtoHTML } from "@utils/markdownHTML"
import * as React from "react"
import "./html-content.scss"

interface HTMLContentProps {
  className?: string
  style?: React.CSSProperties
  content: string
  render?: boolean
}

export const HTMLContent: React.FC<HTMLContentProps> = ({
  content,
  style,
  render,
}) => (
  <div
    style={style}
    className="html-content"
    dangerouslySetInnerHTML={{
      __html: render === true ? MDtoHTML(content) : content,
    }}
  />
)
