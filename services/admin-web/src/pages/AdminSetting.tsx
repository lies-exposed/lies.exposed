import JSONInput from "@liexp/ui/lib/components/Common/JSON/JSONInput.js";
import { SlugInput } from "@liexp/ui/lib/components/admin/common/inputs/SlugInput.js";
import {
  Edit,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  List,
  type ListProps,
  SimpleForm,
  TextField,
  FunctionField,
  type TransformData,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

export const SettingList: React.FC<ListProps> = (props) => (
  <List {...props} resource="settings">
    <Datagrid rowClick="edit">
      <TextField label="key" source="id" />
      <FunctionField
        render={(r) => {
          return JSON.stringify(r.value);
        }}
      />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
      <DateField label="Created At" source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const transformSetting: TransformData = (data) => ({
  ...data,
  value:
    typeof data.value === "string" ? data.value : JSON.stringify(data.value),
});

export const SettingEdit: React.FC<CreateProps> = (props) => (
  <Edit {...props} title="Create a custom setting" transform={transformSetting}>
    <SimpleForm>
      <SlugInput source="id" />
      <JSONInput
        source="value"
        parse={(p) => {
          return typeof p === "string" ? p : JSON.stringify(p);
        }}
        format={(v) => {
          return typeof v === "string" ? JSON.parse(v) : v;
        }}
      />
    </SimpleForm>
  </Edit>
);

export const SettingCreate: React.FC<CreateProps> = (props) => (
  <Create
    {...props}
    title="Create a custom setting"
    transform={transformSetting}
  >
    <SimpleForm>
      <SlugInput source="id" />
      <JSONInput source="value" />
    </SimpleForm>
  </Create>
);
