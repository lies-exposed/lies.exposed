import { checkIsAdmin } from "@liexp/shared/lib/utils/auth.utils.js";
import * as React from "react";
import {
  Datagrid,
  DateField,
  FunctionField,
  LoadingPage,
  // ReferenceArrayInput,
  ReferenceField,
  TextField,
  usePermissions,
  type DatagridProps,
} from "react-admin";
import { useTheme } from "../../../theme/index.js";
import { Stack, Typography, Box, useMuiMediaQuery } from "../../mui/index.js";
import { MediaField } from "../media/MediaField.js";

interface LinkDataGridProps extends DatagridProps {
  bulkActionButtons?: React.ReactElement | false;
}

export const LinkDataGrid: React.FC<LinkDataGridProps> = ({
  bulkActionButtons,
  ...props
}) => {
  const { permissions, isLoading } = usePermissions();
  const theme = useTheme();
  const isMobile = useMuiMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMuiMediaQuery(theme.breakpoints.between("sm", "md"));

  if (isLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);

  return (
    <Datagrid
      rowClick="edit"
      bulkActionButtons={bulkActionButtons}
      {...props}
      sx={{
        // Mobile-responsive styles
        [theme.breakpoints.down("sm")]: {
          "& .MuiDataGrid-root": {
            fontSize: "0.75rem",
          },
          "& .MuiDataGrid-cell": {
            padding: "8px 4px",
            minHeight: "120px", // Ensure cells are tall enough for content
            whiteSpace: "normal", // Allow text to wrap
            wordBreak: "break-word",
          },
          "& .MuiDataGrid-columnHeader": {
            padding: "8px 4px",
            fontSize: "0.7rem",
          },
          "& .MuiDataGrid-row": {
            maxHeight: "none", // Allow rows to expand as needed
          },
        },
        [theme.breakpoints.between("sm", "md")]: {
          "& .MuiDataGrid-cell": {
            padding: "8px 12px",
            minHeight: "120px",
          },
          "& .MuiDataGrid-columnHeader": {
            padding: "12px 8px",
          },
        },
      }}
    >
      {/* Main content column: Image + Title + Description */}
      <FunctionField
        label="Link"
        render={() => {
          return (
            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 2 }}
              sx={{
                // Always use row layout to prevent text overlaying image
                width: "100%",
                minWidth: 0, // Important: allows flex children to shrink below minWidth
                alignItems: "flex-start",
              }}
            >
              {/* Thumbnail image */}
              <Box
                sx={{
                  minWidth: isMobile ? "60px" : "100px",
                  width: isMobile ? "60px" : "100px",
                  height: isMobile ? "60px" : "100px",
                  flexShrink: 0,
                  flexGrow: 0,
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <MediaField
                  source="image.thumbnail"
                  type="image/jpeg"
                  controls={false}
                />
              </Box>

              {/* Title and Description */}
              <Stack
                direction="column"
                spacing={0.5}
                sx={{
                  flex: 1,
                  minWidth: isMobile ? "150px" : "0px", // Only constrain on mobile
                  overflow: "hidden",
                }}
              >
                <FunctionField
                  render={(record) => (
                    <TextField
                      source="title"
                      record={record}
                      style={{
                        fontWeight: 600,
                        fontSize: isMobile ? "0.875rem" : "1rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 1 : 2,
                        WebkitBoxOrient: "vertical",
                        wordBreak: "break-word",
                      }}
                    />
                  )}
                />
                <FunctionField
                  render={(record) => (
                    <TextField
                      source="description"
                      record={{
                        ...record,
                        description:
                          record.description?.length > (isMobile ? 100 : 200)
                            ? record.description
                                .substring(0, isMobile ? 100 : 200)
                                .concat("...")
                            : record.description,
                      }}
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: "#666",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 1 : 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>
          );
        }}
      />

      {/* Publish Date - visible on tablet and up */}
      {!isMobile && <DateField source="publishDate" />}

      {/* Creator - only on desktop, hidden on mobile/tablet */}
      {isAdmin && !isMobile && !isTablet && (
        <ReferenceField source="creator" reference="users">
          <FunctionField render={(u) => `${u.firstName} ${u.lastName}`} />
        </ReferenceField>
      )}

      {/* Provider - visible on tablet and up */}
      {!isMobile && (
        <ReferenceField source="provider" reference="groups">
          <TextField source="name" />
        </ReferenceField>
      )}

      {/* Relations (Events/SocialPosts count) - visible on desktop only */}
      {!isMobile && !isTablet && (
        <FunctionField
          label="Relations"
          render={(r) => {
            return (
              <Stack
                direction="column"
                minWidth={isMobile ? 60 : isTablet ? 80 : 120}
                spacing={0.5}
              >
                {[
                  { label: "Events", value: r?.events?.length },
                  {
                    label: "Posts",
                    value: r?.socialPosts?.length,
                  },
                ].map((relation) => (
                  <Stack
                    key={relation.label}
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{
                      fontSize: "0.875rem",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {relation.label}:
                    </Typography>
                    <Typography variant="caption">
                      {relation.value ?? "-"}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            );
          }}
        />
      )}

      {/* Updated At - hidden on mobile */}
      {!isMobile && <DateField source="updatedAt" />}

      {/* Created At - hidden on mobile and tablet */}
      {!isMobile && !isTablet && <DateField source="createdAt" />}
    </Datagrid>
  );
};
