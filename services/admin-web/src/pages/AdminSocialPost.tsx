import { ImageType } from "@liexp/shared/lib/io/http/Media";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost";
import { apiProvider } from "@liexp/ui/lib/client/api";
import {
  Create,
  Datagrid,
  DateField,
  Edit,
  FunctionField,
  Link,
  List,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  useRecordContext,
  Button,
  useRefresh,
} from "@liexp/ui/lib/components/admin";
import {
  ShareModalContent,
  emptySharePayload,
} from "@liexp/ui/lib/components/admin/Modal/ShareModal";
import ReferenceArrayMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceArrayMediaInput";
import { Box } from "@liexp/ui/lib/components/mui";
import * as React from "react";

const RESOURCE = "social-posts";

const socialPostFilters = [
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

export const SocialPostList: React.FC = () => (
  <List resource={RESOURCE} perPage={50} filters={socialPostFilters}>
    <Datagrid
      rowClick="edit"
      rowSx={(record) => ({
        borderLeft: `2px solid ${
          TO_PUBLISH.is(record.status) ? "orange" : "transparent"
        }`,
      })}
    >
      <TextField source="type" />
      <FunctionField
        onClick={(e) => {
          e.preventDefault();
        }}
        render={(r) => {
          return <Link to={`/${r.type}/${r.entity}`}>{r.content?.title}</Link>;
        }}
      />
      <TextField source="status" />
      <DateField showTime source="scheduledAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const SocialPostEditTitle: React.FC = () => {
  const record: any = useRecordContext();
  return <Box>Social Post: {record?.content?.title}</Box>;
};
export const SocialPostEditContent: React.FC = () => {
  const record: any = useRecordContext();

  const media = Array.isArray(record.content.media)
    ? record.content.media
    : [{ type: "photo", media: record.content.media }];

  return record ? (
    <ShareModalContent
      post={{
        ...emptySharePayload,
        ...record.content,
        media,
      }}
      multipleMedia={false}
      media={media}
      onChange={() => {}}
    />
  ) : null;
};

const PublishNowButton: React.FC = () => {
  const record = useRecordContext();
  const refresh = useRefresh();

  const handlePublishNow = (): void => {
    void apiProvider.put(`/social-posts/${record.id}/publish`).then(() => {
      refresh();
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
      <TextField source="status" />
      <PublishNowButton />
    </Box>
  );
};

export const SocialPostEdit: React.FC = () => {
  return (
    <Edit title={<SocialPostEditTitle />}>
      <SimpleForm>
        <SocialPostStatus />
        <SocialPostEditContent />
      </SimpleForm>
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
