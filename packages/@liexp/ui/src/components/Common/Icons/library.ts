import { library } from "@fortawesome/fontawesome-svg-core";
import { fab, faGithub, faPaypal, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faEdit, faBarcode, faLink, faFilm, faMoneyBill1Wave, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons/faCircleDollarToSlot";
import { faFlask } from "@fortawesome/free-solid-svg-icons/faFlask";
import {faQuoteLeft} from '@fortawesome/free-solid-svg-icons/faQuoteLeft'
import { faSkullCrossbones } from "@fortawesome/free-solid-svg-icons/faSkullCrossbones";

library.add(
  ...([
    // brands
    fab,
    faGithub,
    faPaypal,
    faTelegram,
    // solid
    faCalendar,
    faFlask,
    faQuoteLeft,
    faCircleDollarToSlot,
    faSkullCrossbones,
    faEdit,
    faBarcode,
    faLink,
    faFilm,
    faMoneyBill1Wave
  ] as any[])
);
