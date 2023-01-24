import * as React from "react";
import {
  Datagrid,
  ReferenceArrayField,
  type ReferenceArrayFieldProps,
  TextField,
} from "react-admin";
import { MediaField } from "./MediaField";

export const ReferenceMediaDataGrid: React.FC<
  Omit<ReferenceArrayFieldProps, "children" | "reference">
> = (props) => {
  return (
    <ReferenceArrayField
      {...props}
      reference="media"
      sortBy="updatedAt"
      sortByOrder="DESC"
      fullWidth={true}
    >
      <Datagrid rowClick="edit" width="100%">
        <TextField source="id" />
        <MediaField source="thumbnail" fullWidth={false} />
        <TextField source="description" />
      </Datagrid>
    </ReferenceArrayField>
  );
};
