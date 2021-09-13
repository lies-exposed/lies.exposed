import { EventPageContent } from "@econnessione/shared/components/EventPageContent";
import { http } from "@econnessione/shared/io";
import { Actor } from "@econnessione/shared/io/http/Actor";
import { renderValidationErrors } from "@econnessione/shared/utils/renderValidationErrors";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import GeometryType from "ol/geom/GeometryType";
import * as React from "react";
import {
  ArrayField,
  ArrayInput,
  AutocompleteArrayInput,
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
  FunctionField,
  ImageField,
  ImageInput,
  List,
  ListProps,
  Record,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceManyField,
  ReferenceField,
  required,
  SelectArrayInput,
  SimpleFormIterator,
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
      <ReferenceArrayInput source="groups" reference="groups" alwaysOn>
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
      <ReferenceArrayInput
        source="actors"
        reference="actors"
        alwaysOn
        filterToQuery={(q: string) => ({ fullName: q })}
      >
        <AutocompleteArrayInput
          optionText={(a: Partial<Actor>) =>
            a.id ? `${a.fullName}` : "No actor"
          }
        />
      </ReferenceArrayInput>
      <ReferenceArrayInput
        source="groupsMembers"
        reference="groups-members"
        filterToQuery={(q: string) => ({
          search: [q],
        })}
      >
        <AutocompleteArrayInput
          source="id"
          optionText={(r: any) => {
            return r?.actor && r?.group
              ? `${r.actor.fullName} ${r.group.name}`
              : "No group members";
          }}
        />
      </ReferenceArrayInput>
    </Filter>
  );
};

export const EventList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE} filters={<EventsFilter />} perPage={20}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <TextField source="location.coordinates" />
      <FunctionField
        source="groups"
        render={(r: Record | undefined) => (r ? r.actors.length : 0)}
      />
      <FunctionField
        sourc="groups"
        render={(r: Record | undefined) => (r ? r.groups.length : 0)}
      />
      <FunctionField source="links" render={(r: any) => r.links.length} />
      <DateField source="startDate" />
      <DateField source="endDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Events {record.title}</span>;
};

export const EventEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<EditTitle {...props} />}
    {...props}
    transform={(r) => {
      const actors = r.actors.concat(r.newActors ?? []);
      const groups = r.groups.concat(r.newGroups ?? []);
      const links = r.links.concat(r.newLinks ?? []);
      return {
        ...r,
        endDate: r.endDate === "" ? undefined : r.endDate,
        actors,
        groups,
        links,
      };
    }}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <TextInput source="title" />
        <MarkdownInput source="body" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="location" type={GeometryType.POINT} />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayInput
          source="newActors"
          reference="actors"
          filterToQuery={(q: string) => ({ fullName: q })}
        >
          <AutocompleteArrayInput source="id" optionText="fullName" />
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
        <ReferenceArrayInput
          source="newGroupsMembers"
          reference="groups-members"
        >
          <AutocompleteArrayInput
            source="id"
            optionText={(m: any) => `${m.group.name} - ${m.actor.fullName}`}
          />
        </ReferenceArrayInput>
        <ReferenceManyField target="groupsMembers" reference="groups-members">
          <Datagrid rowClick="edit">
            <ReferenceField source="id" reference="groups-members">
              <TextField source="id" />
            </ReferenceField>
            <TextField source="actor.fullName" />
            <TextField source="group.name" />
            <DateField source="startDate" />
          </Datagrid>
        </ReferenceManyField>
      </FormTab>
      <FormTab label="Groups">
        <ReferenceArrayInput source="newGroups" reference="groups">
          <AutocompleteArrayInput source="id" optionText="name" />
        </ReferenceArrayInput>
        <ReferenceManyField target="groups" reference="groups">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <ImageField source="avatar" fullWidth={false} />
          </Datagrid>
        </ReferenceManyField>
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
        <ArrayInput source="newLinks">
          <SimpleFormIterator>
            <TextInput type="url" source="url" />
            <TextInput source="description" />
          </SimpleFormIterator>
        </ArrayInput>
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
                <EventPageContent
                  event={p}
                  actors={[]}
                  groups={[]}
                  links={[]}
                />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const EventCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Event"
    {...props}
    transform={async (data) => {
      return {
        ...data,
        avatar: undefined,
        endDate: data.endDate.length > 0 ? data.endDate : undefined,
        links: data.links.map((l: { url: string }) => l.url),
      };
    }}
  >
    <TabbedForm>
      <FormTab label="General">
        <TextInput source="title" />
        <MapInput source="location" type={GeometryType.POINT} />
        <DateInput
          source="startDate"
          validation={[required()]}
          defaultValue={new Date()}
        />
        <DateInput source="endDate" />
        <MarkdownInput source="body" defaultValue="" />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayInput
          source="actors"
          reference="actors"
          defaultValue={[]}
        >
          <SelectArrayInput optionText="fullName" />
        </ReferenceArrayInput>
      </FormTab>
      <FormTab label="Group Members">
        <ReferenceArrayInput
          source="groupsMembers"
          reference="groups-members"
          defaultValue={[]}
        >
          <SelectArrayInput
            optionText={(m: any) => `${m.group.name} - ${m.actor.fullName}`}
          />
        </ReferenceArrayInput>
      </FormTab>
      <FormTab label="Groups">
        <ReferenceArrayInput
          source="groups"
          reference="groups"
          defaultValue={[]}
        >
          <SelectArrayInput optionText="name" />
        </ReferenceArrayInput>
      </FormTab>
      <FormTab label="Links">
        <ArrayInput source="links">
          <SimpleFormIterator>
            <TextInput type="url" source="url" />
            <TextInput source="description" />
          </SimpleFormIterator>
        </ArrayInput>
      </FormTab>
    </TabbedForm>
  </Create>
);
