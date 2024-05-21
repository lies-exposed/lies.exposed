import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import { ReferenceBySubjectField } from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectField.js";
import ReferenceBySubjectInput from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectInput.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { QuoteEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/QuoteEditFormTab.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  List,
  SimpleForm,
  TextInput,
  type CreateProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const quotesFilter = [
  <ReferenceArrayActorInput key="actors" source="actors" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <DateInput key="date" source="date" alwaysOn />,
];

export const QuoteList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={quotesFilter}
    perPage={25}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      draft: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <ReferenceBySubjectField source="payload.subject" />
      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const QuoteEdit: React.FC = () => {
  return <EditEventForm>{() => <QuoteEditFormTab />}</EditEventForm>;
};

export const QuoteCreate: React.FC<CreateProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Add a quote"
      transform={(data: any) =>
        transformEvent(dataProvider)(uuid(), data).then((record) => ({
          ...record,
          payload: {
            ...record.payload,
            media: record.media[0],
          },
        }))
      }
    >
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item md={6}>
            <BooleanInput source="draft" defaultValue={false} />
            <ReferenceBySubjectInput source="payload.subject" />
            <DateInput source="date" />
          </Grid>
          <Grid item md={6}>
            <ReferenceArrayKeywordInput
              source="keywords"
              defaultValue={[]}
              showAdd
            />
          </Grid>
          <Grid item md={12}>
            <BlockNoteInput source="excerpt" onlyText />
            <TextInput source="payload.details" />
            <ReferenceArrayLinkInput source="links" defaultValue={[]} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};
