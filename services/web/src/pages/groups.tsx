import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SearchableInput from "@econnessione/shared/components/SearchableInput";
import { GroupListItem } from "@econnessione/shared/components/lists/GroupList";
import { navigateTo } from "@econnessione/shared/utils/links";
import { groupsList, pageContentByPath } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import React from "react";

export default class GroupsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          groups: groupsList,
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
                items={groups.map((a) => ({
                  ...a,
                  selected: true,
                }))}
                selectedItems={[]}
                getValue={(g) => g.name}
                onSelectItem={async (item) => {
                  if (this.props.navigate !== undefined) {
                    await navigateTo(this.props.navigate, "groups", item);
                  }
                }}
                onUnselectItem={() => {}}
                itemRenderer={(item, props, index) => (
                  <GroupListItem
                    item={item}
                    index={index}
                    avatarScale="scale1600"
                    onClick={async (item: any) => {
                      if (this.props.navigate !== undefined) {
                        await navigateTo(this.props.navigate, "groups", item);
                      }
                    }}
                  />
                )}
              />
            </MainContent>
          )
        )}
      />
    );
  }
}
