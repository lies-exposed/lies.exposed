import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin.js";

export const UncategorizedEventTitle: React.FC<FieldProps> = ({
  record: _record,
}) => {
  const record = useRecordContext({ record: _record });
  return <span>Event: {record?.payload?.title}</span>;
};
