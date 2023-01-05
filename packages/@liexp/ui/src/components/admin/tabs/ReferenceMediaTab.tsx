import * as React from "react";
import { FieldProps } from "react-admin";
import { Box } from "../../mui";
import { MediaArrayInput } from "../media/MediaArrayInput";
import { ReferenceMediaDataGrid } from "../media/ReferenceMediaDataGrid";

export const ReferenceMediaTab: React.FC<FieldProps> = (props) => {
  const newMediaSource =
    props.source?.split(".").slice(0, -1).concat("newMedia").join(".") ??
    "newMedia";

  return (
    <Box style={{ width: "100%" }}>
      <MediaArrayInput
        label="media"
        source={newMediaSource}
        fullWidth={true}
        defaultValue={[]}
      />

      <ReferenceMediaDataGrid {...props} />
    </Box>
  );
};
