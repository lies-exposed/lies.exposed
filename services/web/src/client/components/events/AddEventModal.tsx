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
import { createEventFromLink } from "../../state/commands";

interface AddEventModalProps {
  query: any;
  hash: string;
  container: string;
}

const AddEventModal: React.FC<AddEventModalProps> = (props) => {
  const theme = useTheme();

  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");

  const handleSubmit = (): void => {
    void createEventFromLink(
      {
        url,
      },
      {
        searchEventsQuery: {
          ...props.query,
          hash: props.hash,
        },
      }
    )();
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
        <DialogContent>
          <DialogContentText>
            Submit a link to create an event
          </DialogContentText>
          <Input
            type="url"
            value={url}
            placeholder="http://my.url/..."
            onChange={(e) => setUrl(e.target.value)}
          />
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
