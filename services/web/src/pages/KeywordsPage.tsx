import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import SearchableInput from "@econnessione/ui/components/SearchableInput";
import { KeywordListItem } from "@econnessione/ui/components/lists/KeywordList";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import { navigateTo } from "@econnessione/ui/utils/links.utils";
import { Keyword } from "@io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { doUpdateCurrentView } from "utils/location.utils";

export default class KewyordsPage extends React.PureComponent {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          pageContent: pageContentByPath,
          keywords: Queries.Keyword.getList,
        }}
        params={{
          pageContent: {
            path: "topics",
          },
          keywords: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ pageContent, keywords: { data: keywords } }) => (
            <>
              <SEO title={pageContent.title} />
              <MainContent>
                <PageContent {...pageContent} />
                <SearchableInput<Keyword.Keyword & { selected: boolean }>
                  label="keywords"
                  items={[].map((t: any) => ({
                    ...t.frontmatter,
                    selected: false,
                  }))}
                  getValue={(t) => t.tag}
                  selectedItems={[]}
                  renderOption={(item, state) => (
                    <KeywordListItem
                      item={item}
                      onClick={async (keyword) => {
                        void doUpdateCurrentView({
                          view: "keyword",
                          keywordId: keyword.id,
                        })();
                      }}
                    />
                  )}
                  onSelectItem={async (item) => {
                    void doUpdateCurrentView({
                      view: "keyword",
                      keywordId: item.id,
                    })();
                  }}
                  onUnselectItem={() => {}}
                />
              </MainContent>
            </>
          )
        )}
      />
    );
  }
}
