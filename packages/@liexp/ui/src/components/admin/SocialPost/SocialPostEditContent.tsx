import type * as SocialPost from "@liexp/shared/lib/io/http/SocialPost.js";
import * as React from "react";
import { emptySharePayload } from "../Modal/ShareModal.js";
import { ShareModalContent } from "../Modal/ShareModalContent.js";
import {
  LoadingIndicator,
  useInput,
  useRecordContext,
} from "../react-admin.js";

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

  return record ? (
    <ShareModalContent
      post={post}
      multipleMedia={false}
      media={media}
      onChange={({ payload, media }) => {
        field.onChange({ ...record, ...payload, media });
      }}
    />
  ) : null;
};
