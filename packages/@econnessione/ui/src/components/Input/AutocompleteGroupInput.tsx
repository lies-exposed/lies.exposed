import { eqByUUID } from "@econnessione/shared/helpers/event";
import { Group } from "@econnessione/shared/io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { throttle } from "throttle-debounce";
import { Queries } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyFullSizeLoader } from "../Common/FullSizeLoader";
import GroupList, { GroupListItem } from "../lists/GroupList";
import SearchableInput from "./SearchableInput";

interface AutocompleteGroupInputProps {
  selectedItems: Group.Group[];
  onItemClick: (item: Group.Group) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedItems,
  onItemClick,
}) => {
  const [search, setSearch] = React.useState<string | undefined>(undefined);
  const setSearchThrottled = throttle(300, setSearch);
  return (
    <WithQueries
      queries={{ groups: Queries.Group.getList }}
      params={{
        groups: {
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
        ({ groups: { data: items } }) => {
          return (
            <SearchableInput<Group.Group>
              placeholder="Group..."
              label="Groups"
              items={items}
              getValue={(t) => t.name}
              selectedItems={selectedItems}
              disablePortal={true}
              multiple={true}
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
