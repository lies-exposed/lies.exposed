import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations";
import { getTitle } from "@liexp/shared/lib/helpers/event/getTitle.helper";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType";
import * as React from "react";
import { Box } from "../../mui";
import { UpdateMetadataButton } from "../common/UpdateMetadataButton";
import { WebPreviewButton } from "../common/WebPreviewButton";
import { SearchLinksButton } from "../links/SearchLinksButton";
import { LoadingIndicator, useRecordContext } from "../react-admin";
import { EventSocialPostButton } from "./button/EventSocialPostButton";

export const EventEditActions: React.FC = () => {
  const record: any = useRecordContext();
  const { title, date, type } = React.useMemo(() => {
    if (record) {
      const relations = getSearchEventRelations(record);
      const title = getTitle(record, relations);
      return { title, date: record.date, type: record.type };
    }
    return {
      title: "",
      date: undefined,
      type: EventTypes.UNCATEGORIZED.value,
    };
  }, [record]);

  if (!record) {
    return <LoadingIndicator />;
  }

  return (
    <Box style={{ display: "flex", flexDirection: "row", margin: 10 }}>
      <WebPreviewButton resource="events" source="id" />
      <EventSocialPostButton id={record?.id} />
      <SearchLinksButton query={title} date={date} />
      <UpdateMetadataButton type={type} />
    </Box>
  );
};
