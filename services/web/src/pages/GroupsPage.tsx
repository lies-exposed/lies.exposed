import {
  Queries,
  pageContentByPath,
} from "@econnessione/shared/providers/DataProvider";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SearchableInput from "@econnessione/ui/components/SearchableInput";
import GroupList, {
  GroupListItem,
} from "@econnessione/ui/components/lists/GroupList";
import { navigateTo } from "@econnessione/ui/utils/links.utils";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import React from "react";

export default class GroupsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
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
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ pageContent, groups: { data: groups } }) => (
            <MainContent>
              <PageContent {...pageContent} />
              <SearchableInput
                label="Gruppi"
                items={groups.map((a) => ({
                  ...a,
                  selected: true,
                }))}
                getValue={(v) => v.name}
                selectedItems={[]}
                onSelectItem={async (item) => {
                  if (this.props.navigate !== undefined) {
                    await navigateTo(this.props.navigate, "groups", item);
                  }
                }}
                onUnselectItem={() => {}}
                renderOption={(item, state) => (
                  <GroupListItem
                    item={item}
                    onClick={async (item: any) => {
                      if (this.props.navigate !== undefined) {
                        await navigateTo(this.props.navigate, "groups", item);
                      }
                    }}
                  />
                )}
              />
              <GroupList
                groups={groups.map((a) => ({
                  ...a,
                  selected: false,
                }))}
                onGroupClick={async (g) => {
                  await this.props.navigate?.(`/groups/${g.id}`);
                }}
              />
            </MainContent>
          )
        )}
      />
    );
  }
}
