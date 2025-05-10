import { TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { Schema } from "effect";
import * as React from "react";
import { colors } from "../../../theme/index.js";
import { getBorderLeftStyle } from "../../../utils/style.utils.js";
import { Box, Stack, Typography } from "../../mui/index.js";
import {
  Datagrid,
  type DatagridProps,
  DateField,
  FunctionField,
  Link,
  NumberField,
  TextField,
} from "../react-admin.js";
import { SocialPostPlatformIcon } from "./SocialPostPlatformIcon.js";

export const SocialPostDataGrid: React.FC<DatagridProps> = (props) => {
  return (
    <Datagrid
      rowClick="edit"
      rowSx={(record) =>
        getBorderLeftStyle(
          Schema.is(TO_PUBLISH)(record.status)
            ? colors.lightBlue
            : "transparent",
        )
      }
      {...props}
    >
      <TextField source="type" />
      <FunctionField
        source="title"
        onClick={(e) => {
          e.preventDefault();
        }}
        render={(r) => (
          <Box>
            <Link to={`/${r.type}/${r.entity}`}>{r.content.title}</Link>
            <Typography display={"block"}>{r.content}</Typography>
          </Box>
        )}
      />
      <TextField source="status" />
      <NumberField source="publishCount" />
      <FunctionField
        label="Platforms"
        render={(r) => {
          return (
            <Stack direction="row" spacing={1}>
              <SocialPostPlatformIcon platform="TG" />
              <SocialPostPlatformIcon platform="IG" />
            </Stack>
          );
        }}
      />
      <DateField showTime source="scheduledAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};
