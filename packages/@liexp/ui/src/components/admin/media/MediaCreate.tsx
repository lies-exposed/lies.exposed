import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as React from "react";
import { transformMedia } from "../../../client/admin/MediaAPI";
import { useNavigateTo } from "../../../utils/history.utils";
import { Stack } from "../../mui";
import {
  Button,
  Create,
  SimpleForm,
  TextInput,
  required,
  useDataProvider,
  type CreateProps,
} from "../react-admin";
import { MediaInput } from "./input/MediaInput";

export const MediaCreate: React.FC<CreateProps> = (props) => {
  const apiProvider = useDataProvider();
  const navigate = useNavigateTo();

  const handleNavigateToMediaMultiple = (): void => {
    navigate.navigate("/media/multiple");
  };
  return (
    <Create
      title="Create a Media"
      {...props}
      transform={(r: any) => transformMedia(apiProvider)({ ...r, id: uuid() })}
      actions={
        <Stack direction={"row"} spacing={2} padding={2}>
          <Button
            label="Multiple upload"
            color="secondary"
            variant="contained"
            size="small"
            onClick={handleNavigateToMediaMultiple}
          />
        </Stack>
      }
    >
      <SimpleForm>
        <MediaInput />
        <TextInput source="label" fullWidth validate={[required()]} />
        <TextInput source="description" multiline fullWidth />
      </SimpleForm>
    </Create>
  );
};
