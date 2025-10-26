import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { MapInput } from "@liexp/ui/lib/components/admin/MapInput.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import {
  BooleanInput,
  Create,
  SimpleForm,
  required,
  type CreateProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

const AreaCreate: React.FC<CreateProps> = () => (
  <Create title="Create a Post">
    <SimpleForm>
      <BooleanInput source="draft" defaultValue={false} />
      <TextWithSlugInput
        source="label"
        slugSource="slug"
        validate={[required()]}
      />
      <MapInput source="geometry" />
      <BlockNoteInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);

export default AreaCreate;
