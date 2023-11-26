import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  useDataProvider,
  type CreateProps,
  Link,
} from "react-admin";
import { transformMedia } from "../../../client/admin/MediaAPI";
import { MediaInput } from "./input/MediaInput";

export const MediaCreate: React.FC<CreateProps> = (props) => {
  const apiProvider = useDataProvider();

  return (
    <Create
      title="Create a Media"
      {...props}
      transform={(r: any) => transformMedia(apiProvider)({ ...r, id: uuid() })}
      actions={
        <div>
          <Link to="/media/multiple">Multiple upload</Link>
        </div>
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
