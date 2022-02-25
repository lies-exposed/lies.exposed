import { library } from "@fortawesome/fontawesome-svg-core";
import { fab, faGithub, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { faEdit, faBarcode, faLink } from "@fortawesome/free-solid-svg-icons";
import { faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons/faCircleDollarToSlot";
import { faFlask } from "@fortawesome/free-solid-svg-icons/faFlask";
import { faSkullCrossbones } from "@fortawesome/free-solid-svg-icons/faSkullCrossbones";

library.add(
  ...([
    fab,
    faGithub,
    faPaypal,
    faFlask,
    faCircleDollarToSlot,
    faSkullCrossbones,
    faEdit,
    faBarcode,
    faLink,
  ] as any[])
);
