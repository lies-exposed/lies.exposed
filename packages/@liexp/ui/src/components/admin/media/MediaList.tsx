import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import * as React from "react";
import {
  BooleanInput,
  Datagrid,
  DateField,
  FunctionField,
  List,
  LoadingPage,
  ReferenceField,
  TextInput,
  useGetIdentity,
  usePermissions,
  type ListProps
} from "react-admin";
import { Box, Typography } from "../../mui";
import { MediaField } from "./MediaField";
import { MediaTypeInput } from "./input/MediaTypeInput";

const RESOURCE = "media";

const mediaFilters = [
  <TextInput key="description" source="description" alwaysOn size="small" />,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn size="small" />,
  <BooleanInput key="emptyLinks" source="emptyLinks" alwaysOn size="small" />,
  <MediaTypeInput key="type" source="type" alwaysOn size="small" />,
  <BooleanInput key="deletedOnly" source="deletedOnly" alwaysOn size="small" />,
];

export const MediaList: React.FC<ListProps> = (props) => {
  const { identity, isLoading } = useGetIdentity();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoading || isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions || []);

  const filter = !isAdmin && identity?.id ? { creator: identity?.id } : {};

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
      <Datagrid rowClick="edit">
        <MediaField type="image/jpeg" source="thumbnail" />
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
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 14,
                  }}
                >
                  {url.hostname}
                </Typography>
                <Typography variant="subtitle1">{r.type}</Typography>
                <Typography variant="body1">{r.description}</Typography>
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

        <DateField source="updatedAt" />
        <DateField source="createdAt" />
      </Datagrid>
    </List>
  );
};
