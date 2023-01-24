import * as React from "react";
import {
  Datagrid,
  DateField,
  type FieldProps,
  ReferenceArrayField,
  TextField,
  useRecordContext,
} from "react-admin";
import { Box } from "../../mui";
import ReferenceArrayGroupInput from "../common/ReferenceArrayGroupInput";

export const ReferenceGroupsTab: React.FC<FieldProps> = (props) => {
  const record = useRecordContext();
  const newSource =
    props.source?.split(".").slice(0, -1).concat("newGroups").join(".") ??
    "newGroups";

  return (
    <Box>
      <ReferenceArrayGroupInput {...props} record={record} source={newSource} />

      <ReferenceArrayField {...props} reference="groups">
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="group.name" />
          <DateField source="startDate" />
          <DateField source="endDate" defaultValue={undefined} />
        </Datagrid>
      </ReferenceArrayField>
    </Box>
  );
};
