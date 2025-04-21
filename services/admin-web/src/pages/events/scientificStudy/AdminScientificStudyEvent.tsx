import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/index.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import URLMetadataInput from "@liexp/ui/lib/components/admin/common/URLMetadataInput.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { ScientificStudyEventEditTab } from "@liexp/ui/lib/components/admin/events/tabs/ScientificStudyEventEditTab.js";
import { ScientificStudyEventTitle } from "@liexp/ui/lib/components/admin/events/titles/ScientificStudyEventTitle.js";
import ReferenceGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceGroupInput.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import { MediaArrayInput } from "@liexp/ui/lib/components/admin/media/input/MediaArrayInput.js";
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormDataConsumer,
  List,
  ReferenceField,
  SimpleForm,
  TextField,
  TextInput,
  type CreateProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const listFilter = [
  <TextInput key="search" source="q" label="Title" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <ReferenceGroupInput key="provider" source="provider" alwaysOn />,
  <ReferenceArrayActorInput key="authors" source="authors" />,
  <DateInput key="date" source="date" />,
];

export const ScientificStudiesList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={listFilter}
    perPage={25}
    filterDefaultValues={{ type: "ScientificStudy", withDrafts: true }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
      <BooleanField source="draft" />
      <ReferenceField source="payload.publisher" reference="groups">
        <AvatarField source="avatar.thumbnail" />
      </ReferenceField>
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const ScientificStudyEdit: React.FC = () => {
  return (
    <EditEventForm title={<ScientificStudyEventTitle />}>
      {() => <ScientificStudyEventEditTab />}
    </EditEventForm>
  );
};

export const ScientificStudyCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Scientific Study"
      {...props}
      transform={(r: any) =>
        transformEvent(dataProvider)(uuid(), {
          ...r,
          type: EventTypes.SCIENTIFIC_STUDY.literals[0],
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
                  <BlockNoteInput source="excerpt" onlyText />
                  <BlockNoteInput source="body" />
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
                type={EventTypes.SCIENTIFIC_STUDY.Type}
              />
            );
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};
