import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { CircularProgress } from "../../../mui/index.js";
import { SocialPostButton } from "../../common/SocialPostButton.js";

export const MediaTGPostButton: React.FC = () => {
  const record = useRecordContext();
  const apiProvider = useDataProvider();

  if (!record) {
    return <CircularProgress />;
  }

  return (
    <SocialPostButton
      type="media"
      onLoadSharePayloadClick={async () => {
        const url = `${process.env.VITE_WEB_URL}/media/${record.id}`;

        const keywords: Keyword.Keyword[] =
          record.keywords.length > 0
            ? await apiProvider
                .getList("keywords", {
                  filter: { ids: record.keywords },
                  pagination: { perPage: record.keywords.length, page: 1 },
                  sort: { order: "ASC", field: "createdAt" },
                })
                .then((data) => data.data)
            : await Promise.resolve([]);

        const date = formatDate(parseISO(record.createdAt));

        return {
          title: record.label ?? record.description,
          keywords,
          media: [record as any],
          date,
          content: record.description,
          actors: [],
          groups: [],
          url,
          platforms: { TG: true, IG: false },
          useReply: false,
          schedule: record.schedule,
        };
      }}
    />
  );
};
