import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin";


export const ScientificStudyEventTitle: React.FC<FieldProps> = ({ record: _record }) => {
  const record = useRecordContext({ record: _record });
  return <span>Scientific Study: {record?.payload?.title}</span>;
};
