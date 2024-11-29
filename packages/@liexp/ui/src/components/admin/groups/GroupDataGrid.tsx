import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import { getBorderLeftStyle } from "../../../utils/style.utils.js";
import { Box } from "../../mui/index.js";
import { AvatarField } from "../common/AvatarField.js";
import {
  Datagrid,
  DateField,
  FunctionField,
  TextField,
} from "../react-admin.js";

export const GroupDataGrid: React.FC = () => {
  return (
    <Datagrid
      rowClick="edit"
      rowSx={(r) => getBorderLeftStyle(toColorHash(r.color))}
    >
      <FunctionField
        source="username"
        render={() => {
          return (
            <Box style={{ display: "flex" }}>
              <AvatarField source="avatar.thumbnail" />
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: 16,
                }}
              >
                <TextField source="name" />
                <TextField source="username" />
              </Box>
            </Box>
          );
        }}
      />
      <FunctionField
        source="members"
        render={(r) => {
          return r.members?.length ?? 0;
        }}
      />
      <DateField source="startDate" />
      <DateField source="endDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};
