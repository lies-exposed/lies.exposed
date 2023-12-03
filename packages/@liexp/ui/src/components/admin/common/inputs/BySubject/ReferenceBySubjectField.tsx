import { ByActor, ByGroup } from "@liexp/shared/lib/io/http/Common";
import get from "lodash/get";
import * as React from "react";
import { ReferenceField, useRecordContext, type FieldProps } from "react-admin";
import { AvatarField } from "../../AvatarField";

interface ReferenceBySubjectFieldProps extends FieldProps {
  source?: string;
}

export const ReferenceBySubjectField: React.FC<
  ReferenceBySubjectFieldProps
> = ({ source, record: _record, ...props }) => {
  const record = _record ?? useRecordContext({ ...props, source });

  const sourceType = source
    ? get(record, `${source}.type`)
    : get(record, "type");
  const sourceId = source ? `${source}.id` : "id";
  const sourceAvatar = "avatar";

  if (ByActor.type.props.type.is(sourceType)) {
    return (
      <ReferenceField {...props} reference="actors" source={sourceId}>
        <AvatarField source={sourceAvatar} />
      </ReferenceField>
    );
  }

  if (ByGroup.type.props.type.is(sourceType)) {
    return (
      <ReferenceField {...props} reference="groups" source={sourceId}>
        <AvatarField source={sourceAvatar} />
      </ReferenceField>
    );
  }
  return <div>Not set</div>;
};
