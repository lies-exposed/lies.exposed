import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type SocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import {
  contentTypeFromFileExt,
  fileExtFromContentType,
} from "@liexp/shared/lib/utils/media.utils.js";
import { Schema } from "effect";
import { kebabCase } from "lodash";
import * as React from "react";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { MediaList } from "../../lists/MediaList.js";
import { Box, Link, Stack, Typography } from "../../mui/index.js";
import { useRecordContext } from "../react-admin.js";

export const SocialPostPreview: React.FC<{ record?: SocialPost }> = ({
  record: _record,
}) => {
  const record = _record ?? useRecordContext<SocialPost>();
  const conf = useConfiguration();

  if (!record) {
    return null;
  }

  return (
    <Stack>
      <MediaList
        style={{ width: "100%", maxWidth: 400 }}
        itemStyle={{ maxHeight: 200, maxWidth: 400 }}
        columns={record.media.length > 3 ? 3 : record.media.length}
        media={record.media.map((m) => ({
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
          thumbnail: m.thumbnail as URL,
          location: m.thumbnail as URL,
          selected: true,
          type: contentTypeFromFileExt(m.media),
          extra: undefined,
        }))}
        onItemClick={(m) => {
          if (Schema.is(ImageType)(m.type)) {
            const downloadLink = document.createElement("a");
            downloadLink.href = m.location;
            downloadLink.download = `${kebabCase(
              record.title.substring(0, 150),
            )}.${fileExtFromContentType(m.type)}`;
            downloadLink.click();
            downloadLink.remove();
          }
        }}
      />
      <Box>
        <Typography>
          <Link href={record.url}>{record.title}</Link>
        </Typography>
      </Box>

      {record.content ? (
        <Box>
          <Typography>{record.content}</Typography>
        </Box>
      ) : null}

      {record?.date ? (
        <Box style={{ width: "100%" }}>
          <Typography>
            <Link
              href={`${conf.platforms.web.url}/events?startDate=${record.date}`}
            >
              {record.date}
            </Link>
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
};
