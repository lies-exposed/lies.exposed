import { Keyword } from "@liexp/shared/io/http";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
import SearchableInput from "@liexp/ui/components/Input/SearchableInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { KeywordListItem } from "@liexp/ui/components/lists/KeywordList";
import { Queries } from "@liexp/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordsPage: React.FC = () => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      {/* <PageContent queries={{ pageContent: { path: "keywords" } }} /> */}
      <WithQueries
        queries={{
          keywords: Queries.Keyword.getList,
        }}
        params={{
          keywords: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ keywords: { data: keywords } }) => (
            <>
              <SearchableInput<Keyword.Keyword & { selected: boolean }>
                label="keywords"
                items={keywords.map((k) => ({
                  ...k,
                  selected: false,
                }))}
                getValue={(t) => t.tag}
                selectedItems={[]}
                renderOption={(item, state) => (
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
          )
        )}
      />
    </MainContent>
  );
};

export default KeywordsPage;
