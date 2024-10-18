import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
import { EventSuggestionStatus } from "@liexp/shared/lib/io/http/EventSuggestion.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as React from "react";
import {
  BooleanInput,
  Button,
  Create,
  Datagrid,
  DateField,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  LoadingPage,
  ReferenceField,
  SelectInput,
  TabbedForm,
  TextField,
  useCreateController,
  useGetIdentity,
  usePermissions,
  useRecordContext,
  useRefresh,
  type CreateProps,
  type EditProps,
  type ListProps,
} from "react-admin";
import { useDataProvider } from "../../../../hooks/useDataProvider.js";
import { EventIcon } from "../../../Common/Icons/index.js";
import { WebPreviewButton } from "../../../admin/common/WebPreviewButton.js";
import { Box, Grid, Typography } from "../../../mui/index.js";
import BlockNoteInput from "../../BlockNoteInput.js";
import { EditForm } from "../../common/EditForm.js";
import { EventSuggestionStatusInput } from "../../common/inputs/EventSuggestionStatusInput.js";
import { EventSuggestionTypeInput } from "../../common/inputs/EventSuggestionTypeInput.js";
import { ImportMediaButton } from "../../media/button/ImportMediaButton.js";
import { EventSuggestionPreview } from "../../previews/EventSuggestionPreview.js";
import { ReferenceLinkTab } from "../../tabs/ReferenceLinkTab.js";
import { ReferenceMediaTab } from "../../tabs/ReferenceMediaTab.js";
import { transformEvent } from "../../transform.utils.js";
import ReferenceUserInput from "../../user/ReferenceUserInput.js";
import { DeathEventEditFormTab } from "../tabs/DeathEventEditFormTab.js";
import { DocumentaryEditFormTab } from "../tabs/DocumentaryEditFormTab.js";
import { PatentEventEditFormTab } from "../tabs/PatentEventEditTab.js";
import { ScientificStudyEventEditTab } from "../tabs/ScientificStudyEventEditTab.js";
import { UncategorizedEventEditTab } from "../tabs/UncategorizedEventEditTab.js";

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

