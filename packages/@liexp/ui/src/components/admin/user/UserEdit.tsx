import { type User, UserStatus } from "@liexp/io/lib/http/User.js";
import * as React from "react";
// import { AvatarField } from "../common/AvatarField.js";
// import { MediaField } from "../media/MediaField.js";
import { Loader } from "../../Common/Loader.js";
import { Grid, Stack } from "../../mui/index.js";
import {
  Button,
  DateField,
  Edit,
  FormTab,
  SelectInput,
  TabbedForm,
  TextInput,
  useDataProvider,
  useRecordContext,
  type EditProps,
  type TabbedFormProps,
  useRefresh,
} from "../react-admin.js";
import { EditTitle } from "./EditTitle.js";

const UserTGTokenBox: React.FC<{ record?: User }> = ({ record }) => {
  const contextRecord = useRecordContext<User>();
  const currentRecord = record ?? contextRecord;
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const [generating, setGenerating] = React.useState(false);

  const onTokenGenerate = (): void => {
    setGenerating(true);
    void dataProvider
      .post("users/tg/token", { data: {} })
      .then(() => {
        refresh();
      })
      .finally(() => {
        setGenerating(false);
      });
  };

  return (
    <Stack direction={"column"}>
      {currentRecord?.telegramId ? (
        <TextInput
          source="telegramId"
          label="telegram id"
          contentEditable={false}
        />
      ) : (
        currentRecord?.telegramToken && (
          <div>
            <TextInput
              source="telegramToken"
              label="telegram token"
              contentEditable={false}
            />
          </div>
        )
      )}
      {generating ? (
        <Loader />
      ) : !currentRecord?.telegramToken ? (
        <Button
          label="generate TG token"
          variant="outlined"
          onClick={onTokenGenerate}
        />
      ) : null}
    </Stack>
  );
};

export const UserEditForm: React.FC<Omit<TabbedFormProps, "children">> = (
  props,
) => {
  return (
    <TabbedForm {...props}>
      <FormTab label="generals">
        <Grid container spacing={2}>
          <Grid size={{ md: 6 }}>
            <Stack direction={"column"}>
              <TextInput source="username" />
              <TextInput source="firstName" />
              <TextInput source="lastName" />

              <DateField source="createdAt" />
              <DateField source="updatedAt" />
            </Stack>
          </Grid>
          <Grid size={{ md: 6 }}>
            <Stack direction={"column"}>
              <SelectInput
                source="status"
                choices={UserStatus.members.map((t) => ({
                  id: t.literals[0],
                  name: t.literals[0],
                }))}
              />
              <UserTGTokenBox />
            </Stack>
          </Grid>
        </Grid>
      </FormTab>
    </TabbedForm>
  );
};

export const UserEdit: React.FC<EditProps> = (props) => {
  return (
    <Edit title={<EditTitle />} {...props}>
      <UserEditForm />
    </Edit>
  );
};
