import get from "lodash/get";
import { useRecordContext } from "ra-core";
import { FieldProps, ReferenceField } from "ra-ui-materialui";
import * as React from "react";
import { AvatarField } from "./AvatarField";

interface ReferenceBySubjectFieldProps extends FieldProps {
  source: string;
}

export const ReferenceBySubjectField: React.FC<ReferenceBySubjectFieldProps> = (
  props
) => {
  const record = useRecordContext(props);
  const src = get(record, `${props.source}.type`);

  if (src === "Actor") {
    return (
      <ReferenceField
        reference="actors"
        {...props}
        source={`${props.source}.id`}
      >
        <AvatarField source="avatar" />
      </ReferenceField>
    );
  }

  if (src === "Group") {
    return (
      <ReferenceField
        reference="groups"
        {...props}
        source={`${props.source}.id`}
      >
        <AvatarField source="avatar" />
      </ReferenceField>
    );
  }
  return <div>Not set</div>;
};
