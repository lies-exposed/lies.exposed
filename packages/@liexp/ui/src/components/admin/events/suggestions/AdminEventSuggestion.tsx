import { getTitle } from "@liexp/shared/helpers/event";
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
  EditProps,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  ListProps,
  LoadingPage,
  ReferenceField,
  SelectInput,
  TabbedForm,
  TextField,
  useDataProvider,
  useGetIdentity,
  usePermissions,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { checkIsAdmin } from "../../../../utils/user.utils";
import { EventIcon } from "../../../Common/Icons";
import ReactPageInput from "../../../admin/ReactPageInput";
import ReferenceArrayKeywordInput from "../../../admin/common/ReferenceArrayKeywordInput";
import { WebPreviewButton } from "../../../admin/common/WebPreviewButton";
import { Box, Grid, Typography } from "../../../mui";
import { EditForm } from "../../common/EditForm";
import ReferenceUserInput from "../../common/ReferenceUserInput";
import { EventSuggestionPreview } from "../../previews/EventSuggestionPreview";
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
                  <Typography>
                    {getTitle(r.payload.event, {
                      media: [],
                      keywords: [],
                      groups: [],
                      actors: [],
                      groupsMembers: [],
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
          .then(() => { refresh(); });
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
          r.payload.event
        );

        return { id, ...r.payload, event: updatedEvent };
      }}
      preview={<EventSuggestionPreview />}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <Grid container spacing={2}>
            <Grid
              item
              md={6}
              sm={6}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <BooleanInput label="draft" source="payload.event.draft" />
              <TextField label="Suggestion type" source="payload.type" />
              <TextField label="Suggestion status" source="status" />
              <DateInput label="date" source="payload.event.date" />
              <DateInput
                label="endDate"
                source="payload.event.payload.endDate"
              />
            </Grid>
            <Grid item md={6} sm={6}>
              {isAdmin && <ReferenceUserInput source="payload.creator" />}
            </Grid>
            <Grid item md={12}>
              <ReactPageInput
                label="excerpt"
                source="payload.event.excerpt"
                onlyText
              />
              <ReferenceArrayKeywordInput
                source="payload.event.keywords"
                showAdd
              />
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
      </TabbedForm>
    </EditForm>
  );
};
