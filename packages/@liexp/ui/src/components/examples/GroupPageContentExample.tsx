import { uncategorizedEvents } from "@liexp/shared/mock-data/events";
import { goodGroup } from "@liexp/shared/mock-data/groups";
import { Card } from "@material-ui/core";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { GroupPageContent, GroupPageContentProps } from "../GroupPageContent";


export const groupPageContentArgs: GroupPageContentProps = {
  ...goodGroup,
  // tableOfContents: O.none,
  // timeToRead: O.none,
  events: uncategorizedEvents,
  projects: [],
  funds: [],
  groupsMembers: [],
  onMemberClick: () => {},
  ownedGroups: [],
  onGroupClick: () => undefined
  
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
