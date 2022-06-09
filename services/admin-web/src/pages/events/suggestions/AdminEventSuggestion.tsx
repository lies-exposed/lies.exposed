import * as io from "@liexp/shared/io";
import { EventSuggestionStatus } from "@liexp/shared/io/http/EventSuggestion";
import { Documentary, Patent } from "@liexp/shared/io/http/Events";
import { EventIcon } from "@liexp/ui/components/Common/Icons";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box, ThemeProvider, Typography } from "@liexp/ui/components/mui";
import { ECOTheme } from "@liexp/ui/theme";
import * as React from "react";
import {
  FormDataConsumer,
  useRecordContext,
  useRefresh,
  BooleanInput,
  Button,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  FunctionField,
  List,
  ListProps,
  ReferenceField,
  SelectInput,
  TabbedForm,
  TextField,
} from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import ReferenceArrayKeywordInput from "../../../components/Common/ReferenceArrayKeywordInput";
import { WebPreviewButton } from "../../../components/Common/WebPreviewButton";
import { ReferenceLinkTab } from "../../../components/tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "../../../components/tabs/ReferenceMediaTab";
import { transformEvent } from "../../../utils";
import { DeathEventEditFormTab } from "../AdminDeathEvent";
import { DocumentaryEditFormTab } from "../AdminDocumentaryEvent";
import { PatentEventEditFormTab } from "../AdminPatentEvent";
import { EditScientificStudyEventPayload } from "../AdminScientificStudyEvent";
import { UncategorizedEventEditTab } from "../AdminUncategorizedEvent";
import { apiProvider } from "@client/HTTPAPI";

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
      _order: "DESC",
      status: "PENDING",
      withDeleted: true,
    }}
    perPage={20}
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
    </Datagrid>
  </List>
);

const CreateEventButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();

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
        const updatedEvent = await transformEvent(id, r.payload.event);

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
                return <EditScientificStudyEventPayload {...rest} />;
              }
              if (formData.payload.event.type === Patent.PATENT.value) {
                return (
                  <PatentEventEditFormTab
                    {...rest}
                    sourcePrefix={"payload.event"}
                  />
                );
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
