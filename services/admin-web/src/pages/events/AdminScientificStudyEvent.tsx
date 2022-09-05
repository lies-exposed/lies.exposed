import * as ScientificStudy from "@liexp/shared/io/http/Events/ScientificStudy";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  EditProps,
  FormDataConsumer,
  FormTab,
  List,
  ListProps,
  RaRecord,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
} from "react-admin";
import { AvatarField } from "../../components/Common/AvatarField";
import { EditForm } from "../../components/Common/EditForm";
import { MediaArrayInput } from "../../components/Common/MediaArrayInput";
import ReferenceArrayActorInput from "../../components/Common/ReferenceArrayActorInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../../components/Common/ReferenceArrayLinkInput";
import ReferenceGroupInput from "../../components/Common/ReferenceGroupInput";
import { ReferenceMediaDataGrid } from "../../components/Common/ReferenceMediaDataGrid";
import URLMetadataInput from "../../components/Common/URLMetadataInput";
import EventPreview from "../../components/previews/EventPreview";
import { EventGeneralTab } from "../../components/tabs/EventGeneralTab";
import { ReferenceLinkTab } from "../../components/tabs/ReferenceLinkTab";
import { transformEvent } from "../../utils";
import { EventEditActions } from "./actions/EditEventActions";

const listFilter = [
  <TextInput key="title" source="title" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <ReferenceGroupInput key="provider" source="provider" alwaysOn />,
  <ReferenceArrayActorInput key="authors" source="authors" />,
  <DateInput key="date" source="date" />,
];

export const ScientificStudiesList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={listFilter}
    perPage={20}
    filterDefaultValues={{ type: "ScientificStudy", withDrafts: true }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
      <BooleanField source="draft" />
      <ReferenceField source="payload.publisher" reference="groups">
        <AvatarField source="avatar" />
      </ReferenceField>
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const ScientificStudyEventTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Scientific Study: {record?.payload?.title}</span>;
};

export const EditScientificStudyEventPayload: React.FC<
  EditProps & { record?: RaRecord }
> = (props) => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <URLMetadataInput
        source="payload.url"
        type={ScientificStudy.SCIENTIFIC_STUDY.value}
      />
      <ReferenceGroupInput source="payload.publisher" />
      <ReferenceArrayActorInput source="payload.authors" />
    </Box>
  );
};

export const ScientificStudyEdit: React.FC = () => {
  return (
    <EditForm
      title={<ScientificStudyEventTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(r.id, r)}
      preview={<EventPreview />}
    >
      <TabbedForm>
        <FormTab label="General">
          <EventGeneralTab>
            <EditScientificStudyEventPayload />
          </EventGeneralTab>
        </FormTab>
        <FormTab label="body">
          <ReactPageInput source="body" />
        </FormTab>

        <FormTab label="media">
          <MediaArrayInput source="newMedia" defaultValue={[]} />
          <ReferenceMediaDataGrid source="media" />
        </FormTab>
        <FormTab label="links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const ScientificStudyCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Scientific Study"
    {...props}
    transform={(r) =>
      transformEvent(uuid(), {
        ...r,
        type: ScientificStudy.SCIENTIFIC_STUDY.value,
      })
    }
  >
    <SimpleForm>
      <BooleanInput source="plain" />
      <FormDataConsumer>
        {({ formData }) => {
          if (formData.plain) {
            return (
              <Box>
                <BooleanInput source="draft" defaultValue={false} />

                <DateInput source="date" />
                <TextInput source="payload.title" />
                <TextInput source="payload.url" />
                <ReactPageInput source="excerpt" onlyText />
                <ReactPageInput source="body" />
                <ReferenceArrayActorInput
                  source="payload.authors"
                  initialValue={[]}
                />

                <ReferenceGroupInput source="payload.publisher" alwaysOn />

                <ReferenceArrayKeywordInput
                  source="keywords"
                  defaultValue={[]}
                  showAdd={false}
                />
                <ReferenceArrayLinkInput source="links" defaultValue={[]} />
                <MediaArrayInput source="newMedia" defaultValue={[]} />
              </Box>
            );
          }
          return (
            <URLMetadataInput
              source="url"
              type={ScientificStudy.SCIENTIFIC_STUDY.value}
            />
          );
        }}
      </FormDataConsumer>
    </SimpleForm>
  </Create>
);
