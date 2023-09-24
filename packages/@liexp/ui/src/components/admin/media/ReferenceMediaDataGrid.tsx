import * as React from "react";
import {
  Datagrid,
  ReferenceArrayField,
  type ReferenceArrayFieldProps,
  TextField,
  type RaRecord,
} from "react-admin";
import { MediaField } from "./MediaField";

export const ReferenceMediaDataGrid: React.FC<
  Omit<ReferenceArrayFieldProps<RaRecord<string>>, "children" | "reference">
> = (props) => {
  return (
    <ReferenceArrayField<RaRecord<string>>
      {...props}
      source={props.source ?? "media"}
      reference="media"
      sortBy="updatedAt"
      sortByOrder="DESC"
      fullWidth={true}
    >
      <Datagrid rowClick="edit" width="100%">
        <TextField source="id" />
        <MediaField source="thumbnail" controls={false} />
        <TextField source="description" />
      </Datagrid>
    </ReferenceArrayField>
  );
};
