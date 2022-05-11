import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";
import React from "react";

const ReferenceArrayGroupMemberInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput
      {...props}
      reference="groups-members"
      filterToQuery={(ids: string[]) => ({
        groupsMembers: ids,
      })}
    >
      <AutocompleteArrayInput
        source="id"
        optionText={(r: any) => {
          return r?.actor && r?.group
            ? `${r.actor.fullName} ${r.group.name}`
            : "No group members";
        }}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupMemberInput;
