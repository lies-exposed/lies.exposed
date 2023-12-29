import { type GroupMember } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import {
  GroupMemberListItem,
  GroupsMembersList,
} from "../lists/GroupMemberList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupMemberInputProps {
  className?: string;
  selectedItems: GroupMember.GroupMember[];
  onItemClick: (item: GroupMember.GroupMember[]) => void;
}

export const AutocompleteGroupMemberInput: React.FC<
  AutocompleteGroupMemberInputProps
> = ({ selectedItems, onItemClick, ...props }) => {
  const Queries = useEndpointQueries();
  return (
    <AutocompleteInput<GroupMember.GroupMember>
      placeholder="Group Member..."
      searchToFilter={(tag) => ({ tag })}
      selectedItems={selectedItems}
      getOptionLabel={(k) =>
        typeof k === "string" ? k : `${k.group.name} - ${k.actor.fullName}`
      }
      query={(p) => Queries.GroupMember.list.useQuery(p, undefined, true)}
      renderTags={(items) => (
        <GroupsMembersList
          groupsMembers={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(k) => {
            onItemClick(items.filter((i) => i.id !== k.id));
          }}
        />
      )}
      renderOption={(props, item, state) => (
        <GroupMemberListItem
          key={item.id}
          item={{
            ...item,
            selected: selectedItems.some((i) => i.id === item.id),
          }}
          onClick={() => {}}
        />
      )}
      onItemsChange={onItemClick}
      {...props}
    />
  );
};
