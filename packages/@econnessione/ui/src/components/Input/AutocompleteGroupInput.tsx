import { Group } from "@econnessione/shared/io/http";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import GroupList, { GroupListItem } from "../lists/GroupList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupInputProps {
  selectedIds: string[];
  onChange: (item: Group.Group[]) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedIds,
  onChange,
}) => {
  return (
    <AutocompleteInput<Group.Group>
      placeholder="Groups..."
      getValue={(a) => a.name}
      searchToFilter={(name) => ({ name })}
      selectedIds={selectedIds}
      query={Queries.Group.getList}
      renderTags={(items) => (
        <GroupList
          groups={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onGroupClick={(g) => onChange(items.filter((i) => i.id !== g.id))}
        />
      )}
      renderOption={(item, state) => (
        <GroupListItem
          key={item.id}
          displayName
          item={{
            ...item,
            selected: selectedIds.includes(item.id),
          }}
        />
      )}
      onItemsChange={onChange}
    />
  );
};
