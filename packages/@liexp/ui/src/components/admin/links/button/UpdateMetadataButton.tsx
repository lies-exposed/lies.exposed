import * as React from "react";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "react-admin";

export const UpdateMetadataButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  return (
    <Button
      label="resources.links.actions.update_metadata"
      variant="contained"
      onClick={() => {
        void dataProvider.put(`/links/${record?.id}/metadata`).then(() => {
          refresh();
        });
      }}
    />
  );
};
