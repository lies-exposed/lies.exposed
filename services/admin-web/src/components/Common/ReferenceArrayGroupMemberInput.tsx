import React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayGroupMemberInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} reference="groups-members">
      <AutocompleteArrayInput
        source="id"
        optionText={(r: any) => {
          return r?.actor && r?.group
            ? `${r.actor.fullName} ${r.group.name}`
            : "No group members";
        }}
        filterToQuery={(ids) => ({
          groupsMembers: ids,
        })}
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupMemberInput;
