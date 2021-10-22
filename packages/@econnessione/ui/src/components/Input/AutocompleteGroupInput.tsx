import { eqByUUID } from "@econnessione/shared/helpers/event";
import { Group } from "@econnessione/shared/io/http";
import { available, queryStrict } from "avenger";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { debounce } from "throttle-debounce";
import { APIError, Queries } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyFullSizeLoader } from "../Common/FullSizeLoader";
import GroupList, { GroupListItem } from "../lists/GroupList";
import SearchableInput from "./SearchableInput";

interface AutocompleteGroupInputProps {
  selectedIds: string[];
  onItemClick: (item: Group.Group) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedIds,
  onItemClick,
}) => {
  const [search, setSearch] = React.useState<string | undefined>(undefined);
  const setSearchThrottled = debounce(300, false, setSearch);

  const selectedGroupsQuery = React.useMemo(
    () =>
      selectedIds.length > 0
        ? Queries.Group.getList
        : queryStrict<APIError, any, { data: Group.Group[]; total: number }>(
            () => TE.right({ data: [], total: 0 }),
            available
          ),
    [selectedIds.length]
  );

  return (
    <WithQueries
      queries={{
        groups: Queries.Group.getList,
        selectedGroups: selectedGroupsQuery,
      }}
      params={{
        groups: {
          sort: { field: "createdAt", order: "DESC" },
          pagination: { page: 1, perPage: 20 },
          filter: {
            search,
          },
        },
        selectedGroups: {
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
          groups: { data: items },
          selectedGroups: { data: selectedGroups },
        }) => {
          return (
            <SearchableInput<Group.Group>
              placeholder="Group..."
              label="Groups"
              items={items}
              getValue={(t) => t.name}
              selectedItems={selectedGroups.filter((g) =>
                selectedIds.includes(g.id)
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
                <GroupList
                  groups={items.map((i) => ({
                    ...i,
                    selected: true,
                  }))}
                  onGroupClick={(k) => onItemClick(k)}
                />
              )}
              renderOption={(item, state) => (
                <GroupListItem
                  key={item.id}
                  item={{
                    ...item,
                    selected: selectedGroups.some((t) =>
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
