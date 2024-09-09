import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as React from "react";
import { transformMedia } from "../../../client/admin/MediaAPI.js";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { useNavigateTo } from "../../../utils/history.utils.js";
import { Stack } from "../../mui/index.js";
import {
  Button,
  Create,
  SimpleForm,
  TextInput,
  required,
  type CreateProps,
} from "../react-admin.js";
import { MediaInput } from "./input/MediaInput.js";

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
