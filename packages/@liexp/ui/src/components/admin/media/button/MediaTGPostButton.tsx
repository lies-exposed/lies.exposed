import { type Keyword } from "@liexp/shared/lib/io/http";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { CircularProgress } from "../../../mui";
import {
  type SocialPostButtonProps,
  SocialPostButton,
} from "../../common/SocialPostButton";

export const MediaTGPostButton: React.FC<
  Omit<SocialPostButtonProps, "onLoadSharePayloadClick">
> = () => {
  const record = useRecordContext();
  const apiProvider = useDataProvider();

  if (!record) {
    return <CircularProgress />;
  }

  return (
    <SocialPostButton
      onLoadSharePayloadClick={async () => {
        const url = `${process.env.WEB_URL}/media/${record.id}`;

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
          schedule: record.schedule,
        };
      }}
    />
  );
};
