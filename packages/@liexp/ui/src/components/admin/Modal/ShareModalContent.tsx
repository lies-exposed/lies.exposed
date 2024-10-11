import { getShareMedia } from "@liexp/shared/lib/helpers/event/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { type CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import {
  contentTypeFromFileExt,
  fileExtFromContentType,
} from "@liexp/shared/lib/utils/media.utils.js";
import kebabCase from "lodash/kebabCase.js";
import * as React from "react";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { TabPanel, a11yProps } from "../../Common/TabPanel.js";
import { ActorList } from "../../lists/ActorList.js";
import GroupList from "../../lists/GroupList.js";
import KeywordList from "../../lists/KeywordList.js";
import { MediaList } from "../../lists/MediaList.js";
import {
  Box,
  FormControlLabel,
  Grid,
  Input,
  Link,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "../../mui/index.js";
import { OpenAIPromptButton } from "../media/OpenAIIngestButton.js";
import { BuildImageButton } from "../media/button/BuildImageButton.js";

export interface ShareModalContentProps {
  post: CreateSocialPost;
  multipleMedia: boolean;
  media: Media.Media[];
  onChange: (p: {
    payload: CreateSocialPost;
    multipleMedia: boolean;
    media: Media.Media[];
  }) => void;
}

export const ShareModalContent: React.FC<ShareModalContentProps> = ({
  post: payload,
  multipleMedia,
  media,
  onChange,
}) => {
  const [tab, setTab] = React.useState(0);
  const conf = useConfiguration();

  const aiPromptValue = [payload.title]
    .concat(payload.content ?? "")
    .filter((s) => s !== "")
    .join("\n");

  return (
    <Grid container width="100%" height="100%" spacing={2}>
      <Grid item lg={6}>
        <Box>
          <Box>
            <Input
              fullWidth
              multiline
              name="title"
              value={payload.title ?? ""}
              onChange={(e) => {
                onChange({
                  multipleMedia,
                  media,
                  payload: {
                    ...payload,
                    title: e.target.value,
                  },
                });
              }}
            />
          </Box>

          <Box>
            <Input
              fullWidth
              multiline
              name="content"
              value={payload.content ?? ""}
              onChange={(e) => {
                onChange({
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
          <Box>
            {aiPromptValue ? (
              <OpenAIPromptButton
                value={aiPromptValue}
                getUserMessage={(m) =>
                  `Rephrase the following text in maximum 500 chars, considering it will be posted on a social platform: ${m}`
                }
                onRequest={() => {}}
                onResponse={(r) => {
                  const reply = r.choices[0].message.content;
                  if (reply) {
                    onChange({
                      multipleMedia,
                      media,
                      payload: {
                        ...payload,
                        content: reply,
                      },
                    });
                  }
                }}
              />
            ) : null}
          </Box>

          <Tabs
            value={tab}
            onChange={(_, tab) => {
              setTab(tab);
            }}
          >
            <Tab label={"Post"} {...a11yProps(0)} />
            <Tab label={"Meme"} {...a11yProps(1)} />
          </Tabs>
          <TabPanel index={0} value={tab}>
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
              {multipleMedia ? (
                <MediaList
                  style={{ width: "100%", height: 200 }}
                  itemStyle={{ width: "auto", margin: "auto", height: "100%" }}
                  columns={media.length > 3 ? 3 : media.length}
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
                      onChange({
                        multipleMedia: !multipleMedia,
                        media,
                        payload: {
                          ...payload,
                          media: getShareMedia(
                            media,
                            `${conf.platforms.web.url}/liexp-logo-1200x630.png`,
                          ),
                        },
                      });
                    }}
                  />
                }
                label={multipleMedia ? "Media group" : "Single media"}
              />
            </Box>
          </TabPanel>
          <TabPanel index={1} value={tab}>
            <Box>
              <BuildImageButton
                media={media[0].thumbnail ?? conf.platforms.web.defaultImage}
                text={payload.content ?? payload.title}
                onBuild={(_, base64Source) => {
                  onChange({
                    payload: {
                      ...payload,
                      media: [
                        {
                          media: base64Source,
                          thumbnail: base64Source,
                          type: "photo",
                        },
                      ],
                    },
                    multipleMedia,
                    media,
                  });
                }}
              />
            </Box>
          </TabPanel>

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
                    onChange({
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
                    onChange({
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
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  inputProps={{
                    "aria-label": "Post on Telegram",
                  }}
                  value={payload.schedule !== undefined}
                  checked={payload.schedule !== undefined}
                  onChange={() => {
                    onChange({
                      multipleMedia,
                      media,
                      payload: {
                        ...payload,
                        schedule: payload.schedule ? undefined : 0,
                      },
                    });
                  }}
                />
              }
              label={"Schedule (+ hours from now)"}
            />
            {payload.schedule !== undefined ? (
              <Input
                fullWidth
                multiline
                name="schedule"
                value={payload.schedule ?? ""}
                onChange={(e) => {
                  if (e.target.value !== "") {
                    onChange({
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
            ) : null}
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  inputProps={{
                    "aria-label": "Use Reply",
                  }}
                  value={payload.useReply}
                  checked={payload.useReply}
                  onChange={() => {
                    onChange({
                      multipleMedia,
                      media,
                      payload: {
                        ...payload,
                        useReply: !payload.useReply,
                      },
                    });
                  }}
                />
              }
              label={"Use Reply?"}
            />
          </Box>
        </Box>
      </Grid>
      {/** Preview */}
      <Grid item lg={6}>
        <Box>
          <MediaList
            style={{ width: "100%", maxHeight: 300 }}
            itemStyle={{ maxHeight: 300 }}
            columns={payload.media.length > 3 ? 3 : media.length}
            media={payload.media.map((m) => ({
              id: uuid(),
              creator: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
              events: [],
              links: [],
              keywords: [],
              areas: [],
              featuredInStories: [],
              socialPosts: undefined,
              deletedAt: undefined,
              label: m.media,
              description: m.type,
              thumbnail: m.thumbnail,
              location: m.thumbnail,
              selected: true,
              type: contentTypeFromFileExt(m.media),
              extra: undefined,
            }))}
            onItemClick={(m) => {
              if (ImageType.is(m.type)) {
                const downloadLink = document.createElement("a");
                downloadLink.href = m.location;
                downloadLink.download = `${kebabCase(
                  payload.title.substring(0, 150),
                )}.${fileExtFromContentType(m.type)}`;
                downloadLink.click();
                downloadLink.remove();
              }
            }}
          />
          <Box>
            <Typography>
              <Link href={payload.url}>{payload.title}</Link>
            </Typography>
          </Box>

          {payload.content ? (
            <Box>
              <Typography>{payload.content}</Typography>
            </Box>
          ) : null}

          {payload?.date ? (
            <Box style={{ width: "100%" }}>
              <Typography>
                <Link
                  href={`${conf.platforms.web.url}/events?startDate=${payload.date}`}
                >
                  {payload.date}
                </Link>
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Grid>
    </Grid>
  );
};
