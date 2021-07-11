import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import SearchableInput from "@econnessione/shared/components/SearchableInput";
import { TopicListItem } from "@econnessione/shared/components/lists/TopicList";
import { TopicFrontmatter } from "@econnessione/shared/io/http/Topic";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/shared/providers/DataProvider";
import { navigateTo } from "@econnessione/shared/utils/links";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import React from "react";

export default class TopicsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          pageContent: pageContentByPath,
        }}
        params={{
          pageContent: {
            path: "topics",
          },
          // topics: {
          //   pagination: { page: 1, perPage: 20 },
          //   sort: { field: "id", order: "ASC" },
          //   filter: {},
          // },
        }}
        render={QR.fold(Loader, ErrorBox, ({ pageContent }) => (
          <>
            <SEO title={pageContent.title} />
            <MainContent>
              <PageContent {...pageContent} />
              <SearchableInput<TopicFrontmatter & { selected: boolean }>
                label="topics"
                items={[].map((t: any) => ({
                  ...t.frontmatter,
                  selected: false,
                }))}
                getValue={(t) => t.slug}
                selectedItems={[]}
                renderOption={(item, state) => (
                  <TopicListItem
                    item={item}
                    onClick={async (t: any) => {
                      if (this.props.navigate !== undefined) {
                        await navigateTo(this.props.navigate, "topics", t);
                      }
                    }}
                  />
                )}
                onSelectItem={async (item) => {
                  if (this.props.navigate !== undefined) {
                    await navigateTo(this.props.navigate, "topics", item);
                  }
                }}
                onUnselectItem={() => {}}
              />
            </MainContent>
          </>
        ))}
      />
    );
  }
}
