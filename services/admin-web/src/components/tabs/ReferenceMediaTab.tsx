import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import { FieldProps } from "react-admin";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import { ReferenceMediaDataGrid } from "../Common/ReferenceMediaDataGrid";

export const ReferenceMediaTab: React.FC<FieldProps> = (props) => {
  const newMediaSource = props.source
    .split(".")
    .slice(0, -1)
    .concat("newMedia")
    .join(".");

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
