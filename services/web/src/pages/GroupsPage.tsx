import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { AutocompleteGroupInput } from "@econnessione/ui/components/Input/AutocompleteGroupInput";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import GroupList from "@econnessione/ui/components/lists/GroupList";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import { Typography } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { doUpdateCurrentView } from "../utils/location.utils";

export default class GroupsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
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
                selectedIds={[]}
                onChange={(gg) => {
                  void doUpdateCurrentView({
                    view: "group",
                    groupId: gg[0].id,
                  })();
                }}
              />
              <Typography variant="subtitle1">{groups.total}</Typography>
              <GroupList
                groups={groups.data.map((a) => ({
                  ...a,
                  selected: false,
                }))}
                onGroupClick={async (g) => {
                  void doUpdateCurrentView({
                    view: "group",
                    groupId: g.id,
                  })();
                }}
              />
            </>
          ))}
        />
      </MainContent>
    );
  }
}
