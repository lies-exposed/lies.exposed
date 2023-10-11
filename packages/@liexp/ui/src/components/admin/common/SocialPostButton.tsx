import { getShareMedia } from "@liexp/shared/lib/helpers/event";
import { type Media } from "@liexp/shared/lib/io/http";
import { type CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost";
import * as React from "react";
import {
  useRecordContext,
  type FieldProps,
  type Identifier,
} from "react-admin";
import { Box, Button } from "../../mui";
import { ShareModal, emptySharePayload } from "../Modal/ShareModal";

interface OnLoadSharePayloadClickOpts {
  multipleMedia: boolean;
}
export interface SocialPostButtonProps extends FieldProps {
  id?: Identifier;
  onLoadSharePayloadClick: (opts: OnLoadSharePayloadClickOpts) => Promise<
    Omit<CreateSocialPost, "media"> & {
      media: Media.Media[];
    }
  >;
}

export const SocialPostButton: React.FC<SocialPostButtonProps> = ({
  onLoadSharePayloadClick,
}) => {
  const record = useRecordContext();

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
            setState((s) => ({
              ...s,
              media: result.media,
              payload: {
                ...result,
                media: getShareMedia(
                  result.media,
                  `${process.env.WEB_URL}/liexp-logo-1200x630.png`,
                ),
              },
            }));
          });
        }}
      >
        Post on Social
      </Button>
      {payload?.title ? (
        <ShareModal
          id={record.id}
          open={!!payload.title}
          type="events"
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
