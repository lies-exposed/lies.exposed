import type * as SocialPost from "@liexp/shared/lib/io/http/SocialPost";
import * as React from "react";
import { emptySharePayload } from "../Modal/ShareModal";
import { ShareModalContent } from "../Modal/ShareModalContent";
import { useInput, useRecordContext } from "../react-admin";

export const SocialPostEditContent: React.FC<{
  source: string;
  onChange?: (r: SocialPost.CreateSocialPost) => void;
}> = ({ source, onChange }) => {
  const record: any = useRecordContext();
  const field = useInput({
    source,
    onChange,
    defaultValue: record?.content ?? {},
  });

  const media = Array.isArray(record.content?.media)
    ? record.content.media
    : [
        {
          type: "photo",
          media: record.content?.media,
          thumbnail: record.content?.media,
        },
      ];

  return record ? (
    <ShareModalContent
      post={{
        ...emptySharePayload,
        ...field.field.value,
        media,
      }}
      multipleMedia={false}
      media={media}
      onChange={({ payload: record }) => {
        field.field.onChange(record);
      }}
    />
  ) : null;
};
