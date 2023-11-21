import * as React from "react";
import { useRecordContext } from "react-admin";


export const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Link {record?.title}</span>;
};
