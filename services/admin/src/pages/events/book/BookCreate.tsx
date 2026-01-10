import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { BookEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/BookEditFormTab.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import {
  BooleanInput,
  Create,
  DateInput,
  SimpleForm,
  type CreateProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const BookCreate: React.FC<CreateProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Add a book"
      transform={(data: any) => {
        return transformEvent(dataProvider)(uuid(), data).then((record) => ({
          ...record,
          payload: {
            ...record.payload,
            publisher: record.payload.publisher?.type
              ? record.payload.publisher
              : undefined,
          },
        }));
      }}
    >
      <SimpleForm>
        <BookEditFormTab />
        <Grid container spacing={2}>
          <Grid size={{ md: 6 }}>
            <BooleanInput source="draft" defaultValue={false} />
            <BookEditFormTab />
            <DateInput source="date" />
          </Grid>
          <Grid size={{ md: 6 }}>
            <ReferenceArrayKeywordInput
              source="keywords"
              defaultValue={[]}
              showAdd
            />
          </Grid>
          <Grid size={{ md: 12 }}>
            <BlockNoteInput source="excerpt" onlyText />
            <BlockNoteInput source="body" onlyText />
            <ReferenceArrayLinkInput source="links" defaultValue={[]} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};

export default BookCreate;
