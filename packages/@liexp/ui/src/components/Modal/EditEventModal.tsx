import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import { AdminContext, ResourceContextProvider } from "react-admin";
import { apiProvider, authProvider } from "../../client/api";
import { i18nProvider } from "../../i18n/i18n.provider";
import { styled, themeOptions } from "../../theme";
import QueriesRenderer from "../QueriesRenderer";
import { EventSuggestionCreate } from "../admin/events/suggestions/AdminEventSuggestion";
import { Box, CloseIcon, IconButton, Modal } from "../mui";

const EVENT_SLIDER_MODAL_PREFIX = "event-slider-modal";

const classes = {
  modal: `${EVENT_SLIDER_MODAL_PREFIX}-modal`,
  paper: `${EVENT_SLIDER_MODAL_PREFIX}-paper`,
  closeIconBox: `${EVENT_SLIDER_MODAL_PREFIX}-close-icon-box`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
  [`&.${classes.modal}`]: {
    display: "flex",
    flexDirection: "column",
    width: "80%",
    flexGrow: 1,
    margin: "10% auto",
  },
  [`& .${classes.paper}`]: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    // margin: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
  },
  [`& .${classes.closeIconBox}`]: {
    display: "flex",
    alignSelf: "flex-end",
  },
}));

export interface EditEventModalProps {
  id: UUID;
  open?: boolean;
  onClose: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  open,
  id,
  onClose,
  ...props
}) => {
  // const theme = useTheme();

  // console.log(start);
  return (
    <div>
      <QueriesRenderer
        queries={(Q) => ({
          event: Q.Event.get.useQuery({ id }),
        })}
        render={({ event }) => {
          return (
            <StyledModal
              className={classes.modal}
              open={open ?? false}
              onClose={onClose}
            >
              <Box className={classes.paper}>
                <Box className={classes.closeIconBox}>
                  <IconButton
                    aria-label="Close"
                    color="secondary"
                    size="small"
                    style={{ margin: 0 }}
                    onClick={() => {
                      onClose();
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                <div style={{ overflow: "scroll" }}>
                  <AdminContext
                    authProvider={authProvider}
                    dataProvider={apiProvider}
                    i18nProvider={i18nProvider}
                    theme={themeOptions}
                  >
                    <ResourceContextProvider value="events/suggestions">
                      <EventSuggestionCreate event={event} />
                    </ResourceContextProvider>
                  </AdminContext>
                </div>
              </Box>
            </StyledModal>
          );
        }}
      />
    </div>
  );
};
