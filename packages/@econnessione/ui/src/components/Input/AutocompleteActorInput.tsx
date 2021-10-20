import { eqByUUID } from "@econnessione/shared/helpers/event";
import { Actor } from "@econnessione/shared/io/http";
import { available, queryShallow } from "avenger";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { throttle } from "throttle-debounce";
import { Queries } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyFullSizeLoader } from "../Common/FullSizeLoader";
import SearchableInput from "./SearchableInput";
import { ActorList, ActorListItem } from "@components/lists/ActorList";

interface AutocompleteActorInputProps {
  selectedIds: string[];
  onItemClick: (item: Actor.Actor) => void;
}

export const AutocompleteActorInput: React.FC<AutocompleteActorInputProps> = ({
  selectedIds,
  onItemClick,
}) => {
  const [search, setSearch] = React.useState<string | undefined>(undefined);
  const setSearchThrottled = throttle(300, setSearch);
  return (
    <WithQueries
      queries={{
        actors: Queries.Actor.getList,
        selectedActors:
          selectedIds.length > 0
            ? Queries.Actor.getList
            : queryShallow(() => TE.right({ data: [], total: 0 }), available),
      }}
      params={{
        actors: {
          sort: { field: "createdAt", order: "DESC" },
          pagination: { page: 1, perPage: 20 },
          filter: {
            fullName: search,
          },
        },
        selectedActors: {
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
          actors: { data: items },
          selectedActors: { data: selectedActors },
        }) => {
          return (
            <SearchableInput<Actor.Actor>
              placeholder="Actor..."
              label="Actors..."
              items={items}
              getValue={(t) => t.fullName}
              selectedItems={selectedActors}
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
                    selected: selectedActors.some((t) =>
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
