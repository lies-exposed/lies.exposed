import * as ScientificStudy from "@liexp/shared/io/http/Events/ScientificStudy";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { AvatarField } from "@liexp/ui/components/admin/common/AvatarField";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import ReferenceArrayActorInput from "@liexp/ui/components/admin/common/ReferenceArrayActorInput";
import ReferenceArrayKeywordInput from "@liexp/ui/components/admin/common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/components/admin/common/ReferenceArrayLinkInput";
import ReferenceGroupInput from "@liexp/ui/components/admin/common/ReferenceGroupInput";
import URLMetadataInput from "@liexp/ui/components/admin/common/URLMetadataInput";
import { MediaArrayInput } from "@liexp/ui/components/admin/media/MediaArrayInput";
import { ReferenceMediaDataGrid } from "@liexp/ui/components/admin/media/ReferenceMediaDataGrid";
import EventPreview from "@liexp/ui/components/admin/previews/EventPreview";
import { EventGeneralTab } from "@liexp/ui/components/admin/tabs/EventGeneralTab";
import { ReferenceLinkTab } from "@liexp/ui/components/admin/tabs/ReferenceLinkTab";
import { ScientificStudyEventEditTab } from "@liexp/ui/components/admin/tabs/ScientificStudyEventEditTab";
import { transformEvent } from "@liexp/ui/components/admin/transform.utils";
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
  FormDataConsumer,
  FormTab,
  List,
  ListProps,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useRecordContext,
} from "react-admin";
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

export const ScientificStudyEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      title={<ScientificStudyEventTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
      preview={<EventPreview />}
    >
      <TabbedForm>
        <FormTab label="General">
          <EventGeneralTab>
            <ScientificStudyEventEditTab />
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

export const ScientificStudyCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider()
  return (
  <Create
    title="Create a Scientific Study"
    {...props}
    transform={(r) =>
      transformEvent(dataProvider)(uuid(), {
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
      }
