import { TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { Schema } from "effect";
import * as React from "react";
import { colors } from "../../../theme/index.js";
import { getBorderLeftStyle } from "../../../utils/style.utils.js";
import { InstagramIcon, TelegramIcon } from "../../Common/Icons/index.js";
import { Box } from "../../mui/index.js";
import {
  Datagrid,
  type DatagridProps,
  DateField,
  FunctionField,
  Link,
  NumberField,
  TextField,
} from "../react-admin.js";

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
        source="content.title"
        onClick={(e) => {
          e.preventDefault();
        }}
        render={(r) => (
          <Link to={`/${r.type}/${r.entity}`}>{r.content?.title}</Link>
        )}
      />
      <TextField source="status" />
      <NumberField source="publishCount" />
      <FunctionField
        label="Platforms"
        render={(r) => {
          return (
            <Box>
              <TelegramIcon
                style={{ opacity: r.result?.tg ? 1 : 0.2, marginRight: 10 }}
              />
              <InstagramIcon style={{ opacity: r.result?.ig ? 1 : 0.2 }} />
            </Box>
          );
        }}
      />
      <DateField showTime source="scheduledAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};
