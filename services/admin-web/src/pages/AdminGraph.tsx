import { GraphType } from "@liexp/shared/lib/io/http/graphs/Graph.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import JSONInput from "@liexp/ui/lib/components/Common/JSON/JSONInput.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import { GraphBuilderInput } from "@liexp/ui/lib/components/admin/graphs/GraphBuilderInput.js";
import { SearchLinksButton } from "@liexp/ui/lib/components/admin/links/SearchLinksButton.js";
import GraphPreview from "@liexp/ui/lib/components/admin/previews/GraphPreview.js";
import {
  Create,
  Datagrid,
  DateField,
  FormTab,
  List,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  type CreateProps,
  type EditProps,
  type RaRecord,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const actorFilters = [
  <TextInput key="label" label="label" source="q" alwaysOn size="small" />,
];

export const GraphList: React.FC = () => (
  <List
    resource="graphs"
    filters={actorFilters}
    perPage={50}
    sort={{ field: "createdAt", order: "DESC" }}
  >
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="label" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);

const transformGraph =
  (dataProvider: APIRESTClient) =>
  async (id: string, data: RaRecord): Promise<RaRecord> => {
    return Promise.resolve({ ...data, id });
  };

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Actor {record?.label}</span>;
};

const EditActions: React.FC = () => {
  const record = useRecordContext();
  return (
    <>{record?.label ? <SearchLinksButton query={record.label} /> : null}</>
  );
};

const GraphTypeInput: React.FC = () => {
  return (
    <SelectInput
      source="type"
      label="Graph Type"
      choices={GraphType.types.map((t) => ({ id: t.value, name: t.value }))}
    />
  );
};

export const GraphEdit: React.FC<EditProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      {...props}
      title={<EditTitle />}
      actions={<EditActions />}
      preview={<GraphPreview />}
      transform={(graph) => transformGraph(dataProvider)(graph.id, graph)}
    >
      <TabbedForm>
        <FormTab label="generals">
          <TextWithSlugInput source="label" />
          <BlockNoteInput source="excerpt" onlyText={true} />
          <DateField source="createdAt" />
          <DateField source="updatedAt" />
        </FormTab>
        <FormTab label="Data">
          <GraphTypeInput />
          <GraphBuilderInput source="data" />
          <JSONInput source="data" />
        </FormTab>

        <FormTab label="Content">
          <BlockNoteInput source="body" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const GraphCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      {...props}
      title="Create a Graph"
      transform={(a: any) => transformGraph(dataProvider)(uuid(), a)}
    >
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid
            item
            md={6}
            sm={12}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <TextWithSlugInput source="label" />
            <GraphTypeInput />
            <JSONInput source="data" label="Data" />
            <GraphBuilderInput source="data" />
          </Grid>
          <Grid item md={12}>
            <BlockNoteInput source="excerpt" onlyText={true} />
            <BlockNoteInput source="body" />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};
