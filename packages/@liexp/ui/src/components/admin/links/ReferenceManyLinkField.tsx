import React from "react";
import {
  ReferenceManyField,
  type RaRecord,
  type ReferenceManyFieldProps,
} from "react-admin";
import { LinkDataGrid } from "./LinkDataGrid.js";

const ReferenceManyLinksField: React.FC<
  Omit<ReferenceManyFieldProps<RaRecord<string>>, "reference" | "children">
> = ({ queryOptions, ...props }) => {
  return (
    <ReferenceManyField
      {...props}
      reference="links"
      filter={{ withDrafts: true, ...props.filter }}
    >
      <LinkDataGrid />
    </ReferenceManyField>
  );
};

export default ReferenceManyLinksField;
