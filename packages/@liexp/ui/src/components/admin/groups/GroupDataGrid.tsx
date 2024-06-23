import * as React from "react";
import { Box } from "../../mui/index.js";
import { AvatarField } from "../common/AvatarField.js";
import { Datagrid, DateField, FunctionField, TextField } from "../react-admin";

export const GroupDataGrid: React.FC = () => {
  return (
    <Datagrid
      rowClick="edit"
      rowSx={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <FunctionField
        source="username"
        render={(r: any) => {
          return (
            <Box style={{ display: "flex" }}>
              <AvatarField source="avatar" />
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
        render={(r: any) => {
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
