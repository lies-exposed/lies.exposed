import * as React from "react";
import { Grid } from "../../mui";
import {
  Edit,
  useDataProvider,
  type EditProps,
  useRecordContext,
  useRefresh,
  Button,
} from "../react-admin";

export interface EditFormProps extends EditProps {
  preview: React.ReactNode;
}

export const EditForm: React.FC<React.PropsWithChildren<EditFormProps>> = ({
  children,
  title,
  transform,
  actions,
  preview,
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  return (
    <Edit
      title={title}
      redirect={false}
      actions={actions}
      transform={transform}
    >
      <Grid container>
        <Grid item md={12}>
          <Button
            label={`${showPreview ? "Hide" : "Show"} Preview`}
            onClick={() => {
              setShowPreview(!showPreview);
            }}
          />
          <RestoreButton />
        </Grid>
        <Grid item md={showPreview ? 6 : 12} lg={showPreview ? 6 : 12}>
          {children}
        </Grid>

        {showPreview ? (
          <Grid item md={6} lg={6}>
            {preview}
          </Grid>
        ) : null}
      </Grid>
    </Edit>
  );
};

const RestoreButton: React.FC = () => {
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const record = useRecordContext();
  const handleOnClick = (): void => {
    void dataProvider
      .update("media", {
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
  return <Button label="Restore" onClick={handleOnClick} />;
};
