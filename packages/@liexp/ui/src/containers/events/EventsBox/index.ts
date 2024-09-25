import * as React from "react";

export type { EventsBoxProps } from "./EventsBox.js";

export const EventsBox = React.lazy(() => import("./EventsBox.js"));
