import * as io from "@liexp/shared/io";
import { EventSuggestionStatus } from "@liexp/shared/io/http/EventSuggestion";
import { Documentary, Patent } from "@liexp/shared/io/http/Events";
import * as React from "react";
import {
  BooleanInput,
  Button,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  ListProps,
  ReferenceField,
  SelectInput,
  TabbedForm,
  TextField,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { ECOTheme } from "../../../../theme";
import { EventIcon } from "../../../Common/Icons";
import { EventPageContent } from "../../../EventPageContent";
import { HelmetProvider } from "../../../SEO";
import ReactPageInput from "../../../admin/ReactPageInput";
import ReferenceArrayKeywordInput from "../../../admin/common/ReferenceArrayKeywordInput";
import { WebPreviewButton } from "../../../admin/common/WebPreviewButton";
import { Box, ThemeProvider, Typography } from "../../../mui";
import { DeathEventEditFormTab } from "../../tabs/DeathEventEditFormTab";
import { DocumentaryEditFormTab } from "../../tabs/DocumentaryEditFormTab";
import { PatentEventEditFormTab } from "../../tabs/PatentEventEditTab";
import { ReferenceLinkTab } from "../../tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "../../tabs/ReferenceMediaTab";
import { ScientificStudyEventEditTab } from "../../tabs/ScientificStudyEventEditTab";
import { UncategorizedEventEditTab } from "../../tabs/UncategorizedEventEditTab";
import { transformEvent } from "../../transform.utils";

const RESOURCE = "events/suggestions";

const eventSuggestionListFilter = [
  <SelectInput
    key="status"
    source="status"
    choices={EventSuggestionStatus.types.map((tt) => ({
      name: tt.value,
      id: tt.value,
    }))}
  />,
];

export const EventSuggestionList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filters={eventSuggestionListFilter}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "ASC",
      status: "PENDING",
      withDeleted: false,
    }}
    perPage={25}
  >
    <Datagrid rowClick="edit">
      <FunctionField
        label="type"
        render={(r: any) => {
          return (
            <Box>
              <EventIcon color="primary" type={r.payload.event.type} />{" "}
              <Typography display="inline" variant="subtitle1">
                {r.payload.type}
              </Typography>{" "}
              {[
                io.http.Events.Uncategorized.UNCATEGORIZED.value,
                io.http.Events.ScientificStudy.SCIENTIFIC_STUDY.value,
                io.http.Events.Patent.PATENT.value,
              ].includes(r.payload.event.type) ? (
                <Typography>{r.payload.event.payload.title}</Typography>
              ) : (
                <ReferenceField
                  source="payload.event.payload.victim"
                  reference="actors"
                >
                  <TextField source="username" />
                </ReferenceField>
              )}
            </Box>
          );
        }}
      />
      <TextField source="status" />
      <DateField source="payload.event.date" />
      <FunctionField
        source="payload.event.links"
        render={(r: any) => r.links?.length ?? 0}
      />
      <FunctionField
        source="payload.media"
        render={(r: any) => r.media?.length ?? 0}
      />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);

const CreateEventButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();
  const apiProvider = useDataProvider();

  return (
    <Button
      label="Create event"
      onClick={() => {
        void apiProvider
          .create(`/events/suggestions/${record?.id}/event`, { data: {} })
          .then(() => refresh());
      }}
    />
  );
};

export const EventSuggestionEdit: React.FC<EditProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Edit
      redirect={false}
      actions={
        <Box style={{ padding: 10 }}>
          <WebPreviewButton resource="/dashboard/events" source="id" />
          <CreateEventButton />
        </Box>
      }
      transform={async ({ id, ...r }) => {
        const updatedEvent = await transformEvent(dataProvider)(id, r.payload.event);

        return { id, ...r.payload, event: updatedEvent };
      }}
    >
      <TabbedForm redirect={false}>
        <FormTab label="Generals">
          <TextField label="Suggestion type" source="payload.type" />
          <TextField label="Suggestion status" source="status" />
          <DateInput label="date" source="payload.event.date" />
          <BooleanInput label="draft" source="payload.event.draft" />
          <ReactPageInput
            label="excerpt"
            source="payload.event.excerpt"
            onlyText
          />
          <ReferenceArrayKeywordInput source="payload.event.keywords" showAdd />
          <DateField
            label="updatedAt"
            source="payload.event.updatedAt"
            showTime={true}
          />
          <DateField
            label="createdAt"
            source="payload.event.createdAt"
            showTime={true}
          />
        </FormTab>
        <FormTab label="body">
          <ReactPageInput label="body" source="payload.event.body" />
        </FormTab>

        <FormTab label="payload">
          <FormDataConsumer>
            {({ formData, getSource, scopedFormData, ...rest }) => {
              // console.log({ formData, scopedFormData, rest });

              if (
                formData.payload.event.type === Documentary.DOCUMENTARY.value
              ) {
                return <DocumentaryEditFormTab {...rest} />;
              }
              if (formData.payload.event.type === "Death") {
                return <DeathEventEditFormTab {...rest} />;
              }
              if (formData.payload.event.type === "ScientificStudy") {
                return <ScientificStudyEventEditTab {...rest} />;
              }
              if (formData.payload.event.type === Patent.PATENT.value) {
                return <PatentEventEditFormTab {...rest} />;
              }

              return (
                <UncategorizedEventEditTab
                  {...rest}
                  sourcePrefix={"payload.event"}
                  record={formData.payload.event}
                />
              );
            }}
          </FormDataConsumer>
        </FormTab>
        <FormTab label="Media">
          <ReferenceMediaTab source="payload.event.media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="payload.event.links" />
        </FormTab>
        <FormTab label="Preview">
          <FormDataConsumer>
            {({ formData, ...rest }) => {
              const qc = new QueryClient();
              return (
                <HelmetProvider>
                  <QueryClientProvider client={qc}>
                    <ThemeProvider theme={ECOTheme}>
                      {formData.payload.event.type === "Uncategorized" ? (
                        <EventPageContent
                          event={{
                            media: [],
                            keywords: [],
                            links: [],
                            ...formData.payload.event,
                          }}
                          onDateClick={() => undefined}
                          onAreaClick={() => undefined}
                          onActorClick={() => undefined}
                          onGroupClick={() => undefined}
                          onKeywordClick={() => undefined}
                          onLinkClick={() => undefined}
                          onGroupMemberClick={() => undefined}
                        />
                      ) : (
                        <div />
                      )}
                    </ThemeProvider>
                  </QueryClientProvider>
                </HelmetProvider>
              );
            }}
          </FormDataConsumer>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};
