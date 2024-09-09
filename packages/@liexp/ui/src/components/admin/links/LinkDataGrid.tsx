import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as React from "react";
import {
  Datagrid,
  DateField,
  FunctionField,
  LoadingPage,
  // ReferenceArrayInput,
  ReferenceField,
  TextField,
  usePermissions,
  type DatagridProps,
} from "react-admin";
import { Stack, Typography } from "../../mui/index.js";
import { MediaField } from "../media/MediaField.js";

export const LinkDataGrid: React.FC<DatagridProps> = (props) => {
  const { permissions, isLoading } = usePermissions();

  if (isLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);
  return (
    <Datagrid rowClick="edit" {...props}>
      <FunctionField
        render={() => {
          return (
            <Stack direction="row">
              <Stack>
                <MediaField
                  source="image.thumbnail"
                  type="image/jpeg"
                  controls={false}
                />
              </Stack>
              <FunctionField
                render={(record) => (
                  <Stack direction="column">
                    <TextField
                      source="title"
                      record={record}
                      style={{ fontWeight: 600, marginBottom: 5 }}
                    />
                    <TextField
                      source="description"
                      record={{
                        ...record,
                        description:
                          record.description.length > 300
                            ? record.description.substring(0, 300).concat("...")
                            : record.description,
                      }}
                    />
                  </Stack>
                )}
              />
            </Stack>
          );
        }}
      />
      <DateField source="publishDate" />
      {isAdmin && (
        <ReferenceField source="creator" reference="users">
          <FunctionField
            render={(u) => `${u.firstName} ${u.lastName} (${u.username})`}
          />
        </ReferenceField>
      )}
      <ReferenceField source="provider" reference="groups">
        <TextField source="name" />
      </ReferenceField>

      <FunctionField
        label="resources.links.fields.relations"
        render={(r) => {
          return (
            <Stack direction="column" minWidth={150}>
              {[
                { label: "Events", value: r?.events?.length },
                {
                  label: "SocialPosts",
                  value: r?.socialPosts?.length,
                },
              ].map((relation) => (
                <Stack
                  key={relation.label}
                  direction="row"
                  alignItems="center"
                  justifyItems="center"
                >
                  <Typography variant="body1">{relation.label}: </Typography>
                  <Typography variant="body1" fontWeight="semibold">
                    {relation.value ?? "-"}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          );
        }}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};
