import { PageMD } from "@models/page"
import { renderHTML } from "@utils/renderHTML"
import * as React from "react"

export type PageContentProps = PageMD

export const PageContent: React.FC<PageContentProps> = ({ body }) => {
  return <div className="page-content">{renderHTML({ body })}</div>
}
