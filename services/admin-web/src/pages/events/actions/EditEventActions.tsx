import { getEventsMetadata } from "@liexp/shared/helpers/event";
import { UNCATEGORIZED } from "@liexp/shared/io/http/Events/Uncategorized";
import { SearchLinksButton } from "@liexp/ui/components/admin/common/SearchLinksButton";
import { TGPostButton } from "@liexp/ui/components/admin/common/TGPostButton";
import { UpdateMetadataButton } from '@liexp/ui/components/admin/common/UpdateMetadataButton';
import { WebPreviewButton } from "@liexp/ui/components/admin/common/WebPreviewButton";
import { Box } from "@liexp/ui/components/mui";
import { getEventCommonProps } from "@liexp/ui/helpers/event.helper";
import * as React from "react";
import { LoadingIndicator, useRecordContext } from "react-admin";

export const EventEditActions: React.FC = () => {
  const record: any = useRecordContext();
  const { title, date, type } = React.useMemo(() => {
    if (record) {
      const relations = getEventsMetadata(record);
      const { title } = getEventCommonProps(record, relations);
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
      <TGPostButton id={record?.id} />
      <SearchLinksButton query={title} date={date} />
      <UpdateMetadataButton type={type} />
    </Box>
  );
};
