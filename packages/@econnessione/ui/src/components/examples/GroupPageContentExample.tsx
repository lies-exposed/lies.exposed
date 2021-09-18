import { Events } from "@econnessione/shared/io/http";
import { uncategorizedEvents } from "@econnessione/shared/mock-data/events";
import { eventMetadata } from "@econnessione/shared/mock-data/events/events-metadata";
import { goodGroup } from "@econnessione/shared/mock-data/groups";
import { projects } from "@econnessione/shared/mock-data/projects";
import { Card } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { GroupPageContent, GroupPageContentProps } from "../GroupPageContent";

const groupFunds = pipe(
  eventMetadata,
  A.filter(Events.ProjectTransaction.is),
  A.filter(
    (f) =>
      // TODO:
      // f.transaction.by.type === "Group" &&
      // f.transaction.by.group === goodGroup.id
      true
  )
);
const fundedProjectIds = groupFunds.map((f) => f.project);

export const groupPageContentArgs: GroupPageContentProps = {
  ...goodGroup,
  // tableOfContents: O.none,
  // timeToRead: O.none,
  events: uncategorizedEvents,
  projects: projects.filter((p) => fundedProjectIds.includes(p.id)),
  funds: groupFunds,
  groupsMembers: [],
  onMemberClick: () => {},
};

export const GroupPageContentExample: React.FC<GroupPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as {} as any)
    ? groupPageContentArgs
    : props;

  return (
    <Card style={{ width: "100%" }}>
      <GroupPageContent {...pageContentProps} />
    </Card>
  );
};
