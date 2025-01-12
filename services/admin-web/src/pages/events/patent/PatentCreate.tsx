import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import ReferenceLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceLinkInput.js";
import { MediaArrayInput } from "@liexp/ui/lib/components/admin/media/input/MediaArrayInput.js";
import {
  BooleanInput,
  Create,
  DateInput,
  SimpleForm,
  TextInput,
  type CreateProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const PatentCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Patent Event"
      {...props}
      transform={(data: any) => transformEvent(dataProvider)(uuid(), data)}
    >
      <SimpleForm>
        <TextInput source="payload.title" />
        <DateInput source="date" />
        <ReferenceLinkInput source="payload.source" />
        <BooleanInput source="draft" defaultValue={false} />
        <BlockNoteInput source="excerpt" onlyText />
        <BlockNoteInput source="body" />
        <ReferenceArrayActorInput
          source="payload.owners.actors"
          defaultValue={[]}
        />
        <ReferenceArrayGroupInput
          source="payload.owners.groups"
          defaultValue={[]}
        />
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <ReferenceArrayLinkInput source="links" defaultValue={[]} />
        <MediaArrayInput
          label="media"
          source="newMedia"
          fullWidth={true}
          defaultValue={[]}
        />
      </SimpleForm>
    </Create>
  );
};

export default PatentCreate;
