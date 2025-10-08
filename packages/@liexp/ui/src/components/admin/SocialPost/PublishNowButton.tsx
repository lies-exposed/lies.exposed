import { TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { Schema } from "effect";
import * as React from "react";
import {
  Button,
  type ButtonProps,
  type Identifier,
  LoadingIndicator,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "../react-admin.js";

export const PublishNowButton: React.FC<
  {
    platforms: Partial<{ IG: boolean; TG: boolean }>;
  } & ButtonProps
> = ({ platforms, ...props }) => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const handlePublishNow = (post: { id: Identifier }): void => {
    void dataProvider
      .put(`/social-posts/${post.id}/publish`, { platforms })
      .then(() => {
        refresh();
      })
      .catch((e: any) => {
        // eslint-disable-next-line no-console
        console.error(e);
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
  if (Schema.is(TO_PUBLISH)(record.status) || needPublishing) {
    return (
      <Button
        label="Publish now"
        variant="contained"
        {...props}
        onClick={() => handlePublishNow(record)}
      />
    );
  }
  return null;
};
