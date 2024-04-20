import { relationsTransformer } from "@liexp/react-page/lib/utils.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import {
  ArrayInput,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  FunctionField,
  ImageField,
  List,
  LoadingPage,
  ReferenceField,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useGetIdentity,
  usePermissions,
  type CreateProps,
  type EditProps,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { uploadImages } from "../../../client/admin/MediaAPI.js";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Box, Grid } from "../../mui/index.js";
import BlockNoteInput from "../BlockNoteInput.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { EditForm } from "../common/EditForm.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput.js";
import StoryPreview from "../previews/StoryPreview.js";
import ReferenceUserInput from "../user/ReferenceUserInput.js";
import { StoryRelationsBox } from "./StoryRelations.js";

export const StoryList: React.FC<ListProps> = (props) => {
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
        <FunctionField
          render={(record: any) => {
            return (
              <Box>
                <div>Links: {record.links.length}</div>
                <div>Media: {record.media.length}</div>
                <div>Actors: {record.actors.length}</div>
                <div>Groups: {record.groups.length}</div>
                <div>Keywords: {record.keywords.length}</div>
              </Box>
            );
          }}
        />

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

const transformStory =
  (apiProvider: APIRESTClient) =>
  (data: RaRecord): RaRecord | Promise<RaRecord> => {
    if (data.featuredImage?.rawFile) {
      return pipe(
        uploadImages(apiProvider)("stories", data.path, [
          data.featuredImage.rawFile,
        ]),
        TE.map((locations) => ({ ...data, featuredImage: locations[0] })),
        throwTE,
      );
    }

    const relations = relationsTransformer(data.body2);

    return { ...data, ...relations };
  };

export const StoryEdit: React.FC<EditProps> = (props) => {
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
      transform={transformStory(dataProvider)}
      preview={<StoryPreview />}
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

            <Grid item md={6}>
              <ReferenceMediaInput
                source="featuredImage.id"
                allowedTypes={ImageType.types.map((t) => t.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          <ArrayInput source="links">
            <SimpleFormIterator>
              <TextInput source="" />
            </SimpleFormIterator>
          </ArrayInput>
          <BlockNoteInput source="body2" onlyText={false} />
        </FormTab>
        <FormTab label="Relations">
          <StoryRelationsBox />
        </FormTab>
        <FormTab label="Social Posts">
          <SocialPostFormTabContent type="stories" source="id" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const StoryCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();

  return (
    <Create
      title="Create an Article"
      {...props}
      transform={transformStory(dataProvider)}
    >
      <SimpleForm>
        <BooleanInput source="draft" />
        <TextInput source="title" fullWidth={true} />
        <TextInput source="path" fullWidth={true} />
        <ReferenceArrayKeywordInput source="keywords" showAdd={true} />
        <ReferenceMediaInput
          source="featuredImage"
          allowedTypes={ImageType.types.map((t) => t.value)}
        />
        <DateInput source="date" />
        <ArrayInput source="links">
          <SimpleFormIterator>
            <TextInput source="" />
          </SimpleFormIterator>
        </ArrayInput>
        <BlockNoteInput source="body2" />
      </SimpleForm>
    </Create>
  );
};
