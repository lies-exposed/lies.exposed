import {
  type CreateSocialPost,
  type SocialPlatform,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useDataProvider, type Identifier } from "react-admin";
import { styled } from "../../../theme/index.js";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../mui/index.js";
import { ShareModalContent } from "./ShareModalContent.js";

interface ShareModalProps {
  id: Identifier;
  type: string;
  open: boolean;
  platforms?: SocialPlatform[];
  multipleMedia?: boolean;
  onPost?: (b: CreateSocialPost) => void;
  onClose?: () => void;
  payload?: Partial<CreateSocialPost>;
  media: readonly Media.Media[];
}

export const emptySharePayload: CreateSocialPost = {
  title: "",
  date: new Date().toISOString(),
  media: [],
  content: undefined,
  url: undefined,
  keywords: [],
  platforms: { IG: true, TG: true },
  schedule: undefined,
  useReply: false,
  actors: [],
  groups: [],
};

const classes = {
  paper: `share-modal-paper`,
};

const StyledDialog = styled(Dialog)(() => ({
  [`.${classes.paper}`]: {
    height: "100%",
  },
}));

export const ShareModal: React.FC<ShareModalProps> = ({
  id,
  type,
  open,
  platforms: _platforms,
  multipleMedia: _multipleMedia = false,
  payload: _payload,
  media: _media = [],
  onClose,
  onPost,
}) => {
  const dataProvider = useDataProvider();

  const [{ payload, multipleMedia, media }, setState] = React.useState<{
    payload: CreateSocialPost;
    media: readonly Media.Media[];
    multipleMedia: boolean;
  }>({
    multipleMedia: _multipleMedia,
    payload: { ...emptySharePayload, ..._payload },
    media: _media,
  });

  const handlePost = React.useCallback(() => {
    if (onPost) {
      onPost(payload);
      return;
    }

    void dataProvider
      .create(`/social-posts/${type}/${id}`, {
        data: payload,
      })
      .then(() => {
        setState({
          multipleMedia: false,
          payload: emptySharePayload,
          media: [],
        });
        onClose?.();
      });
  }, [onPost, onClose, payload, media, multipleMedia]);

  return (
    <StyledDialog
      classes={{
        paper: classes.paper,
      }}
      fullWidth
      open={open}
      maxWidth="lg"
    >
      <DialogTitle>Post on Telegram</DialogTitle>

      <DialogContent>
        <ShareModalContent
          post={payload}
          media={media}
          multipleMedia={multipleMedia}
          onChange={(p) => {
            setState((s) => ({
              ...s,
              ...p,
            }));
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setState((s) => ({ ...s, payload: emptySharePayload }));
            onClose?.();
          }}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            handlePost();
          }}
        >
          Post
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
