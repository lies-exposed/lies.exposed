import { getShareMedia } from "@liexp/shared/lib/helpers/event";
import { type Media } from "@liexp/shared/lib/io/http";
import {
  type SocialPlatform,
  type SocialPost,
} from "@liexp/shared/lib/io/http/SocialPost";
import * as React from "react";
import { useDataProvider, type Identifier } from "react-admin";
import { ActorList } from "../../lists/ActorList";
import GroupList from "../../lists/GroupList";
import KeywordList from "../../lists/KeywordList";
import { MediaList } from "../../lists/MediaList";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Input,
  Link,
  Switch,
  Typography,
} from "../../mui";

interface ShareModalProps {
  id: Identifier;
  type: string;
  open: boolean;
  platforms?: SocialPlatform[];
  multipleMedia?: boolean;
  onPost?: (b: SocialPost) => void;
  onClose?: () => void;
  payload?: Partial<SocialPost>;
  media: Media.Media[];
}

export const emptySharePayload: SocialPost = {
  title: undefined,
  date: undefined,
  media: [],
  content: undefined,
  url: undefined,
  keywords: [],
  platforms: { IG: true, TG: true },
} as any;

interface ShareModalContentProps {
  post: SocialPost;
  multipleMedia: boolean;
  media: Media.Media[];
  onChange: (p: {
    payload: SocialPost;
    multipleMedia: boolean;
    media: Media.Media[];
  }) => void;
}
export const ShareModalContent: React.FC<ShareModalContentProps> = ({
  post: payload,
  multipleMedia,
  media,
  onChange: setState,
}) => {
  return (
    <Box>
      <Box>
        <Typography>
          <Link href={payload.url}>{payload.title}</Link>
        </Typography>
      </Box>

      {payload?.date ? (
        <Box style={{ width: "100%" }}>
          <Typography>
            <Link
              href={`${process.env.WEB_URL}/events?startDate=${payload.date}`}
            >
              {payload.date}
            </Link>
          </Typography>
        </Box>
      ) : null}

      <Box>
        {multipleMedia ? (
          <MediaList
            style={{ width: "100%", height: 200 }}
            itemStyle={{ height: 200 }}
            columns={media.length > 3 ? 3 : media.length}
            hideDescription
            media={media.map((m) => ({ ...m, selected: true }))}
            onItemClick={() => {}}
          />
        ) : media[0] ? (
          <Box style={{ width: "100%", height: 200 }}>
            <img
              src={media[0].thumbnail}
              style={{ width: "auto", margin: "auto", height: "100%" }}
            />
          </Box>
        ) : null}
        <FormControlLabel
          control={
            <Switch
              size="small"
              inputProps={{
                "aria-label": "Group media",
              }}
              value={multipleMedia}
              onChange={() => {
                setState({
                  multipleMedia: !multipleMedia,
                  media,
                  payload: {
                    ...payload,
                    media: getShareMedia(
                      media,
                      `${process.env.WEB_URL}/liexp-logo-1200x630.png`,
                      !multipleMedia
                    ),
                  },
                });
              }}
            />
          }
          label={multipleMedia ? "Media group" : "Single media"}
        />
      </Box>

      <Box>
        <Input
          fullWidth
          multiline
          name="content"
          value={payload.content ?? ""}
          onChange={(e) => {
            setState({
              multipleMedia,
              media,
              payload: {
                ...payload,
                content: e.target.value,
              },
            });
          }}
        />
      </Box>

      <Box style={{ display: "flex", flexWrap: "wrap" }}>
        <ActorList
          actors={(payload?.actors ?? []).map((a) => ({
            ...a,
            selected: true,
          }))}
          onActorClick={() => {}}
        />
      </Box>

      <Box style={{ display: "flex", flexWrap: "wrap" }}>
        <GroupList
          groups={(payload?.groups ?? []).map((g) => ({
            ...g,
            selected: true,
          }))}
          onItemClick={() => {}}
        />
      </Box>

      <Box style={{ display: "flex", flexWrap: "wrap", padding: 16 }}>
        <KeywordList
          keywords={(payload.keywords ?? []).map((k) => ({
            ...k,
            selected: true,
          }))}
          onItemClick={() => {}}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2">Post on</Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              inputProps={{
                "aria-label": "Post on Instagram",
              }}
              value={payload.platforms.IG}
              checked={payload.platforms.IG}
              onChange={() => {
                setState({
                  multipleMedia,
                  media,
                  payload: {
                    ...payload,
                    platforms: {
                      ...payload.platforms,
                      IG: !payload.platforms.IG,
                    },
                  },
                });
              }}
            />
          }
          label={"Instagram"}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              inputProps={{
                "aria-label": "Post on Telegram",
              }}
              value={payload.platforms.TG}
              checked={payload.platforms.TG}
              onChange={() => {
                setState({
                  multipleMedia,
                  media,
                  payload: {
                    ...payload,
                    platforms: {
                      ...payload.platforms,
                      TG: !payload.platforms.TG,
                    },
                  },
                });
              }}
            />
          }
          label={"Telegram"}
        />
      </Box>
      <Box>
        <Input
          fullWidth
          multiline
          name="schedule"
          value={payload.schedule ?? ""}
          onChange={(e) => {
            if (e.target.value !== "") {
              setState({
                multipleMedia,
                media,
                payload: {
                  ...payload,
                  schedule: parseInt(e.target.value, 10),
                },
              });
            }
          }}
        />
      </Box>
    </Box>
  );
};

export const ShareModal: React.FC<ShareModalProps> = ({
  id,
  type,
  open,
  platforms: _platforms,
  multipleMedia: _multipleMedia = false,
  payload: _payload,
  media: _media = [],
  onClose,
  onPost
}) => {
  const dataProvider = useDataProvider();

  const [{ payload, multipleMedia, media }, setState] = React.useState<{
    payload: SocialPost;
    media: Media.Media[];
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
      .create(`/admins/share/${type}/${id}`, {
        data: payload,
      })
      .then((result) => {
        setState({
          multipleMedia: false,
          payload: emptySharePayload,
          media: [],
        });
        onClose?.();
      });
  }, [onPost, onClose, payload, media, multipleMedia]);

  return (
    <Dialog open={open}>
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
    </Dialog>
  );
};
