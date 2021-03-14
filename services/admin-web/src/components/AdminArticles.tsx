import { ArticlePageContent } from "@econnessione/shared/components/ArticlePageContent";
import { http } from "@econnessione/shared/io";
import { renderValidationErrors } from "@econnessione/shared/utils/renderValidationErrors";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import {
  ArrayInput,
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  DateTimeInput,
  Edit,
  EditProps,
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  required,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import MarkdownInput from "./Common/MarkdownInput";

export const ArticleList: React.FC<ListProps> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <TextField source="title" />
      <TextField source="slug" />
      <ImageField source="featuredImage" />
      <DateField source="date" showTime={true} />
      <DateField source="createdAt" showTime={true} />
      <DateField source="updatedAt" showTime={true} />
    </Datagrid>
  </List>
);

export const ArticleEdit: React.FC<EditProps> = (props) => (
  <Edit {...props}>
    <TabbedForm>
      <FormTab label="generals">
        <BooleanInput source="draft" />
        <TextInput source="title" fullWidth={true} />
        <TextInput source="slug" fullWidth={true} />
        <ImageInput source="featuredImage" />
        <DateInput source="date" />
        <ArrayInput source="links">
          <SimpleFormIterator>
            <TextInput source="" />
          </SimpleFormIterator>
        </ArrayInput>
        <MarkdownInput source="body" />
      </FormTab>

      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              http.Article.Article.decode({ ...formData, links: [] }),
              E.fold(renderValidationErrors, (p) => (
                <ArticlePageContent
                  {...p}
                  events={[]}
                  projects={[]}
                  funds={[]}
                  onMemberClick={() => {}}
                />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const ArticleCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create an Article" {...props}>
    <SimpleForm>
      <BooleanInput source="draft" />
      <TextInput source="title" fullWidth={true} />
      <TextInput source="path" fullWidth={true} />
      <ImageInput source="featuredImage" />
      <DateTimeInput source="date" />
      <ArrayInput source="links">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>
      <MarkdownInput source="body" validate={[required()]} />
    </SimpleForm>
  </Create>
);
