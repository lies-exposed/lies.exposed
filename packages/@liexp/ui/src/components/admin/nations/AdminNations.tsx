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
import { Grid, Stack } from "../../mui/index.js";
import BlockNoteInput from "../BlockNoteInput.js";
import { EditForm } from "../common/EditForm.js";
import { MediaInput } from "../media/input/MediaInput.js";
import StoryPreview from "../previews/StoryPreview.js";
import {
  Create,
  Datagrid,
  DateField,
  FunctionField,
  ImageField,
  List,
  LoadingPage,
  SimpleForm,
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
import { FlagIconField } from "./FlagIconField.js";

const nationListFilters = [<TextInput source="q" label="Name" alwaysOn />];

export const NationList: React.FC<ListProps> = (props) => {
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
      filters={nationListFilters}
    >
      <Datagrid rowClick="edit">
        <Stack direction="row">
          <ImageField source="flag" />
          <FlagIconField source="isoCode" />
          <Stack direction={"column"}>
            <TextField source="name" />
          </Stack>
        </Stack>
        <FunctionField
          source="actors"
          render={(record) => {
            return <div>Actors: {record.actors.length}</div>;
          }}
        />
        <DateField source="createdAt" showTime={true} />
        <DateField source="updatedAt" showTime={true} />
      </Datagrid>
    </List>
  );
};

const transformNation =
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

const NationTitle: React.FC = () => {
  const record = useRecordContext();
  return <div>Nation: {record?.name}</div>;
};

export const NationEdit: React.FC<EditProps> = (props) => {
  const dataProvider = useDataProvider();
  const { isLoading } = useGetIdentity();
  const { isLoading: isPermsLoading } = usePermissions();
  if (isLoading || isPermsLoading) {
    return <LoadingPage />;
  }

  return (
    <EditForm
      {...props}
      transform={(data) => transformNation(dataProvider)(data)}
      preview={<StoryPreview />}
      title={<NationTitle />}
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
                  <TextInput source="name" />
                </Stack>
              </Grid>
              <Grid size={6}>
                <Stack direction="column" alignItems={"flex-end"}></Stack>
              </Grid>
            </Grid>

            <BlockNoteInput source="body" onlyText={false} />
          </Stack>
        </TabbedForm.Tab>
      </TabbedForm>
    </EditForm>
  );
};

export const NationCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();

  return (
    <Create
      title="Add a Nation"
      {...props}
      transform={transformNation(dataProvider)}
    >
      <SimpleForm>
        <TextInput source="name" />
        <MediaInput
          source="flag"
          supportedTypes={ImageType.members.map((t) => t.literals[0])}
        />
        <BlockNoteInput source="body" />
      </SimpleForm>
    </Create>
  );
};
