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

export const ActorDataGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMuiMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Datagrid
      rowClick="edit"
      rowSx={(r) => getBorderLeftStyle(toColorHash(r.color))}
      sx={{
        [theme.breakpoints.down("sm")]: {
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
                <TextField source="fullName" />
                <TextField source="username" />
              </Box>
            </Box>
          );
        }}
      />
      <FunctionField
        label="Groups"
        render={(r) => r.memberIn.length}
        sx={{ display: { xs: "none", sm: "table-cell" } }}
      />
      <DateField
        source="updatedAt"
        showTime={false}
        sx={{ display: { xs: "none", sm: "table-cell" } }}
      />
    </Datagrid>
  );
};
