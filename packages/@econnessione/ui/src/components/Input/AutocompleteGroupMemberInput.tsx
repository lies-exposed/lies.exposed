import { GroupMember } from "@econnessione/shared/io/http";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import {
  GroupMemberListItem,
  GroupsMembersList,
} from "../lists/GroupMemberList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteGroupMemberInputProps {
  selectedIds: string[];
  onItemClick: (item: GroupMember.GroupMember[]) => void;
}

export const AutocompleteGroupMemberInput: React.FC<
  AutocompleteGroupMemberInputProps
> = ({ selectedIds, onItemClick }) => {
  return (
    <AutocompleteInput<GroupMember.GroupMember>
      placeholder="Group Member..."
      searchToFilter={(tag) => ({ tag })}
      selectedIds={selectedIds}
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
            selected: selectedIds.includes(item.id),
          }}
          onClick={() => {}}
        />
      )}
      onItemsChange={onItemClick}
    />
  );
};
