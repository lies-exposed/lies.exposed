import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType";
import { type SearchBookEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchBookEvent";
import { BookCard } from "@liexp/ui/lib/components/Cards/Events/BookCard.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { Container, Grid2, Stack } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";
import { useNavigate } from "react-router";

export const BooksPage: React.FC = () => {
  const navigate = useNavigate();

  const onBookClick = (book: SearchBookEvent) => {
    navigate(`/events/${book.id}`);
  };
  return (
    <QueriesRenderer
      queries={(Q) => ({
        books: Q.Event.Custom.SearchEvents.useQuery(undefined, {
          eventType: [BOOK.value],
          _start: "0",
          _end: "100",
        }),
      })}
      render={({
        books: {
          data: { events: books },
        },
      }) => {
        return (
          <Container>
            <Stack>
              <Grid2
                container
                columnSpacing={1}
                alignItems={"flex-start"}
                justifyContent={"flex-start"}
              >
                {books.map((book) => (
                  <Grid2 size={3}>
                    <BookCard
                      key={book.id}
                      event={book as SearchBookEvent}
                      onEventClick={onBookClick}
                      showRelations={false}
                    />
                  </Grid2>
                ))}
              </Grid2>
            </Stack>
          </Container>
        );
      }}
    />
  );
};
