import * as React from "react";
import { Grid, Stack } from "../../mui/index.js";
import {
  Button,
  Edit,
  type EditProps,
  type RaRecord,
  useDataProvider,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useResourceDefinition,
} from "../react-admin.js";
import { WebPreviewButton } from "./WebPreviewButton.js";

export interface EditFormProps extends EditProps {
  preview: React.ReactNode;
}

export const EditForm: React.FC<React.PropsWithChildren<EditFormProps>> = ({
  children,
  title,
  transform,
  actions,
  preview,
  ...props
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  const resource = useResourceContext();
  const resourceInfo = useResourceDefinition();

  return (
    <Edit
      {...props}
      title={title}
      redirect={false}
      actions={actions}
      transform={transform}
    >
      <div>
        <Grid
          container
          width="100%"
          justifyContent="space-between"
          alignItems="start"
          size={12}
        >
          <Grid size={6}>
            <Stack direction={"row"} padding={2}>
              {resource && <WebPreviewButton resource={resource} source="id" />}
              <RestoreButton resource={resourceInfo.name} />
            </Stack>
          </Grid>
          <Grid size={6}>
            <Stack alignItems={"flex-end"} padding={2}>
              <Button
                label={`${showPreview ? "Hide" : "Show"} Preview`}
                onClick={() => {
                  if (preview) {
                    setShowPreview(!showPreview);
                  }
                }}
              />
            </Stack>
          </Grid>
          <Grid
            size={{
              md: showPreview ? 6 : 12,
              lg: showPreview ? 6 : 12,
              xl: showPreview ? 6 : 12,
            }}
          >
            {children}
          </Grid>
          {showPreview ? (
            <Grid
              size={{
                md: 6,
                lg: 6,
                xl: 6,
              }}
            >
              <div
                style={{
                  overflow: "scroll",
                  height: "100%",
                  maxHeight: 800,
                }}
              >
                {preview}
              </div>
            </Grid>
          ) : null}
        </Grid>
      </div>
    </Edit>
  );
};

const RestoreButton: React.FC<{ resource: string }> = ({ resource }) => {
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const record = useRecordContext();

  const handleOnClick = (record: RaRecord): void => {
    void dataProvider
      .update(resource, {
        id: record.id,
        data: {
          ...record,
          restore: true,
        },
        previousData: record,
      })
      .then(() => {
        refresh();
      });
  };
  if (record?.deletedAt) {
    return (
      <Button
        label="Restore"
        variant="contained"
        onClick={() => handleOnClick(record)}
      />
    );
  }
  return null;
};
