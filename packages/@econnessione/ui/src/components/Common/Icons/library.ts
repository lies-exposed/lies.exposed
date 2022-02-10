import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { fab, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faFlask } from "@fortawesome/free-solid-svg-icons/faFlask";
import { faSkullCrossbones } from "@fortawesome/free-solid-svg-icons/faSkullCrossbones";

library.add(...([fab, faGithub, faFlask, faSkullCrossbones] as any[]));

dom.watch();
