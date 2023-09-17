import { type http } from '@liexp/shared/lib/io';
import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin";


export const PatentEventTitle: React.FC<FieldProps<http.Events.Patent.Patent>> = ({ record: _record}) => {
  const record = useRecordContext({ record: _record });
  return record ? (
    <span>{`Event: ${record.payload?.title} on ${record.date}`}</span>
  ) : null;
};
