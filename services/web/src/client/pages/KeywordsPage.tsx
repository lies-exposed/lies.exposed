import { Keyword } from "@liexp/shared/io/http";
import SearchableInput from "@liexp/ui/components/Input/SearchableInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { KeywordListItem } from "@liexp/ui/components/lists/KeywordList";
import { useKeywordsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordsPage: React.FC = () => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      {/* <PageContent queries={{ pageContent: { path: "keywords" } }} /> */}
      <QueriesRenderer
        queries={{
          keywords: useKeywordsQuery({
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          }, false),
        }}
        render={({ keywords: { data: keywords } }) => (
          <>
            <SearchableInput<Keyword.Keyword & { selected: boolean }>
              label="keywords"
              items={keywords.map((k) => ({
                ...k,
                selected: false,
              }))}
              getValue={(t) => (typeof t === "string" ? t : t.tag)}
              selectedItems={[]}
              renderOption={(props, item, state) => (
                <KeywordListItem
                  item={item}
                  onClick={(keyword) => {
                    // navigateTo.keywords({ id: keyword.id });
                  }}
                />
              )}
              onSelectItem={(item) => {
                navigateTo.keywords({ id: item.id });
              }}
              onUnselectItem={() => {}}
            />
          </>
        )}
      />
    </MainContent>
  );
};

export default KeywordsPage;
