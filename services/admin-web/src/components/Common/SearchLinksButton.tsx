import { parseISO } from "@liexp/shared/utils/date";
import { Link } from "@liexp/ui/components/Cards/LinkCard";
import { LinksList as LinkEntityList } from "@liexp/ui/components/lists/LinkList";
import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Input,
  InputLabel,
} from "@liexp/ui/components/mui";
import * as React from "react";
import { Button, useRefresh } from "react-admin";
import { apiProvider } from "@client/HTTPAPI";

interface SearchLinksButtonProps {
  query?: string;
}

export const SearchLinksButton: React.FC<SearchLinksButtonProps> = ({
  query,
}) => {
  const refresh = useRefresh();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState(query ?? "");
  const [p, setP] = React.useState(1);
  const [providers, setProviders] = React.useState([]);
  const [keywords, setKeywords] = React.useState("");
  const [links, setLinks] = React.useState([]);

  const selectedLinks = React.useMemo(
    () => links.filter((l) => l.selected),
    [links]
  );

  const handleSearch = (): void => {
    void apiProvider
      .create("/events/suggestions-by-provider", {
        data: {
          q,
          p,
          providers: ["the-guardian", "reuters"],
          keywords: keywords.split(",").map((k) => k.trim()),
        },
      })
      .then((r) => {
        setLinks(
          r.data.map((ll: any) => ({
            ...ll,
            selected: false,
            events: [],
            publishDate: parseISO(ll.publishDate),
          }))
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
    [links]
  );

  const handleCreate = React.useCallback((): void => {
    void apiProvider
      .create("/links/many", {
        data: selectedLinks,
      })
      .then(() => {
        refresh();
      });
  }, [selectedLinks]);

  React.useEffect(() => {
    void apiProvider
      .getList("/groups", {
        filter: {},
        pagination: { perPage: 30, page: 1 },
        sort: {
          field: "createdAt",
          order: "DESC",
        },
      })
      .then((r) => {
        setProviders(r.data);
      });
  }, []);

  return (
    <Box display="flex">
      <Button
        label="Search"
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
            <FormControl>
              <InputLabel htmlFor="q">Query</InputLabel>
              <Input
                id="q"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="p">Page</InputLabel>
              <Input
                id="p"
                type="number"
                value={p}
                onChange={(e) => setP(+e.target.value)}
              />
            </FormControl>
          </FormGroup>
          <FormControl>
            <InputLabel htmlFor="keywords">Keywords</InputLabel>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </FormControl>

          <FormGroup style={{ overflow: "scroll", maxHeight: 400 }}>
            {providers.map((p) => {
              return (
                <FormControlLabel
                  key={p.id}
                  control={<Checkbox />}
                  label={p.name}
                />
              );
            })}
          </FormGroup>

          <LinkEntityList links={links} onItemClick={handleLinkClick} />
        </DialogContent>
        <DialogActions>
          <Button label="Cancel" onClick={() => setOpen(false)} />
          <Button label="Search" onClick={() => handleSearch()} />
          {links.length > 0 ? (
            <Button label="Create" onClick={() => handleCreate()} />
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