export const EventSuggestionList: React.FC<ListProps> = (props) => {
  const { identity, isLoading } = useGetIdentity();
  const { permissions, isLoading: isPermsLoading } = usePermissions();

  if (isLoading || isPermsLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);
  const filter = !isAdmin && identity?.id ? { creator: identity?.id } : {};

  return (
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
      filter={filter}
      perPage={25}
    >
      <Datagrid rowClick="edit">
        <FunctionField
          label="type"
          render={(r) => {
            return (
              <Box>
                <EventIcon color="primary" type={r.payload.event.type} />{" "}
                <Typography display="inline" variant="subtitle1">
                  {r.payload.type}
                </Typography>{" "}
                {[
                  io.http.Events.EventTypes.UNCATEGORIZED.value,
                  io.http.Events.EventTypes.SCIENTIFIC_STUDY.value,
                  io.http.Events.EventTypes.PATENT.value,
                ].includes(r.payload.event.type) ? (
                  <Typography>
                    {getTitle(r.payload.event, {
                      media: [],
                      keywords: [],
                      groups: [],
                      actors: [],
                      groupsMembers: [],
                      links: [],
                      areas: [],
                    })}
                  </Typography>
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
        {isAdmin && (
          <ReferenceField source="creator" reference="users">
            <TextField source="username" />
          </ReferenceField>
        )}

        <TextField source="status" />
        <DateField source="payload.event.date" />
        <FunctionField
          source="payload.event.links"
          render={(r) => r.links?.length ?? 0}
        />
        <FunctionField
          source="payload.media"
          render={(r) => r.media?.length ?? 0}
        />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
      </Datagrid>
    </List>
  );
};

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
          .then(() => {
            refresh();
          });
      }}
    />
  );
};

export const EventSuggestionEdit: React.FC<EditProps> = () => {
  const dataProvider = useDataProvider();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoadingPermissions) {
    return <LoadingPage />;
  }
  const isAdmin = checkIsAdmin(permissions);

  return (
    <EditForm
      redirect={false}
      actions={
        <Box style={{ padding: 10 }}>
          <WebPreviewButton resource="/events" source="id" />
          <CreateEventButton />
        </Box>
      }
      transform={async ({ id, ...r }) => {
        const updatedEvent = await transformEvent(dataProvider)(
          id,
          r.payload.event,
        );

        return { id, ...r.payload, event: updatedEvent };
      }}
      preview={<EventSuggestionPreview />}
    >
      <TabbedForm syncWithLocation={isAdmin}>
        <FormTab label="payload">
          {isAdmin ? (
            <Grid container spacing={2}>
              <Grid
                item
                md={6}
                sm={6}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <EventSuggestionTypeInput source="payload.type" />
                <EventSuggestionStatusInput source="status" />
              </Grid>
              <Grid item md={6} sm={6}>
                <ReferenceUserInput source="payload.creator" />
              </Grid>
              <Grid item md={12}>
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
              </Grid>
            </Grid>
          ) : null}
          <FormDataConsumer>
            {({ formData, scopedFormData, ...rest }) => {
              // console.log({ formData, scopedFormData, rest });

              if (
                formData.payload.event.type === EventTypes.DOCUMENTARY.value
              ) {
                return <DocumentaryEditFormTab {...rest} />;
              }
              if (formData.payload.event.type === "Death") {
                return <DeathEventEditFormTab {...rest} />;
              }
              if (formData.payload.event.type === "ScientificStudy") {
                return <ScientificStudyEventEditTab {...rest} />;
              }
              if (formData.payload.event.type === EventTypes.PATENT.value) {
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
        <FormTab label="body">
          <BlockNoteInput label="body" source="payload.event.body" />
        </FormTab>
        <FormTab label="Media">
          <ImportMediaButton
            reference="events/suggestions"
            source="payload.event.media"
          />
          <ReferenceMediaTab source="payload.event.media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="payload.event.links" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const EventSuggestionCreate: React.FC<
  Omit<CreateProps, "children"> & { event: any }
> = ({ event, ...props }) => {
  const record = useRecordContext({
    record: {
      status: "Pending",
      payload: { type: "New", event },
    },
  });
  const { save } = useCreateController({
    resource: "events/suggestions",
    ...props,
  });

  const dataProvider = useDataProvider();

  const { permissions = [], isLoading: isLoadingPermissions } =
    usePermissions();

  if (isLoadingPermissions) {
    return <LoadingPage />;
  }
  const isAdmin = checkIsAdmin(permissions);

  return (
    <Create
      {...props}
      record={record}
      redirect={false}
      actions={
        isAdmin ? (
          <Box style={{ padding: 10 }}>
            <WebPreviewButton resource="/events" source="id" />
            <CreateEventButton />
          </Box>
        ) : undefined
      }
      transform={async ({ id, ...r }: any) => {
        const updatedEvent = await transformEvent(dataProvider)(
          id,
          r.payload.event,
        );

        return { id, ...r.payload, event: updatedEvent };
      }}
    >
      <TabbedForm
        syncWithLocation={false}
        onSubmit={(e: any) => {
          void save?.(e);
        }}
      >
        <FormTab label="payload">
          {isAdmin ? (
            <Grid container spacing={2}>
              <Grid
                item
                md={6}
                sm={6}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <BooleanInput label="draft" source="payload.event.draft" />
                <TextField label="Suggestion type" source="payload.type" />
                <EventSuggestionTypeInput source="payload.type" />
                <EventSuggestionStatusInput source="status" />
              </Grid>
              <Grid item md={6} sm={6}>
                {isAdmin && <ReferenceUserInput source="payload.creator" />}
              </Grid>
              <Grid item md={12}>
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
              </Grid>
            </Grid>
          ) : null}
          <FormDataConsumer>
            {({ formData, scopedFormData, ...rest }) => {
              // console.log({ formData, scopedFormData, rest });

              if (
                formData.payload.event.type === EventTypes.DOCUMENTARY.value
              ) {
                return <DocumentaryEditFormTab {...rest} />;
              }
              if (formData.payload.event.type === "Death") {
                return <DeathEventEditFormTab {...rest} />;
              }
              if (formData.payload.event.type === "ScientificStudy") {
                return <ScientificStudyEventEditTab {...rest} />;
              }
              if (formData.payload.event.type === EventTypes.PATENT.value) {
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
        <FormTab label="body">
          <BlockNoteInput label="body" source="payload.event.body" />
        </FormTab>
        <FormTab label="Media">
          <ReferenceMediaTab source="payload.event.media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="payload.event.links" />
        </FormTab>
      </TabbedForm>
    </Create>
  );
};
