import { Box } from "@mui/material";
import * as React from "react";
import { FieldProps, useRecordContext } from "react-admin";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import { ReferenceMediaDataGrid } from "../Common/ReferenceMediaDataGrid";

export const ReferenceMediaTab: React.FC<FieldProps> = (props) => {
  const record = useRecordContext();
  const newMediaSource = props.source
    .split(".")
    .slice(0, -1)
    .concat("newMedia")
    .join(".");

  return (
    <Box>
      <MediaArrayInput
        {...{ record }}
        label="media"
        source={newMediaSource}
        fullWidth={true}
        defaultValue={[]}
      />

      <ReferenceMediaDataGrid {...props} record={record} />
    </Box>
  );
};
