import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import { defaultSites } from "@liexp/shared/lib/utils/defaultSites.js";
import * as React from "react";
import { Button, useDataProvider, useRefresh } from "react-admin";
import { type Link } from "../../Cards/LinkCard.js";
import { LinksList as LinkEntityList } from "../../lists/LinkList.js";
import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
} from "../../mui/index.js";

interface SearchLinksButtonProps {
  query?: string;
  date?: string;
}

export const SearchLinksButton: React.FC<SearchLinksButtonProps> = ({
  query,
  date: _date,
}) => {
  const refresh = useRefresh();
  const apiProvider = useDataProvider();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState(query ?? "");
  const [date, setDate] = React.useState(
    _date ? formatDate(parseISO(_date)) : new Date().toLocaleDateString(),
  );
  const [p, setP] = React.useState(1);
  const [providers, setProviders] = React.useState(Object.keys(defaultSites));
  const [keywords, setKeywords] = React.useState("");
  const [links, setLinks] = React.useState<any[]>([]);

  const selectedLinks = React.useMemo(
    () => links.filter((l) => l.selected),
    [links],
  );

  const handleSearch = (): void => {
    void apiProvider
      .create("/events/suggestions-by-provider", {
        data: {
          q,
          p,
          providers,
          keywords: keywords.split(",").map((k) => k.trim()),
          date: new Date(date).toISOString(),
        },
      })
      .then((r) => {
        setLinks(
          r.data.map((ll: any) => ({
            ...ll,
            selected: false,
            events: [],
            publishDate: ll.publishDate ? parseISO(ll.publishDate) : new Date(),
          })),
        );
      });
  };

  const handleLinkClick = React.useCallback(
    (l: Link): void => {
      const ll = links.map((ll) => {
        if (ll.id === l.id) {
          return {
            ...ll,
            selected: !l.selected,
          };
        }
        return ll;
      });
      setLinks(ll);
    },
    [links],
  );

  const handleCreate = React.useCallback((): void => {
    void apiProvider
      .create("/links/many", {
        data: selectedLinks,
      })
      .then(() => {
        setOpen(false);
        setLinks([]);
        refresh();
      });
  }, [selectedLinks]);

  return (
    <Box display="flex" style={{ marginRight: 10 }}>
      <Button
        label="Search"
        color="primary"
        variant="outlined"
        size="small"
        onClick={() => {
          setOpen(true);
        }}
      />
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        fullWidth
      >
        <DialogTitle>Search in providers</DialogTitle>
        <DialogContent
          style={{ display: "flex", flexDirection: "column", minHeight: 300 }}
        >
          <FormGroup row>
            <TextField
              label="Query"
              id="q"
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
              }}
            />
            <TextField
              label="Query"
              id="date"
              type="date"
              name="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
            />

            <TextField
              label="Page"
              id="p"
              type="number"
              value={p}
              onChange={(e) => {
                setP(+e.target.value);
              }}
            />

            <TextField
              id="keywords"
              label="keywords"
              value={keywords}
              onChange={(e) => {
                setKeywords(e.target.value);
              }}
            />
          </FormGroup>

          <FormGroup style={{ overflow: "scroll", maxHeight: 400 }}>
            {Object.keys(defaultSites).map((p) => {
              return (
                <FormControlLabel
                  key={p}
                  control={
                    <Checkbox
                      onChange={(_, c) => {
                        const keys = Object.keys(defaultSites);
                        if (c) {
                          setProviders(providers);
                        } else {
                          setProviders(keys.filter((k) => k !== p));
                        }
                      }}
                    />
                  }
                  label={p}
                />
              );
            })}
          </FormGroup>

          <LinkEntityList links={links} onItemClick={handleLinkClick} />
        </DialogContent>
        <DialogActions>
          <Button
            label="Cancel"
            onClick={() => {
              setOpen(false);
            }}
          />
          <Button
            label="Search"
            onClick={() => {
              handleSearch();
            }}
          />
          {links.length > 0 ? (
            <Button
              label="Create"
              onClick={() => {
                handleCreate();
              }}
            />
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
