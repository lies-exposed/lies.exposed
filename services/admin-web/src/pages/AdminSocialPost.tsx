import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { SocialPostDataGrid } from "@liexp/ui/lib/components/admin/SocialPost/SocialPostDatagrid.js";
import ReferenceArrayMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceArrayMediaInput.js";
import {
  BooleanInput,
  Create,
  List,
  SelectInput,
  SimpleForm,
  TextInput,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

const RESOURCE = "social-posts";

const socialPostFilters = [
  <BooleanInput key="distinct" source="distinct" size="small" alwaysOn />,
  <SelectInput
    key="status"
    source="status"
    choices={[PUBLISHED, TO_PUBLISH].map((t) => ({
      id: t.literals[0],
      name: t.literals[0],
    }))}
    alwaysOn
    size="small"
  />,
];

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
          allowedTypes={ImageType.members.map((t) => t.Type)}
        />
      </SimpleForm>
    </Create>
  );
};
