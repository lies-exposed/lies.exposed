import {
  GroupPageContent,
  GroupPageContentProps
} from "@components/GroupPageContent"
import { Events } from "@econnessione/io"
import { uncategorizedEvents } from "@mock-data/events"
import { eventMetadata } from "@mock-data/events/events-metadata"
import { goodGroup } from "@mock-data/groups"
import { projects } from "@mock-data/projects"
import { Card } from "baseui/card"
import * as A from 'fp-ts/lib/Array'
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

const groupFunds = pipe(
  eventMetadata,
  A.filter(Events.ProjectTransaction.ProjectTransaction.is),
  A.filter(
  (f) => f.transaction.by.type === "Group" && f.transaction.by.group.id === goodGroup.id
))
const fundedProjectIds = groupFunds.map((f) => f.project.id)

export const groupPageContentArgs: GroupPageContentProps = {
  id: "",
  frontmatter: goodGroup,
  body: "",
  tableOfContents: O.none,
  timeToRead: O.none,
  events: uncategorizedEvents.map((e) => ({
    id: "",
    frontmatter: e,
    body: "",
    timeToRead: O.none,
    tableOfContents: O.none,
  })),
  projects: projects.filter((p) => fundedProjectIds.includes(p.id)),
  funds: groupFunds,
  onMemberClick: () => {},
}

export const GroupPageContentExample: React.FC<GroupPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as {} as any)
    ? groupPageContentArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <GroupPageContent {...pageContentProps} />
    </Card>
  )
}
