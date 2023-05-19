import "@liexp/ui/assets/react-page.css";
import { apiProvider, authProvider } from "@liexp/ui/lib/client/api";
import {
  AdminContext,
  CreateBase,
  ResourceContextProvider,
  SimpleForm,
  TextInput
} from "@liexp/ui/lib/components/admin";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput";
import { StoryRelationsBox } from "@liexp/ui/lib/components/admin/stories/StoryRelations";
import {
  Box,
  Container
} from "@liexp/ui/lib/components/mui";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider";
import { styled, themeOptions } from "@liexp/ui/lib/theme";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";

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

const CreateStoryPage: React.FC<RouteComponentProps> = () => {
  // const navigateTo = useNavigateToResource();

  return (
    <StyledContainer>
      <AdminContext
        dataProvider={apiProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        theme={themeOptions}
      >
        <ResourceContextProvider value="stories">
          <CreateBase
            transform={(s) => ({
              ...s,
              // featuredImage: s.featuredImage?.id,
            })}
          >
            <SimpleForm className={classes.form}>
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

              <StoryRelationsBox />
            </SimpleForm>
          </CreateBase>
        </ResourceContextProvider>
      </AdminContext>
    </StyledContainer>
  );
};
export default CreateStoryPage;
