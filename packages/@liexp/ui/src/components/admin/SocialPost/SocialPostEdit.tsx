import {
  type EditSocialPost,
  type SocialPlatform,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { Box, Stack, Typography } from "../../mui/index.js";
import { EditForm } from "../common/EditForm.js";
import { SocialPostButton } from "../common/SocialPostButton.js";
import {
  LoadingIndicator,
  TabbedForm,
  TextInput,
  useRecordContext,
} from "../react-admin.js";
import { PublishNowButton } from "./PublishNowButton.js";
import { ResourceEntityInput } from "./ResourceEntityInput.js";
import { SocialPostEditContent } from "./SocialPostEditContent.js";
import { SocialPostFormTabContent } from "./SocialPostFormTabContent.js";
import { SocialPostPlatformIcon } from "./SocialPostPlatformIcon.js";
import { SocialPostStatus } from "./SocialPostStatus.js";

export const SocialPostEditTitle: React.FC = () => {
  const record: any = useRecordContext();
  return <Box>Social Post: {record?.content?.title}</Box>;
};

const transformSocialPost = ({
  _content: {
    platforms,
    media: _media,
    keywords: _keywords,
    groups: _groups,
    actors: _actors,
    useReply,
    ...content
  },
  ...r
}: any): EditSocialPost => {
  const media = _media as Media.Media[];
  const keywords = _keywords as Keyword.Keyword[];
  const groups = _groups as Group.Group[];
  const actors = _actors as Actor.Actor[];
  return {
    ...r,
    ...content,
    useReply: useReply ?? false,
    platforms: platforms ?? { IG: false, TG: true },
    media:
      typeof media === "string"
        ? [{ media, type: "photo", thumbnail: media }]
        : media.map((m) => ({ ...m, thumbnail: m.thumbnail ?? "" })),
    keywords: keywords.map((k) => k.id),
    groups: groups.map((g) => g.id),
    actors: actors.map((a) => a.id),
    publishCount: content.publishCount ?? 0,
  } as EditSocialPost;
};

const SocialPostEditFormTabTelegram: React.FC = () => {
  const record = useRecordContext<EditSocialPost>();

  const { result } = record ?? { result: null };

  const tg = React.useMemo((): any => {
    let tgDate: string | undefined;
    try {
      tgDate = formatDate(new Date(result!.tg.date * 1000));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    return { ...(result?.tg ?? {}), date: tgDate };
  }, [result?.tg]);

  if (!record) {
    return <LoadingIndicator />;
  }

  if (!record.result?.tg) {
    return (
      <SocialPostButton
        type={record.type}
        onLoadSharePayloadClick={async () =>
          Promise.resolve(record.result.tg as any)
        }
      />
    );
  }

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
  const record = useRecordContext<EditSocialPost>();

  const { result } = record ?? { result: null };

  const ig = React.useMemo((): any => {
    let igDate: string | undefined;
    try {
      igDate = formatDate(new Date(result!.ig.media.taken_at * 1000));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    return { ...(result?.ig ?? {}), date: igDate };
  }, [result?.ig]);

  if (!record) {
    return <LoadingIndicator />;
  }
  if (!record.result?.ig) {
    return <PublishNowButton platforms={{ IG: true }} />;
  }

  return (
    <Box width={"100%"}>
      <Typography display={"block"}>
        Instagram {ig.upload_id} ({ig.date})
      </Typography>
      <TextInput source="result.tg.caption" multiline fullWidth />
    </Box>
  );
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

export const SocialPostEdit: React.FC = () => {
  return (
    <EditForm
      redirect="edit"
      title={<SocialPostEditTitle />}
      transform={transformSocialPost}
      preview={null}
    >
      <TabbedForm>
        <TabbedForm.Tab label="General">
          <SocialPostStatus />
          <ResourceEntityInput />
          <SocialPostEditContent source="_content" />
        </TabbedForm.Tab>
        <TabbedForm.Tab label={"Posts"}>
          <SocialPostFormTabContent source="entity" target="entity" />
        </TabbedForm.Tab>
        <TabbedForm.Tab label={<FormTabPlatformLabel platform="TG" />}>
          <SocialPostEditFormTabTelegram />
        </TabbedForm.Tab>
        <TabbedForm.Tab label={<FormTabPlatformLabel platform="IG" />}>
          <SocialPostEditFormTabInstagram />
        </TabbedForm.Tab>
      </TabbedForm>
    </EditForm>
  );
};
