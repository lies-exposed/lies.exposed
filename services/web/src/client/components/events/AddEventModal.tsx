import { getSuggestions } from "@liexp/shared/helpers/event-suggestion";
import { http } from "@liexp/shared/io";
import { uuid } from "@liexp/shared/utils/uuid";
import CreateEventCard from "@liexp/ui/components/Cards/Events/CreateEventCard";
import EventCard from "@liexp/ui/components/Cards/Events/EventCard";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Input,
  Typography
} from "@liexp/ui/components/mui";
import { useTheme } from '@liexp/ui/theme';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { createEventSuggestion, getURLMetadata } from "../../state/commands";

interface EventSuggestionsListProps {
  suggestions: http.EventSuggestion.EventSuggestion[];
  selected?: http.EventSuggestion.EventSuggestion & { id: string };
  onSelect: (e: http.EventSuggestion.EventSuggestion & { id: string }) => void;
}

const EventSuggestionsList: React.FC<EventSuggestionsListProps> = ({
  suggestions,
  selected,
  onSelect,
}) => {
  const cachedSuggestions = React.useMemo(
    () => suggestions.map((s) => ({ ...s, id: uuid() })),
    [suggestions.length]
  );

  return (
    <Grid container spacing={2}>
      {cachedSuggestions.map((e, i) => {
        return (
          <Grid key={e.id} item md={4} sm={12}>
            <CreateEventCard
              event={e.event as any}
              showRelations={false}
              variant={e.id === selected?.id ? "outlined" : "elevation"}
              elevation={e.id === selected?.id ? 0 : 2}
              onClick={() => {
                onSelect(e);
              }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

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
    suggestions: [] as any[],
    events: [] as any[],
  });

  const [selectedSuggestion, setSelectedSuggestion] = React.useState<
    (http.EventSuggestion.EventSuggestion & { id: string }) | undefined
  >(undefined);

  const createEventSuggestionM = createEventSuggestion();
  const getURLMetadataM = getURLMetadata();

  const handleSubmit = (): void => {
    if (selectedSuggestion) {
      void createEventSuggestionM.mutate(selectedSuggestion, {
        onSuccess: () => {
          setOpen(false);
          setUrl({
            value: "",
            submitted: "",
            suggestions: [],
            events: [],
          });
        },
      });
    } else {
      void getURLMetadataM.mutate(
        {
          url: url.value,
        },
        {
          onSuccess: (data) => {
            setUrl({
              value: "",
              submitted: url.value,
              suggestions: getSuggestions(
                data.metadata,
                O.fromNullable(data.link),
                O.none
              ),
              events: [],
            });
          },
        }
      );
    }
  };
  const createDisabled = false;

  // console.log({ url, selectedSuggestion, createDisabled });

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
            onChange={(e) =>
              setUrl({
                value: e.target.value,
                submitted: "",
                suggestions: [],
                events: [],
              })
            }
          />
          <Box marginTop={2} marginBottom={2}>
            {url.submitted !== "" ? (
              <Grid container spacing={2}>
                {url.events.map((e) => {
                  return (
                    <Grid key={e.id} item md={4}>
                      <EventCard
                        event={e}
                        showRelations={false}
                        onEventClick={() => {}}
                      />
                    </Grid>
                  );
                })}
                <Grid item md={12}>
                  <Typography variant="h6">Or suggest new one</Typography>
                </Grid>
                <EventSuggestionsList
                  suggestions={url.suggestions}
                  selected={selectedSuggestion}
                  onSelect={setSelectedSuggestion}
                />
              </Grid>
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
          <Button
            color="primary"
            variant="outlined"
            disabled={createDisabled}
            onClick={handleSubmit}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddEventModal;
