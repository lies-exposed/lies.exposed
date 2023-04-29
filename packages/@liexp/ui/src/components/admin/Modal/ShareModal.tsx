import { getShareMedia } from "@liexp/shared/lib/helpers/event";
import { type Media } from "@liexp/shared/lib/io/http";
import {
  type ShareMessageBody,
  type SharePlatform,
} from "@liexp/shared/lib/io/http/ShareMessage";
import * as React from "react";
import { type Identifier, useDataProvider } from "react-admin";
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
  platforms?: SharePlatform[];
  multipleMedia?: boolean;
  onPost?: (b: ShareMessageBody) => void;
  onClose?: () => void;
  payload?: Partial<ShareMessageBody>;
  media: Media.Media[];
}

export const emptySharePayload: ShareMessageBody = {
  title: undefined,
  date: undefined,
  media: [],
  content: undefined,
  url: undefined,
  keywords: [],
  platforms: { IG: true, TG: true },
} as any;

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
    payload: ShareMessageBody;
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
                  setState((s) => ({
                    ...s,
                    multipleMedia: !multipleMedia,
                    payload: {
                      ...s.payload,
                      media: getShareMedia(
                        s.media,
                        `${process.env.WEB_URL}/liexp-logo-1200x630.png`,
                        !multipleMedia
                      ),
                    },
                  }));
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
              setState((s) => ({
                ...s,
                payload: {
                  ...payload,
                  content: e.target.value,
                },
              }));
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
                  setState((s) => ({
                    ...s,
                    payload: {
                      ...s.payload,
                      platforms: {
                        ...s.payload.platforms,
                        IG: !s.payload.platforms.IG,
                      },
                    },
                  }));
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
                  setState((s) => ({
                    ...s,
                    payload: {
                      ...s.payload,
                      platforms: {
                        ...s.payload.platforms,
                        TG: !s.payload.platforms.TG,
                      },
                    },
                  }));
                }}
              />
            }
            label={"Telegram"}
          />
        </Box>
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
