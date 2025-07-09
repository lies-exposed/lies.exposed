import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { relationsTransformer } from "@liexp/shared/lib/providers/blocknote/transform.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { uploadImages } from "../../../client/admin/MediaAPI.js";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Box, Grid, Stack } from "../../mui/index.js";
import BlockNoteInput from "../BlockNoteInput.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { EditForm } from "../common/EditForm.js";
import { TextWithSlugInput } from "../common/inputs/TextWithSlugInput.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput.js";
import StoryPreview from "../previews/StoryPreview.js";
import {
  ArrayInput,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
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
  useRecordContext,
  type CreateProps,
  type EditProps,
  type ListProps,
  type RaRecord,
} from "../react-admin.js";
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
        <Stack direction="row">
          <ImageField source="featuredImage.location" />
          <Stack direction={"column"}>
            <TextField source="title" />
            <TextField source="path" />
          </Stack>
        </Stack>

        <FunctionField
          render={(record) => {
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

const StoryTitle: React.FC = () => {
  const record = useRecordContext();
  return <div>Story: {record?.title}</div>;
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
      transform={(data) => transformStory(dataProvider)(data)}
      preview={<StoryPreview />}
      title={<StoryTitle />}
    >
      <TabbedForm>
        <TabbedForm.Tab label="generals">
          <Stack display="flex" direction="column" width="100%">
            <Grid
              size={12}
              container
              width="100%"
              alignItems={"center"}
              justifyContent={"space-evenly"}
              spacing={2}
            >
              <Grid size={6}>
                <Stack width="100%">
                  <TextWithSlugInput
                    source="title"
                    slugSource="path"
                    fullWidth
                  />
                  <DateInput source="date" />
                  <ReferenceMediaInput
                    source="featuredImage.id"
                    allowedTypes={ImageType.members.map((t) => t.literals[0])}
                    fullWidth
                  />
                </Stack>
              </Grid>
              <Grid size={6}>
                <Stack direction="column" alignItems={"flex-end"}>
                  <BooleanInput source="draft" />
                  {isAdmin ? (
                    <ReferenceUserInput source="creator" fullWidth />
                  ) : (
                    <TextInput
                      source="creator"
                      defaultValue={data?.id}
                      hidden
                      fullWidth
                    />
                  )}
                  <ReferenceArrayKeywordInput
                    source="keywords"
                    showAdd={true}
                    fullWidth
                  />
                </Stack>
              </Grid>
            </Grid>
            <ArrayInput source="links">
              <SimpleFormIterator>
                <TextInput source="" />
              </SimpleFormIterator>
            </ArrayInput>
            <BlockNoteInput source="body2" onlyText={false} />
          </Stack>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Relations">
          <StoryRelationsBox />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Social Posts">
          <SocialPostFormTabContent type="stories" source="id" />
        </TabbedForm.Tab>
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
        <TextWithSlugInput source="title" slugSource="path" fullWidth />
        <ReferenceArrayKeywordInput source="keywords" showAdd={true} />
        <ReferenceMediaInput
          source="featuredImage"
          allowedTypes={ImageType.members.map((t) => t.literals[0])}
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
