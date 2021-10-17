import { eqByUUID } from "@econnessione/shared/helpers/event";
import { Keyword } from "@econnessione/shared/io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { throttle } from "throttle-debounce";
import { Queries } from "../providers/DataProvider";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";
import SearchableInput from "./SearchableInput";
import KeywordList, { KeywordListItem } from "./lists/KeywordList";

interface AutocompleteKeywordInputProps {
  items: Keyword.Keyword[];
  selectedItems: Keyword.Keyword[];
  onItemClick: (item: Keyword.Keyword) => void;
}

export const AutocompleteKeywordInput: React.FC<AutocompleteKeywordInputProps> =
  ({ items, selectedItems, onItemClick }) => {
    const [search, setSearch] = React.useState<string | undefined>(undefined);
    const setSearchThrottled = throttle(300, setSearch);
    return (
      <WithQueries
        queries={{ keywords: Queries.Keyword.getList }}
        params={{
          keywords: {
            sort: { field: "createdAt", order: "DESC" },
            pagination: { page: 1, perPage: 20 },
            filter: {
              search,
            },
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({ keywords: { data: keywords } }) => {
            return (
              <SearchableInput<Keyword.Keyword>
                placeholder="Keyword..."
                label="Keywords"
                items={items}
                getValue={(t) => t.tag}
                selectedItems={selectedItems}
                disablePortal={true}
                multiple={true}
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
                      selected: selectedItems.some((t) =>
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
