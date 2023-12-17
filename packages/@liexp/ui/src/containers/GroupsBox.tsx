import { type Group } from "@liexp/shared/lib/io/http";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer";
import GroupList from "../components/lists/GroupList";
import { Box } from "../components/mui";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider";

interface GroupsBoxWrapperProps {
  params: any;
  discrete?: boolean;
  prefix?: string;
  children: (data: Group.GroupListOutput) => JSX.Element;
}

export const GroupsBoxWrapper: React.FC<GroupsBoxWrapperProps> = ({
  params,
  discrete = true,
  prefix = "group-box-wrapper",
  children,
}) => {
  const Queries = useEndpointQueries();
  return (
    <QueriesRenderer
      queries={{
        groups: Queries.Group.list.useQuery(
          {
            ...params,
          },
          undefined,
          discrete,
          prefix,
        ),
      }}
      render={({ groups }) => {
        // eslint-disable-next-line react/jsx-key
        return children(groups);
      }}
    />
  );
};

export interface GroupsBoxProps
  extends Omit<GroupsBoxWrapperProps, "children"> {
  style?: React.CSSProperties;
  onItemClick: (g: Group.Group) => void;
}
export const GroupsBox: React.FC<GroupsBoxProps> = ({
  params,
  style,
  onItemClick,
  discrete,
  prefix,
  ...props
}) => {
  return (
    <Box>
      <GroupsBoxWrapper
        params={{
          pagination: { page: 1, perPage: params?.filter?.ids?.length ?? 20 },
          sort: { field: "createdAt", order: "DESC" },
          ...params,
        }}
        discrete={discrete}
        prefix={prefix}
      >
        {({ data: groups }) => (
          <GroupList
            style={style}
            onItemClick={onItemClick}
            groups={groups.map((a) => ({ ...a, selected: true }))}
          />
        )}
      </GroupsBoxWrapper>
    </Box>
  );
};
