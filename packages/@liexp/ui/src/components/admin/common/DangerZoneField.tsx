import * as React from "react";
import {
  Button,
  useRecordContext,
  useRedirect,
  useResourceContext,
} from "react-admin";
import { apiProvider } from "../../../client/api.js";
import { Box } from "../../mui/index.js";

// interface DangerZoneFieldProps {}

export const DangerZoneField: React.FC = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const redirect = useRedirect();

  const doDeletePerm = React.useCallback(() => {
    void apiProvider
      .delete(resource, { id: record.id, meta: { permanent: true } })
      .then((r) => {
        redirect(`/links`);
      });
  }, [record.id, record.deletedAt]);

  return (
    <Box style={{ border: `1px solid red` }}>
      {record.deletedAt ? (
        <Button
          label="deletePermanently"
          color="secondary"
          variant="contained"
          onClick={doDeletePerm}
        />
      ) : null}
    </Box>
  );
};
