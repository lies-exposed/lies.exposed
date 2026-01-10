import { type MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import get from "lodash/get";
import * as React from "react";
import { Box, Stack } from "../../../mui/index.js";
import {
  ImageField,
  ImageInput,
  useRecordContext,
  type ReferenceInputProps,
} from "../../react-admin.js";
import { MediaField } from "../MediaField.js";
import ReferenceMediaInput from "./ReferenceMediaInput.js";

export interface ReferenceMediaInputWithUploadProps extends Omit<
  ReferenceInputProps,
  "children"
> {
  source: string;
  uploadSource?: string;
  label?: string;
  uploadLabel?: string;
  showPreview?: boolean;
  fullWidth?: boolean;
  allowedTypes?: MediaType[];
}

/**
 * A combined input that allows both:
 * - Selecting an existing media from the database
 * - Uploading a new media file
 *
 * @param source - The source for the existing media reference (e.g., "avatar.id")
 * @param uploadSource - The source for the new upload field (defaults to "newUpload")
 * @param label - Label for the reference input
 * @param uploadLabel - Label for the upload input (defaults to "Upload new")
 * @param showPreview - Whether to show a preview of the current media (defaults to true)
 * @param fullWidth - Whether the input should span the full available width
 * @param allowedTypes - List of allowed media types that can be selected
 */
export const ReferenceMediaInputWithUpload: React.FC<
  ReferenceMediaInputWithUploadProps
> = ({
  source,
  uploadSource,
  label,
  uploadLabel = "Upload new",
  showPreview = true,
  fullWidth,
  allowedTypes,
  ...props
}) => {
  const record = useRecordContext();

  // Derive thumbnail source from the reference source
  // e.g., "avatar.id" -> "avatar.thumbnail" for preview
  const thumbnailSource = source.replace(/\.id$/, ".thumbnail");

  // Default upload source based on the main source
  // e.g., "avatar.id" -> "newAvatarUpload"
  const defaultUploadSource =
    source
      .replace(/\.id$/, "")
      .split(".")
      .map((part, i) =>
        i === 0 ? `new${part.charAt(0).toUpperCase()}${part.slice(1)}` : part,
      )
      .join("") + "Upload";

  const actualUploadSource = uploadSource ?? defaultUploadSource;

  const currentMedia = get(record, source.replace(/\.id$/, ""));

  return (
    <Stack spacing={2} width={fullWidth ? "100%" : undefined}>
      {showPreview && currentMedia && (
        <Box>
          <MediaField
            source={thumbnailSource}
            type="image/jpeg"
            controls={false}
          />
        </Box>
      )}

      <ReferenceMediaInput
        {...props}
        source={source}
        label={label}
        fullWidth={fullWidth}
        allowedTypes={allowedTypes}
      />

      <ImageInput source={actualUploadSource} label={uploadLabel}>
        <ImageField source="src" />
      </ImageInput>
    </Stack>
  );
};
