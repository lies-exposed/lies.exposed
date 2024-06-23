import * as React from "react";
import { Box } from "../../mui/index.js";
import { AvatarField } from "../common/AvatarField.js";
import { Datagrid, DateField, FunctionField, TextField } from "../react-admin";

export const ActorDataGrid: React.FC = () => {
  return (
    <Datagrid
      rowClick="edit"
      rowSx={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <FunctionField
        source="username"
        render={() => {
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
                <TextField source="fullName" />
                <TextField source="username" />
              </Box>
            </Box>
          );
        }}
      />
      <FunctionField label="Groups" render={(r: any) => r.memberIn.length} />
      <DateField source="updatedAt" showTime={true} />
    </Datagrid>
  );
};
