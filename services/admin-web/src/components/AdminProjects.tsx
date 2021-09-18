import { http } from "@econnessione/shared/io";
import { Kind } from "@econnessione/shared/io/http/ProjectImage";
import { ProjectPageContent } from "@econnessione/ui/components/ProjectPageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
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
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  required,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
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
            <SelectInput
              source="kind"
              choices={Kind.types.map((t) => ({
                id: t.value,
                name: t.value,
              }))}
            />
            <TextInput source="description" />
            <ImageInput source="location">
              <ImageField src="src" />
            </ImageInput>
          </SimpleFormIterator>
        </ArrayInput>
        <ArrayField source="images">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="kind" />
            <ImageField source="location" fullWidth={false} />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
      </FormTab>
      <FormTab label="Body">
        <MarkdownInput source="body" />
      </FormTab>
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              http.Project.Project.decode(formData),
              E.fold(ValidationErrorsLayout, (p) => (
                <ProjectPageContent
                  {...p}
                  metadata={{
                    Arrest: [],
                    ProjectImpact: [],
                    Protest: [],
                    ProjectTransaction: [],
                    StudyPublished: [],
                    Death: [],
                    Condamned: [],
                    PublicAnnouncement: [],
                    Uncategorized: [],
                  }}
                />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const ProjectCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Project" {...props}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <ColorInput source="color" validate={[required()]} />
      <DateInput source="startDate" validate={[required()]} />
      <DateInput source="endDate" />
      <ArrayInput source="areas">
        <SimpleFormIterator>
          <TextInput source="label" />
          <MapInput source="geometry" type={GeometryType.POLYGON} />
          <MarkdownInput source="body" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="images">
        <SimpleFormIterator>
          <ImageInput source="location" />
        </SimpleFormIterator>
      </ArrayInput>

      <MarkdownInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
