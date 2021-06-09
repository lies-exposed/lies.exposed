import {
  faHouseDamage,
  faMoneyBillWave,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Events } from "@io/http";
import * as React from "react";

export interface EventMetadataListProps {
  metadata: Events.Event[];
}

export const EventMetadataList: React.FC<EventMetadataListProps> = (props) => {
  const protestIcon = <FontAwesomeIcon icon={faUserShield} color={"green"} />;
  const protests = props.metadata.filter(
    (m) => m.type === Events.Protest.PROTEST.value
  ).length;

  const fundIcon = <FontAwesomeIcon icon={faMoneyBillWave} />;
  const funds = props.metadata.filter(
    (m) => m.type === "ProjectTransaction"
  ).length;

  const impactIcon = <FontAwesomeIcon icon={faHouseDamage} color={"red"} />;
  const impacts = props.metadata.filter(
    (m) => m.type === "ProjectImpact"
  ).length;

  return (
    <>
      <div>
        Proteste {protestIcon} {protests}
      </div>
      <div>
        Fondi {fundIcon} {funds}
      </div>
      <div>
        Impatti {impactIcon} {impacts}
      </div>
    </>
  );
};
