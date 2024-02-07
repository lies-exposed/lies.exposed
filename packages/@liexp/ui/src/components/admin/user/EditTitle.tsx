import * as React from "react";
import { useRecordContext } from "../react-admin.js";

export const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>user {record?.fullName}</span>;
};
