import {
  Datagrid,
  DateField,
  Edit,
  List,
  SimpleForm,
  TextField,
  useRecordContext,
} from "@liexp/ui/lib/components/admin";
import {
  ShareModalContent,
  emptySharePayload,
} from "@liexp/ui/lib/components/admin/Modal/ShareModal";
import { Box } from "@liexp/ui/lib/components/mui";
import * as React from "react";

const RESOURCE = "social-posts";

const socialPostFilters = [];

export const SocialPostList: React.FC = () => (
  <List resource={RESOURCE} perPage={50} filters={socialPostFilters}>
    <Datagrid rowClick="edit">
      <TextField source="type" />
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
