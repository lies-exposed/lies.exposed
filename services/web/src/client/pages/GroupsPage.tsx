import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
import { AutocompleteGroupInput } from "@liexp/ui/components/Input/AutocompleteGroupInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import GroupList from "@liexp/ui/components/lists/GroupList";
import { pageContentByPath, Queries } from "@liexp/ui/providers/DataProvider";
import { Typography } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const GroupsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      <PageContent queries={{ pageContent: { path: "groups " } }} />
      <WithQueries
        queries={{
          groups: Queries.Group.getList,
          pageContent: pageContentByPath,
        }}
        params={{
          pageContent: { path: "groups" },
          groups: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(Loader, ErrorBox, ({ pageContent, groups }) => (
          <>
            <AutocompleteGroupInput
              selectedItems={[]}
              onChange={(gg) => {
                navigateTo.groups({
                  id: gg[0].id,
                });
              }}
            />
            <Typography variant="subtitle1">{groups.total}</Typography>
            <GroupList
              groups={groups.data.map((a) => ({
                ...a,
                selected: false,
              }))}
              onItemClick={(g) => {
                navigateTo.groups({
                  id: g.id,
                });
              }}
            />
          </>
        ))}
      />
    </MainContent>
  );
};

export default GroupsPage;
