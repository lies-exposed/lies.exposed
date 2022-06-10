import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import {
  Datagrid,
  DateField,
  FieldProps,
  ReferenceArrayField,
  TextField,
  useRecordContext
} from "react-admin";
import ReferenceArrayGroupInput from "../Common/ReferenceArrayGroupInput";

export const ReferenceGroupsTab: React.FC<FieldProps> = (props) => {
  const record = useRecordContext();
  const newSource = props.source
    .split(".")
    .slice(0, -1)
    .concat("newGroups")
    .join(".");

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
