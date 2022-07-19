import { getEventsMetadata } from "@liexp/shared/helpers/event";
import { Box } from "@liexp/ui/components/mui";
import { getEventCommonProps } from "@liexp/ui/helpers/event.helper";
import * as React from "react";
import { LoadingIndicator, useRecordContext } from "react-admin";
import { SearchLinksButton } from "../../../components/Common/SearchLinksButton";
import { TGPostButton } from "../../../components/Common/TGPostButton";
import { WebPreviewButton } from "../../../components/Common/WebPreviewButton";

export const EventEditActions: React.FC = () => {
  const record: any = useRecordContext();
  const { title } = React.useMemo(() => {
    if (record) {
      const relations = getEventsMetadata(record);
      const { title } = getEventCommonProps(record, relations);
      return { title };
    }
    return {
      title: "",
    };
  }, [record]);

  if (!record) {
    return <LoadingIndicator />;
  }

  return (
    <Box style={{ display: "flex", flexDirection: "row", margin: 10 }}>
      <WebPreviewButton resource="events" source="id" />
      <TGPostButton id={record?.id} />
      <SearchLinksButton query={title} />
    </Box>
  );
};
