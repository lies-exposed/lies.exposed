import { type CommandGroup } from "../command.type.js";
import { eventGet } from "./get.js";
import { eventList } from "./list.js";
import { bookCreate, bookEdit } from "./types/book.js";
import { deathCreate, deathEdit } from "./types/death.js";
import { documentaryCreate, documentaryEdit } from "./types/documentary.js";
import { patentCreate, patentEdit } from "./types/patent.js";
import { quoteCreate, quoteEdit } from "./types/quote.js";
import {
  scientificStudyCreate,
  scientificStudyEdit,
} from "./types/scientific-study.js";
import { transactionCreate, transactionEdit } from "./types/transaction.js";
import {
  uncategorizedCreate,
  uncategorizedEdit,
} from "./types/uncategorized.js";

export const eventGroup: CommandGroup = {
  description: "Manage fact-checked events",
  commands: {
    list: eventList,
    get: eventGet,
    uncategorized: {
      description: "Uncategorized events",
      commands: { create: uncategorizedCreate, edit: uncategorizedEdit },
    },
    death: {
      description: "Death events",
      commands: { create: deathCreate, edit: deathEdit },
    },
    quote: {
      description: "Quote events",
      commands: { create: quoteCreate, edit: quoteEdit },
    },
    transaction: {
      description: "Transaction events",
      commands: { create: transactionCreate, edit: transactionEdit },
    },
    "scientific-study": {
      description: "Scientific study events",
      commands: { create: scientificStudyCreate, edit: scientificStudyEdit },
    },
    book: {
      description: "Book events",
      commands: { create: bookCreate, edit: bookEdit },
    },
    patent: {
      description: "Patent events",
      commands: { create: patentCreate, edit: patentEdit },
    },
    documentary: {
      description: "Documentary events",
      commands: { create: documentaryCreate, edit: documentaryEdit },
    },
  },
};
