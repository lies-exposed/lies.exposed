import * as React from "react";
import {
  Datagrid,
  DateField,
  ReferenceArrayField,
  TextField,
  useRecordContext,
  type ReferenceFieldProps,
  type RaRecord,
} from "react-admin";
import { Box } from "../../mui/index.js";
import ReferenceArrayGroupInput from "../groups/ReferenceArrayGroupInput.js";

export const ReferenceGroupsTab: React.FC<
  ReferenceFieldProps<RaRecord<string>>
> = ({ queryOptions, ...props }) => {
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
