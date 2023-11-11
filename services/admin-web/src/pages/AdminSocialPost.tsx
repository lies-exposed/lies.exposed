import { ImageType } from "@liexp/shared/lib/io/http/Media";
import * as SocialPost from "@liexp/shared/lib/io/http/SocialPost";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost";
import { formatDate } from "@liexp/shared/lib/utils/date";
import {
  InstagramIcon,
  TelegramIcon,
} from "@liexp/ui/lib/components/Common/Icons";
import {
  ShareModalContent,
  emptySharePayload,
} from "@liexp/ui/lib/components/admin/Modal/ShareModal";
import { SocialPostFormTabContent } from "@liexp/ui/lib/components/admin/SocialPost/SocialPostFormTabContent";
import ReferenceArrayMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceArrayMediaInput";
import {
  BooleanInput,
  Button,
  Create,
  Datagrid,
  DateField,
  Edit,
  FormTab,
  FunctionField,
  Link,
  List,
  NumberField,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useInput,
  useRecordContext,
  useRefresh,
  type DatagridProps,
} from "@liexp/ui/lib/components/admin/react-admin";
import { Box, Typography } from "@liexp/ui/lib/components/mui";
import * as React from "react";

const RESOURCE = "social-posts";

const socialPostFilters = [
  <BooleanInput key="distinct" source="distinct" size="small" alwaysOn />,
  <SelectInput
    key="status"
    source="status"
    choices={[PUBLISHED, TO_PUBLISH].map((t) => ({
      id: t.value,
      name: t.value,
    }))}
    alwaysOn
    size="small"
  />,
];

const SocialPostDataGrid: React.FC<DatagridProps> = (props) => {
  return (
    <Datagrid
      rowClick="edit"
      rowSx={(record) => ({
        borderLeft: `5px solid ${
          TO_PUBLISH.is(record.status) ? "orange" : "transparent"
        }`,
      })}
      {...props}
    >
      <TextField source="type" />
      <FunctionField
        source="content.title"
        onClick={(e) => {
          e.preventDefault();
        }}
        render={(r) => (
          <Box>
            <Link to={`/${r.type}/${r.entity}`}>{r.content?.title}</Link>
            <Typography display={"block"}>{r.content.content}</Typography>
          </Box>
        )}
      />

      <FunctionField
        label="Platforms"
        render={(r: any) => {
          return (
            <Box>
              <TelegramIcon
                style={{ opacity: r.result?.tg ? 1 : 0.2, marginRight: 10 }}
              />
              <InstagramIcon style={{ opacity: r.result?.ig ? 1 : 0.2 }} />
            </Box>
          );
        }}
      />
      <TextField source="status" />
      <NumberField source="publishCount" />
      <DateField showTime source="scheduledAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};

export const SocialPostList: React.FC = () => (
  <List resource={RESOURCE} perPage={50} filters={socialPostFilters}>
    <SocialPostDataGrid />
  </List>
);

export const SocialPostEditTitle: React.FC = () => {
  const record: any = useRecordContext();
  return <Box>Social Post: {record?.content?.title}</Box>;
};

export const SocialPostPlatformsPosts: React.FC<{
  source: string;
  onChange?: (r: SocialPost.CreateSocialPost) => void;
}> = ({ source, onChange }) => {
  const record = useRecordContext({ source });

  const result = React.useMemo(() => {
    const result = record?.result;
    return {
      ig: result?.ig,
      tg: result?.tg ?? result,
    };
  }, [record]);

  const dates = React.useMemo(() => {
    let tgDate: string | undefined;
    let igDate: string | undefined;
    try {
      tgDate = formatDate(new Date(result.tg.date * 1000));
    } catch (e) {}

    try {
      igDate = formatDate(new Date(result.ig.media.taken_at * 1000));
    } catch (e) {}

    return { tg: tgDate, ig: igDate };
  }, [result.tg, result.ig]);

  return (
    <Box>
      {record?.result?.ig ? (
        <Box>
          <InstagramIcon />
          <Typography>
            Instagram {result.ig.upload_id} ({dates.ig})
          </Typography>
          {/* <Typography>{JSON.stringify(result.ig, null, 2)}</Typography> */}
        </Box>
      ) : null}
      {record?.result?.tg ? (
        <Box>
          <TelegramIcon />
          <Typography display={"block"}>
            Telegram {result.tg.message_id} ({dates.tg})
          </Typography>
          {/* <Typography>{JSON.stringify(result.tg, null, 2)}</Typography> */}
        </Box>
      ) : null}
    </Box>
  );
};
export const SocialPostEditContent: React.FC<{
  source: string;
  onChange?: (r: SocialPost.CreateSocialPost) => void;
}> = ({ source, onChange }) => {
  const record: any = useRecordContext();
  const field = useInput({
    source,
    onChange,
    defaultValue: record?.content ?? {},
  });

  const media = Array.isArray(record.content?.media)
    ? record.content.media
    : [
        {
          type: "photo",
          media: record.content?.media,
          thumbnail: record.content?.media,
        },
      ];

  return record ? (
    <ShareModalContent
      post={{
        ...emptySharePayload,
        ...field.field.value,
        media,
      }}
      multipleMedia={false}
      media={media}
      onChange={({ payload: record }) => {
        field.field.onChange(record);
      }}
    />
  ) : null;
};

const PublishNowButton: React.FC = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const handlePublishNow = (): void => {
    void dataProvider
      .put(`/social-posts/${record.id}/publish`)
      .then(() => {
        refresh();
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e.response.status, e.response.data);
        // return Promise.reject(new HttpError(e.message, e.status, e.response.data));
        // setSubmissionErrors(e);
      });
  };

  if (record && TO_PUBLISH.is(record.status)) {
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

const SocialPostStatus: React.FC = () => {
  return (
    <Box style={{ display: "flex", alignItems: "center" }}>
      <SelectInput
        source="status"
        choices={SocialPost.SocialPostStatus.types.map((t) => ({
          id: t.value,
          name: t.value,
        }))}
      />
      <PublishNowButton />
    </Box>
  );
};

export const SocialPostEdit: React.FC = () => {
  return (
    <Edit
      redirect="edit"
      title={<SocialPostEditTitle />}
      transform={({
        content: { platforms, media, useReply, ...content },
        ...r
      }) => {
        return {
          ...r,
          ...content,
          useReply: useReply ?? false,
          platforms: platforms ?? { IG: false, TG: true },
          media:
            typeof media === "string"
              ? [{ media, type: "photo", thumbnail: media }]
              : media,
          publishCount: content.publishCount ?? 0,
        };
      }}
    >
      <TabbedForm>
        <FormTab label="General">
          <SocialPostStatus />
          <SocialPostEditContent source="content" />
          <SocialPostPlatformsPosts source="result" />
        </FormTab>
        <FormTab label={"Posts"}>
          <SocialPostFormTabContent source="entity" target="entity" />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export const SocialPostCreate: React.FC = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="text" />
        <ReferenceArrayMediaInput
          source="media"
          allowedTypes={ImageType.types.map((t) => t.value)}
        />
      </SimpleForm>
    </Create>
  );
};
