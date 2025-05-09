import { type SocialPlatform } from "@liexp/shared/lib/io/http/SocialPost.js";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { LoadingIndicator } from "react-admin";
import { InstagramIcon, TelegramIcon } from "../../Common/Icons/index.js";

export const SocialPostPlatformIcon: React.FC<{
  platform: SocialPlatform;
  record?: any;
}> = ({ platform, record: _record }) => {
  const record = _record ?? useRecordContext();
  if (!record) {
    return <LoadingIndicator />;
  }

  if (platform === "IG") {
    return (
      <InstagramIcon
        style={{ opacity: record.result?.ig ? 1 : 0.2 }}
        width={20}
      />
    );
  }

  return (
    <TelegramIcon style={{ opacity: record.result?.tg ? 1 : 0.2 }} width={20} />
  );
};
