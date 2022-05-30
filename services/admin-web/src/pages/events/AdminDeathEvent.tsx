import { http } from "@liexp/shared/io";
import { uuid } from "@liexp/shared/utils/uuid";
import { MapInput, MapInputType } from "@liexp/ui/components/admin/MapInput";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box } from '@mui/material';
import * as React from "react";
import {
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  FormTab,
  List,
  ListProps,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TabbedForm,
  useRecordContext,
} from "react-admin";
import { AvatarField } from "../../components/Common/AvatarField";
import ExcerptField from "../../components/Common/ExcerptField";
import { ImportMediaButton } from "../../components/Common/ImportMediaButton";
import { MediaArrayInput } from "../../components/Common/MediaArrayInput";
import ReferenceActorInput from "../../components/Common/ReferenceActorInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../../components/Common/ReferenceArrayLinkInput";
import { ReferenceMediaDataGrid } from "../../components/Common/ReferenceMediaDataGrid";
import { TGPostButton } from "../../components/Common/TGPostButton";
import { WebPreviewButton } from "../../components/Common/WebPreviewButton";
import { ReferenceLinkTab } from "../../components/tabs/ReferenceLinkTab";
import { transformEvent } from "../../utils";

const deathEventsFilter = [
  <BooleanInput
    key="withDrafts"
    label="Draft only"
    source="withDrafts"
    alwaysOn
  />,
  <ReferenceActorInput key="victim" source="victim" alwaysOn />,
  <DateInput key="date" source="date" />,
];

export const DeathList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={deathEventsFilter}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false,
    }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <ReferenceField source="payload.victim" reference="actors">
        <AvatarField source="avatar" />
      </ReferenceField>
      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const DeathEventTitle: React.FC = () => {
  const record = useRecordContext<http.Events.Death.Death>();
  return (
    <span>
      Event: {record?.payload?.victim} on {record?.date.toString()}
    </span>
  );
};

export const DeathEventEditFormTab: React.FC = () => {
  return (
    <Box>
      <ReferenceActorInput source="payload.victim" />
    </Box>
  );
};

export const DeathEdit: React.FC = () => {
  const record = useRecordContext<http.Events.Death.Death>();

  return (
    <Edit
      title={<DeathEventTitle />}
      actions={
        <>
          <WebPreviewButton resource="/dashboard/events" source="id" />
          <TGPostButton id={record?.id} />
        </>
      }
      transform={(r) => transformEvent(r.id, r)}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <BooleanInput source="draft" defaultValue={false} />
          <ReferenceInput
            source="payload.victim"
            reference="actors"
            filterToQuery={(f) => ({ id: f })}
          >
            <SelectInput
              optionText={(r: any) => {
                if (r) {
                  return `${r.fullName}`;
                }
                return "Unknown";
              }}
            />
          </ReferenceInput>
          <DateInput source="date" />
          <ReactPageInput source="excerpt" onlyText />
          <ReferenceArrayKeywordInput
            source="keywords"
            defaultValue={[]}
            showAdd
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
        <FormTab label="Media">
          <ImportMediaButton />
          <MediaArrayInput source="newMedia" defaultValue={[]} fullWidth />
          <ReferenceMediaDataGrid source="media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export const DeathCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Death Event"
    {...props}
    transform={(data) => transformEvent(uuid(), data)}
  >
    <SimpleForm>
      <BooleanInput source="draft" defaultValue={false} />
      <ReactPageInput source="excerpt" onlyText />
      <ReactPageInput source="body" />
      <ReferenceInput
        source="payload.victim"
        reference="actors"
        filterToQuery={(fullName) => ({ fullName })}
      >
        <AutocompleteInput source="id" optionText="fullName" />
      </ReferenceInput>
      <DateInput source="date" />
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} showAdd />
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
