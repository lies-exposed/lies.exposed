import type * as SocialPost from "@liexp/shared/lib/io/http/SocialPost.js";
import * as React from "react";
import { Grid, Stack } from "../../mui/index.js";
import { emptySharePayload } from "../Modal/ShareModal.js";
import { ShareModalContent } from "../Modal/ShareModalContent.js";
import {
  LoadingIndicator,
  useInput,
  useRecordContext,
} from "../react-admin.js";
import { SocialPostPreview } from "./SocialPostPreview.js";

export const SocialPostEditContent: React.FC<{
  source: string;
  onChange?: (r: SocialPost.CreateSocialPost) => void;
}> = ({ source, onChange }) => {
  const record = useRecordContext<SocialPost.SocialPost>();

  const { field } = useInput({
    source,
    onChange,
    defaultValue: record ?? {},
    parse: (v) => v,
  });

  if (!record) {
    return <LoadingIndicator />;
  }

  const media = Array.isArray(record.media)
    ? record.media
    : [
        {
          type: "photo",
          media: record.media,
          thumbnail: record.media,
        },
      ];

  const post = {
    ...emptySharePayload,
    ...field.value,
    media,
  };

  if (!record) {
    return <LoadingIndicator />;
  }

  return (
    <Stack>
      <Grid container width="100%" direction="row" size={12}>
        <Grid size={{ lg: 8, md: 6 }}>
          <div style={{ width: "100%" }}>
            <ShareModalContent
              post={post}
              multipleMedia={false}
              media={media}
              onChange={({ payload, media }) => {
                field.onChange({ ...record, ...payload, media });
              }}
            />
          </div>
        </Grid>
        <Grid size={{ lg: 4, md: "auto" }}>
          <SocialPostPreview record={post} />
        </Grid>
      </Grid>
    </Stack>
  );
};
