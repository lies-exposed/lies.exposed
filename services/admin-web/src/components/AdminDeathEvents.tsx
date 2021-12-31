import GeometryType from "ol/geom/GeometryType";
import * as React from "react";
import {
  ArrayField,
  ArrayInput,
  AutocompleteInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  Resource,
  ResourceProps,
  SelectArrayInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import { MapInput } from "./Common/MapInput";
import ReactPageInput from "./Common/ReactPageInput";
import ReferenceActorInput from "./Common/ReferenceActorInput";
import ReferenceArrayActorInput from "./Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "./Common/ReferenceArrayGroupInput";
import ReferenceGroupInput from "./Common/ReferenceGroupInput";
import RichTextInput from "./Common/RichTextInput";

const RESOURCE = "events";

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
  <List {...props} filters={<DeathEventsFilter />} perPage={20}>
    <Datagrid rowClick="edit">
      <ReferenceField source="victim" reference="actors">
        <AvatarField source="avatar" />
      </ReferenceField>
      <TextField source="location.coordinates" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Deaths {record.victim}</span>;
};

export const DeathEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<EditTitle {...props} />}
    {...props}
    transform={(r) => {
      return {
        ...r,
        location: r.location ? JSON.parse(r.location) : undefined,
        victim: r.victim?.id,
      };
    }}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <ReferenceInput
          source="victim"
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
        <RichTextInput source="body" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="location" type={GeometryType.POINT} />
      </FormTab>
      <FormTab label="Suspects">
        <ReferenceArrayActorInput source="actors" />
        <ReferenceArrayField source="actors" reference="actors">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="fullName" />
            <AvatarField source="avatar" />
          </Datagrid>
        </ReferenceArrayField>

        <ReferenceArrayInput source="groupsMembers" reference="groups-members">
          <SelectArrayInput
            optionText={(m: any) => `${m.group.name} - ${m.actor.fullName}`}
          />
        </ReferenceArrayInput>
        <ReferenceArrayField source="groupsMembers" reference="groups-members">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <ImageField source="avatar" fullWidth={false} />
          </Datagrid>
        </ReferenceArrayField>
        <ReferenceArrayGroupInput source="groups" />
        <ReferenceArrayField source="groups" reference="groups">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <ImageField source="avatar" fullWidth={false} />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Images">
        <ArrayInput source="newImages">
          <SimpleFormIterator>
            <ImageInput source="location">
              <ImageField src="src" />
            </ImageInput>
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayField source="media">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <ImageField source="location" fullWidth={false} />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
      </FormTab>
      <FormTab label="Links">
        <ArrayField source="links">
          <Datagrid resource="links" rowClick="edit">
            <TextField source="id" />
            <TextField source="url" />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const DeathCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Death Event" {...props}>
    <SimpleForm>
      <ReferenceInput
        source="victim"
        reference="actors"
        filterToQuery={(fullName) => ({ fullName })}
      >
        <AutocompleteInput source="id" optionText="fullName" />
      </ReferenceInput>
      <DateInput source="date" />
    </SimpleForm>
  </Create>
);

export const AdminDeathEventsResource: React.FC<ResourceProps> = (props) => {
  return (
    <Resource
      {...props}
      name={RESOURCE}
      list={DeathList}
      edit={DeathEdit}
      create={DeathCreate}
    />
  );
};
