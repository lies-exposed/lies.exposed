import { type Keyword, type Media } from "@liexp/shared/lib/io/http/index.js";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { CircularProgress } from "../../../mui/index.js";
import { SocialPostButton } from "../../common/SocialPostButton.js";

export const KeywordTGPostButton: React.FC = () => {
  const record = useRecordContext<Keyword.Keyword>();
  const apiProvider = useDataProvider();
  if (!record) {
    return <CircularProgress />;
  }

  return (
    <SocialPostButton
      type="keywords"
      onLoadSharePayloadClick={async () => {
        const url = `${process.env.VITE_WEB_URL}/media/${record.id}`;

        const media: Media.Media[] = await apiProvider
          .getList("media", {
            filter: { keywords: [record.id] },
            pagination: { perPage: 1, page: 1 },
            sort: { order: "ASC", field: "createdAt" },
          })
          .then((data) => data.data);

        const date = formatDate(parseISO(record.createdAt as any));

        return {
          title: record.tag,
          content: "",
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
