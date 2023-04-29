import { http } from "@liexp/shared/lib/io";
import { AreaPageContent } from "@liexp/ui/lib/components/AreaPageContent";
import { HelmetProvider } from "@liexp/ui/lib/components/SEO";
import { ValidationErrorsLayout } from "@liexp/ui/lib/components/ValidationErrorsLayout";
import {
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  Edit,
  type EditProps,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  type ListProps,
  required,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
} from "@liexp/ui/lib/components/admin";
import { MapInput } from "@liexp/ui/lib/components/admin/MapInput";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceArrayEventInput from "@liexp/ui/lib/components/admin/events/ReferenceArrayEventInput";
import { ReferenceMediaTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceMediaTab";
import { transformMedia } from "@liexp/ui/lib/components/admin/transform.utils";
import { ECOTheme } from "@liexp/ui/lib/theme";
import { ThemeProvider } from "@mui/system";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const RESOURCE = "areas";

export const AreaList: React.FC<ListProps> = () => (
  <List resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="label" />
      <FunctionField
        source="media"
        render={(a) => {
          return (a.media ?? []).length;
        }}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = () => {
  const record = useRecordContext();
  return <span>Area {record?.title}</span>;
};

const transformArea = ({ newMedia = [], newEvents, ...area }: any): any => {
  const media = transformMedia(newMedia);
  return {
    ...area,
    media: area.media.concat(media),
  };
};

export const AreaEdit: React.FC<EditProps> = () => (
  <Edit title={<EditTitle />} redirect={false} transform={transformArea}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="label" />
        <ReactPageInput source="body" onlyText />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Geometry">
        <MapInput source="geometry" />
      </FormTab>
      <FormTab label="Events">
        <ReferenceArrayEventInput source="events" />
      </FormTab>
      <FormTab label="Media">
        <ReferenceMediaTab source="media" />
      </FormTab>
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            const qc = new QueryClient();
            return pipe(
              http.Area.Area.decode(formData),
              E.fold(ValidationErrorsLayout, (p) => (
                <HelmetProvider>
                  <ThemeProvider theme={ECOTheme}>
                    <QueryClientProvider client={qc}>
                      <AreaPageContent
                        area={p}
                        onGroupClick={() => undefined}
                      />
                    </QueryClientProvider>
                  </ThemeProvider>
                </HelmetProvider>
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const AreaCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Post">
    <SimpleForm>
      <TextInput source="label" validate={[required()]} />
      <MapInput
        source="geometry"
      />
      <ReactPageInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
