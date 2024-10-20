import { type http } from "@liexp/shared/lib/io/index.js";
import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin.js";

export const DeathEventTitle: React.FC<FieldProps<http.Events.Death.Death>> = ({
  record: _record,
}) => {
  const record = useRecordContext({ record: _record });
  return (
    <span>
      Event: {record?.payload?.victim} on {record?.date.toString()}
    </span>
  );
};
