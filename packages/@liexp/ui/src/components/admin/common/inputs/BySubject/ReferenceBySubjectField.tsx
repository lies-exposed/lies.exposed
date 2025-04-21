import { ByActor, ByGroup } from "@liexp/shared/lib/io/http/Common/index.js";
import { Schema } from "effect";
import get from "lodash/get.js";
import * as React from "react";
import { ReferenceField, useRecordContext, type FieldProps } from "react-admin";
import { AvatarField } from "../../AvatarField.js";

interface ReferenceBySubjectFieldProps extends Omit<FieldProps, "source"> {
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
  const sourceAvatar = "avatar.thumbnail";

  if (Schema.is(ByActor.fields.type)(sourceType)) {
    return (
      <ReferenceField {...props} reference="actors" source={sourceId}>
        <AvatarField source={sourceAvatar} />
      </ReferenceField>
    );
  }

  if (Schema.is(ByGroup.fields.type)(sourceType)) {
    return (
      <ReferenceField {...props} reference="groups" source={sourceId}>
        <AvatarField source={sourceAvatar} />
      </ReferenceField>
    );
  }
  return <div>Not set</div>;
};
