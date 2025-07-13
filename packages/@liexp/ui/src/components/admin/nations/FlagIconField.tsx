import { get } from "lodash";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { FlagIcon } from "../../Common/Icons/FlagIcon.js";
import type { FieldProps } from "../react-admin.js";

export const FlagIconField: React.FC<FieldProps> = ({ source }) => {
  const record = useRecordContext();
  const isoCode = get(record, source);
  return <FlagIcon isoCode={isoCode} />;
};
