import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { SocialPostPlatformIcon } from "@liexp/ui/lib/components/admin/SocialPost/SocialPostEdit.js";
import ReferenceArrayMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceArrayMediaInput.js";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  FunctionField,
  Link,
  List,
  NumberField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  type DatagridProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Box, Stack, Typography } from "@liexp/ui/lib/components/mui/index.js";
import { getBorderLeftStyle } from "@liexp/ui/lib/utils/style.utils.js";
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
      rowSx={(record) =>
        getBorderLeftStyle(
          TO_PUBLISH.is(record.status) ? "orange" : "transparent",
        )
      }
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
        render={(r) => {
          return (
            <Stack direction="row" spacing={1}>
              <SocialPostPlatformIcon platform="TG" />
              <SocialPostPlatformIcon platform="IG" />
            </Stack>
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
