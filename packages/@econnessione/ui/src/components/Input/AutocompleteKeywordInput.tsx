import { eqByUUID } from "@econnessione/shared/helpers/event";
import { Keyword } from "@econnessione/shared/io/http";
import { available, queryShallow } from "avenger";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { throttle } from "throttle-debounce";
import { APIError, Queries } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyFullSizeLoader } from "../Common/FullSizeLoader";
import KeywordList, { KeywordListItem } from "../lists/KeywordList";
import SearchableInput from "./SearchableInput";

interface AutocompleteKeywordInputProps {
  selectedIds: string[];
  onItemClick: (item: Keyword.Keyword) => void;
}

export const AutocompleteKeywordInput: React.FC<AutocompleteKeywordInputProps> =
  ({ selectedIds, onItemClick }) => {
    const [search, setSearch] = React.useState<string | undefined>(undefined);
    const setSearchThrottled = throttle(300, setSearch);
    const selectedKeywordQuery = React.useMemo(
      () =>
        selectedIds.length > 0
          ? Queries.Keyword.getList
          : queryShallow<
              APIError,
              any,
              { data: Keyword.Keyword[]; total: number }
            >(
              () =>
                TE.right({
                  data: [],
                  total: 0,
                }),
              available
            ),
      [selectedIds.length]
    );
    return (
      <WithQueries
        queries={{
          keywords: Queries.Keyword.getList,
          selectedKeywords: selectedKeywordQuery,
        }}
        params={{
          keywords: {
            sort: { field: "createdAt", order: "DESC" },
            pagination: { page: 1, perPage: 20 },
            filter: {
              search,
            },
          },
          selectedKeywords: {
            sort: { field: "createdAt", order: "DESC" },
            pagination: { page: 1, perPage: 20 },
            filter: {
              ids: selectedIds,
            },
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({
            keywords: { data: keywords },
            selectedKeywords: { data: selectedKeywords },
          }) => {
            return (
              <SearchableInput<Keyword.Keyword>
                placeholder="Keyword..."
                label="Keywords"
                items={keywords}
                getValue={(t) => t.tag}
                selectedItems={selectedKeywords.filter((k) =>
                  selectedIds.includes(k.id)
                )}
                disablePortal={true}
                multiple={true}
                getOptionSelected={(op, value) => op.id === value.id}
                onTextChange={(v) => {
                  if (v.length >= 3) {
                    setSearchThrottled(v);
                  }
                }}
                renderTags={(items) => (
                  <KeywordList
                    keywords={items.map((i) => ({
                      ...i,
                      selected: true,
                    }))}
                    onItemClick={(k) => onItemClick(k)}
                  />
                )}
                renderOption={(item, state) => (
                  <KeywordListItem
                    key={item.id}
                    item={{
                      ...item,
                      selected: selectedKeywords.some((t) =>
                        eqByUUID.equals(t, item)
                      ),
                    }}
                    onClick={(k) => onItemClick(k)}
                  />
                )}
                onSelectItem={(item, items) => {
                  onItemClick(item);
                }}
                onUnselectItem={(item) => onItemClick(item)}
              />
            );
          }
        )}
      />
    );
  };
