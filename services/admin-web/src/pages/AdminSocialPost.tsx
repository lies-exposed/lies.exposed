import { ImageType } from "@liexp/shared/lib/io/http/Media";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost";
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
  useRecordContext
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
    choices={[PUBLISHED, TO_PUBLISH].map((t) => ({
      name: t.value,
      value: t.value,
    }))}
  />,
];

export const SocialPostList: React.FC = () => (
  <List resource={RESOURCE} perPage={50} filters={socialPostFilters}>
    <Datagrid rowClick="edit">
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

  return record ? (
    <ShareModalContent
      // id={record.entity}
      // type={record.type}
      post={{ ...emptySharePayload, ...record.content }}
      multipleMedia={false}
      media={[]}
      // open={true}
      // dialogProps={{  disablePortal: true }}
      onChange={() => {}}
    />
  ) : null;
};

export const SocialPostEdit: React.FC = () => {
  return (
    <Edit title={<SocialPostEditTitle />}>
      <SimpleForm>
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
