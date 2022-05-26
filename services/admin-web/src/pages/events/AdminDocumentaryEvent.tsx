import * as Events from "@liexp/shared/io/http/Events";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import {
  MapInput,
  MapInputType
} from "@liexp/ui/src/components/admin/MapInput";
import { Box } from "@mui/material";
import * as React from "react";
import {
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  List,
  ListProps,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext
} from "react-admin";
import ExcerptField from "../../components/Common/ExcerptField";
import { MediaField } from "../../components/Common/MediaField";
import ReferenceActorInput from "../../components/Common/ReferenceActorInput";
import ReferenceArrayActorInput from "../../components/Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../../components/Common/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../../components/Common/ReferenceArrayLinkInput";
import ReferenceArrayMediaInput from "../../components/Common/ReferenceArrayMediaInput";
import ReferenceMediaInput from "../../components/Common/ReferenceMediaInput";
import { TGPostButton } from "../../components/Common/TGPostButton";
import { WebPreviewButton } from "../../components/Common/WebPreviewButton";
import { ReferenceLinkTab } from '../../components/tabs/ReferenceLinkTab';
import { transformEvent } from "../../utils";

const documentaryEventsFilter = [
  <BooleanInput
    key="withDrafts"
    label="Draft only"
    source="withDrafts"
    alwaysOn
  />,
  <ReferenceActorInput key="victim" source="victim" alwaysOn />,
  <DateInput key="date" source="date" />,
];

export const DocumentaryList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={documentaryEventsFilter}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false,
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
  <FormTab label="Payload" {...(props as any)}>
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const DocumentaryEdit: React.FC = () => {
  return (
    <Edit
      title={<DocumentaryReleaseTitle />}
      actions={
        <Box display="flex" style={{ flexDirection: "row", padding: 10 }}>
          <WebPreviewButton resource="/events" source="id" />
          <TGPostButton />
        </Box>
      }
      transform={(r) => transformEvent(r.id, r)}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <BooleanInput source="draft" defaultValue={false} />
          <TextInput fullWidth source="payload.title" />
          <TextInput type="url" fullWidth source="payload.website" />
          <DateInput source="date" />
          <ReferenceMediaInput
            allowedTypes={["video/mp4", "iframe/video"]}
            source="payload.media"
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
          <ReferenceArrayKeywordInput
            source="keywords"
            defaultValue={[]}
            showAdd={true}
          />
          <DateField source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </FormTab>
        <FormTab label="Body">
          <ReactPageInput source="body" />
        </FormTab>
        <FormTab label="Location">
          <MapInput source="payload.location" type={MapInputType.POINT} />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </Edit>
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
