import * as React from "react";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { transformLink } from "../transformLink";

export const TakeLinkScreenshot: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();
  const dataProvider = useDataProvider();

  const handleOnClick = (): void => {
    void dataProvider
      .post(
        `/links/${record?.id}/screenshot`,
        transformLink({
          ...record,
        }),
      )
      .then(() => {
        refresh();
      });
  };

  return (
    <Button
      label="resources.links.actions.take_web_page_screenshot"
      variant="contained"
      onClick={handleOnClick}
    />
  );
};
