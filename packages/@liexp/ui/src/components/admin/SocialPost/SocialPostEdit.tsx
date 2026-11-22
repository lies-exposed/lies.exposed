import {
  type EditSocialPost,
  type SocialPlatform,
} from "@liexp/io/lib/http/SocialPost.js";
import { type Media } from "@liexp/io/lib/http/index.js";
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
import { EditToolbar } from "../toolbar/index.js";
import { PublishNowButton } from "./PublishNowButton.js";
import { ResourceEntityInput } from "./ResourceEntityInput.js";
import { SocialPostEditContent } from "./SocialPostEditContent.js";
import { SocialPostFormTabContent } from "./SocialPostFormTabContent.js";
import { SocialPostPlatformIcon } from "./SocialPostPlatformIcon.js";
import { SocialPostStatus } from "./SocialPostStatus.js";

export const SocialPostEditTitle: React.FC = () => {
  const record = useRecordContext<EditSocialPost>();
  return <Box>Social Post: {record?.title}</Box>;
};

interface SocialPostFormMediaValue {
  id?: string;
  type?: string;
  thumbnail?: string;
}

interface SocialPostFormValue {
  id?: string;
  title?: string;
  url?: string;
  date?: string;
  content?: string;
  status?: EditSocialPost["status"];
  type?: EditSocialPost["type"];
  entity?: EditSocialPost["entity"];
  publishCount?: number;
  result?: EditSocialPost["result"];
  scheduledAt?: EditSocialPost["scheduledAt"];
  createdAt?: EditSocialPost["createdAt"];
  updatedAt?: EditSocialPost["updatedAt"];
  platforms?: Partial<Record<SocialPlatform, boolean>>;
  media?: string | SocialPostFormMediaValue[];
  keywords?: { id: string }[];
  groups?: { id: string }[];
  actors?: { id: string }[];
  _content: {
    platforms?: Partial<Record<SocialPlatform, boolean>>;
    media?: string | SocialPostFormMediaValue[];
    keywords?: { id: string }[];
    groups?: { id: string }[];
    actors?: { id: string }[];
    useReply?: boolean;
    title?: string;
    url?: string;
    date?: string;
    content?: string;
    schedule?: number;
  };
}

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
}: SocialPostFormValue): EditSocialPost => {
  const media = _media as string | Media.Media[];
  const keywords = _keywords ?? [];
  const groups = _groups ?? [];
  const actors = _actors ?? [];
  return {
    ...r,
    ...content,
    useReply: useReply ?? false,
    platforms: platforms ?? { IG: false, TG: true },
    media:
      typeof media === "string"
        ? [{ media, type: "photo", thumbnail: media }]
        : (media ?? []).map((m) => ({ ...m, thumbnail: m.thumbnail ?? "" })),
    keywords: keywords.map((k) => k.id),
    groups: groups.map((g) => g.id),
    actors: actors.map((a) => a.id),
    publishCount: r.publishCount ?? 0,
  } as unknown as EditSocialPost;
};

interface TGPublishResult {
  date?: number;
  message_id?: number;
  caption?: string;
}

interface IGPublishResult {
  upload_id?: string;
  date?: number;
  media?: { taken_at?: number };
}

const SocialPostEditFormTabTelegram: React.FC = () => {
  const record = useRecordContext<EditSocialPost>();

  const tgResult = (record?.result?.tg ?? {}) as TGPublishResult;

  const tg = React.useMemo<
    Omit<TGPublishResult, "date"> & { date?: string }
  >(() => {
    let tgDate: string | undefined;
    try {
      tgDate = formatDate(new Date(tgResult.date! * 1000));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    return { ...tgResult, date: tgDate };
  }, [record?.result?.tg]);

  if (!record) {
    return <LoadingIndicator />;
  }

  if (!record.result?.tg) {
    return (
      <SocialPostButton
        type={record.type}
        onLoadSharePayloadClick={async () => Promise.resolve(record.result.tg)}
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

  const igResult = (record?.result?.ig ?? {}) as IGPublishResult;

  const ig = React.useMemo<
    Omit<IGPublishResult, "date"> & { date?: string }
  >(() => {
    let igDate: string | undefined;
    try {
      igDate = formatDate(new Date(igResult.media!.taken_at! * 1000));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    return { ...igResult, date: igDate };
  }, [record?.result?.ig]);

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
      <TabbedForm toolbar={<EditToolbar />}>
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
