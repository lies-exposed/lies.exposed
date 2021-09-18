import { http } from "@econnessione/shared/io";
import { ArticlePageContent } from "@econnessione/ui/components/ArticlePageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
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
  Edit,
  EditProps,
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  Record,
  required,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import MarkdownInput from "./Common/MarkdownInput";
import { apiProvider } from "client/HTTPAPI";
import { uploadImages } from "client/MediaAPI";

export const ArticleList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filterDefaultValues={{ draft: undefined }}
    filter={{ draft: undefined }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <TextField source="title" />
      <TextField source="path" />
      <ImageField source="featuredImage" />
      <DateField source="date" showTime={true} />
      <DateField source="createdAt" showTime={true} />
      <DateField source="updatedAt" showTime={true} />
    </Datagrid>
  </List>
);

const transformArticle = (data: Record): Record | Promise<Record> => {
  if (data.featuredImage?.rawFile) {
    return pipe(
      uploadImages(apiProvider)("articles", data.path, [
        data.featuredImage.rawFile,
      ]),
      TE.map((locations) => ({ ...data, featuredImage: locations[0] }))
    )().then((result) => {
      if (E.isLeft(result)) {
        throw result.left;
      }
      return result.right;
    });
  }
  return data;
};
export const ArticleEdit: React.FC<EditProps> = (props) => (
  <Edit {...props} transform={transformArticle}>
    <TabbedForm>
      <FormTab label="generals">
        <BooleanInput source="draft" />
        <TextInput source="title" fullWidth={true} />
        <TextInput source="path" fullWidth={true} />
        <ImageInput source="featuredImage">
          <ImageField source="src" />
        </ImageInput>
        <ImageField source="featuredImage" />
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
              E.fold(ValidationErrorsLayout, (p) => (
                <ArticlePageContent {...p} />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const ArticleCreate: React.FC<CreateProps> = (props) => {
  return (
    <Create title="Create an Article" {...props} transform={transformArticle}>
      <SimpleForm>
        <BooleanInput source="draft" />
        <TextInput source="title" fullWidth={true} />
        <TextInput source="path" fullWidth={true} />
        <ImageInput source="featuredImage">
          <ImageField source="src" title="title" />
        </ImageInput>
        <DateInput source="date" />
        <ArrayInput source="links">
          <SimpleFormIterator>
            <TextInput source="" />
          </SimpleFormIterator>
        </ArrayInput>
        <MarkdownInput source="body" validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};
