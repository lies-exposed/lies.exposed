import { type Keyword, type Media } from "@liexp/shared/lib/io/http/index.js";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { CircularProgress } from "../../../mui/index.js";
import { SocialPostButton } from "../../common/SocialPostButton.js";

export const LinkTGPostButton: React.FC = () => {
  const record = useRecordContext();
  const apiProvider = useDataProvider();

  if (!record) {
    return <CircularProgress />;
  }

  return (
    <SocialPostButton
      type="links"
      onLoadSharePayloadClick={async () => {
        const url = `${process.env.WEB_URL}/links/${record.id}`;

        const media: Media.Media[] =
          typeof record.image === "string"
            ? await apiProvider
                .getOne("media", { id: record.image })
                .then((data) => data.data)
            : await Promise.resolve([record.image]);

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

        const date = formatDate(parseISO(record.publishDate));

        return {
          title: record.title,
          keywords,
          media,
          date,
          content: record.description,
          actors: [],
          groups: [],
          url,
          useReply: false,
          platforms: { TG: true, IG: false },
          schedule: record.schedule,
        };
      }}
    />
  );
};
