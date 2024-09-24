import { MediaType, MP4Type } from "@liexp/shared/lib/io/http/Media/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as React from "react";
import { EventIcon } from "../../Common/Icons/EventIcon.js";
import { AreaIcon } from "../../Common/Icons/FAIcon.js";
import { LinkIcon, MediaIcon } from "../../mui/icons.js";
import {
  Box,
  Card,
  CardContent,
  colors,
  Icons,
  Stack,
  Typography,
} from "../../mui/index.js";
import {
  BooleanInput,
  Datagrid,
  DateField,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  FunctionField,
  List,
  LoadingPage,
  NumberInput,
  ReferenceField,
  SavedQueriesList,
  useGetIdentity,
  usePermissions,
  type ListProps,
} from "../react-admin";
import { toFormattedDuration } from "./DurationField.js";
import { MediaField } from "./MediaField.js";

const RESOURCE = "media";

const mediaFilters = [
  <BooleanInput
    key="onlyUnshared"
    source="onlyUnshared"
    alwaysOn
    size="small"
  />,
  <NumberInput
    key="spCount"
    label="Social Post Count"
    source="spCount"
    size="small"
  />,
  <BooleanInput
    key="includeDeleted"
    source="includeDeleted"
    alwaysOn
    size="small"
  />,
];

export const MediaDataGrid: React.FC = () => {
  const { isLoading } = useGetIdentity();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoading || isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions ?? []);

  return (
    <Datagrid
      rowClick="edit"
      rowSx={(r) => ({
        borderLeft: `5px solid ${r.transferable ? colors.amber[500] : "transparent"}`,
      })}
    >
      <MediaField
        type="image/jpeg"
        source="thumbnail"
        controls={false}
        sourceType="image/png"
      />
      <FunctionField
        label="events"
        render={(r) => {
          const url = r.location
            ? new URL(r.location)
            : {
                hostname: "no link given",
              };

          return (
            <Box>
              <Box>
                <Typography variant="h5" style={{ fontSize: 16 }}>
                  {r.label}
                </Typography>
                {r.description ? (
                  <Typography variant="body1">
                    {r.description.substring(0, 150)}
                  </Typography>
                ) : null}
              </Box>
              <Box>
                <Typography variant="subtitle1">
                  {r.type}
                  {r.type === MP4Type.value &&
                    r.extra?.duration &&
                    ` - ${toFormattedDuration(r.extra.duration)}`}
                </Typography>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 14,
                  }}
                >
                  {url.hostname}
                </Typography>
              </Box>
            </Box>
          );
        }}
      />
      {isAdmin && (
        <ReferenceField source="creator" reference="users">
          <FunctionField
            label="creator"
            render={(r) => (r ? `${r.firstName} ${r.lastName}` : "")}
          />
        </ReferenceField>
      )}

      <FunctionField
        label="resources.links.fields.relations"
        render={(r) => {
          return (
            <Stack direction="column" minWidth={150}>
              {[
                { label: "Events", value: r?.events?.length },
                {
                  label: "Areas",
                  value: r?.areas?.length,
                },
                {
                  label: "Links",
                  value: r?.links?.length,
                },
                {
                  label: "Social Posts",
                  value: r?.socialPosts?.length,
                },
              ].map((relation) => (
                <Stack
                  key={relation.label}
                  direction="row"
                  alignItems="center"
                  justifyItems="center"
                >
                  <Typography variant="body1">{relation.label}: </Typography>
                  <Typography variant="body1" fontWeight="semibold">
                    {relation.value ?? "-"}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          );
        }}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};

const MediaListAside: React.FC = () => {
  return (
    <Card
      sx={{
        order: -1,
        mr: 2,
        mt: 0,
        width: 300,
        maxWidth: 300,
        display: "flex",
        flex: "1 0 auto",
      }}
    >
      <CardContent style={{ width: "100%" }}>
        <SavedQueriesList />
        <FilterLiveSearch label="Search" source="q" />
        <FilterList label="Media" icon={<Icons.PlayCircleOutline />}>
          <FilterListItem
            label="Empty Thumbnail"
            value={{ emptyThumbnail: true }}
          />
          <FilterListItem
            label="Need Thumbnail Regeneration"
            value={{ needRegenerateThumbnail: true }}
          />
        </FilterList>
        <FilterList label="Relations" icon={<LinkIcon />}>
          <FilterListItem
            label="Empty Links"
            value={{ emptyLinks: true }}
            icon={<LinkIcon />}
          />
          <FilterListItem
            label="Empty Areas"
            value={{ emptyAreas: true }}
            icon={<AreaIcon />}
          />
          <FilterListItem
            label="Empty Events"
            value={{ emptyEvents: true }}
            icon={<EventIcon type="Uncategorized" />}
          />
        </FilterList>
        <FilterList label="Type" icon={<MediaIcon />}>
          {MediaType.types.map((t) => (
            <FilterListItem
              key={t.value}
              label={
                <span>
                  <MediaIcon /> {t.value}
                </span>
              }
              value={{ type: [t.value] }}
            />
          ))}
        </FilterList>
      </CardContent>
    </Card>
  );
};

export const MediaList: React.FC<ListProps> = (props) => {
  const { data, isLoading } = useGetIdentity();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoading || isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions ?? []);

  const filter = !isAdmin && data?.id ? { creator: data?.id } : {};

  return (
    <List
      {...props}
      resource={RESOURCE}
      filters={mediaFilters}
      filter={filter}
      filterDefaultValues={{
        _sort: "createdAt",
        _order: "DESC",
        emptyValues: false,
      }}
      aside={<MediaListAside />}
      perPage={25}
    >
      <MediaDataGrid />
    </List>
  );
};
