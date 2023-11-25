import { TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost";
import * as React from "react";
import {
  Button,
  LoadingIndicator,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "../react-admin";

export const PublishNowButton: React.FC<{
  platforms: Partial<{ IG: boolean; TG: boolean }>;
}> = ({ platforms }) => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const handlePublishNow = (): void => {
    void dataProvider
      .put(`/social-posts/${record.id}/publish`, { platforms })
      .then(() => {
        refresh();
      })
      .catch((e: any) => {
        // eslint-disable-next-line no-console
        console.error(e.response.status, e.response.data);
        // return Promise.reject(new HttpError(e.message, e.status, e.response.data));
        // setSubmissionErrors(e);
      });
  };

  if (!record) {
    return <LoadingIndicator />;
  }

  const missingTGResult = platforms.TG ? !record.result?.tg : true;
  const missingIGResult = platforms.IG ? !record.result?.ig : true;
  const needPublishing = missingIGResult || missingTGResult;
  if (TO_PUBLISH.is(record.status) || needPublishing) {
    return (
      <Button
        label="Publish now"
        onClick={handlePublishNow}
        variant="contained"
      />
    );
  }
  return null;
};
