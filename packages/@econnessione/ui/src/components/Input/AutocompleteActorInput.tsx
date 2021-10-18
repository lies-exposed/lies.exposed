import { eqByUUID } from "@econnessione/shared/helpers/event";
import { Actor } from "@econnessione/shared/io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { throttle } from "throttle-debounce";
import { Queries } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyFullSizeLoader } from "../Common/FullSizeLoader";
import SearchableInput from "./SearchableInput";
import { ActorList, ActorListItem } from "@components/lists/ActorList";

interface AutocompleteActorInputProps {
  selectedItems: Actor.Actor[];
  onItemClick: (item: Actor.Actor) => void;
}

export const AutocompleteActorInput: React.FC<AutocompleteActorInputProps> = ({
  selectedItems,
  onItemClick,
}) => {
  const [search, setSearch] = React.useState<string | undefined>(undefined);
  const setSearchThrottled = throttle(300, setSearch);
  return (
    <WithQueries
      queries={{ actors: Queries.Actor.getList }}
      params={{
        actors: {
          sort: { field: "createdAt", order: "DESC" },
          pagination: { page: 1, perPage: 20 },
          filter: {
            fullName: search,
          },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ actors: { data: items } }) => {
          return (
            <SearchableInput<Actor.Actor>
              placeholder="Actor..."
              label="Actors..."
              items={items}
              getValue={(t) => t.fullName}
              selectedItems={selectedItems}
              disablePortal={true}
              multiple={true}
              onTextChange={(v) => {
                if (v.length >= 3) {
                  setSearchThrottled(v);
                }
              }}
              renderTags={(items) => (
                <ActorList
                  actors={items.map((i) => ({
                    ...i,
                    selected: true,
                  }))}
                  onActorClick={onItemClick}
                />
              )}
              renderOption={(item, state) => (
                <ActorListItem
                  key={item.id}
                  item={{
                    ...item,
                    selected: selectedItems.some((t) =>
                      eqByUUID.equals(t, item)
                    ),
                  }}
                  onClick={onItemClick}
                />
              )}
              onSelectItem={(item) => onItemClick(item)}
              onUnselectItem={(item) => onItemClick(item)}
            />
          );
        }
      )}
    />
  );
};
