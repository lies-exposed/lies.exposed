import * as React from "react";
import {
  Button, useDataProvider, useRecordContext,
  useRefresh
} from "react-admin";
import { transformLink } from '../transformLink';


export const OverrideThumbnail: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  return (
    <Button
      label="resources.links.actions.override_thumbnail"
      variant="contained"
      onClick={() => {
        void dataProvider
          .put(
            `/links/${record?.id}`,
            transformLink({
              ...record,
              overrideThumbnail: true,
            })
          )
          .then(() => {
            refresh();
          });
      }} />
  );
};
