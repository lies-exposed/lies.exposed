import { type Media } from "@liexp/shared/lib/io/http";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { CircularProgress } from "../../../mui";
import {
  SocialPostButton,
  type SocialPostButtonProps,
} from "../../common/SocialPostButton";

export const AreaTGPostButton: React.FC<
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

        const date = formatDate(parseISO(record.createdAt));

        return {
          title: record.label,
          content: record.description,
          media,
          date,
          keywords: [],
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
