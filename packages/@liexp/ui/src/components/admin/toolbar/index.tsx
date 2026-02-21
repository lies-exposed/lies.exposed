import * as React from "react";
import { useTheme } from "../../../theme/index.js";
import { Stack, useMuiMediaQuery } from "../../mui/index.js";
import {
  DeleteWithConfirmButton,
  DeleteButton,
  SaveButton,
  useRecordContext,
} from "../react-admin.js";

export const EditToolbar: React.FC = () => {
  const record = useRecordContext();
  const theme = useTheme();
  const isMobile = useMuiMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      justifyContent="space-between"
      spacing={isMobile ? 1 : 2}
      padding={isMobile ? 1 : 2}
      sx={{
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      <SaveButton />
      {record?.id ? (
        record?.deletedAt ? (
          <DeleteWithConfirmButton record={{ id: record.id }} />
        ) : (
          <DeleteButton record={{ id: record.id }} />
        )
      ) : null}
    </Stack>
  );
};
