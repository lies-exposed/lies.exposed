import { getShareMedia } from "@liexp/shared/lib/helpers/event/index.js";
import {
  type SocialPostResourceType,
  type CreateSocialPost,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import {
  useRecordContext,
  type FieldProps,
  type Identifier,
} from "react-admin";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { Box, Button } from "../../mui/index.js";
import { ShareModal, emptySharePayload } from "../Modal/ShareModal.js";

interface OnLoadSharePayloadClickOpts {
  multipleMedia: boolean;
}

export interface SocialPostButtonProps extends Omit<FieldProps, 'source'> {
  id?: Identifier;
  type: SocialPostResourceType;
  onLoadSharePayloadClick: (opts: OnLoadSharePayloadClickOpts) => Promise<
    Omit<CreateSocialPost, "media"> & {
      media: Media.Media[];
    }
  >;
}

export const SocialPostButton: React.FC<SocialPostButtonProps> = ({
  type,
  onLoadSharePayloadClick,
}) => {
  const record = useRecordContext();
  const conf = useConfiguration();

  const [{ payload, media, multipleMedia }, setState] = React.useState<{
    payload: CreateSocialPost | undefined;
    multipleMedia: boolean;
    media: Media.Media[];
  }>({ payload: emptySharePayload, multipleMedia: false, media: [] });

  return (
    <Box style={{ display: "flex", marginRight: 10 }}>
      <Button
        color="secondary"
        variant="contained"
        size="small"
        onClick={() => {
          void onLoadSharePayloadClick({ multipleMedia }).then((result) => {
            const shareMedia = getShareMedia(
              result.media,
              `${conf.platforms.web.url}/liexp-logo-1200x630.png`,
            );

            setState((s) => ({
              ...s,
              media: result.media,
              payload: {
                ...result,
                media: shareMedia,
              },
            }));
          });
        }}
      >
        Post on Social
      </Button>
      {payload?.title && record?.id ? (
        <ShareModal
          id={record.id}
          open={!!payload.title}
          type={type}
          payload={payload}
          media={media}
          multipleMedia={multipleMedia}
          onClose={() => {
            setState({
              media: [],
              multipleMedia: false,
              payload: undefined,
            });
          }}
        />
      ) : null}
    </Box>
  );
};
