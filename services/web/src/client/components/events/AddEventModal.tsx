import { Event } from "@liexp/shared/io/http/Events";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  IconButton,
  Input,
  useTheme,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
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
  const [url, setUrl] = React.useState("");
  const [matchedEvents, setMatchedEvents] = React.useState<Event[]>([]);

  const handleSubmit = (): void => {
    void getEventFromLink({
      url,
    })().then((result) => {
      if (result._tag === "Right") {
        setMatchedEvents(result.right.data as any[]);
      }
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
            value={url}
            placeholder="http://my.url/..."
            onChange={(e) => setUrl(e.target.value)}
          />
          <Box>
            {matchedEvents.map((e) => {
              if (e.type === "Uncategorized") {
                return (
                  <Box key={e.id}>
                    <span>{e.payload.title}</span>
                  </Box>
                );
              }
              return <div key={e.id} />;
            })}
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
