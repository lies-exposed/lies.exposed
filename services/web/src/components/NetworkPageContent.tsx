import { Page } from "@econnessione/io"
import { renderHTML } from "@utils/renderHTML"
import { Heading } from "baseui/heading"
import * as React from "react"

type NetworkPageContentProps = Page.PageMD

export const NetworkPageContent: React.FC<NetworkPageContentProps> = ({
  frontmatter,
  body,
}) => {
  return (
    <>
      <Heading $style={{ textAlign: "center" }}>{frontmatter.title}</Heading>
      <div style={{ textAlign: "center" }}>{renderHTML({ body })}</div>
    </>
  )
}
