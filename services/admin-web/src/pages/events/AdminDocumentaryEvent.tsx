import type * as Events from "@liexp/shared/lib/io/http/Events";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField";
import ReferenceArrayMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceArrayMediaInput";
import EventPreview from "@liexp/ui/lib/components/admin/previews/EventPreview";
import { DocumentaryEditFormTab } from "@liexp/ui/lib/components/admin/tabs/DocumentaryEditFormTab";
import { EventGeneralTab } from "@liexp/ui/lib/components/admin/tabs/EventGeneralTab";
import { ReferenceLinkTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceLinkTab";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils";
import * as React from "react";
import {
  BooleanInput,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  List,
  type ListProps,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useRecordContext,
} from "react-admin";
import { EventEditActions } from "./actions/EditEventActions";

const documentaryEventsFilter = [
  <TextInput key="title" source="title" alwaysOn />,
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
      title: undefined,
      draft: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
      <ReferenceField reference="media" source="payload.media">
        <MediaField source="thumbnail" />
      </ReferenceField>

      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const DocumentaryReleaseTitle: React.FC = () => {
  const record = useRecordContext<Events.Documentary.Documentary>();
  return <span>Documentary: {record?.payload?.title}</span>;
};

export const DocumentaryEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      title={<DocumentaryReleaseTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
      preview={<EventPreview />}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <EventGeneralTab>
            <DocumentaryEditFormTab />
          </EventGeneralTab>
        </FormTab>
        <FormTab label="Body">
          <ReactPageInput source="body" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const DocumentaryCreate: React.FC<CreateProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Documentary"
      transform={(data) =>
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
        <TextInput type="url" fullWidth source="payload.website" />
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
