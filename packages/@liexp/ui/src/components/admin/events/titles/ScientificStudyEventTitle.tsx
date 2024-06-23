import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin.js";

export const ScientificStudyEventTitle: React.FC<Omit<FieldProps, 'source'>> = ({
  record: _record,
}) => {
  const record = useRecordContext({ record: _record });
  return <span>Scientific Study: {record?.payload?.title}</span>;
};
