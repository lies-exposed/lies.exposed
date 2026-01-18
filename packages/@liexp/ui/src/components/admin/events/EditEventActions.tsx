import { SearchEventHelper } from "@liexp/shared/lib/helpers/event/searchEvent.helper.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { Stack } from "../../mui/index.js";
import { WebPreviewButton } from "../common/WebPreviewButton.js";
import { SearchLinksButton } from "../links/SearchLinksButton.js";
import { LoadingIndicator, useRecordContext } from "../react-admin.js";
import { UpdateEventQueueButton } from "./UpdateEventQueueButton.js";
import { EventSocialPostButton } from "./button/EventSocialPostButton.js";

export const EventEditActions: React.FC = () => {
  const record = useRecordContext<SearchEvent>();
  const { title, date } = React.useMemo(() => {
    if (record) {
      const title = SearchEventHelper.getTitle(record);
      return { title, date: record.date, type: record.type };
    }

    return {
      title: `New ${EVENT_TYPES.UNCATEGORIZED}`,
      date: new Date(),
    };
  }, [record]);

  if (!record) {
    return <LoadingIndicator />;
  }

  return (
    <Stack direction="row" spacing={2} padding={2} alignItems={"center"}>
      <WebPreviewButton resource="events" source="id" />
      <EventSocialPostButton id={record?.id} />
      <SearchLinksButton query={title} date={formatDate(date)} />
      <UpdateEventQueueButton />
    </Stack>
  );
};
