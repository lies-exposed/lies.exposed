import {
  GroupPageContent,
  GroupPageContentProps,
} from "@components/GroupPageContent"
import { uncategorizedEvents } from "@mock-data/events"
import { eventMetadata } from "@mock-data/events-metadata"
import { goodGroup } from "@mock-data/groups"
import { projects } from "@mock-data/projects"
import { ProjectTransaction } from "@models/events/EventMetadata"
import { Card } from "baseui/card"
import * as A from 'fp-ts/lib/Array'
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

const groupFunds = pipe(
  eventMetadata,
  A.filter(ProjectTransaction.is),
  A.filter(
  (f) => f.transaction.by.__type === "Group" && f.transaction.by.group.uuid === goodGroup.uuid
))
const fundedProjectIds = groupFunds.map((f) => f.project.uuid)

export const groupPageContentArgs: GroupPageContentProps = {
  frontmatter: goodGroup,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
  events: uncategorizedEvents.map((e) => ({
    frontmatter: e,
    body: null,
    timeToRead: O.none,
    tableOfContents: { items: undefined },
  })),
  projects: projects.filter((p) => fundedProjectIds.includes(p.uuid)),
  funds: groupFunds,
  onMemberClick: () => {},
}

export const GroupPageContentExample: React.FC<GroupPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? groupPageContentArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <GroupPageContent {...pageContentProps} />
    </Card>
  )
}
