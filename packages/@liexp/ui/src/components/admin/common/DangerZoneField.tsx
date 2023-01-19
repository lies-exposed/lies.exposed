import * as React from "react";
import { Button, useRecordContext, useResourceContext } from "react-admin";
import { apiProvider } from "../../../client/api";
import { Box } from "../../mui";

interface DangerZoneFieldProps {}

export const DangerZoneField: React.FC<DangerZoneFieldProps> = ({}) => {
  const record = useRecordContext();
  const resource = useResourceContext();

  const doDeletePerm = React.useCallback(() => {
    void apiProvider
      .delete(resource, { id: record.id, meta: { permanent: true } })
      .then((r) => {
        console.log(r);
      });
  }, [record.id, record.deletedAt]);

  return (
    <Box>
      {record.deletedAt ? (
        <Button
          label="deletePermanently"
          color="secondary"
          onClick={doDeletePerm}
        />
      ) : null}
    </Box>
  );
};
