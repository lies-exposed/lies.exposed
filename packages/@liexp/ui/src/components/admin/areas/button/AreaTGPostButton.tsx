import { type Area, type Media } from "@liexp/shared/lib/io/http/index.js";
import { getTextContentsCapped } from "@liexp/shared/lib/slate/index.js";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { CircularProgress } from "../../../mui/index.js";
import { SocialPostButton } from "../../common/SocialPostButton.js";

export const AreaTGPostButton: React.FC = () => {
  const record = useRecordContext<Area.Area>();
  const apiProvider = useDataProvider();

  if (!record) {
    return <CircularProgress />;
  }

  return (
    <SocialPostButton
      type="areas"
      onLoadSharePayloadClick={async () => {
        const url = `${process.env.VITE_WEB_URL}/media/${record.id}`;

        const media: Media.Media[] =
          record.media.length > 0
            ? await apiProvider
                .getList("media", {
                  filter: { ids: record.media },
                  pagination: { perPage: record.media.length, page: 1 },
                  sort: { order: "ASC", field: "createdAt" },
                })
                .then((data) => data.data)
            : await Promise.resolve([]);

        const date = formatDate(parseISO(record.createdAt as any));

        return {
          title: record.label,
          content: record.body
            ? getTextContentsCapped(record.body as any, 300)
            : "",
          media,
          date,
          keywords: [],
          actors: [],
          groups: [],
          url,
          useReply: false,
          platforms: { TG: true, IG: false },
          schedule: 0,
        };
      }}
    />
  );
};
