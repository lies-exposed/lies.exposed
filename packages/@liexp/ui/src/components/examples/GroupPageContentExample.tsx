import { goodGroup } from "@liexp/shared/mock-data/groups";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { GroupPageContent, GroupPageContentProps } from "../GroupPageContent";
import { Card } from "../mui";

export const groupPageContentArgs: GroupPageContentProps = {
  group: goodGroup,
  projects: [],
  funds: [],
  groupsMembers: [],
  onMemberClick: () => {},
  ownedGroups: [],
  onGroupClick: () => undefined,
  hierarchicalGraph: {
    onNodeClick: () => {},
    onLinkClick: () => {},
  },
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
