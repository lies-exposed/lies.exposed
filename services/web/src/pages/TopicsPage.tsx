import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { MainContent } from "@components/MainContent";
import { PageContent } from "@components/PageContent";
import SEO from "@components/SEO";
import SearchableInput from "@components/SearchableInput";
import { TopicListItem } from "@components/lists/TopicList";
import { pageContentByPath, topicsList } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import theme from "@theme/CustomeTheme";
import { navigateTo } from "@utils/links";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import React from "react";

export default class TopicsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          pageContent: pageContentByPath,
          topics: topicsList,
        }}
        params={{
          pageContent: {
            path: "topics",
          },
          topics: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(Loader, ErrorBox, ({ pageContent, topics: { data: topics } }) => (
          <>
            <SEO title={pageContent.title} />
            <MainContent>
              <PageContent {...pageContent} />
              <SearchableInput
                items={topics.map((t) => ({
                  ...t.frontmatter,
                  selected: false,
                }))}
                selectedItems={[]}
                getValue={(t) => t.label}
                itemRenderer={(item, props, index) => (
                  <TopicListItem
                    item={item}
                    index={index}
                    $theme={theme}
                    onClick={async (t) => {
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
