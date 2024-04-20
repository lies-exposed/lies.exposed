import { Kind } from "@liexp/shared/lib/io/http/ProjectImage.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { ProjectPageContent } from "@liexp/ui/lib/components/ProjectPageContent.js";
import { ValidationErrorsLayout } from "@liexp/ui/lib/components/ValidationErrorsLayout.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceAreaInput from "@liexp/ui/lib/components/admin/areas/input/ReferenceAreaInput.js";
import RichTextInput from "@liexp/ui/lib/components/admin/common/RichTextInput.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import {
  ArrayField,
  ArrayInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  required,
  type CreateProps,
  type EditProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";

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
      {/* <FormTab label="Location">

        <ArrayInput source="newAreas">
          <SimpleFormIterator>
            <TextInput source="label" />
            <MapInput source="geometry" type={GeometryType.POLYGON} />
            <RichTextInput source="body" />
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayField source="areas" resource="areas">
          <SingleFieldList>
            <MapField source="geometry" type={GeometryType.POLYGON} />
          </SingleFieldList>
        </ArrayField>
      </FormTab> */}
      <FormTab label="media">
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
        <ArrayField source="media">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="kind" />
            <ImageField source="location" fullWidth={false} />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
      </FormTab>
      <FormTab label="Body">
        <RichTextInput source="body" />
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
                    Protest: [],
                    Death: [],
                    Book: [],
                    PublicAnnouncement: [],
                    Uncategorized: [],
                    Transaction: [],
                  }}
                />
              )),
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
          <ReferenceAreaInput source="payload.location" />
          <RichTextInput source="body" />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="media">
        <SimpleFormIterator>
          <ImageInput source="location" />
        </SimpleFormIterator>
      </ArrayInput>

      <BlockNoteInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
