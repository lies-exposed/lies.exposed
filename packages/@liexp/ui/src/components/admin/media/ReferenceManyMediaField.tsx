import React from "react";
import {
  ReferenceManyField,
  type RaRecord,
  type ReferenceManyFieldProps,
} from "react-admin";
import { MediaDataGrid } from "./MediaList";

const ReferenceManyMediaField: React.FC<
  Omit<ReferenceManyFieldProps<RaRecord<string>>, "reference" | "children">
> = (props) => {
  return (
    <ReferenceManyField
      {...props}
      reference="media"
      filter={{ withDrafts: true, ...props.filter }}
    >
      <MediaDataGrid />
    </ReferenceManyField>
  );
};

export default ReferenceManyMediaField;
