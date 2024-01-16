import { MP4Type } from "@liexp/shared/lib/io/http/Media.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as React from "react";
import {
  BooleanInput,
  Datagrid,
  DateField,
  FunctionField,
  List,
  LoadingPage,
  NumberInput,
  ReferenceField,
  TextInput,
  useGetIdentity,
  usePermissions,
  type ListProps,
} from "react-admin";
import { Box, Typography, amber } from "../../mui/index.js";
import { toFormattedDuration } from "./DurationField.js";
import { MediaField } from "./MediaField.js";
import { MediaTypeInput } from "./input/MediaTypeInput.js";

const RESOURCE = "media";

const mediaFilters = [
  <TextInput key="description" source="description" alwaysOn size="small" />,
  <BooleanInput
    key="emptyThumbnail"
    source="emptyThumbnail"
    alwaysOn
    size="small"
  />,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn size="small" />,
  <BooleanInput key="emptyLinks" source="emptyLinks" alwaysOn size="small" />,
  <BooleanInput key="emptyAreas" source="emptyAreas" alwaysOn size="small" />,
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
  <MediaTypeInput key="type" source="type" alwaysOn size="small" />,
  <BooleanInput key="deletedOnly" source="deletedOnly" alwaysOn size="small" />,
];

export const MediaDataGrid: React.FC = () => {
  const { isLoading } = useGetIdentity();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoading || isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions || []);

  return (
    <Datagrid
      rowClick="edit"
      rowSx={(r) => ({
        borderLeft: `5px solid ${r.transferable ? amber[500] : "transparent"}`,
      })}
    >
      <MediaField type="image/jpeg" source="thumbnail" controls={false} />
      <FunctionField
        label="events"
        render={(r: any) => {
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
            render={(r: any) => (r ? `${r.firstName} ${r.lastName}` : "")}
          />
        </ReferenceField>
      )}

      <FunctionField
        label="events"
        render={(r: any) => {
          return r.events.length;
        }}
      />
      <FunctionField
        label="links"
        render={(r: any) => {
          return r.links.length;
        }}
      />
      <FunctionField
        label="social_posts"
        render={(r: any) => {
          return r.socialPosts?.length ?? 0;
        }}
      />

      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};

export const MediaList: React.FC<ListProps> = (props) => {
  const { data, isLoading } = useGetIdentity();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoading || isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions || []);

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
      perPage={20}
    >
      <MediaDataGrid />
    </List>
  );
};
