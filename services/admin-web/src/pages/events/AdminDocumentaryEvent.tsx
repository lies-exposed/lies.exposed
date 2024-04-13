import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { DocumentaryEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DocumentaryEditFormTab.js";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import ReferenceLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceLinkInput.js";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField.js";
import ReferenceArrayMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceArrayMediaInput.js";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  List,
  ReferenceField,
  SimpleForm,
  TextField,
  TextInput,
  type CreateProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const documentaryEventsFilter = [
  <TextInput key="search" source="q" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <DateInput key="date" source="date" alwaysOn />,
];

export const DocumentaryList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={documentaryEventsFilter}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      q: undefined,
      draft: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
      <ReferenceField reference="media" source="payload.media">
        <MediaField source="thumbnail" controls={false} />
      </ReferenceField>

      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const DocumentaryEdit: React.FC = () => {
  return <EditEventForm>{() => <DocumentaryEditFormTab />}</EditEventForm>;
};

export const DocumentaryCreate: React.FC<CreateProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Documentary"
      transform={(data: any) =>
        transformEvent(dataProvider)(uuid(), data).then((record) => ({
          ...record,
          payload: {
            ...record.payload,
            media: record.media[0],
          },
        }))
      }
    >
      <SimpleForm>
        <BooleanInput source="draft" defaultValue={false} />
        <TextInput fullWidth source="payload.title" />
        <ReferenceLinkInput type="url" fullWidth source="payload.website" />
        <DateInput source="date" />
        <ReferenceArrayMediaInput
          allowedTypes={["video/mp4", "iframe/video"]}
          source="newMedia"
        />
        <ReactPageInput source="excerpt" onlyText />
        {/** Authors */}
        <ReferenceArrayActorInput
          source="payload.authors.actors"
          defaultValue={[]}
        />
        <ReferenceArrayGroupInput
          source="payload.authors.groups"
          defaultValue={[]}
        />

        {/** Subjects */}
        <ReferenceArrayActorInput
          source="payload.subjects.actors"
          defaultValue={[]}
        />
        <ReferenceArrayGroupInput
          source="payload.subjects.groups"
          defaultValue={[]}
        />

        <ReactPageInput source="body" />

        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      </SimpleForm>
    </Create>
  );
};
