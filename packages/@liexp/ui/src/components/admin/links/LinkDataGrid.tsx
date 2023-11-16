import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import * as React from "react";
import {
  Datagrid,
  DateField, FunctionField, LoadingPage,
  // ReferenceArrayInput,
  ReferenceField, TextField, usePermissions, type DatagridProps
} from "react-admin";
import { Box } from "../../mui";
import { MediaField } from "../media/MediaField";


export const LinkDataGrid: React.FC<DatagridProps> = (props) => {
  const { permissions, isLoading } = usePermissions();

  if (isLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);
  return (
    <Datagrid rowClick="edit" {...props}>
      <FunctionField
        render={(r: any) => {
          return (
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <MediaField
                source="image.thumbnail"
                type="image/jpeg"
                controls={false} />
              <TextField
                source="title"
                style={{ fontWeight: 600, marginBottom: 5 }} />
              <TextField source="description" />
            </Box>
          );
        }} />
      <DateField source="publishDate" />
      {isAdmin && (
        <ReferenceField source="creator" reference="users">
          <FunctionField
            render={(u: any) => `${u.firstName} ${u.lastName} (${u.username})`} />
        </ReferenceField>
      )}
      <ReferenceField source="provider" reference="groups">
        <TextField source="name" />
      </ReferenceField>

      <FunctionField
        label="resources.links.fields.events_length"
        render={(r: any | undefined) => r?.events?.length ?? "-"} />
      <FunctionField
        label="resources.links.fields.social_posts_length"
        render={(r: any | undefined) => r?.socialPosts?.length ?? "-"} />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};
