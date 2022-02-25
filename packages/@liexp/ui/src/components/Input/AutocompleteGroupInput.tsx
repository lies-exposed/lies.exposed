import { Group } from "@liexp/shared/io/http";
import { available, queryStrict } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { GetListParams } from "react-admin";
import { Queries } from "../../providers/DataProvider";
import GroupList, { GroupListItem } from "../lists/GroupList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupInputProps {
  className?: string;
  selectedItems: Group.Group[];
  onChange: (item: Group.Group[]) => void;
}

export const AutocompleteGroupInput: React.FC<AutocompleteGroupInputProps> = ({
  selectedItems,
  onChange,
  ...props
}) => {
  return (
    <AutocompleteInput<Group.Group>
      placeholder="Groups..."
      getValue={(a) => a.name}
      searchToFilter={(name) => ({ name })}
      selectedItems={selectedItems}
      query={queryStrict(
        (input: GetListParams) =>
          input.filter.fullName !== ""
            ? Queries.Group.getList.run(input)
            : TE.right({ data: [], total: 0 }),
        available
      )}
      renderTags={(items) => (
        <GroupList
          groups={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(g) => onChange(items.filter((i) => i.id !== g.id))}
        />
      )}
      renderOption={(item, state) => (
        <GroupListItem
          key={item.id}
          displayName
          item={{
            ...item,
            selected: selectedItems.some((i) => i.id === item.id),
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
