import { Death } from "@econnessione/shared/io/http/Events";
import { uuid } from "@econnessione/shared/utils/uuid";
import ReactPageInput from "@econnessione/ui/components/admin/ReactPageInput";
import {
  MapInput,
  MapInputType,
} from "@econnessione/ui/src/components/admin/MapInput";
import * as React from "react";
import {
  AutocompleteInput,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormTab,
  List,
  ListProps,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "../Common/AvatarField";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceActorInput from "../Common/ReferenceActorInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import { WebPreviewButton } from "../Common/WebPreviewButton";
import { transformEvent } from "./utils";

const DeathEventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="type" value="Death" />
      <ReferenceActorInput source="victim" alwaysOn />
      <DateInput source="date" />
    </Filter>
  );
};

export const DeathList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={<DeathEventsFilter />}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
    }}
  >
    <Datagrid rowClick="edit">
      <ReferenceField source="payload.victim" reference="actors">
        <AvatarField source="avatar" />
      </ReferenceField>
      <TextField source="payload.location.coordinates" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const DeathEventTitle: React.FC<{ record: Death.Death }> = ({
  record,
}) => {
  return (
    <span>
      Event: {record.payload.victim} on {record.date}
    </span>
  );
};

export const DeathEventEditFormTab: React.FC<EditProps> = (
  props: EditProps
) => (
  <FormTab label="Payload" {...props}>
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const DeathEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<DeathEventTitle {...(props as any)} />}
    {...props}
    transform={(r) => transformEvent(r.id as any, r)}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <WebPreviewButton resource="/dashboard/events" source="id" />
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
        <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
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
        <MediaArrayInput source="newMedia" defaultValue={[]} fullWidth />
      </FormTab>
      <FormTab label="Links">
        <ReferenceArrayLinkInput source="links" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

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
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
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
