import {
  Datagrid,
  ReferenceArrayField,
  ReferenceArrayFieldProps,
  TextField,
} from "ra-ui-materialui";
import * as React from "react";
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
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <MediaField source="thumbnail" fullWidth={false} />
        <TextField source="description" />
      </Datagrid>
    </ReferenceArrayField>
  );
};
