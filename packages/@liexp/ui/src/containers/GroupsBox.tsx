import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Group } from "@liexp/shared/lib/io/http/index.js";
import { type EndpointQueryType } from "@ts-endpoint/core";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";
import GroupList from "../components/lists/GroupList.js";
import { Box } from "../components/mui/index.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { paginationToParams } from "../utils/params.utils.js";

interface GroupsBoxWrapperProps {
  params: Partial<EndpointQueryType<typeof Endpoints.Group.List>>;
  discrete?: boolean;
  prefix?: string;
  children: (data: Group.GroupListOutput) => React.ReactElement;
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
          undefined,
          params,
          discrete,
          prefix,
        ),
      }}
      render={({ groups }) => {
        return children({ ...groups, data: [...groups.data] });
      }}
    />
  );
};

export interface GroupsBoxProps
  extends Omit<GroupsBoxWrapperProps, "children"> {
  style?: React.CSSProperties;
  onItemClick: (g: Group.Group, e: React.SyntheticEvent) => void;
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
          ...paginationToParams({
            page: 1,
            perPage: params?.ids?.length ?? 20,
          }),
          _sort: "createdAt",
          _order: "DESC",
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
