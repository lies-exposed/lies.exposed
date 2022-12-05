import { throwTE } from "@liexp/shared/utils/task.utils";
import { uploadImages } from "@liexp/ui/client/admin/MediaAPI";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import ReferenceMediaInput from "@liexp/ui/components/admin/common/ReferenceMediaInput";
import ArticlePreview from "@liexp/ui/components/admin/previews/ArticlePreview";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as React from "react";
import {
  ArrayInput,
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DataProvider,
  DateField,
  DateInput,
  EditProps,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  RaRecord,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
} from "react-admin";

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

const transformArticle =
  (apiProvider: DataProvider) =>
  (data: RaRecord): RaRecord | Promise<RaRecord> => {
    if (data.featuredImage?.rawFile) {
      return pipe(
        uploadImages(apiProvider)("articles", data.path, [
          data.featuredImage.rawFile,
        ]),
        TE.map((locations) => ({ ...data, featuredImage: locations[0] })),
        throwTE
      );
    }
    return data;
  };
export const ArticleEdit: React.FC<EditProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      {...props}
      transform={transformArticle(dataProvider)}
      preview={<ArticlePreview />}
    >
      <TabbedForm>
        <FormTab label="generals">
          <BooleanInput source="draft" />
          <TextInput source="title" fullWidth={true} />
          <TextInput source="path" fullWidth={true} />

          <ReferenceMediaInput
            source="featuredImage.id"
            allowedTypes={["image/jpeg", "image/jpg", "image/png"]}
          />
          <DateInput source="date" />
          <ArrayInput source="links">
            <SimpleFormIterator>
              <TextInput source="" />
            </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="body" />
          <ReactPageInput source="body2" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

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
        <ReactPageInput source="body2"  />
      </SimpleForm>
    </Create>
  );
};
