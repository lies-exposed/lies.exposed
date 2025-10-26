import { type Area } from "@liexp/shared/lib/io/http/Area.js";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField.js";
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  FilterLiveSearch,
  FunctionField,
  List,
  TextField,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Stack } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";

const RESOURCE = "areas";

const areaFilters = [
  <FilterLiveSearch key="q" label="Search" source="q" alwaysOn />,
  <BooleanInput
    key="draft"
    label="Draft"
    source="draft"
    defaultValue={false}
    alwaysOn
    size="small"
  />,
  <BooleanInput key="withDeleted" source="withDeleted" alwaysOn size="small" />,
];

const AreaList: React.FC<ListProps> = () => (
  <List resource={RESOURCE} filters={areaFilters}>
    <Datagrid
      rowClick="edit"
      rowSx={(r) => ({
        opacity: r.draft ? 0.7 : 1,
      })}
      results={50}
    >
      <FunctionField
        render={(r) => {
          return (
            <Stack direction="row" alignItems="center">
              {r.featuredImage ? (
                <Stack>
                  <MediaField
                    source="featuredImage.location"
                    controls={false}
                    record={r}
                  />
                </Stack>
              ) : null}
              <Stack>
                <TextField display={"block"} source="label" />
                <TextField source="slug" />
              </Stack>
            </Stack>
          );
        }}
      />

      <BooleanField source="draft" />
      <FunctionField
        source="media"
        render={(a: Area) => {
          return (a.media ?? []).length;
        }}
      />
      <FunctionField
        source="socialPosts"
        render={(a: Area) => {
          return (a.socialPosts ?? []).length;
        }}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default AreaList;
