import { get } from "lodash";
import * as React from "react";
import { type RaRecord, type ReferenceFieldProps, useRecordContext } from "react-admin";
import { Box } from "../../mui";
import { ReferenceMediaDataGrid } from "../media/ReferenceMediaDataGrid";
import { MediaArrayInput } from "../media/input/MediaArrayInput";
import ReferenceArrayMediaInput from "../media/input/ReferenceArrayMediaInput";

export const ReferenceMediaTab: React.FC<
  Omit<ReferenceFieldProps<RaRecord<string>>, 'reference'> & { exclude?: string[] }
> = ({ source, exclude, ...props }) => {
  const record = useRecordContext();
  const currentMedia = get(record, source ?? "media");
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

      <ReferenceMediaDataGrid {...props} source={source} />
    </Box>
  );
};
