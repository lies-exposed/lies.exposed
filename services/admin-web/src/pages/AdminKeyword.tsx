import { toColor } from "@liexp/shared/lib/utils/colors";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput";
import { KeywordTGPostButton } from "@liexp/ui/lib/components/admin/keywords/button/KeywordTGPostButton";
import ReferenceManyLinkField from "@liexp/ui/lib/components/admin/links/ReferenceManyLinkField";
import ReferenceManyMediaField from "@liexp/ui/lib/components/admin/media/ReferenceManyMediaField";
import {
  Create,
  Datagrid,
  DateField,
  Edit,
  FormTab,
  FunctionField,
  List,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  type CreateProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin";
import { Stack } from "@liexp/ui/lib/components/mui";
import * as React from "react";

const RESOURCE = "keywords";

const keywordsFilter = [<TextInput key="search" source="search" alwaysOn />];

export const KeywordList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE} filters={keywordsFilter} perPage={20}>
    <Datagrid
      rowClick="edit"
      rowSx={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <TextField source="tag" />
      <FunctionField
        source="socialPosts"
        render={(k) => {
          return (k.socialPosts ?? []).length;
        }}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC = () => {
  const record = useRecordContext();

  return <span>Keyword {record?.title}</span>;
};

export const KeywordEdit: React.FC = () => {
  return (
    <Edit
      title={<EditTitle />}
      actions={
        <Stack>
          <KeywordTGPostButton />
        </Stack>
      }
      transform={({ newEvents, ...r }) => {
        return {
          ...r,
          color: toColor(r.color),
          events: (r.events ?? []).concat(newEvents ?? []),
        };
      }}
    >
      <TabbedForm>
        <FormTab label="general">
          <TextInput source="tag" />
          <ColorInput source="color" />
        </FormTab>
        <FormTab label="media">
          <ReferenceManyMediaField source="id" target="keywords[]" />
        </FormTab>
        <FormTab label="links">
          <ReferenceManyLinkField source="id" target="keywords[]" />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export const KeywordCreate: React.FC<CreateProps> = (props) => {
  return (
    <Create
      title="Create a Keyword"
      {...props}
      transform={(r) => ({
        ...r,
        color: r.color.replace("#", ""),
      })}
    >
      <SimpleForm>
        <TextInput source="tag" type="string" />
        <ColorInput source="color" />
      </SimpleForm>
    </Create>
  );
};
