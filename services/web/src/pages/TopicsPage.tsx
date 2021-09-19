import { TopicFrontmatter } from "@econnessione/shared/io/http/Topic";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import SearchableInput from "@econnessione/ui/components/SearchableInput";
import { TopicListItem } from "@econnessione/ui/components/lists/TopicList";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import { navigateTo } from "@econnessione/ui/utils/links.utils";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";

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
