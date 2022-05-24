import * as io from "@liexp/shared/io";
import {
  Documentary,
  EventSuggestionStatus,
  Patent,
} from "@liexp/shared/io/http/Events";
import { EventIcon } from "@liexp/ui/components/Common/Icons";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { ECOTheme } from "@liexp/ui/theme";
import { Box, ThemeProvider, Typography } from "@mui/material";
import { FormDataConsumer, useRecordContext, useRefresh } from "ra-core";
import * as React from "react";
import {
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
  ReferenceArrayField,
  ReferenceField,
  SelectInput,
  TabbedForm,
  TextField,
} from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { LinkArrayInput } from "../../Common/LinkArrayInput";
import { MediaArrayInput } from "../../Common/MediaArrayInput";
import { MediaField } from "../../Common/MediaField";
import ReferenceArrayKeywordInput from "../../Common/ReferenceArrayKeywordInput";
import { WebPreviewButton } from "../../Common/WebPreviewButton";
import { DeathEventEditFormTab } from "../AdminDeathEvent";
import { DocumentaryEditFormTab } from "../AdminDocumentaryEvent";
import { PatentEventEditFormTab } from "../AdminPatentEvent";
import { EditScientificStudyEvent } from "../AdminScientificStudyEvent";
import { UncategorizedEventEditTab } from "../AdminUncategorizedEvent";
import { transformEvent, transformLinks } from "../utils";
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
      actions={
        <Box style={{ padding: 10 }}>
          <WebPreviewButton resource="/dashboard/events" source="id" />
          <CreateEventButton />
        </Box>
      }
      transform={async ({ event, id, ...r }) => {
        // eslint-disable-next-line
        console.log("transform event for type", {
          type: r.type,
          event: r.payload.event,
        });

        const updatedEvent = await transformEvent(id, {
          ...r.payload.event,
          links: transformLinks(r.payload.event.links),
        });

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

        <FormDataConsumer>
          {({ formData, getSource, scopedFormData, ...rest }) => {
            // console.log({ formData, scopedFormData, rest });

            if (formData.payload.event.type === Documentary.DOCUMENTARY.value) {
              return <DocumentaryEditFormTab {...rest} />;
            }
            if (formData.payload.event.type === "Death") {
              return <DeathEventEditFormTab {...rest} />;
            }
            if (formData.payload.event.type === "ScientificStudy") {
              return <EditScientificStudyEvent {...rest} />;
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
        <FormTab label="Media">
          <MediaArrayInput
            label="media"
            source="newMedia"
            fullWidth={true}
            defaultValue={[]}
          />

          <ReferenceArrayField
            source="payload.event.media"
            reference="media"
            sortBy="updatedAt"
            sortByOrder="DESC"
          >
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <MediaField source="location" fullWidth={false} />
              <TextField source="description" />
            </Datagrid>
          </ReferenceArrayField>
        </FormTab>
        <FormTab label="Links">
          <LinkArrayInput source="payload.event.links" />
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
                            ...formData.payload.event,
                          }}
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
