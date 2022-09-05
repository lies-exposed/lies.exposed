import * as Events from "@liexp/shared/io/http/Events";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import {
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  EditProps,
  FormTab,
  List,
  ListProps,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
} from "react-admin";
import { EditForm } from "../../components/Common/EditForm";
import ExcerptField from "../../components/Common/ExcerptField";
import { MediaField } from "../../components/Common/MediaField";
import ReferenceAreaInput from "../../components/Common/ReferenceAreaInput";
import ReferenceArrayActorInput from "../../components/Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../../components/Common/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../../components/Common/ReferenceArrayLinkInput";
import ReferenceArrayMediaInput from "../../components/Common/ReferenceArrayMediaInput";
import ReferenceMediaInput from "../../components/Common/ReferenceMediaInput";
import EventPreview from "../../components/previews/EventPreview";
import { EventGeneralTab } from '../../components/tabs/EventGeneralTab';
import { ReferenceLinkTab } from "../../components/tabs/ReferenceLinkTab";
import { transformEvent } from "../../utils";
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

export const DocumentaryEditFormTab: React.FC<EditProps & { record?: any }> = (
  props
) => (
  <Box>
    <TextInput fullWidth source="payload.title" />
    <ReferenceAreaInput source="payload.location" />
    <TextInput type="url" fullWidth source="payload.website" />
    <ReferenceMediaInput
      allowedTypes={["video/mp4", "iframe/video"]}
      source="payload.media"
    />

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
  </Box>
);

export const DocumentaryEdit: React.FC = () => {
  return (
    <EditForm
      title={<DocumentaryReleaseTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(r.id, r)}
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

export const DocumentaryCreate: React.FC<CreateProps> = () => (
  <Create
    title="Create a Documentary"
    transform={(data) =>
      transformEvent(uuid(), data).then((record) => ({
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

      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} showAdd />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
    </SimpleForm>
  </Create>
);
