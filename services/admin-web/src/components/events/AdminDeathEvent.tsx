import { Death } from "@econnessione/shared/io/http/Events";
import ReactPageInput from "@econnessione/ui/components/admin/ReactPageInput";
// import GeometryType from "ol/geom/GeometryType";
import {
  MapInput,
  MapInputType
} from "@econnessione/ui/src/components/admin/MapInput";
import * as React from "react";
import {
  ArrayField,
  ArrayInput,
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
  ImageField,
  ImageInput,
  List,
  ListProps,
  Record,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput
} from "react-admin";
import { AvatarField } from "../Common/AvatarField";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceActorInput from "../Common/ReferenceActorInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";

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

export const transformDeathEvent = (id: string, data: Record): Record => {
  // eslint-disable-next-line no-console
  console.log("trasform death event", data);

  return {
    ...data,
    id,
    payload: {
      ...data.payload,
      victim: data.payload.victim,
    },
  };
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
  <Create
    title="Create a Death Event"
    {...props}
    transform={(data) => transformDeathEvent("", {
      ...data,
      media: []
    })}
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
        source="media"
        fullWidth={true}
        defaultValue={[]}
      />
    </SimpleForm>
  </Create>
);
