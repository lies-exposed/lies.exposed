import * as React from "react";
import {
  AutocompleteArrayInput,
  ReferenceArrayInput,
  type ReferenceArrayInputProps,
} from "react-admin";

const ReferenceArrayGroupMemberInput: React.FC<
  Omit<ReferenceArrayInputProps, "children" | "reference"> & { source: string }
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
        fullWidth
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export default ReferenceArrayGroupMemberInput;
