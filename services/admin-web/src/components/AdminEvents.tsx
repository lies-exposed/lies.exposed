import { EventPageContent } from "@econnessione/shared/components/EventPageContent";
import { http } from "@econnessione/shared/io";
import { renderValidationErrors } from "@econnessione/shared/utils/renderValidationErrors";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import GeometryType from "ol/geom/GeometryType";
import * as React from "react";
import {
  ArrayField,
  ArrayInput,
  ChipField,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  ReferenceArrayField,
  ReferenceArrayInput,
  required,
  SelectArrayInput,
  SimpleForm,
  SimpleFormIterator,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import { MapInput } from "./Common/MapInput";
import MarkdownInput from "./Common/MarkdownInput";

const RESOURCE = "events";

const EventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput label="Search" source="q" alwaysOn />
      <ReferenceArrayInput source="groupIds" reference="groups">
        <SelectArrayInput optionText="name" />
      </ReferenceArrayInput>
    </Filter>
  );
};

export const EventList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE} filters={<EventsFilter />}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <TextField source="location.coordinates" />
      <ReferenceArrayField source="groupsMembers" reference="groups-members">
        <SingleFieldList>
          <AvatarField source="actor.avatar" />
        </SingleFieldList>
      </ReferenceArrayField>
      <ReferenceArrayField source="actors" reference="actors">
        <SingleFieldList>
          <AvatarField source="avatar" />
        </SingleFieldList>
      </ReferenceArrayField>
      <ReferenceArrayField source="groups" reference="groups">
        <SingleFieldList>
          <AvatarField source="avatar" />
        </SingleFieldList>
      </ReferenceArrayField>
      <DateField source="startDate" />
      <DateField source="endDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Events {record.fullName}</span>;
};

export const EventEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="title" />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <MarkdownInput source="body" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="location" type={GeometryType.POINT} />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayInput source="actors" reference="actors">
          <SelectArrayInput optionText="fullName" />
        </ReferenceArrayInput>
        <ReferenceArrayField source="actors" reference="actors">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="fullName" />
            <AvatarField source="avatar" />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Group Members">
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
      </FormTab>
      <FormTab label="Group Members">
        <ReferenceArrayInput source="groups-members" reference="groups-members">
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
      </FormTab>
      <FormTab label="Group Members">
        <ReferenceArrayInput source="groups-members" reference="groups-members">
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
      </FormTab>
      <FormTab label="Groups">
        <ReferenceArrayInput source="groups" reference="groups">
          <SelectArrayInput optionText="name" />
        </ReferenceArrayInput>
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

        <ArrayField source="images">
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
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              http.Events.Uncategorized.Uncategorized.decode(formData),
              E.fold(renderValidationErrors, (p) => (
                <EventPageContent event={p} actors={[]} groups={[]} />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const EventCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Event" {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <MapInput source="location" type={GeometryType.POINT} />
      <DateInput
        source="startDate"
        validation={[required()]}
        defaultValue={new Date()}
      />
      <DateInput source="endDate" />
      <MarkdownInput source="body" defaultValue="" />
    </SimpleForm>
  </Create>
);
