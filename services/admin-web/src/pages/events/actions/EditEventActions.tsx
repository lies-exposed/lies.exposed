import { getEventMetadata } from "@liexp/shared/lib/helpers/event/event";
import { getTitle } from "@liexp/shared/lib/helpers/event/getTitle.helper";
import { UNCATEGORIZED } from "@liexp/shared/lib/io/http/Events/Uncategorized";
import {
  LoadingIndicator,
  useRecordContext,
} from "@liexp/ui/lib/components/admin";
import { EventSocialPostButton } from "@liexp/ui/lib/components/admin/common/SocialPostButton";
import { UpdateMetadataButton } from "@liexp/ui/lib/components/admin/common/UpdateMetadataButton";
import { WebPreviewButton } from "@liexp/ui/lib/components/admin/common/WebPreviewButton";
import { SearchLinksButton } from "@liexp/ui/lib/components/admin/links/SearchLinksButton";
import { Box } from "@liexp/ui/lib/components/mui";
import * as React from "react";

export const EventEditActions: React.FC = () => {
  const record: any = useRecordContext();
  const { title, date, type } = React.useMemo(() => {
    if (record) {
      const relations = getEventMetadata(record);
      const title = getTitle(record, relations);
      return { title, date: record.date, type: record.type };
    }
    return {
      title: "",
      date: undefined,
      type: UNCATEGORIZED.value,
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
