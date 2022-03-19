import { Event } from "@liexp/shared/io/http/Events";
import EventCard from "@liexp/ui/components/Cards/Events/EventCard";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { Loader } from '@liexp/ui/components/Common/Loader';
import { getEventsFromLinkQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  Grid,
  IconButton,
  Input,
  useTheme,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { createEventFromLink, getEventFromLink } from "../../state/commands";

interface AddEventModalProps {
  query: any;
  hash: string;
  container: string;
}

const AddEventModal: React.FC<AddEventModalProps> = (props) => {
  const theme = useTheme();

  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState({
    value: "",
    submitted: "",
  });
  const [matchedEvents, setMatchedEvents] = React.useState<Event[]>([]);

  const handleSubmit = (): void => {
    setUrl({
      value: "",
      submitted: url.value,
    });
  };
  return (
    <div>
      <Box
        style={{
          position: "fixed",
          right: theme.spacing(2),
          bottom: theme.spacing(2),
        }}
      >
        <IconButton
          aria-label="Add Link"
          color="secondary"
          size="small"
          onClick={() => {
            setOpen(true);
          }}
        >
          <AddCircleIcon fontSize="large" />
        </IconButton>
      </Box>
      <Dialog
        open={open}
        disablePortal={true}
        maxWidth="md"
        fullWidth={true}
        container={() => document.querySelector(`#${props.container}`)}
      >
        <DialogTitle>Add event from link</DialogTitle>
        <DialogContent style={{ width: "100%" }}>
          <DialogContentText>
            Submit a link to create an event
          </DialogContentText>
          <Input
            fullWidth
            type="url"
            value={url.value}
            placeholder="http://my.url/..."
            onChange={(e) => setUrl({ value: e.target.value, submitted: "" })}
          />
          <Box marginTop={2} marginBottom={2}>
            {url.submitted !== "" ? (
              <WithQueries
                queries={{
                  events: getEventsFromLinkQuery,
                }}
                params={{
                  events: {
                    url: url.submitted,
                  } as any,
                }}
                render={QR.fold(() => <Loader />, ErrorBox, ({ events }) => {
                  return (
                    <Grid container spacing={2}>
                      {events.events.map((e) => {
                        return (
                          <Grid key={e.id} item md={4}>
                            <EventCard event={e} />
                          </Grid>
                        );
                      })}
                    </Grid>
                  );
                })}
              />
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddEventModal;
