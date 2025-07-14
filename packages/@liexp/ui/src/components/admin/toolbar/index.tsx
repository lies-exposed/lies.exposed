import * as React from "react";
import { Stack } from "../../mui/index.js";
import {
  DeleteWithConfirmButton,
  DeleteButton,
  SaveButton,
  useRecordContext,
} from "../react-admin.js";

export const EditToolbar: React.FC = () => {
  const record = useRecordContext();
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      padding={2}
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
