import { GroupPageContent, GroupPageContentProps } from "@components/GroupPageContent"
import { events } from "@mock-data/events"
import { funds } from "@mock-data/funds"
import { firstGroup } from "@mock-data/groups"
import { projects } from "@mock-data/projects"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

const groupFunds = funds.filter(
  (f) => f.by.__type === "Group" && f.by.group.uuid === firstGroup.uuid
)
const fundedProjectIds = groupFunds.map( f => f.project.uuid)

export const groupPageContentArgs: GroupPageContentProps = {
  frontmatter: firstGroup,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
  events: events.map((e) => ({
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
