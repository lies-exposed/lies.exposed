import React from "react";
import {
  ReferenceManyField,
  type RaRecord,
  type ReferenceManyFieldProps,
} from "react-admin";
import { MediaDataGrid } from "./MediaList.js";

export const ReferenceManyMediaField: React.FC<
  Omit<
    ReferenceManyFieldProps<RaRecord<string>>,
    "reference" | "children" | "target" | 'queryOptions'
  > & {
    target?: string;
  }
> = (props) => {
  return (
    <ReferenceManyField
      target={"id"}
      {...props}
      reference="media"
      filter={{ withDrafts: true, ...props.filter }}
    >
      <MediaDataGrid />
    </ReferenceManyField>
  );
};
