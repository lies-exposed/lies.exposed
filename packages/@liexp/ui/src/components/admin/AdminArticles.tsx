import { throwTE } from "@liexp/shared/utils/task.utils";
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
  List,
  ListProps,
  LoadingPage,
  RaRecord,
  ReferenceField,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useGetIdentity,
  usePermissions,
} from "react-admin";
import { uploadImages } from "../../client/admin/MediaAPI";
import { checkIsAdmin } from "../../utils/user.utils";
import {Grid} from '../mui'
import ReactPageInput from "./ReactPageInput";
import { EditForm } from "./common/EditForm";
import ReferenceArrayKeywordInput from "./common/ReferenceArrayKeywordInput";
import ReferenceUserInput from "./common/ReferenceUserInput";
import ReferenceMediaInput from "./media/ReferenceMediaInput";
import ArticlePreview from "./previews/ArticlePreview";

export const ArticleList: React.FC<ListProps> = (props) => {
  const { data, isLoading } = useGetIdentity();
  const { permissions, isLoading: isPermsLoading } = usePermissions();

  if (isLoading || isPermsLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);
  const filter = !isAdmin && data?.id ? { creator: data.id } : {};
  return (
    <List
      {...props}
      filterDefaultValues={{ draft: undefined }}
      filter={{ ...filter }}
    >
      <Datagrid rowClick="edit">
        <TextField source="title" />
        <ImageField source="featuredImage.location" />
        <TextField source="path" />
        {isAdmin && (
          <ReferenceField source="creator" reference="users">
            <TextField source="username" />
          </ReferenceField>
        )}
        <DateField source="date" showTime={true} />
        <BooleanField source="draft" />
        <DateField source="createdAt" showTime={true} />
        <DateField source="updatedAt" showTime={true} />
      </Datagrid>
    </List>
  );
};

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
  const { data, isLoading } = useGetIdentity();
  const { permissions, isLoading: isPermsLoading } = usePermissions();

  if (isLoading || isPermsLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);

  return (
    <EditForm
      {...props}
      transform={transformArticle(dataProvider)}
      preview={<ArticlePreview />}
    >
      <TabbedForm>
        <FormTab label="generals">
          <Grid container>
            <Grid item md={6}>
              <TextInput source="title" fullWidth={true} />
              <TextInput source="path" fullWidth={true} />
              <DateInput source="date" />
            </Grid>
            <Grid
              item
              md={6}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <BooleanInput source="draft" />
              {isAdmin ? (
                <ReferenceUserInput source="creator" />
              ) : (
                <TextInput source="creator" defaultValue={data?.id} hidden />
              )}
              <ReferenceArrayKeywordInput source="keywords" showAdd={true} />
            </Grid>
          </Grid>

          <ReferenceMediaInput
            source="featuredImage.id"
            allowedTypes={["image/jpeg", "image/jpg", "image/png"]}
          />

          <ArrayInput source="links">
            <SimpleFormIterator>
              <TextInput source="" />
            </SimpleFormIterator>
          </ArrayInput>
          <ReactPageInput source="body2" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const ArticleCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();

  return (
    <Create
      title="Create an Article"
      {...props}
      transform={transformArticle(dataProvider)}
    >
      <SimpleForm>
        <BooleanInput source="draft" />
        <TextInput source="title" fullWidth={true} />
        <TextInput source="path" fullWidth={true} />
        <ReferenceArrayKeywordInput source="keywords" showAdd={true} />
        <ReferenceMediaInput
          source="featuredImage"
          allowedTypes={["image/jpeg", "image/jpg", "image/png"]}
        />
        <DateInput source="date" />
        <ArrayInput source="links">
          <SimpleFormIterator>
            <TextInput source="" />
          </SimpleFormIterator>
        </ArrayInput>
        <ReactPageInput source="body2" />
      </SimpleForm>
    </Create>
  );
};
