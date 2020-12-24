import { PageMD } from "@econnessione/io"
import { renderHTML } from "@utils/renderHTML"
import * as React from "react"


export type PageContentProps = PageMD

export const PageContent: React.FC<PageContentProps> = ({ body }) => {
  return (
    <div className="page-content">
      {renderHTML({ body })}
    </div>
  )
}
