import {
  ProjectPageContent,
  ProjectPageContentProps
} from "@components/ProjectPageContent"
import { funds } from "@mock-data/funds"
import { firstGoodProject } from "@mock-data/projects"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

export const projectPageContentExampleArgs: ProjectPageContentProps = {
  frontmatter: firstGoodProject,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
  funds,
}

export const ProjectPageContentExample: React.FC<ProjectPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? projectPageContentExampleArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <ProjectPageContent {...pageContentProps} />
    </Card>
  )
}
