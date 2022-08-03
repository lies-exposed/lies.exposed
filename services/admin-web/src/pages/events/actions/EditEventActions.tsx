import { getEventsMetadata } from "@liexp/shared/helpers/event";
import { UNCATEGORIZED } from "@liexp/shared/io/http/Events/Uncategorized";
import { Box } from "@liexp/ui/components/mui";
import { getEventCommonProps } from "@liexp/ui/helpers/event.helper";
import * as React from "react";
import { LoadingIndicator, useRecordContext } from "react-admin";
import { SearchLinksButton } from "../../../components/Common/SearchLinksButton";
import { TGPostButton } from "../../../components/Common/TGPostButton";
import { UpdateMetadataButton } from '../../../components/Common/UpdateMetadataButton';
import { WebPreviewButton } from "../../../components/Common/WebPreviewButton";

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
