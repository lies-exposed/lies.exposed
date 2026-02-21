import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import { useTheme } from "../../../theme/index.js";
import { getBorderLeftStyle } from "../../../utils/style.utils.js";
import { Box, useMuiMediaQuery } from "../../mui/index.js";
import { AvatarField } from "../common/AvatarField.js";
import {
  Datagrid,
  DateField,
  FunctionField,
  TextField,
} from "../react-admin.js";

export const GroupDataGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMuiMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Datagrid
      rowClick="edit"
      rowSx={(r) => getBorderLeftStyle(toColorHash(r.color))}
      sx={{
        "@media (max-width: 600px)": {
          "& .MuiDataGrid-cell": {
            padding: "8px 4px",
            minHeight: "100px",
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
        },
      }}
    >
      <FunctionField
        source="username"
        render={() => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: isMobile ? 1 : 2,
                minWidth: 0,
              }}
            >
              <AvatarField source="avatar.thumbnail" />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: isMobile ? "120px" : "0px",
                  overflow: "hidden",
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
