import {
  ProjectPageContent,
  ProjectPageContentProps,
} from "@components/ProjectPageContent"
import { extractEventsMetadata } from "@helpers/event"
import { events } from "@mock-data/events"
import { firstBadProject } from "@mock-data/projects"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export const projectPageContentExampleArgs: ProjectPageContentProps = {
  frontmatter: firstBadProject,
  body: null,
  tableOfContents: O.none,
  timeToRead: O.none,
  metadata: pipe(
    events,
    extractEventsMetadata({ type: "Project", elem: firstBadProject })
  ),
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
