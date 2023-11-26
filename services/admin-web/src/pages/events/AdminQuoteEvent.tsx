import { uuid } from "@liexp/shared/lib/utils/uuid";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceArrayActorInput from '@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput';
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField";
import { ReferenceBySubjectField } from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectField";
import ReferenceBySubjectInput from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectInput";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm";
import { QuoteEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/QuoteEditFormTab";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  List,
  SimpleForm,
  TextInput,
  useDataProvider,
  type CreateProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils";
import { Grid } from "@liexp/ui/lib/components/mui";
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
    perPage={20}
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
  return (
    <EditEventForm>
      <QuoteEditFormTab />
    </EditEventForm>
  );
};

export const QuoteCreate: React.FC<CreateProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Add a quote"
      transform={(data) =>
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
            <ReactPageInput source="excerpt" onlyText />
            <TextInput source="payload.details" />
            <ReferenceArrayLinkInput source="links" defaultValue={[]} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};
