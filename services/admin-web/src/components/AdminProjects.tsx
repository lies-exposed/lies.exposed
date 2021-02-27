import GeometryType from "ol/geom/GeometryType";
import * as React from "react";
import {
  ArrayField,
  ArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FileInput,
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  ReferenceArrayField,
  required,
  SimpleForm,
  SimpleFormIterator,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import { AreaEdit } from "./AdminAreas";
import { MapField } from "./Common/MapField";
import { MapInput } from "./Common/MapInput";
import MarkdownInput from "./Common/MarkdownInput";

const RESOURCE = "projects";

export const ProjectList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <DateField source="startDate" />
      <DateField source="endDate" emptyText="-" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Project {record.title}</span>;
};

export const ProjectEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="name" />
        <ColorInput source="color" />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Location">
        <ArrayInput source="newAreas">
          <SimpleFormIterator>
            <TextInput source="label" />
            <ColorInput source="color" />
            <MapInput source="geometry" type={GeometryType.POLYGON} />
            <MarkdownInput source="body" />
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayField source="areas" fieldKey="id" resource="areas">
          <SingleFieldList>
            <MapField source="geometry" type={GeometryType.POLYGON} />
          </SingleFieldList>
        </ArrayField>
      </FormTab>
      <FormTab label="images">
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
      <FormTab label="Body">
        <MarkdownInput source="body" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const ProjectCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Post" {...props}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <ColorInput source="color" validate={[required()]} />
      <DateInput source="startDate" validate={[required()]} />
      <DateInput source="endDate" />
      <MapInput source="areas" type={GeometryType.POLYGON} />
      <MarkdownInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
