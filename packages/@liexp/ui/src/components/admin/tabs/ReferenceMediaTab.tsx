import get from "lodash/get";
import * as React from "react";
import {
  useRecordContext,
  type RaRecord,
  type ReferenceFieldProps,
} from "react-admin";
import { Box } from "../../mui/index.js";
import { ReferenceMediaDataGrid } from "../media/ReferenceMediaDataGrid.js";
import { MediaArrayInput } from "../media/input/MediaArrayInput.js";
import ReferenceArrayMediaInput from "../media/input/ReferenceArrayMediaInput.js";

export const ReferenceMediaTab: React.FC<
  Omit<ReferenceFieldProps<RaRecord<string>>, "reference"> & {
    exclude?: string[];
  }
> = ({ source, exclude, queryOptions, ...props }) => {
  const record = useRecordContext();
  const mediaSource = source ?? "media";
  const currentMedia = get(record, mediaSource);
  const newMediaSource =
    source?.split(".").slice(0, -1).concat("newMedia").join(".") ?? "newMedia";
  const newMediaSourceRef = newMediaSource.concat("Ref");

  return (
    <Box style={{ width: "100%" }}>
      <ReferenceArrayMediaInput
        {...props}
        label="Select media"
        source={newMediaSourceRef}
        exclude={currentMedia}
      />
      <MediaArrayInput
        {...props}
        label="media"
        source={newMediaSource}
        fullWidth={true}
        defaultValue={[]}
      />

      <ReferenceArrayMediaInput
        {...props}
        label="Select media"
        source={mediaSource}
      />

      <ReferenceMediaDataGrid {...props} source={mediaSource} />
    </Box>
  );
};
