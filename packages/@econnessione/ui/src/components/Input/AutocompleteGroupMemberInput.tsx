import { GroupMember } from "@econnessione/shared/io/http";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import {
  GroupMemberListItem,
  GroupsMembersList,
} from "../lists/GroupMemberList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupMemberInputProps {
  selectedItems: GroupMember.GroupMember[];
  onItemClick: (item: GroupMember.GroupMember[]) => void;
}

export const AutocompleteGroupMemberInput: React.FC<
  AutocompleteGroupMemberInputProps
> = ({ selectedItems, onItemClick }) => {
  return (
    <AutocompleteInput<GroupMember.GroupMember>
      placeholder="Group Member..."
      searchToFilter={(tag) => ({ tag })}
      selectedItems={selectedItems}
      getValue={(k) => `${k.group.name} - ${k.actor.fullName}`}
      query={Queries.GroupMember.getList}
      renderTags={(items) => (
        <GroupsMembersList
          groupsMembers={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onItemClick={(k) => onItemClick(items.filter((i) => i.id !== k.id))}
        />
      )}
      renderOption={(item, state) => (
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
    />
  );
};
