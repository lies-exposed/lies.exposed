import "@liexp/ui/assets/react-page.css";
import { apiProvider, authProvider } from "@liexp/ui/lib/client/api";
import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader";
import {
  AdminContext,
  EditBase,
  SimpleForm,
  TextInput,
  useUpdate,
} from "@liexp/ui/lib/components/admin";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput";
import { Box, Container } from "@liexp/ui/lib/components/mui";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider";
import { styled, themeOptions } from "@liexp/ui/lib/theme";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigate } from "react-router-dom";

const PREFIX = "create-story-page";
const classes = {
  root: `${PREFIX}-root`,
  form: `${PREFIX}-form`,
  input: `${PREFIX}-input`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
  [`.${classes.root}`]: {},
  [`& .${classes.form}`]: {},
  [`& .${classes.input}`]: {
    fieldset: {
      border: "none",
    },
  },
}));

const EditStoryPageContent: React.FC<{ id?: string }> = ({ id }) => {
  const [update, { isLoading: isSubmitting }] = useUpdate();
  const navigate = useNavigate();
  const onSubmit = async (data: any): Promise<void> => {
    await update(
      "stories",
      { id, data },
      {
        onSuccess: (d) => {
          navigate(`/stories/${d.path}`);
        },
      },
    );
  };
  return (
    <EditBase id={id} resource="stories">
      <SimpleForm className={classes.form} onSubmit={onSubmit}>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 24,
            width: "100%",
          }}
        >
          <TextInput className={classes.input} source="title" fullWidth />
          <TextInput className={classes.input} source="slug" fullWidth />
        </Box>
        <ReferenceMediaInput
          source="featuredImage.id"
          allowedTypes={["image/jpg"]}
        />
        <ReactPageInput className={classes.input} source="body2" />
      </SimpleForm>
      {isSubmitting ? <FullSizeLoader /> : null}
    </EditBase>
  );
};

const EditStoryPage: React.FC<RouteComponentProps<{ storyId: string }>> = ({
  storyId: id,
}) => {
  return (
    <StyledContainer>
      <AdminContext
        dataProvider={apiProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        theme={themeOptions}
      >
        <EditStoryPageContent id={id} />
      </AdminContext>
    </StyledContainer>
  );
};

export default EditStoryPage;
