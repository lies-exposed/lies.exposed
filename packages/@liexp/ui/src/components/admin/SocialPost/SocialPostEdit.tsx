import {
  type SocialPlatform,
  type EditSocialPost,
} from "@liexp/shared/lib/io/http/SocialPost";
import { formatDate } from "@liexp/shared/lib/utils/date";
import * as React from "react";
import { InstagramIcon, TelegramIcon } from "../../Common/Icons";
import { Box, Stack, Typography } from "../../mui";
import { SocialPostButton } from "../common/SocialPostButton";
import {
  Edit,
  FormTab,
  LoadingIndicator,
  TabbedForm,
  TextInput,
  useRecordContext,
} from "../react-admin";
import { PublishNowButton } from "./PublishNowButton";
import { ResourceEntityInput } from "./ResourceEntityInput";
import { SocialPostEditContent } from "./SocialPostEditContent";
import { SocialPostFormTabContent } from "./SocialPostFormTabContent";
import { SocialPostStatus } from "./SocialPostStatus";

export const SocialPostEditTitle: React.FC = () => {
  const record: any = useRecordContext();
  return <Box>Social Post: {record?.content?.title}</Box>;
};

const transformSocialPost = ({
  content: { platforms, media, useReply, ...content },
  ...r
}: any): EditSocialPost => {
  return {
    ...r,
    ...content,
    useReply: useReply ?? false,
    platforms: platforms ?? { IG: false, TG: true },
    media:
      typeof media === "string"
        ? [{ media, type: "photo", thumbnail: media }]
        : media.map((m: any) => ({ ...m, thumbnail: m.thumbnail ?? "" })),
    keywords: content.keywords.map((k: any) => k.id),
    groups: content.groups.map((g: any) => g.id),
    actors: content.actors.map((a: any) => a.id),
    publishCount: content.publishCount ?? 0,
  };
};

const SocialPostEditFormTabTelegram: React.FC = () => {
  const record: any = useRecordContext();
  if (!record) {
    return <LoadingIndicator />;
  }

  if (!record.result?.tg) {
    return (
      <SocialPostButton
        type={record.type}
        onLoadSharePayloadClick={async () => record.content}
      />
    );
  }

  const { result } = record;

  const tg = React.useMemo(() => {
    let tgDate: string | undefined;
    try {
      tgDate = formatDate(new Date(result.tg.date * 1000));
    } catch (e) {}

    return { ...result.tg, date: tgDate };
  }, [result.tg]);

  return (
    <Box width={"100%"}>
      <Typography display={"block"}>
        Telegram {tg.message_id} ({tg.date})
      </Typography>
      <TextInput source="result.tg.caption" multiline fullWidth />
    </Box>
  );
};

const SocialPostEditFormTabInstagram: React.FC = () => {
  const record = useRecordContext();
  if (!record) {
    return <LoadingIndicator />;
  }
  if (!record.result?.ig) {
    return (
      <PublishNowButton platforms={{ IG: true }} />
    );
  }

  const { result } = record;

  const ig = React.useMemo(() => {
    let igDate: string | undefined;
    try {
      igDate = formatDate(new Date(result.ig.media.taken_at * 1000));
    } catch (e) {}

    return { ...result.ig, date: igDate };
  }, [result.ig]);

  return (
    <Box width={"100%"}>
      <Typography display={"block"}>
        Instagram {ig.upload_id} ({ig.date})
      </Typography>
      <TextInput source="result.tg.caption" multiline fullWidth />
    </Box>
  );
};

export const SocialPostPlatformIcon: React.FC<{
  platform: SocialPlatform;
  record?: any;
}> = ({ platform, record: _record }) => {
  const record = _record ?? useRecordContext();
  if (!record) {
    return <LoadingIndicator />;
  }

  if (platform === "IG") {
    return <InstagramIcon style={{ opacity: record.result?.ig ? 1 : 0.2 }} />;
  }

  return <TelegramIcon style={{ opacity: record.result?.tg ? 1 : 0.2 }} />;
};

const FormTabPlatformLabel: React.FC<{ platform: SocialPlatform }> = ({
  platform,
}) => {
  const label = platform === "IG" ? "Instagram" : "Telegram";
  return (
    <Stack direction={"row"} alignItems={"center"} spacing={1}>
      <span>{label}</span>
      <SocialPostPlatformIcon platform={platform} />
    </Stack>
  );
};

export const SocialPostEdit: React.FC = (props) => {
  return (
    <Edit
      redirect="edit"
      title={<SocialPostEditTitle />}
      transform={transformSocialPost}
    >
      <TabbedForm>
        <FormTab label="General">
          <SocialPostStatus />
          <ResourceEntityInput />
          <SocialPostEditContent source="content" />
        </FormTab>
        <FormTab label={"Posts"}>
          <SocialPostFormTabContent source="entity" target="entity" />
        </FormTab>
        <FormTab label={<FormTabPlatformLabel platform="TG" />}>
          <SocialPostEditFormTabTelegram />
        </FormTab>
        <FormTab label={<FormTabPlatformLabel platform="IG" />}>
          <SocialPostEditFormTabInstagram />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};
